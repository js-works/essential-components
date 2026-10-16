import { Anchor, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ROOT_ID } from '../../../domain/index.js';
import { FolderTable } from '../components/folder-table.js';
import { folderPath, useBrowserService } from '../context.js';
import { browserKeys } from '../keys.js';

export { FolderPage };

// A folder's contents: its subfolders first, then its files, in one table. A double click (or the arrow) opens a
// folder, or a file's details. New folders and uploads go into this folder.
function FolderPage() {
  const folderId = useParams()['folderId'] ?? ROOT_ID;
  const service = useBrowserService();
  const { data: folders } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  const folder = folders?.find((candidate) => candidate.id === folderId);

  if (folders === undefined) {
    return <></>;
  }

  if (folder === undefined) {
    return (
      <Stack gap={4} p="md">
        <Text fw={600}>This folder does not exist (anymore).</Text>
        <Anchor component={Link} to={folderPath(ROOT_ID)} size="sm">Back to Files</Anchor>
      </Stack>
    );
  }

  // A new table per folder: its page, search and filters start fresh.
  return <FolderTable key={folder.id} folder={folder} folders={folders} owners={owners} />;
}
