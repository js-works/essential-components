import type { FileRepository, FolderRepository } from '../../domain';
import { createFileRepository } from './files';
import { createFolderRepository } from './folders';
import { seed } from './seed';
import { createStore } from './store';

export { createInMemoryRepositories };

// The in-memory implementation of the media library's repositories: one store (seeded), shared by both. A real
// backend would come as `infra/http/` with the same interfaces; only the app's wiring would change.
function createInMemoryRepositories(): { folders: FolderRepository; files: FileRepository } {
  const store = createStore(seed());

  return { folders: createFolderRepository(store), files: createFileRepository(store) };
}
