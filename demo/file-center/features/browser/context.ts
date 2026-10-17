import { createContext, useContext } from 'react';

import type { BrowserService } from './service.js';

export { BrowserServiceContext, folderLink, useBrowserService };

// The feature's service, given by the app (its wiring decides on the repositories behind it).
const BrowserServiceContext = createContext<BrowserService | null>(null);

function useBrowserService(): BrowserService {
  const service = useContext(BrowserServiceContext);

  if (service === null) {
    throw new Error('useBrowserService: no BrowserServiceContext around it.');
  }

  return service;
}

// The link to a folder in the module "Files" (for a `Link` or `navigate()`): the root is `/files`, every other folder
// `/files/$folderId`.
function folderLink(id: string) {
  return id === 'root' ? ({ to: '/files' } as const) : ({ to: '/files/$folderId', params: { folderId: id } } as const);
}
