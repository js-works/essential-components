import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';

import type { RowSource, TableActions, TableColumn, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, singleRowAction, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';

import type { MeetingCriteria, MeetingSummary, Page } from '../../../domain/index.js';
import { MEETING_SORT_KEYS } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDateTime, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { useSavedFilters } from '../../../shared/ui/saved-filters.js';
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

// The filters `chair` and `created` are passed on, and the meetings' repository ignores them (see `MeetingRow`).
function useSource(boardId: string | undefined, personId: string | undefined): RowSource<MeetingRow> {
  const service = useMeetingService();
  const toCriteria = criteriaOf<MeetingCriteria>('text');

  return useFindSource(
    [...meetingKeys.all, 'meetings', boardId ?? '', personId ?? ''],
    MEETING_SORT_KEYS,
    (query) => ({ ...toCriteria(query), boardId, personId }),
    async (...args): Promise<Page<MeetingRow>> => {
      const page = await service.find(...args);

      return { ...page, items: page.items.map((meeting) => ({ ...meeting, chair: '', created: '' })) };
    },
  );
}

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
    ...(boardId === undefined ? { boards: { label: t('meetings.columns.board'), filter: boardFilter(boards) } } : {}),
    location: textFilter(),
    statuses: { label: t('meetings.columns.status'), filter: meetingStatusFilter(t) },
    minutes: { label: t('meetings.columns.minutes'), filter: minutesFilter(t) },
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
  const source = useSource(boardId, personId);
  const columns = useColumns({ boardId, pathOf });
  const filters = useFilters(boardId);
  const actions = useActions({ boardId, personId, pathOf });
  // Saved filters only in the Meetings module (2026-10-11, the user's wish: not on a board's or a member's page).
  const savedFilters = useSavedFilters('meetings');
  const main = boardId === undefined && personId === undefined;

  return (
    <DataTable
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
