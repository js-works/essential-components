import type { MantineThemeOverride } from '@mantine/core';
import type { LoginScreenProps } from './props.js';

export type { MountedLoginScreen, MountOptions };

// The options of `mountLoginScreen()`: `theme`, a Mantine theme override merged over the login's own (indigo, a small
// radius), e.g. `createTheme({ primaryColor: 'teal' })`.
type MountOptions = {
  theme?: MantineThemeOverride;
};

type MountedLoginScreen = {
  update(props: Partial<LoginScreenProps>, options?: MountOptions): void;
  unmount(): void;
};
