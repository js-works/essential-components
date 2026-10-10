import { Anchor, Group, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataTableController,
} from '../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import { ancestorsOf, FILE_KINDS } from '../../domain';
import type { FileCriteria, FileKind, FileSortKey, Folder, MediaFile } from '../../domain';
import { formatDateTime, formatSize } from '../../shared/lib/format';
import { useQuerySource } from '../../shared/lib/useQuerySource';
import { DataTable } from '../../shared/ui/dataTable';
import { appIcons, kindIcon } from '../../shared/ui/icons';
import { browserKeys, FavoriteStar, folderPath, KIND_LABELS, useBrowserService, useEntryActions } from '../browser';

export { RecentPage };

// The days Recent starts with (its date filter, which the user may change or remove).
const RECENT_DAYS = 30;

const SORT_KEYS: readonly FileSortKey[] = ['name', 'type', 'size', 'modified', 'owner'];

// A local date (`yyyy-mm-dd`) some days before today.
function daysAgo(days: number): string {
  const date = new Date();

  date.setDate(date.getDate() - days);

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, '0'))
    .join('-');
}

// The table's state as the repository's query, over all folders: its search and filters, its sort, its page.
function toCriteria(query: DataTableComponent.Query): FileCriteria {
  const { kind, owner, modified } = query.filters as Record<string, unknown>;
  const range = modified as { from?: string; to?: string } | undefined;

  return {
    ...(query.search.trim() === '' ? {} : { text: query.search }),
    ...(Array.isArray(kind) && kind.length > 0 ? { kinds: kind as FileKind[] } : {}),
    ...(Array.isArray(owner) && owner.length > 0 ? { owners: owner as string[] } : {}),
    ...(range !== undefined && range !== null && (range.from !== undefined || range.to !== undefined)
      ? { modified: range }
      : {}),
  };
}

function toSort(query: DataTableComponent.Query) {
  const key = query.sort?.key as FileSortKey | undefined;

  return query.sort !== undefined && key !== undefined && SORT_KEYS.includes(key)
    ? { key, direction: query.sort.direction }
    : undefined;
}

const toPaging = (query: DataTableComponent.Query) => ({
  offset: (query.page - 1) * query.pageSize,
  limit: query.pageSize,
});

// The module "Recent" (2026-10-08): the files of all folders, the last modified first, from the last 30 days (a
// default filter: changed or removed like any other). A double click (or the arrow) shows a file's details; its folder
// is a link. Changes (rename, move, delete, upload) are made in Files.
function RecentPage(): ReactElement {
  const service = useBrowserService();
  const navigate = useNavigate();
  const nav = useDataTableController<MediaFile>();
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { setFavorite, showFileDetails } = useEntryActions(folders);
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  // The start of the table, fixed while it is shown (`defaultFilters` counts only at the start).
  const [defaultFilters] = useState(() => ({ modified: { from: daysAgo(RECENT_DAYS), to: daysAgo(0) } }));

  const source = useQuerySource<MediaFile>(
    (query) => browserKeys.filePage(toCriteria(query), toSort(query), toPaging(query)),
    async (query, signal) => {
      const page = await service.findFiles(toCriteria(query), toSort(query), toPaging(query), signal);

      return { rows: page.items, total: page.total };
    },
    browserKeys.files(),
    nav.reload,
  );

  const columns = useMemo((): readonly DataTableComponent.Column<MediaFile>[] => [
    {
      key: 'name',
      header: 'Name',
      width: 4,
      sortable: true,
      render: (file) => (
        <Group gap={8} wrap="nowrap" className="file-center__entry" data-kind={file.kind}>
          <Text component="span" className="file-center__kind" display="inline-flex">{kindIcon(file.kind)}</Text>
          <Text component="span" size="sm" truncate>{file.name}</Text>
          <FavoriteStar
            favorite={file.favorite === true}
            onChange={(favorite) => setFavorite([{ entry: 'file', id: file.id }], favorite)}
          />
        </Group>
      ),
    },
    {
      key: 'folderId',
      header: 'Folder',
      width: 3,
      hideable: true,
      render: (file) => <FolderLink folders={folders} id={file.folderId} />,
    },
    {
      key: 'kind',
      header: 'Kind',
      width: 1.7,
      hideable: true,
      render: (file) => KIND_LABELS[file.kind],
      filter: selectColumnFilter({
        options: FILE_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] })),
        multiple: true,
      }),
    },
    {
      key: 'size',
      header: 'Size',
      width: 1.4,
      sortable: true,
      hideable: true,
      align: 'end',
      render: (file) => formatSize(file.size),
    },
    {
      key: 'modified',
      header: 'Modified',
      width: 2.2,
      sortable: true,
      hideable: true,
      render: (file) => formatDateTime(file.modified),
      filter: dateRangeColumnFilter(),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: 2,
      sortable: true,
      hideable: true,
      filter: selectColumnFilter({ options: owners.map((owner) => ({ value: owner, label: owner })), multiple: true }),
    },
  ], [folders, owners, setFavorite]);

  const actions = useMemo((): readonly DataTableComponent.Action<MediaFile>[] => {
    return [
      // The default action (a double click): the file's details.
      {
        type: 'singleRow',
        key: 'info',
        icon: appIcons.info,
        tip: 'Details',
        show: 'both',
        default: true,
        onClick: (file) => void showFileDetails(file),
      },
      {
        type: 'singleRow',
        key: 'open-folder',
        icon: appIcons.openFolder,
        tip: 'Open folder',
        show: 'both',
        onClick: (file) => void navigate(folderPath(file.folderId)),
      },
    ];
  }, [showFileDetails, navigate]);

  return (
    <DataTable
      controller={nav}
      title="Recent"
      subtitle="The files of all folders, the last modified first. A double click shows a file's details."
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'modified', direction: 'desc' }}
      defaultFilters={defaultFilters}
      empty="No files were modified in this time."
    />
  );
}

// A file's folder: its path from the storage on ("Company share › Projects"), a link that opens the folder.
function FolderLink({ folders, id }: { folders: readonly Folder[]; id: string }): ReactElement {
  const path = ancestorsOf(folders, id).slice(1);

  return (
    <Anchor component={Link} to={folderPath(id)} size="sm" truncate>
      {path.map((ancestor) => ancestor.name).join(' › ')}
    </Anchor>
  );
}
