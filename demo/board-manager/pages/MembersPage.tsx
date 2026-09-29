import { Anchor, List, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import {
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../packages/overlays/src/main/bindings/react';
import type { FormDialogData } from '../../../packages/overlays/src/main/dialogs/contract/form-data';
import { createPerson, db, deletePeople, fetchPeople, getBoard, getPerson, localDateTime, updatePerson } from '../db';
import type { PersonRow } from '../db';
import { confirmAndRun, submitForm } from '../flows';
import { PersonForm } from '../forms';
import { appIcons, countText, formatDate, formatDateTime, Navigator, useDb } from '../shared';

export { MembersPage };

// The "Members" module: the people (create, edit, delete), with their boards and roles. The memberships are changed on
// the page of a board; here, "Information" (also a double click) shows them with the person's next meetings.
function MembersPage(): ReactElement {
  const nav = useDataNavigatorController<PersonRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const boards = useDb((state) => state.boards);
  const people = useDb((state) => state.people);

  const columns = useMemo<readonly DataNavigatorComponent.Column<PersonRow>[]>(() => [
    { key: 'name', header: 'Name', width: 2.5, sortable: true, filter: textColumnFilter() },
    {
      key: 'organization',
      header: 'Organization',
      width: 2.5,
      sortable: true,
      hideable: true,
      filter: selectColumnFilter({
        options: [...new Set(people.map((person) => person.organization))].sort(),
        multiple: true,
      }),
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
  ], [boards, people]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<PersonRow>[]>(() => {
    const values = (data: FormDialogData) => ({
      name: data.string('name', ''),
      email: data.string('email', ''),
      organization: data.string('organization', ''),
    });

    const create = async () => {
      const saved = await submitForm(
        dialogs,
        { title: 'New member', content: (check) => <PersonForm check={check} />, buttons: { confirm: 'Create' } },
        (data) => createPerson(values(data)),
      );

      if (saved) {
        nav.reload();
        toasts.success('Member created');
      }
    };

    const edit = async (row: PersonRow) => {
      const saved = await submitForm(
        dialogs,
        {
          title: 'Edit member',
          content: (check) => <PersonForm check={check} person={getPerson(db.getState(), row.id)} />,
          buttons: { confirm: 'Save' },
        },
        (data) => updatePerson(row.id, values(data)),
      );

      if (saved) {
        nav.reload();
        toasts.success('Member saved');
      }
    };

    // The memberships go with the people; their agenda items keep no presenter.
    const remove = async (rows: readonly PersonRow[]) => {
      const [first] = rows;
      const boardCount = new Set(rows.flatMap((row) => row.boardIds)).size;
      const question = rows.length === 1 && first !== undefined
        ? `Delete "${first.name}"?`
        : `Delete the ${rows.length} selected members?`;
      const memberships = boardCount === 0 ? '' : `\nThis also removes them from ${boardCount} boards.`;
      const done = await confirmAndRun(
        dialogs,
        {
          title: rows.length === 1 ? 'Delete member' : 'Delete members',
          content: `${question}${memberships}\nThis cannot be undone.`,
          buttons: { confirm: 'Delete' },
        },
        () => deletePeople(rows.map((row) => row.id)),
      );

      if (done) {
        nav.reload();
        toasts.success(`${countText(rows.map((row) => row.name), 'members')} deleted`);
      }
    };

    return [
      { type: 'general', key: 'new', label: 'New member', icon: appIcons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'info',
        icon: appIcons.info,
        label: 'Information',
        show: 'both',
        default: true,
        onClick: (row) => {
          void dialogs.info({
            surface: 'drawer',
            icon: false,
            title: row.name,
            content: <PersonDetails person={row} />,
          });
        },
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: 'Edit',
        show: 'both',
        onClick: (row) => void edit(row),
      },
      { type: 'multiRow', key: 'delete', label: 'Delete', icon: appIcons.remove, onClick: (rows) => void remove(rows) },
    ];
  }, [nav, dialogs, toasts]);

  return (
    <Navigator
      controller={nav}
      title="Members"
      subtitle="Everyone who can be on a board. Add them to a board, or remove them from one, on the page of the board."
      density="compact"
      searchable
      reloadable
      source={fetchPeople}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}

// The content of the information drawer: contact, memberships, and the next meetings of the person's boards. It is
// not inside the router (the dialogs are rendered by the provider), so it has no links.
function PersonDetails({ person }: { person: PersonRow }): ReactElement {
  const state = db.getState();
  const memberships = state.memberships.filter((membership) => membership.personId === person.id);
  const boardIds = memberships.map((membership) => membership.boardId);
  const now = localDateTime(new Date());
  const next = state.meetings
    .filter((meeting) => boardIds.includes(meeting.boardId) && meeting.status === 'Planned' && meeting.start >= now)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 5);

  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Text size="sm">{person.organization}</Text>
        <Anchor href={`mailto:${person.email}`} size="sm">{person.email}</Anchor>
      </Stack>
      <Stack gap={4}>
        <Text fw={600} size="sm">Boards</Text>
        <List size="sm" spacing={4}>
          {memberships.map((membership) => (
            <List.Item key={membership.id}>
              {getBoard(state, membership.boardId)?.name}: {membership.role}, since {formatDate(membership.since)}
            </List.Item>
          ))}
        </List>
        {memberships.length === 0 && <Text size="sm" c="dimmed">Not on any board.</Text>}
      </Stack>
      <Stack gap={4}>
        <Text fw={600} size="sm">Next meetings</Text>
        <List size="sm" spacing={4}>
          {next.map((meeting) => (
            <List.Item key={meeting.id}>
              {formatDateTime(meeting.start)}: {meeting.title} ({getBoard(state, meeting.boardId)?.name})
            </List.Item>
          ))}
        </List>
        {next.length === 0 && <Text size="sm" c="dimmed">No planned meetings.</Text>}
      </Stack>
    </Stack>
  );
}
