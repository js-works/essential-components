import type { CockpitTheme } from '../index.js';

export { DEFAULT_COCKPIT_THEME };

// The cockpit's defaults: the design language's values (plain values; never its `--ui-*` tokens, which are for demos
// only). The base size of its text and icons is 14px, the size of the apps' normal text (Mantine's `sm`). A host starts
// from it for its own: `{ ...DEFAULT_COCKPIT_THEME, accent: '#0f766e' }`.
const DEFAULT_COCKPIT_THEME: Readonly<Required<CockpitTheme>> = Object.freeze({
  accent: 'light-dark(#0a5cc2, #78b0ff)',
  fontSize: '14px',
  fontFamily: 'system-ui, sans-serif',
  sidebarWidth: '256px',
  railWidth: '68px',
  // Around the open app.
  contentPadding: '16px 20px',
});
