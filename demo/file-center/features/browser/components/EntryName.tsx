import { Anchor, Group, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { appIcons, kindIcon } from '../../../shared/ui/icons';
import { folderPath } from '../context';
import type { EntryRow } from '../service';
import { FavoriteStar } from './Favorite';

export { EntryName };

// The name of an entry with its icon: a folder (filled, in the accent color; a storage with its own icon) is a link
// that opens it. Then its star (`onFavorite`: mark or unmark it).
function EntryName({ row, onFavorite }: {
  row: EntryRow;
  onFavorite: (row: EntryRow, favorite: boolean) => Promise<void>;
}): ReactElement {
  const favorite = (row.entry === 'folder' ? row.folder.favorite : row.file.favorite) === true;
  const star = <FavoriteStar favorite={favorite} onChange={(next) => onFavorite(row, next)} />;

  return row.entry === 'folder'
    ? (
      <Group gap={8} wrap="nowrap" className="file-center__entry">
        <Text component="span" c="var(--mantine-primary-color-filled)" display="inline-flex">
          {row.folder.storage === true ? appIcons.storage : appIcons.folder}
        </Text>
        <Anchor component={Link} to={folderPath(row.id)} size="sm" fw={500} truncate>{row.name}</Anchor>
        {star}
      </Group>
    )
    : (
      <Group gap={8} wrap="nowrap" className="file-center__entry" data-kind={row.kind}>
        <Text component="span" className="file-center__kind" display="inline-flex">{kindIcon(row.kind)}</Text>
        <Text component="span" size="sm" truncate>{row.name}</Text>
        {star}
      </Group>
    );
}
