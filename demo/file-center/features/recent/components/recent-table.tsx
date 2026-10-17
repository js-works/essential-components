import { Group, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, singleRowAction } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useSavedTableFilters } from '@local/micro-app';

import type { FileCriteria, Folder, MediaFile } from '../../../domain/index.js';
import { ancestorsOf, FILE_SORT_KEYS } from '../../../domain/index.js';
import { formatDateTime, formatSize } from '../../../shared/lib/format.js';
import { appIcons, kindIcon } from '../../../shared/ui/icons.js';
import {
  browserKeys,
  FavoriteStar,
  fileKindFilter,
  folderLink,
  KIND_LABELS,
  ownerFilter,
  useBrowserService,
  useSetFavoriteFlow,
  useShowFileDetailsFlow,
} from '../../browser/index.js';

export { RecentTable };

const RECENT_DAYS = 30;

function daysAgo(days: number): string {
  const date = new Date();

  date.setDate(date.getDate() - days);

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, '0'))
    .join('-');
}

function useSource(): RowSource<MediaFile> {
  const service = useBrowserService();

  return useFindSource(
    browserKeys.files(),
    FILE_SORT_KEYS,
    criteriaOf<FileCriteria>('text'),
    service.findFiles,
  );
}

function useColumns(folders: readonly Folder[]): TableColumns<MediaFile> {
  const setFavorite = useSetFavoriteFlow();

  return [
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
  ];
}

function useFilters(owners: readonly string[]): TableFilters {
  return {
    kinds: { label: 'Kind', filter: fileKindFilter },
    modified: dateRangeFilter(),
    owners: { label: 'Owner', filter: ownerFilter(owners) },
  };
}

function useActions(folders: readonly Folder[]): TableActions<MediaFile> {
  const navigate = useNavigate();
  const showFileDetails = useShowFileDetailsFlow(folders);

  return [
    singleRowAction('info', showFileDetails, { icon: appIcons.info, tip: 'Details', show: 'both', default: true }),
    singleRowAction('open-folder', (file) => navigate(folderLink(file.folderId)), {
      icon: appIcons.openFolder,
      tip: 'Open folder',
      show: 'both',
    }),
  ];
}

function RecentTable() {
  const source = useSource();
  const service = useBrowserService();
  const savedFilters = useSavedTableFilters('recent');
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  const columns = useColumns(folders);
  const filters = useFilters(owners);
  const actions = useActions(folders);
  // The start of the table, fixed while it is shown (`defaultFilters` counts only at the start).
  const [defaultFilters] = useState(() => ({ modified: { from: daysAgo(RECENT_DAYS), to: daysAgo(0) } }));

  return (
    <DataTable
      title="Recent"
      subtitle="The files of all folders, the last modified first. A double click shows a file's details."
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
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

function FolderLink({ folders, id }: { folders: readonly Folder[]; id: string }) {
  const path = ancestorsOf(folders, id).slice(1);

  return (
    <AnchorLink {...folderLink(id)} size="sm" truncate>
      {path.map((ancestor) => ancestor.name).join(' › ')}
    </AnchorLink>
  );
}
