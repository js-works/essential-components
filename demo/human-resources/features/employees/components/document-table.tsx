import { Group } from '@mantine/core';

import type { TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { dateRangeFilter, generalAction, singleRowAction } from '@local/data-table/react';

import type { Employee, EmployeeDocument } from '../../../domain/index.js';
import { formatSize, formatStamp } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { deleteAction } from '../../../shared/ui/table-actions.js';
import { useTableSource } from '../../hr/index.js';
import { documentCategoryFilter } from '../employee-filters.js';
import { useDownloadDocumentFlow, useRemoveDocumentsFlow, useUploadDocumentsFlow } from '../employee-flows.js';

export { DocumentTable };

function useColumns(): TableColumns<EmployeeDocument> {
  const t = useTranslate();

  return [
    {
      key: 'name',
      header: t('documents.name'),
      width: 4,
      sortable: true,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          {appIcons.documents}
          <span>{row.name}</span>
        </Group>
      ),
    },
    {
      key: 'category',
      header: t('documents.category'),
      width: 1.6,
      sortable: true,
      render: (row) => t(`documentCategory.${row.category}`),
    },
    {
      key: 'size',
      header: t('documents.size'),
      width: 1,
      align: 'end',
      sortable: true,
      render: (row) => formatSize(row.size),
    },
    {
      key: 'uploaded',
      header: t('documents.uploaded'),
      width: 2,
      sortable: true,
      render: (row) => formatStamp(row.uploaded),
    },
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();

  return { category: documentCategoryFilter(t), uploaded: dateRangeFilter() };
}

function useActions(employee: Employee): TableActions<EmployeeDocument> {
  const t = useTranslate();
  const uploadDocuments = useUploadDocumentsFlow();
  const removeDocuments = useRemoveDocumentsFlow();
  const downloadDocument = useDownloadDocumentFlow();

  return [
    generalAction('upload', () => uploadDocuments(employee), {
      label: t('documents.upload'),
      icon: appIcons.upload,
      variant: 'primary',
    }),
    singleRowAction('download', downloadDocument, {
      icon: appIcons.download,
      tip: t('documents.download'),
      show: 'column',
      default: true,
    }),
    singleRowAction('delete', (row) => removeDocuments([row]), {
      icon: appIcons.remove,
      tip: t('common.delete'),
      show: 'column',
    }),
    deleteAction((rows) => removeDocuments(rows), { key: 'deleteMany' }),
  ];
}

// The documents of an employee's records: upload (a category and files), download (not in the demo), delete.
function DocumentTable({ employee }: { employee: Employee }) {
  const t = useTranslate();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(employee);
  const source = useTableSource<EmployeeDocument>(
    `documents:${employee.id}`,
    (data) => data.documents.filter((document) => document.employeeId === employee.id),
    {
      search: ['name'],
    },
  );

  return (
    <DataTable
      title={t('documents.title')}
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'uploaded', direction: 'desc' }}
    />
  );
}
