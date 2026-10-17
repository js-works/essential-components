// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos.
import '@mantine/core/styles.layer.css';
import '@local/micro-app/styles.css';
import './user-manager.css';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import { createLook, MantineScope, MicroAppProvider, usePageScheme } from '@local/micro-app';
import { OverlaysProvider } from '@local/overlays/react';

import type { SavedFilterRepository } from '../domain/index.js';
import type { IamService } from '../features/iam/index.js';
import { createIamService, IamServiceContext } from '../features/iam/index.js';
import { createInMemoryRepositories, createInMemorySavedFilters } from '../infra/in-memory/index.js';
import { i18n } from '../shared/lib/i18n.js';
import { createAppRouter } from './app.js';

export { UserManagerDemo };

// A user manager: users, groups, roles (sets of permissions) and who has which role where (grants on scopes, inherited
// downwards), with a check of access that says why. Mantine, TanStack Router, TanStack Query, the building blocks of
// `@local/micro-app`, data tables for the lists, the dialogs and toasts of the overlays package. Built like the File
// Center: the domain (with the rules of access), the repositories' in-memory implementation, a service, the app that
// wires them.

// Mantine's variables and color scheme are set on this class, not on `:root`: the app shares its page with other demos.
const SCOPE_CLASS = 'user-manager';

function Scope({ children }: { children: ReactNode }) {
  return <MantineScope className={SCOPE_CLASS}>{children}</MantineScope>;
}

const LOOK = createLook({
  Scope,
  tokens: {
    accent: '--user-manager-accent-color',
    fontSize: '--user-manager-font-size',
    fontFamily: '--user-manager-font-family',
    scale: '--user-manager-scale',
  },
});

function App({ router, service, savedFilters, queryClient }: {
  router: ReturnType<typeof createAppRouter>['router'];
  service: IamService;
  savedFilters: SavedFilterRepository;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <IamServiceContext.Provider value={service}>
        <MicroAppProvider i18n={i18n} savedFilters={savedFilters}>
          <MantineProvider
            theme={LOOK.theme}
            cssVariablesResolver={LOOK.cssVariablesResolver}
            forceColorScheme={usePageScheme()}
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
        </MicroAppProvider>
      </IamServiceContext.Provider>
    </QueryClientProvider>
  );
}

// The demo as a light DOM custom element without attributes, like the other demos (exported, registered by the page).
// The wiring: the in-memory repositories, the service on them, one query client. Made once per element.
class UserManagerDemo extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;
  readonly #service = createIamService(createInMemoryRepositories());
  readonly #savedFilters = createInMemorySavedFilters();
  readonly #queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });

  connectedCallback(): void {
    const { router, dispose } = createAppRouter(this, 'user-manager');

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
