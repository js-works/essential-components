import { createContext, useContext } from 'react';
import type { BrowserService } from './service';

export { BrowserServiceContext, folderPath, useBrowserService };

// The feature's service, given by the app (its wiring decides on the repositories behind it).
const BrowserServiceContext = createContext<BrowserService | null>(null);

function useBrowserService(): BrowserService {
  const service = useContext(BrowserServiceContext);

  if (service === null) {
    throw new Error('useBrowserService: no BrowserServiceContext around it.');
  }

  return service;
}

// The route of a folder: the root is `/`, every other folder `/folders/<id>`.
function folderPath(id: string): string {
  return id === 'root' ? '/' : `/folders/${encodeURIComponent(id)}`;
}
