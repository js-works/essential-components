import { constant } from '../core/utils.js';
import type { FileUploadTheme } from '../index.js';

export { MANTINE_THEME };

// The Mantine theme: maps the values onto Mantine's CSS variables, inherited into the shadow DOM. They adapt to
// Mantine's color scheme and to the app's Mantine theme (its primary color, radius, font).
const MANTINE_THEME: Required<FileUploadTheme> = constant({
  accentColor: 'var(--mantine-primary-color-filled)',
  accentTextColor: 'var(--mantine-primary-color-contrast)',
  textColor: 'var(--mantine-color-text)',
  mutedColor: 'var(--mantine-color-dimmed)',
  borderColor: 'var(--mantine-color-default-border)',
  surfaceColor: 'var(--mantine-color-default-hover)',
  successColor: 'var(--mantine-color-green-text)',
  dangerColor: 'var(--mantine-color-error)',
  borderRadius: 'var(--mantine-radius-default)',
  buttonBorderRadius: 'var(--mantine-radius-default)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
});
