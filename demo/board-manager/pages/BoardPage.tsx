import { Stack, Tabs } from '@mantine/core';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useParams } from 'react-router';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../packages/overlays/src/main/bindings/react';
import { addMember, changeRole, db, fetchBoardMembers, getBoard, removeMembers, ROLES } from '../db';
import type { MemberRow, Role } from '../db';
import { confirmAndRun, submitForm } from '../flows';
import { MemberForm } from '../forms';
import { appIcons, countText, formatDate, Navigator, PageHeader, useDb } from '../shared';
import { MeetingsTable } from './MeetingsTable';
import { NotFound } from './NotFound';

export { BoardPage };

// A meeting of a board opens below the board (the breadcrumb: Boards › board › meeting).
const meetingPath = (meeting: { id: string; boardId: string }) => `/boards/${meeting.boardId}/meetings/${meeting.id}`;

// One board: its meetings and its members, in two tabs.
function BoardPage(): ReactElement {
  const { boardId = '' } = useParams();
  const board = useDb((state) => getBoard(state, boardId));
  const [tab, setTab] = useState<string | null>('meetings');

  if (board === undefined) {
    return <NotFound what="board" />;
  }

  return (
    <Stack gap="md">
      <PageHeader title={board.name} subtitle={board.description} />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="meetings" leftSection={appIcons.meetings}>Meetings</Tabs.Tab>
          <Tabs.Tab value="members" leftSection={appIcons.members}>Members</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="meetings" pt="md">
          <MeetingsTable
            boardId={board.id}
            pathOf={meetingPath}
            title="Meetings"
            subtitle="Open a meeting for its agenda, minutes and documents."
          />
        </Tabs.Panel>
        <Tabs.Panel value="members" pt="md">
          <MembersTable boardId={board.id} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

const columns: readonly DataNavigatorComponent.Column<MemberRow>[] = [
  { key: 'name', header: 'Name', width: 2.5, sortable: true, filter: textColumnFilter() },
  {
    key: 'role',
    header: 'Role',
    width: 1.5,
    sortable: true,
    filter: selectColumnFilter({ options: ROLES, multiple: true }),
  },
  {
    key: 'organization',
    header: 'Organization',
    width: 2.5,
    sortable: true,
    hideable: true,
    filter: textColumnFilter(),
  },
  { key: 'email', header: 'Email', width: 3, hideable: true, hidden: true },
  {
    key: 'since',
    header: 'Member since',
    width: 1.5,
    sortable: true,
    hideable: true,
    filter: dateRangeColumnFilter(),
    render: (row) => formatDate(row.since),
  },
];

// The members of a board: add one (of the people who are not on it yet), change a role, remove.
function MembersTable({ boardId }: { boardId: string }): ReactElement {
  const nav = useDataNavigatorController<MemberRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const source = useMemo(() => fetchBoardMembers(boardId), [boardId]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<MemberRow>[]>(() => {
    const add = async () => {
      const state = db.getState();
      const members = new Set(
        state.memberships.filter((membership) => membership.boardId === boardId).map((membership) =>
          membership.personId
        ),
      );
      const people = state.people.filter((person) => !members.has(person.id));

      if (people.length === 0) {
        void dialogs.info({ title: 'Add member', content: 'Everyone is a member of this board already.' });
        return;
      }

      const saved = await submitForm(
        dialogs,
        {
          title: 'Add member',
          content: (check) => <MemberForm check={check} people={people} />,
          buttons: { confirm: 'Add' },
        },
        (data) => addMember(boardId, data.string('personId', ''), data.string('role', 'Member') as Role),
      );

      if (saved) {
        nav.reload();
        toasts.success('Member added');
      }
    };

    const edit = async (row: MemberRow) => {
      const saved = await submitForm(
        dialogs,
        {
          title: `Role of ${row.name}`,
          content: (check) => <MemberForm check={check} role={row.role} />,
          buttons: { confirm: 'Save' },
        },
        (data) => changeRole(row.id, data.string('role', 'Member') as Role),
      );

      if (saved) {
        nav.reload();
        toasts.success('Role changed');
      }
    };

    const remove = async (rows: readonly MemberRow[]) => {
      const [first] = rows;
      const board = getBoard(db.getState(), boardId)?.name ?? 'the board';
      const done = await confirmAndRun(
        dialogs,
        {
          title: rows.length === 1 ? 'Remove member' : 'Remove members',
          content: rows.length === 1 && first !== undefined
            ? `Remove ${first.name} from ${board}?`
            : `Remove the ${rows.length} selected members from ${board}?`,
          buttons: { confirm: 'Remove' },
        },
        () => removeMembers(rows.map((row) => row.id)),
      );

      if (done) {
        nav.reload();
        toasts.success(`${countText(rows.map((row) => row.name), 'members')} removed`);
      }
    };

    return [
      { type: 'general', key: 'add', label: 'Add member', icon: appIcons.add, onClick: () => void add() },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: 'Change role',
        show: 'both',
        default: true,
        onClick: (row) => void edit(row),
      },
      { type: 'multiRow', key: 'remove', label: 'Remove', icon: appIcons.remove, onClick: (rows) => void remove(rows) },
    ];
  }, [nav, dialogs, toasts, boardId]);

  return (
    <Navigator
      controller={nav}
      title="Members"
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25]}
    />
  );
}
