import { Box, Button, Group, Menu, Paper, SimpleGrid, Stack, Tabs, Text, TextInput, Title } from '@mantine/core';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
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
  renameDocument,
  reorderAgenda,
  saveSectionDraft,
  setMeetingStatus,
  updateAgendaItem,
  uploadDocument,
  withSectionDraft,
} from '../db';
import type { AgendaItem, AgendaRow, AgendaSection, Db, Meeting, MeetingDocument, Person, SectionDraft } from '../db';
import { confirmAndRun } from '../flows';
import type { Dialogs } from '../flows';
import { AgendaItemForm, DocumentForm, MinutesForm } from '../forms';
import { MinutesText } from '../minutes';
import { downloadMeetingPdf, previewMeetingPdf, printMeetingPdf } from '../pdf';
import { appIcons, countText, formatDateTime, formatSize, formatTime, Navigator, PageHeader, useDb } from '../shared';
import { deleteMeetingsFlow, editMeeting, MinutesBadge, StatusBadge } from './MeetingsTable';
import { NotFound } from './NotFound';

export { MeetingPage };

const uploadI18n = createDemoI18n();

// The file upload in Mantine's look: its theme values are Mantine's variables (inherited into its shadow DOM from the
// scope), so it follows Mantine's color scheme and the contrast of the app's theme, like the data navigator's
// `mantineTheme`.
const MANTINE_UPLOAD_THEME: FileUpload.Theme = {
  accentColor: 'var(--mantine-primary-color-filled)',
  accentTextColor: 'var(--mantine-primary-color-contrast)',
  textColor: 'var(--mantine-color-text)',
  mutedColor: 'var(--mantine-color-dimmed)',
  borderColor: 'var(--mantine-color-default-border)',
  surfaceColor: 'var(--mantine-color-default-hover)',
  successColor: 'var(--mantine-color-green-text)',
  dangerColor: 'var(--mantine-color-error)',
  borderRadius: 'var(--mantine-radius-default)',
  buttonBorderRadius: 'var(--mantine-radius-default)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
};

const DocumentUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
  theme: MANTINE_UPLOAD_THEME,
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
  const [tab, setTab] = useState<string | null>('overview');
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
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="agenda">Agenda</Tabs.Tab>
          <Tabs.Tab value="minutes" leftSection={appIcons.minutes}>Minutes</Tabs.Tab>
          <Tabs.Tab value="documents">Documents</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <MeetingOverview meeting={meeting} boardName={boardName} duration={duration} />
        </Tabs.Panel>
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

