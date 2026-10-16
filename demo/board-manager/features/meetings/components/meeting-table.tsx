import { dateRangeFilter, singleRowAction, textFilter, useDataTableController } from '@local/data-table/react';
import type {
  RowQuery,
  RowSource,
  SavedFilter,
  TableActions,
  TableColumn,
  TableColumns,
  TableFilters,
} from '@local/data-table/react';

import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import type {
  MeetingCriteria,
  MeetingSortKey,
  MeetingStatus,
  MeetingSummary,
  MinutesState,
  Range,
  TextMatch,
} from '../../../domain/index.js';

import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { searchText, toPaging, toSort, usePageSource } from '../../../shared/lib/table-query.js';
import { DataTable, formatDateTime, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { daysFromToday, sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { boardFilter } from '../../boards/filters/board-filters.js';
import { useBoardList } from '../../boards/reads.js';
import { useMeetingService } from '../context.js';
import { meetingKeys } from '../keys.js';
import { meetingStatusFilter, minutesFilter } from '../meeting-filters.js';
import {
  useCancelMeetingFlow,
  useCreateMeetingFlow,
  useDeleteMeetingsFlow,
  useEditMeetingFlow,
} from '../meeting-flows.js';
import { MinutesBadge, StatusBadge } from './meeting-badges.js';

export { MeetingTable };

// A meeting as a row: `chair` and `created` are always empty, their columns are there only for their filters, for the
// look (2026-10-11).
type MeetingRow = MeetingSummary & { chair: ''; created: '' };

const SORT_KEYS: readonly MeetingSortKey[] = ['start', 'title', 'board', 'status', 'items', 'documents'];

// The filters `chair` and `created` are not asked for (see `MeetingRow`).
function toCriteria(query: RowQuery, boardId: string | undefined, personId: string | undefined): MeetingCriteria {
  const { start, title, board, location, status, minutesApproved } = query.filters as {
    start?: Range<string>;
    title?: TextMatch;
    board?: string[];
    location?: TextMatch;
    status?: MeetingStatus[];
    minutesApproved?: MinutesState[];
  };

  return {
    boardId,
    personId,
    text: searchText(query),
    title,
    location,
    boards: board,
    statuses: status,
    minutes: minutesApproved,
    start,
  };
}

function useSource(
  boardId: string | undefined,
  personId: string | undefined,
  reload: () => void,
): RowSource<MeetingRow> {
  const service = useMeetingService();

  return usePageSource(
    [...meetingKeys.all, 'meetings', boardId ?? '', personId ?? ''],
    async (query, signal) => {
      const page = await service.find(
        toCriteria(query, boardId, personId),
        toSort(query, SORT_KEYS),
        toPaging(query),
        signal,
      );

      return { ...page, items: page.items.map((meeting) => ({ ...meeting, chair: '', created: '' })) };
    },
    reload,
  );
}

// The colleagues' shared filters of the meetings list (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Minutes to approve', { status: ['Held'], minutesApproved: ['draft'] }),
  sharedBy('Jonas Weber', 'Planned, next 90 days', {
    status: ['Planned'],
    start: { from: daysFromToday(0), to: daysFromToday(90) },
  }),
  sharedBy('Lena Hoffmann', 'Supervisory Board', { board: ['Supervisory Board'] }),
];

// Which meetings a list shows: of a board, of a person's boards, or (neither) of all boards; and where a meeting
// opens.
type MeetingList = {
  boardId?: string;
  personId?: string;
  pathOf: (meeting: { id: string; boardId: string }) => string;
};

function useColumns({ boardId, pathOf }: MeetingList): TableColumns<MeetingRow> {
  const t = useTranslate();

  return [
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
  ];
}

function useFilters(boardId: string | undefined): TableFilters {
  const t = useTranslate();
  const boards = useBoardList();

  return {
    start: dateRangeFilter(),
    title: textFilter(),
    ...(boardId === undefined ? { board: boardFilter(boards) } : {}),
    location: textFilter(),
    status: meetingStatusFilter(t),
    minutesApproved: minutesFilter(t),
    chair: textFilter(),
    created: dateRangeFilter(),
  };
}

function useActions(list: MeetingList): TableActions<MeetingRow> {
  const t = useTranslate();
  const navigate = useNavigate();
  const createMeeting = useCreateMeetingFlow(list);
  const editMeeting = useEditMeetingFlow();
  const cancelMeeting = useCancelMeetingFlow();
  const deleteMeetings = useDeleteMeetingsFlow();

  return [
    newAction(t('meetings.new'), createMeeting),
    openAction((row) => navigate(list.pathOf(row))),
    editAction(editMeeting),
    singleRowAction('cancel', cancelMeeting, { label: t('meetings.cancel'), show: 'toolbar' }),
    deleteAction(deleteMeetings),
  ];
}

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
) {
  const tableCtrl = useDataTableController<MeetingRow>();
  const columns = useColumns({ boardId, pathOf });
  const filters = useFilters(boardId);
  const actions = useActions({ boardId, personId, pathOf });
  // Saved filters only in the Meetings module (2026-10-11, the user's wish: not on a board's or a member's page).
  const savedFilters = useSavedFilters('board-manager:saved-filters:meetings', COLLEAGUES_FILTERS);
  const main = boardId === undefined && personId === undefined;
  const source = useSource(boardId, personId, tableCtrl.reload);

  return (
    <DataTable
      controller={tableCtrl}
      title={title}
      subtitle={subtitle}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultSort={{ key: 'start', direction: 'desc' }}
      savedFilters={main ? savedFilters : undefined}
    />
  );
}
