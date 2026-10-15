import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import type { RowQuery, SavedFilter } from '@local/data-table/react';
import { Anchor, Group, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { ancestorsOf } from '../../domain/index.js';
import type { FileCriteria, FileKind, FileSortKey, Folder, MediaFile } from '../../domain/index.js';
import { formatDateTime, formatSize } from '../../shared/lib/format.js';
import { useQuerySource } from '../../shared/lib/useQuerySource.js';
import { DataTable } from '../../shared/ui/dataTable.js';
import { appIcons, kindIcon } from '../../shared/ui/icons.js';
import { daysFromToday, sharedBy, useSavedFilters } from '../../shared/ui/savedFilters.js';
import {
  browserKeys,
  FavoriteStar,
  fileKindFilter,
  folderPath,
  KIND_LABELS,
  ownerFilter,
  useBrowserService,
  useEntryActions,
} from '../browser/index.js';
import type { EntryActions } from '../browser/index.js';

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
function toCriteria(query: RowQuery): FileCriteria {
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

function toSort(query: RowQuery) {
  const key = query.sort?.key as FileSortKey | undefined;

  return query.sort !== undefined && key !== undefined && SORT_KEYS.includes(key)
    ? { key, direction: query.sort.direction }
    : undefined;
}

const toPaging = (query: RowQuery) => ({
  offset: (query.page - 1) * query.pageSize,
  limit: query.pageSize,
});

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Ben Carter', 'This week', { modified: { from: daysFromToday(-7), to: daysFromToday(0) } }),
  sharedBy('Anna Schröder', 'Media', { kind: ['image', 'video', 'audio'] }),
];

// The columns of Recent (the folder of a file: from `folders`).
const columnsOf = ({ setFavorite }: EntryActions, folders: readonly Folder[]) =>
  defineColumns<MediaFile>([
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
    },
    {
      key: 'owner',
      header: 'Owner',
      width: 2,
      sortable: true,
      hideable: true,
    },
  ]);

// The filters of Recent (the owners: those there are).
const filtersOf = (owners: readonly string[]) =>
  defineFilters({ kind: fileKindFilter, modified: dateRangeFilter(), owner: ownerFilter(owners) });

// The actions of Recent: a file's details (the default action), open its folder.
const actionsOf = ({ showFileDetails }: EntryActions, navigate: NavigateFunction) =>
  defineActions<MediaFile>([
    singleRowAction('info', showFileDetails, { icon: appIcons.info, tip: 'Details', show: 'both', default: true }),
    singleRowAction('open-folder', (file) => navigate(folderPath(file.folderId)), {
      icon: appIcons.openFolder,
      tip: 'Open folder',
      show: 'both',
    }),
  ]);

// The module "Recent" (2026-10-08): the files of all folders, the last modified first, from the last 30 days (a
// default filter: changed or removed like any other). A double click (or the arrow) shows a file's details; its folder
// is a link. Changes (rename, move, delete, upload) are made in Files.
function RecentPage(): ReactElement {
  const service = useBrowserService();
  const navigate = useNavigate();
  const nav = useDataTableController<MediaFile>();
  const savedFilters = useSavedFilters('file-center:saved-filters:recent', COLLEAGUES_FILTERS);
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  const entries = useEntryActions(folders);
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

  return (
    <DataTable
      controller={nav}
      title="Recent"
      subtitle="The files of all folders, the last modified first. A double click shows a file's details."
      source={source}
      rowKey="id"
      columns={columnsOf(entries, folders)}
      filters={filtersOf(owners)}
      actions={actionsOf(entries, navigate)}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
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
