import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  generalAction,
  singleRowAction,
  textFilter,
  useDataTableController,
} from '@local/data-table/react';
import { useDialogs, useToast } from '@local/overlays/react';
import type { ReactElement } from 'react';
import type { Meeting, MeetingDocument } from '../../../domain/index.js';
import { fetchDocuments } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { appIcons, DataTable, formatDateTime, formatSize, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { deleteAction } from '../../../shared/ui/tableActions.js';
import { documentTypeFilter } from '../filters.js';
import { deleteDocumentsFlow, downloadDocumentFlow, renameDocumentFlow, uploadDocumentsFlow } from './documentFlows.js';
import type { DocumentContext } from './documentFlows.js';

export { DocumentTable };

// The columns of a meeting's documents, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<MeetingDocument>([
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
  ]);

// The filters of a meeting's documents (none of them has texts of its own).
const filters = defineFilters({
  name: textFilter(),
  type: documentTypeFilter,
  uploaded: dateRangeFilter(),
});

// The actions of a meeting's documents: upload, download (the default action), delete the selected ones; in the rows
// rename and delete.
const actionsOf = (t: Translate, ctx: DocumentContext) =>
  defineActions<MeetingDocument>([
    generalAction('upload', () => uploadDocumentsFlow(ctx), {
      label: t('meetings.documents.upload'),
      icon: appIcons.upload,
      variant: 'primary',
    }),
    singleRowAction('download', () => downloadDocumentFlow(ctx), {
      label: t('meetings.documents.download'),
      show: 'toolbar',
      default: true,
    }),
    deleteAction((rows) => deleteDocumentsFlow(ctx, rows), { key: 'delete-selected' }),
    singleRowAction('rename', (row) => renameDocumentFlow(ctx, row), {
      icon: appIcons.edit,
      tip: t('meetings.documents.renameTitle'),
      label: t('meetings.documents.rename'),
      show: 'column',
    }),
    singleRowAction('delete', (row) => deleteDocumentsFlow(ctx, [row]), {
      icon: appIcons.remove,
      tip: t('meetings.documents.deleteTip'),
      show: 'column',
      contextMenu: false,
    }),
  ]);

// The documents of the meeting (invitation, board pack, presentations, minutes): upload, download, rename, delete.
function DocumentTable({ meeting }: { meeting: Meeting }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<MeetingDocument>();
  const ctx = { dialogs: useDialogs(), toasts: useToast(), nav, meeting };

  return (
    <DataTable
      controller={nav}
      title={t('meetings.documents.title')}
      subtitle={t('meetings.documents.subtitle')}
      density="compact"
      searchable
      reloadable
      source={fetchDocuments(meeting.id)}
      rowKey="id"
      columns={columnsOf(t)}
      filters={filters}
      actions={actionsOf(t, ctx)}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultSort={{ key: 'uploaded', direction: 'asc' }}
    />
  );
}
