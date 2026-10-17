// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos.
import '@mantine/core/styles.layer.css';
import './file-center.css';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { OverlaysProvider } from '@local/overlays/react';

import type { SavedFilterRepository } from '../domain/index.js';
import type { BrowserService } from '../features/browser/index.js';
import { BrowserServiceContext, createBrowserService } from '../features/browser/index.js';
import { createInMemoryRepositories, createInMemorySavedFilters } from '../infra/in-memory/index.js';
import { SavedFilterServiceContext } from '../shared/ui/saved-filters.js';
import { SCOPE_CLASS, Scope, useScheme } from '../shared/ui/scope.js';
import { createAppRouter } from './app.js';
import { createLook } from './look.js';

export { FileCenterDemo };

// The File Center (2026-10-08; the Media Manager before): storages, folders and files, like a file manager. Mantine,
// React Router, TanStack Query and three packages:
// a data table for a folder's contents, the dialogs and toasts of the overlays package, and a file upload. Built
// like a larger data-driven app: the domain (entities, queries, repository interfaces), the repositories' in-memory
// implementation (`infra/in-memory/`), a service per feature, and the app that wires them.

const LOOK = createLook();

// Mantine follows the page's color scheme switch. It does not set the scheme on `<html>` (`getRootElement`): the
// scopes set it on themselves.
function App({ router, service, savedFilters, queryClient }: {
  router: ReturnType<typeof createAppRouter>['router'];
  service: BrowserService;
  savedFilters: SavedFilterRepository;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserServiceContext.Provider value={service}>
        <SavedFilterServiceContext.Provider value={savedFilters}>
          <MantineProvider
            theme={LOOK.theme}
            cssVariablesResolver={LOOK.cssVariablesResolver}
            forceColorScheme={useScheme()}
            cssVariablesSelector={`.${SCOPE_CLASS}`}
            deduplicateCssVariables={false}
            getRootElement={() => undefined}
          >
            <OverlaysProvider config={LOOK.overlaysConfig}>
              <Scope>
                <RouterProvider router={router} />
              </Scope>
            </OverlaysProvider>
          </MantineProvider>
        </SavedFilterServiceContext.Provider>
      </BrowserServiceContext.Provider>
    </QueryClientProvider>
  );
}

// The demo as a light DOM custom element without attributes, like the other demos (exported, registered by the page).
// The wiring: the in-memory repositories, the feature's service on them, one query client. Made once per element.
class FileCenterDemo extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;
  readonly #service = createBrowserService(createInMemoryRepositories());
  readonly #savedFilters = createInMemorySavedFilters();
  readonly #queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });

  connectedCallback(): void {
    const { router, dispose } = createAppRouter(this, 'file-center');

    this.#disposeRouter = dispose;
    this.#root = createRoot(this);
    this.#root.render(
      <StrictMode>
        <App
          router={router}
          service={this.#service}
          savedFilters={this.#savedFilters}
          queryClient={this.#queryClient}
        />
      </StrictMode>,
    );
  }

  disconnectedCallback(): void {
    this.#root?.unmount();
    this.#disposeRouter?.();
    this.#root = undefined;
    this.#disposeRouter = undefined;
  }
}
