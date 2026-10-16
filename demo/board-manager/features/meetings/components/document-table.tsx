import {
  dateRangeFilter,
  generalAction,
  singleRowAction,
  textFilter,
  useDataTableController,
} from '@local/data-table/react';

import type { RowQuery, RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import type {
  DocumentCriteria,
  DocumentSortKey,
  Meeting,
  MeetingDocument,
  Range,
  TextMatch,
} from '../../../domain/index.js';

import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { searchText, toPaging, toSort, usePageSource } from '../../../shared/lib/table-query.js';
import { appIcons, DataTable, formatDateTime, formatSize, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';

import { deleteAction } from '../../../shared/ui/table-actions.js';
import {
  useDeleteDocumentsFlow,
  useDownloadDocumentFlow,
  useRenameDocumentFlow,
  useUploadDocumentsFlow,
} from '../document-flows.js';

import { useMeetingService } from '../context.js';
import { meetingKeys } from '../keys.js';
import { documentTypeFilter } from '../meeting-filters.js';

export { DocumentTable };

const SORT_KEYS: readonly DocumentSortKey[] = ['name', 'type', 'size', 'user', 'uploaded'];

function toCriteria(query: RowQuery): DocumentCriteria {
  const { name, type, uploaded } = query.filters as { name?: TextMatch; type?: string[]; uploaded?: Range<string> };

  return { text: searchText(query), name, types: type, uploaded };
}

function useSource(meetingId: string, reload: () => void): RowSource<MeetingDocument> {
  const service = useMeetingService();

  return usePageSource(
    meetingKeys.documents(meetingId),
    (query, signal) =>
      service.findDocuments(meetingId, toCriteria(query), toSort(query, SORT_KEYS), toPaging(query), signal),
    reload,
  );
}

function useColumns(): TableColumns<MeetingDocument> {
  const t = useTranslate();

  return [
    { key: 'name', header: t('meetings.documents.columns.document'), width: 3.5, sortable: true },
    { key: 'type', header: t('meetings.documents.columns.type'), width: 1, sortable: true },
    {
      key: 'size',
      header: t('meetings.documents.columns.size'),
      width: 1.2,
      sortable: true,
      align: 'end',
      render: (row) => formatSize(row.size),
    },
    { key: 'user', header: t('meetings.documents.columns.user'), width: 2, sortable: true },
    {
      key: 'uploaded',
      header: t('meetings.documents.columns.uploaded'),
      width: 2,
      sortable: true,
      render: (row) => formatDateTime(row.uploaded),
    },
  ];
}

const filters: TableFilters = {
  name: textFilter(),
  type: documentTypeFilter,
  uploaded: dateRangeFilter(),
};

function useActions(meeting: Meeting): TableActions<MeetingDocument> {
  const t = useTranslate();
  const uploadDocuments = useUploadDocumentsFlow(meeting);
  const downloadDocument = useDownloadDocumentFlow();
  const renameDocument = useRenameDocumentFlow();
  const deleteDocuments = useDeleteDocumentsFlow();

  return [
    generalAction('upload', uploadDocuments, {
      label: t('meetings.documents.upload'),
      icon: appIcons.upload,
      variant: 'primary',
    }),
    singleRowAction('download', downloadDocument, {
      label: t('meetings.documents.download'),
      show: 'toolbar',
      default: true,
    }),
    deleteAction(deleteDocuments, { key: 'delete-selected' }),
    singleRowAction('rename', renameDocument, {
      icon: appIcons.edit,
      tip: t('meetings.documents.renameTitle'),
      label: t('meetings.documents.rename'),
      show: 'column',
    }),
    singleRowAction('delete', (row) => deleteDocuments([row]), {
      icon: appIcons.remove,
      tip: t('meetings.documents.deleteTip'),
      show: 'column',
      contextMenu: false,
    }),
  ];
}

// The documents of the meeting (invitation, board pack, presentations, minutes): upload, download, rename, delete.
function DocumentTable({ meeting }: { meeting: Meeting }) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<MeetingDocument>();
  const columns = useColumns();
  const actions = useActions(meeting);
  const source = useSource(meeting.id, tableCtrl.reload);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('meetings.documents.title')}
      subtitle={t('meetings.documents.subtitle')}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultSort={{ key: 'uploaded', direction: 'asc' }}
    />
  );
}
