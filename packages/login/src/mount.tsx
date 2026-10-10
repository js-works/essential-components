// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the host page.
import '@mantine/core/styles.layer.css';
import { createTheme, MantineProvider, mergeThemeOverrides } from '@mantine/core';
import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type * as Spec from './api';
import { LoginScreen } from './LoginScreen';
import { useScheme } from './page';

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

// Mantine follows the page's color scheme (`<html>`). It does not set the scheme on `<html>` (`getRootElement`): the
// scope sets it on itself.
function Frame({ options, ...props }: Spec.Props & { options: Spec.MountOptions }): ReactElement {
  const scheme = useScheme();

  return (
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
  );
}

// The login screen in `element`, for a host without React (or without Mantine): with its own Mantine scope and theme
// (`options.theme` over the login's own). `update()` changes some props (and the options), `unmount()` removes it.
function mountLoginScreen(element: HTMLElement, props: Spec.Props, options: Spec.MountOptions = {}): Spec.Mounted {
  const root = createRoot(element);
  let current = props;
  let currentOptions = options;
  const render = () =>
    root.render(
      <StrictMode>
        <Frame {...current} options={currentOptions} />
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
