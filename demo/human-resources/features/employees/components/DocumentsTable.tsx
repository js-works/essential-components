import { Group } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataTableController,
} from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { DOCUMENT_CATEGORIES } from '../../../domain';
import type { Employee, EmployeeDocument } from '../../../domain';
import { formatSize, formatStamp } from '../../../shared/lib/format';
import { translate, useTranslate } from '../../../shared/lib/i18n';
import { oneOf, within } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { useTableSource } from '../../hr';
import { useEmployeeFlows } from '../flows';

export { DocumentsTable };

// The documents of an employee's records: upload (a category and files), download (not in the demo), delete.
function DocumentsTable({ employee }: { employee: Employee }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<EmployeeDocument>();
  const flows = useEmployeeFlows();
  const toasts = useToast();
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

  const columns = useMemo((): readonly DataTableComponent.Column<EmployeeDocument>[] => [
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
      filter: selectColumnFilter({
        options: DOCUMENT_CATEGORIES.map((value) => ({ value, label: t(`documentCategory.${value}`) })),
        multiple: true,
      }),
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
      filter: dateRangeColumnFilter(),
    },
  ], [t]);

  const actions = useMemo((): readonly DataTableComponent.Action<EmployeeDocument>[] => [
    {
      type: 'general',
      key: 'upload',
      label: t('documents.upload'),
      icon: appIcons.upload,
      variant: 'primary',
      onClick: () => void flows.uploadDocuments(employee),
    },
    {
      type: 'singleRow',
      key: 'download',
      icon: appIcons.download,
      tip: t('documents.download'),
      show: 'column',
      default: true,
      onClick: () => toasts.warn(translate('documents.notInDemo')),
    },
    {
      type: 'singleRow',
      key: 'delete',
      icon: appIcons.remove,
      tip: t('common.delete'),
      show: 'column',
      onClick: (row) => void flows.removeDocuments([row]),
    },
    {
      type: 'multiRow',
      key: 'deleteMany',
      label: t('common.delete'),
      icon: appIcons.remove,
      variant: 'danger',
      onClick: (rows) => void flows.removeDocuments(rows),
    },
  ], [t, flows, employee, toasts]);

  return (
    <DataTable
      controller={nav}
      title={t('documents.title')}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'uploaded', direction: 'desc' }}
    />
  );
}
