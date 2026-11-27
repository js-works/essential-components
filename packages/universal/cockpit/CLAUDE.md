# cockpit

`@local/cockpit`: an admin panel shell for office mini-apps (micro-frontends): a navigation on the left, the chosen
mini-app on the right. The host chooses the tag, so the name needs no hyphen (`app-shell` weighed and dropped:
Mantine's `AppShell`). The root's demo page is its first user. The rules of the root's `CLAUDE.md` apply.

## Conventions

The general rules (`packages/ai`, always copied along with this package):

@../../ai/instructions/common/general.md
@../../ai/instructions/common/typescript.md
@../../ai/instructions/frontend/general.md
@../../ai/instructions/frontend/css.md
@../../ai/instructions/frontend/i18n.md
@../../ai/instructions/frontend/custom-elements.md

This repository's rules for it (see the root's `CLAUDE.md`):

- Tier 1 (for any stack): no UI library, no i18n library (an `I18nAdapter`), its theme a JS object. A tier-2 package may
  depend on it, never the other way round.
- Its default theme follows the design language (`ui.css`, its `ui-*` values; radii: `2px` for controls, `5px` for
  buttons, larger surfaces a bit rounder, dialogs `6px`): the same in every package that has one, never changed in just
  one of them. The `--ui-*` tokens only in its demo, never in `src/main/`.

## Working rules

- `src/main/api/` holds the draft API types we are discussing: `base.ts` (`CockpitElement`, `CockpitClass`,
  `CockpitClassConfig`, `NavDensity`), `navigation.ts` (`NavItem`, `NavGroup`, `NavSubgroup`,
  `NavLayout`, `NavScheme`), `menus.ts` (`FooterAction`, `ActionChoice`, `ActionChoices`, `MenuItem`, `MenuSection`,
  `SignedInUser`, `CockpitFooter`), `header.ts` (the app header's: `AppHeaderElement`, `AppHeaderClass`,
  `AppHeaderClassConfig`, `AppHeaderLink`, `AppHeaderCrumb`, `AppHeaderStep`, `AppHeaderNavigateDetail`), `theme.ts`
  (`CockpitTheme`: one theme for every element), `nav-tree.ts` (`NavTreeElement`, `NavTreeClass`, `NavTreeClassConfig`, `NavTreeItem`,
  `NavTreeNavigateDetail`), `login.ts` (the login's: `LoginElement`, `LoginClass`,
  `LoginClassConfig`, `LoginProvider`), `status-view.ts` (`StatusViewElement`, `StatusViewClass`,
  `StatusViewClassConfig`, `StatusViewKind`, `StatusViewLayout`), the React entry's in `src/main/react/api/`, `texts.ts` (`CockpitTextKey`, `CockpitParams`, read from the English texts), `i18n.ts`
  (`I18nAdapter`, `TextParams`: a verbatim copy of those in `frontend/i18n.md`).
  `src/main/index.ts` exports them flat (`typescript.md`): `import type { NavItem } from '@local/cockpit'`. The demos'
  variables of the element are `cockpitElement` or `element`.
- Lit; the menus and the tooltips placed by CSS anchor positioning (no script); the menus and the group select are our own
  `Menu`s (`src/main/element/menu.ts`), the search and the bottom bar's sheet native modal `<dialog>`s (rather than our own
  `inert`, focus and Escape code). No Zag.js: not needed, and the code must be easy to read.
- Lit stays (7.8 kB gzip).
  - No Floating UI: CSS anchor positioning does its work in every target browser (checked in Chromium, Firefox and
    WebKit). What it cannot do: grow a flipped popup from the side it flipped to (its `transform-origin` is the asked
    placement's), and `shift()` with a padding from the window's edge. Only `lit-html` with a base class of our own (about 2 kB less): not worth owning it. Lit as a whole: it is
    the base of every template and of the rendering. Every decision is checked for that: is it doable without a
    framework with reasonable effort? Say so when a feature would make that much harder.

## Decided

- The cockpit is itself a micro-frontend (the top one, with the shell role): a custom element outside, whatever is
  inside.
- Inside: Lit (a `LitElement`), its own menus (`menu.ts`) and native `<dialog>`s, styled with the design language's
  values as plain values in its CSS (it reads no `--ui-*` tokens: those are for demos only), so the cockpit and the
  packages look like one family, whatever component suite a mini-app uses. Not Mantine (its look).
- Mini-apps stay agnostic: the contract is only a custom element tag, the URL hash, and `<html lang>` /
  `data-scheme` (for the mini-apps: the cockpit itself takes its language only from its adapter).
- Kept small: navigation, header, routing, language and color scheme, and a login screen (below). No auth of its own
  (the host signs in), no permissions or notifications for now.
- The cockpit's own UI lives in its shadow DOM (its CSS isolated both ways). The active mini-app is a light-DOM child
  of the cockpit, shown through the default slot (`<main><slot></slot></main>`): mini-apps put their CSS globally
  (e.g. into `document.head`), which would not reach into a shadow root. The cockpit replaces that child itself on
  navigation (`load()`, then the element from `NavItem.element`). Named slots for the host's parts (`logo`,
  `sidebar-end`). The popups are rendered inside the shadow root, positioned `fixed`.
- The menus: `Menu` (`src/main/element/menu.ts`), one per key (`#menu(key, options)` of the element, made on first use and
  kept), with the options of the latest render (`placement`, `anchor`, `sameWidth`, `gutter`, `selected`,
  `onSelect`). The menu keeps its state (`open`, `highlighted`); the templates write its parts out, no spreading: the
  trigger (`id=${menu.triggerId}`, `aria-haspopup`, `aria-expanded`, `aria-controls`, `data-state`,
  `@click=${menu.toggle}`, `@keydown=${menu.onTriggerKeyDown}`), the popup (`#menuPopup()`: a positioner and the
  panel, `role="menu"` or `listbox`) and each item (`role`, `id=${menu.itemId(value)}`, `data-value`,
  `?data-highlighted`).
  - Keys: on the trigger Down opens at the first item, Up at the last, Enter or Space (a click from the keyboard) at
    the first; in the popup (it has the focus, the highlighted item by `aria-activedescendant`) Up and Down (they wrap
    around), Home, End, typing (the first letters, within half a second), Enter or Space choose, Escape and Tab close
    (the focus back on the trigger; Tab then moves on). A pointer down outside closes it, hovering highlights, a click
    chooses. A list to choose from (the group select, `selected`) opens at the chosen item.
  - The highlighted item has the focus ring (the accent, 2px inside) while the popup matches `:focus-visible`. CSS
    only; the browser's heuristic decides: after keyboard input yes, opened and moved with the mouse only no.
  - Placing: CSS anchor positioning (`element/placement-styles.ts`, in both stylesheets), no script; it follows its
    anchor by itself (a scroll, a resize). The positioner has `data-placement` (`bottom-start`, `bottom-end`,
    `top-start`, `right-start`, `right-end`), `data-edge`, `data-same-width`. While open, the menu gives anchor names
    (`element/anchors.ts`, inline `anchor-name`, a list: a button can be the anchor of a menu and of the tooltip):
    `--menu-anchor` to its trigger, or to the element of `anchor` (a selector, the closest around the trigger: the
    footer), and `--menu-edge` to the element of `edge` (the sidebar: a popup to its right touches its right edge; the
    topbar's line: a dropdown's top at its bottom). Below or above: its own height on its side, else the side with more
    room as high as that room (`position-try-order: most-height`), aligned to the trigger's other edge at the window's
    edge (`flip-inline`). To the right: the other alignment (`flip-block`), else moved into the window, at most as high
    as it. A panel that scrolls shrinks to the room (the positioner a flex column). The gap of the group select and
    the app header's menus (4px): the positioner's padding. `transform-origin` from the asked placement. No custom
    properties (anchor names are none).
  - A menu whose trigger is gone after a render (another layout) closes; opening the search closes every menu.
- The dialogs: the search and the bottom bar's sheet are `<dialog>`s, opened with `showModal()` (`#syncDialog` after
  each render): the browser keeps the focus inside, makes the rest of the page inert (also the open app; no `inert` of
  our own) and gives the focus back when it closes. A modal dialog lies in the top layer, placed against the window:
  the cockpit sets it to its own rectangle (`#fitDialogs`, again on a resize or a scroll), so its parts (backdrop,
  layer, panel) lie in the cockpit; its own `::backdrop` is transparent. Escape (`cancel`, prevented: the cockpit
  closes it itself, e.g. after the slide out) and a pointer down outside its panel close it. The first focus: the
  search's field, the sheet's open item (else its close button).
- Tooltips: one element for all, on hover (300 ms) or focus of anything with `data-tip` (`data-tip-side`), placed by
  CSS at its target (the anchor name `--tip-anchor`; on the other side when there is no room, moved into the window at
  its edges); not on a button whose menu is open (`data-state="open"`). A popover (`popover="manual"`), so it shows
  above an open dialog too (the top layer).
