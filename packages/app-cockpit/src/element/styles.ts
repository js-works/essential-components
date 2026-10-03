export { STYLES };

// The cockpit's CSS, in its shadow root. Its look follows the design language: the `--ui-*` tokens of `ui.css` (custom
// properties inherit into the shadow root), with fallbacks, so it also looks right on a page without `ui.css`. A host
// can override the `--app-cockpit-*` properties on the element.
const STYLES = /* css */ `
:host {
  --app-cockpit-sidebar-width: 16rem;
  --app-cockpit-rail-width: 4.25rem;
  --app-cockpit-content-padding: 1.25rem 1.5rem;
  /* The sidebar is dark in both color schemes of the page ("normal": it follows the page). */
  --app-cockpit-sidebar-scheme: dark;

  --background: var(--ui-color-background, Canvas);
  --text: var(--ui-color-text, CanvasText);
  --muted: var(--ui-color-muted, light-dark(#666, #bbb));
  --field: var(--ui-color-field, light-dark(#fff, #111));
  --border: var(--ui-color-border, light-dark(#b2b8be, #696a6c));
  --divider: var(--ui-color-divider, light-dark(#dee2e6, #424242));
  --hover: var(--ui-color-hover, light-dark(#f5f5f5, #1d1d1d));
  --subtle: var(--ui-color-subtle, light-dark(#f7f7f7, #1a1a1a));
  --accent: var(--ui-color-accent, light-dark(#0a5cc2, #78b0ff));
  --shadow: var(--ui-shadow-popup, 0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%)));
  --radius: var(--ui-radius, 2px);
  --button-radius: var(--ui-button-radius, 5px);
  --small: var(--ui-font-size-small, 0.875rem);
  /* The sidebar's text: a bit smaller than the page's small text (the popups keep theirs). */
  --sidebar-font-size: 0.8125rem;
  --sidebar-font-size-tiny: 0.625rem;
  /* The icons in the sidebar (and its popups): white strokes on the dark sidebar. */
  --sidebar-icon: light-dark(#1f2328, #fff);
  --sidebar: light-dark(#f4f5f7, #272a2f);
  --selected: color-mix(in srgb, var(--accent) 11%, transparent);
  --ease: cubic-bezier(0.2, 0, 0, 1);

  display: block;
  height: 100%;
  min-height: 0;
  color: var(--text);
}

/* The cockpit's own parts have a font of their own, so a mini-app's global CSS (e.g. a font on body) does not change
   them. The host itself keeps inheriting, so the mini-apps (its light-DOM children) do not get it. */
.frame,
.palette,
.tooltip {
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Zag hides closed popups with 'hidden'; their own 'display' must not show them. */
[hidden] {
  display: none !important;
}

.mount {
  position: relative;
  height: 100%;
}

button {
  font: inherit;
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.icon {
  flex: none;
  width: 1.125rem;
  height: 1.125rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* The frame: the sidebar, and the main area with the top bar and the content. */

.frame {
  display: grid;
  grid-template-columns: var(--app-cockpit-sidebar-width) minmax(0, 1fr);
  height: 100%;
  background: var(--background);
  transition: grid-template-columns 200ms var(--ease);

  &[data-rail] {
    grid-template-columns: var(--app-cockpit-rail-width) minmax(0, 1fr);
  }
}

/* Sidebar */

.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  min-height: 0;
  padding: 0.875rem 0.75rem 0.75rem;
  border-right: 1px solid var(--divider);
  background: var(--sidebar);
  color: var(--text);
  /* Every light-dark() color inside resolves to its dark side (also the ui-* tokens and the slotted parts). */
  color-scheme: var(--app-cockpit-sidebar-scheme);
  -webkit-user-select: none;
  user-select: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.25rem;
  /* The logo's left edge lines up with the app icons below. A subtle line below the header, from edge to edge of the
     sidebar (the margins undo the sidebar's padding). */
  margin: 0 -0.75rem;
  padding: 0 0.875rem 0.75rem 1.25rem;
  border-bottom: 1px solid var(--divider);
  overflow: hidden;

  ::slotted([slot='logo']) {
    flex: none;
    max-width: 2.25rem;
    max-height: 2.25rem;
  }
}

.brand-logo {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.5rem;
  height: 2.25rem;
  /* Transparent, in the accent color (its dark-scheme side: the sidebar is dark). */
  color: var(--accent);
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* The optional subtitle under the title (the config's subtitle), small and muted. */
.brand-subtitle {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.3;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.brand-title {
  overflow: hidden;
  font-size: 0.9375rem;
  line-height: 1.25;
  font-weight: 650;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.search-button {
  display: grid;
  flex: none;
  place-items: center;
  width: 2rem;
  height: 2rem;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover {
    background: var(--hover);
    color: var(--text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }
}

.key {
  flex: none;
  padding: 0.0625rem 0.3125rem;
  border: 1px solid var(--divider);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--background);
  color: var(--muted);
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.4;
}

.nav {
  flex: 1;
  min-height: 0;
  margin: 0 -0.75rem;
  padding: 0 0.75rem 0.5rem;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--divider) transparent;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.section + .section,
.section + .group,
.group + .section,
.group + .group {
  margin-top: 0.75rem;
}

.section-label {
  margin: 0 0 0.25rem;
  padding: 0 0.625rem;
  color: var(--muted);
  font-size: var(--sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.section-rule {
  height: 1px;
  margin: 0 0.5rem 0.75rem;
  border: 0;
  background: var(--divider);

  .section:first-child > & {
    display: none;
  }
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 2.25rem;
  padding: 0.25rem 0.5rem 0.25rem 0.375rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  font-size: var(--sidebar-font-size);
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: var(--hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* A group of the rail while its flyout is open. */
  &[data-state='open'] {
    background: var(--hover);
  }

  &[aria-current='page'],
  &[aria-current='true'] {
    background: var(--selected);
    color: var(--accent);
    font-weight: 600;

    &::before {
      position: absolute;
      top: 0.5rem;
      bottom: 0.5rem;
      left: -0.75rem;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--accent);
      content: '';
    }
  }
}

.item-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
  height: 1.75rem;
  margin-bottom: 0.125rem;
  padding: 0 0.5rem 0 0.375rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-size: var(--sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: var(--hover);
    color: var(--text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    width: 0.875rem;
    height: 0.875rem;
    stroke-width: 2.25;
    transition: rotate 150ms var(--ease);
  }

  &[data-panel-open] .icon--chevron {
    rotate: 90deg;
  }
}

/* The second level: a subgroup in a group, its apps indented along a guide line. */

.subgroup-trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
  min-height: 2rem;
  padding: 0 0.5rem 0 0.4375rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text);
  font-size: var(--sidebar-font-size);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--muted);
    stroke-width: 2.25;
    transition: rotate 150ms var(--ease);
  }

  &[data-panel-open] .icon--chevron {
    rotate: 90deg;
  }
}

.subgroup-name {
  flex: 1;
  overflow: hidden;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.subgroup-count {
  color: var(--muted);
  font-size: var(--sidebar-font-size-tiny);
  font-weight: 500;
}

.subgroup-list {
  margin: 1px 0 0.25rem 0.875rem;
  padding-left: 0.375rem;
  border-left: 1px solid var(--divider);

  .item[aria-current='page']::before {
    left: -0.4375rem;
    top: 0.375rem;
    bottom: 0.375rem;
  }
}

.group-name {
  flex: 1;
  overflow: hidden;
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-count {
  min-width: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  background: var(--divider);
  color: var(--muted);
  font-size: var(--sidebar-font-size-tiny);
  letter-spacing: 0;
  text-align: center;
}

/* The host's part at the bottom of the sidebar (the slot 'sidebar-end'), e.g. global switches; hidden in the rail. */
.sidebar-end ::slotted(*) {
  display: block;
  margin: 0 0.125rem 0.75rem;
}

/* The group select (groupDisplay: 'select'): the chosen group, its count, and the popup with all groups. */

.group-select {
  display: flex;
  flex: none;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  height: 2.5rem;
  padding: 0 0.5rem 0 0.75rem;
  border: 1px solid var(--divider);
  border-radius: var(--button-radius);
  background: var(--field);
  font-size: var(--sidebar-font-size);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms;

  &:hover,
  &[data-state='open'] {
    border-color: var(--border);
  }

  .group-count {
    flex: none;
  }
}

/* The icon of a group or a subgroup, in the accent color. */
.group-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent);

  svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .select-item & {
    grid-column: 2;
  }

  .subgroup-trigger & {
    width: 1.125rem;
    height: 1.125rem;

    svg {
      width: 1rem;
      height: 1rem;
    }
  }

  .group-trigger & {
    width: 1rem;
    height: 1rem;

    svg {
      width: 0.9375rem;
      height: 0.9375rem;
    }
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
  color: var(--muted);

  .icon {
    width: 1rem;
    height: 1rem;
  }
}

.select-positioner {
  z-index: 1000;
  outline: none;
}

.select-popup {
  color-scheme: var(--app-cockpit-sidebar-scheme);
  min-width: var(--reference-width);
  padding: 0.25rem;
  border: 1px solid var(--divider);
  border-radius: 8px;
  background: var(--field);
  color: var(--text);
  box-shadow: var(--shadow);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  transform-origin: var(--transform-origin);
  transition: opacity 120ms, scale 120ms var(--ease);

  @starting-style {
    opacity: 0;
    scale: 0.98;
  }
}

.select-list {
  max-height: min(24rem, var(--available-height));
  overflow-y: auto;
  scrollbar-width: thin;
}

.select-item {
  display: grid;
  grid-template-columns: 1rem auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  min-height: 2rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: var(--small);
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--hover);
  }

  &[data-state='checked'] {
    color: var(--accent);
    font-weight: 600;
  }
}

.select-indicator {
  grid-column: 1;
  display: flex;

  .icon {
    width: 1rem;
    height: 1rem;
    stroke-width: 2.25;
  }
}

.select-item-text {
  grid-column: 3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.select-item-count {
  grid-column: 4;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 400;
}

/* The signed-in user, above the footer: from edge to edge of the sidebar, a line on top. */
.user-row {
  flex: none;
  margin: 0 -0.75rem;
  padding: 0.375rem 0.5rem;
  border-top: 1px solid var(--divider);
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.25rem 0.5rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;

  &:is(button) {
    cursor: pointer;
  }

  &:is(button):hover,
  &[data-state='open'] {
    background: var(--hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron-right {
    margin-left: auto;
    color: var(--muted);
    width: 1rem;
    height: 1rem;
  }
}

/* The user's picture, or their initials on the accent color. */
.avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  background: color-mix(in srgb, var(--accent) 35%, var(--sidebar));
  color: #fff;
  font-size: 0.75rem;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.user-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.user-name,
.user-detail {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-name {
  font-size: var(--sidebar-font-size);
  font-weight: 600;
}

.user-detail {
  color: var(--muted);
  font-size: 0.75rem;
}

/* The footer: a dark bar of segments (the toggle, the host's actions, the kebab menu), flush with the sidebar's
   edges. */

.footer {
  --footer-background: light-dark(#33373d, #31353b);
  --footer-text: light-dark(#d5d8dc, #c4c7cc);
  --footer-hover: light-dark(rgb(255 255 255 / 9%), rgb(255 255 255 / 7%));
  --footer-divider: rgb(255 255 255 / 10%);

  display: flex;
  flex: none;
  align-items: stretch;
  min-height: 2.75rem;
  margin: 0 -0.75rem -0.75rem;
  background: var(--footer-background);
  color: var(--footer-text);
  color-scheme: dark;
}

.footer-actions {
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: center;
  min-width: 0;
}

.footer-button {
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 2.875rem;
  min-height: 2.75rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover,
  &[data-state='open'] {
    background: var(--footer-hover);
    color: #fff;
  }

  &:focus-visible {
    outline-color: light-dark(#9ec5ff, var(--accent));
    outline-offset: -3px;
  }

  .icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}

/* The host's actions share the room between the toggle and the kebab. */
.footer-actions > .footer-button {
  flex: 1 1 0;
  width: auto;
  min-width: 2.5rem;
}

/* The segments: the toggle and the kebab apart from the actions, by a line. */
.footer-toggle {
  box-shadow: 1px 0 0 var(--footer-divider);
}

.footer-more {
  box-shadow: -1px 0 0 var(--footer-divider);
}

.footer-icon {
  display: grid;
  place-items: center;

  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
}

.footer-badge {
  position: absolute;
  top: 0.625rem;
  right: 0.75rem;
  width: 0.5rem;
  height: 0.5rem;
  border: 2px solid var(--footer-background);
  border-radius: 50%;
  background: light-dark(#ff6b5b, #ff7b6b);
  box-sizing: content-box;
}

/* The menu of the kebab button. */

.menu-positioner {
  z-index: 1000;
  outline: none;
}

/* Zag gives a positioner the z-index of its content. */
.menu-popup,
.select-popup,
.flyout {
  z-index: 1000;
}

.menu-popup {
  color-scheme: var(--app-cockpit-sidebar-scheme);
  min-width: 13rem;
  padding: 0.25rem;
  border: 1px solid var(--divider);
  border-radius: 8px;
  background: var(--field);
  color: var(--text);
  box-shadow: var(--shadow);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  outline: none;
  transform-origin: var(--transform-origin);
  transition: opacity 120ms, scale 120ms var(--ease);

  @starting-style {
    opacity: 0;
    scale: 0.97;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: var(--small);
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--hover);
  }

  .key {
    margin-left: auto;
  }
}

.menu-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 1rem;
  height: 1rem;
  color: var(--muted);

  svg {
    width: 1rem;
    height: 1rem;
  }
}

.menu-label {
  flex: 1;
  white-space: nowrap;
}

/* A menu of the footer in the rail: a plain panel that touches the sidebar, like the groups' flyouts (square corners,
   a line between them, the sidebar's colors), but only as high as its entries. */
.menu-popup[data-flush] {
  padding: 0.375rem;
  border: 0;
  border-left: 1px solid var(--divider);
  border-radius: 0;
  background: var(--sidebar);
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);

  .menu-item {
    font-size: var(--sidebar-font-size);
  }

  @starting-style {
    opacity: 0;
    scale: 1;
    translate: -6px 0;
  }
}

/* With the sidebar expanded: a sheet on top of the footer, as wide as the sidebar (the line on top, the shadow upwards). */
.menu-popup[data-sheet] {
  width: var(--reference-width);
  border-top: 1px solid var(--divider);
  border-left: 0;
  box-shadow: 0 -8px 24px rgb(0 0 0 / 18%);

  @starting-style {
    translate: 0 6px;
  }
}

.menu-popup--choices {
  min-width: 11rem;
}

.menu-group-label {
  padding: 0.375rem 0.5rem 0.25rem;
  color: var(--muted);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* The check of a choice: only on the chosen one (the space stays, so the labels stay aligned). */
.menu-check {
  color: var(--accent);

  &:not([data-checked]) svg {
    visibility: hidden;
  }

  .icon {
    stroke-width: 2.25;
  }
}

.menu-item[data-checked] {
  color: var(--accent);
  font-weight: 600;
}

/* The flyout of a group in the rail: a panel at its button, touching the sidebar (square corners, a line between them),
   in its colors, only as high as its content; its apps by subgroup; long ones scroll. */
.flyout {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 15rem;
  max-height: var(--available-height);
  padding: 0.75rem 0.5rem;
  overflow-y: auto;
  border-left: 1px solid var(--divider);
  background: var(--sidebar);
  color: var(--text);
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);
  color-scheme: var(--app-cockpit-sidebar-scheme);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  font-size: var(--sidebar-font-size);
  outline: none;
  scrollbar-width: thin;
  -webkit-user-select: none;
  user-select: none;
  transition: opacity 120ms, translate 150ms var(--ease);

  @starting-style {
    opacity: 0;
    translate: -6px 0;
  }
}

.flyout-title {
  padding: 0.375rem 0.5rem 0.625rem;
  font-size: 0.9375rem;
  font-weight: 650;
}

.flyout-label {
  padding: 0.75rem 0.5rem 0.25rem;
  color: var(--muted);
  font-size: var(--sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.flyout-item {
  display: flex;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  outline: none;

  &[data-highlighted] {
    background: var(--hover);
  }

  &[data-current] {
    background: var(--selected);
    color: var(--accent);
    font-weight: 600;
  }
}

.menu-separator {
  height: 1px;
  margin: 0.25rem 0.375rem;
  background: var(--divider);
}

/* The icons of the sidebar and of its popups (apps, groups, subgroups): white strokes, in place of the accent color
   (the search palette keeps the accent). */
.sidebar,
.select-popup {
  .tile,
  .group-icon {
    color: var(--sidebar-icon);
  }
}

/* The handle on the sidebar's right edge (not in the rail): a thin line in the accent color while hovered, dragged
   or focused. While dragging, the width follows the pointer at once (no transition). */
.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  z-index: 2;
  width: 6px;
  cursor: col-resize;
  touch-action: none;

  &::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 2px;
    width: 2px;
    background: transparent;
    content: '';
    transition: background-color 120ms;
  }

  &:hover::after,
  &:focus-visible::after,
  .frame[data-resizing] &::after {
    background: var(--accent);
  }

  &:focus-visible {
    outline: none;
  }
}

.frame[data-resizing] {
  transition: none;
  cursor: col-resize;
  user-select: none;
}

/* The rail: icons only, centered. */

.frame[data-rail] {
  .sidebar {
    padding-inline: 0.625rem;
  }

  .brand {
    justify-content: center;
    margin-inline: -0.625rem;
    padding: 0 0 0.75rem;
  }

  .brand-text,
  .sidebar-end,
  .item-title,
  .section-label {
    display: none;
  }

  .search-button {
    width: 100%;
    height: 2.25rem;
    margin-left: 0;
  }

  .item {
    justify-content: center;
    padding-inline: 0;
  }

  .item[aria-current='page']::before {
    left: -0.625rem;
  }

  .user-row {
    margin-inline: -0.625rem;
    padding-inline: 0.625rem;
  }

  .user-button {
    justify-content: center;
    padding-inline: 0;
  }

  .user-text,
  .icon--chevron-right {
    display: none;
  }

  .footer,
  .footer-actions {
    flex-direction: column;
  }

  .footer {
    margin-inline: -0.625rem;
  }

  .footer-button {
    width: 100%;
  }

  .footer-toggle {
    order: 3;
    box-shadow: 0 -1px 0 var(--footer-divider);
  }

  .footer-more {
    box-shadow: 0 -1px 0 var(--footer-divider);
  }

  .footer-toggle .icon--panel {
    scale: -1 1;
  }

  .nav {
    margin-inline: -0.625rem;
    padding-inline: 0.625rem;
  }
}

/* The icon of an app (or its initials): no background, drawn in the accent color. */

.tile {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* Main: the open app, nothing else. */

.main {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: var(--app-cockpit-content-padding);
  overflow: auto;
}

/* An app that is not open is hidden, even if its own CSS sets a display (an outer rule would win over a normal one). */
::slotted([hidden]) {
  display: none !important;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 12rem;
  color: var(--muted);
  font-size: var(--small);

  p {
    margin: 0;
  }
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--divider);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

.retry-button {
  height: 2rem;
  padding: 0 0.875rem;
  border: 1px solid var(--border);
  border-radius: var(--button-radius);
  background: var(--field);
  cursor: pointer;

  &:hover {
    background: var(--hover);
  }
}

/* Tooltips (the labels of the rail) */

.tooltip {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
  pointer-events: none;
  padding: 0.3125rem 0.5rem;
  border-radius: 6px;
  background: light-dark(#1f2328, #e8eaed);
  color: light-dark(#fff, #111);
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: var(--shadow);
  transition: opacity 120ms, translate 120ms var(--ease);

  @starting-style {
    opacity: 0;
    translate: -4px 0;
  }

  &[data-side='top'] {
    @starting-style {
      translate: 0 4px;
    }
  }
}

/* Not shown until Floating UI has placed it. */
.tooltip:not([data-open]) {
  visibility: hidden;
}

/* The search (command palette) */

.backdrop {
  position: absolute;
  inset: 0;
  z-index: 1000;
  /* Only darker, no blur; only the open app (it starts where the rail ends: the sidebar is a rail while the search is
     open). */
  left: var(--app-cockpit-rail-width);
  background: light-dark(rgb(0 0 0 / 45%), rgb(0 0 0 / 60%));
  transition: opacity 150ms;

  @starting-style {
    opacity: 0;
  }
}

.palette {
  position: absolute;
  top: 0;
  bottom: 0;
  /* Right next to the rail (the sidebar is a rail while the search is open). */
  left: var(--app-cockpit-rail-width);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  width: min(26rem, 100%);
  overflow: hidden;
  border-left: 1px solid var(--divider);
  /* Dark like the sidebar, in both schemes of the page (it belongs to the cockpit's frame). */
  background: var(--sidebar);
  color: var(--text);
  box-shadow: 8px 0 24px rgb(0 0 0 / 22%);
  color-scheme: var(--app-cockpit-sidebar-scheme);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  transition: opacity 150ms, translate 180ms var(--ease);

  @starting-style {
    opacity: 0;
    translate: -8px 0;
  }

  &:focus-visible {
    outline: none;
  }
}

.palette-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--divider);
  color: var(--muted);

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.palette-input {
  flex: 1;
  min-width: 0;
  height: 3.25rem;
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 1rem;

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: var(--muted);
  }
}

.palette-list {
  flex: 1;
  min-height: 0;
  padding: 0.375rem;
  overflow: auto;
  overscroll-behavior: contain;
  scroll-padding: 0.375rem;
  scrollbar-width: thin;
}

.palette-section {
  padding: 0.625rem 0.625rem 0.25rem;
  color: var(--muted);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.palette-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.75rem;
  padding: 0.375rem 0.625rem;
  border-radius: 4px;
  cursor: pointer;

  &[data-current] {
    background: var(--selected);
  }
}

.palette-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.palette-title {
  overflow: hidden;
  font-size: var(--small);
  font-weight: 550;
  white-space: nowrap;
  text-overflow: ellipsis;

  mark {
    border-radius: 2px;
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    color: inherit;
  }
}

.palette-description {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.75rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-group {
  flex: none;
  max-width: 14rem;
  padding: 0.0625rem 0.5rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--subtle);
  box-shadow: inset 0 0 0 1px var(--divider);
  color: var(--muted);
  font-size: 0.6875rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-dot {
  flex: none;
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background: var(--accent);
}

.palette-empty {
  margin: 0;
  padding: 2.5rem 1rem;
  color: var(--muted);
  font-size: var(--small);
  text-align: center;
}

.palette-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--divider);
  background: rgb(0 0 0 / 14%);
  color: var(--muted);
  font-size: 0.75rem;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
}

.palette-count {
  margin-left: auto;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
}
`;
