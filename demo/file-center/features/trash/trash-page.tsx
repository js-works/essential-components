import { generalAction, multiRowAction, useDataTableController } from '@local/data-table/react';
import type { RowQuery, TableActions, TableColumns } from '@local/data-table/react';
import { Group, Text } from '@mantine/core';
import { formatDateTime, formatSize } from '../../shared/lib/format.js';
import { useQuerySource } from '../../shared/lib/use-query-source.js';
import { DataTable } from '../../shared/ui/data-table.js';
import { appIcons, kindIcon } from '../../shared/ui/icons.js';
import { browserKeys, KIND_LABELS, useBrowserService } from '../browser/index.js';
import type { TrashRow, TrashSortKey } from '../browser/index.js';
import { useEmptyTrashFlow, usePurgeFlow, useRestoreFlow } from './trash-flows.js';

export { TrashPage };

const SORT_KEYS: readonly TrashSortKey[] = ['name', 'size', 'from', 'deletedAt', 'owner'];

function toSort(query: RowQuery) {
  const key = query.sort?.key as TrashSortKey | undefined;

  return query.sort !== undefined && key !== undefined && SORT_KEYS.includes(key)
    ? { key, direction: query.sort.direction }
    : undefined;
}

const toPaging = (query: RowQuery) => ({
  offset: (query.page - 1) * query.pageSize,
  limit: query.pageSize,
});

const columns: TableColumns<TrashRow> = [
  {
    key: 'name',
    header: 'Name',
    width: 4,
    sortable: true,
    render: (row) => (
      <Group gap={8} wrap="nowrap" className="file-center__entry" data-kind={row.kind}>
        {row.kind === 'folder'
          ? (
            <Text component="span" c="var(--mantine-primary-color-filled)" display="inline-flex">
              {appIcons.folder}
            </Text>
          )
          : <Text component="span" className="file-center__kind" display="inline-flex">{kindIcon(row.kind)}</Text>}
        <Text component="span" size="sm" truncate>{row.name}</Text>
      </Group>
    ),
  },
  { key: 'from', header: 'Deleted from', width: 3, sortable: true, hideable: true },
  {
    key: 'kind',
    header: 'Kind',
    width: 1.7,
    hideable: true,
    render: (row) => (row.kind === 'folder' ? 'Folder' : KIND_LABELS[row.kind]),
  },
  {
    key: 'size',
    header: 'Size',
    width: 1.4,
    sortable: true,
    hideable: true,
    align: 'end',
    render: (row) => row.entry === 'folder' ? (row.size === 1 ? '1 item' : `${row.size} items`) : formatSize(row.size),
  },
  {
    key: 'deletedAt',
    header: 'Deleted',
    width: 2.2,
    sortable: true,
    hideable: true,
    render: (row) => formatDateTime(row.deletedAt),
  },
  { key: 'owner', header: 'Owner', width: 2, sortable: true, hideable: true },
];

function useActions(): TableActions<TrashRow> {
  const emptyTrash = useEmptyTrashFlow();
  const restore = useRestoreFlow();
  const purge = usePurgeFlow();

  return [
    generalAction('empty', emptyTrash, { label: 'Empty trash', icon: appIcons.remove, variant: 'danger' }),
    multiRowAction('restore', restore, { label: 'Restore', icon: appIcons.restore }),
    multiRowAction('purge', purge, { label: 'Delete permanently', icon: appIcons.remove, variant: 'danger' }),
  ];
}

// The module "Trash" (2026-10-08): what was deleted in Files (a folder with everything in it, as one row), the last
// deleted first. Restore puts it back where it was; "Delete permanently" and "Empty trash" delete for good (critical
// confirmations).
function TrashPage() {
  const service = useBrowserService();
  const tableCtrl = useDataTableController<TrashRow>();
  const actions = useActions();

  const source = useQuerySource<TrashRow>(
    (query) => browserKeys.trashPage(query.search, toSort(query), toPaging(query)),
    async (query, signal) => {
      const page = await service.trash(query.search, toSort(query), toPaging(query), signal);

      return { rows: page.items, total: page.total };
    },
    browserKeys.trash(),
    tableCtrl.reload,
  );

  return (
    <DataTable
      controller={tableCtrl}
      title="Trash"
      subtitle="What was deleted in Files, the last deleted first. Restore puts it back where it was."
      source={source}
      rowKey="key"
      columns={columns}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'deletedAt', direction: 'desc' }}
      empty="The trash is empty."
    />
  );
}
