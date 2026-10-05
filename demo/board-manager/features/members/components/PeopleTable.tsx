import { Anchor } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { selectColumnFilter, useDataNavigatorController } from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import type { Role } from '../../../domain';
import {
  boardIdsOf,
  createPerson,
  db,
  deletePeople,
  fetchPeople,
  getPerson,
  updatePerson,
} from '../../../infra/in-memory';
import type { PersonRow } from '../../../infra/in-memory';
import { PersonForm } from '../../../shared/forms';
import { confirmAndRun } from '../../../shared/lib/flows';
import type { Dialogs } from '../../../shared/lib/flows';
import { translate, useTranslate } from '../../../shared/lib/i18n';
import {
  appIcons,
  Navigator,
  organizationFilter,
  PAGE_SIZE_OPTIONS,
  personFilter,
  useDb,
} from '../../../shared/shared';

export { deletePeopleFlow, editPerson, memberPath, PeopleTable };

type Toasts = ReturnType<typeof useToast>;

// A member's page.
const memberPath = (person: { id: string }) => `/members/${person.id}`;

// The values of the person form.
// "Edit" of a person (in the people tables and on the member's overview): the person form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
async function editPerson(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: translate('members.editTitle'),
    content: <PersonForm person={getPerson(db.getState(), id)} save={(values) => updatePerson(id, values)} />,
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    toasts.success(translate('members.saved'));
  }

  return saved;
}

// "Delete" of people (in the people tables and on a member's overview): a critical confirmation that says from how many
// boards they are removed (the memberships go with them; their agenda items keep no presenter), then a toast. Resolves
// `true` when deleted.
async function deletePeopleFlow(
  dialogs: Dialogs,
  toasts: Toasts,
  people: readonly { id: string; name: string }[],
): Promise<boolean> {
  const [first] = people;
  const state = db.getState();
  const boardCount = new Set(people.flatMap((person) => boardIdsOf(state, person.id))).size;
  const question = translate('members.deleteQuestion', { count: people.length, name: first?.name ?? '' });
  const memberships = boardCount === 0 ? '' : `\n${translate('members.alsoRemoved', { count: boardCount })}`;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('members.deleteTitle', { count: people.length }),
      content: `${question}${memberships}\n${translate('common.cannotBeUndone')}`,
      buttons: { confirm: translate('common.delete') },
    },
    () => deletePeople(people.map((person) => person.id)),
  );

  if (done) {
    toasts.success(translate('members.deleted', { count: people.length, name: first?.name ?? '' }));
  }

  return done;
}

// The people (create, edit, delete), with their boards and roles: all of them (the "Members" module), or those of one
// organization (`organizationId`, on its page: a new person belongs to it, and the organization column is hidden). A
// person opens on their own page ("Open", also a double click, or the name). The memberships are changed on the page
// of a board.
function PeopleTable(
  { organizationId, title, subtitle }: { organizationId?: string; title: string; subtitle: string },
): ReactElement {
  const t = useTranslate();
  const nav = useDataNavigatorController<PersonRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const boards = useDb((state) => state.boards);
  const source = useMemo(() => fetchPeople(organizationId), [organizationId]);

  const columns = useMemo<readonly DataNavigatorComponent.Column<PersonRow>[]>(() => [
    {
      key: 'name',
      header: t('members.columns.person'),
      width: 2.5,
      sortable: true,
      filter: personFilter,
      render: (row) => <Anchor component={Link} to={memberPath(row)} size="sm">{row.name}</Anchor>,
    },
    {
      key: 'organization',
      header: t('members.columns.organization'),
      width: 2.5,
      sortable: true,
      hideable: true,
      hidden: organizationId !== undefined,
      filter: organizationFilter,
    },
    { key: 'email', header: t('members.columns.email'), width: 3, hideable: true, hidden: true },
    {
      key: 'boards',
      header: t('members.columns.boards'),
      width: 4,
      hideable: true,
      wrap: true,
      filter: selectColumnFilter({ options: boards.map((board) => board.name), multiple: true }),
    },
    {
      key: 'roles',
      header: t('members.columns.roles'),
      width: 2,
      hideable: true,
      // The stored roles ("Chair, Member") in the current language.
      render: (row) =>
        row.roles === '' ? '' : row.roles.split(', ').map((role) => t(`roles.${role as Role}`)).join(', '),
    },
  ], [t, boards, organizationId]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<PersonRow>[]>(() => {
    const create = async () => {
      const saved = !(await dialogs.form({
        title: t('members.new'),
        content: <PersonForm organizationId={organizationId} save={createPerson} />,
        buttons: { confirm: t('common.create') },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success(t('members.created'));
      }
    };

    return [
      { type: 'general', key: 'new', label: t('members.new'), icon: appIcons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: t('common.open'),
        show: 'column',
        default: true,
        onClick: (row) => navigate(memberPath(row)),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: t('common.edit'),
        show: 'both',
        onClick: async (row) => {
          if (await editPerson(dialogs, toasts, row.id)) {
            nav.reload();
          }
        },
      },
      {
        type: 'multiRow',
        key: 'delete',
        label: t('common.delete'),
        icon: appIcons.remove,
        onClick: async (rows) => {
          if (await deletePeopleFlow(dialogs, toasts, rows)) {
            nav.reload();
          }
        },
      },
    ];
  }, [t, nav, dialogs, toasts, navigate, organizationId]);

  return (
    <Navigator
      controller={nav}
      title={title}
      subtitle={subtitle}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
