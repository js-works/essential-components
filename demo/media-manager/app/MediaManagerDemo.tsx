// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos.
import '@mantine/core/styles.layer.css';
import './media-manager.css';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { OverlaysProvider } from '../../../packages/overlays/src/main/bindings/react';
import { BrowserServiceContext, createBrowserService } from '../features/browser';
import type { BrowserService } from '../features/browser';
import { createInMemoryRepositories } from '../infra/in-memory';
import { Scope, SCOPE_CLASS, useScheme } from '../shared/ui/scope';
import { createAppRouter } from './App';
import { createLook } from './look';

export { MediaManagerDemo };

// A media manager: folders and files, like a file manager. Mantine, React Router, TanStack Query and three packages:
// a data navigator for a folder's contents, the dialogs and toasts of the overlays package, and a file upload. Built
// like a larger data-driven app: the domain (entities, queries, repository interfaces), the repositories' in-memory
// implementation (`infra/in-memory/`), a service per feature, and the app that wires them.

const LOOK = createLook();

// Mantine follows the page's color scheme switch. It does not set the scheme on `<html>` (`getRootElement`): the
// scopes set it on themselves.
function App({ router, service, queryClient }: {
  router: ReturnType<typeof createAppRouter>['router'];
  service: BrowserService;
  queryClient: QueryClient;
}): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserServiceContext.Provider value={service}>
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
      </BrowserServiceContext.Provider>
    </QueryClientProvider>
  );
}

// The demo as a light DOM custom element without attributes, like the other demos (exported, registered by the page).
// The wiring: the in-memory repositories, the feature's service on them, one query client. Made once per element.
class MediaManagerDemo extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;
  readonly #service = createBrowserService(createInMemoryRepositories());
  readonly #queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });

  connectedCallback(): void {
    const { router, dispose } = createAppRouter(this, 'media-manager');

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
