import { createAppHeaderClass } from './element/create-app-header-class.js';
import { createCockpitClass } from './element/create-cockpit-class.js';
import { DEFAULT_APP_HEADER_THEME, DEFAULT_COCKPIT_THEME, MANTINE_APP_HEADER_THEME } from './themes/index.js';

export type * from './api/base.js';
export type * from './api/header.js';
export type * from './api/i18n.js';
export type * from './api/menus.js';
export type * from './api/navigation.js';
export type * from './api/texts.js';
export type * from './api/theme.js';
export {
  createAppHeaderClass,
  createCockpitClass,
  DEFAULT_APP_HEADER_THEME,
  DEFAULT_COCKPIT_THEME,
  MANTINE_APP_HEADER_THEME,
};
