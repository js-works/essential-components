import type { AppHeaderTheme } from '../index.js';
import { DEFAULT_APP_HEADER_THEME } from '../themes/default-app-header-theme.js';

export { appHeaderStyles };

// The header's CSS, in its shadow root, built from the theme (its values put straight in: no custom properties). Every
// `font-size` is a multiple of the theme's `fontSize` (`calc(${v.fontSize} * N / 14)`, N the size in px at 14); no rem:
// a page's root font size must not change it. Narrow (its own width, a container query): the tabs become a menu
// (below 896px), Back and Forward hide (below 640px).
function appHeaderStyles(theme: AppHeaderTheme): string {
  const v = { ...DEFAULT_APP_HEADER_THEME, ...withoutUndefined(theme) };
  const size = (px: number) => `calc(${v.fontSize} * ${px} / 14)`;

  return /* css */ `
:host {
  display: block;
  position: sticky;
  top: 0;
  z-index: 100;
  -webkit-user-select: none;
  user-select: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

[hidden] {
  display: none !important;
}

button {
  margin: 0;
  border: 0;
  font: inherit;
  color: inherit;
  background: none;
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  outline: 2px solid ${v.focusRingColor};
  outline-offset: 1px;
}

.header {
  container: app-header / inline-size;
  padding-inline: 16px;
  background: ${v.backgroundColor};
  color: ${v.textColor};
  font-family: ${v.fontFamily};
  font-size: ${v.fontSize};
}

.line {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  border-bottom: 1px solid ${v.dividerColor};
}

.icon {
  flex: none;
  font-size: ${size(18)};
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* The app's icon on its tile (hidden without one). */
.app-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: ${v.iconBorderRadius};
  background: ${v.iconBackgroundColor};
  color: ${v.iconColor};
  font-size: ${size(22)};

  svg {
    width: 1em;
    height: 1em;
  }

  ::slotted(svg) {
    width: 1em;
    height: 1em;
  }
}

.title {
  flex: none;
  padding: 0;
  font-size: ${size(16)};
  font-weight: 700;
  white-space: nowrap;
}

/* The title as the switcher: a button with a chevron. */
.title--switcher {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  margin-inline: -6px;
  border-radius: ${v.borderRadius};

  &:hover,
  &[data-state='open'] {
    background: ${v.tabHoverBackgroundColor};
  }

  .icon {
    font-size: ${size(16)};
  }
}

/* The modules as tabs; the current one in the accent's light ground. */
.modules {
  display: flex;
  gap: 2px;
  min-width: 0;
  margin-inline-start: 12px;
}

.tab,
.modules-trigger {
  padding: 6px 10px;
  border-radius: ${v.borderRadius};
  font-size: ${v.fontSize};
  white-space: nowrap;
}

.tab {
  &:hover {
    background: ${v.tabHoverBackgroundColor};
  }

  &[data-active] {
    background: ${v.tabActiveBackgroundColor};
    color: ${v.tabActiveTextColor};
  }
}

.modules-trigger {
  display: none;
  align-items: center;
  gap: 4px;
  background: ${v.tabActiveBackgroundColor};
  color: ${v.tabActiveTextColor};

  .icon {
    font-size: ${size(14)};
  }
}

.end {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  margin-inline-start: auto;
}

.history {
  display: flex;
  flex: none;
  gap: 2px;
}

.history-button {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: ${v.borderRadius};
  color: ${v.separatorColor};

  &:hover:not(:disabled) {
    background: ${v.tabHoverBackgroundColor};
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
}

/* The breadcrumb: its crumbs end with an ellipsis when it is too short; "Home" keeps its size. */
.crumbs {
  display: flex;
  align-items: center;
  min-height: 36px;
  overflow: hidden;
}

.crumb-list {
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: ${v.fontSize};
}

.crumb {
  display: flex;
  align-items: center;
  min-width: 0;
  white-space: nowrap;
}

.crumb--home {
  flex: none;
}

.crumb-separator {
  margin-inline: 6px;
  color: ${v.separatorColor};
}

.crumb-link,
.crumb-current {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;

  .icon {
    font-size: ${size(16)};
  }
}

.crumb-link {
  color: ${v.linkTextColor};

  &:hover {
    text-decoration: underline;
  }
}

/* The menus: the switcher's and the narrow modules menu. */
.menu-positioner {
  position: fixed;
  inset: auto;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: visible;
  background: none;
}

.menu-popup {
  min-width: 200px;
  max-height: inherit;
  padding: 4px;
  overflow: auto;
  overscroll-behavior: none;
  border: 1px solid ${v.dividerColor};
  border-radius: 6px;
  background: ${v.menuBackgroundColor};
  color: ${v.textColor};
  box-shadow: ${v.menuBoxShadow};
  font-family: ${v.fontFamily};
  font-size: ${v.fontSize};
  outline: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;

  &[data-highlighted] {
    background: ${v.tabHoverBackgroundColor};
  }

  &[aria-checked='true'] {
    color: ${v.tabActiveTextColor};
  }
}

.menu-popup:focus-visible .menu-item[data-highlighted] {
  outline: 2px solid ${v.focusRingColor};
  outline-offset: -2px;
}

.menu-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 16px;
  color: ${v.tabActiveTextColor};
  font-size: ${size(16)};

  svg {
    width: 1em;
    height: 1em;
  }
}

.menu-label {
  flex: 1;
  white-space: nowrap;
}

/* An entry with a description: the label and below it the description (two lines at most, muted); the icon and the
   check at the label's line. */
.menu-item:has(.menu-description) {
  align-items: flex-start;
  padding-block: 6px;

  .menu-icon,
  .menu-check {
    height: 1lh;
  }
}

.menu-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.menu-description {
  display: -webkit-box;
  max-width: 280px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${v.menuDescriptionTextColor};
  font-size: ${size(12)};
  line-height: 1.35;
  white-space: normal;
}

.menu-check {
  display: grid;
  flex: none;
  place-items: center;
  width: 16px;

  .icon {
    font-size: ${size(16)};
  }
}

.tooltip {
  position: fixed;
  inset: auto;
  top: 0;
  left: 0;
  margin: 0;
  border: 0;
  padding: 5px 8px;
  border-radius: ${v.tooltipBorderRadius};
  background: ${v.tooltipBackgroundColor};
  color: ${v.tooltipTextColor};
  font-family: ${v.fontFamily};
  font-size: ${size(12)};
  font-weight: 500;
  pointer-events: none;
}

@container app-header (width < 896px) {
  .modules {
    display: none;
  }

  .modules-trigger {
    display: inline-flex;
  }
}

@container app-header (width < 640px) {
  .history {
    display: none;
  }
}
`;
}

function withoutUndefined(theme: AppHeaderTheme): AppHeaderTheme {
  return Object.fromEntries(Object.entries(theme).filter(([, value]) => value !== undefined));
}
