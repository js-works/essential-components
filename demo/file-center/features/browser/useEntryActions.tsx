import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDialogs } from '../../../../packages/overlays/src/main/bindings/react';
import { ROOT_ID } from '../../domain';
import type { Folder, MediaFile } from '../../domain';
import { FavoriteButton } from './components/Favorite';
import { FileDetails } from './components/FileDetails';
import { FolderDetails } from './components/FolderDetails';
import { useBrowserService } from './context';
import { browserKeys } from './keys';
import type { EntryRow } from './service';

export { useEntryActions };

// What the tables of folders and files share (Files, Recent, Favorites): marking favorites, and the drawer of a
// folder's or a file's details (with the favorite's button). Every change refreshes all reads.
function useEntryActions(folders: readonly Folder[]) {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();

  return useMemo(() => {
    const setFavorite = async (rows: readonly Pick<EntryRow, 'entry' | 'id'>[], favorite: boolean) => {
      await service.setFavorite(rows, favorite);
      await queryClient.invalidateQueries({ queryKey: browserKeys.all });
    };

    const favoriteButton = (entry: 'folder' | 'file', id: string, favorite: boolean | undefined) => (
      <FavoriteButton
        favorite={favorite === true}
        onChange={(next) => setFavorite([{ entry, id }], next)}
      />
    );

    const showFileDetails = async (file: MediaFile) => {
      const scope = dialogs.open();

      try {
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
      } finally {
        scope.dispose();
      }
    };

    const showDetails = async (row: EntryRow) => {
      if (row.entry === 'file') {
        await showFileDetails(row.file);
        return;
      }

      const scope = dialogs.open();

      try {
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
      } finally {
        scope.dispose();
      }
    };

    return { setFavorite, showDetails, showFileDetails };
  }, [service, queryClient, dialogs, folders]);
}
