import { Group, Stack, Table } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import type { Folder } from '../../../domain';
import { ancestorsOf, childrenOf } from '../../../domain';
import { formatDateTime } from '../../../shared/lib/format';

export { FolderDetails };

// What a folder's drawer shows: the favorite's button (`favorite`), then its properties.
function FolderDetails({ folder, folders, items, favorite }: {
  folder: Folder;
  folders: readonly Folder[];
  items: number;
  favorite?: ReactNode;
}): ReactElement {
  const rows: readonly (readonly [string, string])[] = [
    ['Folder', ancestorsOf(folders, folder.id).map((ancestor) => ancestor.name).join(' › ')],
    ['Subfolders', String(childrenOf(folders, folder.id).length)],
    ['Items', String(items)],
    ['Owner', folder.owner],
    ['Created', formatDateTime(folder.created)],
  ];

  return (
    <Stack gap="md">
      {favorite !== undefined && <Group>{favorite}</Group>}
      <Table withRowBorders={false} verticalSpacing={4} horizontalSpacing={0} fz="sm">
        <Table.Tbody>
          {rows.map(([label, value]) => (
            <Table.Tr key={label}>
              <Table.Th w={110} fw={500} c="dimmed">{label}</Table.Th>
              <Table.Td style={{ overflowWrap: 'anywhere' }}>{value}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
