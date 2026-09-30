// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos (like in the React demo of overlays).
import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.layer.css';
import './board-manager.css';
import {
  Badge,
  Button,
  CloseButton,
  createTheme,
  DEFAULT_THEME,
  MantineProvider,
  Menu,
  mergeMantineTheme,
  Popover,
  Tooltip,
} from '@mantine/core';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { OverlaysProvider } from '../../packages/overlays/src/main/bindings/react';
import type { OverlaysConfig } from '../../packages/overlays/src/main/bindings/react';
import { createToastTheme } from '../../packages/overlays/src/main/toasts/toasts';
import { createAppRouter } from './App';
import { Scope, SCOPE_CLASS, useScheme } from './shared';

export { App as BoardManagerApp, BoardManagerDemo };

// A board manager: boards and committees, their meetings, agendas, minutes and documents. Mantine, React Router and
// three packages: data navigators for every list, the dialogs and toasts of the overlays package, and a file upload
// for the documents of a meeting. The server is fake (db.ts), the data lives in memory.

// The popups of Mantine stay inside the app (no portal to `<body>`): its variables are set on the app, not on `:root`.
// Badges keep the case of their text (Mantine's stylesheet makes them uppercase).
const THEME = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'sm',
  components: {
    Badge: Badge.extend({ defaultProps: { tt: 'none' } }),
    Menu: Menu.extend({ defaultProps: { withinPortal: false } }),
    Popover: Popover.extend({ defaultProps: { withinPortal: false } }),
    Tooltip: Tooltip.extend({ defaultProps: { withinPortal: false } }),
  },
});

// The toasts in Mantine's palette. They live in `<body>`, outside the scopes, so Mantine's variables are not there:
// the colors are the values of the theme, and `light-dark()` follows the page's scheme (`color-scheme` on `<html>`).
// Like Mantine: a paper card (white, `dark.6`), its text and dimmed colors, the primary color for info and loading.
const { colors, primaryColor } = mergeMantineTheme(DEFAULT_THEME, THEME);

const TOAST_THEME = createToastTheme({
  background: `light-dark(#fff, ${colors.dark[6]})`,
  text: `light-dark(#000, ${colors.dark[0]})`,
  radius: '4px',
  infoAccent: colors[primaryColor]![6],
  successAccent: colors.green[6],
  warnAccent: colors.orange[6],
  errorAccent: colors.red[6],
  loadingAccent: colors[primaryColor]![6],
  titleColor: `light-dark(#000, ${colors.dark[0]})`,
  messageColor: `light-dark(${colors.gray[7]}, ${colors.dark[1]})`,
  closeColor: `light-dark(${colors.gray[6]}, ${colors.dark[2]})`,
  closeHoverColor: `light-dark(#000, ${colors.dark[0]})`,
  closeHoverBackground: `light-dark(${colors.gray[0]}, ${colors.dark[5]})`,
  darkBackground: colors.dark[7],
  darkText: colors.dark[0],
  darkCloseColor: colors.dark[2],
});

// The dialogs with their icons, and the content of each dialog in a scope of Mantine (the dialogs are outside the
// app's element). Their buttons and close button are Mantine's (each in a scope too): the primary one filled, a
// danger one filled red, the others `default`; the spinner is Mantine's `loading`. The toasts medium and stacked in
// the bottom right corner, in Mantine's palette. A module constant: the provider compares its config.
const OVERLAYS_CONFIG: OverlaysConfig = {
  dialogs: {
    icons: true,
    wrapContent: (content) => <Scope>{content}</Scope>,
    render: {
      actionButton: ({ text, variant, loading, onClick }) => (
        <Scope>
          <Button
            variant={variant === 'secondary' ? 'default' : 'filled'}
            color={variant === 'danger' ? 'red' : undefined}
            loading={loading}
            onClick={onClick}
          >
            {text}
          </Button>
        </Scope>
      ),
      closeButton: ({ onClose }) => (
        <Scope>
          <CloseButton aria-label="Close" onClick={onClose} />
        </Scope>
      ),
    },
  },
  toasts: { placement: 'bottom-end', size: 'small', stacked: true, appearance: 'solid', theme: TOAST_THEME },
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
