import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, generalAction, singleRowAction, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { DataTable, useTableActions } from '@local/micro-app';

import type { DocumentCriteria, Meeting, MeetingDocument } from '../../domain/index.js';
import { DOCUMENT_SORT_KEYS } from '../../domain/index.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { appIcons, formatDateTime, formatSize, PAGE_SIZE_OPTIONS } from '../../shared/shared.js';
import {
  useDeleteDocumentsFlow,
  useDownloadDocumentFlow,
  useRenameDocumentFlow,
  useUploadDocumentsFlow,
} from './document-flows.js';
import { useMeetingService } from './meeting-data.js';
import { documentTypeFilter } from './meeting-filters.js';

export { DocumentTable };

function useSource(meeting: Meeting): RowSource<MeetingDocument> {
  const service = useMeetingService();

  return useFindSource(
    ['meetings', 'documents', meeting.id],
    DOCUMENT_SORT_KEYS,
    criteriaOf<DocumentCriteria>('text'),
    (...args) => service.findDocuments(meeting.id, ...args),
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

function useFilters(): TableFilters {
  const t = useTranslate();

  return {
    name: textFilter(),
    types: { label: t('meetings.documents.columns.type'), filter: documentTypeFilter },
    uploaded: dateRangeFilter(),
  };
}

function useActions(meeting: Meeting): TableActions<MeetingDocument> {
  const { deleteAction } = useTableActions();
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

function DocumentTable({ meeting }: { meeting: Meeting }) {
  const t = useTranslate();
  const source = useSource(meeting);
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(meeting);

  return (
    <DataTable
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
