import { Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { Fragment, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataTableController,
} from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { ROLES } from '../../../domain';
import {
  addMember,
  changeRole,
  db,
  fetchBoardMembers,
  getBoard,
  getBoardRow,
  removeMembers,
} from '../../../infra/in-memory';
import type { MemberRow } from '../../../infra/in-memory';
import { MemberForm } from '../../../shared/forms';
import { confirmAndRun } from '../../../shared/lib/flows';
import { useTranslate } from '../../../shared/lib/i18n';
import type { Translate } from '../../../shared/lib/i18n';
import {
  appIcons,
  DataTable,
  formatDate,
  formatDateTime,
  organizationFilter,
  PAGE_SIZE_OPTIONS,
  PageHeader,
  personFilter,
  useDb,
} from '../../../shared/shared';
import { NotFound } from '../../../shared/ui/NotFound';
import { MeetingsTable } from '../../meetings/components/MeetingsTable';
import { deleteBoardsFlow, editBoard } from '../components/boardFlows';

export { BoardPage };

// A meeting of a board opens below the board (the breadcrumb: Boards › board › meeting).
const meetingPath = (meeting: { id: string; boardId: string }) => `/boards/${meeting.boardId}/meetings/${meeting.id}`;

// One board: its base information ("Overview"), its meetings and its members, in three tabs.
function BoardPage(): ReactElement {
  const t = useTranslate();
  const { boardId = '' } = useParams();
  const board = useDb((state) => getBoard(state, boardId));
  const [tab, setTab] = useState<string | null>('overview');

  if (board === undefined) {
    return <NotFound what="board" />;
  }

  return (
    <Stack gap="md">
      <PageHeader title={board.name} subtitle={board.description} />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">{t('common.overview')}</Tabs.Tab>
          <Tabs.Tab value="meetings" leftSection={appIcons.meetings}>{t('modules.meetings')}</Tabs.Tab>
          <Tabs.Tab value="members" leftSection={appIcons.members}>{t('modules.members')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <BoardOverview boardId={board.id} />
        </Tabs.Panel>
        <Tabs.Panel value="meetings" pt="md">
          <MeetingsTable
            boardId={board.id}
            pathOf={meetingPath}
            title={t('modules.meetings')}
            subtitle={t('boards.meetingsSubtitle')}
          />
        </Tabs.Panel>
        <Tabs.Panel value="members" pt="md">
          <MembersTable boardId={board.id} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The base information as labels and values, with "Edit" (the board form in a dialog, like "Edit" in the list) and
// "Delete" (then back to the list).
function BoardOverview({ boardId }: { boardId: string }): ReactElement | null {
  const t = useTranslate();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  // a new row object on every call: compared shallowly, else the store would see a change at every read
  const board = useDb(useShallow((state) => getBoardRow(state, boardId)));

  if (board === undefined) {
    return null;
  }

  const fields: readonly (readonly [string, string])[] = [
    [t('boards.overview.name'), board.name],
    [t('boards.columns.description'), board.description],
    [t('boards.columns.chair'), board.chair],
    [t('boards.columns.members'), String(board.members)],
    [t('boards.columns.meetings'), String(board.meetings)],
    [t('boards.columns.nextMeeting'), board.nextMeeting === '' ? '' : formatDateTime(board.nextMeeting)],
  ];

  const remove = async () => {
    if (await deleteBoardsFlow(dialogs, toasts, [board])) {
      navigate('/boards');
    }
  };

  return (
    // No frame, like the tables of the other tabs: the title and the buttons in one line, like their toolbars.
    <Stack gap="md" maw={820}>
      <Group justify="space-between" className="board-manager__panel-header">
        <Text fw={700} size="lg">{t('common.overview')}</Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            leftSection={appIcons.edit}
            onClick={() => void editBoard(dialogs, toasts, board.id)}
          >
            {t('common.edit')}
          </Button>
          <Button
            size="xs"
            variant="default"
            color="danger"
            leftSection={appIcons.remove}
            onClick={() => void remove()}
          >
            {t('common.delete')}
          </Button>
        </Group>
      </Group>
      <SimpleGrid cols={2} spacing="lg" verticalSpacing="xs" style={{ gridTemplateColumns: 'max-content 1fr' }}>
        {fields.map(([label, value]) => (
          <Fragment key={label}>
            <Text size="sm" c="dimmed">{label}</Text>
            <Text size="sm">{value === '' ? '–' : value}</Text>
          </Fragment>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// The columns, with their headers in the current language.
const columnsOf = (t: Translate): readonly DataTableComponent.Column<MemberRow>[] => [
  { key: 'name', header: t('boards.columns.person'), width: 2.5, sortable: true, filter: personFilter },
  {
    key: 'role',
    header: t('boards.columns.role'),
    width: 1.5,
    sortable: true,
    filter: selectColumnFilter({
      options: ROLES.map((value) => ({ value, label: t(`roles.${value}`) })),
      multiple: true,
    }),
    render: (row) => t(`roles.${row.role}`),
  },
  {
    key: 'organization',
    header: t('boards.columns.organization'),
    width: 2.5,
    sortable: true,
    hideable: true,
    filter: organizationFilter,
  },
  { key: 'email', header: t('boards.columns.email'), width: 3, hideable: true, hidden: true },
  {
    key: 'since',
    header: t('boards.columns.memberSince'),
    width: 1.5,
    sortable: true,
    hideable: true,
    filter: dateRangeColumnFilter(),
    render: (row) => formatDate(row.since),
  },
];

// The members of a board: add one (of the people who are not on it yet), change a role, remove.
function MembersTable({ boardId }: { boardId: string }): ReactElement {
  const t = useTranslate();
  const columns = useMemo(() => columnsOf(t), [t]);
  const nav = useDataTableController<MemberRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const source = useMemo(() => fetchBoardMembers(boardId), [boardId]);

  const actions = useMemo<readonly DataTableComponent.Action<MemberRow>[]>(() => {
    const add = async () => {
      const state = db.getState();
      const members = new Set(
        state.memberships.filter((membership) => membership.boardId === boardId).map((membership) =>
          membership.personId
        ),
      );
      const people = state.people.filter((person) => !members.has(person.id));

      if (people.length === 0) {
        void dialogs.info({ title: t('boards.addMember'), content: t('boards.allAreMembers') });
        return;
      }

      const saved = !(await dialogs.form({
        title: t('boards.addMember'),
        content: (
          <MemberForm
            people={people}
            save={(values) => addMember(boardId, values.personId ?? '', values.role)}
          />
        ),
        buttons: { confirm: t('common.add') },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success(t('boards.memberAdded'));
      }
    };

    const edit = async (row: MemberRow) => {
      const saved = !(await dialogs.form({
        title: t('boards.roleOf', { name: row.name }),
        content: <MemberForm role={row.role} save={(values) => changeRole(row.id, values.role)} />,
        buttons: { confirm: t('common.save') },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success(t('boards.roleChanged'));
      }
    };

    const remove = async (rows: readonly MemberRow[]) => {
      const [first] = rows;
      const board = getBoard(db.getState(), boardId)?.name ?? '';
      const done = await confirmAndRun(
        dialogs,
        {
          title: t('boards.removeTitle', { count: rows.length }),
          content: t('boards.removeContent', { count: rows.length, name: first?.name ?? '', board }),
          buttons: { confirm: t('common.remove') },
        },
        () => removeMembers(rows.map((row) => row.id)),
      );

      if (done) {
        nav.reload();
        toasts.success(t('boards.removed', { count: rows.length, name: first?.name ?? '' }));
      }
    };

    return [
      {
        type: 'general',
        key: 'add',
        label: t('boards.addMember'),
        icon: appIcons.add,
        variant: 'primary',
        onClick: () => void add(),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: t('boards.changeRole'),
        show: 'both',
        default: true,
        onClick: (row) => void edit(row),
      },
      {
        type: 'multiRow',
        key: 'remove',
        label: t('common.remove'),
        icon: appIcons.remove,
        onClick: (rows) => void remove(rows),
      },
    ];
  }, [t, nav, dialogs, toasts, boardId]);

  return (
    <DataTable
      controller={nav}
      title={t('modules.members')}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
    />
  );
}
