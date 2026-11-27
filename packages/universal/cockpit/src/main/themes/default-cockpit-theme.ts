import type { CockpitTheme } from '../index.js';

export type { AccentKey };
export { accentOf, createCockpitTheme, DEFAULT_COCKPIT_THEME, withoutUndefined };

// The keys that follow the accent when not set: no default of their own.
type AccentKey =
  | 'navTreeIconColor'
  | 'headerIconBackgroundColor'
  | 'headerTabActiveBackgroundColor'
  | 'headerTabActiveTextColor'
  | 'headerLinkTextColor'
  | 'headerFocusRingColor';

// The defaults of every element (internal; a host starts from `createCockpitTheme()`): the design language's values
// (plain values; never its `--ui-*` tokens, which are for demos only). The base size of the text and the icons is 14px,
// the size of the apps' normal text (Mantine's `sm`). The keys that follow the accent (`AccentKey`) are not in it, so
// they follow a host's accent.
const DEFAULT_COCKPIT_THEME: Readonly<Required<Omit<CockpitTheme, AccentKey>>> = Object.freeze({
  accentColor: 'light-dark(#0a5cc2, #78b0ff)',
  fontSize: '14px',
  fontFamily: 'system-ui, sans-serif',
  buttonActiveTransform: 'none',
  buttonBorderRadius: '5px',
  sidebarWidth: '256px',
  railWidth: '68px',
  contentPadding: '16px 20px',
  headerBackgroundColor: 'Canvas',
  headerTextColor: 'CanvasText',
  headerDividerColor: 'light-dark(#dee2e6, #424242)',
  headerIconColor: 'light-dark(#fff, #111)',
  // A tile, not a button: a bit squarer than the buttons' 5px.
  headerIconBorderRadius: '3px',
  headerTabHoverBackgroundColor: 'light-dark(#f5f5f5, #1d1d1d)',
  headerSeparatorColor: 'light-dark(#666, #bbb)',
  headerMenuBackgroundColor: 'light-dark(#fff, #111)',
  headerMenuBoxShadow: '0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%))',
  headerMenuDescriptionTextColor: 'light-dark(#666, #bbb)',
  headerTooltipBackgroundColor: 'light-dark(#1f2328, #e8eaed)',
  headerTooltipTextColor: 'light-dark(#fff, #111)',
  headerTooltipBorderRadius: '6px',
  headerBorderRadius: '5px',
});

// The default theme with the given keys on top (an `undefined` key does not hide a default): a new object each call.
// Without `fontFamily`, whose default is the element's own (the cockpit's `system-ui`; the nav tree and the inline status view
// inherit the page's), unless given.
function createCockpitTheme(theme: CockpitTheme = {}): CockpitTheme {
  const { fontFamily: _, ...defaults } = DEFAULT_COCKPIT_THEME;

  return { ...defaults, ...withoutUndefined(theme) };
}

// The accent of a theme: the default (which has both sides), or a custom one, lighter in a dark scheme by a mix with
// white.
function accentOf(theme: CockpitTheme): string {
  return theme.accentColor === undefined || theme.accentColor === DEFAULT_COCKPIT_THEME.accentColor
    ? DEFAULT_COCKPIT_THEME.accentColor
    : `light-dark(${theme.accentColor}, color-mix(in oklab, ${theme.accentColor} 60%, white))`;
}

// A theme's keys that are set (an `undefined` must not hide a default).
function withoutUndefined(theme: CockpitTheme): CockpitTheme {
  return Object.fromEntries(Object.entries(theme).filter(([, value]) => value !== undefined));
}
