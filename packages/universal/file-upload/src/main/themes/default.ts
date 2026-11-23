import { constant } from '../core/utils.js';
import type { FileUploadTheme } from '../index.js';

export { DEFAULT_THEME };

// The default theme, used when the config has none: the values of the design language (`ui.css`, its `ui-*` tokens;
// the progress track takes the divider's, the statuses, the badge's mark and the tooltip have no token there). Also
// the base for an app's own theme: `{ ...DEFAULT_THEME, progressColor: '…' }`.
const DEFAULT_THEME = constant<FileUploadTheme>({
  badgeIconColor: '#fff',
  borderColor: 'light-dark(#b2b8be, #696a6c)',
  borderRadius: '4px',
  buttonBorderColor: 'light-dark(#b2b8be, #696a6c)',
  buttonBorderRadius: '5px',
  buttonHoverBackgroundColor: 'light-dark(#f5f5f5, #1d1d1d)',
  dangerColor: 'light-dark(#e03131, #ff6b6b)',
  dividerColor: 'light-dark(#dee2e6, #424242)',
  dragOverBackgroundColor: 'color-mix(in srgb, light-dark(#0a5cc2, #78b0ff) 10%, transparent)',
  dragOverBorderColor: 'light-dark(#0a5cc2, #78b0ff)',
  focusRingColor: 'light-dark(#0a5cc2, #78b0ff)',
  focusRingOffset: '2px',
  focusRingWidth: '2px',
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  iconButtonColor: 'light-dark(#666, #bbb)',
  mutedTextColor: 'light-dark(#666, #bbb)',
  previewBackgroundColor: 'light-dark(#fff, #111)',
  previewBorderRadius: '6px',
  progressColor: 'light-dark(#0a5cc2, #78b0ff)',
  progressTrackColor: 'light-dark(#dee2e6, #424242)',
  successColor: 'light-dark(#2f9e44, #51cf66)',
  textColor: 'inherit',
  thumbnailBackgroundColor: 'light-dark(#f7f7f7, #1a1a1a)',
  thumbnailBorderRadius: '2px',
  thumbnailIconColor: 'light-dark(#666, #bbb)',
  tooltipBackgroundColor: 'light-dark(#212529, #f1f3f5)',
  tooltipBorderRadius: '2px',
  tooltipTextColor: 'light-dark(#fff, #212529)',
});
