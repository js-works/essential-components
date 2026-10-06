# app-cockpit

`<app-cockpit>` (`@local/app-cockpit`): an admin panel shell for office mini-apps (micro-frontends): a navigation on
the left, the chosen mini-app on the right. The root's demo page is its first user. The rules of the root's `CLAUDE.md` apply.

## Working rules

- Design first: discuss the API step by step.
  - Do NOT implement anything until the user gives an explicit GO.
- Keep answers short. One topic per step.
- When offering alternatives, number them, add small code examples, and always state which one is proposed and how
  confident that proposal is (e.g. a percentage).
- English is the language of the project: code, comments, docs. The conversation may be German.
- VERY IMPORTANT: never introduce a new CSS custom property (`--…`) without the user's explicit permission.
  - Ask first, with the name and why none of the existing ones does.
  - The need should be rare: use the existing ones (`--ui-*`, the package's own), plain values, or a local calc.
  - A new one, once allowed, carries the package's prefix (never a generic name like `--shadow` or `--border`: the
    mini-apps are light DOM children and inherit them, and they collide with other libraries).
- Never run `git commit` or `git push`.
- `src/api.ts` holds the draft API types we are discussing. Types only, flat exports; `src/index.ts` re-exports them
  as a namespace: `export type * as AppCockpit from './api'` (`AppCockpit.MiniApp`).
