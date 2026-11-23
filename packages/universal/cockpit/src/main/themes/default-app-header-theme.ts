import type { AppHeaderTheme } from '../index.js';

export { DEFAULT_APP_HEADER_THEME };

// The design language's accent (`ui.css`), like the cockpit's.
const ACCENT = 'light-dark(#0a5cc2, #78b0ff)';

// The app header's defaults: the design language's values, like the cockpit's.
const DEFAULT_APP_HEADER_THEME: Readonly<Required<AppHeaderTheme>> = Object.freeze({
  fontFamily: 'system-ui, sans-serif',
  fontSize: '14px',
  backgroundColor: 'Canvas',
  textColor: 'CanvasText',
  dividerColor: 'light-dark(#dee2e6, #424242)',
  iconBackgroundColor: ACCENT,
  iconColor: 'light-dark(#fff, #111)',
  // A tile, not a button: a bit squarer than the buttons' 5px.
  iconBorderRadius: '3px',
  tabHoverBackgroundColor: 'light-dark(#f5f5f5, #1d1d1d)',
  tabActiveBackgroundColor: `color-mix(in srgb, ${ACCENT} 11%, transparent)`,
  tabActiveTextColor: ACCENT,
  linkTextColor: ACCENT,
  separatorColor: 'light-dark(#666, #bbb)',
  menuBackgroundColor: 'light-dark(#fff, #111)',
  menuBoxShadow: '0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%))',
  menuDescriptionTextColor: 'light-dark(#666, #bbb)',
  tooltipBackgroundColor: 'light-dark(#1f2328, #e8eaed)',
  tooltipTextColor: 'light-dark(#fff, #111)',
  tooltipBorderRadius: '6px',
  borderRadius: '5px',
  focusRingColor: ACCENT,
});
