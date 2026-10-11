import type * as Spec from '../api';

export { layoutStyles, styles, themeValues };

// The theme's defaults (2026-10-10): the design language's values (plain values; never its `--ui-*` tokens, which are
// for demos only). The base size of the cockpit's text and icons is 14px, the size of the apps' normal text (Mantine's
// sm).
const DEFAULT_THEME: Required<Spec.Theme> = {
  accent: 'light-dark(#0a5cc2, #78b0ff)',
  fontSize: '14px',
  fontFamily: 'system-ui, sans-serif',
  sidebarWidth: '256px',
  railWidth: '68px',
  // Around the open app (2026-10-06, the user's wish: 20px 24px before, then 12px 16px for a moment).
  contentPadding: '16px 20px',
};

// The cockpit's CSS, in its shadow root: one stylesheet per theme (2026-10-10; static CSS with `--app-cockpit-*`
// custom properties before), its values put straight in (`v`), so the cockpit defines no custom properties (they
// would inherit into the mini-apps, its light DOM children). Every `font-size` is a multiple of the theme's `fontSize`
// (`calc(${v.fontSize} * N / 14)`, N the size in px at 14). No rem anywhere (2026-10-04, the user's rule): a page's root
// font size must not change the cockpit.
function styles(theme: Spec.Theme): string {
  const v = themeValues(theme);

  return /* css */ `

:host {
  display: block;
  height: 100%;
  min-height: 0;
  color: ${v.text};
}

/* nav-scheme="page": the navigation follows the page (light on a light page, dark on a dark one): every part that is
   dark by default has a nested :host([nav-scheme='page']) & rule with color-scheme: inherit. In the topbar, a line
   below it. */
:host([nav-scheme='page']) {
  /* A line below the topbar: a background, not a border (the line keeps its height; a triangle of the two-line topbar,
     removed 2026-10-08, covered it). White on a light page (2026-10-08, the user's wish: the sidebar's light gray looked
     like a toolbar there; like Jira Cloud's header), the sidebar's color on a dark one. */
  .top-line {
    background-color: light-dark(${v.field}, ${v.sidebar});
    background-image: linear-gradient(${v.divider}, ${v.divider});
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: 100% 1px;
  }

  /* The badge's ring in the line's color. */
  .top-actions .footer-badge {
    border-color: light-dark(${v.field}, ${v.sidebar});
  }
}

/* The cockpit's own parts have a font of their own, so a mini-app's global CSS (e.g. a font on body) does not change
   them. The host itself keeps inheriting, so the mini-apps (its light-DOM children) do not get it. */
.frame,
.palette,
.tooltip {
  font-family: ${v.fontFamily};
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Closed popups are 'hidden'; their own 'display' must not show them. */
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
  outline: 2px solid ${v.accent};
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

/* An item without an icon: its framed initials (initialsIcon(), like the taskbar's), in the rail and the flyouts. The
   letters are filled, not stroked; their size is in the SVG's units (24 = the icon's size). */
.icon--initials text {
  fill: currentColor;
  stroke: none;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: -0.3px;
  font-weight: 700;
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
  font-size: calc(${v.fontSize} * 18 / 14);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* The frame: the sidebar, and the main area with the top bar and the content. */

.frame {
  display: grid;
  grid-template-columns: ${v.sidebarWidth} minmax(0, 1fr);
  height: 100%;
  background: ${v.background};
  transition: grid-template-columns 320ms ${v.ease};

  &[data-rail] {
    grid-template-columns: ${v.railWidth} minmax(0, 1fr);
  }

  /* The taskbar (taskbar: true, 2026-10-07) below the open item; the sidebar over both rows. (In the topbar's column
     it simply follows the open item.) */
  &:has(> .taskbar) {
    grid-template-rows: minmax(0, 1fr) auto;

    & > .sidebar {
      grid-row: 1 / -1;
    }

    & > .taskbar {
      grid-column: 2;
    }
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
  border-right: 1px solid ${v.divider};
  background: ${v.sidebar};
  color: ${v.text};
  /* Every light-dark() color inside resolves to its dark side (also the slotted parts). */
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
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
  border-bottom: 1px solid ${v.divider};
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
    background: ${v.hover};
  }

  &:focus-visible {
    outline-offset: -2px;
  }
}

/* The default logo: 22px (22px). */
.brand-logo svg {
  font-size: calc(${v.fontSize} * 22 / 14);
}

.brand-logo {
  display: grid;
  flex: none;
  place-items: center;
  width: 24px;
  height: 36px;
  /* Transparent, in the accent color (its dark-scheme side: the sidebar is dark). */
  color: ${v.accent};
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* With a start page (start-page): the logo is a button that opens it; only the pointer shows it (2026-10-08, the user's
   wish; the title, underlined on hover, for a few hours before). */
.brand-start-page {
  display: grid;
  flex: none;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: ${v.radius};
  background: none;
  color: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${v.accent};
    outline-offset: 2px;
  }
}

/* The optional subtitle under the title (the config's subtitle), small and muted. */
.brand-subtitle {
  overflow: hidden;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 12 / 14);
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
  font-size: calc(${v.fontSize} * 15 / 14);
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
  color: ${v.muted};
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover {
    background: ${v.hover};
    color: ${v.text};
  }

  &:focus-visible {
    outline-offset: -2px;
  }
}

.key {
  flex: none;
  padding: 1px 5px;
  border: 1px solid ${v.divider};
  border-bottom-width: 2px;
  border-radius: 4px;
  background: ${v.background};
  color: ${v.muted};
  font-family: inherit;
  font-size: calc(${v.fontSize} * 11 / 14);
  font-weight: 500;
  line-height: 1.4;
}

.nav {
  flex: 1;
  min-height: 0;
  margin: 0 -12px;
  padding: 0 12px 8px;
  overflow: auto;
  /* No bounce at its ends (Firefox's elastic overscroll), and the page does not scroll on (2026-10-08; "contain"
     before, which kept the bounce). The same for every scroll area of the cockpit. */
  overscroll-behavior: none;
  scrollbar-width: thin;
  scrollbar-color: ${v.divider} transparent;
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
  color: ${v.muted};
  font-size: ${v.sidebarFontSizeTiny};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.section-rule {
  height: 1px;
  margin: 0 8px 12px;
  border: 0;
  background: ${v.divider};

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
  font-size: ${v.sidebarFontSize};
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: ${v.hover};
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* A group of the rail while its flyout is open. */
  &[data-state='open'] {
    background: ${v.hover};
  }

  &[aria-current='page'],
  &[aria-current='true'] {
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

/* An open item (with the taskbar, 2026-10-07), like the open one in the search panel: a dot right after its title (also
   in the flyouts). Not at the end of the row: that is kept for badges (later). In the rail, which has no titles, on the
   bottom right corner of its icon (a ring in the sidebar's color around it). */
.running-dot {
  flex: none;
  width: 5px;
  height: 5px;
  margin-inline-start: -5px;
  border-radius: 50%;
  background: ${v.accent};
  /* A bit above the middle of the text, like a superscript (2026-10-07, the user's wish; 6px in the middle before). */
  translate: 0 -4px;

  .tile > & {
    position: absolute;
    right: 2px;
    bottom: 3px;
    width: 7px;
    height: 7px;
    margin: 0;
    box-shadow: 0 0 0 2px ${v.sidebar};
    translate: none;
  }
}

.tile:has(> .running-dot) {
  position: relative;
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
  color: ${v.muted};
  font-size: ${v.sidebarFontSizeTiny};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    background: ${v.hover};
    color: ${v.text};
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    font-size: calc(${v.fontSize} * 14 / 14);
    stroke-width: 2.25;
    transition: rotate 150ms ${v.ease};
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
  color: ${v.text};
  font-size: ${v.sidebarFontSize};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${v.hover};
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron {
    font-size: calc(${v.fontSize} * 14 / 14);
    color: ${v.muted};
    stroke-width: 2.25;
    transition: rotate 150ms ${v.ease};
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
  color: ${v.muted};
  font-size: ${v.sidebarFontSizeTiny};
  font-weight: 500;
}

.subgroup-list {
  margin: 1px 0 4px 14px;
  padding-left: 6px;
  border-left: 1px solid ${v.divider};

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
  background: ${v.divider};
  color: ${v.muted};
  font-size: ${v.sidebarFontSizeTiny};
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
  border-radius: ${v.buttonRadius};
  /* In a light sidebar a light gray, a step darker than the sidebar (2026-10-05, the user's wish; white before); in a
     dark one the field color as before. */
  background: light-dark(#e3e6ea, ${v.field});
  font-size: ${v.sidebarFontSize};
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms;

  &:hover,
  &[data-state='open'] {
    border-color: ${v.border};
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
  color: ${v.accent};

  svg {
    font-size: calc(${v.fontSize} * 18 / 14);
  }

  .select-item & {
    grid-column: 2;
  }

  .subgroup-trigger & {
    width: 18px;
    height: 18px;

    svg {
      font-size: calc(${v.fontSize} * 16 / 14);
    }
  }

  .group-trigger & {
    width: 16px;
    height: 16px;

    svg {
      font-size: calc(${v.fontSize} * 15 / 14);
    }
  }
}

/* In the sidebar: a bit wider than the apps below it (the negative margins take back part of the sidebar's padding and
   gap), round corners. */
.sidebar > .group-select {
  width: auto;
  margin: -7px -7px 0;
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

  .icon {
    font-size: calc(${v.fontSize} * 16 / 14);
  }
}

.select-positioner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  outline: none;
}

.select-popup {
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
  /* As wide as its positioner (the trigger's width), and its list scrolls in the room left in the window. */
  display: flex;
  flex-direction: column;
  max-height: inherit;
  padding: 4px;
  border: 1px solid ${v.divider};
  border-radius: 8px;
  background: ${v.field};
  color: ${v.text};
  box-shadow: ${v.shadow};
  font-family: ${v.fontFamily};
  transition: opacity 120ms, scale 120ms ${v.ease};

  @starting-style {
    opacity: 0;
    scale: 0.98;
  }
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
  grid-template-columns: 16px auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: ${v.small};
  cursor: pointer;
  outline: none;
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

.select-indicator {
  grid-column: 1;
  display: flex;

  .icon {
    font-size: calc(${v.fontSize} * 16 / 14);
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
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 12 / 14);
  font-weight: 400;
}

/* The signed-in user, above the footer: from edge to edge of the sidebar, a line on top. */
.user-row {
  flex: none;
  margin: 0 -12px;
  padding: 6px 8px;
  border-top: 1px solid ${v.divider};
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
    background: ${v.hover};
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .icon--chevron-right {
    margin-left: auto;
    color: ${v.muted};
    font-size: calc(${v.fontSize} * 16 / 14);
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
  background: color-mix(in srgb, ${v.accent} 35%, ${v.sidebar});
  /* White on the dark navigation, the accent on a light one (nav-scheme="page"). */
  color: light-dark(${v.accent}, #fff);
  font-size: calc(${v.fontSize} * 12 / 14);
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
  font-size: ${v.sidebarFontSize};
  font-weight: 600;
}

.user-detail {
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 12 / 14);
}

/* The footer: a dark bar of segments (the toggle, the host's actions, the kebab menu), flush with the sidebar's
   edges. */

.footer {
  display: flex;
  flex: none;
  align-items: stretch;
  min-height: 44px;
  margin: 0 -12px -12px;
  background: ${v.footerBackground};
  color: ${v.footerText};
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
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
    background: ${v.footerHover};
    color: light-dark(#111, #fff);
  }

  &:focus-visible {
    outline-color: light-dark(#9ec5ff, ${v.accent});
    outline-offset: -3px;
  }

  .icon {
    font-size: calc(${v.fontSize} * 18 / 14);
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
  box-shadow: 1px 0 0 ${v.footerDivider};
}

.footer-more {
  box-shadow: -1px 0 0 ${v.footerDivider};
}

.footer-icon {
  display: grid;
  place-items: center;

  svg {
    font-size: calc(${v.fontSize} * 18 / 14);
  }
}

.footer-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 8px;
  height: 8px;
  border: 2px solid ${v.footerBackground};
  border-radius: 50%;
  background: light-dark(#ff6b5b, #ff7b6b);
  box-sizing: content-box;
}

/* The menu of the kebab button. */

/* Placed by its menu (menu.ts: left, top, width, max-height). */
.menu-positioner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  outline: none;
}

.menu-popup {
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
  min-width: 208px;
  padding: 4px;
  border: 1px solid ${v.divider};
  border-radius: 8px;
  background: ${v.field};
  color: ${v.text};
  box-shadow: ${v.shadow};
  font-family: ${v.fontFamily};
  outline: none;
  transition: opacity 120ms, scale 120ms ${v.ease};

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
  font-size: ${v.small};
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;

  &[data-highlighted] {
    background: ${v.hover};
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
  color: ${v.muted};

  svg {
    font-size: calc(${v.fontSize} * 16 / 14);
  }
}

/* An item's icon in a dropdown of the topbar's line (a folder, "More"): the accent, like the other popups. */
.menu-icon--item {
  color: ${v.accent};
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
  border-left: 1px solid ${v.divider};
  border-radius: 0;
  background: ${v.sidebar};
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);

  .menu-item {
    font-size: ${v.sidebarFontSize};
  }

  /* The highlight from the text color: the hover token is about the panel's color. */
  .menu-item[data-highlighted] {
    background: color-mix(in srgb, ${v.text} 9%, transparent);
  }

  @starting-style {
    opacity: 0;
    scale: 1;
    translate: -6px 0;
  }
}

/* With the sidebar expanded: a sheet on top of the footer, as wide as the sidebar (the line on top, the shadow upwards). */
.menu-popup[data-sheet] {
  border-top: 1px solid ${v.divider};
  border-left: 0;
  box-shadow: 0 -8px 24px rgb(0 0 0 / 18%);

  .menu-item[data-highlighted] {
    background: color-mix(in srgb, ${v.text} 9%, transparent);
  }

  @starting-style {
    translate: 0 6px;
  }
}

/* A menu of the topbar: a plain panel like the sidebar's (square corners, the sidebar's colors and text size), its top
   touching its line (a line between them), the shadow downwards. */
.menu-popup[data-drop] {
  padding: 6px;
  border: 0;
  border-top: 1px solid ${v.divider};
  border-radius: 0;
  background: ${v.sidebar};
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);

  .menu-item {
    font-size: ${v.sidebarFontSize};
  }

  /* The highlight (hover, arrow keys) from the text color: the hover token is about the panel's color in the light
     scheme (with nav-scheme="page"). */
  .menu-item[data-highlighted] {
    background: color-mix(in srgb, ${v.text} 9%, transparent);
  }

  @starting-style {
    opacity: 0;
    scale: 1;
    translate: 0 -6px;
  }
}

/* The app switcher (nav="top-switcher"): the open app as a dropdown button in the top line; its panel is the search
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
  border: 1px solid ${v.divider};
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: ${v.sidebarFontSize};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 120ms, border-color 120ms;

  &:hover,
  &[aria-expanded='true'] {
    border-color: ${v.border};
    background: ${v.hover};
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(${v.fontSize} * 17 / 14);
    }
  }

  .icon--selector {
    flex: none;
    font-size: calc(${v.fontSize} * 16 / 14);
    color: ${v.muted};
  }
}

.switcher-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mount[data-layout='topbar'][data-nav-style='switcher'] .palette {
  right: auto;
  left: 0px;
  width: min(416px, 100% - 0px);
  margin-inline: 0;
  border-radius: 0;
}

.menu-popup--choices {
  min-width: 176px;
}

.menu-group-label {
  padding: 6px 8px 4px;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 11 / 14);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* The check of a choice: only on the chosen one (the space stays, so the labels stay aligned). */
.menu-check {
  color: ${v.accent};

  &:not([data-checked]) svg {
    visibility: hidden;
  }

  .icon {
    stroke-width: 2.25;
  }
}

.menu-item[data-checked] {
  color: ${v.accent};
  font-weight: 600;
}

/* The flyout of a group in the rail: a panel at its button, touching the sidebar (square corners, a line between them),
   in its colors, only as high as its content; its apps by subgroup; long ones scroll. */
.flyout {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 240px;
  /* The room left in the window (its positioner's). */
  max-height: inherit;
  padding: 12px 8px;
  overflow-y: auto;
  overscroll-behavior: none;
  border-left: 1px solid ${v.divider};
  background: ${v.sidebar};
  color: ${v.text};
  box-shadow: 8px 0 24px rgb(0 0 0 / 18%);
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
  font-family: ${v.fontFamily};
  font-size: ${v.sidebarFontSize};
  outline: none;
  scrollbar-width: thin;
  -webkit-user-select: none;
  user-select: none;
  transition: opacity 120ms, translate 150ms ${v.ease};

  @starting-style {
    opacity: 0;
    translate: -6px 0;
  }
}

.flyout-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 10px;
  font-size: calc(${v.fontSize} * 15 / 14);
  font-weight: 650;
}

.flyout-label {
  padding: 12px 8px 4px;
  color: ${v.muted};
  font-size: ${v.sidebarFontSizeTiny};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.flyout-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 8px;
  border-radius: 6px;
  cursor: pointer;
  outline: none;

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(${v.fontSize} * 17 / 14);
    }
  }

  &[data-highlighted] {
    background: color-mix(in srgb, ${v.text} 9%, transparent);
  }

  &[data-current] {
    background: ${v.selected};
    color: ${v.accent};
    font-weight: 600;
  }
}

.menu-separator {
  height: 1px;
  margin: 4px 6px;
  background: ${v.divider};
}

/* The highlighted item of a menu, from the keyboard (2026-10-08, the user's wish): the focus ring of the other buttons
   (e.g. the two-pane menus' items). The popup has the focus (the item only aria-activedescendant); it matches
   :focus-visible only after keyboard input, so the mouse keeps the plain highlight. */
:is(.menu-popup, .flyout, .select-popup):focus-visible [data-highlighted] {
  outline: 2px solid ${v.accent};
  outline-offset: -2px;
}

/* The icons of the sidebar (apps, groups, subgroups): white strokes, in place of the accent color. Its popups (the
   rail's flyouts, the group select) keep the accent, like the search palette (2026-10-06, the user's wish); they are
   in the sidebar's DOM, so they set it back. */
.sidebar {
  .tile,
  .group-icon {
    color: ${v.sidebarIcon};
  }

  :is(.flyout, .select-popup) :is(.tile, .group-icon) {
    color: ${v.accent};
  }
}

/* The icons of the expanded sidebar a bit smaller (2026-10-09, the user's wish, like the topbar's tabs): an app's 17 at 14
   (20 before), a subgroup's 16 (18). Their boxes stay, so the titles do not move. Not in the rail, where the icon is all
   there is, nor in its flyouts. */
.sidebar {
  .item > .tile svg {
    font-size: calc(${v.fontSize} * 17 / 14);
  }

  .subgroup-trigger > .group-icon svg {
    font-size: calc(${v.fontSize} * 16 / 14);
  }
}

.frame[data-rail] .sidebar .item > .tile svg {
  font-size: calc(${v.fontSize} * 20 / 14);
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
    background: ${v.accent};
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
    box-shadow: 0 -1px 0 ${v.footerDivider};
  }

  .footer-more {
    box-shadow: 0 -1px 0 ${v.footerDivider};
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
  color: ${v.accent};
  font-size: calc(${v.fontSize} * 11 / 14);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;

  svg {
    font-size: calc(${v.fontSize} * 20 / 14);
  }
}

/* Main: the open app, nothing else. */

.main {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: ${v.contentPadding};
  overflow: auto;
  overscroll-behavior: none;

  /* Less in the topbars and beside the rail (2026-10-08, the user's wish): the app has more room there. A plain value
     (not the theme's): the theme's contentPadding counts only beside the expanded sidebar and the bottom
     bar. */
  .mount[data-layout='topbar'] &,
  .frame[data-rail] & {
    padding: 12px 16px;
  }
}

/* An app that is not open is hidden, even if its own CSS sets a display (an outer rule would win over a normal one). */
::slotted([hidden]) {
  display: none !important;
}

/* The start page (startPage, 2026-10-08): while no app is open. In the page's scheme: the title, the filter as a large
   field, and the apps as cards, by folder, in a grid. */
.start-page {
  padding: 40px 0 56px;
}

.start-page-inner {
  display: flex;
  flex-direction: column;
  gap: 36px;
  max-width: 1080px;
  margin: 0 auto;
}

.start-page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.start-page-title {
  margin: 0;
  font-size: calc(${v.fontSize} * 28 / 14);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.start-page-subtitle {
  margin: 0;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 15 / 14);
}

/* The filter (2026-10-08; a field-like button that opened the search panel before): the icon, the input, a clear
   button while there is text. The frame is the field's; the accent while hovered or focused. */
.start-page-search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(100%, 36rem);
  height: 44px;
  margin-top: 20px;
  padding: 0 6px 0 14px;
  border: 1px solid ${v.border};
  border-radius: ${v.buttonRadius};
  background: ${v.field};
  color: ${v.muted};
  transition: border-color 120ms;

  &:hover {
    border-color: ${v.accent};
  }

  &:focus-within {
    border-color: ${v.accent};
    outline: 2px solid color-mix(in srgb, ${v.accent} 25%, transparent);
  }

  > svg {
    flex: none;
    font-size: calc(${v.fontSize} * 18 / 14);
  }
}

.start-page-search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: none;
  color: ${v.text};
  font: inherit;
  font-size: calc(${v.fontSize} * 15 / 14);

  &::placeholder {
    color: ${v.muted};
  }

  /* The browser's own clear button: ours is there. */
  &::-webkit-search-cancel-button {
    appearance: none;
  }
}

.start-page-search-clear {
  display: grid;
  flex: none;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: ${v.buttonRadius};
  background: none;
  color: ${v.muted};
  cursor: pointer;

  &:hover {
    background: ${v.hover};
    color: ${v.text};
  }

  &:focus-visible {
    outline: 2px solid ${v.accent};
    outline-offset: -2px;
  }
}

/* No card matches the filter. */
.start-page-empty {
  margin: 0;
  color: ${v.muted};
  text-align: center;
}

.start-page-section {
  min-width: 0;
}

/* A folder's name: small, uppercase, muted, with its icon. */
.start-page-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 12 / 14);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.start-page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* An app: its icon on a light ground of the accent, its title, its description (two lines at most). */
.start-page-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  height: 100%;
  padding: 14px;
  border: 1px solid ${v.divider};
  border-radius: 6px;
  background: ${v.background};
  color: ${v.text};
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: border-color 120ms, box-shadow 120ms;

  &:hover {
    border-color: color-mix(in srgb, ${v.accent} 45%, ${v.divider});
    box-shadow: ${v.shadow};
  }

  &:focus-visible {
    outline: 2px solid ${v.accent};
    outline-offset: 2px;
  }

  .tile {
    width: 38px;
    height: 38px;
    border-radius: ${v.buttonRadius};
    background: ${v.selected};
  }
}

.start-page-card-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding-top: 1px;
}

.start-page-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;

  .running-dot {
    margin: 0;
    translate: none;
  }
}

.start-page-card-description {
  display: -webkit-box;
  overflow: hidden;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 13 / 14);
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (prefers-reduced-motion: reduce) {
  .start-page-search,
  .start-page-card {
    transition: none;
  }
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 192px;
  color: ${v.muted};
  font-size: ${v.small};

  p {
    margin: 0;
  }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid ${v.divider};
  border-top-color: ${v.accent};
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
  border: 1px solid ${v.border};
  border-radius: ${v.buttonRadius};
  background: ${v.field};
  cursor: pointer;

  &:hover {
    background: ${v.hover};
  }
}

/* Tooltips (the labels of the rail): a popover, in the top layer (also above an open dialog). */

.tooltip {
  position: fixed;
  inset: auto;
  top: 0;
  left: 0;
  z-index: 1100;
  margin: 0;
  overflow: visible;
  border: 0;
  pointer-events: none;
  padding: 5px 8px;
  border-radius: 6px;
  background: light-dark(#1f2328, #e8eaed);
  color: light-dark(#fff, #111);
  font-size: calc(${v.fontSize} * 12 / 14);
  font-weight: 500;
  box-shadow: ${v.shadow};
  transition: opacity 120ms, translate 120ms ${v.ease};

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

/* The search and the bottom bar's sheet are modal <dialog>s (2026-10-08; Zag.js before), in the top layer: the element
   sets each to the cockpit's rectangle (left, top, width, height), so their parts lie in the cockpit as before. */
.dialog {
  position: fixed;
  inset: auto;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  overflow: visible;
  border: 0;
  background: transparent;
  color: inherit;

  &::backdrop {
    background: transparent;
  }
}

/* The search (command palette) */

.backdrop {
  position: absolute;
  inset: 0;
  z-index: 1000;
  /* Only darker, no blur; only the open app (it starts where the rail ends: the sidebar is a rail while the search is
     open). */
  left: ${v.railWidth};
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
  left: ${v.railWidth};
  z-index: 1001;
  display: flex;
  flex-direction: column;
  width: min(416px, 100%);
  overflow: hidden;
  border-left: 1px solid ${v.divider};
  /* Dark like the sidebar, in both schemes of the page (it belongs to the cockpit's frame). */
  background: ${v.sidebar};
  color: ${v.text};
  box-shadow: 8px 0 24px rgb(0 0 0 / 22%);
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
  font-family: ${v.fontFamily};
  transition: opacity 150ms, translate 180ms ${v.ease};

  @starting-style {
    opacity: 0;
    translate: -8px 0;
  }

  &:focus-visible {
    outline: none;
  }
}

/* Opened with the sidebar expanded: the sidebar collapses first, then the search slides in. The search's
   layer and the backdrop start at the sidebar's edge and move along with it (the frame's transition). */
.mount[data-layout='sidebar'][data-palette-from-expanded] {
  .palette-layer,
  .backdrop {
    transition: left 320ms ${v.ease}, opacity 150ms;

    @starting-style {
      left: ${v.sidebarWidth};
    }
  }

  .backdrop {
    @starting-style {
      opacity: 0;
    }
  }

  /* First the sidebar collapses, then the search slides in (hidden until then). */
  .palette {
    animation-delay: 320ms;
    animation-fill-mode: backwards;
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
      left: ${v.sidebarWidth};
      transition: left 240ms ${v.ease};
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
    left: ${v.railWidth};
    z-index: 1001;
    overflow: hidden;
    pointer-events: none;
  }

  /* A keyframe animation, not a transition from @starting-style: that did not run again after the slide out. */
  .palette {
    left: 0;
    pointer-events: auto;
    transition: none;
    animation: palette-in 320ms ${v.ease};
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
  border-bottom: 1px solid ${v.divider};
  color: ${v.muted};

  .icon {
    font-size: calc(${v.fontSize} * 20 / 14);
  }

  /* The close button: the highlight from the text color (the hover token is about the panel's color). */
  .search-button:hover {
    background: color-mix(in srgb, ${v.text} 9%, transparent);
  }
}

.palette-input {
  flex: 1;
  min-width: 0;
  height: 52px;
  border: 0;
  background: transparent;
  color: ${v.text};
  font: inherit;
  font-size: calc(${v.fontSize} * 16 / 14);

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: ${v.muted};
  }
}

.palette-list {
  flex: 1;
  min-height: 0;
  padding: 6px;
  overflow: auto;
  overscroll-behavior: none;
  scroll-padding: 6px;
  scrollbar-width: thin;
}

.palette-section {
  padding: 10px 10px 4px;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 11 / 14);
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
    background: ${v.selected};
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
  font-size: ${v.small};
  font-weight: 550;
  white-space: nowrap;
  text-overflow: ellipsis;

  mark {
    border-radius: 2px;
    background: color-mix(in srgb, ${v.accent} 22%, transparent);
    color: inherit;
  }
}

.palette-description {
  overflow: hidden;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 12 / 14);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-group {
  flex: none;
  max-width: 224px;
  padding: 1px 8px;
  overflow: hidden;
  border-radius: 999px;
  background: ${v.subtle};
  box-shadow: inset 0 0 0 1px ${v.divider};
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 11 / 14);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.palette-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${v.accent};
}

.palette-empty {
  margin: 0;
  padding: 40px 16px;
  color: ${v.muted};
  font-size: ${v.small};
  text-align: center;
}

.palette-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 8px 16px;
  border-top: 1px solid ${v.divider};
  /* As light as the panel in a light one (nav-scheme="page" on a light page; white was tried), a darker strip in a dark
     one. */
  background: light-dark(transparent, rgb(0 0 0 / 14%));
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 12 / 14);

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.palette-count {
  margin-left: auto;
}

/* The topbar (nav="top"): a dark top line (logo, title, groups, search, actions, user), and a light line with
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
    top: ${v.topbarHeight};
    left: 0;
  }

  .palette {
    top: ${v.topbarHeight};
    right: 0;
    bottom: auto;
    left: 0;
    width: min(576px, 100% - 32px);
    max-height: min(544px, 100% - ${v.topbarHeight} - 32px);
    margin-inline: auto;
    border: 1px solid ${v.divider};
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

/* The bottom bar (nav="bottom", or "auto" when narrow; 2026-10-06): the open app over the whole height, a bar below it
   in the sidebar's colors (Apps, the three apps used last, the search), above the device's home indicator. */
.mount[data-layout='bottom'] {
  .frame {
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
  }

  /* The search over the whole cockpit, sliding up. */
  .backdrop {
    left: 0;
  }

  .palette {
    top: auto;
    left: 0;
    width: 100%;
    height: 100%;
    border-left: 0;
    box-shadow: none;

    @starting-style {
      opacity: 0;
      translate: 0 24px;
    }
  }
}

.bottombar {
  display: flex;
  flex: none;
  align-items: stretch;
  padding: 0 4px env(safe-area-inset-bottom);
  border-top: 1px solid ${v.divider};
  background: ${v.sidebar};
  color: ${v.text};
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
  font-family: ${v.fontFamily};
  -webkit-user-select: none;
  user-select: none;
}

/* An entry: its icon above a short label, all equally wide. */
.bottom-item {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  height: 56px;
  padding: 4px 2px;
  border: 0;
  background: transparent;
  color: ${v.muted};
  cursor: pointer;
  transition: color 120ms;

  .icon,
  .tile svg {
    font-size: calc(${v.fontSize} * 20 / 14);
  }

  .tile {
    width: auto;
    height: auto;
    color: inherit;
  }

  &:hover {
    color: ${v.text};
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  /* The open app, and "Apps" while its sheet is open. */
  &[aria-current='page'],
  &[aria-expanded='true'] {
    color: ${v.accent};
  }
}

.bottom-label {
  max-width: 100%;
  overflow: hidden;
  font-size: calc(${v.fontSize} * 11 / 14);
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* The sheet of "Apps": the whole sidebar in a panel from the bottom, over most of the height, rounded at the top. */
.sheet-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1000;
  background: light-dark(rgb(0 0 0 / 45%), rgb(0 0 0 / 60%));
  transition: opacity 150ms;

  @starting-style {
    opacity: 0;
  }
}

.sheet-layer {
  position: absolute;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
}

.sheet {
  display: flex;
  width: 100%;
  height: min(85%, 720px);
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -8px 32px rgb(0 0 0 / 28%);
  pointer-events: auto;
  transition: translate 240ms ${v.ease};

  @starting-style {
    translate: 0 100%;
  }

  &:focus-visible {
    outline: none;
  }

  .sidebar {
    flex: 1;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    border-right: 0;
  }
}

/* Its close button, in place of the search (the bottom bar has it). */
.sheet-close {
  margin-left: auto;
}

.top-line {
  display: flex;
  align-items: center;
  gap: 4px;
  height: ${v.topbarHeight};
  padding: 0 10px 0 16px;
  background: ${v.sidebar};
  color: ${v.text};
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
  font-size: ${v.sidebarFontSize};

  .brand {
    flex: 0 1 auto;
    min-height: 0;
    max-width: 360px;
    /* With the first entry's padding about 40px to its text (2026-10-08, the user's wish; 12px before): clearly more
       than between the entries, so the brand is a block of its own; the divider (below) in the middle of it. */
    margin: 0 8px 0 0;
    padding: 0;
    border: 0;
  }

  /* Title and subtitle side by side on one baseline (2026-10-08, the user's wish; stacked before, as in the sidebar):
     the title bold, the subtitle smaller and muted, then a thin divider before the entries ("Back Office Acme
     Corporate |"; 2026-10-08, the user's wish: between the two before); the subtitle is cut first when there is no
     room. The divider: its right border (as high as its line), half as strong as the muted text. */
  .brand-text {
    flex-direction: row;
    align-items: baseline;
    gap: 10px;
    padding-right: 20px;
    border-right: 1px solid color-mix(in srgb, ${v.muted} 50%, transparent);
  }

  .brand-title {
    flex: 0 1 auto;
    min-width: 0;
    font-weight: 600;
  }

  .brand-subtitle {
    flex: 0 1000 auto;
    min-width: 0;
    margin: 0 0 -0.15em;
    font-size: calc(${v.fontSize} * 13 / 14);
    font-weight: 400;
    letter-spacing: 0;
  }

  .search-button {
    margin-left: 4px;
  }

  /* The icons on the dark line: white strokes (its menus are outside it: the accent, like the sidebar's popups). */
  .tile,
  .group-icon {
    color: ${v.sidebarIcon};
  }

  /* The icons of its items (the pinned ones, or those of a single group) in the accent color (2026-10-08, the user's
     wish; white before): its dark side, on the dark line. Tried on 2026-10-09 and back the same day: text only, and
     white (dark on a light line). */
  .tab .tile {
    color: ${v.accent};
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
  color: ${v.muted};
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;

  &:hover,
  &[data-state='open'] {
    background: ${v.hover};
    color: ${v.text};
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

  /* Its icon a bit smaller than elsewhere, closer to the text's height (2026-10-09, the user's wish; 17 before). */
  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(${v.fontSize} * 15 / 14);
    }
  }

  .icon--chevron {
    font-size: calc(${v.fontSize} * 14 / 14);
    rotate: 90deg;
    stroke-width: 2.25;
  }
}

/* The line: the open app (a pinned one, or one of a single group) and the group that has it are bright and bold; the
   open app is underlined in the accent color. */
.top-line .tab {
  &[aria-current] {
    color: ${v.text};
    font-weight: 600;
  }

  &[aria-current='page']::after {
    background: ${v.accent};
  }
}

/* The two-pane menus (nav="top", 2026-10-08; nav="top-compact" until then): the groups are the entries; the topbar is
   the menus' containing block. */
.topbar[data-panes] {
  position: relative;

  /* The entry whose menu is open, like a hovered one; its chevron turned up. */
  .top-line .tab[aria-expanded='true'] {
    background: ${v.hover};
    color: ${v.text};

    .icon--chevron {
      rotate: -90deg;
    }
  }

  .top-line .tab .icon--chevron {
    transition: rotate 150ms ${v.ease};
  }

  /* The entry of the open item: underlined in the accent. */
  .top-line .tab[aria-current]::after {
    background: ${v.accent};
  }
}

/* A subgroup's heading (a menu of one pane), like the sidebar's section labels, with its icon. */
.panel-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  padding: 0 8px;
  color: ${v.muted};
  font-size: ${v.sidebarFontSizeTiny};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  .group-icon svg {
    font-size: calc(${v.fontSize} * 15 / 14);
  }
}

.panel-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* An item: its icon, its title and its description below it (at most two lines). The open one in the accent, like in
   the sidebar. */
.panel-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover {
    background: color-mix(in srgb, ${v.text} 9%, transparent);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  &[aria-current='page'] {
    background: ${v.selected};

    .panel-title {
      color: ${v.accent};
      font-weight: 600;
    }
  }

  .tile {
    width: 20px;
    height: 20px;

    svg {
      font-size: calc(${v.fontSize} * 18 / 14);
    }
  }
}

.panel-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.panel-title {
  font-weight: 500;
  line-height: 20px;

  .running-dot {
    display: inline-block;
    margin-inline-start: 4px;
    vertical-align: middle;
  }
}

.panel-description {
  display: -webkit-box;
  overflow: hidden;
  color: ${v.muted};
  font-size: calc(${v.fontSize} * 12 / 14);
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* The two-pane menus (nav="top", 2026-10-08): below the group's entry (its left set by the element), in the
   look of the topbar's menus (the sidebar's colors, a line on top, square corners, the shadow downwards): the
   subgroups on the left, the items of the shown one on the right (all panes in one grid cell, so the menu keeps the
   height of the tallest). */
.pane-menu {
  position: absolute;
  top: 100%;
  z-index: 1000;
  display: flex;
  max-width: calc(100% - 16px);
  max-height: calc(100dvh - ${v.topbarHeight} - 48px);
  border-top: 1px solid ${v.divider};
  background: ${v.sidebar};
  color: ${v.text};
  color-scheme: dark;

  :host([nav-scheme='page']) & {
    color-scheme: inherit;
  }
  box-shadow: 0 12px 32px rgb(0 0 0 / 24%);
  font-family: ${v.fontFamily};
  font-size: ${v.sidebarFontSize};
  transition: opacity 150ms, translate 150ms ${v.ease};

  @starting-style {
    opacity: 0;
    translate: 0 -4px;
  }

  .tile,
  .group-icon {
    color: ${v.accent};
  }
}

.pane-tabs {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 2px;
  width: 208px;
  padding: 6px;
  overflow: auto;
  overscroll-behavior: none;
  border-right: 1px solid ${v.divider};
}

/* A subgroup: its icon, its name, a chevron to the right; the shown one in the hover's tint, the open item's in the
   accent. */
.pane-tab {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 4px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 500;
  text-align: start;
  cursor: pointer;
  transition: background-color 120ms;

  &:hover,
  &[aria-selected='true'] {
    background: color-mix(in srgb, ${v.text} 9%, transparent);
  }

  &:focus-visible {
    outline-offset: -2px;
  }

  &[data-current] {
    color: ${v.accent};
    font-weight: 600;
  }

  .group-icon svg {
    font-size: calc(${v.fontSize} * 16 / 14);
  }

  .icon--chevron {
    margin-left: auto;
    color: ${v.muted};
    font-size: calc(${v.fontSize} * 12 / 14);
  }
}

.pane-tab-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pane-stack {
  display: grid;
  width: 320px;
  overflow: auto;
  overscroll-behavior: none;
}

.pane {
  grid-area: 1 / 1;
  padding: 6px;

  &:not([data-shown]) {
    visibility: hidden;
  }

  .panel-heading {
    margin-top: 6px;
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
    color: ${v.muted};

    &:hover,
    &[data-state='open'] {
      background: ${v.hover};
      color: ${v.text};
    }

    &:focus-visible {
      outline-color: ${v.accent};
      outline-offset: -2px;
    }
  }

  .footer-badge {
    top: 5px;
    right: 5px;
    border-color: ${v.sidebar};
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
    font-size: ${v.small};
  }
}

.menu-item[data-current] {
  color: ${v.accent};
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
}

// The values only known at run time (2026-10-10; custom properties before): the width the user resized the sidebar to,
// and the left edge of the app switcher's panel (at its button). A stylesheet of its own after the theme's, rewritten
// when they change: copies of the rules of styles() that use them (the same selectors, so being later wins), as some
// of them cannot be inline styles (@starting-style).
function layoutStyles(sidebarWidth: number | undefined, switcherLeft: number | undefined): string {
  const width = sidebarWidth === undefined ? '' : /* css */ `
.frame {
  grid-template-columns: ${sidebarWidth}px minmax(0, 1fr);
}

.mount[data-layout='sidebar'][data-palette-from-expanded] {
  .palette-layer,
  .backdrop {
    @starting-style {
      left: ${sidebarWidth}px;
    }
  }
}

.mount[data-layout='sidebar'][data-palette-closing] {
  &:has(.frame:not([data-rail])) {
    .palette-layer,
    .backdrop {
      left: ${sidebarWidth}px;
    }
  }
}
`;
  const switcher = switcherLeft === undefined ? '' : /* css */ `
.mount[data-layout='topbar'][data-nav-style='switcher'] .palette {
  left: ${switcherLeft}px;
  width: min(416px, 100% - ${switcherLeft}px);
}
`;

  return width + switcher;
}

// The values of the stylesheets (the cockpit's and the taskbar's): the theme's, over the defaults, and the fixed ones
// of the design language.
function themeValues(theme: Spec.Theme) {
  const t = { ...DEFAULT_THEME, ...withoutUndefined(theme) };
  // The accent: one color, lighter in a dark scheme (e.g. the sidebar) by a mix with white; the default has both.
  const accent = theme.accent === undefined
    ? t.accent
    : `light-dark(${t.accent}, color-mix(in oklab, ${t.accent} 60%, white))`;

  return {
    accent,
    fontSize: t.fontSize,
    fontFamily: t.fontFamily,
    sidebarWidth: t.sidebarWidth,
    railWidth: t.railWidth,
    contentPadding: t.contentPadding,
    // The topbar's top line (nav="top").
    topbarHeight: '52px',
    background: 'Canvas',
    text: 'CanvasText',
    muted: 'light-dark(#666, #bbb)',
    field: 'light-dark(#fff, #111)',
    border: 'light-dark(#b2b8be, #696a6c)',
    divider: 'light-dark(#dee2e6, #424242)',
    hover: 'light-dark(#f5f5f5, #1d1d1d)',
    subtle: 'light-dark(#f7f7f7, #1a1a1a)',
    shadow: '0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%))',
    radius: '2px',
    buttonRadius: '5px',
    // The popups' text.
    small: t.fontSize,
    // The sidebar's text: a bit smaller than the page's small text (the popups keep theirs).
    sidebarFontSize: `calc(${t.fontSize} * 13 / 14)`,
    sidebarFontSizeTiny: `calc(${t.fontSize} * 10 / 14)`,
    // The icons in the sidebar (and its popups): white strokes on the dark sidebar.
    sidebarIcon: 'light-dark(#1f2328, #fff)',
    sidebar: 'light-dark(#f4f5f7, #272a2f)',
    selected: `color-mix(in srgb, ${accent} 11%, transparent)`,
    ease: 'cubic-bezier(0.2, 0, 0, 1)',
    // The footer. The dark side: the dark navigation (the default); the light side: a light one (nav-scheme="page"), a
    // light gray.
    footerBackground: 'light-dark(#e6e8eb, #31353b)',
    footerText: 'light-dark(#40454c, #c4c7cc)',
    footerHover: 'light-dark(rgb(0 0 0 / 6%), rgb(255 255 255 / 7%))',
    footerDivider: 'light-dark(rgb(0 0 0 / 9%), rgb(255 255 255 / 10%))',
  };
}

// A theme's keys that are set (an `undefined` must not hide a default).
function withoutUndefined(theme: Spec.Theme): Spec.Theme {
  return Object.fromEntries(Object.entries(theme).filter(([, value]) => value !== undefined));
}
