import { useNavigate } from '@tanstack/react-router';

import type { RowSource, TableActions, TableColumn, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, singleRowAction, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { MeetingCriteria, MeetingSummary } from '../../domain/index.js';
import { MEETING_SORT_KEYS } from '../../domain/index.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { formatDateTime, PAGE_SIZE_OPTIONS } from '../../shared/shared.js';
import { useBoardList } from '../boards/board-data.js';
import { boardFilter } from '../boards/board-filters.js';
import { MinutesBadge, StatusBadge } from './meeting-components.js';
import { useMeetingService } from './meeting-data.js';
import { meetingStatusFilter, minutesFilter } from './meeting-filters.js';
import { useCancelMeetingFlow, useMeetingFlows } from './meeting-flows.js';

export { MeetingTable };

function useSource(boardId: string | undefined, personId: string | undefined): RowSource<MeetingSummary> {
  const service = useMeetingService();
  const toCriteria = criteriaOf<MeetingCriteria>('text');

  return useFindSource(
    ['meetings', 'meetings', boardId ?? '', personId ?? ''],
    MEETING_SORT_KEYS,
    (query) => ({ ...toCriteria(query), boardId, personId }),
    service.find,
  );
}

// Which meetings a list shows: of a board, of a person's boards, or (neither) of all boards.
type MeetingList = {
  boardId?: string;
  personId?: string;
};

function useColumns({ boardId }: MeetingList): TableColumns<MeetingSummary> {
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
      render: (row) => (
        <AnchorLink to="/meetings/$meetingId" params={{ meetingId: row.id }} size="sm">{row.title}</AnchorLink>
      ),
    },
    ...(boardId === undefined
      ? [
        {
          key: 'board',
          header: t('meetings.columns.board'),
          width: 2.5,
          sortable: true,
          hideable: true,
        } satisfies TableColumn<MeetingSummary>,
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
  };
}

function useActions(list: MeetingList): TableActions<MeetingSummary> {
  const { deleteAction, editAction, newAction, openAction } = useTableActions();
  const t = useTranslate();
  const navigate = useNavigate();
  const flows = useMeetingFlows(list);
  const cancelMeeting = useCancelMeetingFlow();

  return [
    newAction(t('meetings.new'), flows.create),
    openAction((row) => navigate({ to: '/meetings/$meetingId', params: { meetingId: row.id } })),
    editAction(flows.edit),
    singleRowAction('cancel', cancelMeeting, { label: t('meetings.cancel'), show: 'toolbar' }),
    deleteAction(flows.remove),
  ];
}

type MeetingTableProps = {
  boardId?: string;
  personId?: string;
  title: string;
  subtitle: string;
};

function MeetingTable({ boardId, personId, title, subtitle }: MeetingTableProps) {
  const source = useSource(boardId, personId);
  const columns = useColumns({ boardId });
  const filters = useFilters(boardId);
  const actions = useActions({ boardId, personId });
  const savedFilters = useSavedTableFilters('meetings');
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