- Closed popups are `hidden` (forced by `[hidden] { display: none !important }`); open animations by
  `@starting-style` (none on closing, except the search in the sidebar layout, see there).
- The name: package `@local/cockpit`, `createCockpitClass()` (clear rather than charming: not `tidy-cockpit`, nor
  `app-shell`, Mantine's `AppShell`). The element's tag is the host's choice (a hyphen needed); the root page and the
  package's demo register `<app-cockpit>`.
- No iframes (overlays could not leave them; language, scheme and routing would need syncing).
- The terms of the navigation (the sidebar does not know what an entry is, so it is not called an app): **group**
  (level 1; a section with a heading, or an option of the group select), **subgroup** (level 2; a folder:
  collapsible, with an icon and a count), **item** (`NavItem`, the leaf: it opens a custom element; config `items`,
  `defaultItem`, `activeItem`). Other words: the **group select** (`groupDisplay: 'select'`), **Recent** (the last
  items used), a **flyout** (a group or subgroup in the rail), the **rail** (the narrow sidebar), the **topbar
  lines**. "Mini-app" is only what a host puts behind an item.
- `createCockpitClass(config)`, like `createFileUploadClass`: `{ title?, subtitle?, search?, user?, userMenu?, items,
  groups?, groupDisplay?, footer?, defaultItem?, startPage?, storageKey?, taskbar? }`; `groups`: `{ name, subgroups?:
  { name, icon?, placement? }[] }[]`, extra data of the groups and their subgroups (by the `group` and `subgroup` of
  the items), for now the icons of the subgroups (a group has no icon). The host registers the class itself
  (`customElements.define('app-cockpit', …)`).
- `NavItem`: `id` (the first hash segment), `title`, `description?` (search, sidebar tooltip), `icon?` (SVG markup,
  drawn in `currentColor`, the accent color; without one: no icon, only in the rail its initials), `group?`,
  `subgroup?` (the second level inside its group), `element` (the tag), `attributes?` (set on the element), `load?`
  (e.g. an `import()` that defines the element).
- `placement?: 'pinned' | 'hidden'` (one field, not two flags: "pinned and hidden" would make no sense): where the item
  is in the navigation; without it, in its group.
  - `pinned`: an entry of its own, first, and not in its group: the first tabs of the topbar's line (their icons in the
    accent color; text only, white, and white with the accent on a light line were tried and dropped; with them, the
    groups are entries too, even only one), the first icons of the rail (a section without a heading; not in its
    subgroup's flyout), the first cards of the start page (no heading). The expanded sidebar and the bottom bar's sheet
    ignore it: they show every item in its group anyway. The search keeps it in its group. The root page pins the three
    apps of its folder "Apps".
  - `hidden`: nowhere (not in the navigation, the search, "Recent" or the start page; not the first item without a
    hash); only opened by its hash, `open()` or a link; once open, in the taskbar.
- A folder can be pinned too (`groups[].subgroups[].placement: 'pinned'`; no `hidden` for a folder: that is hiding its
  items): in the topbar an entry of its own after the pinned items (its name and a chevron, no icon: a dropdown in the
  line is text only, like the groups; also a folder entry with one group; its items in the dropdown with their icons,
  in the accent, the footer menus' icon slot; an empty slot for an item without one, none when no item has one; also in
  "More"): a dropdown of its items, the one a folder has with a single group; in the rail its flyout button after the
  pinned items; not in its group there (a group left empty is gone). The expanded sidebar, the search and the start
  page ignore it. The root page pins "Administration" (File Center, User Manager): its topbar is Human Resources, Time
  Tracker, Board Manager, Administration ▾, Internals ▾.
- Composition at build time (one Vite build; `load` gives lazy chunks).
- No navigation groups of its own: the host groups its apps (`group`); the root page uses two groups, "Main" (the
  folders "Apps" and "Administration") and "Internals" (the folders "Components" and "Planned", the tree with the guide
  line). `collapsibleGroups: false` keeps the groups plain headings with many apps too (the subgroups stay
  collapsible); the root page does. `recent: false` switches the "Recent" section off (sidebar and search panel); the
  root page does.

## Behavior

- Routing: the first segment of the URL hash is the open app's id; the rest belongs to the app. No hash (or an unknown
  first segment at the start): the app `defaultItem` (an app's id), else the start page if it is on, else the first
  app. Opening an app pushes a history entry (Back and Forward go through the apps); an unknown first segment later
  (e.g. a host's anchor) is ignored.
- The start page (the root page has it, with Human Resources as its `defaultItem`, so the start page shows only when
  every app is closed, or by the logo): the attribute and property `start-page` / `startPage` (boolean, reflected,
  switchable live; its first value the config's `startPage`; not `home`: vague, the apps' breadcrumbs say "Home").
  Switched off while it is shown: `defaultItem`, else the first app opens. The demos' "Navigation" menu has a section
  "Start page" (On, Off; `navigationSetting(…, { startPage })`, the key `demo-page:start-page`; only where
  `startPage` is given: the root page, on by default; it sets the attribute, so the root page's config has no
  `startPage`: a stored "Off" must win). Shown while no app is open (no hash, and when the last one is closed; opening
  it removes the hash, a history entry). In the main area (the page's scheme), centered, at most 1080px: the title
  (large) and the subtitle, a filter (36rem; only with the search on), then the apps as cards, the pinned ones first
  (no heading), then by folder (`#folders`: the subgroups of all groups, a group's apps without a subgroup as
  "General"; a folder's name small and uppercase with its icon), in a grid (at least 240px a card): the icon on a light
  accent ground (initials in a frame without one), the title (the running dot with the taskbar), the description (two
  lines at most); hovered: an accent border and the shadow. No greeting. The logo (all layouts) is a button that opens
  it (only a pointer, no tooltip); it does not toggle the sidebar then (the footer's toggle does).
  - The filter hides the cards that do not match (the search panel's matching, `search()`: every word in the title,
    description, group or subgroup; the cards keep their order, no ranking), and the folders without a match;
    "Nothing matches your search." when none is left. A clear button ("×", "Clear search") while there is text. Enter
    opens the first card, Escape clears it, Down goes to the first card; Ctrl K still opens the search panel. It gets
    the focus when the start page is opened (the logo, or closing the last app), not on the page's first load; it is
    cleared when an app is opened.
- An app is created when it is opened the first time (after `load()`; meanwhile a spinner, on an error a message with
  "Try again"), then kept: the others get `hidden`, so each keeps its state. Its element gets `data-hash-segment` (its
  id): `ui.ts` counts it as a level of the hash, so tabs inside it write `#app/tab`, and restore that when it is shown
  again.
- The sidebar adapts to the number of apps (`FEW` = 8, `MANY` = 30 in `cockpit-element-base.ts`):
  - Up to 8: every app listed, the groups as plain headings; no search, no "Recent".
  - More: a search button (an icon-only button with the tooltip "Search (Ctrl K)", in the title row, at its right end,
    vertically centered on title and subtitle; in the rail below the logo; also Ctrl+K / ⌘K: a command palette, a
    modal `<dialog>`; ranked: title starts with the query, a word of the title starts with it, the title contains it,
    then description or group), "Recent" (the last 5 opened, per browser), the groups collapsible with a count (closed
    by default above 30 apps, except the open app's group and the apps without a group, "Other").
- `groupDisplay: 'select'` (default `'sections'`): one group at a time. A select (a `Menu` as a listbox) at the top of
  the list (below the search) switches the group, with each group's count; the list shows only that group's apps,
  without "Recent" (the search has it). The chosen group follows the open app (opening an app from the search shows
  its group). Only with more than one group and not in the rail. The package's 100-app demo uses it.
  - Its ground in the sidebar: in a light sidebar a light gray a step darker than the sidebar (`#e3e6ea` on
    `#f4f5f7`), in a dark one the field color. No line at rest (transparent, so nothing moves), the border color on
    hover and while its popup is open.
- Icons: a group is a heading, text only (no group icons). Subgroup icons (`groups[].subgroups[].icon`, SVG markup like
  an item's icon): in the tree's subgroup nodes, between the chevron and the name, and on a subgroup's button in the
  rail. The 100-item demo has an icon for each subgroup, none for its items.
- Second level (`subgroup`): inside a group, its apps without a subgroup come first, then each subgroup as a
  collapsible node of a tree (open by default, remembered per browser), with its count; its apps are indented along a
  guide line. In both group displays; flat in the rail. The search also matches the subgroup and shows "Group ›
  Subgroup". Every group of the 100-app demo has subgroups.
- The signed-in user (`user: { name, detail?, avatar? }`): a row above the footer, from edge to edge (a line on top):
  the avatar (an image URL, else the initials on the accent color), the name and a second line (e.g. the email). With
  `userMenu` (sections of menu items, like the footer's menu), the row is a button with a chevron that opens it to the
  right of the sidebar (touching it, its bottom at the row's; also in the rail, where only the avatar shows, the name
  as the tooltip). The demos: "Jane Doe", with Profile, Settings, Sign out (`userMenu(signOut)` in `src/demo/footer.ts`;
  on both pages "Sign out" shows the login screen, `loginDemo()` of `src/demo/login.ts`). The kebab menu keeps Keyboard
  shortcuts and "Reset demo" (the demo as if opened for the very first time: it clears `localStorage`,
  `sessionStorage`, IndexedDB, cookies and the cache storage, all of the origin, then reloads at the start, without
  hash and query).
- Footer: a dark gray bar at the bottom of the sidebar (a bit lighter than the dark sidebar), flush with its edges, in
  segments (`role="toolbar"`): on the left the sidebar's toggle, in the middle the host's actions (`footer.actions`:
  `{ id, label, icon, badge?, onSelect?, choices? }`, icon buttons with a tooltip that share the room between the
  toggle and the kebab (they grow), a red dot for `badge`; with `choices` (`{ options: { value, label }[], value(),
  onChange }`) the button opens a menu with the options, the current one checked, read from `value()` whenever it
  renders, so the host keeps the state), on the right a kebab button with the host's menu (`footer.menu`: sections of
  `{ id, label, icon?, shortcut?, checked?, onSelect? }`, separated by lines; a `Menu`). A section (`MenuSection`) is
  an array of items, or `{ label?, items }` with a small uppercase label on top; an item with `checked` (a function,
  read whenever the menu renders, so the host keeps the state) is a radio option with a check in place of its icon
  (also in `userMenu`). The demos' kebab: the page's language as such a section ("Language": English, Deutsch; not a
  footer action: too many buttons). A footer action can have such a menu too (`menu`, sections, in place of
  `choices`), e.g. several settings behind one button. With the sidebar expanded, the footer's menus (the kebab's, the
  choices) open as a sheet on top of the footer: as wide as the sidebar, square corners, a line on top, the sidebar's
  colors, only as high as their entries. Without actions or menu, those segments are left out. In the rail, the
  segments are stacked (the toggle at the bottom), and the footer's menus (the kebab's, the choices) open to the right
  as plain panels like the groups' flyouts (touching the sidebar, square corners, a line between them, the sidebar's
  colors), but only as high as their entries, their bottom at their button's. The demo pages' footer
  (`src/demo/footer.ts`, also used by the root page): the page's settings as actions with choices (`pageSettings()`:
  language and color scheme, set on `<html>` and remembered per browser; the cockpit's demo adds the number of apps),
  and a made-up kebab menu (`MENU`, its items only log).
- The sidebar is resizable: a handle on its right edge (an accent line while hovered, dragged or focused;
  `role="separator"`): drag it, or Left/Right (Shift: more) when focused; a double click goes back to the default. 200
  to 420 px, remembered per browser (`storageKey`). The default is 256px (`sidebarWidth`). No handle in the rail.
- The sidebar collapses to a rail of icons (the toggle in the footer, and the logo without a start page: a button with
  the same tooltip, not below 768px nor in the topbar; remembered per browser; always below 768px of the cockpit's own
  width, then without the toggle), with tooltips. The rail: the structure of the sidebar without the headings (one
  flyout button per group would be pointless without group icons). The items as icons (without an icon: their framed
  initials, like the taskbar's, with the title as the tooltip), each subgroup as one button (its icon, else its framed
  initials) with a flyout (a `Menu`): a panel at its button that touches the sidebar (no gap, square corners, a line
  between them, the sidebar's colors and text size), only as high as its content, moved up when it does not fit,
  scrolling when it is higher than the window, with the subgroup's name and its items (the open item marked like in
  the sidebar). Icons in the panel only on the items, never on its headings: an item without an icon gets its framed
  initials (`initialsIcon()`, like the taskbar; `itemIcon(item, 'framed')`). A rule (`section-rule`) separates the
  groups. Above `MANY` (30) items the rail would be too long: only the recent items and the open one (the search finds
  the rest).
- Up and Down (Home, End) move between the buttons of the sidebar.
- With `nav="side"`, the cockpit uses only the left column: no top bar; the right side is the open app alone. The
  host's parts: the `logo` slot (replaces the default logo: four filled squares, two of them lighter, in the accent
  color on no background) and the `sidebar-end` slot (at the bottom of the sidebar, above the footer, e.g. global
  switches; hidden in the rail).
- `nav`: the navigation, one attribute (and property, reflected; `NavLayout`), switchable live (not a config option, so
  a host can switch it). Named by where the navigation is and a variant; an unknown value is the sidebar. One attribute
  rather than several (`layout`, `nav-lines`, `nav-style`: combinations without a meaning); a menubar would be another
  value. The colors stay apart (`nav-scheme`).
  - `side` (the default): the sidebar on the left.
  - `top`: the topbar, one line, each group a two-pane menu (below). Not a topbar of two lines: the one line scales
    better, the two lines needed special cases (a second line with the chosen group's or folder's apps, a triangle
    under the chosen entry).
  - `top-switcher`: one line, one dropdown with the open app (below, "App switcher").
  - `bottom`: a bar at the bottom, for phones (below, "Bottom bar").
  - `auto`: by the cockpit's width: the sidebar (its rail only when the user collapses it), below 768px (`NARROW`) the
    bottom bar.
  - The bottom bar (the cockpit becomes configurable later, then its entries too): the open app over the whole height
    (no top line: the apps have their own), a bar below it in the sidebar's colors, above the device's home indicator
    (`env(safe-area-inset-bottom)`). Its entries, all equally wide, an icon above a short label:
    - "Apps" (`texts.navigation`, four squares): a sheet from the bottom (85% of the height, at most 720px, rounded at
      the top) with the whole sidebar: the brand with a close button in place of the search, the group select, the
      navigation, the host's `sidebar-end`, the user row (its menu above it, as wide as it) and the footer (its menus as
      in the sidebar). A modal `<dialog>` (`.sheet-dialog`): focus inside (on the open app), Escape and a click outside
      close it; choosing an app closes it; the open app below is `inert` meanwhile. Marked while open.
    - The three apps used last ("Recent"), in the order of the config, so they do not move with every switch; the open
      one in the accent. Their icon (else the first letters) and title (with an ellipsis).
    - "Search" (`texts.searchShort`), when the search is on: the search panel over the whole cockpit, sliding up.
    - Not taken: "Recent" and "More" as menus, pinned apps, a top line with the app's title.
  - The topbar (`nav="top"`, and `top-switcher`): one line over the open app, with the same data:
  - The line, dark like the sidebar (`--app-cockpit-topbar-height`, 3.25rem): logo and title (and subtitle), the pinned
    apps as tabs (their icons in the accent, 15px at 14; no lines between the entries: tried and dropped, not calm),
    the groups as entries (below), then on the right the search button, the footer's actions and kebab (icon buttons;
    their menus plain dropdowns below them; no sidebar toggle), and the user's avatar (its menu below it, with the name
    and the second line on top). The open app bright, bold and underlined in the accent; the group that has it bright
    and bold. With `nav-scheme="page"` a line below it (a background).
  - Entries that do not fit: a "More" dropdown at the end of the line (the line wraps into a hidden second row; the
    wrapped entries are counted after each render and resize); a group or subgroup in it lists its apps under its name.
  - Its menus (subgroups, "More", the actions, the kebab, the user) look like the sidebar's: plain panels, square
    corners, the sidebar's colors and text size, their top at the bottom of the line (no gap, a line between them;
    `data-drop`), the shadow downwards. Their highlight (hover, arrow keys) is the text color at 9% (the hover token is
    about the light panel's own color: invisible).
  - Left and Right (Home, End) move between the entries of the line.
  - The search: a panel below the top line, centered (36rem), only as high as its content; the backdrop darkens below
    the top line.
  - No `sidebar-end` slot (like the rail). Below 768px of the cockpit's width: the sidebar's rail.
  - The demos (the package's and the root page): a "Navigation" button in the footer (`navigationSetting()` in
    `src/demo/footer.ts`) with three sections: "Navigation" (Automatic, Sidebar, Topbar, App switcher, Bottom bar; the key
    `demo-page:nav`; a stored value no longer known is the default; the root page's default `top`, the package's
    `auto`), "Colors" (Dark, Match page; see `nav-scheme`) and "Density" (Compact, Normal, Comfortable; see `density`;
    Normal by default), remembered per browser.
  - The two-pane menus (`nav="top"`): with several groups (or pinned apps), the groups are entries of the line (text
    only, a chevron; the group of the open app bright and bold; "More" for what does not fit, a hidden group listing
    its items under its name), each opening a two-pane menu below its entry (its left edge; the topbar menus' look: the
    sidebar's colors, a line on top, square corners, the shadow downwards):
    - Left: the group's subgroups (icon, name, a chevron), its items without a subgroup first as "General"
      (`texts.general`, "Allgemein"); the subgroup of the open app in the accent. Right (320px): the items of the shown
      subgroup: their icon (in the accent, like the other popups), title (the running dot with the taskbar) and
      description (at most two lines, muted); the open one like in the sidebar. All right panes lie in one grid cell
      (the hidden ones invisible and inert), so the menu keeps its height while switching. A group of one column (one
      subgroup): only the right pane, with the subgroup's name as its heading.
    - Shown when it opens: the subgroup of the open app, else the first. Hovering a subgroup shows it after 120 ms (a
      mouse on its way to the right pane does not switch); a click or the focus at once.
    - A vertical tablist and its tabpanel: Up and Down (Home, End) in a pane (on the left they show the subgroup),
      Right into the items, Left back to the subgroup. Left and Right (Home, End) between the entries of the line; Down
      on an entry opens its menu and goes into it.
    - The disclosure pattern of site navigation (WAI), our own code, no `Menu`: the entries are buttons with
      `aria-expanded` and `aria-controls`. A click opens and closes; while one is open, hovering another entry switches
      to it (the mouse only); no opening on hover alone. Choosing an item opens it and closes the menu; so do Escape
      (wherever the focus is; inside the cockpit it goes back to the entry), a pointer down outside the menu and its
      entries (also on the topbar's other buttons), the focus leaving the topbar, and the search opening.
    - It fades in with a tiny move down (150 ms); switching to another entry keeps it (no animation); the chevron of
      the open entry turns up. Nothing with reduced motion.
    - With one group or none, and no pinned apps: its items and subgroups are the entries (a subgroup a dropdown of
      its items, a `Menu`).
    - Weighed and dropped: a group select (a compact button after the title) with the chosen group's apps as tabs in
      the same line; a mega menu (a full-width panel below the line with the group's items in columns, one per
      subgroup): the two-pane menus do the same job, scale better (one subgroup at a time) and are calmer. Its shared
      parts (the entries, opening and closing, the item look) are named `panel…`.
  - "App switcher" (`nav="top-switcher"`), in the topbar only. The top line: the logo and title, one dropdown button
    with the open app (its icon and title, a selector icon; the tooltip "Switch app (Ctrl K)"), the host's actions and
    the user. No tabs, no separate search button (the switcher is it); also with one group or none (it helps with many
    apps in one group too).
  - Its panel is the search panel, opened at the button (its left edge, the top touching the line, 26rem, square
    corners): the search field, "Recent", then all apps by group and subgroup (the sections "Group › Subgroup"; the
    plain palette has the groups only), up and down, Enter, Escape as there. Ctrl+K opens the same panel. Escape gives
    the focus back to the button. It is always available with the switcher (also with `search: false`: it is its list).
  - Why not a menu with an input of its own: the search panel has the search, the ranking, the recent apps and the
    keys already; one UI for finding and switching apps.
  - Not built: a menubar (each group a dropdown of its apps, subgroups as labeled sections).
- All icons are 1em wide and high: `width="1em" height="1em"` on the cockpit's own SVGs (`icons.ts`), and the CSS gives
  the same to the SVG markup of the host (the icons of apps, groups, subgroups, actions and menu items: they need no
  size of their own). The size is the `font-size` of the icon (the rules of `styles.css`: 18px at 14 by default,
  smaller or bigger where it is used, e.g. 14 for the chevrons, 20 in the panel's field and the app tiles, 22 for the
  default logo). The boxes around the icons (tiles, group icons) keep their sizes.
- The search button's icon is a bolt (Tabler's `bolt`, MIT; copied as paths into `icons.ts`, the cockpit has no
  React), not a magnifier: the button finds apps and switches to them, fast. The same icon in the sidebar, the rail,
  the topbar and the panel's field; the tooltip stays "Search (Ctrl K)".
- The search panel's footer (the keys, the count; the switcher's and the sidebar's panel) has no background of its own
  in a light panel (`nav-scheme="page"` on a light page: as light as the rest) and a darker strip (black at 14%) in a
  dark one.
- `nav-scheme`: an attribute (and property `navScheme`, reflected; `NavScheme`), `dark` (the default) or `page`. Not
  "light": a light navigation on a dark page makes no sense. `page` follows the page (light on a light page, dark on a
  dark one): every part that is dark by default (`color-scheme: dark`: the sidebar, its popups, the footer, the
  topbar's line, the bottom bar, the search) has a nested `:host([nav-scheme='page']) & { color-scheme: inherit }`, so
  it inherits the page's scheme (not `normal`, which means light). With a light navigation: the footer a light gray bar
  (its light side; dark in the dark navigation), the avatar's initials in the accent, and in the topbar a line below
  it. The topbar's line is white on a light page (the field color, `--app-cockpit-field`; the sidebar's light gray
  looked like a toolbar there; like Jira Cloud's header), the sidebar's color on a dark one; its menus keep the
  sidebar's light gray. Discussed, not decided: a third value with an accent-colored topbar. The demos: the section
  "Colors" of the footer's "Navigation" button (Dark, Match page).
- `density`: an attribute (and property `density`, reflected; `NavDensity`), `compact`, `normal` (the default) or
  `comfortable`: the same names as the data table's `density`. CSS only (`:host([density=…])`, at the end of
  `styles.ts`), and subtle: mostly the sidebar's vertical rhythm.
  - `compact`: the app entries 32px (36px), the subgroup headers 30px (32px), the group headers 26px (28px), the gaps
    between sections and groups 8px (12px); the rows of the popups (menus, the group select's list, the rail's flyouts)
    30px (32px).
  - `comfortable`: 40px, 34px, 30px, 16px; the popups' rows 34px.
  - Unchanged: the font sizes, the topbar's lines (heights and text), the brand, the user row, the footer, the widths.
- `search`: the search button and Ctrl+K also with few apps (`true`), or never (`false`); without it, only with more
  than 8 apps. The root page uses `true`.
- A subtle line (`--app-cockpit-divider`) below the header (logo, title, search), from edge to edge of the sidebar,
  also in the rail.
- The title at the top of the sidebar, next to the logo; an optional `subtitle` under it, small and muted (one line
  each, cut with an ellipsis). The two lines are close together (line height 1.15, the subtitle 1px closer; a bit of
  room for the descenders below each, as the ellipsis needs `overflow: hidden`). Both hidden in the rail. The demos
  have one (e.g. "Acme Corporation · Headquarters").
  - In the topbars: side by side on one baseline, "Back Office Acme Corporate |": the title bold (600, 15/14 of the
    font size), 10px, the subtitle smaller (13/14), normal weight, muted, then a thin divider before the entries (the
    right border of the title and subtitle, as high as their line, the muted color at 50%). The subtitle is cut first
    when there is no room (the brand at most 360px). 20px before the divider, 8px after it plus the first entry's
    padding (12px): about 40px from the subtitle to the first entry's text, clearly more than between the entries.
    Tried and dropped: the subtitle in the title's size, thin (200), after the title, then before it (the thin weight
    also needs a font that has it).
- The sidebar is dark in both color schemes of the page: it has `color-scheme: dark`, so every `light-dark()` color
  inside it (also the slotted parts) takes its dark side; so do the popups opened from it (the group select, the
  footer's menus). The search is a dark panel: as high as the cockpit, right next to the rail (while it is open, the
  sidebar collapses to the rail, and expands again afterwards; the user's saved choice is not touched). First the
  sidebar collapses (320 ms), then the search slides in (320 ms, `animation-delay`, hidden until then); the search's
  layer and the backdrop start at the sidebar's edge and move along with it, so the search never covers the sidebar.
  The slide in is a keyframe animation (`palette-in`), not a transition from `@starting-style`: after a slide out, that
  one did not run again. Closing: the search slides back out to the left (240 ms, a CSS animation) and the backdrop
  fades, while the sidebar expands again (also 240 ms; both at once: sequential was tried), the layer and the backdrop
  moving back with its edge; the cockpit keeps the dialog open until the animation ends (a fallback after 600 ms). Not
  in the topbar layout (touching it, a line between them, square corners, the sidebar's colors), 26rem wide, over the
  open app, which is only darkened (no blur; the sidebar stays as it is). A host can let the sidebar follow the page:
  `nav-scheme="page"`.
- The sidebar's text is a bit smaller than the page's small text (`--app-cockpit-sidebar-font-size` 13px; labels and
  counts `--app-cockpit-sidebar-font-size-tiny` 10px); the popups (menus, group select, search) keep their size.
- The app icons have no background (transparent). In the sidebar, all icons (apps, groups, subgroups) are white
  strokes (`--app-cockpit-sidebar-icon`). In the expanded sidebar a bit smaller, like the topbar's tabs: an app's 17 at
  14, a subgroup's 16; their boxes stay; the rail keeps 20. In its popups (the rail's flyouts, the group select's
  options) and in the search palette they are in the accent color; the chosen group in the select's trigger is in the
  sidebar, so white. An app without an icon has none (made-up icons for hundreds of apps help nobody), except in the
  rail, where the icon is all there is: its initials (framed in the rail and in its flyouts).
- The taskbar:
  - An internal Lit element (`taskbar-element.ts`, its CSS `taskbar-styles.ts`), without state: the cockpit sets
    `tasks` (`Task`: `{ id, title, icon?, closable? }`, in the order to show) and `active`, and gets `task-select` and
    `task-close` (`CustomEvent<{ id }>`, bubbling, not composed), and `task-move` (below).
  - Private (a package never takes a tag name of its own): the tag `internal-cockpit-taskbar-<n>`, `n` the first
    number not registered yet, registered on first use with a class of its own, once per cockpit class
    (`taskbarTagFor()`, by `createCockpitClass()` call), rendered with Lit's `unsafeStatic`.
  - The cockpit uses it with `taskbar: true` (config): below the open item, in the sidebar layout and the topbars, not
    with the bottom bar.
  - The entries: the open items (created, being loaded, or failed), in the order they were opened. A click opens one
    (a history entry, like the navigation). Closing (`close(id)` of the element, public) removes its element, so its
    state is lost; closing the open one shows the one used before it. The last open item has no close button (the
    cockpit always shows one), except with a start page (`startPage`): then every one can be closed, and after the
    last one the start page is shown, without a taskbar. An item closed while loading is not created.
  - Its look: a bar (44px, as high as the sidebar's footer) in `--app-cockpit-subtle` with a line on top; each task up
    to 200px (at least 96px; then it scrolls sideways, the active one kept in view): the item's icon in the accent
    (without one: the first letters of its title, `initialsOf()` like the rail, in a rounded square drawn like the line
    icons, `initialsIcon()` in `icons.ts`: the square nearly as big as the icon (21 of 24), the letters bold, 11 of
    24, readable at 1x; framed, so they look like an icon; not a filled square (heavier than the line icons) nor a
    window outline (one letter only); 5 generic icons picked by a hash of the id were dropped too: they would look
    meaningful without being so), the title (an ellipsis, the full title as `title`), a close button (×, on the active
    task, on hover and when focused). The rail's own buttons keep their plain initials for now (the frame there: a
    later step, proposed). The active task like a tab hanging from the open item: its background, a 2px accent line
    on top. A thin line between two tasks: half the bar's height, the divider color; not next to the active or a
    hovered task, nor while dragging. A hovered task: the text color at 7% (`--app-cockpit-hover` is about as light as
    the bar: invisible).
  - Keys: a toolbar with one tab stop (the active task); Left and Right (Home, End) move between its buttons; Delete
    closes the focused task, so does a middle click. After closing from inside, the focus goes to the new active task.
  - Its values: its `theme` (the cockpit passes its own), else the defaults; no custom properties. Texts: `taskbarLabel`,
    `taskbarClose` in `core/texts.ts`.
  - The open items are marked in the navigation: a dot in the accent, like the open one in the search panel
    (`running-dot`, `#iconAndTitle()`), only with `taskbar: true`. Right after the title, with or without an icon (also
    in the flyouts; the corner of the icon was tried), 5px, raised by 4px like a superscript. In the rail, which has no
    titles, on the bottom right corner of the icon (a ring in the sidebar's color; also on the initials). Not at the end
    of the row: that is kept for badges (later).
  - Reordering (pointer events, not native drag and drop: its ghost image moves freely, no touch, the others cannot
    slide aside): a task is dragged sideways only, inside the row (after 4px, so a click still selects; the click that
    ends a drag does not), the others slide aside (150 ms; none with reduced motion), the dragged one lifted by a
    shadow; its new place: an edge of it has passed the middle of another; Escape cancels. `touch-action: none` on the
    tasks (a touch on a task drags it, it does not scroll the bar). Ctrl+Shift+Left/Right moves the focused task one
    place (its focus kept). Then `task-move` (`{ id, index }`, the index in the new order); the cockpit reorders its
    open items (`#moveTask()`). Not remembered across reloads; no scrolling of a full bar while dragging.
  - Not built (later topics): a context menu (close others), remembering the open items across reloads.
  - The demos: the root page and the package's demo have `taskbar: true`.
- No overscroll: every scroll area (the navigation, the open app's area, the search list, the group select's list, the
  flyouts) has `overscroll-behavior: none` (not `contain`, which keeps Firefox's elastic bounce); the taskbar
  `overscroll-behavior-x: none` (sideways only).
- The theme: one type for every element of the package, `CockpitTheme` (the cockpit, the taskbar, the nav tree, the
  app header, the login, the status view): a host makes one object and gives it to each class; each element reads
  the keys it needs. The cockpit's property `theme` (no attribute), its first value the config's `theme`, switchable
  live (a new object).
  - Its keys (what a host can override, and the accent; the colors stay the design language's, a key is added when
    needed). Shared: `accentColor` (one color; lighter in a dark scheme, e.g. the dark navigation, by `color-mix(in
    oklab, <accent> 60%, white)`, `accentOf()`; without it the design language's, `light-dark(#0a5cc2, #78b0ff)`),
    `fontSize` (`14px`), `fontFamily` (`system-ui, sans-serif`), `buttonActiveTransform` (a pressed push
    button's CSS `transform`, e.g. `translateY(1px)`, `scale(0.96)`; `none` by default; the push buttons: the
    cockpit's search, footer and topbar icon buttons and "Try again", the app header's switcher, Back and Forward,
    the login's and the status view's buttons; not tabs, menu items or list entries; one value for all, small and
    wide: a strong scale suits the icon buttons, not the login's full-width one), `buttonBorderRadius` (the corners
    of the push buttons, `5px` by default: the screens' buttons and "Try again"; not the app header's, which has
    `headerBorderRadius`; the cockpit's icon buttons keep theirs). A part's own keys start with its name (the token
    rule's area): the cockpit's `sidebarWidth` (`256px`), `railWidth` (`68px`), `contentPadding` (`16px 20px`); the
    nav tree's `navTreeIconColor`; the app header's `header…` (below).
  - Defaults: `DEFAULT_COCKPIT_THEME` (`themes/default-cockpit-theme.ts`, internal). A host starts from
    `createCockpitTheme(theme?)` (`css.md`: ready themes are functions): the defaults with the given keys on top, a new
    object each call. Not in it: the keys that follow the accent (`AccentKey`: `navTreeIconColor`,
    `headerIconBackgroundColor`, `headerTabActiveBackgroundColor`, `headerTabActiveTextColor`, `headerLinkTextColor`,
    `headerFocusRingColor`), so a host's accent reaches them, and `fontFamily`, whose default is each element's own
    (the cockpit's `system-ui`; the nav tree and the inline status view inherit the page's). The default accent given
    explicitly counts as the default (`accentOf()` does not mix it again).
  - Weighed: a theme type per element (five types, the shared keys given to each class apart, the app header without
    an accent), a shared base extended per element (still five types).
  - No custom properties (they would inherit into the mini-apps): the stylesheet is built from the theme
    (`styles(theme)` in `styles.ts`, its values in `themeValues()`: the theme's and the fixed ones of the design
    language), a `CSSStyleSheet` adopted in the shadow root, rewritten in `willUpdate` when the theme changes. The
    names `--app-cockpit-…` in this file are the keys of `themeValues()`, e.g. `--app-cockpit-divider` is
    `v.divider`.
  - The values only known at run time (the width the user resized the sidebar to, the left edge of the app switcher's
    panel): a second stylesheet (`layoutStyles()`), with copies of the few rules that use them (the same selectors,
    later, so they win), rewritten when they change. Not inline styles: one of them is in `@starting-style`.
  - The taskbar has a `theme` too (`taskbarStyles(theme)`, the same `themeValues()`); the cockpit passes its own.
  - The demos' "Accent color" choice (`accentSetting()` in `src/demo/footer.ts`) sets the cockpit's `theme.accentColor` (merged
    into its theme, once the element is defined), and `--app-accent-color` on `<html>` for the page (the root page
    maps it to its apps).
- Texts (`i18n.md`): English only in the package, as functions of their values and the locale (`src/main/texts/en.ts`,
  the master), the namespace `'cockpit'`; the app gives an `I18nAdapter` in the config (`i18n: i18nAdapter`, of
  `createCockpitClass` and `createAppHeaderClass`, the same for every element of the class; its `onChange`
  re-renders). `textsOf` (`core/texts.ts`) asks `translate(namespace, key, params)`; `null` (or no adapter): the English
  text, formatted in the adapter's locale (`en-US` without one; the page's language is never read). Params: `items`
  (`{ count }`, the English plural by `count === 1`), `taskbarClose` (`{ title }`), `headerBackTo`, `headerForwardTo` (`{ page }`).
  - The keys (`i18n.md`: a library's keys flat camelCase, no dots): the cockpit's general ones without a prefix
    (`loading`, `retry`, `items`, `group`), the cockpit's areas and the other parts with theirs, like the theme's keys:
    `search…` (with the panel's key hints `searchHintOpen`, `…Move`, `…Close`), `sidebar…`, `taskbar…`, `navTree…`,
    `header…` (the app header), `login…`, `statusView…`.
    The taskbar gets the cockpit's texts as a property (`texts`).
  - The translations: ICU messages, `locales/en.json`, `locales/de.json` (exported as
    `@local/cockpit/locales/*.json`), which the app loads into its i18n under the namespace `cockpit`. Derived from
    the master by hand (or the AI) after every change; `src/test/texts/texts.test.ts` checks their keys and
    placeholders (`npm test`, Vitest).
- The demos' German (`src/demo/i18n.ts`, `DEMO_I18N`): an adapter that follows `<html lang>` (the footer's language
  switch), used by the cockpit's demo and the root page.
- Remembered per browser (`localStorage`, `storageKey`, ignored when storage fails): the recent apps, the rail, the
  open groups. The default key is `cockpit`.
- No `rem` in the cockpit's CSS: a page's root font size must not change the shell. Every length is in `px` (a `rem`
  quoted in this file is 16px). Every `font-size` (the texts and the icons, which are sized by it) is a multiple of
  the theme's `fontSize` (default `14px`, the apps' normal text: Mantine's `sm`): `calc(${v.fontSize} * N / 14)` with N
  the size in px at 14 (the sidebar's text 13, the title 15, the icons 18 ...). The boxes (widths, heights, paddings)
  stay in px and do not scale with it.
  - The same as the apps' Mantine text size: the root page sets the cockpit's `theme.fontSize` (`demo/main.ts`) and
    each app's own `--…-font-size` (`--board-manager-font-size` ...: Mantine's `sm`, from which every other Mantine
    size follows) in `demo/demo.css` to the same `14px`.
  - `--app-cockpit-small` is the popups' text.
- The cockpit's own parts have a font of their own (the theme's `fontFamily`, default `system-ui`), so a mini-app's
  global CSS (e.g. Mantine's on `body`) does not change them. A host sets (the theme): `fontSize` (the base size of all
  texts and icons, `14px`), `sidebarWidth` (the default width), `railWidth`, `contentPadding` (around the open app;
  `16px 20px`). In the topbars and beside the rail a plain `12px 16px` (less room there); not the theme's, so the
  host's value counts only beside the expanded sidebar and the bottom bar.

## The login

- `createLoginClass({ theme?, i18n? })`: a login screen, a Lit element of its own (the host chooses the tag; the demos
  register `<app-login>`). In the main entry, not an entry of its own: the package has no side effects
  (`"sideEffects": false`), so a host that imports only the login does not get the cockpit. The cockpit does not know
  it: the host shows it in place of the cockpit and back.
- The layout and the buttons (the submit button, the providers'); the host gives the rest of the content and owns it (its forms, the views and
  their logic). The element adds no children of its own (an element's light DOM is its user's), so the host's inputs
  stay in the light DOM, where password managers and autofill find them (they do not find inputs in a shadow root
  everywhere: Safari, Firefox, 1Password). It fits the host's stack: Mantine's inputs in a Mantine app, plain ones
  elsewhere. No built-in forms: an element that renders into its own light DOM breaks when the host replaces its
  children, and its inputs would never match the host's.
- Attributes: `app-title` (not `title`: the browser's tooltip), `subtitle`, `heading` (the view's, none when empty),
  `submit-label`, `submitting` (below).
- The submit button (`submit-label`: its text, e.g. "Sign in", none when empty): the element's, in its shadow root,
  below the default slot, full width in the accent. A button in a shadow root cannot submit a form in the light DOM
  natively (`form="…"` does not cross the boundary), so it calls `requestSubmit()` on the host's form (the first
  `<form>` in the default slot, slotted or inside a slotted element): a real submit event, the host's checks and handler,
  what password managers listen for. The host's form has no submit button of its own. Enter in an input of that form
  submits it too (a `keydown` listener on the element: natively, Enter does nothing in a form of two inputs without a
  submit button), unless the input used it itself (`defaultPrevented`, e.g. a select's list), an IME composes, or the
  form has a submit button of its own. `submitting` (boolean, reflected): set by the host while its handler runs: the
  button's spinner, the providers disabled; a provider running disables the button.
- Slots: the default one (the view), `logo` (default: the cockpit's logo, four squares in the accent, from the shadow
  root), `footer` (below a line, centered; no line without it), `hint` (small and muted, below the card). Whether a
  slot has content: `slotchange` (an element, or text that is not only white space).
- The providers (OIDC, SSO): `providers` (`LoginProvider`: `{ id, label, icon? }`, the icon SVG markup) and
  `signInWith(id)` (`null`: no buttons; the host signs in: a redirect, a popup; nothing of OIDC in the package). Below
  the default slot, after a line "or" when the slot has content, full width, outlined, "Continue with {provider}" with
  the icon. The clicked button shows a spinner while its promise is pending, the others are disabled; a rejected
  promise shows its message below them (else "The sign in failed. Please try again."). The host's form is not locked
  meanwhile (its own function: it knows). A host with views shows them on its sign in view only (`providers` set per
  view). Plain verbs, not `onSignIn`: React 19 takes every `on…` prop of a custom element as an event listener.
- The theme: the `CockpitTheme` (it reads `accentColor`, `fontSize`, `fontFamily`), fixed per class (no `theme`
  property); without a key the default. The rest is the design language's (`light-dark()`; the buttons `5px`, the card `6px`;
  the error color the login's own, `light-dark(#c92a2a, #ff8787)`). Pressed, the buttons darken a step
  more than on hover (the submit button the accent with 24% black, 12% on hover; the providers `light-dark(#e9ecef,
  #383838)`), no transition. The accent: the default logo, the submit button,
  the buttons' focus ring. The host's content inherits the card's font and color (a slotted element inherits from its slot).
- Texts (the cockpit's adapter and namespace): `loginContinueWith` (`{ provider }`), `loginOr`, `loginProviderFailed`.
- The layout: a card (440px) on a light gray screen, at least the window's height, a bit above the middle (three rows,
  `minmax(32px, 2fr) auto minmax(16px, 3fr)`): the logo with the title and the subtitle (small, on top), the heading
  (large), the view, the submit button, the providers, the footer; the hint below the card. Narrow (up to 480px): the card is the page,
  edge to edge, from the top; short (up to 640px high): less room; narrow or touch: the buttons 44px. The safe areas as
  padding. `user-select: none` on the screen (an input of the host's sets its own).
- The demos' login (`src/demo/login.ts`, `loginDemo({ title, subtitle, accent, storageKey, content? })`, used by the
  package's demo and the root page; `content` renders the views into the element and returns what removes them
  (`LoginContent`; the package's `plainContent`, the root page's Mantine forms); one made-up server for both
  (`DEMO_SERVER`, with `PROVIDERS`); its CSS `src/demo/login-demo.css`, BEM `login-demo`, the design language's tokens and the
  page's `--app-accent-color`): the host of the element, an example of the content. "Sign out" fades the cockpit out
  (`data-fading`, the page's CSS) and shows `<app-login>` in its place, signed out remembered per browser
  (`restore()`). Three views rendered by Lit into the element (sign in, reset password, register), with the checks
  (required, an email, the passwords equal), the pending states (the spinner, read-only fields), the errors, the password inputs' eye (show or hide), no suggestions of the browser (`autocomplete="off"`); the
  shell sets `signInWith`, each content `submitLabel` and `submitting` per view and `providers` on its sign in view
  (`PROVIDERS`, three made-up ones). Any username and password sign in after 500 ms, the password "wrong" fails; reset and register
  answer after 600 ms (the account "taken" exists already); Microsoft and Company SSO sign in after 700 ms, Google
  fails. English only. The class is defined when the login is shown the first time, with the page's accent then.
- Its CSS: the screen's (`src/main/screen/screen-styles.ts`, shared with the status screen: the screen, the card, the
  brand, the heading, the main button `.primary`, the footer, the hint, the small screens) and its own parts
  (`login-styles.ts`).
- Tests: `src/test/login/login-element.test.ts` (jsdom: the texts, no children of its own, the logo, the footer's
  line, the hint, the providers: shown, the line "or", running, failed; the submit button: the host's form submitted by it and by
  Enter, not when an input used Enter, none without a label, the spinner).

## The status view

- `createStatusViewClass({ theme?, i18n? })`, `StatusViewElement` (the demo registers `cockpit-demo-status-view`;
  suggested `<app-status-view>`): why there is nothing (else) to show, inline in a page (an empty list, no results, a
  record that does not exist, a panel without access) or as a screen of its own (not found, no access, an expired
  session, maintenance, an error). One element for both (`src/main/status-view/`, in the main entry): the layout
  only decides the frame. Weighed: two elements, a status screen and an empty state (every part is optional, so nothing
  of one would be dead in the other, and most kinds are useful in both layouts).
- Every part only when given: the brand (`app-title`, `subtitle`, the slot `logo`; only with `app-title`), the icon
  (the kind's or the slot `icon`'s; its ground only with one), the heading and the message (the kind's or the host's),
  the host's extras (the default slot), the button (`action-label`), the footer (the slot `footer`, below a line), the
  hint (the slot `hint`). Without a kind and texts: nothing.
- `layout` (reflected): `inline` (the default: no background of its own, the page's text color, the font the theme's
  only when given; the heading 16 at 14, the icon 48px, the button as wide as its text) or `screen` (the login's card
  on its screen, `screenStyles()`, at least its container's height: the host gives it, `100dvh` for the window; the
  heading a `h2` of 20, the icon 56px, the button full width).
- `kind`: `default` (none: only the host's texts and icon) or a preset: `empty`, `no-results`, `not-found`,
  `forbidden`, `expired`, `maintenance`, `error` (Tabler's `inbox`, `search`, `file-unknown`, `lock`, `clock`, `tool`,
  `alert-triangle`; on a light ground of the accent, `error`'s in the error color), each with a heading and a message
  (`statusView<Kind>`, `statusView<Kind>Message`; worded for both layouts: "Not found", not "Page not found").
- Invalid attributes (`layout`, `kind`) are the default, invalid values a `RangeError`.
- The button: the element's (like the login's; a theme makes it fit, e.g. `createMantineCockpitTheme()`), a click
  fires `action` (a plain bubbling `Event`).
- The demo: the tab "Status view" of `src/demo/cockpit-demo.ts`: switches for the layout (the screen in a frame of
  560px), the kind, the button, the brand, the host's texts and icon, the extras (an error id, a footer, a hint), a
  log of the events.
- Tests: `src/test/status-view/status-view-element.test.ts`.
- Not used by the root's apps yet.

## The React components

- The entry `@local/cockpit/react` (`src/main/react/`, an add-on: removable in one piece; React an optional peer
  dependency, `>=19`): one factory per element class, with the class's config and the i18n as a hook (`useI18n`,
  `i18n.md`): `createNavTreeComponent`, `createStatusViewComponent`, `createLoginComponent`,
  `createAppHeaderComponent`, `createCockpitComponent`. Its types in `src/main/react/api/` (`NavTreeProps`,
  `NavTreeComponentConfig`, …, `CockpitCommonProps`); the entry also exports the main entry's types.
- One generic wrapper (`define-component.tsx`, `defineComponent(spec, useI18n)`), each factory a spec
  (`components.ts`): the props set as properties (only the changed ones; a missing prop is the element's default,
  `theme` and the cockpit's `startPage` the config's), the callback props and their events (`onNavigate`, `onAction`,
  `onBack`, `onForward`: the DOM event, `preventDefault()` cancels it; the latest callback without listening again),
  the slots (a node per named slot, in a `<span slot="…" style="display: contents">`; `children` straight into the
  element, its default slot: the login's form in its light DOM; the app header's `crumbLabels` as `crumb-<index>`),
  `id`, `className`, `style`, `lang`, `aria-*`, `data-*`, `ref` (the element).
- No side effect at the call (also on the server): on the first mount on the client the elements' code is loaded
  (`import()` of `client.ts`), the class created and registered under the first free `internal-cockpit-<name>-<n>`;
  until then (and on the server) an empty placeholder (`aria-busy`). A failed registration is thrown while rendering
  (an error boundary gets it).
- The hook's adapter is set on each element (`setElementI18nAdapter` of `core/i18n-controller.ts`, internal): every
  element's adapter is an `I18nController` (a Lit controller: the class config's adapter, or one set for the element;
  subscribed to its `onChange` while connected; a new one renders again). The cockpit gives its own to its nav trees.
- A slotted icon or logo through React sits in that `<span>`: the element's `::slotted(svg)` sizes do not reach it,
  the host sizes its SVG itself.
- `@local/micro-app`'s header is built on `createAppHeaderComponent`.
- The demo: the tab "React" of `src/demo/cockpit-demo.ts` (`src/demo/react-demo.tsx`): the nav tree and the status
  view as React components, a made-up router.
- Tests: `src/test/react/components.test.tsx` (the placeholder and the tag, props as properties and defaults, the
  callback, the slots, the ref, the hook's adapter, the login's form as children, the app header's crumbs and events).

## The nav tree

- `createNavTreeClass({ theme?, i18n?, storageKey? })`, `NavTreeElement` (not "sidebar": no rail, search, user or
  footer): the navigation tree of the cockpit's sidebar as an element of its own
  (`src/main/nav-tree/`), for the cockpit and standalone in any app: `createNavTreeClass` in the main entry, its types
  in `api/nav-tree.ts`. The cockpit uses it under an internal tag (`navTreeTagFor()`, `internal-cockpit-nav-tree-<n>`,
  like the taskbar).
- `items` (`NavTreeItem`: `id`, `title`, `href`, `icon?`, `description?` (the tooltip), `group?`, `subgroup?`),
  `groups` (the folders' icons, `NavGroup`), `active` (attribute), `marked` (ids: a dot after the title),
  `collapsible-groups`, `density`, `theme` (the `CockpitTheme`: `accentColor`, `fontSize`, `fontFamily`,
  `navTreeIconColor`; live). The grouping is `core/groups.ts` (generic over the item type).
- The items are links (`<a href>`); a plain click fires the cancelable `navigate` (`{ id, href }`, bubbling, composed),
  like the app header: a router cancels it and navigates itself; middle and modified clicks stay the browser's.
- The groups as headings (the items without a group first, a line in place of their heading); with
  `collapsible-groups` toggles with a count ("Other" for the items without a group), open by default: the active
  item's group, the one without a name, and all when there are at most 30 items. The folders always collapsible,
  open by default, with an icon (only when the config has one) and a count, their items along a guide line. Open and
  closed remembered under `<storageKey>:groups` (in the cockpit: its own `storageKey`).
- `group-display="select"` (`groupDisplay`; `sections` by default): one group at a time, chosen in a dropdown on top
  (the chosen group and its count; its list all groups with their counts, the chosen one checked; "Other" for the items
  without a group), the chosen group's items below it without its heading. With one group only: as sections. The
  chosen group follows the active item and is remembered under `<storageKey>:group`. The dropdown is the cockpit's
  `Menu` (a listbox: its keys, typing, a click outside), its positioner a popover (the top layer, like the app
  header's), placed by CSS anchor positioning below the select, as wide as it.
- Up and Down (Home, End) move between its links and toggles; at an end the key is left to the host (the cockpit
  goes on to its next tree).
- No landmark of its own: the host wraps it in a `<nav>`. No resizing (the host's layout gives its width). Its text
  color and font inherited.
- Slots `top` and `bottom` (the host's title, filter, links, user row): fixed above and below the list, the group
  select between `top` and the list; each with 12px to the list, its room only with content (`slotchange`). The tree
  is a flex column: with a height from the host (a flex item, or `height`), only the list scrolls (`.scroll`,
  `overscroll-behavior: none`, a thin scrollbar); without one, it is as tall as its content (the cockpit's trees,
  in its own scrolling sidebar). The list reaches 12px out on both sides (the host's padding), so its `overflow` does
  not cut off the active item's mark at the left edge.
- In the cockpit: the expanded sidebar and the bottom bar's sheet (the rail keeps its own icons and flyouts). Items
  `href: '#<id>'`; `navigate` canceled, `open(id)`. "Recent" is a tree of its own (its items in one group named
  "Recent", without their folders); with the cockpit's own group select (`groupDisplay: 'select'`), a tree of the chosen
  group's items (without their group); to be replaced by the tree's `group-display="select"`. `collapsible-groups`
  with more than `FEW` items (unless `collapsibleGroups: false`), `marked` the open items (with the taskbar), its icons
  the sidebar's white strokes (`navTreeIconColor`), its theme the cockpit's. The sheet's first focus: the close
  button, then the open item once the tree has rendered.
- The demo: the tab "Nav tree" of `src/demo/cockpit-demo.ts` (the root page's Internals › Cockpit): made-up items
  (one without a group, two groups, folders with and without an icon) in a sidebar-like frame (260px wide, 420px
  high, so the list scrolls; a title in `top`, a link in `bottom`, switchable), a made-up
  router (`navigate` canceled, the item becomes the active one), switches for `group-display`, `collapsible-groups`,
  `marked` and `density`, a log of the events; remembered under `cockpit-demo-nav-tree`.
- Tests: `src/test/nav-tree/nav-tree-element.test.ts` (headings, folders, order, tooltip, active, marked, `navigate`
  and modified clicks, folders remembered, collapsible groups and "Other", the group select following the active item,
  the slots `top` and `bottom`).

## Layout and commands

- `exports` in `package.json` (rather than an alias per package and entry in the root): each entry has a `source`
  condition first, its file in `src/main/`, then its built file in `dist/`. The root's demo resolves the package by name
  (`@local/…`) to its sources by that condition (its `vite.config.ts` and `tsconfig.json`); everywhere else, a
  customer's copy too, the condition is ignored and `dist/` counts.
- Three trees in `src/` (`general.md`): `main/`, `demo/`, `test/`.
- `src/main/api/`: the types (by topic); `src/main/element/`: the custom element (`cockpit-element-base.ts`, `CockpitElementBase`, Lit: shadow root,
  light-DOM apps, routing, the whole UI; `create-cockpit-class.ts`), `menu.ts` (the menus), `icons.ts`, its CSS
  (`styles.ts`); the taskbar (`taskbar-element.ts`, `taskbar-styles.ts`); `src/main/nav-tree/`: the nav tree (`create-nav-tree-class.ts`, `nav-tree-element-base.ts`,
  `nav-tree-styles.ts`, `nav-tree-tag.ts`); `src/main/login/`: the login (`create-login-class.ts`, `login-element-base.ts`, `login-styles.ts`);
  `src/main/status-view/`: the status view (`create-status-view-class.ts`, `status-view-element-base.ts`,
  `status-view-styles.ts`); `src/main/react/`: the React components (see there); `src/main/screen/screen-styles.ts`: the CSS they share;
  `src/main/core/`: groups (`groupsOf`, `subgroupsOf`: the groups and folders of the navigation), search, texts,
  storage; `src/main/texts/en.ts`: the English texts; `locales/`: the ICU messages; `src/demo/i18n.ts`: the demos' German.
- `src/demo/`: the package's demo (`npm run dev`), with 3, 30 or 100 apps (the "Apps" choice in the footer; `?apps=some`,
  `?apps=many`); the 100 apps with `groupDisplay: 'select'`; in the 30 and 100 apps every app has a group and a
  subgroup (no "Other"); `src/demo/ui/`: the design language (a copy, like in every package). Each made-up app
  (`demo-app.ts`) has an app header (`<demo-app-header>`, registered by `main.ts`): its icon (the item's, by the
  attribute `icon`), its title, the modules Overview, Entries (two entries with pages of their own), Settings; "Documents"
  a switcher (Contracts, Templates, Letters). A made-up router answers it (`app-header-demo.ts`, `wireAppHeader()`, shared
  with `cockpit-demo.ts`).
- `src/demo/cockpit-demo.ts` (`CockpitDemo`, light DOM, exported, not registered; its CSS `cockpit-demo.css`): the
  root page's "Cockpit" (Internals › Components). The app header twice (the default look, an own theme) with a made-up
  router (its own list of paths), switches (the switcher, its descriptions, the width) and a log of the events; a
  second tab the nav tree (see "The nav tree"), a third the status view, a fourth the React components; a fifth says where the cockpit is (the page itself: it owns the URL hash, so it cannot run inside it).
- `npm run typecheck`, `npm run build` (library mode; Lit stays outside), `npm run format`.
- `npm test` (Vitest, in jsdom; `src/test/setup.ts` adds what jsdom lacks: `adoptedStyleSheets`).
- `npm run loc` (`src/main`), `npm run loc:all` (all of `src`): the lines (all, code, comments, blank) by kind and by folder,
  with each one's share of the code as a bar (`scripts/loc.mjs`). sloc counts each file; the kind comes from its name,
  as the CSS and the icons live in TypeScript: `*styles.ts` is "CSS (in TS)", `icons.ts` "SVG (in TS)", other `.ts`
  TypeScript, `.css` CSS. `src/demo/ui` is marked as a copy of the design language.

## Plans

- The app header: the header of a micro-app as a Lit element of this package, `createAppHeaderClass(config?)`
  (`element/app-header-element-base.ts`, `AppHeaderElementBase`; its CSS `app-header-styles.ts`), the only
  implementation. `micro-app`'s `AppHeader` is its React wrapper (TanStack Router), used by the Board Manager; it
  replaces `MicroAppHeader` in the other apps later.
  - One line (the icon on its tile, the title, the modules as tabs, the slot `end`, Back and Forward), the breadcrumb
    below ("Home", then `crumbs`); narrow (container queries, its own width): the tabs a menu below 896px, Back and
    Forward hidden below 640px; sticky. The menus are `Menu`s, their positioners popovers (`popover="manual"`, the top
    layer: above another sticky header and a frame that cuts its content), the Back and Forward tooltips a popover too
    (below the button, CSS anchor positioning). The container of the container queries is the inner `.header` (a container is the containing block
    of `position: fixed` inside it), the popups are rendered after it.
  - The switcher's entries: the icon, the label and, with `description`, a muted line below it (two lines at most, at
    most 280px), the check on the current one; the modules menu shows only the labels.
  - Slots: `icon`, `end`, `crumb-<index>` (in place of a crumb's label: a framework's content, e.g. a name that is
    loaded), `back-page` and `forward-page` (their text read when the tooltip shows, "Back to …").
  - Not canceled, `navigate` lets the browser follow the link (a menu's choice: `location.assign()`), `back` and
    `forward` call `history.back()` and `forward()`.
- The ready themes (`src/main/themes/`, its `index.ts`), functions exported by the main entry (not an entry of their
  own like `file-upload`'s `/themes`): `createCockpitTheme(theme?)`, `createMantineCockpitTheme(theme?)`
  (`themes/mantine-cockpit-theme.ts`).
  - `createMantineCockpitTheme(theme?)`: a ready theme for an app built on Mantine, like `file-upload`'s (a theme of a
    tier-1 package may read a UI library's variables; only strings, no dependency): the default theme, Mantine's
    values on top, then the given keys. Mantine's values: `accentColor` (Mantine's primary color), the font, the
    `header…` keys, all Mantine's variables, and Mantine's press
    (`buttonActiveTransform: 'translateY(calc(0.0625rem * var(--mantine-scale)))'`: its `activeClassName`'s global
    class does not reach into a shadow root, so its transform is copied; an app that turns it off passes `none`), and Mantine's button
    radius (`buttonBorderRadius: 'var(--mantine-radius-default)'`), so the elements follow the app's Mantine
    theme. Only inside a Mantine scope, where its variables are defined: an element in an app (`micro-app`'s header),
    not the shell above the apps (the root page's are scoped per app).
  - The name: `AppHeader` (`createAppHeaderClass()`, `AppHeaderElement`; the host chooses the tag). Weighed:
    `MicroAppHeader` (the other package's name), `CockpitHeader` (reads like the cockpit's own header).
  - Its texts ("Home", "Back", "Forward", "Back to …", "Forward to …", "Modules"): like the cockpit's, through its
    config's `I18nAdapter` (`core/texts.ts`).
  - Its theme: the `CockpitTheme`, its keys `header…` (`headerBackgroundColor`, `headerTabActiveTextColor`, …, the
    token rule's area); without the accent keys, the active tab, the links, the focus ring and the icon's tile follow
    `accentColor`.
  - Router-free: the element never changes the URL; it shows the state (`modules`, `activeModule`, `crumbs`, `back`,
    `forward`) and fires events. Links are real `<a href>`; a plain click fires the cancelable `navigate` (`{ href }`),
    which a router adapter cancels to navigate itself; `back` and `forward` likewise.
  - The title as a switcher (optional, `switcher`): a dropdown of the other apps of an embedded app made of very
    different ones (expected: a handful; no filter field).
  - A `mantine` theme (reads Mantine's variables), so it looks almost like Mantine in the apps; `micro-app`'s wrapper
    passes it.
- Split into smaller parts: today the cockpit is a launcher for mini-apps; later it shall be built from smaller parts,
  and the launcher for mini-apps will be one incarnation of them.

## Not set up yet

- Scoped custom element registries (in every target browser now: `new CustomElementRegistry()`), todo: the
  taskbar in the cockpit's own registry (its shadow root) under a plain name, in place of the global
  `internal-cockpit-taskbar-<n>`; then the convention for internal elements (`general.md`, the master, and its copies).
- Runtime composition (separate deployments: import maps, Module Federation), only when needed.
- Board Manager and File Center as packages of their own (proposed).
