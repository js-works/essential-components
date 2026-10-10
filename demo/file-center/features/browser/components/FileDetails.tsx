import { Badge, Center, Group, Stack, Table, Text } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import type { FileDetails as Details, Folder, MediaFile } from '../../../domain';
import { ancestorsOf } from '../../../domain';
import { formatDateTime, formatSize } from '../../../shared/lib/format';
import { kindIcon } from '../../../shared/ui/icons';

export { FileDetails };

// The hue of a file's preview, from its id: the same file, the same colors.
function hueOf(id: string): number {
  let hash = 0;

  for (const char of id) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }

  return hash % 360;
}

// The content of a file's drawer: a preview (made up: there is no real content behind the files; an image gets a
// colored picture, every other kind its icon), the favorite's button (`favorite`), then its properties and its tags.
function FileDetails({ file, details, folders, favorite }: {
  file: MediaFile;
  details: Details;
  folders: readonly Folder[];
  favorite?: ReactNode;
}): ReactElement {
  const hue = hueOf(file.id);
  const rows: readonly (readonly [string, string | undefined])[] = [
    ['Type', `${file.type} (${file.kind})`],
    ['Size', formatSize(file.size)],
    ['Dimensions', details.dimensions],
    ['Duration', details.duration],
    ['Folder', ancestorsOf(folders, file.folderId).map((folder) => folder.name).join(' › ')],
    ['Owner', file.owner],
    ['Modified', formatDateTime(file.modified)],
    ['Versions', String(details.versions)],
    ['Downloads', String(details.downloads)],
    ['Checksum', details.checksum],
  ];

  return (
    <Stack gap="md">
      <Center
        className="file-center__preview"
        data-kind={file.kind}
        style={{
          background: file.kind === 'image'
            ? `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 60) % 360} 75% 45%))`
            : undefined,
        }}
      >
        {kindIcon(file.kind, 56)}
      </Center>
      {favorite !== undefined && <Group>{favorite}</Group>}
      <Text size="sm">{details.description}</Text>
      <Table withRowBorders={false} verticalSpacing={4} horizontalSpacing={0} fz="sm">
        <Table.Tbody>
          {rows.filter(([, value]) => value !== undefined).map(([label, value]) => (
            <Table.Tr key={label}>
              <Table.Th w={110} fw={500} c="dimmed" style={{ verticalAlign: 'top' }}>{label}</Table.Th>
              <Table.Td style={{ overflowWrap: 'anywhere' }}>{value}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Group gap={6}>
        {details.tags.map((tag) => <Badge key={tag} variant="light" size="sm">{tag}</Badge>)}
      </Group>
    </Stack>
  );
}
