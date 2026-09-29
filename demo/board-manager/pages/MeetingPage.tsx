import { Button, List, Paper, Stack, Tabs, Text, Title } from '@mantine/core';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useParams } from 'react-router';
import { icons } from '../../../packages/data-navigator/demo/icons';
import {
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../packages/data-navigator/src/react';
import { createDemoI18n } from '../../../packages/file-upload/demo/i18n';
import type { FileUpload } from '../../../packages/file-upload/src';
import { createFileUploadComponent } from '../../../packages/file-upload/src/react';
import { useDialogs, useToast } from '../../../packages/overlays/src/main/bindings/react';
import type { FormDialogData } from '../../../packages/overlays/src/main/dialogs/contract/form-data';
import {
  approveMinutes,
  commitDocuments,
  createAgendaItem,
  db,
  deleteAgendaItems,
  deleteDocuments,
  discardDocuments,
  fetchAgenda,
  fetchDocuments,
  getBoard,
  getMeeting,
  getPerson,
  reorderAgenda,
  setMeetingStatus,
  updateAgendaItem,
  uploadDocument,
} from '../db';
import type { AgendaItem, AgendaRow, Db, Meeting, MeetingDocument, Person } from '../db';
import { confirmAndRun, submitForm } from '../flows';
import type { Dialogs } from '../flows';
import { AgendaItemForm, MinutesForm } from '../forms';
import { appIcons, countText, formatDateTime, formatSize, Navigator, PageHeader, useDb } from '../shared';
import { MinutesBadge, StatusBadge } from './MeetingsTable';
import { NotFound } from './NotFound';

export { MeetingPage };

const uploadI18n = createDemoI18n();

const DocumentUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
});

// The members of a board, as people (the presenters of its agenda items).
function membersOf(state: Pick<Db, 'memberships' | 'people'>, boardId: string): Person[] {
  return state.memberships
    .filter((membership) => membership.boardId === boardId)
    .flatMap((membership) => getPerson(state, membership.personId) ?? []);
}

// The confirmations of the meeting's state (not critical: nothing is lost), in a scope: the dialog stays open while
// the change is saved.
async function confirmChange(
  dialogs: Dialogs,
  config: Parameters<Dialogs['confirm']>[0],
  run: () => Promise<void>,
): Promise<boolean> {
  const scope = dialogs.open();

  try {
    const result = await scope.confirm(config);

    if (result.canceled) {
      return false;
    }

    await run();

    return true;
  } finally {
    scope.dispose();
  }
}

