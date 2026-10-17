import type { FileRepository, FolderRepository } from '../../domain/index.js';
import { createFileRepository } from './files.js';
import { createFolderRepository } from './folders.js';
import { seed } from './seed.js';
import { createStore } from './store.js';

export { createInMemoryRepositories };

// The in-memory implementation of the media library's repositories: one store (seeded), shared by both. A real
// backend would come as `infra/http/` with the same interfaces; only the app's wiring would change.
function createInMemoryRepositories(): { folders: FolderRepository; files: FileRepository } {
  const store = createStore(seed());

  return { folders: createFolderRepository(store), files: createFileRepository(store) };
}

export { createInMemorySavedFilters } from './saved-filter-seed.js';
