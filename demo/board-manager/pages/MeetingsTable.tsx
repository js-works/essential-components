import { Anchor, Badge } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { icons } from '../../../packages/data-navigator/demo/icons';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../packages/overlays/src/main/bindings/react';
import type { FormDialogData } from '../../../packages/overlays/src/main/dialogs/contract/form-data';
import {
  createMeeting,
  db,
  deleteMeetings,
  fetchMeetings,
  getMeeting,
  MEETING_STATUSES,
  setMeetingStatus,
  updateMeeting,
} from '../db';
import type { MeetingRow, MeetingStatus } from '../db';
import { confirmAndRun, submitForm } from '../flows';
import { MeetingForm } from '../forms';
import { appIcons, countText, formatDateTime, Navigator, useDb } from '../shared';

export { MeetingsTable, MinutesBadge, StatusBadge };

const STATUS_COLORS: Readonly<Record<MeetingStatus, string>> = { Planned: 'blue', Held: 'green', Cancelled: 'gray' };

function StatusBadge({ status }: { status: MeetingStatus }): ReactElement {
  return <Badge size="sm" variant="light" color={STATUS_COLORS[status]}>{status}</Badge>;
}

// Only a held meeting has minutes: a draft until they are approved.
function MinutesBadge({ meeting }: { meeting: { status: MeetingStatus; minutesApproved: boolean } }): ReactElement | null {
  if (meeting.status !== 'Held') {
    return null;
  }

  return meeting.minutesApproved
    ? <Badge size="sm" variant="outline" color="green">Minutes approved</Badge>
    : <Badge size="sm" variant="outline" color="orange">Minutes draft</Badge>;
}

// The meetings of one board (`boardId`, on the board's page) or of all boards (the "Meetings" module, with a board
// column and filter). `pathOf` is where a meeting opens: below its board, or below "Meetings".
function MeetingsTable(
  { boardId, pathOf, title, subtitle }: {
    boardId?: string;
    pathOf: (meeting: { id: string; boardId: string }) => string;
    title: string;
    subtitle: string;
  },
): ReactElement {
  const nav = useDataNavigatorController<MeetingRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const boards = useDb((state) => state.boards);
  const source = useMemo(() => fetchMeetings(boardId), [boardId]);

  const columns = useMemo<readonly DataNavigatorComponent.Column<MeetingRow>[]>(() => [
    {
      key: 'start',
      header: 'Date',
      width: 2,
      sortable: true,
      render: (row) => formatDateTime(row.start),
      filter: dateRangeColumnFilter(),
    },
    {
      key: 'title',
      header: 'Meeting',
      width: 3,
      sortable: true,
      filter: textColumnFilter(),
      render: (row) => <Anchor component={Link} to={pathOf(row)} size="sm">{row.title}</Anchor>,
    },
    ...(boardId === undefined
      ? [{
        key: 'board',
        header: 'Board',
        width: 2.5,
        sortable: true,
        hideable: true,
        filter: selectColumnFilter({ options: boards.map((board) => board.name), multiple: true }),
      } satisfies DataNavigatorComponent.Column<MeetingRow>]
      : []),
    { key: 'location', header: 'Location', width: 2, hideable: true, hidden: boardId === undefined },
    {
      key: 'status',
      header: 'Status',
      width: 1.3,
      sortable: true,
      hideable: true,
      render: (row) => <StatusBadge status={row.status} />,
      filter: selectColumnFilter({ options: MEETING_STATUSES, multiple: true }),
    },
    {
      key: 'minutesApproved',
      header: 'Minutes',
      width: 1.7,
      hideable: true,
      render: (row) => <MinutesBadge meeting={row} />,
    },
    { key: 'items', header: 'Items', width: 0.8, sortable: true, hideable: true, align: 'end' },
    { key: 'documents', header: 'Documents', width: 1, sortable: true, hideable: true, hidden: true, align: 'end' },
  ], [boardId, boards, pathOf]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<MeetingRow>[]>(() => {
    const values = (data: FormDialogData) => ({
      title: data.string('title', ''),
      start: data.string('start', ''),
      location: data.string('location', ''),
    });

    const create = async () => {
      let created: { id: string; boardId: string } | undefined;
      const saved = await submitForm(
        dialogs,
        {
          title: 'New meeting',
          content: <MeetingForm boards={boardId === undefined ? db.getState().boards : undefined} />,
          buttons: { confirm: 'Create' },
        },
        async (data) => {
          created = await createMeeting(boardId ?? data.string('boardId', ''), values(data));
        },
      );

      if (saved && created !== undefined) {
        toasts.success('Meeting created');
        navigate(pathOf(created));
      }
    };

    const edit = async (row: MeetingRow) => {
      const saved = await submitForm(
        dialogs,
        {
          title: 'Edit meeting',
          content: <MeetingForm meeting={getMeeting(db.getState(), row.id)} />,
          buttons: { confirm: 'Save' },
        },
        (data) => updateMeeting(row.id, values(data)),
      );

      if (saved) {
        nav.reload();
        toasts.success('Meeting saved');
      }
    };

    // Only a planned meeting can be cancelled.
    const cancel = async (row: MeetingRow) => {
      if (row.status !== 'Planned') {
        void dialogs.warn({
          title: 'Cancel meeting',
          content: `"${row.title}" is ${row.status.toLowerCase()}.\nOnly a planned meeting can be cancelled.`,
        });

        return;
      }

      const done = await confirmAndRun(
        dialogs,
        {
          title: 'Cancel meeting',
          content: `Cancel "${row.title}" on ${formatDateTime(row.start)}?`,
          buttons: { confirm: 'Cancel meeting', cancel: 'Keep' },
        },
        () => setMeetingStatus(row.id, 'Cancelled'),
      );

      if (done) {
        nav.reload();
        toasts.success(`"${row.title}" cancelled`);
      }
    };

    const remove = async (rows: readonly MeetingRow[]) => {
      const [first] = rows;
      const single = rows.length === 1 && first !== undefined;
      const done = await confirmAndRun(
        dialogs,
        {
          title: single ? 'Delete meeting' : 'Delete meetings',
          content: `${
            single ? `Delete "${first.title}"` : `Delete the ${rows.length} selected meetings`
          }, with the agenda, the minutes and the documents?\nThis cannot be undone.`,
          buttons: { confirm: 'Delete' },
        },
        () => deleteMeetings(rows.map((row) => row.id)),
      );

      if (done) {
        nav.reload();
        toasts.success(`${countText(rows.map((row) => row.title), 'meetings')} deleted`);
      }
    };

    return [
      { type: 'general', key: 'new', label: 'New meeting', icon: icons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: 'Open',
        show: 'column',
        default: true,
        onClick: (row) => navigate(pathOf(row)),
      },
      { type: 'singleRow', key: 'edit', icon: icons.edit, tip: 'Edit', show: 'both', onClick: (row) => void edit(row) },
      { type: 'singleRow', key: 'cancel', label: 'Cancel meeting', show: 'toolbar', onClick: (row) => void cancel(row) },
      { type: 'multiRow', key: 'delete', label: 'Delete', icon: icons.remove, onClick: (rows) => void remove(rows) },
    ];
  }, [nav, dialogs, toasts, navigate, boardId, pathOf]);

  return (
    <Navigator
      controller={nav}
      title={title}
      subtitle={subtitle}
      density="compact"
      striped
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'start', direction: 'desc' }}
    />
  );
}
