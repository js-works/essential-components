import type { CockpitTheme } from '../index.js';
import { createCockpitTheme, withoutUndefined } from './default-cockpit-theme.js';

export { createMantineCockpitTheme };

// The values for an app built on Mantine (the accent, the font, the buttons and the `header…` keys):
// Mantine's variables as their values, so they follow the app's Mantine theme (its primary color, radius, text size,
// color scheme) and the app header looks almost like Mantine's own components. Only inside a Mantine scope (where its
// variables are defined): an element in an app, not the shell above the apps.
const MANTINE_VALUES: CockpitTheme = Object.freeze({
  accentColor: 'var(--mantine-primary-color-filled)',
  // Mantine's press (`.mantine-active:active`, its theme's `activeClassName`): a global class does not reach into a
  // shadow root, so its transform is copied. An app that turns it off passes `buttonActiveTransform: 'none'`.
  buttonActiveTransform: 'translateY(calc(0.0625rem * var(--mantine-scale)))',
  // Like Mantine's `Button` (its theme's `defaultRadius`).
  buttonBorderRadius: 'var(--mantine-radius-default)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
  headerBackgroundColor: 'var(--mantine-color-body)',
  headerTextColor: 'var(--mantine-color-text)',
  headerDividerColor: 'var(--mantine-color-default-border)',
  headerIconBackgroundColor: 'var(--mantine-primary-color-filled)',
  headerIconColor: 'var(--mantine-color-white)',
  // Like Mantine's `ThemeIcon` with `radius="sm"`.
  headerIconBorderRadius: 'var(--mantine-radius-sm)',
  headerTabHoverBackgroundColor: 'var(--mantine-color-default-hover)',
  headerTabActiveBackgroundColor: 'var(--mantine-primary-color-light)',
  headerTabActiveTextColor: 'var(--mantine-primary-color-light-color)',
  headerLinkTextColor: 'var(--mantine-color-anchor)',
  headerSeparatorColor: 'var(--mantine-color-dimmed)',
  headerMenuBackgroundColor: 'var(--mantine-color-body)',
  headerMenuBoxShadow: 'var(--mantine-shadow-md)',
  headerMenuDescriptionTextColor: 'var(--mantine-color-dimmed)',
  // Mantine's `Tooltip`: dark gray on a light page, light gray on a dark one.
  headerTooltipBackgroundColor: 'light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-2))',
  headerTooltipTextColor: 'light-dark(var(--mantine-color-white), var(--mantine-color-black))',
  headerTooltipBorderRadius: 'var(--mantine-radius-default)',
  headerBorderRadius: 'var(--mantine-radius-sm)',
  headerFocusRingColor: 'var(--mantine-primary-color-filled)',
});

// The theme for the package's elements in an app built on Mantine: the default theme, Mantine's values on top, then
// the given keys (`createMantineCockpitTheme({ buttonActiveTransform: 'scale(0.96)' })`); a new object each call.
function createMantineCockpitTheme(theme: CockpitTheme = {}): CockpitTheme {
  return createCockpitTheme({ ...MANTINE_VALUES, ...withoutUndefined(theme) });
}
