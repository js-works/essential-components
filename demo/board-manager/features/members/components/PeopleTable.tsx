import { Anchor } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { selectColumnFilter, useDataNavigatorController } from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
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
import { appIcons, countText, Navigator, organizationFilter, personFilter, useDb } from '../../../shared/shared';

export { deletePeopleFlow, editPerson, memberPath, PeopleTable };

type Toasts = ReturnType<typeof useToast>;

// A member's page.
const memberPath = (person: { id: string }) => `/members/${person.id}`;

// The values of the person form.
// "Edit" of a person (in the people tables and on the member's overview): the person form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
async function editPerson(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: 'Edit member',
    content: <PersonForm person={getPerson(db.getState(), id)} save={(values) => updatePerson(id, values)} />,
    buttons: { confirm: 'Save' },
  })).canceled;

  if (saved) {
    toasts.success('Member saved');
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
  const question = people.length === 1 && first !== undefined
    ? `Delete "${first.name}"?`
    : `Delete the ${people.length} selected members?`;
  const memberships = boardCount === 0 ? '' : `\nThis also removes them from ${boardCount} boards.`;
  const done = await confirmAndRun(
    dialogs,
    {
      title: people.length === 1 ? 'Delete member' : 'Delete members',
      content: `${question}${memberships}\nThis cannot be undone.`,
      buttons: { confirm: 'Delete' },
    },
    () => deletePeople(people.map((person) => person.id)),
  );

  if (done) {
    toasts.success(`${countText(people.map((person) => person.name), 'members')} deleted`);
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
  const nav = useDataNavigatorController<PersonRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const boards = useDb((state) => state.boards);
  const source = useMemo(() => fetchPeople(organizationId), [organizationId]);

  const columns = useMemo<readonly DataNavigatorComponent.Column<PersonRow>[]>(() => [
    {
      key: 'name',
      header: 'Person',
      width: 2.5,
      sortable: true,
      filter: personFilter,
      render: (row) => <Anchor component={Link} to={memberPath(row)} size="sm">{row.name}</Anchor>,
    },
    {
      key: 'organization',
      header: 'Organization',
      width: 2.5,
      sortable: true,
      hideable: true,
      hidden: organizationId !== undefined,
      filter: organizationFilter,
    },
    { key: 'email', header: 'Email', width: 3, hideable: true, hidden: true },
    {
      key: 'boards',
      header: 'Boards',
      width: 4,
      hideable: true,
      wrap: true,
      filter: selectColumnFilter({ options: boards.map((board) => board.name), multiple: true }),
    },
    { key: 'roles', header: 'Roles', width: 2, hideable: true },
  ], [boards, organizationId]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<PersonRow>[]>(() => {
    const create = async () => {
      const saved = !(await dialogs.form({
        title: 'New member',
        content: <PersonForm organizationId={organizationId} save={createPerson} />,
        buttons: { confirm: 'Create' },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success('Member created');
      }
    };

    return [
      { type: 'general', key: 'new', label: 'New member', icon: appIcons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: 'Open',
        show: 'column',
        default: true,
        onClick: (row) => navigate(memberPath(row)),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: 'Edit',
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
        label: 'Delete',
        icon: appIcons.remove,
        onClick: async (rows) => {
          if (await deletePeopleFlow(dialogs, toasts, rows)) {
            nav.reload();
          }
        },
      },
    ];
  }, [nav, dialogs, toasts, navigate, organizationId]);

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
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
