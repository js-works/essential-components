import type { Theme } from '@blocknote/mantine';
import { BlockNoteContext } from '@blocknote/react';
import { useComputedColorScheme } from '@mantine/core';
import type { ReactNode } from 'react';

export { MANTINE_LOOK, SchemeContext };

// BlockNote in Mantine's look: its own colors, radius and font (the `--bn-*` variables of `@blocknote/mantine`, which
// style its Mantine menus like BlockNote) set to Mantine's variables. One theme for both schemes (the variables follow
// Mantine's scheme); BlockNote's highlight colors stay its own.
const MANTINE_LOOK: Theme = {
  colors: {
    editor: { text: 'var(--mantine-color-text)', background: 'transparent' },
    menu: { text: 'var(--mantine-color-text)', background: 'var(--mantine-color-body)' },
    tooltip: { text: 'var(--mantine-color-text)', background: 'var(--mantine-color-default-hover)' },
    hovered: { text: 'var(--mantine-color-text)', background: 'var(--mantine-color-default-hover)' },
    selected: { text: 'var(--mantine-primary-color-contrast)', background: 'var(--mantine-primary-color-filled)' },
    disabled: { text: 'var(--mantine-color-dimmed)', background: 'var(--mantine-color-default-hover)' },
    shadow: 'var(--mantine-shadow-md)',
    border: 'var(--mantine-color-default-border)',
    sideMenu: 'var(--mantine-color-dimmed)',
  },
  borderRadius: 4,
  fontFamily: 'var(--mantine-font-family)',
};

// With a theme object, BlockNote takes the scheme from its context (else from the system): Mantine's.
function SchemeContext({ children }: { children: ReactNode }) {
  const scheme = useComputedColorScheme('light');

  return <BlockNoteContext.Provider value={{ colorSchemePreference: scheme }}>{children}</BlockNoteContext.Provider>;
}
