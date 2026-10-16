import {
  dateRangeFilter,
  generalAction,
  singleRowAction,
  textFilter,
  useDataTableController,
} from '@local/data-table/react';

import type { TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import type { Meeting, MeetingDocument } from '../../../domain/index.js';
import { fetchDocuments } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import {
  appIcons,
  DataTable,
  formatDateTime,
  formatSize,
  PAGE_SIZE_OPTIONS,
  useReloadOnChange,
} from '../../../shared/shared.js';

import { deleteAction } from '../../../shared/ui/table-actions.js';
import {
  useDeleteDocumentsFlow,
  useDownloadDocumentFlow,
  useRenameDocumentFlow,
  useUploadDocumentsFlow,
} from '../document-flows.js';

import { documentTypeFilter } from '../meeting-filters.js';

export { DocumentTable };

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

  useReloadOnChange(tableCtrl);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('meetings.documents.title')}
      subtitle={t('meetings.documents.subtitle')}
      density="compact"
      searchable
      reloadable
      source={fetchDocuments(meeting.id)}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultSort={{ key: 'uploaded', direction: 'asc' }}
    />
  );
}
