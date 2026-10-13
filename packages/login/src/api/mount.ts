import type { MantineThemeOverride } from '@mantine/core';
import type { Props } from './props.js';

export type { Mounted, MountOptions };

// The options of `mountLoginScreen()`: `theme`, a Mantine theme override merged over the login's own (indigo, a small
// radius), e.g. `createTheme({ primaryColor: 'teal' })`.
type MountOptions = {
  theme?: MantineThemeOverride;
};

type Mounted = {
  update(props: Partial<Props>, options?: MountOptions): void;
  unmount(): void;
};
