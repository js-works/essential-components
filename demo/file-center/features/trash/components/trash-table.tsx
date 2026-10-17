import { Group, Text } from '@mantine/core';

import type { RowSource, TableActions, TableColumns } from '@local/data-table/react';
import { generalAction, multiRowAction } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { DataTable } from '@local/micro-app';

import { formatDateTime, formatSize } from '../../../shared/lib/format.js';
import { appIcons, kindIcon } from '../../../shared/ui/icons.js';
import type { TrashRow } from '../../browser/index.js';
import { browserKeys, KIND_LABELS, TRASH_SORT_KEYS, useBrowserService } from '../../browser/index.js';
import { useEmptyTrashFlow, usePurgeFlow, useRestoreFlow } from '../trash-flows.js';

export { TrashTable };

function useSource(): RowSource<TrashRow> {
  const service = useBrowserService();

  return useFindSource(browserKeys.trash(), TRASH_SORT_KEYS, (query) => query.search, service.trash);
}

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

function TrashTable() {
  const source = useSource();
  const actions = useActions();

  return (
    <DataTable
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
