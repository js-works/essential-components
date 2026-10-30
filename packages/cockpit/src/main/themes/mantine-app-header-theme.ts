import type { AppHeaderTheme } from '../index.js';

export { MANTINE_APP_HEADER_THEME };

// The app header in an app built on Mantine: Mantine's variables as its values, so it follows the app's Mantine theme
// (its primary color, radius, text size, color scheme) and looks almost like Mantine's own components.
const MANTINE_APP_HEADER_THEME: AppHeaderTheme = Object.freeze({
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
  backgroundColor: 'var(--mantine-color-body)',
  textColor: 'var(--mantine-color-text)',
  dividerColor: 'var(--mantine-color-default-border)',
  iconBackgroundColor: 'var(--mantine-primary-color-filled)',
  iconColor: 'var(--mantine-color-white)',
  // Like Mantine's `ThemeIcon` with `radius="sm"`.
  iconBorderRadius: 'var(--mantine-radius-sm)',
  tabHoverBackgroundColor: 'var(--mantine-color-default-hover)',
  tabActiveBackgroundColor: 'var(--mantine-primary-color-light)',
  tabActiveTextColor: 'var(--mantine-primary-color-light-color)',
  linkTextColor: 'var(--mantine-color-anchor)',
  separatorColor: 'var(--mantine-color-dimmed)',
  menuBackgroundColor: 'var(--mantine-color-body)',
  menuBoxShadow: 'var(--mantine-shadow-md)',
  menuDescriptionTextColor: 'var(--mantine-color-dimmed)',
  // Mantine's `Tooltip`: dark gray on a light page, light gray on a dark one.
  tooltipBackgroundColor: 'light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-2))',
  tooltipTextColor: 'light-dark(var(--mantine-color-white), var(--mantine-color-black))',
  tooltipBorderRadius: 'var(--mantine-radius-default)',
  borderRadius: 'var(--mantine-radius-sm)',
  focusRingColor: 'var(--mantine-primary-color-filled)',
});
