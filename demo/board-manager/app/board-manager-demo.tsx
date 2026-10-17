// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos (like in the React demo of overlays).
import './mantine.css';
import '@mantine/charts/styles.layer.css';
import '@mantine/dates/styles.layer.css';
import '@local/rich-text/styles.css';
import '@local/micro-app/styles.css';
import './board-manager.css';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { MicroAppLook, MicroAppLookOptions } from '@local/micro-app';
import { createLook, MicroAppProvider } from '@local/micro-app';
import { OverlaysProvider } from '@local/overlays/react';

import { BoardServiceContext, createBoardService } from '../features/boards/index.js';
import { createMeetingService, MeetingServiceContext } from '../features/meetings/index.js';
import { createMemberService, MemberServiceContext } from '../features/members/index.js';
import { createOrganizationService, OrganizationServiceContext } from '../features/organizations/index.js';
import { createInMemoryRepositories } from '../infra/in-memory/index.js';
import { i18n, useLanguage } from '../shared/lib/i18n/index.js';
import { SCOPE_CLASS, Scope, useScheme } from '../shared/shared.js';
import { createAppRouter } from './app.js';

export type { Look };
export { App as BoardManagerApp, BoardManagerDemo, createBoardManagerLook };

// A board manager: boards and committees, their meetings, agendas, minutes and documents. Mantine, TanStack Router,
// TanStack Query, the building blocks of `@local/micro-app`, and three packages: data tables for every list, the
// dialogs and toasts of the overlays package, and a file upload for the documents of a meeting. The server is fake
// (`infra/in-memory/`), the data lives in memory.

type Look = MicroAppLook;

// The look of the app (`createLook`): Mantine's theme with the accent, the danger, success and warning colors
// (ten shades each; without them, Mantine's indigo, the modern theme's red, green and orange), the CSS variables and
// the overlays' config. The accent, the font, the text size and the scale follow the app's custom properties, live.
// Made once per element (the `<board-manager>` element's colors): the overlays provider compares its config.
function createBoardManagerLook(colors: Omit<MicroAppLookOptions, 'Scope' | 'tokens'> = {}): Look {
  return createLook({
    ...colors,
    Scope,
    tokens: {
      accent: '--board-manager-accent-color',
      fontSize: '--board-manager-font-size',
      fontFamily: '--board-manager-font-family',
      scale: '--board-manager-scale',
    },
  });
}

// The services of the features, over the in-memory repositories (the only place that chooses the implementation).
// The reads of the app (TanStack Query), one cache for the app's data: after every change, all of them again (a change
// of one feature's data may show in another's, e.g. a deleted board takes its meetings with it).
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false } } });
const changed = () => void queryClient.invalidateQueries();

const repositories = createInMemoryRepositories();
const services = {
  boards: createBoardService(repositories, changed),
  members: createMemberService(repositories, changed),
  organizations: createOrganizationService(repositories, changed),
  meetings: createMeetingService(repositories, changed),
};

// The features' services and the query client, around everything (the dialogs' content too: it reads through them).
function Services({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BoardServiceContext.Provider value={services.boards}>
        <MemberServiceContext.Provider value={services.members}>
          <OrganizationServiceContext.Provider value={services.organizations}>
            <MeetingServiceContext.Provider value={services.meetings}>
              <MicroAppProvider i18n={i18n} savedFilters={repositories.savedFilters}>
                {children}
              </MicroAppProvider>
            </MeetingServiceContext.Provider>
          </OrganizationServiceContext.Provider>
        </MemberServiceContext.Provider>
      </BoardServiceContext.Provider>
    </QueryClientProvider>
  );
}

const DEFAULT_LOOK = createBoardManagerLook();

// Mantine follows the page's color scheme switch. It does not set the scheme on `<html>` (`getRootElement`): the
// scopes set it on themselves.
function App(
  { router, look = DEFAULT_LOOK }: { router: ReturnType<typeof createAppRouter>['router']; look?: Look },
) {
  return (
    <Services>
      <MantineProvider
        theme={look.theme}
        cssVariablesResolver={look.cssVariablesResolver}
        forceColorScheme={useScheme()}
        cssVariablesSelector={`.${SCOPE_CLASS}`}
        deduplicateCssVariables={false}
        getRootElement={() => undefined}
      >
        {/* The language: a dialog that is open follows a switch (its buttons, which the package makes). */}
        <OverlaysProvider config={look.overlaysConfig} refreshKey={useLanguage()}>
          <Scope>
            <RouterProvider router={router} />
          </Scope>
        </OverlaysProvider>
      </MantineProvider>
    </Services>
  );
}

// The demo as a light DOM custom element without attributes, like the other demos (exported, registered by the page).
class BoardManagerDemo extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;

  connectedCallback(): void {
    const { router, dispose } = createAppRouter(this, 'board-manager');

    this.#disposeRouter = dispose;
    this.#root = createRoot(this);
    this.#root.render(
      <StrictMode>
        <App router={router} />
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
