import { Box, Button, Paper, Stack, Tabs, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useParams } from 'react-router';
import {
  dateRangeColumnFilter,
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
  agendaNumbers,
  agendaOf,
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
  newSectionId,
  reorderAgenda,
  saveSectionDraft,
  setMeetingStatus,
  updateAgendaItem,
  uploadDocument,
  withSectionDraft,
} from '../db';
import type { AgendaItem, AgendaRow, AgendaSection, Db, Meeting, MeetingDocument, Person, SectionDraft } from '../db';
import { confirmAndRun, submitForm } from '../flows';
import type { Dialogs } from '../flows';
import { AgendaItemForm, AgendaSectionForm, MinutesForm } from '../forms';
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

// The number and the title of an agenda entry: `2. Finance`, `2.1 Annual accounts`.
function numbered(number: string, title: string): string {
  return number.includes('.') ? `${number} ${title}` : `${number}. ${title}`;
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
  const agendaSections = useDb((state) => state.agendaSections);
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
    <Button
      size="xs"
      onClick={() => void approve()}
    >
      Approve minutes
    </Button>
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
          <MinutesView
            meeting={meeting}
            agendaItems={agendaItems}
            agendaSections={agendaSections}
            boardName={boardName}
          />
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
// Each item has its minutes and decision ("Minutes", also a double click), shown in its detail row. Sections are the
// groups of the table (`groupBy`): an item is moved within its section or into another one by dragging. The sections
// themselves are managed in a dialog ("Manage sections": add, rename, delete, reorder).
function AgendaTable({ meeting }: { meeting: Meeting }): ReactElement {
  const nav = useDataNavigatorController<AgendaRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const memberships = useDb((state) => state.memberships);
  const people = useDb((state) => state.people);
  const agendaItems = useDb((state) => state.agendaItems);
  const agendaSections = useDb((state) => state.agendaSections);
  const numbers = useMemo(
    () => agendaNumbers(agendaOf({ agendaItems, agendaSections }, meeting.id)),
    [agendaItems, agendaSections, meeting.id],
  );
  const source = useMemo(() => fetchAgenda(meeting.id), [meeting.id]);
  const presenters = useMemo(
    () => membersOf({ memberships, people }, meeting.boardId).map((person) => person.name),
    [memberships, people, meeting.boardId],
  );

  const columns = useMemo<readonly DataNavigatorComponent.Column<AgendaRow>[]>(() => [
    { key: 'number', header: '#', width: 0.5, align: 'end' },
    { key: 'title', header: 'Item', width: 4, wrap: true, filter: textColumnFilter() },
    {
      key: 'presenter',
      header: 'Presenter',
      width: 2,
      hideable: true,
      filter: selectColumnFilter({ options: presenters, multiple: true }),
    },
    {
      key: 'duration',
      header: 'Duration',
      width: 1,
      hideable: true,
      align: 'end',
      render: (row) => `${row.duration} min`,
    },
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
    const sections = () =>
      db.getState().agendaSections
        .filter((section) => section.meetingId === meeting.id)
        .sort((a, b) => a.position - b.position);
    const values = (data: FormDialogData) => ({
      sectionId: data.string('sectionId', ''),
      title: data.string('title', ''),
      presenterId: data.string('presenterId', ''),
      duration: data.integer('duration', 15),
      description: data.string('description', ''),
    });

    const create = async () => {
      const saved = await submitForm(
        dialogs,
        {
          title: 'New agenda item',
          content: (check) => <AgendaItemForm check={check} members={members()} sections={sections()} />,
          buttons: { confirm: 'Add' },
        },
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
          content: (check) => (
            <AgendaItemForm check={check} item={itemOf(row)} members={members()} sections={sections()} />
          ),
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
          title: numbered(row.number, row.title),
          subtitle: 'Minutes',
          content: (check) => <MinutesForm check={check} item={item} />,
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

    // The sections in a form drawer of their own (also the empty ones, which the table cannot show). Everything in it
    // changes a draft: "Apply" saves it at once (the button shows a spinner meanwhile), "Cancel" drops it.
    const manageSections = async () => {
      const state = db.getState();
      let draft: SectionDraft = agendaOf(state, meeting.id).flatMap((entry) =>
        entry.type === 'section' ? [{ id: entry.section.id, title: entry.section.title }] : []
      );
      const drawer = dialogs.form({
        surface: 'drawer',
        title: 'Sections',
        content: (
          <SectionsManager
            meetingId={meeting.id}
            initial={draft}
            dialogs={dialogs}
            onChange={(next) => {
              draft = next;
            }}
          />
        ),
        buttons: { confirm: 'Apply' },
      });

      for await (const attempt of drawer) {
        await saveSectionDraft(meeting.id, draft);
        attempt.accept();
      }

      if ((await drawer).canceled) {
        return;
      }

      nav.reload();
      toasts.success('Sections saved');
    };

    return [
      { type: 'general', key: 'new', label: 'Add item', icon: appIcons.add, onClick: () => void create() },
      {
        type: 'general',
        key: 'sections',
        label: 'Manage sections',
        icon: appIcons.section,
        onClick: () => void manageSections(),
      },
      {
        type: 'singleRow',
        key: 'minutes',
        icon: appIcons.minutes,
        label: 'Minutes',
        show: 'both',
        default: true,
        onClick: (row) => void recordMinutes(row),
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
  }, [nav, dialogs, toasts, meeting.id, meeting.boardId]);

  // The positions (and the numbers) change with a move: the table is loaded again.
  const reorder = async (move: DataNavigatorComponent.Move<AgendaRow>) => {
    await reorderAgenda(move);
    nav.reload();
  };

  // The header of a section: its number and name, and the duration of its items.
  // Interim: the items without a section are the table's blank group (`''`), "No section", once per run of them.
  const renderGroup = (group: DataNavigatorComponent.RowGroup<AgendaRow>) => {
    const section = agendaSections.find((candidate) => candidate.id === group.key);
    const duration = group.key === ''
      ? group.rows.reduce((sum, row) => sum + row.duration, 0)
      : agendaItems.filter((item) => item.sectionId === group.key).reduce((sum, item) => sum + item.duration, 0);

    return (
      <>
        <span>
          {section === undefined ? 'No section' : numbered(numbers.get(group.key) ?? '', section.title)}
        </span>
        <Text span size="xs" c="dimmed" fw={400}>{duration} min</Text>
      </>
    );
  };

  return (
    <Navigator
      controller={nav}
      title="Agenda"
      subtitle="Drag items by their handle, also into another section. Double click an item for its minutes."
      density="compact"
      footer="auto"
      searchable
      source={source}
      reorder={reorder}
      groupBy="sectionId"
      renderGroup={renderGroup}
      rowKey="id"
      columns={columns}
      actions={actions}
      renderDetail={(row) => <AgendaDetail row={row} />}
      // One page for the whole agenda: with `footer="auto"`, the footer comes only for more than 50 items.
      pageSize={50}
      pageSizeOptions={[50]}
    />
  );
}

// The list of the "Sections" drawer: the draft of the sections (`SectionDraft`) in their order, with their numbers on
// the agenda as it would be with the draft. "Add" and "Rename" (also a double click) ask for the
// name in a small dialog on top; "Delete" and moving a section by its handle change the draft at once (no
// confirmation: "Cancel" of the drawer undoes everything). The list is as wide as the drawer and fills its height.
function SectionsManager({ meetingId, initial, dialogs, onChange }: {
  meetingId: string;
  initial: SectionDraft;
  dialogs: Dialogs;
  onChange: (draft: SectionDraft) => void;
}): ReactElement {
  const nav = useDataNavigatorController<SectionRow>();
  const [draft, setDraft] = useState(initial);
  const first = useRef(true);

  // The rows: the draft with the numbers of the agenda as it would be.
  const source = useMemo((): DataNavigatorComponent.Source<SectionRow> => {
    const numbers = agendaNumbers(
      agendaOf({ ...db.getState(), ...withSectionDraft(db.getState(), meetingId, draft) }, meetingId),
    );
    const rows = draft.map((section) => ({ ...section, number: numbers.get(section.id) ?? '' }));

    return async () => ({ rows, total: rows.length });
  }, [draft, meetingId]);

  // A new draft: the owner hears of it, and the list is loaded again (its source is new; the table's effect has taken it
  // over before this one runs).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    onChange(draft);
    nav.reload();
  }, [draft, onChange, nav]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<SectionRow>[]>(() => {
    // The name in a small dialog; the draft changes only when it is confirmed.
    const askName = async (title: string, section?: SectionRow): Promise<string | undefined> => {
      let name: string | undefined;

      await submitForm(
        dialogs,
        {
          title,
          content: (check) => <AgendaSectionForm check={check} section={section} />,
          buttons: { confirm: section === undefined ? 'Add' : 'OK' },
        },
        async (data) => {
          name = data.string('title', '');
        },
      );

      return name;
    };

    const create = async () => {
      const name = await askName('New section');

      if (name !== undefined) {
        setDraft((current) => [...current, { id: newSectionId(), title: name }]);
      }
    };

    const rename = async (row: SectionRow) => {
      const name = await askName('Rename section', row);

      if (name !== undefined) {
        setDraft((current) =>
          current.map((section) => (section.id === row.id ? { ...section, title: name } : section))
        );
      }
    };

    return [
      { type: 'general', key: 'new', icon: appIcons.add, label: 'Add', onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'rename',
        icon: appIcons.edit,
        tip: 'Rename',
        default: true,
        onClick: (row) => void rename(row),
      },
      {
        type: 'singleRow',
        key: 'delete',
        icon: appIcons.remove,
        tip: 'Delete',
        onClick: (row) => setDraft((current) => current.filter((section) => section.id !== row.id)),
      },
    ];
  }, [dialogs]);

  // A move: right after `after`, or right before `before` (at the top).
  const reorder = (move: DataNavigatorComponent.Move<SectionRow>) => {
    setDraft((current) => {
      const rest = current.filter((section) => section.id !== move.row.id);
      const moved = current.find((section) => section.id === move.row.id);
      const index = move.after !== undefined
        ? rest.findIndex((section) => section.id === move.after?.id) + 1
        : Math.max(0, rest.findIndex((section) => section.id === move.before?.id));

      return moved === undefined ? current : rest.toSpliced(index, 0, moved);
    });
  };

  return (
    // As high as the drawer's body (the screen minus the drawer's header and buttons), so the list scrolls inside it and
    // the drawer never scrolls as a whole.
    <Box h="calc(100dvh - 11rem)">
      <Navigator
        controller={nav}
        density="compact"
        footer="auto"
        source={source}
        reorder={reorder}
        rowKey="id"
        columns={sectionColumns}
        actions={actions}
        empty="No sections"
        pageSize={100}
        pageSizeOptions={[100]}
      />
    </Box>
  );
}

// A section in the list of the "Sections" drawer.
type SectionRow = { id: string; title: string; number: string };

const sectionColumns: readonly DataNavigatorComponent.Column<SectionRow>[] = [
  { key: 'number', header: '#', width: '3rem', align: 'end' },
  { key: 'title', header: 'Name', wrap: true },
];

// The minutes as one document: every item with its minutes and decision, in the order of the agenda; the sections as
// headings, their items indented.
function MinutesView({ meeting, agendaItems, agendaSections, boardName }: {
  meeting: Meeting;
  agendaItems: readonly AgendaItem[];
  agendaSections: readonly AgendaSection[];
  boardName: string;
}): ReactElement {
  const agenda = useMemo(
    () => agendaOf({ agendaItems, agendaSections }, meeting.id),
    [agendaItems, agendaSections, meeting.id],
  );
  const numbers = useMemo(() => agendaNumbers(agenda), [agenda]);
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
        <Stack gap="md">
          {agenda.map((entry) => {
            if (entry.type === 'section') {
              return (
                <Title key={entry.section.id} order={4} size="h5" mt="xs">
                  {numbered(numbers.get(entry.section.id) ?? '', entry.section.title)}
                </Title>
              );
            }

            const { item } = entry;

            return (
              <Stack key={item.id} gap={2} pl={item.sectionId === '' ? 0 : 'md'}>
                <Text fw={600} size="sm">{numbered(numbers.get(item.id) ?? '', item.title)}</Text>
                <Text size="sm">{item.minutes === '' ? '(No minutes.)' : item.minutes}</Text>
                {item.decision !== '' && <Text size="sm" fs="italic">Decision: {item.decision}</Text>}
              </Stack>
            );
          })}
        </Stack>
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
  {
    key: 'size',
    header: 'Size',
    width: 1.2,
    sortable: true,
    hideable: true,
    align: 'end',
    render: (row) => formatSize(row.size),
  },
  { key: 'user', header: 'Uploaded by', width: 2, sortable: true, hideable: true },
  {
    key: 'uploaded',
    header: 'Uploaded',
    width: 2,
    sortable: true,
    hideable: true,
    filter: dateRangeColumnFilter(),
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
      { type: 'general', key: 'upload', label: 'Upload', icon: appIcons.upload, onClick: () => void upload() },
      {
        type: 'singleRow',
        key: 'download',
        label: 'Download',
        show: 'toolbar',
        default: true,
        onClick: download,
      },
      {
        type: 'multiRow',
        key: 'delete-selected',
        label: 'Delete',
        icon: appIcons.remove,
        onClick: (rows) => void remove(rows),
      },
      {
        type: 'singleRow',
        key: 'delete',
        icon: appIcons.remove,
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
