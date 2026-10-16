import { useDialogs } from '@local/overlays/react';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { ROOT_ID } from '../../domain/index.js';
import type { Folder, MediaFile } from '../../domain/index.js';
import { FavoriteButton } from './components/favorite.js';
import { FileDetails } from './components/file-details.js';
import { FolderDetails } from './components/folder-details.js';
import { useBrowserService } from './context.js';
import { browserKeys } from './keys.js';
import type { EntryRow } from './service.js';

export { useSetFavoriteFlow, useShowDetailsFlow, useShowFileDetailsFlow };

// The flows that the tables of folders and files share (Files, Recent, Favorites), one hook per use case: marking
// favorites, and the drawer of a folder's or a file's details (with the favorite's button). Every change refreshes all
// reads.

// Marks folders and files as favorites, or unmarks them.
function useSetFavoriteFlow(): (rows: readonly Pick<EntryRow, 'entry' | 'id'>[], favorite: boolean) => Promise<void> {
  const service = useBrowserService();
  const queryClient = useQueryClient();

  return async (rows, favorite) => {
    await service.setFavorite(rows, favorite);
    await queryClient.invalidateQueries({ queryKey: browserKeys.all });
  };
}

// The favorite's button of a details drawer.
function useFavoriteButton(): (entry: 'folder' | 'file', id: string, favorite: boolean | undefined) => ReactElement {
  const setFavorite = useSetFavoriteFlow();

  return (entry, id, favorite) => (
    <FavoriteButton
      favorite={favorite === true}
      onChange={(next) => setFavorite([{ entry, id }], next)}
    />
  );
}

// "Details" of a file: its drawer (the details loaded first), with the favorite's button.
function useShowFileDetailsFlow(folders: readonly Folder[]): (file: MediaFile) => Promise<void> {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const favoriteButton = useFavoriteButton();

  return async (file) => {
    using scope = dialogs.open();
    const details = await queryClient.fetchQuery({
      queryKey: browserKeys.details(file.id),
      queryFn: ({ signal }) => service.details(file.id, signal),
    });

    await scope.info({
      surface: 'drawer',
      icon: false,
      title: file.name,
      content: (
        <FileDetails
          file={file}
          details={details}
          folders={folders}
          favorite={favoriteButton('file', file.id, file.favorite)}
        />
      ),
    });
  };
}

// "Details" of a folder or a file: its drawer, with the favorite's button (none for the root).
function useShowDetailsFlow(folders: readonly Folder[]): (row: EntryRow) => Promise<void> {
  const dialogs = useDialogs();
  const favoriteButton = useFavoriteButton();
  const showFileDetails = useShowFileDetailsFlow(folders);

  return async (row) => {
    if (row.entry === 'file') {
      await showFileDetails(row.file);
      return;
    }

    using scope = dialogs.open();
    await scope.info({
      surface: 'drawer',
      icon: false,
      title: row.name,
      content: (
        <FolderDetails
          folder={row.folder}
          folders={folders}
          items={row.size}
          favorite={row.id === ROOT_ID ? undefined : favoriteButton('folder', row.id, row.folder.favorite)}
        />
      ),
    });
  };
}
