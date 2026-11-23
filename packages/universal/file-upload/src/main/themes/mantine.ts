import { constant } from '../core/utils.js';
import type { FileUploadTheme } from '../index.js';

export { MANTINE_THEME };

// The Mantine theme: maps the values onto Mantine's CSS variables, inherited into the shadow DOM. They adapt to
// Mantine's color scheme and to the app's Mantine theme (its primary color, radius, font).
const MANTINE_THEME = constant<FileUploadTheme>({
  badgeIconColor: 'var(--mantine-primary-color-contrast)',
  borderColor: 'var(--mantine-color-default-border)',
  borderRadius: 'var(--mantine-radius-default)',
  buttonBorderColor: 'color-mix(in srgb, var(--mantine-color-default-border), var(--mantine-color-dimmed))',
  buttonBorderRadius: 'var(--mantine-radius-default)',
  buttonHoverBackgroundColor: 'var(--mantine-color-default-hover)',
  dangerColor: 'var(--mantine-color-error)',
  dividerColor: 'var(--mantine-color-default-border)',
  dragOverBackgroundColor: 'color-mix(in srgb, var(--mantine-primary-color-filled) 10%, transparent)',
  dragOverBorderColor: 'var(--mantine-primary-color-filled)',
  focusRingColor: 'var(--mantine-primary-color-filled)',
  // Mantine's own focus ring: fixed values, no variables.
  focusRingOffset: '2px',
  focusRingWidth: '2px',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
  iconButtonColor: 'var(--mantine-color-dimmed)',
  mutedTextColor: 'var(--mantine-color-dimmed)',
  previewBackgroundColor: 'var(--mantine-color-default-hover)',
  previewBorderRadius: 'calc(var(--mantine-radius-default) / 2)',
  progressColor: 'var(--mantine-primary-color-filled)',
  progressTrackColor: 'var(--mantine-color-default-hover)',
  successColor: 'var(--mantine-color-green-text)',
  textColor: 'var(--mantine-color-text)',
  thumbnailBackgroundColor: 'var(--mantine-color-default-hover)',
  thumbnailBorderRadius: 'calc(var(--mantine-radius-default) / 2)',
  thumbnailIconColor: 'var(--mantine-color-dimmed)',
  tooltipBackgroundColor: 'light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-2))',
  tooltipBorderRadius: 'calc(var(--mantine-radius-default) / 2)',
  tooltipTextColor: 'light-dark(var(--mantine-color-white), var(--mantine-color-black))',
});
