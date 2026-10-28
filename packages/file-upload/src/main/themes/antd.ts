import { constant } from '../core/utils.js';
import type { FileUploadTheme } from '../index.js';

export { ANTD_THEME };

// The Ant Design theme: maps the values onto the CSS variables of antd 6, inherited into the shadow DOM. They follow
// the app's antd theme. antd sets its variables on a class of its own (`css-var-root` by default), which its components
// carry: so the upload sits inside one of them (a `Form`, `Modal`, `Drawer`, `Card`), as it almost always does.
const ANTD_THEME = constant<FileUploadTheme>({
  badgeIconColor: 'var(--ant-color-text-light-solid)',
  borderColor: 'var(--ant-color-border)',
  borderRadius: 'var(--ant-border-radius)',
  buttonBorderColor: 'var(--ant-color-border)',
  buttonBorderRadius: 'var(--ant-border-radius)',
  buttonHoverBackgroundColor: 'var(--ant-color-bg-text-hover)',
  dangerColor: 'var(--ant-color-error)',
  dividerColor: 'var(--ant-color-border-secondary)',
  dragOverBackgroundColor: 'var(--ant-color-primary-bg)',
  dragOverBorderColor: 'var(--ant-color-primary)',
  // antd has no variables for a focus ring of this kind: fixed values, like the other themes.
  focusRingColor: 'var(--ant-color-primary)',
  focusRingOffset: '2px',
  focusRingWidth: '2px',
  fontFamily: 'var(--ant-font-family)',
  fontSize: 'var(--ant-font-size)',
  iconButtonColor: 'var(--ant-color-icon)',
  mutedTextColor: 'var(--ant-color-text-secondary)',
  previewBackgroundColor: 'var(--ant-color-bg-elevated)',
  previewBorderRadius: 'var(--ant-border-radius-lg)',
  progressColor: 'var(--ant-color-primary)',
  // antd's own `Progress` track.
  progressTrackColor: 'var(--ant-color-fill-secondary)',
  successColor: 'var(--ant-color-success)',
  textColor: 'var(--ant-color-text)',
  thumbnailBackgroundColor: 'var(--ant-color-fill-tertiary)',
  thumbnailBorderRadius: 'var(--ant-border-radius-sm)',
  thumbnailIconColor: 'var(--ant-color-text-tertiary)',
  // antd's own `Tooltip`.
  tooltipBackgroundColor: 'var(--ant-color-bg-spotlight)',
  tooltipBorderRadius: 'var(--ant-border-radius)',
  tooltipTextColor: 'var(--ant-color-text-light-solid)',
});
