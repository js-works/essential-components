import { Group, Text } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useDataTableController } from '../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import { countText, formatDateTime, formatSize } from '../../shared/lib/format';
import { useQuerySource } from '../../shared/lib/useQuerySource';
import { DataTable } from '../../shared/ui/dataTable';
import { appIcons, kindIcon } from '../../shared/ui/icons';
import { browserKeys, confirmAndRun, KIND_LABELS, useBrowserService } from '../browser';
import type { TrashRow, TrashSortKey } from '../browser';

export { TrashPage };

const SORT_KEYS: readonly TrashSortKey[] = ['name', 'size', 'from', 'deletedAt', 'owner'];

function toSort(query: DataTableComponent.Query) {
  const key = query.sort?.key as TrashSortKey | undefined;

  return query.sort !== undefined && key !== undefined && SORT_KEYS.includes(key)
    ? { key, direction: query.sort.direction }
    : undefined;
}

const toPaging = (query: DataTableComponent.Query) => ({
  offset: (query.page - 1) * query.pageSize,
  limit: query.pageSize,
});

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

// The module "Trash" (2026-10-08): what was deleted in Files (a folder with everything in it, as one row), the last
// deleted first. Restore puts it back where it was; "Delete permanently" and "Empty trash" delete for good (critical
// confirmations).
function TrashPage(): ReactElement {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const nav = useDataTableController<TrashRow>();

  const source = useQuerySource<TrashRow>(
    (query) => browserKeys.trashPage(query.search, toSort(query), toPaging(query)),
    async (query, signal) => {
      const page = await service.trash(query.search, toSort(query), toPaging(query), signal);

      return { rows: page.items, total: page.total };
    },
    browserKeys.trash(),
    nav.reload,
  );

  const columns = useMemo((): readonly DataTableComponent.Column<TrashRow>[] => [
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
      render: (row) =>
        row.entry === 'folder' ? (row.size === 1 ? '1 item' : `${row.size} items`) : formatSize(row.size),
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
  ], []);

  const actions = useMemo((): readonly DataTableComponent.Action<TrashRow>[] => {
    const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

    const restore = async (rows: readonly TrashRow[]) => {
      try {
        await service.restore(rows);
      } catch (error) {
        toasts.error(errorText(error));
        return;
      }

      await changed();
      toasts.success(`${countText(rows.map((row) => row.name), 'items')} restored`);
    };

    const purge = async (rows: readonly TrashRow[]) => {
      const [first] = rows;
      const done = await confirmAndRun(
        dialogs,
        {
          title: 'Delete permanently',
          content: `${
            rows.length === 1 && first !== undefined
              ? `Delete "${first.name}" permanently?`
              : `Delete the ${rows.length} selected items permanently?`
          }${
            rows.some((row) => row.entry === 'folder') ? '\nFolders go with everything in them.' : ''
          }\nThis cannot be undone.`,
          buttons: { confirm: 'Delete' },
        },
        () => service.purge(rows),
      );

      if (done) {
        await changed();
        toasts.success(`${countText(rows.map((row) => row.name), 'items')} deleted permanently`);
      }
    };

    const empty = async () => {
      const done = await confirmAndRun(
        dialogs,
        {
          title: 'Empty trash',
          content: 'Delete everything in the trash permanently?\nThis cannot be undone.',
          buttons: { confirm: 'Empty trash' },
        },
        () => service.emptyTrash(),
      );

      if (done) {
        await changed();
        toasts.success('Trash emptied');
      }
    };

    return [
      {
        type: 'general',
        key: 'empty',
        label: 'Empty trash',
        icon: appIcons.remove,
        variant: 'danger',
        onClick: () => void empty(),
      },
      {
        type: 'multiRow',
        key: 'restore',
        label: 'Restore',
        icon: appIcons.restore,
        onClick: (rows) => void restore(rows),
      },
      {
        type: 'multiRow',
        key: 'purge',
        label: 'Delete permanently',
        icon: appIcons.remove,
        variant: 'danger',
        onClick: (rows) => void purge(rows),
      },
    ];
  }, [dialogs, toasts, service, queryClient]);

  return (
    <DataTable
      controller={nav}
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
