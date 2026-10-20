import { createMemoryHistory, createRouter } from '@tanstack/react-router';

import { mirrorInHash, pathFromHash } from '@local/micro-app';

import { routeTree } from '../.generated/route-tree.js';

export { createAppRouter };

// The routes are files (`routes/`, TanStack Router's file-based routing); the tree is generated from them
// (`.generated/route-tree.ts`, not checked in: by `npm run routes` before the typecheck, and by the Vite plugin).
const createBoardManagerRouter = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

// The routes live in memory, and can be mirrored in the URL hash after a prefix: `#board-manager/boards/b1/meetings/m12`.
// So a reload (or a shared link) opens the same page, and the browser's Back and Forward step through them. A hash with
// another start is left alone (the page's other tabs, `ui.ts`, or a host page's anchors). Without an element and a
// prefix (the `<board-manager>` element without `hash`), only the memory router.
function createAppRouter(element?: HTMLElement, hashPrefix?: string) {
  if (element === undefined || hashPrefix === undefined) {
    return { router: createBoardManagerRouter('/'), dispose: () => {} };
  }

  const prefix = `#${hashPrefix}`;
  const router = createBoardManagerRouter(pathFromHash(prefix) ?? '/');

  return { router, dispose: mirrorInHash(router, element, prefix) };
}
