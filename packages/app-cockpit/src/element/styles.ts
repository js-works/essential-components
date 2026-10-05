export { STYLES };

// The cockpit's CSS, in its shadow root. Its look follows the design language: the `--ui-*` tokens of `ui.css` (custom
// properties inherit into the shadow root), with fallbacks, so it also looks right on a page without `ui.css`. A host
// can override the `--app-cockpit-*` properties on the element.
const STYLES = /* css */ `
:host {
  /* The base size of the cockpit's text, and of its icons (every font-size here is a multiple of it, 14 being the size of
     the apps' normal text, Mantine's sm). No rem anywhere in this file (2026-10-04, the user's rule): a page's root font
     size must not change the cockpit. */
  --app-cockpit-font-size: 14px;
  --app-cockpit-sidebar-width: 256px;
  --app-cockpit-rail-width: 68px;
  /* The topbar's top line (nav="topbar"). */
  --app-cockpit-topbar-height: 52px;
  --app-cockpit-content-padding: 20px 24px;
  /* The sidebar is dark in both color schemes of the page (nav-scheme="page": it follows the page). */
  --app-cockpit-sidebar-scheme: dark;

  --app-cockpit-background: var(--ui-color-background, Canvas);
  --app-cockpit-text: var(--ui-color-text, CanvasText);
  --app-cockpit-muted: var(--ui-color-muted, light-dark(#666, #bbb));
  --app-cockpit-field: var(--ui-color-field, light-dark(#fff, #111));
  --app-cockpit-border: var(--ui-color-border, light-dark(#b2b8be, #696a6c));
  --app-cockpit-divider: var(--ui-color-divider, light-dark(#dee2e6, #424242));
  --app-cockpit-hover: var(--ui-color-hover, light-dark(#f5f5f5, #1d1d1d));
  --app-cockpit-subtle: var(--ui-color-subtle, light-dark(#f7f7f7, #1a1a1a));
  /* The accent: the host's --app-accent-color (one color; lighter in a dark scheme, e.g. the sidebar), else the design
     language's. Without it, --app-cockpit-host-accent is invalid (an unset var()), so the fallback counts. */
  --app-cockpit-host-accent: light-dark(var(--app-accent-color), color-mix(in oklab, var(--app-accent-color) 60%, white));
  --app-cockpit-accent: var(--app-cockpit-host-accent, var(--ui-color-accent, light-dark(#0a5cc2, #78b0ff)));
  --app-cockpit-shadow: var(--ui-shadow-md, 0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%)));
  --app-cockpit-radius: var(--ui-radius-sm, 2px);
  /* Named with the prefix: a plain --button-radius leaked into the mini-apps (light DOM children of this host), where
     Mantine's buttons read that very name for their radius: all of them got 5px (2026-10-04). */
  --app-cockpit-button-radius: var(--ui-radius-md, 5px);
  --app-cockpit-small: var(--app-cockpit-font-size);
  /* The sidebar's text: a bit smaller than the page's small text (the popups keep theirs). */
  --app-cockpit-sidebar-font-size: calc(var(--app-cockpit-font-size) * 13 / 14);
  --app-cockpit-sidebar-font-size-tiny: calc(var(--app-cockpit-font-size) * 10 / 14);
  /* The icons in the sidebar (and its popups): white strokes on the dark sidebar. */
  --app-cockpit-sidebar-icon: light-dark(#1f2328, #fff);
  --app-cockpit-sidebar: light-dark(#f4f5f7, #272a2f);
  --app-cockpit-selected: color-mix(in srgb, var(--app-cockpit-accent) 11%, transparent);
  --app-cockpit-ease: cubic-bezier(0.2, 0, 0, 1);

  display: block;
  height: 100%;
  min-height: 0;
  color: var(--app-cockpit-text);
}

/* nav-scheme="page": the navigation follows the page (light on a light page, dark on a dark one). A host's own
   --app-cockpit-sidebar-scheme still wins (the page's CSS comes before :host). In the topbar, a line between the top
   line and the second one (both light then). */
:host([nav-scheme='page']) {
  /* "initial" makes the property "not set" (guaranteed invalid), so the "inherit" of every var(…, inherit) counts: the
     page's scheme. ("normal" would be light, also on a dark page.) */
  --app-cockpit-sidebar-scheme: initial;

  /* A line between the top line and the second one: a background, not a border, so that the triangle of the active group
     (nav="topbar") can cover it. */
  .top-line {
    background-image: linear-gradient(var(--app-cockpit-divider), var(--app-cockpit-divider));
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: 100% 1px;
  }

  /* The triangle of the active group (nav="topbar"): in a light navigation the accent (white on the light gray of the bar
     hardly shows; gray was tried and dropped), on a dark page the second line's color as always. */
  .topbar[data-two-lines] .sub-line::before {
    background: light-dark(var(--app-cockpit-accent), var(--app-cockpit-background));
  }
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
  outline: 2px solid var(--app-cockpit-accent);
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

/* Every icon is 1em wide and high; its size is the font-size (here, or where it is used). */
.icon,
.tile svg,
.group-icon svg,
.menu-icon svg,
.footer-icon svg,
.brand-logo svg {
  width: 1em;
  height: 1em;
}

.icon {
  flex: none;
  font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
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
  background: var(--app-cockpit-background);
  transition: grid-template-columns 320ms var(--app-cockpit-ease);

  &[data-rail] {
    grid-template-columns: var(--app-cockpit-rail-width) minmax(0, 1fr);
  }
}

/* Sidebar */

.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
  padding: 14px 12px 12px;
  border-right: 1px solid var(--app-cockpit-divider);
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  /* Every light-dark() color inside resolves to its dark side (also the ui-* tokens and the slotted parts). */
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  -webkit-user-select: none;
  user-select: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  /* The logo's left edge lines up with the app icons below. A subtle line below the header, from edge to edge of the
     sidebar (the margins undo the sidebar's padding). */
  margin: 0 -12px;
  padding: 0 14px 12px 20px;
  border-bottom: 1px solid var(--app-cockpit-divider);
  overflow: hidden;

  ::slotted([slot='logo']) {
    flex: none;
    max-width: 36px;
    max-height: 36px;
  }
}

/* The logo as the sidebar's toggle: a plain button around it. */
.brand-toggle {
  display: grid;
  flex: none;
  place-items: center;
  margin: 0 -4px;
  padding: 0 4px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }
}

/* The default logo: 22px (22px). */
.brand-logo svg {
  font-size: calc(var(--app-cockpit-font-size) * 22 / 14);
}

.brand-logo {
  display: grid;
  flex: none;
  place-items: center;
  width: 24px;
  height: 36px;
  /* Transparent, in the accent color (its dark-scheme side: the sidebar is dark). */
  color: var(--app-cockpit-accent);
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* The optional subtitle under the title (the config's subtitle), small and muted. */
.brand-subtitle {
  overflow: hidden;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.15;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* Room for the descenders (the line is tight; overflow is hidden for the ellipsis), without moving anything. */
  padding-bottom: 0.15em;
  margin: -1px 0 -0.15em;
}

.brand-title {
  overflow: hidden;
  font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
  line-height: 1.15;
  font-weight: 650;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-bottom: 0.15em;
  margin-bottom: -0.15em;
}

.search-button {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--app-cockpit-muted);
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }
}

.key {
  flex: none;
  padding: 1px 5px;
  border: 1px solid var(--app-cockpit-divider);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--app-cockpit-background);
  color: var(--app-cockpit-muted);
  font-family: inherit;
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 500;
  line-height: 1.4;
}

.nav {
  flex: 1;
  min-height: 0;
  margin: 0 -12px;
  padding: 0 12px 8px;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--app-cockpit-divider) transparent;
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
  margin-top: 12px;
}

.section-label {
  margin: 0 0 4px;
  padding: 0 10px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.section-rule {
  height: 1px;
  margin: 0 8px 12px;
  border: 0;
  background: var(--app-cockpit-divider);

  .section:first-child > & {
    display: none;
  }
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 4px 8px 4px 6px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  font-size: var(--app-cockpit-sidebar-font-size);
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* A group of the rail while its flyout is open. */
  &[data-state='open'] {
    background: var(--app-cockpit-hover);
  }

  &[aria-current='page'],
  &[aria-current='true'] {
    background: var(--app-cockpit-selected);
    color: var(--app-cockpit-accent);
    font-weight: 600;

    &::before {
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: -12px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--app-cockpit-accent);
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
  gap: 6px;
  width: 100%;
  height: 28px;
  margin-bottom: 2px;
  padding: 0 8px 0 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    font-size: calc(var(--app-cockpit-font-size) * 14 / 14);
    stroke-width: 2.25;
    transition: rotate 150ms var(--app-cockpit-ease);
  }

  &[data-panel-open] .icon--chevron {
    rotate: 90deg;
  }
}

/* The second level: a subgroup in a group, its apps indented along a guide line. */

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
  color: var(--app-cockpit-text);
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    font-size: calc(var(--app-cockpit-font-size) * 14 / 14);
    color: var(--app-cockpit-muted);
    stroke-width: 2.25;
    transition: rotate 150ms var(--app-cockpit-ease);
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
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 500;
}

.subgroup-list {
  margin: 1px 0 4px 14px;
  padding-left: 6px;
  border-left: 1px solid var(--app-cockpit-divider);

  .item[aria-current='page']::before {
    left: -7px;
    top: 6px;
    bottom: 6px;
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
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--app-cockpit-divider);
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  letter-spacing: 0;
  text-align: center;
}

/* The host's part at the bottom of the sidebar (the slot 'sidebar-end'), e.g. global switches; hidden in the rail. */
.sidebar-end ::slotted(*) {
  display: block;
  margin: 0 2px 12px;
}

/* The group select (groupDisplay: 'select'): the chosen group, its count, and the popup with all groups. */

.group-select {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  padding: 0 8px 0 12px;
  /* No line at rest, only on hover and while open (2026-10-05, the user's wish; the divider color at rest before): its
     ground sets it apart. Transparent, not none, so nothing moves. */
  border: 1px solid transparent;
  border-radius: var(--app-cockpit-button-radius);
  /* In a light sidebar a light gray, a step darker than the sidebar (2026-10-05, the user's wish; white before); in a
     dark one the field color as before. */
  background: light-dark(#e3e6ea, var(--app-cockpit-field));
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms;

  &:hover,
  &[data-state='open'] {
    border-color: var(--app-cockpit-border);
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
  width: 20px;
  height: 20px;
  color: var(--app-cockpit-accent);

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  }

  .select-item & {
    grid-column: 2;
  }

  .subgroup-trigger & {
    width: 18px;
    height: 18px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
    }
  }

  .group-trigger & {
    width: 16px;
    height: 16px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
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
  color: var(--app-cockpit-muted);

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
  }
}

.select-positioner {
  z-index: 1000;
  outline: none;
}

.select-popup {
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  min-width: var(--reference-width);
  padding: 4px;
  border: 1px solid var(--app-cockpit-divider);
  border-radius: 8px;
  background: var(--app-cockpit-field);
  color: var(--app-cockpit-text);
  box-shadow: var(--app-cockpit-shadow);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  transform-origin: var(--transform-origin);
  transition: opacity 120ms, scale 120ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    scale: 0.98;
  }
}

.select-list {
  max-height: min(384px, var(--available-height));
  overflow-y: auto;
  scrollbar-width: thin;
}

.select-item {
  display: grid;
  grid-template-columns: 16px auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: var(--app-cockpit-small);
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--app-cockpit-hover);
  }

  &[data-state='checked'] {
    color: var(--app-cockpit-accent);
    font-weight: 600;
  }
}

.select-indicator {
  grid-column: 1;
  display: flex;

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
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
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 400;
}

/* The signed-in user, above the footer: from edge to edge of the sidebar, a line on top. */
.user-row {
  flex: none;
  margin: 0 -12px;
  padding: 6px 8px;
  border-top: 1px solid var(--app-cockpit-divider);
}

.user-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 4px 8px;
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
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron-right {
    margin-left: auto;
    color: var(--app-cockpit-muted);
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
  }
}

/* The user's picture, or their initials on the accent color. */
.avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: color-mix(in srgb, var(--app-cockpit-accent) 35%, var(--app-cockpit-sidebar));
  /* White on the dark navigation, the accent on a light one (nav-scheme="page"). */
  color: light-dark(var(--app-cockpit-accent), #fff);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
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
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
}

.user-detail {
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
}

/* The footer: a dark bar of segments (the toggle, the host's actions, the kebab menu), flush with the sidebar's
   edges. */

.footer {
  /* The dark side: the dark navigation (the default); the light side: a light one (nav-scheme="page"), a light gray. */
  --app-cockpit-footer-background: light-dark(#e6e8eb, #31353b);
  --app-cockpit-footer-text: light-dark(#40454c, #c4c7cc);
  --app-cockpit-footer-hover: light-dark(rgb(0 0 0 / 6%), rgb(255 255 255 / 7%));
  --app-cockpit-footer-divider: light-dark(rgb(0 0 0 / 9%), rgb(255 255 255 / 10%));

  display: flex;
  flex: none;
  align-items: stretch;
  min-height: 44px;
  margin: 0 -12px -12px;
  background: var(--app-cockpit-footer-background);
  color: var(--app-cockpit-footer-text);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
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
  width: 46px;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover,
  &[data-state='open'] {
    background: var(--app-cockpit-footer-hover);
    color: light-dark(#111, #fff);
  }

  &:focus-visible {
    outline-color: light-dark(#9ec5ff, var(--app-cockpit-accent));
    outline-offset: -3px;
  }

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  }
}

/* The host's actions share the room between the toggle and the kebab. */
.footer-actions > .footer-button {
  flex: 1 1 0;
  width: auto;
  min-width: 40px;
}

/* The segments: the toggle and the kebab apart from the actions, by a line. */
.footer-toggle {
  box-shadow: 1px 0 0 var(--app-cockpit-footer-divider);
}

.footer-more {
  box-shadow: -1px 0 0 var(--app-cockpit-footer-divider);
}

.footer-icon {
  display: grid;
  place-items: center;

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 18 / 14);
  }
}

.footer-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 8px;
  height: 8px;
  border: 2px solid var(--app-cockpit-footer-background);
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
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  min-width: 208px;
  padding: 4px;
  border: 1px solid var(--app-cockpit-divider);
  border-radius: 8px;
  background: var(--app-cockpit-field);
  color: var(--app-cockpit-text);
  box-shadow: var(--app-cockpit-shadow);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  outline: none;
  transform-origin: var(--transform-origin);
  transition: opacity 120ms, scale 120ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    scale: 0.97;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: var(--app-cockpit-small);
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--app-cockpit-hover);
  }

  .key {
    margin-left: auto;
  }
}

.menu-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 16px;
  height: 16px;
  color: var(--app-cockpit-muted);

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
  }
}

.menu-label {
  flex: 1;
  white-space: nowrap;
}

/* A menu of the footer in the rail: a plain panel that touches the sidebar, like the groups' flyouts (square corners,
   a line between them, the sidebar's colors), but only as high as its entries. */
.menu-popup[data-flush] {
  padding: 6px;
  border: 0;
  border-left: 1px solid var(--app-cockpit-divider);
  border-radius: 0;
  background: var(--app-cockpit-sidebar);
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);

  .menu-item {
    font-size: var(--app-cockpit-sidebar-font-size);
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
  border-top: 1px solid var(--app-cockpit-divider);
  border-left: 0;
  box-shadow: 0 -8px 24px rgb(0 0 0 / 18%);

  @starting-style {
    translate: 0 6px;
  }
}

/* A menu of the topbar: a plain panel like the sidebar's (square corners, the sidebar's colors and text size), its top
   touching its line (a line between them), the shadow downwards. */
.menu-popup[data-drop] {
  padding: 6px;
  border: 0;
  border-top: 1px solid var(--app-cockpit-divider);
  border-radius: 0;
  background: var(--app-cockpit-sidebar);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);

  .menu-item {
    font-size: var(--app-cockpit-sidebar-font-size);
  }

  /* The highlight (hover, arrow keys) from the text color: the hover token is about the panel's color in the light
     scheme (the second line's menus). */
  .menu-item[data-highlighted] {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  @starting-style {
    opacity: 0;
    scale: 1;
    translate: 0 -6px;
  }
}

/* The group select in the top line (nav="topbar-compact"): a compact button, its popup like the other topbar menus: a plain panel,
   its top touching the line. */
.top-line .group-select {
  flex: none;
  width: auto;
  max-width: 240px;
  height: 32px;
  margin: 0 8px 0 4px;
  padding: 0 6px 0 10px;
  border-color: var(--app-cockpit-divider);
  border-radius: 7px;
  background: transparent;

  &:hover,
  &[data-state='open'] {
    border-color: var(--app-cockpit-border);
    background: var(--app-cockpit-hover);
  }
}

/* The app switcher (nav="switcher"): the open app as a dropdown button in the top line; its panel is the search
   panel, below the line at the button, a plain panel like the topbar's menus. */
.top-line .switcher {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  max-width: 320px;
  height: 32px;
  margin-left: 4px;
  padding: 0 6px 0 8px;
  border: 1px solid var(--app-cockpit-divider);
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--app-cockpit-sidebar-font-size);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 120ms, border-color 120ms;

  &:hover,
  &[aria-expanded='true'] {
    border-color: var(--app-cockpit-border);
    background: var(--app-cockpit-hover);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 17 / 14);
    }
  }

  .icon--selector {
    flex: none;
    font-size: calc(var(--app-cockpit-font-size) * 16 / 14);
    color: var(--app-cockpit-muted);
  }
}

.switcher-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mount[data-layout='topbar'][data-nav-style='switcher'] .palette {
  right: auto;
  left: var(--app-cockpit-switcher-left, 0px);
  width: min(416px, 100% - var(--app-cockpit-switcher-left, 0px));
  margin-inline: 0;
  border-radius: 0;
}

.select-popup[data-drop] {
  min-width: max(var(--reference-width), 208px);
  border: 0;
  border-top: 1px solid var(--app-cockpit-divider);
  border-radius: 0;
  background: var(--app-cockpit-sidebar);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
  font-size: var(--app-cockpit-sidebar-font-size);

  .select-item {
    font-size: var(--app-cockpit-sidebar-font-size);
  }

  /* The highlight from the text color (the hover token is about the panel's color in the light scheme). */
  .select-item[data-highlighted] {
    background: color-mix(in srgb, var(--app-cockpit-text) 9%, transparent);
  }

  @starting-style {
    opacity: 0;
    scale: 1;
    translate: 0 -6px;
  }
}

.menu-popup--choices {
  min-width: 176px;
}

.menu-group-label {
  padding: 6px 8px 4px;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* The check of a choice: only on the chosen one (the space stays, so the labels stay aligned). */
.menu-check {
  color: var(--app-cockpit-accent);

  &:not([data-checked]) svg {
    visibility: hidden;
  }

  .icon {
    stroke-width: 2.25;
  }
}

.menu-item[data-checked] {
  color: var(--app-cockpit-accent);
  font-weight: 600;
}

/* The flyout of a group in the rail: a panel at its button, touching the sidebar (square corners, a line between them),
   in its colors, only as high as its content; its apps by subgroup; long ones scroll. */
.flyout {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 240px;
  max-height: var(--available-height);
  padding: 12px 8px;
  overflow-y: auto;
  border-left: 1px solid var(--app-cockpit-divider);
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  font-size: var(--app-cockpit-sidebar-font-size);
  outline: none;
  scrollbar-width: thin;
  -webkit-user-select: none;
  user-select: none;
  transition: opacity 120ms, translate 150ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    translate: -6px 0;
  }
}

.flyout-title {
  padding: 6px 8px 10px;
  font-size: calc(var(--app-cockpit-font-size) * 15 / 14);
  font-weight: 650;
}

.flyout-label {
  padding: 12px 8px 4px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-sidebar-font-size-tiny);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.flyout-item {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  cursor: pointer;
  outline: none;

  &[data-highlighted] {
    background: var(--app-cockpit-hover);
  }

  &[data-current] {
    background: var(--app-cockpit-selected);
    color: var(--app-cockpit-accent);
    font-weight: 600;
  }
}

.menu-separator {
  height: 1px;
  margin: 4px 6px;
  background: var(--app-cockpit-divider);
}

/* The icons of the sidebar and of its popups (apps, groups, subgroups): white strokes, in place of the accent color
   (the search palette keeps the accent). */
.sidebar,
.select-popup {
  .tile,
  .group-icon {
    color: var(--app-cockpit-sidebar-icon);
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
    background: var(--app-cockpit-accent);
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
    padding-inline: 10px;
  }

  .brand {
    justify-content: center;
    margin-inline: -10px;
    padding: 0 0 12px;
  }

  .brand-text,
  .sidebar-end,
  .item-title,
  .section-label {
    display: none;
  }

  .search-button {
    width: 100%;
    height: 36px;
    margin-left: 0;
  }

  .item {
    justify-content: center;
    padding-inline: 0;
  }

  .item[aria-current='page']::before {
    left: -10px;
  }

  .user-row {
    margin-inline: -10px;
    padding-inline: 10px;
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
    margin-inline: -10px;
  }

  .footer-button {
    width: 100%;
  }

  .footer-toggle {
    order: 3;
    box-shadow: 0 -1px 0 var(--app-cockpit-footer-divider);
  }

  .footer-more {
    box-shadow: 0 -1px 0 var(--app-cockpit-footer-divider);
  }

  .footer-toggle .icon--panel {
    scale: -1 1;
  }

  .nav {
    margin-inline: -10px;
    padding-inline: 10px;
  }
}

/* The icon of an app (or its initials): no background, drawn in the accent color. */

.tile {
  display: grid;
  flex: none;
  place-items: center;
  width: 28px;
  height: 28px;
  color: var(--app-cockpit-accent);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;

  svg {
    font-size: calc(var(--app-cockpit-font-size) * 20 / 14);
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
  gap: 12px;
  min-height: 192px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-small);

  p {
    margin: 0;
  }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--app-cockpit-divider);
  border-top-color: var(--app-cockpit-accent);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

.retry-button {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--app-cockpit-border);
  border-radius: var(--app-cockpit-button-radius);
  background: var(--app-cockpit-field);
  cursor: pointer;

  &:hover {
    background: var(--app-cockpit-hover);
  }
}

/* Tooltips (the labels of the rail) */

.tooltip {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
  pointer-events: none;
  padding: 5px 8px;
  border-radius: 6px;
  background: light-dark(#1f2328, #e8eaed);
  color: light-dark(#fff, #111);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  font-weight: 500;
  box-shadow: var(--app-cockpit-shadow);
  transition: opacity 120ms, translate 120ms var(--app-cockpit-ease);

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
  width: min(416px, 100%);
  overflow: hidden;
  border-left: 1px solid var(--app-cockpit-divider);
  /* Dark like the sidebar, in both schemes of the page (it belongs to the cockpit's frame). */
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  box-shadow: 8px 0 24px rgb(0 0 0 / 22%);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  font-family: var(--app-cockpit-font-family, system-ui, sans-serif);
  transition: opacity 150ms, translate 180ms var(--app-cockpit-ease);

  @starting-style {
    opacity: 0;
    translate: -8px 0;
  }

  &:focus-visible {
    outline: none;
  }
}

/* Opened with the sidebar expanded: the sidebar collapses while the search slides in (both at once). The search's
   layer and the backdrop start at the sidebar's edge and move along with it (the frame's transition). */
.mount[data-layout='sidebar'][data-palette-from-expanded] {
  .palette-layer,
  .backdrop {
    transition: left 320ms var(--app-cockpit-ease), opacity 150ms;

    @starting-style {
      left: var(--app-cockpit-sidebar-width);
    }
  }

  .backdrop {
    @starting-style {
      opacity: 0;
    }
  }
}

/* Closing (sidebar layout): the search slides back out to the left and the backdrop fades, while the sidebar expands
   again (if it was expanded): the layer and the backdrop move back to its edge with it. */
.mount[data-layout='sidebar'][data-palette-closing] {
  .palette {
    pointer-events: none;
    animation: palette-out 240ms cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  .backdrop {
    animation: backdrop-out 240ms forwards;
  }

  /* The sidebar expands as fast as the search slides out. */
  .frame {
    transition-duration: 240ms;
  }

  &:has(.frame:not([data-rail])) {
    .palette-layer,
    .backdrop {
      left: var(--app-cockpit-sidebar-width);
      transition: left 240ms var(--app-cockpit-ease);
    }
  }
}

@keyframes palette-out {
  to {
    translate: -100% 0;
  }
}

@keyframes backdrop-out {
  to {
    opacity: 0;
  }
}

/* The sidebar layout: the search slides in from behind the rail, left to right. Its layer starts where the rail ends
   and clips it, so it does not pass over the rail. */
.mount[data-layout='sidebar'] {
  .palette-layer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: var(--app-cockpit-rail-width);
    z-index: 1001;
    overflow: hidden;
    pointer-events: none;
  }

  /* A keyframe animation, not a transition from @starting-style: that did not run again after the slide out. */
  .palette {
    left: 0;
    pointer-events: auto;
    transition: none;
    animation: palette-in 320ms var(--app-cockpit-ease);
  }
}

@keyframes palette-in {
  from {
    translate: -100% 0;
  }
}

.palette-field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid var(--app-cockpit-divider);
  color: var(--app-cockpit-muted);

  .icon {
    font-size: calc(var(--app-cockpit-font-size) * 20 / 14);
  }
}

.palette-input {
  flex: 1;
  min-width: 0;
  height: 52px;
  border: 0;
  background: transparent;
  color: var(--app-cockpit-text);
  font: inherit;
  font-size: calc(var(--app-cockpit-font-size) * 16 / 14);

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: var(--app-cockpit-muted);
  }
}

.palette-list {
  flex: 1;
  min-height: 0;
  padding: 6px;
  overflow: auto;
  overscroll-behavior: contain;
  scroll-padding: 6px;
  scrollbar-width: thin;
}

.palette-section {
  padding: 10px 10px 4px;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.palette-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;

  &[data-current] {
    background: var(--app-cockpit-selected);
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
  font-size: var(--app-cockpit-small);
  font-weight: 550;
  white-space: nowrap;
  text-overflow: ellipsis;

  mark {
    border-radius: 2px;
    background: color-mix(in srgb, var(--app-cockpit-accent) 22%, transparent);
    color: inherit;
  }
}

.palette-description {
  overflow: hidden;
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-group {
  flex: none;
  max-width: 224px;
  padding: 1px 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--app-cockpit-subtle);
  box-shadow: inset 0 0 0 1px var(--app-cockpit-divider);
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 11 / 14);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--app-cockpit-accent);
}

.palette-empty {
  margin: 0;
  padding: 40px 16px;
  color: var(--app-cockpit-muted);
  font-size: var(--app-cockpit-small);
  text-align: center;
}

.palette-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--app-cockpit-divider);
  /* As light as the panel in a light one (nav-scheme="page" on a light page; white was tried), a darker strip in a dark
     one. */
  background: light-dark(transparent, rgb(0 0 0 / 14%));
  color: var(--app-cockpit-muted);
  font-size: calc(var(--app-cockpit-font-size) * 12 / 14);

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.palette-count {
  margin-left: auto;
}

/* The topbar (nav="topbar"): a dark top line (logo, title, groups, search, actions, user), and a light line with
   the apps of the chosen group. Entries that do not fit wrap into a hidden second row (counted, and shown in "More"). */

.mount[data-layout='topbar'] {
  .frame {
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
  }

  /* The search: a panel below the top line, centered, only as high as its content. */
  .backdrop {
    top: var(--app-cockpit-topbar-height);
    left: 0;
  }

  .palette {
    top: var(--app-cockpit-topbar-height);
    right: 0;
    bottom: auto;
    left: 0;
    width: min(576px, 100% - 32px);
    max-height: min(544px, 100% - var(--app-cockpit-topbar-height) - 32px);
    margin-inline: auto;
    border: 1px solid var(--app-cockpit-divider);
    border-top: 0;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 12px 32px rgb(0 0 0 / 28%);

    @starting-style {
      opacity: 0;
      translate: 0 -8px;
    }
  }
}

.topbar {
  flex: none;
  -webkit-user-select: none;
  user-select: none;
}

.top-line {
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--app-cockpit-topbar-height);
  padding: 0 10px 0 16px;
  background: var(--app-cockpit-sidebar);
  color: var(--app-cockpit-text);
  color-scheme: var(--app-cockpit-sidebar-scheme, inherit);
  font-size: var(--app-cockpit-sidebar-font-size);

  .brand {
    flex: 0 1 auto;
    min-height: 0;
    max-width: 256px;
    margin: 0 12px 0 0;
    padding: 0;
    border: 0;
  }

  .search-button {
    margin-left: 4px;
  }

  /* The icons on the dark line: white strokes. */
  .tile,
  .group-icon {
    color: var(--app-cockpit-sidebar-icon);
  }
}

.sub-line {
  height: 40px;
  padding: 0 10px;
  border-bottom: 1px solid var(--app-cockpit-divider);
  background: var(--app-cockpit-background);
  color: var(--app-cockpit-text);
  font-size: var(--app-cockpit-sidebar-font-size);

  /* Its menus follow the page's scheme, like the line. */
  .menu-popup {
    color-scheme: inherit;
  }
}

.line {
  display: flex;
  flex: 1;
  align-self: stretch;
  min-width: 0;
}

.line-list {
  position: relative;
  display: flex;
  flex: 0 1 auto;
  flex-wrap: wrap;
  min-width: 0;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;

  > li {
    display: flex;
    flex: none;
    height: 100%;
  }
}

.tab {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: var(--app-cockpit-muted);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover,
  &[data-state='open'] {
    background: var(--app-cockpit-hover);
    color: var(--app-cockpit-text);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* The line under the chosen entry. */
  &::after {
    position: absolute;
    right: 8px;
    bottom: 0;
    left: 8px;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: transparent;
    content: '';
  }

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(var(--app-cockpit-font-size) * 17 / 14);
    }
  }

  .icon--chevron {
    font-size: calc(var(--app-cockpit-font-size) * 14 / 14);
    rotate: 90deg;
    stroke-width: 2.25;
  }
}

/* The top line: the group shown below is underlined; the group of the open app (and the open app itself, with one
   group) is bright and bold. */
.top-line .tab {
  &[aria-current] {
    color: var(--app-cockpit-text);
    font-weight: 600;
  }

  &[aria-pressed='true']::after,
  &[aria-current='page']::after {
    background: var(--app-cockpit-accent);
  }
}

/* Two lines (nav="topbar"): the active group is not underlined but marked by a triangle in the second line's color, in
   the middle of its tab, pointing up into the top line: as if a triangle was cut out of the bar (2026-10-04).
   The triangle belongs to the second line (a pseudo-element of it, reaching up over the top line): its color is the
   second line's, in the page's scheme (the top line may be dark: a color there would be the dark one). Its place:
   --app-cockpit-notch-x, set by the element (the middle of the active tab, from the left edge of the topbar). */
.topbar[data-two-lines] {
  .top-line .tab[aria-pressed='true']::after {
    background: transparent;
  }

  .sub-line {
    position: relative;

    &::before {
      position: absolute;
      top: -7px;
      left: var(--app-cockpit-notch-x, -48px);
      z-index: 1;
      width: 14px;
      height: 7px;
      translate: -50% 0;
      background: var(--app-cockpit-background);
      clip-path: polygon(50% 0, 0 100%, 100% 100%);
      content: '';
      pointer-events: none;
    }
  }
}

/* The second line: the open app (or the subgroup or "More" that has it) in the accent color, underlined. */
.sub-line .tab[aria-current] {
  color: var(--app-cockpit-accent);
  font-weight: 600;

  &::after {
    background: var(--app-cockpit-accent);
  }
}

/* The footer's actions and menu in the top line: plain icon buttons. */
.top-actions {
  display: flex;
  flex: none;
  align-items: center;

  .footer-button {
    width: 32px;
    min-height: 32px;
    height: 32px;
    border-radius: 7px;
    color: var(--app-cockpit-muted);

    &:hover,
    &[data-state='open'] {
      background: var(--app-cockpit-hover);
      color: var(--app-cockpit-text);
    }

    &:focus-visible {
      outline-color: var(--app-cockpit-accent);
      outline-offset: -2px;
    }
  }

  .footer-badge {
    top: 5px;
    right: 5px;
    border-color: var(--app-cockpit-sidebar);
  }
}

.top-user {
  display: grid;
  flex: none;
  place-items: center;
  margin-left: 6px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;

  &:is(button) {
    cursor: pointer;
  }

  &:focus-visible {
    outline-offset: 1px;
  }

  .avatar {
    width: 30px;
    height: 30px;
  }
}

/* The user's name on top of their menu (topbar). */
.menu-user {
  display: flex;
  flex-direction: column;
  padding: 6px 8px 4px;

  .user-name {
    font-size: var(--app-cockpit-small);
  }
}

.menu-item[data-current] {
  color: var(--app-cockpit-accent);
  font-weight: 600;
}

/* The density (the attribute 'density'; 'normal' is the rules above): the rows of the sidebar and the gaps between its
   sections and groups, a bit closer or a bit wider; the rows of the popups (menus, the group select's list, the
   flyouts) one step with them. The font sizes, the topbar's lines, the brand, the user row and the footer stay. */
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

  .menu-item,
  .select-item,
  .flyout-item {
    min-height: 30px;
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

  .menu-item,
  .select-item,
  .flyout-item {
    min-height: 34px;
  }
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
