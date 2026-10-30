import type { MantineThemeOverride } from '@mantine/core';
import type { i18n as I18nInstance } from 'i18next';

import type { LoginScreenProps } from './props.js';

export type { MountedLoginScreen, MountOptions };

// The options of `mountLoginScreen()`: `theme`, a Mantine theme override merged over the login's own (indigo, a small
// radius), e.g. `createTheme({ primaryColor: 'teal' })`; `i18n`, the host's i18next instance, with `loginResources`
// added (else the login's own: English).
type MountOptions = {
  theme?: MantineThemeOverride;
  i18n?: I18nInstance;
};

type MountedLoginScreen = {
  update(props: Partial<LoginScreenProps>, options?: MountOptions): void;
  unmount(): void;
};