// One meeting: its agenda (with the minutes per item), the minutes as one document, and the documents of the meeting.
// It is below its board (`/boards/:boardId/meetings/:meetingId`) or below "Meetings" (`/meetings/:meetingId`).
function MeetingPage(): ReactElement {
  const { meetingId = '' } = useParams();
  const meeting = useDb((state) => getMeeting(state, meetingId));
  const boardName = useDb((state) => getBoard(state, meeting?.boardId)?.name ?? '');
  const agendaItems = useDb((state) => state.agendaItems);
  const dialogs = useDialogs();
  const toasts = useToast();
  const [tab, setTab] = useState<string | null>('agenda');
  const duration = useMemo(
    () => agendaItems.filter((item) => item.meetingId === meetingId).reduce((sum, item) => sum + item.duration, 0),
    [agendaItems, meetingId],
  );

  if (meeting === undefined) {
    return <NotFound what="meeting" />;
  }

  const approve = async () => {
    const done = await confirmChange(
      dialogs,
      {
        title: 'Approve minutes',
        content: `Approve the minutes of "${meeting.title}"?\nThey are final then.`,
        buttons: { confirm: 'Approve' },
      },
      () => approveMinutes(meeting.id),
    );

    if (done) {
      toasts.success('Minutes approved');
    }
  };

  const markHeld = async () => {
    const done = await confirmChange(
      dialogs,
      {
        title: 'Mark as held',
        content: `Mark "${meeting.title}" as held?\nThen its minutes can be approved.`,
        buttons: { confirm: 'Mark as held' },
      },
      () => setMeetingStatus(meeting.id, 'Held'),
    );

    if (done) {
      toasts.success(`"${meeting.title}" held`);
    }
  };

  const approveButton = meeting.status === 'Held' && !meeting.minutesApproved && (
    <Button size="xs" onClick={() => void approve()}>Approve minutes</Button>
  );

  return (
    <Stack gap="md">
      <PageHeader
        title={meeting.title}
        subtitle={`${boardName} · ${formatDateTime(meeting.start)} · ${meeting.location} · ${duration} min`}
        badges={
          <>
            <StatusBadge status={meeting.status} />
            <MinutesBadge meeting={meeting} />
          </>
        }
        actions={
          <>
            {meeting.status === 'Planned' && (
              <Button size="xs" variant="default" onClick={() => void markHeld()}>Mark as held</Button>
            )}
            {approveButton}
          </>
        }
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="agenda">Agenda</Tabs.Tab>
          <Tabs.Tab value="minutes" leftSection={appIcons.minutes}>Minutes</Tabs.Tab>
          <Tabs.Tab value="documents">Documents</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="agenda" pt="md">
          <AgendaTable meeting={meeting} />
        </Tabs.Panel>
        <Tabs.Panel value="minutes" pt="md">
          <MinutesView meeting={meeting} agendaItems={agendaItems} boardName={boardName} />
        </Tabs.Panel>
        <Tabs.Panel value="documents" pt="md">
          <DocumentsTable meeting={meeting} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The minutes, the decision and the description of an item, in its detail row.
function AgendaDetail({ row }: { row: AgendaRow }): ReactElement {
  return (
    <Stack gap={6} py={4}>
      {row.description !== '' && <Text size="sm" c="dimmed">{row.description}</Text>}
      {row.minutes !== '' && <Text size="sm">{row.minutes}</Text>}
      {row.decision !== '' && <Text size="sm" fw={600}>Decision: {row.decision}</Text>}
      {row.minutes === '' && row.decision === '' && <Text size="sm" c="dimmed">No minutes recorded yet.</Text>}
    </Stack>
  );
}

// The agenda: in the order of its items (no sorting: the rows are moved with their handle, and every move is saved).
// Each item has its minutes and decision ("Minutes", also a double click), shown in its detail row.
function AgendaTable({ meeting }: { meeting: Meeting }): ReactElement {
  const nav = useDataNavigatorController<AgendaRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const memberships = useDb((state) => state.memberships);
  const people = useDb((state) => state.people);
  const source = useMemo(() => fetchAgenda(meeting.id), [meeting.id]);
  const presenters = useMemo(
    () => membersOf({ memberships, people }, meeting.boardId).map((person) => person.name),
    [memberships, people, meeting.boardId],
  );

  const columns = useMemo<readonly DataNavigatorComponent.Column<AgendaRow>[]>(() => [
    { key: 'position', header: '#', width: 0.5, align: 'end' },
    { key: 'title', header: 'Item', width: 4, wrap: true },
    {
      key: 'presenter',
      header: 'Presenter',
      width: 2,
      hideable: true,
      filter: selectColumnFilter({ options: presenters, multiple: true }),
    },
    { key: 'duration', header: 'Duration', width: 1, hideable: true, align: 'end', render: (row) => `${row.duration} min` },
    {
      key: 'recorded',
      header: 'Minutes',
      width: 1,
      hideable: true,
      align: 'center',
      filter: selectColumnFilter({ options: ['Yes', 'No'] }),
    },
  ], [presenters]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<AgendaRow>[]>(() => {
    const itemOf = (row: AgendaRow): AgendaItem | undefined =>
      db.getState().agendaItems.find((item) => item.id === row.id);
    const members = () => membersOf(db.getState(), meeting.boardId);
    const values = (data: FormDialogData) => ({
      title: data.string('title', ''),
      presenterId: data.string('presenterId', ''),
      duration: data.integer('duration', 15),
      description: data.string('description', ''),
    });

    const create = async () => {
      const saved = await submitForm(
        dialogs,
        { title: 'New agenda item', content: <AgendaItemForm members={members()} />, buttons: { confirm: 'Add' } },
        (data) => createAgendaItem(meeting.id, values(data)),
      );

      if (saved) {
        nav.reload();
        toasts.success('Agenda item added');
      }
    };

    const edit = async (row: AgendaRow) => {
      const saved = await submitForm(
        dialogs,
        {
          title: 'Edit agenda item',
          content: <AgendaItemForm item={itemOf(row)} members={members()} />,
          buttons: { confirm: 'Save' },
        },
        (data) => updateAgendaItem(row.id, values(data)),
      );

      if (saved) {
        nav.reload();
        toasts.success('Agenda item saved');
      }
    };

    // In a drawer: there is room for longer minutes.
    const recordMinutes = async (row: AgendaRow) => {
      const item = itemOf(row);

      if (item === undefined) {
        return;
      }

      const saved = await submitForm(
        dialogs,
        {
          surface: 'drawer',
          title: `${row.position}. ${row.title}`,
          subtitle: 'Minutes',
          content: <MinutesForm item={item} />,
          buttons: { confirm: 'Save' },
        },
        (data) =>
          updateAgendaItem(row.id, { minutes: data.string('minutes', ''), decision: data.string('decision', '') }),
      );

      if (saved) {
        nav.reload();
        toasts.success('Minutes saved');
      }
    };

    const remove = async (rows: readonly AgendaRow[]) => {
      const [first] = rows;
      const done = await confirmAndRun(
        dialogs,
        {
          title: rows.length === 1 ? 'Delete agenda item' : 'Delete agenda items',
          content: `${
            rows.length === 1 && first !== undefined
              ? `Delete "${first.title}"`
              : `Delete the ${rows.length} selected agenda items`
          }, with their minutes?\nThis cannot be undone.`,
          buttons: { confirm: 'Delete' },
        },
        () => deleteAgendaItems(rows.map((row) => row.id)),
      );

      if (done) {
        nav.reload();
        toasts.success(`${countText(rows.map((row) => row.title), 'agenda items')} deleted`);
      }
    };

    return [
      { type: 'general', key: 'new', label: 'Add item', icon: icons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'minutes',
        icon: appIcons.minutes,
        tip: 'Minutes',
        show: 'both',
        default: true,
        onClick: (row) => void recordMinutes(row),
      },
      { type: 'singleRow', key: 'edit', icon: icons.edit, tip: 'Edit', show: 'both', onClick: (row) => void edit(row) },
      { type: 'multiRow', key: 'delete', label: 'Delete', icon: icons.remove, onClick: (rows) => void remove(rows) },
    ];
  }, [nav, dialogs, toasts, meeting.id, meeting.boardId]);

  // The positions change with a move: the table is loaded again.
  const reorder = async (move: DataNavigatorComponent.Move<AgendaRow>) => {
    await reorderAgenda(move);
    nav.reload();
  };

  return (
    <Navigator
      controller={nav}
      title="Agenda"
      subtitle="Move an item with its handle. Double click an item for its minutes."
      density="compact"
      searchable
      source={source}
      reorder={reorder}
      rowKey="id"
      columns={columns}
      actions={actions}
      renderDetail={(row) => <AgendaDetail row={row} />}
      pageSize={50}
    />
  );
}

// The minutes as one document: every item with its minutes and decision, in the order of the agenda.
function MinutesView(
  { meeting, agendaItems, boardName }: { meeting: Meeting; agendaItems: readonly AgendaItem[]; boardName: string },
): ReactElement {
  const items = useMemo(
    () => agendaItems.filter((item) => item.meetingId === meeting.id).sort((a, b) => a.position - b.position),
    [agendaItems, meeting.id],
  );
  const memberships = useDb((state) => state.memberships);
  const people = useDb((state) => state.people);
  const attendees = useMemo(
    () => membersOf({ memberships, people }, meeting.boardId).map((person) => person.name),
    [memberships, people, meeting.boardId],
  );

  if (meeting.status !== 'Held') {
    return (
      <Text c="dimmed" size="sm">
        {meeting.status === 'Cancelled'
          ? 'The meeting was cancelled: there are no minutes.'
          : 'The minutes are recorded per agenda item ("Minutes" in the agenda), during or after the meeting.'}
      </Text>
    );
  }

  return (
    <Paper withBorder p="lg" radius="sm" maw={820}>
      <Stack gap="md">
        <Stack gap={2}>
          <Title order={3} size="h4">Minutes of the {meeting.title}</Title>
          <Text size="sm" c="dimmed">{boardName} · {formatDateTime(meeting.start)} · {meeting.location}</Text>
          <Text size="sm" c="dimmed">Members: {attendees.join(', ')}</Text>
          <Text size="sm" c={meeting.minutesApproved ? 'green' : 'orange'}>
            {meeting.minutesApproved ? 'Approved.' : 'Draft: not approved yet.'}
          </Text>
        </Stack>
        <List type="ordered" spacing="md">
          {items.map((item) => (
            <List.Item key={item.id}>
              <Text fw={600} size="sm">{item.title}</Text>
              <Text size="sm">{item.minutes === '' ? '(No minutes.)' : item.minutes}</Text>
              {item.decision !== '' && <Text size="sm" fs="italic">Decision: {item.decision}</Text>}
            </List.Item>
          ))}
        </List>
      </Stack>
    </Paper>
  );
}

const documentColumns: readonly DataNavigatorComponent.Column<MeetingDocument>[] = [
  { key: 'name', header: 'Document', width: 3.5, sortable: true, filter: textColumnFilter() },
  {
    key: 'type',
    header: 'Type',
    width: 1,
    sortable: true,
    hideable: true,
    filter: selectColumnFilter({ options: ['PDF', 'DOCX', 'PPTX', 'XLSX'], multiple: true }),
  },
  { key: 'size', header: 'Size', width: 1.2, sortable: true, hideable: true, align: 'end', render: (row) => formatSize(row.size) },
  { key: 'user', header: 'Uploaded by', width: 2, sortable: true, hideable: true },
  {
    key: 'uploaded',
    header: 'Uploaded',
    width: 2,
    sortable: true,
    hideable: true,
    render: (row) => formatDateTime(row.uploaded),
  },
];

// The documents of the meeting (invitation, board pack, presentations, minutes). "Upload" opens a drawer with the file
// upload: every file is uploaded (staged) at once, "Apply" adds them, "Cancel" discards them.
function DocumentsTable({ meeting }: { meeting: Meeting }): ReactElement {
  const nav = useDataNavigatorController<MeetingDocument>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const source = useMemo(() => fetchDocuments(meeting.id), [meeting.id]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<MeetingDocument>[]>(() => {
    const upload = async () => {
      let items: readonly FileUpload.FileItem[] = [];
      let committed: readonly MeetingDocument[] = [];
      const drawer = dialogs.form({
        surface: 'drawer',
        title: 'Upload documents',
        subtitle: meeting.title,
        content: (
          <DocumentUpload
            name="files"
            multiple
            previews
            required
            upload={uploadDocument(meeting.id)}
            onChange={(next) => {
              items = next;
            }}
          />
        ),
        buttons: { confirm: 'Apply' },
      });

      for await (const attempt of drawer) {
        committed = await commitDocuments(attempt.data.strings('files'));
        attempt.accept();
      }

      if ((await drawer).canceled) {
        discardDocuments(items.flatMap((item) => (item.result === undefined ? [] : [item.result])));
        return;
      }

      nav.reload();
      toasts.success(`${countText(committed.map((document) => document.name), 'documents')} uploaded`);
    };

    const download = () => {
      void dialogs.warn({
        title: 'Download',
        content: 'Downloading is not available in this demo.\nThere is no real content behind the documents.',
      });
    };

    const remove = async (rows: readonly MeetingDocument[]) => {
      const [first] = rows;
      const done = await confirmAndRun(
        dialogs,
        {
          title: rows.length === 1 ? 'Delete document' : 'Delete documents',
          content: rows.length === 1 && first !== undefined
            ? `Delete "${first.name}"?\nThis cannot be undone.`
            : `Delete the ${rows.length} selected documents?\nThis cannot be undone.`,
          buttons: { confirm: 'Delete' },
        },
        () => deleteDocuments(rows.map((row) => row.id)),
      );

      if (done) {
        nav.reload();
        toasts.success(`${countText(rows.map((row) => row.name), 'documents')} deleted`);
      }
    };

    return [
      { type: 'general', key: 'upload', label: 'Upload', icon: icons.upload, onClick: () => void upload() },
      {
        type: 'singleRow',
        key: 'download',
        label: 'Download',
        show: 'toolbar',
        default: true,
        onClick: download,
      },
      { type: 'multiRow', key: 'delete-selected', label: 'Delete', icon: icons.remove, onClick: (rows) => void remove(rows) },
      {
        type: 'singleRow',
        key: 'delete',
        icon: icons.remove,
        tip: 'Delete document',
        show: 'column',
        contextMenu: false,
        onClick: (row) => void remove([row]),
      },
    ];
  }, [nav, dialogs, toasts, meeting.id, meeting.title]);

  return (
    <Navigator
      controller={nav}
      title="Documents"
      density="compact"
      striped
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={documentColumns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25]}
      defaultSort={{ key: 'uploaded', direction: 'asc' }}
    />
  );
}
