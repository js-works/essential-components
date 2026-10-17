// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos.
import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.layer.css';
import 'dayjs/locale/de';
import '@local/micro-app/styles.css';
import './human-resources.css';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import { createLook, MantineScope, MicroAppProvider, usePageScheme } from '@local/micro-app';
import { OverlaysProvider } from '@local/overlays/react';

import type { SavedFilterRepository } from '../domain/index.js';
import type { HrService } from '../features/hr/index.js';
import { createHrService, HrServiceContext } from '../features/hr/index.js';
import { ViewerProvider } from '../features/viewer/index.js';
import { createInMemoryRepositories, createInMemorySavedFilters, VIEWER_ID } from '../infra/in-memory/index.js';
import { i18n, useLanguage } from '../shared/lib/i18n/index.js';
import { createAppRouter } from './app.js';

export { HumanResourcesDemo };

// Human resources: the employees (their job, salary history and documents), the departments with an org chart,
// recruiting (openings, a pipeline board of candidates, the hire), and the checklists of joiners and leavers. Mantine
// (with its dates), TanStack Router, TanStack Query, i18next, and four packages: data tables for the lists, the
// dialogs and toasts of the overlays package, form-validation for the forms, the file upload for the documents. Built
// like the Time Tracker: the domain, the repositories' in-memory implementation, a service, the app that wires them.

// Mantine's variables and color scheme are set on this class, not on `:root`: the app shares its page with other demos.
const SCOPE_CLASS = 'human-resources';

function Scope({ children }: { children: ReactNode }) {
  return <MantineScope className={SCOPE_CLASS}>{children}</MantineScope>;
}

const LOOK = createLook({
  Scope,
  tokens: { accent: '--human-resources-accent-color', fontSize: '--human-resources-font-size' },
});

// The date inputs show their date in the locale's short format (`valueFormat="ll"`: "Oct 6, 2026", "6. Okt. 2026"),
// which needs dayjs's plugin; without it, dayjs shows the format itself ("ll"). Global to dayjs, but it only adds
// formats.
dayjs.extend(localizedFormat);

// Mantine's dates (the calendars, the pickers) in the page's language, with Monday as the first day of the week.
function Dates({ children }: { children: ReactNode }) {
  const language = useLanguage().startsWith('de') ? 'de' : 'en';

  return <DatesProvider settings={{ locale: language, firstDayOfWeek: 1 }}>{children}</DatesProvider>;
}

function App({ router, service, savedFilters, queryClient }: {
  router: ReturnType<typeof createAppRouter>['router'];
  service: HrService;
  savedFilters: SavedFilterRepository;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <HrServiceContext.Provider value={service}>
        <MicroAppProvider i18n={i18n} savedFilters={savedFilters}>
          <ViewerProvider employeeId={VIEWER_ID}>
            <MantineProvider
              theme={LOOK.theme}
              cssVariablesResolver={LOOK.cssVariablesResolver}
              forceColorScheme={usePageScheme()}
              cssVariablesSelector={`.${SCOPE_CLASS}`}
              deduplicateCssVariables={false}
              getRootElement={() => undefined}
            >
              <Dates>
                <OverlaysProvider config={LOOK.overlaysConfig}>
                  <Scope>
                    <RouterProvider router={router} />
                  </Scope>
                </OverlaysProvider>
              </Dates>
            </MantineProvider>
          </ViewerProvider>
        </MicroAppProvider>
      </HrServiceContext.Provider>
    </QueryClientProvider>
  );
}

// The demo as a light DOM custom element without attributes, like the other demos (exported, registered by the page).
// The wiring: the in-memory repositories, the service on them, one query client. Made once per element.
class HumanResourcesDemo extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;
  readonly #service = createHrService(createInMemoryRepositories());
  readonly #savedFilters = createInMemorySavedFilters();
  readonly #queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });

  connectedCallback(): void {
    const { router, dispose } = createAppRouter(this, 'human-resources');

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
