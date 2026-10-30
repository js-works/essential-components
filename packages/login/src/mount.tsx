// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the host page.
import '@mantine/core/styles.layer.css';
import { createTheme, MantineProvider, mergeThemeOverrides } from '@mantine/core';
import type { i18n as I18nInstance } from 'i18next';
import { createInstance } from 'i18next';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import type { LoginScreenProps, MountedLoginScreen, MountOptions } from './index.js';
import { LoginScreen } from './login-screen.js';
import { useScheme } from './page.js';
import { loginResources } from './texts.js';

export { mountLoginScreen };

// The class of the login's Mantine scope: Mantine's variables and color scheme are set on it, not on `:root` (the
// login shares its page with the host's other parts).
const SCOPE_CLASS = 'login';

// The login's own theme, under the host's (`MountOptions.theme`): Mantine's indigo, a small radius.
const THEME = createTheme({
  primaryColor: 'indigo',
  autoContrast: true,
  defaultRadius: 'sm',
});

// The login's own i18next instance, for a host that gives none: its English texts (`i18n.md`: without an adapter,
// English and en-US; the page's language is never read).
function ownI18n(): I18nInstance {
  const i18n = createInstance();

  void i18n.init({
    lng: 'en',
    resources: loginResources,
    initAsync: false,
  });

  return i18n;
}

// Mantine follows the page's color scheme (`<html>`). It does not set the scheme on `<html>` (`getRootElement`): the
// scope sets it on itself.
function Frame({ options, own, ...props }: LoginScreenProps & { options: MountOptions; own: () => I18nInstance }) {
  const scheme = useScheme();
  const i18n = options.i18n ?? own();

  return (
    <I18nextProvider i18n={i18n}>
      <MantineProvider
        theme={options.theme === undefined ? THEME : mergeThemeOverrides(THEME, options.theme)}
        forceColorScheme={scheme}
        cssVariablesSelector={`.${SCOPE_CLASS}`}
        deduplicateCssVariables={false}
        getRootElement={() => undefined}
      >
        <div className={SCOPE_CLASS} data-mantine-color-scheme={scheme}>
          <LoginScreen {...props} />
        </div>
      </MantineProvider>
    </I18nextProvider>
  );
}

// The login screen in `element`, for a host without React (or without Mantine): with its own Mantine scope and theme
// (`options.theme` over the login's own), and its own i18next instance unless the host gives one (`options.i18n`). `update()` changes some props (and the options), `unmount()` removes it.
function mountLoginScreen(
  element: HTMLElement,
  props: LoginScreenProps,
  options: MountOptions = {},
): MountedLoginScreen {
  const root = createRoot(element);
  let i18n: I18nInstance | undefined;
  const own = () => (i18n ??= ownI18n());
  let current = props;
  let currentOptions = options;
  const render = () =>
    root.render(
      <StrictMode>
        <Frame {...current} options={currentOptions} own={own} />
      </StrictMode>,
    );

  render();

  return {
    update(next, nextOptions) {
      current = { ...current, ...next };
      currentOptions = nextOptions ?? currentOptions;
      render();
    },
    unmount() {
      root.unmount();
    },
  };
}
