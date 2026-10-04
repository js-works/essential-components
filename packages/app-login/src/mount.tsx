// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the host page.
import '@mantine/core/styles.layer.css';
import { createTheme, DEFAULT_THEME, MantineProvider } from '@mantine/core';
import type { CSSVariablesResolver, MantineColorsTuple } from '@mantine/core';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type * as Spec from './api';
import { LoginScreen } from './LoginScreen';
import { useScheme } from './page';

export { mountLoginScreen };

// The class of the login's Mantine scope: Mantine's variables and color scheme are set on it, not on `:root` (the
// login shares its page with the host's other parts).
const SCOPE_CLASS = 'app-login';

// The accent, live from the custom property `--app-login-accent-color` (any CSS color, set by the host page's CSS):
// Mantine's ten shades as mixes of it with white and black; without it, Mantine's indigo (a `var()` of an unset
// property makes a step invalid, so the fallback counts).
const ACCENT_TOKEN = '--app-login-accent-color';
const ACCENT_MIX = [10, 22, 40, 58, 75, 88, 100, 88, 76, 62] as const;
const ACCENT: MantineColorsTuple = DEFAULT_THEME.colors.indigo;

const THEME = createTheme({
  colors: { accent: ACCENT },
  primaryColor: 'accent',
  autoContrast: true,
  defaultRadius: 'sm',
});

const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: Object.fromEntries(
    ACCENT_MIX.flatMap((percent, index) => [
      [
        `${ACCENT_TOKEN}-${index}`,
        index === 6
          ? `var(${ACCENT_TOKEN})`
          : `color-mix(in oklab, var(${ACCENT_TOKEN}) ${percent}%, ${index < 6 ? 'white' : 'black'})`,
      ],
      [`--mantine-color-accent-${index}`, `var(${ACCENT_TOKEN}-${index}, ${ACCENT[index]})`],
    ]),
  ),
  light: {
    '--mantine-color-accent-outline-hover': 'color-mix(in srgb, var(--mantine-color-accent-6) 5%, transparent)',
  },
  dark: {
    '--mantine-color-accent-light': 'color-mix(in srgb, var(--mantine-color-accent-9) 50%, black)',
    '--mantine-color-accent-light-hover': 'color-mix(in srgb, var(--mantine-color-accent-9) 70%, black)',
    '--mantine-color-accent-outline-hover': 'color-mix(in srgb, var(--mantine-color-accent-4) 5%, transparent)',
  },
});

// Mantine follows the page's color scheme (`<html>`). It does not set the scheme on `<html>` (`getRootElement`): the
// scope sets it on itself.
function Frame(props: Spec.Props): ReactElement {
  const scheme = useScheme();

  return (
    <MantineProvider
      theme={THEME}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme={scheme}
      cssVariablesSelector={`.${SCOPE_CLASS}`}
      deduplicateCssVariables={false}
      getRootElement={() => undefined}
    >
      <div className={SCOPE_CLASS} data-mantine-color-scheme={scheme}>
        <LoginScreen {...props} />
      </div>
    </MantineProvider>
  );
}

// The login screen in `element`, for a host without React (or without Mantine): with its own Mantine scope. `update()`
// changes some props, `unmount()` removes it.
function mountLoginScreen(element: HTMLElement, props: Spec.Props): Spec.Mounted {
  const root = createRoot(element);
  let current = props;
  const render = () =>
    root.render(
      <StrictMode>
        <Frame {...current} />
      </StrictMode>,
    );

  render();

  return {
    update(next) {
      current = { ...current, ...next };
      render();
    },
    unmount() {
      root.unmount();
    },
  };
}
