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
import type { CSSVariablesResolver, MantineColorsTuple, MantineThemeOverride } from '@mantine/core';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { OverlaysProvider } from '../../packages/overlays/src/main/bindings/react';
import type { OverlaysConfig } from '../../packages/overlays/src/main/bindings/react';
import { createDialogTheme } from '../../packages/overlays/src/main/dialogs/dialogs';
import { createToastTheme } from '../../packages/overlays/src/main/toasts/toasts';
import { createAppRouter } from './App';
import { Scope, SCOPE_CLASS, useScheme } from './shared';

export { App as BoardManagerApp, BoardManagerDemo, createLook };
export type { Look };

// A board manager: boards and committees, their meetings, agendas, minutes and documents. Mantine, React Router and
// three packages: data navigators for every list, the dialogs and toasts of the overlays package, and a file upload
// for the documents of a meeting. The server is fake (db.ts), the data lives in memory.

// The look of the app: Mantine's theme with the accent (the primary color) and the danger color, the CSS variables
// and the overlays' config that follow from them. Each is ten shades of Mantine (`colors.accent`, `colors.danger`);
// without them, Mantine's `indigo` and `red`. Made once per element (the `<board-manager>` element's `accent-color`
// and `danger-color`): the overlays provider compares its config.
type Look = { theme: MantineThemeOverride; cssVariablesResolver: CSSVariablesResolver; overlaysConfig: OverlaysConfig };

function createLook(
  { accent = DEFAULT_THEME.colors.indigo, danger = DEFAULT_THEME.colors.red }: {
    accent?: MantineColorsTuple;
    danger?: MantineColorsTuple;
  } = {},
): Look {
  // The popups of Mantine stay inside the app (no portal to `<body>`): its variables are set on the app, not on
  // `:root`. Badges keep the case of their text (Mantine's stylesheet makes them uppercase). Buttons have a normal
  // weight (400; Mantine's is 600), also those of the dialogs (Mantine's, see `render.actionButton`; there `xs`, like
  // the buttons of the pages). `autoContrast`:
  // black text on a light accent.
  const theme = createTheme({
    colors: { accent, danger },
    primaryColor: 'accent',
    autoContrast: true,
    defaultRadius: 'sm',
    components: {
      Badge: Badge.extend({ defaultProps: { tt: 'none' } }),
      Button: Button.extend({
        defaultProps: { fw: 400 },
        // `xs` buttons (30px high) in the app's text size (`sm`, 14px) instead of Mantine's `xs` (12px).
        vars: (theme, props) => ({ root: props.size === 'xs' ? { '--button-fz': theme.fontSizes.sm } : {} }),
      }),
      Menu: Menu.extend({ defaultProps: { withinPortal: false } }),
      Popover: Popover.extend({ defaultProps: { withinPortal: false } }),
      Tooltip: Tooltip.extend({ defaultProps: { withinPortal: false } }),
    },
  });

  // More contrast than Mantine's defaults, for the app and every component in it (their themes use Mantine's
  // variables): the dimmed text (secondary texts, the table headers, the labels) and the placeholders one step darker
  // (in dark mode: lighter). The text and the lines stay Mantine's (black and `gray.4` already). The error color (the
  // inputs' errors, the data navigator's and the file upload's danger) is the danger color, shades 6 and 8 like
  // Mantine's red.
  const cssVariablesResolver: CSSVariablesResolver = () => ({
    variables: {},
    light: {
      '--mantine-color-dimmed': 'var(--mantine-color-gray-7)',
      '--mantine-color-placeholder': 'var(--mantine-color-gray-6)',
      '--mantine-color-error': 'var(--mantine-color-danger-6)',
    },
    dark: {
      '--mantine-color-dimmed': 'var(--mantine-color-dark-1)',
      '--mantine-color-placeholder': 'var(--mantine-color-dark-2)',
      '--mantine-color-error': 'var(--mantine-color-danger-8)',
    },
  });

  // The toasts in Mantine's palette. They live in `<body>`, outside the scopes, so Mantine's variables are not there:
  // the colors are the values of the theme, and `light-dark()` follows the page's scheme (`color-scheme` on `<html>`).
  // Like Mantine: a paper card (white, `dark.6`), its text and dimmed colors, the accent for info and loading.
  const { colors, fontSizes, fontFamily } = mergeMantineTheme(DEFAULT_THEME, theme);

  const toastTheme = createToastTheme({
    background: `light-dark(#fff, ${colors.dark[6]})`,
    text: `light-dark(#000, ${colors.dark[0]})`,
    radius: '4px',
    infoAccent: accent[6],
    successAccent: colors.green[6],
    warnAccent: colors.orange[6],
    errorAccent: danger[6],
    loadingAccent: accent[6],
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
  // danger one filled in the danger color, the others `default`; the spinner is Mantine's `loading`. The toasts medium
  // and stacked in the bottom right corner, in Mantine's palette.
  const overlaysConfig: OverlaysConfig = {
    dialogs: {
      icons: true,
      // The dialogs' own text (title, message) in the app's size and font, like the Mantine inputs in their content:
      // the values of the theme (the dialogs are outside the scopes, where Mantine's variables are not set).
      // The spinner placeholder (while a scope waits, e.g. for the PDF) in the accent's filled color (shade 6, 8 dark).
      theme: createDialogTheme({
        fontSize: fontSizes.sm,
        fontFamily,
        spinner: `light-dark(${accent[6]}, ${accent[8]})`,
      }),
      wrapContent: (content) => <Scope>{content}</Scope>,
      render: {
        actionButton: ({ text, variant, loading, onClick }) => (
          <Scope>
            <Button
              size="xs"
              variant={variant === 'secondary' ? 'default' : 'filled'}
              color={variant === 'danger' ? 'danger' : undefined}
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
    toasts: { placement: 'bottom-end', size: 'small', stacked: true, theme: toastTheme },
  };

  return { theme, cssVariablesResolver, overlaysConfig };
}

const DEFAULT_LOOK = createLook();

// Mantine follows the page's color scheme switch. It does not set the scheme on `<html>` (`getRootElement`): the
// scopes set it on themselves.
function App(
  { router, look = DEFAULT_LOOK }: { router: ReturnType<typeof createAppRouter>['router']; look?: Look },
): ReactElement {
  return (
    <MantineProvider
      theme={look.theme}
      cssVariablesResolver={look.cssVariablesResolver}
      forceColorScheme={useScheme()}
      cssVariablesSelector={`.${SCOPE_CLASS}`}
      deduplicateCssVariables={false}
      getRootElement={() => undefined}
    >
      <OverlaysProvider config={look.overlaysConfig}>
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
