import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  singleRowAction,
  textFilter,
  useDataTableController,
} from '@local/data-table/react';
import type { SavedFilter, TableColumn } from '@local/data-table/react';
import { useDialogs, useToast } from '@local/overlays/react';
import { Anchor } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Board } from '../../../domain/index.js';
import { fetchMeetings } from '../../../infra/in-memory/index.js';
import type { MeetingRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDateTime, PAGE_SIZE_OPTIONS, useDb } from '../../../shared/shared.js';
import { daysFromToday, sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { boardFilter } from '../../boards/filters.js';
import { meetingStatusFilter, minutesFilter } from '../filters.js';
import { MinutesBadge, StatusBadge } from './MeetingBadges.js';
import { cancelMeetingFlow, createMeetingFlow, deleteMeetingsFlow, editMeeting } from './meetingFlows.js';
import type { MeetingListContext } from './meetingFlows.js';

export { MeetingTable };

// The colleagues' shared filters of the meetings list (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Minutes to approve', { status: ['Held'], minutesApproved: ['draft'] }),
  sharedBy('Jonas Weber', 'Planned, next 90 days', {
    status: ['Planned'],
    start: { from: daysFromToday(0), to: daysFromToday(90) },
  }),
  sharedBy('Lena Hoffmann', 'Supervisory Board', { board: ['Supervisory Board'] }),
];

// What the columns depend on: the board of the list (none: a board column), and where a meeting opens.
type ColumnsOptions = { boardId?: string; pathOf: (meeting: { id: string; boardId: string }) => string };

// The columns of a meetings list, with their headers in the current language.
const columnsOf = (t: Translate, { boardId, pathOf }: ColumnsOptions) =>
  defineColumns<MeetingRow>([
    {
      key: 'start',
      header: t('meetings.columns.date'),
      width: 2,
      sortable: true,
      render: (row) => formatDateTime(row.start),
    },
    {
      key: 'title',
      header: t('meetings.columns.meeting'),
      width: 3,
      sortable: true,
      render: (row) => <Anchor component={Link} to={pathOf(row)} size="sm">{row.title}</Anchor>,
    },
    ...(boardId === undefined
      ? [
        {
          key: 'board',
          header: t('meetings.columns.board'),
          width: 2.5,
          sortable: true,
          hideable: true,
        } satisfies TableColumn<MeetingRow>,
      ]
      : []),
    {
      key: 'location',
      header: t('meetings.columns.location'),
      width: 2,
      hideable: true,
      hidden: boardId === undefined,
    },
    {
      key: 'status',
      header: t('meetings.columns.status'),
      width: 1.3,
      sortable: true,
      hideable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'minutesApproved',
      header: t('meetings.columns.minutes'),
      width: 1.3,
      hideable: true,
      render: (row) => <MinutesBadge meeting={row} />,
    },
    {
      key: 'items',
      header: t('meetings.columns.items'),
      width: 1.1,
      sortable: true,
      hideable: true,
      align: 'end',
    },
    {
      key: 'documents',
      header: t('meetings.columns.documents'),
      width: 1,
      sortable: true,
      hideable: true,
      hidden: true,
      align: 'end',
    },
    // Only for the look (2026-10-11, the user's wish: enough filters for the filter drawer's two columns): columns
    // without data, whose filters the source ignores.
    {
      key: 'chair',
      header: t('meetings.columns.chair'),
      width: 2,
      hideable: true,
      hidden: true,
    },
    {
      key: 'created',
      header: t('meetings.columns.created'),
      width: 2,
      hideable: true,
      hidden: true,
    },
  ]);

// The filters of a meetings list (the boards: only without a board of the list, with the board column).
const filtersOf = (t: Translate, boards: readonly Board[] | undefined) =>
  defineFilters({
    start: dateRangeFilter(),
    title: textFilter(),
    ...(boards === undefined ? {} : { board: boardFilter(boards) }),
    location: textFilter(),
    status: meetingStatusFilter(t),
    minutesApproved: minutesFilter(t),
    chair: textFilter(),
    created: dateRangeFilter(),
  });

// The actions of a meetings list: new, open (the default action), edit, cancel, delete.
const actionsOf = (t: Translate, ctx: MeetingListContext) =>
  defineActions<MeetingRow>([
    newAction(t('meetings.new'), () => createMeetingFlow(ctx)),
    openAction((row) => ctx.navigate(ctx.pathOf(row))),
    editAction(async (row) => (await editMeeting(ctx.dialogs, ctx.toasts, row.id)) && ctx.nav.reload()),
    singleRowAction('cancel', (row) => cancelMeetingFlow(ctx, row), { label: t('meetings.cancel'), show: 'toolbar' }),
    deleteAction(async (rows) => (await deleteMeetingsFlow(ctx.dialogs, ctx.toasts, rows)) && ctx.nav.reload()),
  ]);

// The meetings of one board (`boardId`, on the board's page), of the boards of one person (`personId`, on the member's
// page), or of all boards (the "Meetings" module). Without a board, with a board column and filter, and a new meeting
// chooses its board (of the person's boards, with a person). `pathOf` is where a meeting opens: below its board, or
// below "Meetings".
function MeetingTable(
  { boardId, personId, pathOf, title, subtitle }: {
    boardId?: string;
    personId?: string;
    pathOf: (meeting: { id: string; boardId: string }) => string;
    title: string;
    subtitle: string;
  },
): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<MeetingRow>();
  const ctx = { dialogs: useDialogs(), toasts: useToast(), nav, navigate: useNavigate(), boardId, personId, pathOf };
  const boards = useDb((state) => state.boards);
  // Saved filters only in the Meetings module (2026-10-11, the user's wish: not on a board's or a member's page).
  const savedFilters = useSavedFilters('board-manager:saved-filters:meetings', COLLEAGUES_FILTERS);
  const main = boardId === undefined && personId === undefined;

  return (
    <DataTable
      controller={nav}
      title={title}
      subtitle={subtitle}
      density="compact"
      searchable
      reloadable
      source={fetchMeetings({ boardId, personId })}
      rowKey="id"
      columns={columnsOf(t, { boardId, pathOf })}
      filters={filtersOf(t, boardId === undefined ? boards : undefined)}
      actions={actionsOf(t, ctx)}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultSort={{ key: 'start', direction: 'desc' }}
      savedFilters={main ? savedFilters : undefined}
    />
  );
}