- Always add the decisions (also small ones) to this file, in the same step as the code.
- Rewritten 2026-10-03 (the user's GO, without the browser tests proposed first): Lit and Zag.js instead of React and
  Base UI, with `@floating-ui/dom` (inside Zag, and for the tooltips). Almost vanilla: to be replaced by the Popover API
  and CSS anchor positioning once every browser has them. Every decision is checked for that: is it doable without a
  framework with reasonable effort? Say so when a feature would make that much harder.

## Decided (2026-10-03)

- The cockpit is itself a micro-frontend (the top one, with the shell role): a custom element outside, whatever is
  inside.
- Inside: Lit (a `LitElement`) and Zag.js (headless state machines: menu, select, dialog; its vanilla adapter, the
  props spread onto Lit's elements by the `spread` directive, `src/element/zag.ts`), styled with the design language's
  `ui-*` tokens (`ui.css`), so the cockpit and the packages look like one family, whatever component suite a mini-app
  uses. Not Mantine (its look). (Until 2026-10-03: React + Base UI.)
- Mini-apps stay agnostic: the contract is only a custom element tag, the URL hash, and `<html lang>` /
  `data-scheme`.
- Kept small: navigation, header, routing, language and color scheme. No auth, permissions or notifications for now.
- The cockpit's own UI lives in its shadow DOM (its CSS isolated both ways; the `ui-*` tokens inherit into it). The
  active mini-app is a light-DOM child of the cockpit, shown through the default slot (`<main><slot></slot></main>`):
  mini-apps put their CSS globally (e.g. into `document.head`), which would not reach into a shadow root. The cockpit
  replaces that child itself on navigation (`load()`, then the element from `MiniApp.element`). Named slots for the
  host's parts (`logo`, `sidebar-end`). The popups are rendered inside the shadow root (Zag's `getRootNode`), positioned `fixed`.
- Zag in Lit (`src/element/zag.ts`): one machine per key (`ZagMachines.use(key, menu, props)`), made on first use,
  stopped with the element; a machine's change renders the element again. Unchanged props are kept as the previous
  objects (functions count as equal), and a machine is notified only when a prop really changed (else it would not see
  e.g. a controlled `open`, or would reposition and render endlessly). A popup anchored elsewhere than its trigger (the
  sidebar's edge, the footer bar) gets one virtual anchor per menu, kept (a new one per render loops Floating UI). The
  `spread` directive calls Zag's `spreadProps` without its cleanup first (2026-10-03): the cleanup forgets the previous
  props, so attributes that are gone stayed (e.g. `data-highlighted`: the arrow keys seemed not to move in the menus).
- Tooltips: one element for all, on hover (300 ms) or focus of anything with `data-tip` (`data-tip-side`), positioned
  by Floating UI; not on a button whose popup is open.
- Zag gives a positioner the z-index of its content: it is set on the popups (`.menu-popup`, `.flyout`, …). Zag hides
  closed popups with `hidden` (forced by `[hidden] { display: none !important }`); open animations by
  `@starting-style` (none on closing, except the search in the sidebar layout, see there).
- The name: `<app-cockpit>`, package `@local/app-cockpit`, types `AppCockpit.*` (clear rather than charming; e.g. not
  `tidy-cockpit`, `app-shell`).
- No iframes (overlays could not leave them; language, scheme and routing would need syncing).
- Implemented 2026-10-03 (the user asked to build it the way proposed, without discussing each step):
  - `createAppCockpitClass(config)`, like `createFileUploadClass`: `{ title?, subtitle?, search?, user?, userMenu?, apps, groups?, groupDisplay?, footer?,
    defaultApp?, storageKey? }`;
    `groups`: `{ name, icon?, subgroups?: { name, icon? }[] }[]`, extra data of the groups and their
    subgroups (by the `group` and `subgroup` of the apps), for now their icons. The host
    registers the class itself (`customElements.define('app-cockpit', …)`).
  - `MiniApp`: `id` (the first hash segment), `title`, `description?` (search, sidebar tooltip), `icon?`
    (SVG markup, drawn in `currentColor`, the accent color; without one: no icon, only in the rail its initials), `group?`, `subgroup?` (the
    second level inside its group), `element` (the tag), `attributes?`
    (set on the element), `load?` (e.g. an `import()` that defines the element).
  - Composition at build time (one Vite build; `load` gives lazy chunks).
  - No navigation groups of its own: the host groups its apps (`group`); the root page uses "Essentials" (with the subgroups "Components", "Planned", "Apps") and two made-up groups, with `groupDisplay: 'select'` (2026-10-03).

## Behavior

- Routing: the first segment of the URL hash is the open app's id; the rest belongs to the app. No hash (or an unknown
  first segment at the start): the app `defaultApp` (2026-10-03, an app's id; the root page: the Board Manager), else
  the first app. Opening an app pushes a history entry (Back and Forward go through the
  apps); an unknown first segment later (e.g. a host's anchor) is ignored.
- An app is created when it is opened the first time (after `load()`; meanwhile a spinner, on an error a message with
  "Try again"), then kept: the others get `hidden`, so each keeps its state. Its element gets `data-hash-segment` (its
  id): `ui.ts` counts it as a level of the hash, so tabs inside it write `#app/tab`, and restore that when it is shown
  again.
- The sidebar adapts to the number of apps (`FEW` = 12, `MANY` = 30 in `AppCockpitElement.ts`):
  - Up to 12: every app listed, the groups as plain headings; no search, no "Recent".
  - More: a search button (2026-10-03: an icon-only button with the tooltip "Search apps (Ctrl K)", in the title row,
    at its right end, vertically centered on title and subtitle; in the rail below the logo; also Ctrl+K / ⌘K: a command palette, Zag `dialog`; ranked: title starts with the
    query, a word of the title starts with it, the title contains it, then description or group), "Recent" (the last 5
    opened, per browser), the groups collapsible with a count (closed by default above 30 apps, except the open app's
    group and the apps without a group, "Other").
- `groupDisplay: 'select'` (2026-10-03; default `'sections'`): one group at a time. A select (Zag `select`) at the
  top of the list (below the search) switches the group, with each group's count; the list shows only that group's
  apps, without "Recent" (the search has it). The chosen group follows the open app (opening an app from the search
  shows its group). Only with more than one group and not in the rail. The package's 100-app demo uses it.
  - Its ground in the sidebar: in a light sidebar a light gray a step darker than the sidebar (`#e3e6ea` on `#f4f5f7`; `#e9ebee` for a moment, a little too light;
    2026-10-05, the user's wish; white, the field color, before), in a dark one the field color as before. No line at
    rest (transparent, so nothing moves), the border color on hover and while its popup is open (the same day, the
    user's wish; the divider color at rest before).
- Group icons (2026-10-03, `groups[].icon`, SVG markup like an app's icon, white like it): in the group select
  (the chosen group and every option; once any group has one, every row keeps the space, so the names stay aligned)
  and in the collapsible group headings. Subgroup icons (`groups[].subgroups[].icon`): in the tree's subgroup nodes,
  between the chevron and the name. The 100-app demo has an icon for each group and each subgroup, and none for
  its apps.
- Second level (2026-10-03, `subgroup`): inside a group, its apps without a subgroup come first, then each subgroup as
  a collapsible node of a tree (open by default, remembered per browser), with its count; its apps are indented along
  a guide line. In both group displays; flat in the rail. The search also matches the subgroup and shows "Group ›
  Subgroup". Every group of the 100-app demo has subgroups.
- The signed-in user (2026-10-03, `user: { name, detail?, avatar? }`): a row above the footer, from edge to edge (a line
  on top): the avatar (an image URL, else the initials on the accent color), the name and a second line (e.g. the
  email). With `userMenu` (sections of menu items, like the footer's menu), the row is a button with a chevron that
  opens it to the right of the sidebar (touching it, its bottom at the row's; also in the rail, where only the avatar
  shows, the name as the tooltip). The demos: "Jane Doe" (2026-10-03; "Anna Schröder" before), with Profile, Settings, Sign out (`userMenu(signOut)` in `demo/footer.ts`; on the root page "Sign out" shows the
  login screen of `packages/app-login`, 2026-10-03; else it logs) (moved
  from the kebab menu, which keeps Keyboard shortcuts, What's new, About).
- Footer (2026-10-03): a dark gray bar at the bottom of the sidebar (a bit lighter than the dark sidebar), flush with its edges, in
  segments (`role="toolbar"`): on the left the sidebar's toggle, in the middle the host's actions (`footer.actions`:
  `{ id, label, icon, badge?, onSelect?, choices? }`, icon buttons with a tooltip that share the room between
  the toggle and the kebab (they grow), a red dot for `badge`; with
  `choices` (`{ options: { value, label }[], value(), onChange }`, 2026-10-03) the button opens a menu with the options,
  the current one checked, read from `value()` whenever it renders, so the host keeps the state), on the right a kebab
  button with the host's menu (`footer.menu`: sections of `{ id, label, icon?, shortcut?, checked?, onSelect? }`, separated by
  lines; Zag `menu`). A section (`MenuSection`, 2026-10-03) is an array of items, or `{ label?, items }` with a small
  uppercase label on top; an item with `checked` (a function, read whenever the menu renders, so the host keeps the
  state) is a radio option with a check in place of its icon (also in `userMenu`). The demos' kebab: the page's language
  as such a section ("Language": English, Deutsch; a footer action before, 2026-10-03: too many buttons). A footer
  action can have such a menu too (`menu`, sections, in place of `choices`; 2026-10-03), e.g. several settings behind
  one button. With the sidebar expanded, the footer's menus (the kebab's, the choices) open as a sheet
  on top of the footer (2026-10-03): as wide as the sidebar, square corners, a line on top, the sidebar's colors, only as
  high as their entries. Without actions or menu, those segments are left out. In the rail, the
  segments are stacked (the toggle at the bottom), and the footer's menus (the kebab's, the choices) open to the right
  as plain panels like the groups' flyouts (touching the sidebar, square corners, a line between them, the sidebar's
  colors), but only as high as their entries, their bottom at their button's (2026-10-03). The demo pages' footer (`demo/footer.ts`, also used by the root page): the page's
  settings as actions with choices (`pageSettings()`: language and color scheme, set on `<html>` and remembered per
  browser; the cockpit's demo adds the number of apps), and a made-up kebab menu (`MENU`, its items only log).
- The sidebar is resizable (2026-10-03): a handle on its right edge (an accent line while hovered, dragged or
  focused; `role="separator"`): drag it, or Left/Right (Shift: more) when focused; a double click goes back to the
  default. 200 to 420 px, remembered per browser (`storageKey`). The default is 16rem (2026-10-03; 17rem, then 15rem before;
  `--app-cockpit-sidebar-width`). No handle in the rail.
- The sidebar collapses to a rail of icons (the toggle in the footer, and the logo, 2026-10-03: a button with the same
  tooltip, not below 768px nor in the topbar; remembered per browser; always below 768px of
  the cockpit's own width, then without the toggle), with tooltips. The rail of many apps (2026-10-03): with groups, one button per group (its icon, else
  its initials; the open app's group marked like an open app; its name as the tooltip), each opening a flyout (Zag
  `menu`): a panel at its button that touches the sidebar (no gap, square corners, a line between them, the
  sidebar's colors and text size), only as high as its content (2026-10-03; was as high as the sidebar), moved up when
  it does not fit, scrolling when it is higher than the window, with the group's name, then its apps by
  subgroup (names as small uppercase headings; the open app marked like in the sidebar; long ones scroll). The group
  whose panel is open is highlighted; without groups, only the recent apps and the open one.
  With few apps (2026-10-03), the rail shows the apps, but each subgroup as one button (its icon, else its initials)
  with the same flyout of its apps (e.g. "Planned" on the root page).
- Up and Down (Home, End) move between the buttons of the sidebar.
- With `nav="side"`, the cockpit uses only the left column (2026-10-03): no top bar; the right side is the open app alone. The host's
  parts: the `logo` slot (replaces the default logo: four filled squares, two of them lighter, in the accent color on no background) and the `sidebar-end` slot (at the bottom of the sidebar, above
  the footer, e.g. global switches; hidden in the rail).
- `nav` (2026-10-04): the navigation, one attribute (and property, reflected; `AppCockpit.Nav`), switchable live (not a
  config option, so a host can switch it). Named by where the navigation is and a variant (2026-10-06, the user's
  wish: systematic names; `sidebar`, `topbar`, `topbar-compact`, `switcher` before); an unknown value is the sidebar:
  - `side` (the default): the sidebar on the left.
  - `top`: two lines over the open app (below).
  - `top-compact`: one line (below, "One line").
  - `top-switcher`: one line, one dropdown with the open app (below, "App switcher").
  - `bottom` (2026-10-06): a bar at the bottom, for phones (below, "Bottom bar").
  - `auto` (2026-10-06): by the cockpit's width: the sidebar (its rail only when the user collapses it), below 768px
    (`NARROW`) the bottom bar. The root page's default (its "Navigation" menu: "Automatic"), not the element's.
  - The bottom bar (2026-10-06; built with what the cockpit has, without asking about details, the user's wish: the
    cockpit becomes configurable later, then its entries too): the open app over the whole height (no top line: the
    apps have their own), a bar below it in the sidebar's colors, above the device's home indicator
    (`env(safe-area-inset-bottom)`). Its entries, all equally wide, an icon above a short label:
    - "Apps" (`texts.navigation`, four squares): a sheet from the bottom (85% of the height, at most 720px, rounded at
      the top) with the whole sidebar: the brand with a close button in place of the search, the group select, the
      navigation, the host's `sidebar-end`, the user row (its menu above it, as wide as it) and the footer (its menus as
      in the sidebar). A modal Zag dialog (`dialog:sheet`): focus inside (on the open app), Escape and a click outside
      close it; choosing an app closes it; the open app below is `inert` meanwhile. Marked while open.
    - The three apps used last ("Recent"), in the order of the config, so they do not move with every switch; the open
      one in the accent. Their icon (else the first letters) and title (with an ellipsis).
    - "Search" (`texts.searchShort`), when the search is on: the search panel over the whole cockpit, sliding up.
    - Not taken (proposed before): "Recent" and "More" as menus, pinned apps, a top line with the app's title.
  - History (2026-10-04): three attributes before, `layout` (`sidebar`, `topbar`), `nav-lines` (`2`, `1`) and `nav-style`
    (`tabs`, `switcher`): 8 combinations for 4 modes, and some without a meaning (`nav-lines` with the sidebar or the
    switcher). Put into one, with only the valid modes; a menubar would be a fifth value. The colors stay apart
    (`nav-scheme`).
  - The topbar (`nav="top"`): two lines over the open app, with the same data:
  - The top line, dark like the sidebar (`--app-cockpit-topbar-height`, 3.25rem; 3rem before, 2026-10-04: only the first line is higher, the second stays at 2.5rem; the search panel and the dropdowns follow the property): logo and title (and subtitle), the
    groups as entries (with their icons; the one shown below underlined in the accent color, the open app's bright and
    bold; a click shows its apps below, without opening one, like the group select), then on the right the search
    button, the footer's actions and kebab (icon buttons; their menus plain dropdowns below them; no sidebar toggle),
    and the user's avatar (its menu below it, with the name and the second line on top).
  - The second line, light (the page's scheme): the apps of the chosen group as tabs (the open app in the accent color,
    underlined), each subgroup as a dropdown tab of its apps.
  - With one group (or none), its apps (and subgroup dropdowns) are in the top line, and there is no second line.
  - Entries that do not fit: a "More" dropdown at the end of their line (the line wraps into a hidden second row; the
    wrapped entries are counted after each render and resize).
  - Its menus (subgroups, "More", the actions, the kebab, the user) look like the sidebar's (2026-10-03): plain panels,
    square corners, the sidebar's colors and text size, their top at the bottom of their line (no gap, a line between
    them; `data-drop`), the shadow downwards. Those of the second line follow the page's scheme, like the line (dark ones were tried, 2026-10-03, and dropped). Their highlight (hover, arrow keys) is
    the text color at 9% (the hover token was about the light panel's own color: invisible).
  - The active group of the top line is marked by a triangle, not an underline (2026-10-04): 0.875rem wide, 0.4375rem high (1.5rem, 1.25rem, then 1rem before),
    in the second line's color, pointing up into the top line at the middle of its text (not the tab's: the icon is before the text; the tab's middle
    without a text), as if a triangle was cut out of
    the bar (white on a light page, dark on a dark one; with `nav-scheme="page"` on a light page the accent: white hardly shows on
    the light gray bar, gray was tried and dropped). It is a `::before` of the second line, reaching up over the top
    line (a pseudo-element of the tab would have the top line's own, dark scheme: the triangle was black on a light
    page); its x is `--app-cockpit-notch-x` on the topbar, set by the element from the active tab (`#placeNotch()`, after every render
    and resize). The line between the two lines is a background (not a border) in `nav-scheme="page"`, so the triangle
    covers it. Only with two lines and several groups; the other modes keep the underline.
  - Left and Right (Home, End) move between the entries of a line.
  - The search: a panel below the top line, centered (36rem), only as high as its content; the backdrop darkens below
    the top line.
  - No `sidebar-end` slot (like the rail). Below 768px of the cockpit's width: the sidebar's rail, as before.
  - The demos (the package's and the root page): a "Navigation" button in the footer (`navigationSetting()` in
    `demo/footer.ts`, 2026-10-03) with three sections: "Navigation" (the four values: Sidebar, Topbar, Topbar compact, App
    switcher; the key `demo-page:nav`), "Colors" (Dark, Like the page; see `nav-scheme`; the demos
    start with "Like the page", 2026-10-03) and "Density" (Compact, Normal, Comfortable; see `density`; Normal by
    default, 2026-10-05), remembered per browser.
  - "One line" (`nav="top-compact"`, 2026-10-04): only with several groups (with one group or none the topbar is one
    line anyway). The groups become a select (a compact button after the title, with the group's icon, name and count, like the
    sidebar's group select; its popup a plain panel below the line, like the topbar's menus), then the apps of the
    chosen group as tabs in the same line (the subgroups as dropdown tabs; what does not fit in "More"). No second line.
    Choosing a group shows its apps without opening one, as with two lines. Keys in the select: Zag's.
    No icons at the top level (2026-10-04): not on the select button, the app tabs or the subgroup tabs; the select's
    popup keeps its group icons (only the top level of the line is without).
  - The line of the apps is keyed by the group (`top:<group>`): its overflow count belongs to its entries.
  - "App switcher" (`nav="top-switcher"`, 2026-10-04), in the topbar only. The top line: the logo and title, one dropdown button with the open app (its icon and title, a selector icon; the
    tooltip "Switch app (Ctrl K)"), the host's actions and the user. No tabs, no second line, no separate search button
    (the switcher is it); also with one group or none (it helps with many apps in one group too).
  - Its panel is the search panel, opened at the button (its left edge, the top touching the line, 26rem, square
    corners; `--app-cockpit-switcher-left` is set when it opens): the search field, "Recent", then all apps by group and subgroup
    (the sections "Group › Subgroup"; the plain palette has the groups only), up and down, Enter, Escape as there.
    Ctrl+K opens the same panel. Escape gives the focus back to the button. It is always available with the switcher
    (also with `search: false`: it is its list).
  - Why not a menu with an input of its own: the search panel has the search, the ranking, the recent apps and the
    keys already; one UI for finding and switching apps.
  - Not built: a menubar (each group a dropdown of its apps, subgroups as labeled sections), proposed 2026-10-04.
- All icons are 1em wide and high (2026-10-04; fixed rem sizes before): `width="1em" height="1em"` on the cockpit's own
  SVGs (`icons.ts`), and the CSS gives the same to the SVG markup of the host (the icons of apps, groups, subgroups,
  actions and menu items: they need no size of their own). The size is the `font-size` of the icon (the rules of
  `styles.css`: 1.125rem by default, smaller or bigger where it is used, e.g. 0.875rem for the chevrons, 1.25rem in
  the panel's field and the app tiles, 1.375rem for the default logo). The boxes around the icons (tiles, group icons)
  keep their sizes. Measured: every icon has the size it had before.
- The search button's icon (2026-10-04) is a bolt (Tabler's `bolt`, MIT; `TbBolt` in react-icons; copied as paths into
  `icons.ts`, the cockpit has no React), a magnifier before: the button finds apps and switches to them, fast. The same icon
  in the sidebar, the rail, the topbar and the panel's field; the tooltip stays "Search apps (Ctrl K)".
- The search panel's footer (the keys, the count; the switcher's and the sidebar's panel) has no background of its own in a light
  panel (2026-10-04; `nav-scheme="page"` on a light page: as light as the rest; white was tried) and a darker strip
  (black at 14%) in a dark one.
- `nav-scheme` (2026-10-03): an attribute (and property `navScheme`, reflected; `AppCockpit.NavScheme`), `dark` (the
  default) or `page`. Not "light": a light navigation on a dark page makes no sense. `page` follows the page (light on a
  light page, dark on a dark one); it sets `--app-cockpit-sidebar-scheme: initial` (a host's own value still wins): the sidebar's `color-scheme` is
  `var(--app-cockpit-sidebar-scheme, inherit)`, so "not set" inherits the page's scheme (fixed 2026-10-04: with `normal`,
  which means light, the navigation stayed light on a dark page).
  With a light navigation: the footer a light gray bar (its light side; dark in the dark navigation as before), the
  avatar's initials in the accent, and in the topbar a line between the top line and the second one. The demos: the
  section "Colors" of the footer's "Navigation" button (Dark, Like the page).
- `density` (2026-10-05): an attribute (and property `density`, reflected; `AppCockpit.Density`), `compact`, `normal`
  (the default) or `comfortable`: the same names as the data navigator's `density`. CSS only (`:host([density=…])`, at
  the end of `styles.ts`), and subtle: mostly the sidebar's vertical rhythm.
  - `compact`: the app entries 32px (36px), the subgroup headers 30px (32px), the group headers 26px (28px), the gaps
    between sections and groups 8px (12px); the rows of the popups (menus, the group select's list, the rail's flyouts)
    30px (32px).
  - `comfortable`: 40px, 34px, 30px, 16px; the popups' rows 34px.
  - Unchanged: the font sizes, the topbar's lines (heights and text), the brand, the user row, the footer, the widths.
- `search` (2026-10-03): the search button and Ctrl+K also with few apps (`true`), or never (`false`); without it, only
  with more than 12 apps. The root page uses `true`.
- A subtle line (`--app-cockpit-divider`) below the header (logo, title, search), from edge to edge of the sidebar, also in the
  rail (2026-10-03).
- The title at the top of the sidebar, next to the logo; an optional `subtitle` (2026-10-03) under it, small and muted
  (one line each, cut with an ellipsis). The two lines are close together (2026-10-04: line height 1.15, was 1.25 and 1.3, and the subtitle 1px closer; a bit of room for the descenders
  below each, as the ellipsis needs `overflow: hidden`). Both hidden in the rail. The demos have one (e.g. "Acme Corporation ·
  Headquarters").
- The sidebar is dark in both color schemes of the page (2026-10-03): it has `color-scheme: dark`, so every
  `light-dark()` color inside it (also the `ui-*` tokens and the slotted parts) takes its dark side; so do the popups
  opened from it (the group select, the footer's menus). The search is a dark panel (2026-10-03; was a centered dialog): as high as the cockpit, right
  next to the rail (while it is open, the sidebar collapses to the rail, and expands again afterwards; the user's saved
  choice is not touched; 2026-10-03: the sidebar collapses while the search slides in from behind it, left to right, both at once and equally long (320 ms; also the sidebar's toggle); the search's layer and the backdrop start at the sidebar's edge and move along with it, so the search never covers the sidebar; 2026-10-06, the user's wish: first the sidebar collapses (320 ms), then the search slides in (320 ms, `animation-delay`, hidden until then)). The slide in is a keyframe animation (`palette-in`), not a transition from `@starting-style`: after a slide out, that one did not run again (seen from the rail, 2026-10-03). Closing (2026-10-03): the search slides back out to the left (240 ms, a CSS animation) and the backdrop fades, while the sidebar expands again (also 240 ms; both at once, the user's wish 2026-10-06: sequential was tried), the layer and the backdrop moving back with its edge; Zag hides a closed dialog at once, so the cockpit keeps the parts shown (`hidden` of its own) until the animation ends (a fallback after 600 ms). Not in the topbar layout (touching it, a line between them, square corners, the sidebar's colors), 26rem wide, over the
  open app, which is only darkened (no blur; the sidebar stays as it is). A host can let the
  sidebar follow the page: `nav-scheme="page"` (or `--app-cockpit-sidebar-scheme: initial`).
- The sidebar's text is a bit smaller than the page's small text (2026-10-03, `--app-cockpit-sidebar-font-size` 13px; labels and
  counts `--app-cockpit-sidebar-font-size-tiny` 10px); the popups (menus, group select, search) keep their size.
- The app icons have no background (transparent). In the sidebar and its popups, all icons (apps, groups,
  subgroups) are white strokes (2026-10-03, `--app-cockpit-sidebar-icon`); in the search palette the app icons stay in the accent
  color. An app without an icon has none (made-up
  icons for hundreds of apps help nobody), except in the rail, where the icon is all there is: its initials.
- Texts in English and German, by `<html lang>` (`core/texts.ts`).
- Remembered per browser (`localStorage`, `storageKey`, ignored when storage fails): the recent apps, the rail, the
  open groups.
- Custom properties on the cockpit's host leak into the mini-apps (light DOM children, they inherit): a name in the
  shadow CSS must not be one that a component library of an app reads (2026-10-04: the cockpit's plain `--button-radius`
  was Mantine's own variable name for the radius of its buttons: every Mantine button in the apps, e.g. the dialogs',
  got 5px instead of the theme's radius; renamed `--app-cockpit-button-radius`). The other plain names of the host (`--background`, `--text`, `--border`, `--shadow`, `--radius`, and the like)
  were prefixed too (2026-10-04, the user's GO): all the cockpit's own properties are `--app-cockpit-*`, as they
  inherit into the mini-apps (`--app-accent` became `--app-cockpit-host-accent`). Only `--ui-*`, the host's
  `--app-accent-color` and Zag's `--reference-width`, `--available-height`, `--transform-origin` keep their names.
- No `rem` in the cockpit's CSS (2026-10-04, the user's rule): a page's root font size must not change the shell. Every
  length is in `px` (the former `rem` values times 16: the `rem` values quoted in older entries of this file are the same
  sizes: `1rem` is 16px; converted with no change of a single pixel, checked with 36 screenshots of all modes, light and
  dark, with the search panel and menus open). Every `font-size` (the texts and the icons, which are sized by it) is a
  multiple of one property, `--app-cockpit-font-size` (default `14px`, the apps' normal text: Mantine's `sm`):
  `calc(var(--app-cockpit-font-size) * N / 14)` with N the size in px at 14 (the sidebar's text 13, the title 15, the
  icons 18 ...). The boxes (widths, heights, paddings) stay in px and do not scale with it.
  - It maps onto the apps' Mantine text size: the root page's `demo/demo.css` sets each app's own `--…-font-size`
    (`--board-manager-font-size` ...: Mantine's `sm`, from which every other Mantine size follows) to
    `var(--app-cockpit-font-size)`, so the shell and the apps have one text size: set the property on `<app-cockpit>` and
    both change (tested at 12, 14 and 16px).
  - `--app-cockpit-small` (the popups' text) is the property itself now; it was the design language's `--ui-font-size-sm`
    (`0.875rem`).
- The cockpit's own parts have a font of their own (`--app-cockpit-font-family`, default `system-ui`), so a mini-app's
  global CSS (e.g. Mantine's on `body`) does not change them. Overridable: `--app-cockpit-font-size` (2026-10-04, the base size of all texts and icons, `14px`), `--app-accent-color` (2026-10-03: the accent, one color, lighter in the dark sidebar by a mix with white; else the design language's `--ui-color-accent`; the demos' "Accent color" choice, `accentSetting()` in `demo/footer.ts`, sets it on `<html>`), `--app-cockpit-sidebar-width` (the default width),
  `--app-cockpit-rail-width`, `--app-cockpit-content-padding` (around the open app).

## Layout and commands

- `src/api.ts`: the types; `src/element/`: the custom element (`AppCockpitElement.ts`, Lit: shadow root, light-DOM apps,
  routing, the whole UI), `zag.ts`, `icons.ts`, its CSS (`styles.ts`); `src/core/`: search, texts, storage.
- `demo/`: the package's demo (`npm run dev`), with 3, 30 or 100 apps (the "Apps" choice in the footer; `?apps=some`, `?apps=many`); the 100 apps with `groupDisplay: 'select'`; in the 30 and 100 apps every app has a group and a
  subgroup (no "Other"); `demo/ui/`: the
  design language (a copy, like in every package).
- `npm run typecheck`, `npm run build` (library mode; Lit, Zag.js and Floating UI stay outside), `npm run format`.

## Not set up yet

- Tests.
- Runtime composition (separate deployments: import maps, Module Federation), only when needed.
- Board Manager and Media Manager as packages of their own (proposed).
