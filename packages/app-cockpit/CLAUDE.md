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
  sidebar's edge, the footer bar) gets one virtual anchor per menu, kept (a new one per render loops Floating UI).
- Tooltips: one element for all, on hover (300 ms) or focus of anything with `data-tip` (`data-tip-side`), positioned
  by Floating UI; not on a button whose popup is open.
- Zag gives a positioner the z-index of its content: it is set on the popups (`.menu-popup`, `.flyout`, …). Zag hides
  closed popups with `hidden` (forced by `[hidden] { display: none !important }`); open animations by
  `@starting-style` (none on closing).
- The name: `<app-cockpit>`, package `@local/app-cockpit`, types `AppCockpit.*` (clear rather than charming; e.g. not
  `tidy-cockpit`, `app-shell`).
- No iframes (overlays could not leave them; language, scheme and routing would need syncing).
- Implemented 2026-10-03 (the user asked to build it the way proposed, without discussing each step):
  - `createAppCockpitClass(config)`, like `createFileUploadClass`: `{ title?, subtitle?, search?, user?, userMenu?, apps, groups?, groupDisplay?, footer?,
    storageKey? }`;
    `groups`: `{ name, icon?, subgroups?: { name, icon? }[] }[]`, extra data of the groups and their
    subgroups (by the `group` and `subgroup` of the apps), for now their icons. The host
    registers the class itself (`customElements.define('app-cockpit', …)`).
  - `MiniApp`: `id` (the first hash segment), `title`, `description?` (search, sidebar tooltip), `icon?`
    (SVG markup, drawn in `currentColor`, the accent color; without one: no icon, only in the rail its initials), `group?`, `subgroup?` (the
    second level inside its group), `element` (the tag), `attributes?`
    (set on the element), `load?` (e.g. an `import()` that defines the element).
  - Composition at build time (one Vite build; `load` gives lazy chunks).
  - No navigation groups of its own: the host groups its apps (`group`); the root page uses "Components" and "Apps".

## Behavior

- Routing: the first segment of the URL hash is the open app's id; the rest belongs to the app. No hash (or an unknown
  first segment at the start): the first app. Opening an app pushes a history entry (Back and Forward go through the
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
  shows, the name as the tooltip). The demos: "Anna Schröder", with Profile, Settings, Sign out (moved
  from the kebab menu, which keeps Keyboard shortcuts, What's new, About).
- Footer (2026-10-03): a dark gray bar at the bottom of the sidebar (a bit lighter than the dark sidebar), flush with its edges, in
  segments (`role="toolbar"`): on the left the sidebar's toggle, in the middle the host's actions (`footer.actions`:
  `{ id, label, icon, badge?, onSelect?, choices? }`, icon buttons with a tooltip that share the room between
  the toggle and the kebab (they grow), a red dot for `badge`; with
  `choices` (`{ options: { value, label }[], value(), onChange }`, 2026-10-03) the button opens a menu with the options,
  the current one checked, read from `value()` whenever it renders, so the host keeps the state), on the right a kebab
  button with the host's menu (`footer.menu`: sections of `{ id, label, icon?, shortcut?, onSelect? }`, separated by
  lines; Zag `menu`). With the sidebar expanded, the footer's menus (the kebab's, the choices) open as a sheet
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
- The sidebar collapses to a rail of icons (the toggle in the footer, remembered per browser; always below 768px of
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
- The cockpit uses only the left column (2026-10-03): no top bar; the right side is the open app alone. The host's
  parts: the `logo` slot (replaces the default logo: four filled squares, two of them lighter, in the accent color on no background) and the `sidebar-end` slot (at the bottom of the sidebar, above
  the footer, e.g. global switches; hidden in the rail).
- `search` (2026-10-03): the search button and Ctrl+K also with few apps (`true`), or never (`false`); without it, only
  with more than 12 apps. The root page uses `true`.
- A subtle line (`--divider`) below the header (logo, title, search), from edge to edge of the sidebar, also in the
  rail (2026-10-03).
- The title at the top of the sidebar, next to the logo; an optional `subtitle` (2026-10-03) under it, small and muted
  (one line each, cut with an ellipsis). Both hidden in the rail. The demos have one (e.g. "Acme Corporation ·
  Headquarters").
- The sidebar is dark in both color schemes of the page (2026-10-03): it has `color-scheme: dark`, so every
  `light-dark()` color inside it (also the `ui-*` tokens and the slotted parts) takes its dark side; so do the popups
  opened from it (the group select, the footer's menus). The search is a dark panel (2026-10-03; was a centered dialog): as high as the cockpit, right
  next to the rail (while it is open, the sidebar collapses to the rail, and expands again afterwards; the user's saved
  choice is not touched) (touching it, a line between them, square corners, the sidebar's colors), 26rem wide, over the
  open app, which is only darkened (no blur; the sidebar stays as it is). A host can let the
  sidebar follow the page: `--app-cockpit-sidebar-scheme: normal`.
- The sidebar's text is a bit smaller than the page's small text (2026-10-03, `--sidebar-font-size` 13px; labels and
  counts `--sidebar-font-size-tiny` 10px); the popups (menus, group select, search) keep their size.
- The app icons have no background (transparent). In the sidebar and its popups, all icons (apps, groups,
  subgroups) are white strokes (2026-10-03, `--sidebar-icon`); in the search palette the app icons stay in the accent
  color. An app without an icon has none (made-up
  icons for hundreds of apps help nobody), except in the rail, where the icon is all there is: its initials.
- Texts in English and German, by `<html lang>` (`core/texts.ts`).
- Remembered per browser (`localStorage`, `storageKey`, ignored when storage fails): the recent apps, the rail, the
  open groups.
- The cockpit's own parts have a font of their own (`--app-cockpit-font-family`, default `system-ui`), so a mini-app's
  global CSS (e.g. Mantine's on `body`) does not change them. Overridable: `--app-cockpit-sidebar-width` (the default width),
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
