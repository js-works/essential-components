// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos (like in the React demo of overlays).
import '@mantine/core/styles.layer.css';
import './board-manager.css';
import { createTheme, MantineProvider, Menu, Popover, Tooltip } from '@mantine/core';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { OverlaysProvider } from '../../packages/overlays/src/main/bindings/react';
import type { OverlaysConfig } from '../../packages/overlays/src/main/bindings/react';
import { createAppRouter } from './App';
import { Scope, SCOPE_CLASS, useScheme } from './shared';

export { BoardManagerDemo };

// A board manager: boards and committees, their meetings, agendas, minutes and documents. Mantine, React Router and
// three packages: data navigators for every list, the dialogs and toasts of the overlays package, and a file upload
// for the documents of a meeting. The server is fake (db.ts), the data lives in memory.

// The popups of Mantine stay inside the app (no portal to `<body>`): its variables are set on the app, not on `:root`.
const THEME = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'sm',
  components: {
    Menu: Menu.extend({ defaultProps: { withinPortal: false } }),
    Popover: Popover.extend({ defaultProps: { withinPortal: false } }),
    Tooltip: Tooltip.extend({ defaultProps: { withinPortal: false } }),
  },
});

// The dialogs with their icons, and the content of each dialog in a scope of Mantine (the dialogs are outside the
// app's element). The toasts small and stacked in the bottom right corner. A module constant: the provider compares
// its config.
const OVERLAYS_CONFIG: OverlaysConfig = {
  dialogs: { icons: true, wrapContent: (content) => <Scope>{content}</Scope> },
  toasts: { placement: 'bottom-end', size: 'small', stacked: true },
};

// Mantine follows the page's color scheme switch. It does not set the scheme on `<html>` (`getRootElement`): the
// scopes set it on themselves.
function App({ router }: { router: ReturnType<typeof createAppRouter>['router'] }): ReactElement {
  return (
    <MantineProvider
      theme={THEME}
      forceColorScheme={useScheme()}
      cssVariablesSelector={`.${SCOPE_CLASS}`}
      deduplicateCssVariables={false}
      getRootElement={() => undefined}
    >
      <OverlaysProvider config={OVERLAYS_CONFIG}>
        <Scope>
          <RouterProvider router={router} />
        </Scope>
      </OverlaysProvider>
    </MantineProvider>
  );
}

// The demo as a light DOM custom element without attributes, like the other demos (exported, registered by the page).
class BoardManagerDemo extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;

  connectedCallback(): void {
    const { router, dispose } = createAppRouter(this);

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
