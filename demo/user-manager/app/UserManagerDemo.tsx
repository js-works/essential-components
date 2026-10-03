// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos.
import '@mantine/core/styles.layer.css';
import './user-manager.css';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { OverlaysProvider } from '../../../packages/overlays/src/main/bindings/react';
import { createIamService, IamServiceContext } from '../features/iam';
import type { IamService } from '../features/iam';
import { createInMemoryRepositories } from '../infra/in-memory';
import { Scope, SCOPE_CLASS, useScheme } from '../shared/ui/scope';
import { createAppRouter } from './App';
import { createLook } from './look';

export { UserManagerDemo };

// A user manager: users, groups, roles (sets of permissions) and who has which role where (grants on scopes, inherited
// downwards), with a check of access that says why. Mantine, React Router, TanStack Query, and two packages: data
// navigators for the lists, the dialogs and toasts of the overlays package. Built like the Media Manager: the domain
// (with the rules of access), the repositories' in-memory implementation, a service, the app that wires them.

const LOOK = createLook();

function App({ router, service, queryClient }: {
  router: ReturnType<typeof createAppRouter>['router'];
  service: IamService;
  queryClient: QueryClient;
}): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <IamServiceContext.Provider value={service}>
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
  readonly #queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });

  connectedCallback(): void {
    const { router, dispose } = createAppRouter(this, 'user-manager');

    this.#disposeRouter = dispose;
    this.#root = createRoot(this);
    this.#root.render(
      <StrictMode>
        <App router={router} service={this.#service} queryClient={this.#queryClient} />
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
