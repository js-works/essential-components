import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  generalAction,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import { Group } from '@mantine/core';
import type { ReactElement } from 'react';
import type { Employee, EmployeeDocument } from '../../../domain/index.js';
import { formatSize, formatStamp } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { oneOf, within } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { deleteAction } from '../../../shared/ui/tableActions.js';
import { useTableSource } from '../../hr/index.js';
import { documentCategoryFilter } from '../filters.js';
import { useEmployeeFlows } from '../flows.js';
import type { EmployeeFlows } from '../flows.js';

export { DocumentTable };

// The columns of an employee's documents, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<EmployeeDocument>([
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
  ]);

// The filters of an employee's documents.
const filtersOf = (t: Translate) => defineFilters({ category: documentCategoryFilter(t), uploaded: dateRangeFilter() });

// The actions of an employee's documents: upload, download (the default action, not in the demo), delete one (in its
// row) or the selected ones.
const actionsOf = (t: Translate, flows: EmployeeFlows, employee: Employee) =>
  defineActions<EmployeeDocument>([
    generalAction('upload', () => flows.uploadDocuments(employee), {
      label: t('documents.upload'),
      icon: appIcons.upload,
      variant: 'primary',
    }),
    singleRowAction('download', flows.downloadDocument, {
      icon: appIcons.download,
      tip: t('documents.download'),
      show: 'column',
      default: true,
    }),
    singleRowAction('delete', (row) => flows.removeDocuments([row]), {
      icon: appIcons.remove,
      tip: t('common.delete'),
      show: 'column',
    }),
    deleteAction((rows) => flows.removeDocuments(rows), { key: 'deleteMany' }),
  ]);

// The documents of an employee's records: upload (a category and files), download (not in the demo), delete.
function DocumentTable({ employee }: { employee: Employee }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<EmployeeDocument>();
  const flows = useEmployeeFlows();
  const source = useTableSource<EmployeeDocument>(
    `documents:${employee.id}`,
    (data) => data.documents.filter((document) => document.employeeId === employee.id),
    {
      search: ['name'],
      filters: {
        category: (row, value) => oneOf(row.category, value),
        uploaded: (row, value) => within(row.uploaded, value),
      },
    },
    nav.reload,
  );

  return (
    <DataTable
      controller={nav}
      title={t('documents.title')}
      source={source}
      rowKey="id"
      columns={columnsOf(t)}
      filters={filtersOf(t)}
      actions={actionsOf(t, flows, employee)}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'uploaded', direction: 'desc' }}
    />
  );
}
