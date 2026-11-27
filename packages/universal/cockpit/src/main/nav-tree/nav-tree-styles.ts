import { MENU_PLACEMENT_STYLES } from '../element/placement-styles.js';
import { overlayScrollbarStyles } from '../element/scrollbar-styles.js';
import type { CockpitTheme } from '../index.js';
import { accentOf, DEFAULT_COCKPIT_THEME } from '../themes/default-cockpit-theme.js';

export { navTreeStyles };

// The nav tree's CSS, in its shadow root, built from its theme (its values put straight in: no custom properties). Every
// `font-size` is a multiple of the theme's `fontSize` (`size(N)`, N the size in px at 14); no rem. The colors follow
// the element's `color-scheme` (`light-dark()`): in the cockpit's dark sidebar their dark side. The text color and the
// font are inherited (the host's), except the theme's `fontFamily` when given.
function navTreeStyles(theme: CockpitTheme): string {
  const fontSize = theme.fontSize ?? DEFAULT_COCKPIT_THEME.fontSize;
  const accent = accentOf(theme);
  const v = {
    accent,
    iconColor: theme.navTreeIconColor ?? accent,
    text: 'CanvasText',
    muted: 'light-dark(#666, #bbb)',
    divider: 'light-dark(#dee2e6, #424242)',
    hover: 'light-dark(#f5f5f5, #1d1d1d)',
    field: 'light-dark(#fff, #111)',
    border: 'light-dark(#b2b8be, #696a6c)',
    shadow: '0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%))',
    selected: `color-mix(in srgb, ${accent} 11%, transparent)`,
    ease: 'cubic-bezier(0.2, 0, 0, 1)',
  };
  const size = (px: number) => `calc(${fontSize} * ${px} / 14)`;

  return /* css */ `
:host {
  display: flex;
  flex-direction: column;
  min-height: 0;
  ${theme.fontFamily === undefined ? '' : `font-family: ${theme.fontFamily};`}
}

:host([hidden]) {
  display: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

button {
  font: inherit;
  color: inherit;
}

/* The fixed parts around the list: the slot \`top\` and the group select above it, the slot \`bottom\` below it. With a
   height from the host, only the list scrolls between them; without one, the tree is as tall as its content. */
.layout {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}

.top,
.bottom {
  flex: none;

  &[hidden] {
    display: none;
  }
}

.top {
  margin-bottom: 12px;
}

.bottom {
  margin-top: 12px;
}

/* The scrolling list. Reaching 12px out on both sides (the host's padding), so the active item's mark at the left edge
   and the focus rings are not cut off by its \`overflow\`. */
.scroll {
  flex: 1 1 auto;
  min-height: 0;
  margin-inline: -12px;
  padding-inline: 12px;
  overflow-y: auto;
  overscroll-behavior: none;

  /* Inside the cockpit: no scroll area (its sidebar scrolls). */
  &[data-embedded] {
    overflow: visible;
  }
}

:focus-visible {
  outline: 2px solid ${v.accent};
  outline-offset: -2px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;

  &[hidden] {
    display: none;
  }
}

.section + .section,
.section + .group,
.group + .section,
.group + .group {
  margin-top: 12px;
}

.section-label {
  margin: 0 0 4px;
  padding: 0 10px;
  color: ${v.muted};
  font-size: ${size(10)};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* A group without a name: a line in place of its heading, none for the first. */
.section-rule {
  height: 1px;
  margin: 0 8px 12px;
  border: 0;
  background: ${v.divider};

  .section:first-child > & {
    display: none;
  }
}

/* An item; the active one with a mark at the left edge, 12px out (in the cockpit, the sidebar's edge). */
.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 4px 8px 4px 6px;
  border-radius: 7px;
  color: inherit;
  font-size: ${size(13)};
  text-decoration: none;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: ${v.hover};
  }

  &[aria-current='page'] {
    background: ${v.selected};
    color: ${v.accent};
    font-weight: 600;

    &::before {
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: -12px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: ${v.accent};
      content: '';
    }
  }
}

.item-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* A marked item (\`marked\`, e.g. an open app): a dot right after its title, a bit above the middle of the text. */
.dot {
  flex: none;
  width: 5px;
  height: 5px;
  margin-inline-start: -5px;
  border-radius: 50%;
  background: ${v.accent};
  translate: 0 -4px;
}

/* The icon of an item, without a background. */
.tile {
  display: grid;
  flex: none;
  place-items: center;
  width: 28px;
  height: 28px;
  color: ${v.iconColor};

  svg {
    width: 1em;
    height: 1em;
    font-size: ${size(17)};
  }
}

/* The icon of a folder (none without one). */
.group-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 18px;
  height: 18px;
  color: ${v.iconColor};

  svg {
    width: 1em;
    height: 1em;
    font-size: ${size(16)};
  }
}

.chevron {
  width: 1em;
  height: 1em;
  flex: none;
  font-size: ${size(14)};
  fill: none;
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: rotate 150ms ${v.ease};

  [aria-expanded='true'] > & {
    rotate: 90deg;
  }
}

/* A collapsible group's heading (\`collapsible-groups\`). */
.group-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 28px;
  margin-bottom: 2px;
  padding: 0 8px 0 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: ${v.muted};
  font-size: ${size(10)};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: ${v.hover};
    color: ${v.text};
  }
}

.group-name,
.subgroup-name {
  flex: 1;
  overflow: hidden;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-count {
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${v.divider};
  color: ${v.muted};
  font-size: ${size(10)};
  letter-spacing: 0;
  text-align: center;
}

/* The items of a group or a folder, sliding open and closed: a grid row from \`0fr\` to \`1fr\`, the items fading in.
   The inner box cuts them off while it slides, reaching 12px out on both sides, so the active item's mark at the
   left edge and the focus rings stay whole. */
.collapse {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 180ms ${v.ease}, opacity 180ms ${v.ease};

  &[data-open] {
    grid-template-rows: 1fr;
    opacity: 1;
  }
}

.collapse-inner {
  min-height: 0;
  margin-inline: -12px;
  padding-inline: 12px;
  overflow: hidden;
}

/* A folder: its items indented along a guide line. */
.subgroup-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 32px;
  padding: 0 8px 0 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: ${v.text};
  font-size: ${size(13)};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${v.hover};
  }

  .chevron {
    color: ${v.muted};
  }
}

.subgroup-count {
  color: ${v.muted};
  font-size: ${size(10)};
  font-weight: 500;
}

.subgroup-list {
  margin: 1px 0 4px 14px;
  padding-left: 6px;
  border-left: 1px solid ${v.divider};

  .item[aria-current='page']::before {
    top: 6px;
    bottom: 6px;
    left: -7px;
  }
}

/* Its scrollbar like an overlay scrollbar: only over the list, wider on the pointer (\`overlayScrollbarStyles\`). */
${overlayScrollbarStyles('.scroll', v.divider)}

/* The group select (\`group-display="select"\`), fixed above the list: the chosen group and its count; 12px below
   it. */
.group-select {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  margin-bottom: 12px;
  padding: 0 8px 0 12px;
  /* No line at rest (its ground sets it apart), only on hover and while open; transparent, so nothing moves. */
  border: 1px solid transparent;
  border-radius: 5px;
  /* On a light ground a light gray, in a dark one the field color. */
  background: light-dark(#e3e6ea, ${v.field});
  font-size: ${size(13)};
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms;

  &:hover,
  &[data-state='open'] {
    border-color: ${v.border};
  }
}

.group-select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-select-icon {
  display: flex;
  color: ${v.muted};

  svg {
    width: 1em;
    height: 1em;
    font-size: ${size(16)};
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

/* Its list: a popover (the top layer), placed by CSS anchor positioning below the select, as wide as it. */
${MENU_PLACEMENT_STYLES}

.select-positioner {
  padding: 4px 0;
  border: 0;
  overflow: visible;
  background: none;
  color: inherit;

  /* MENU_PLACEMENT_STYLES sets its 'display', which would show it closed. */
  &:not(:popover-open) {
    display: none;
  }
}

.select-popup {
  display: flex;
  flex-direction: column;
  padding: 4px;
  border: 1px solid ${v.divider};
  border-radius: 8px;
  background: ${v.field};
  color: ${v.text};
  box-shadow: ${v.shadow};
  outline: none;
}

.select-list {
  min-height: 0;
  max-height: 384px;
  overflow-y: auto;
  overscroll-behavior: none;
  scrollbar-width: thin;
}

.select-item {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: ${size(14)};
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: ${v.hover};
  }

  &[aria-selected='true'] {
    color: ${v.accent};
    font-weight: 600;
  }
}

/* The highlighted item from the keyboard (the popup has the focus; :focus-visible only after keyboard input). */
.select-popup:focus-visible [data-highlighted] {
  outline: 2px solid ${v.accent};
  outline-offset: -2px;
}

.select-indicator {
  display: flex;

  &[hidden] {
    display: none;
  }

  svg {
    width: 1em;
    height: 1em;
    font-size: ${size(16)};
    fill: none;
    stroke: currentColor;
    stroke-width: 2.25;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.select-item-text {
  grid-column: 2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.select-item-count {
  grid-column: 3;
  color: ${v.muted};
  font-size: ${size(12)};
  font-weight: 400;
}

/* The density: the rows and the gaps a bit closer or a bit wider. */
:host([density='compact']) {
  .item {
    min-height: 32px;
    padding-block: 2px;
  }

  .group-trigger {
    height: 26px;
  }

  .subgroup-trigger {
    min-height: 30px;
  }

  .section + .section,
  .section + .group,
  .group + .section,
  .group + .group {
    margin-top: 8px;
  }

  .section-rule {
    margin-bottom: 8px;
  }
}

:host([density='comfortable']) {
  .item {
    min-height: 40px;
    padding-block: 6px;
  }

  .group-trigger {
    height: 30px;
  }

  .subgroup-trigger {
    min-height: 34px;
  }

  .section + .section,
  .section + .group,
  .group + .section,
  .group + .group {
    margin-top: 16px;
  }

  .section-rule {
    margin-bottom: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .item,
  .chevron,
  .collapse {
    transition: none;
  }
}
`;
}