// The base information of a meeting, as a list of labels and values, with "Edit" (the meeting form in a dialog, like
// "Edit" in the meetings list) and "Delete" (then back to where it was opened: its board, or the meetings list). The
// end is the start plus the duration of the agenda.
function MeetingOverview({ meeting, boardName, duration }: {
  meeting: Meeting;
  boardName: string;
  duration: number;
}): ReactElement {
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = useDb((state) => state.agendaItems.filter((item) => item.meetingId === meeting.id).length);
  const sections = useDb((state) => state.agendaSections.filter((section) => section.meetingId === meeting.id).length);
  const documents = useDb((state) => state.documents.filter((document) => document.meetingId === meeting.id).length);
  const end = new Date(new Date(meeting.start).getTime() + duration * 60_000);
  const count = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
  const fields: readonly (readonly [string, ReactNode])[] = [
    ['Title', meeting.title],
    ['Board', boardName],
    ['Date, time', `${formatDateTime(meeting.start)} – ${formatTime(end)} (${duration} min)`],
    ['Location', meeting.location],
    [
      'Status',
      <Group key="status" gap="xs">
        <StatusBadge status={meeting.status} />
        <MinutesBadge meeting={meeting} />
      </Group>,
    ],
    [
      'Agenda',
      sections === 0 ? count(items, 'item') : `${count(items, 'item')} in ${count(sections, 'section')}`,
    ],
    ['Documents', String(documents)],
  ];

  const remove = async () => {
    if (await deleteMeetingsFlow(dialogs, toasts, [meeting])) {
      navigate(pathname.startsWith('/boards/') ? `/boards/${meeting.boardId}` : '/meetings');
    }
  };

  return (
    // No frame, like the tables of the other tabs: the title and the buttons in one line, like their toolbars.
    <Stack gap="md" maw={820}>
      <Group justify="space-between" className="board-manager__panel-header">
        <Text fw={700} size="lg">Overview</Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            leftSection={appIcons.edit}
            onClick={() => void editMeeting(dialogs, toasts, meeting.id)}
          >
            Edit
          </Button>
          <Button
            size="xs"
            variant="default"
            color="danger"
            leftSection={appIcons.remove}
            onClick={() => void remove()}
          >
            Delete
          </Button>
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <Button size="xs" variant="default" leftSection={appIcons.pdf} rightSection={appIcons.chevronDown}>
                PDF
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={appIcons.preview}
                onClick={() => void previewMeetingPdf(dialogs, toasts, meeting)}
              >
                Preview
              </Menu.Item>
              <Menu.Item leftSection={appIcons.print} onClick={() => void printMeetingPdf(dialogs, toasts, meeting)}>
                Print
              </Menu.Item>
              <Menu.Item
                leftSection={appIcons.download}
                onClick={() => void downloadMeetingPdf(dialogs, toasts, meeting)}
              >
                Download
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <SimpleGrid cols={2} spacing="lg" verticalSpacing="xs" style={{ gridTemplateColumns: 'max-content 1fr' }}>
        {fields.map(([label, value]) => (
          <Fragment key={label}>
            <Text size="sm" c="dimmed">{label}</Text>
            {typeof value === 'string' ? <Text size="sm">{value}</Text> : value}
          </Fragment>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// The minutes, the decision and the description of an item, in its detail row.
function AgendaDetail({ row }: { row: AgendaRow }): ReactElement {
  return (
    <Stack gap={6} py={4}>
      {row.description !== '' && <Text size="sm" c="dimmed">{row.description}</Text>}
      {row.minutes !== '' && <MinutesText minutes={row.minutes} empty="" />}
      {row.decision !== '' && <Text size="sm" fw={600}>Decision: {row.decision}</Text>}
      {row.minutes === '' && row.decision === '' && <Text size="sm" c="dimmed">No minutes recorded yet.</Text>}
    </Stack>
  );
}

// The agenda: in the order of its items (no sorting: the rows are moved with their handle, and every move is saved).
// Each item has its minutes and decision ("Minutes", also a double click), shown in its detail row. Sections are the
// groups of the table (`groupBy`): an item is moved within its section or into another one by dragging. The sections
// themselves are managed in a dialog ("Manage sections": add, rename, delete, reorder). Without a section, the table
// is not grouped: plain rows.
function AgendaTable({ meeting }: { meeting: Meeting }): ReactElement {
  const nav = useDataNavigatorController<AgendaRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const agendaItems = useDb((state) => state.agendaItems);
  const agendaSections = useDb((state) => state.agendaSections);
  const numbers = useMemo(
    () => agendaNumbers(agendaOf({ agendaItems, agendaSections }, meeting.id)),
    [agendaItems, agendaSections, meeting.id],
  );
  const source = useMemo(() => fetchAgenda(meeting.id), [meeting.id]);
  const grouped = agendaSections.some((section) => section.meetingId === meeting.id);

  // No filters and no search: an agenda is short, and moving its items needs all of them shown. No column menu either
  // (no column is hideable): there is no column hidden by default.
  const columns: readonly DataNavigatorComponent.Column<AgendaRow>[] = [
    { key: 'number', header: '#', width: 0.5, align: 'end' },
    { key: 'title', header: 'Item', width: 4, wrap: true },
    { key: 'presenter', header: 'Presenter', width: 2 },
    {
      key: 'duration',
      header: 'Duration',
      width: 1,
      align: 'end',
      render: (row) => `${row.duration} min`,
    },
    {
      key: 'recorded',
      header: 'Minutes',
      width: 1,
      align: 'center',
    },
  ];

  const actions = useMemo<readonly DataNavigatorComponent.Action<AgendaRow>[]>(() => {
    const itemOf = (row: AgendaRow): AgendaItem | undefined =>
      db.getState().agendaItems.find((item) => item.id === row.id);
    const members = () => membersOf(db.getState(), meeting.boardId);
    const sections = () =>
      db.getState().agendaSections
        .filter((section) => section.meetingId === meeting.id)
        .sort((a, b) => a.position - b.position);
    const create = async () => {
      const saved = !(await dialogs.form({
        title: 'New agenda item',
        content: (
          <AgendaItemForm
            members={members()}
            sections={sections()}
            save={(values) => createAgendaItem(meeting.id, values)}
          />
        ),
        buttons: { confirm: 'Add' },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success('Agenda item added');
      }
    };

    const edit = async (row: AgendaRow) => {
      const saved = !(await dialogs.form({
        title: 'Edit agenda item',
        content: (
          <AgendaItemForm
            item={itemOf(row)}
            members={members()}
            sections={sections()}
            save={(values) => updateAgendaItem(row.id, values)}
          />
        ),
        buttons: { confirm: 'Save' },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success('Agenda item saved');
      }
    };

    // In an extra wide dialog: room for the editor's blocks, its side menu and its toolbar.
    const recordMinutes = async (row: AgendaRow) => {
      const item = itemOf(row);

      if (item === undefined) {
        return;
      }

      const saved = !(await dialogs.form({
        width: 'extraWide',
        // Long minutes are easier to write in the whole window.
        maximizable: true,
        title: numbered(row.number, row.title),
        subtitle: 'Minutes',
        content: <MinutesForm item={item} members={members()} save={(values) => updateAgendaItem(row.id, values)} />,
        buttons: { confirm: 'Save' },
      })).canceled;

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

    // The sections in a form drawer of their own. Everything in it
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
  // The items without a section are the table's blank group (`''`): "Other", always the last one.
  const renderGroup = (group: DataNavigatorComponent.RowGroup<AgendaRow>) => {
    const section = agendaSections.find((candidate) => candidate.id === group.key);
    const duration = agendaItems
      .filter((item) => item.meetingId === meeting.id && item.sectionId === group.key)
      .reduce((sum, item) => sum + item.duration, 0);

    return (
      <>
        <span>{numbered(numbers.get(group.key) ?? '', section?.title ?? 'Other')}</span>
        <Text span size="xs" c="dimmed" fw={400}>{duration} min</Text>
      </>
    );
  };

  return (
    <Navigator
      // A new table when the first section comes or the last one goes: no group state is carried over.
      key={grouped ? 'grouped' : 'flat'}
      controller={nav}
      title="Agenda"
      subtitle={grouped
        ? 'Drag items by their handle, also into another section. Double click an item for its minutes.'
        : 'Drag items by their handle. Double click an item for its minutes.'}
      density="compact"
      footer="auto"
      source={source}
      reorder={reorder}
      groupBy={grouped ? 'sectionId' : undefined}
      renderGroup={grouped ? renderGroup : undefined}
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

// A text in the edit form of a data navigator (a section's name): Mantine's input, for the column it is in (the form's
// label names it).
function mantineTextEditor<Row>(): DataNavigatorComponent.ColumnEditor<Row> {
  return ({ columnKey, value, change, labelledBy }) => (
    <TextInput
      size="xs"
      aria-labelledby={labelledBy}
      autoComplete="off"
      value={typeof value === 'string' ? value : ''}
      // A patch of one column: the editor knows its key, not its type.
      onChange={(event) => change({ [columnKey]: event.currentTarget.value } as Partial<Row>)}
    />
  );
}

// The trimmed name of a section from the edit form; an empty one is refused (the form shows the message).
function sectionTitleOf(draft: SectionRow): string {
  const title = draft.title.trim();

  if (title === '') {
    throw new Error('The name must not be empty.');
  }

  return title;
}

// The list of the "Sections" drawer: the draft of the sections (`SectionDraft`) in their order, with their numbers on
// the agenda as it would be with the draft. The names are edited in the data navigator's edit form: "Edit" (also a
// double click) renames a section, "Add section" opens the form of a new one, which "Save" adds at the end. "Save" of
// the form only changes the draft. "Delete" (of a row, or of the selected ones) and moving a section by its handle
// change the draft at once (no confirmation: "Cancel" of the drawer undoes everything). The list is as wide as the
// drawer and fills its height.
function SectionsManager({ meetingId, initial, onChange }: {
  meetingId: string;
  initial: SectionDraft;
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
  // over before this one runs), with the new numbers and a new section at its place at the end.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    onChange(draft);
    nav.reload();
  }, [draft, onChange, nav]);

  const columns = useMemo(
    (): readonly DataNavigatorComponent.Column<SectionRow>[] => [
      { key: 'number', header: '#', width: '3rem', align: 'end' },
      { key: 'title', header: 'Name', edit: mantineTextEditor() },
    ],
    [],
  );

  const actions = useMemo<readonly DataNavigatorComponent.Action<SectionRow>[]>(() => [
    {
      type: 'general',
      key: 'new',
      icon: appIcons.add,
      label: 'Add section',
      onClick: () => nav.addRow({ id: '', title: '', number: '' }),
    },
    { type: 'singleRow', key: 'edit', icon: appIcons.edit, tip: 'Edit', default: true, onClick: nav.editRow },
    {
      type: 'singleRow',
      key: 'delete',
      icon: appIcons.remove,
      tip: 'Delete',
      onClick: (row) => setDraft((current) => current.filter((section) => section.id !== row.id)),
    },
    {
      type: 'multiRow',
      key: 'delete-selected',
      label: 'Delete',
      icon: appIcons.remove,
      onClick: (rows) => {
        const ids = new Set(rows.map((row) => row.id));

        setDraft((current) => current.filter((section) => !ids.has(section.id)));
      },
    },
  ], [nav]);

  // "Save" of the edit form: a rename, or a new section at the end; both only change the draft.
  const saveRow = (row: SectionRow, edited: SectionRow): SectionRow => {
    const title = sectionTitleOf(edited);

    setDraft((current) => current.map((section) => (section.id === row.id ? { ...section, title } : section)));

    return { ...row, title };
  };

  const createRow = (created: SectionRow): SectionRow => {
    const section = { id: newSectionId(), title: sectionTitleOf(created) };

    setDraft((current) => [...current, section]);

    return { ...section, number: '' };
  };

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
        saveRow={saveRow}
        createRow={createRow}
        rowKey="id"
        columns={columns}
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

// The minutes as one document: every item with its minutes and decision, in the order of the agenda; the sections as
// headings, their items indented, and "Other" for the items without a section.
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

  // Without minutes (planned, cancelled), the note is in the same frame as the minutes.
  if (meeting.status !== 'Held') {
    return (
      <Paper withBorder p="lg" radius="sm" maw={820}>
        <Text c="dimmed" size="sm">
          {meeting.status === 'Cancelled'
            ? 'The meeting was cancelled: there are no minutes.'
            : 'The minutes are recorded per agenda item ("Minutes" in the agenda), during or after the meeting.'}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="sm" maw={820}>
      <Stack gap="md">
        <Stack gap={2}>
          <Title order={3} size="h4">Minutes of the {meeting.title}</Title>
          <Text size="sm" c="dimmed">{boardName} · {formatDateTime(meeting.start)} · {meeting.location}</Text>
          <Text size="sm" c="dimmed">Members: {attendees.join(', ')}</Text>
          <Text size="sm" c={meeting.minutesApproved ? 'success' : 'warning'}>
            {meeting.minutesApproved ? 'Approved.' : 'Draft: not approved yet.'}
          </Text>
        </Stack>
        <Stack gap="md">
          {agenda.map((entry, index) => {
            if (entry.type === 'section') {
              return (
                <Title key={entry.section.id} order={4} size="h5" mt="xs">
                  {numbered(numbers.get(entry.section.id) ?? '', entry.section.title)}
                </Title>
              );
            }

            const { item } = entry;
            const previous = agenda[index - 1];
            // The first item of "Other" (with sections only: `numbers` has the key `''`) starts its heading.
            const other = item.sectionId === '' && numbers.has('')
              && !(previous?.type === 'item' && previous.item.sectionId === '');

            return (
              <Fragment key={item.id}>
                {other && <Title order={4} size="h5" mt="xs">{numbered(numbers.get('') ?? '', 'Other')}</Title>}
                <Stack gap={2} pl={numbers.has('') || item.sectionId !== '' ? 'md' : 0}>
                  <Text fw={600} size="sm">{numbered(numbers.get(item.id) ?? '', item.title)}</Text>
                  <MinutesText minutes={item.minutes} empty="(No minutes.)" />
                  {item.decision !== '' && <Text size="sm" fs="italic">Decision: {item.decision}</Text>}
                </Stack>
              </Fragment>
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
    filter: selectColumnFilter({ options: ['PDF', 'DOCX', 'PPTX', 'XLSX'], multiple: true }),
  },
  {
    key: 'size',
    header: 'Size',
    width: 1.2,
    sortable: true,
    align: 'end',
    render: (row) => formatSize(row.size),
  },
  { key: 'user', header: 'Uploaded by', width: 2, sortable: true },
  {
    key: 'uploaded',
    header: 'Uploaded',
    width: 2,
    sortable: true,
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

    // The name in a form dialog (the fake server trims it and refuses an empty one; the dialog shows its message).
    const rename = async (row: MeetingDocument) => {
      let renamed = row.name;
      const saved = !(await dialogs.form({
        title: 'Rename document',
        content: (
          <DocumentForm
            document={row}
            save={async (values) => {
              renamed = (await renameDocument(row.id, values.name)).name;
            }}
          />
        ),
        buttons: { confirm: 'Save' },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success(`"${renamed}" renamed`);
      }
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
        key: 'rename',
        icon: appIcons.edit,
        tip: 'Rename document',
        label: 'Rename',
        show: 'column',
        onClick: (row) => void rename(row),
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
      subtitle="The files for this meeting: reports, proposals, presentations. Double click one to download it."
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
