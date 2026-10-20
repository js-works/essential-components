# micro-app

`@local/micro-app`: highly opinionated building blocks for the cockpit's apps (micro-apps, as in micro frontends),
built on Mantine, TanStack Router and react-i18next. Created 2026-10-17. The rules of the root's `CLAUDE.md` apply; the
plan behind it (the cockpit with ready micro-apps and the ones a customer needs, on these building blocks) is in its
TODO list.

## Conventions

The general rules (copies of the repository's master, `docs/conventions/`):

@docs/conventions/general.md
@docs/conventions/css.md
@docs/conventions/typescript.md
@docs/conventions/i18n.md
@docs/conventions/react.md

## Working rules

- `src/api/` holds the API types (`header.ts`: `MicroAppHeaderProps`, `MicroAppModule`, `MicroAppCrumb`, and the crumb
  in TanStack Router's `StaticDataRouteOption`); `src/index.ts` exports them flat, the components and `microAppTexts`.
- Always add the decisions (also small ones) to this file, in the same step as the code.
- The prefix `MicroApp` only where the thing is the micro-app's own (2026-10-17, the user's choice, proposed at about
  70%): `MicroAppHeader`, `MicroAppProvider`, `microAppResources`. The others are named for what they are: `DataTable`
  (`MicroAppTable` for a day; the data table exports no component of that name, only its factory), `MantineScope`
  (`MicroAppScope`), `createLook` (`createMicroAppLook`), `defineForm` (`defineMicroAppForm`; not `defineUseForm`,
  form-validation's). The types keep the prefix (`MicroAppLook`, `MicroAppLookOptions`: the type names' rule).

## Decided (2026-10-17, step by step with the user)

- The name `micro-app` in every form: BEM `micro-app__…`, the i18n namespace `'microApp'`, components `MicroApp…`
  (weighed: `mini-app`, which sounds odd; `app-kit`, whose generic block `app__` and namespace `'app'` would collide in
  customers' code; and others, see the root's TODO).
- Tier 2: Mantine, react-i18next, and TanStack Router (code-based routes, not file-based: no dictated files; weighed
  against React Router 8: untyped params and links in its data and declarative modes). Peers: `react`, `react-dom`
  (`>=19`), `@mantine/core`, `@mantine/hooks` (`^9.5.1`), `@tanstack/react-router` (`^1.170.0`; 1.170.41 in the dev
  dependencies), `i18next` (`>=26`), `react-i18next` (`>=17`). Icons: inline SVGs (Tabler's paths), no icon library.
- Embeddable where possible (not a high priority): the building blocks read the app's router (a memory history works
  the same), and the header's narrow layout follows its own width.
- The texts: English and German in the namespace `'microApp'`, exported as `microAppTexts` (i18next resources the app
  adds to its instance: `resources: { en: { microApp: microAppTexts.en }, … }`; texts as props were weighed). Read
  through `useTexts()` (`use-texts.ts`): the namespace's fixed `t` of the app's instance, typed by the package's own
  keys, so an app that types its own resources (i18next's `CustomTypeOptions`) need not list the package's.

## MicroAppHeader

- Props: `icon`, `title`, `modules` (`{ to, label, exact? }[]`, the start page's tab first with `exact: true`),
  `actions` (the app's own at the end of the first line, before Back and Forward, e.g. a user menu; 2026-10-17, for the
  Time Tracker and Human Resources), `crumbs` (`{ to, label }[]`: the app's own breadcrumb in place of the routes'
  crumbs, e.g. a folder's path in the File Center; 2026-10-17).
- Two lines: the icon (Mantine's `ThemeIcon`, light), the title, the modules as tabs (router links; the current one, the
  router's `data-status="active"`, in the accent's light ground), Back and Forward at the end; below, the breadcrumb.
- The breadcrumb: "Home" (a house icon and the text) as a link to `/`, then one crumb per matched route with a crumb
  (`staticData: { crumb: (params) => … }`), the last one plain text (the current page); on the start page "Home" alone,
  no link. Links through `AnchorLink` (exported: `createLink` of a plain Mantine `Anchor` (`Anchor` is polymorphic: TanStack Router's way); an app uses it for its own links, typed by its registered router).
  Crumbs end with an ellipsis when it is too short.
- The current module is a crumb by itself (2026-10-18, the user's choice, proposed at about 65%): right after "Home",
  its label, unless a matched route has a crumb of its own for the module's path (no crumb twice); so a module's
  route needs no crumb (the package's demo has none). The history's tooltips name a module's path the same way.
- Back and Forward: the router's history (`history.back()`, `forward()`), disabled at either end. Where they lead is
  known from the history's index in each entry's state (`__TSR_index`, `history.ts`; a new entry forgets the ones after
  it). Their tooltips name the page: "Back to <page>" with the last crumb of that path's routes (`router.matchRoutes`;
  `/` is "Home"), else "Back".
- Narrow (container queries on the header's own width): below 56rem the tabs become a menu (the current module and a
  chevron, Mantine's `Menu` without a portal), below 40rem Back and Forward hide.
- Sticky at the top (`z-index: 100`), on the body's color, with a line between its two lines, none below it
  (2026-10-17, the user's wish: one below the header too for a few hours; the apps' own headers had none); not
  selectable.
- Tests: `src/micro-app-header.test.tsx` (a memory router and an i18next instance: the tabs and the active one, the
  breadcrumb, the module's crumb, German, Back and Forward).

## The other building blocks (2026-10-17, the user's wish: everything the five apps had as copies)

- `MicroAppProvider({ i18n, savedFilters?, children })`: around the whole app, the app's i18next instance (as
  `I18nextProvider`) and the store of the saved filters.
- `microAppResources`: the i18next resources of the package (`microApp`, and `dataTable`, the data table's German
  texts); the app spreads them into its instance's `resources`.
- `DataTable`: the data table in Mantine's look, compact, `footer="auto"`, `showTotal`, 50 rows a page, in a
  `micro-app__table` (`display: contents`); its texts from the app's i18next (a hook adapter: the namespace
  `dataTable`, `{name}` placeholders filled in, numbers in the locale; else the data table's English default).
- `useTableActions()`: the standard actions (`newAction`, `openAction`, `editAction`, `deleteAction`) with the
  package's texts and icons; a hook (their texts follow the language). `useSavedTableFilters(table)`: the data table's
  `useSavedFilters` over the provider's store.
- `defineForm({ errorMessage? })`: once per app, gives the app's `useForm` (form-validation's, its texts from
  the app's i18next, plus `DialogForm`, the overlays' `<Form>` bound to it; the message of an invalid field as a popover,
  `FieldError`).
- `createLook({ accent?, danger?, success?, warning?, tokens?, Scope })`: Mantine's theme (the modern theme),
  its CSS variables and the overlays' config in Mantine's look; the app's custom properties by the names it gives
  (`tokens: { accent, fontSize, fontFamily, scale }`), the app's Mantine scope for the dialogs' content.
- `MantineScope({ className, scheme? })`, `usePageScheme()`: the app's Mantine scope with the page's color scheme, or
  the one the app gives (`scheme`, 2026-10-17: the Board Manager's `<board-manager>` element, the `color-scheme` of
  the element). Test: `scope.test.tsx`.
- `mirrorInHash(router, element, prefix)`, `pathFromHash(prefix)`: a router on a memory history mirrored in the URL's
  hash after a prefix, the browser's Back and Forward in step with it (the history's `__TSR_index`).
- Dependencies of the repository's packages: `@local/data-table`, `@local/form-validation`, `@local/overlays`,
  `@local/mantine-themes` (the first package that depends on others: its `tsconfig.json` resolves their sources by the
  `source` condition, `customConditions`, and its Vite config too; without `noUncheckedIndexedAccess` and
  `noImplicitOverride`, which the overlays' code is not written for, like the root's). Peer: `zod` (`^4`).
- Tests: `table.test.tsx` (the table's German texts, the actions, the saved filters), `look.test.tsx`.

## Layout and commands

- `exports`: `.` and `./styles.css` (`src/styles.css`, which the app imports), each with a `source` condition first.
- `demo/`: `micro-app-demo.tsx` (the demo as a light DOM custom element, exported, not registered), `demo.tsx` (a small
  micro-app on a memory router: Overview, Projects with a project's page, People; the texts follow `<html lang>`),
  `main.ts` + `index.html` (the standalone page), `demo.css`, `ui/`. On the root page: Internals › Components ›
  "Micro-app".
- `npm run dev`, `npm run build` (library mode, the stylesheet as an entry of its own), `npm run typecheck`,
  `npm test`, `npm run format`.

## Next

- The other building blocks (the root's TODO). All five root apps are built on the package (2026-10-17).
- Check the header in the browser (only the tests ran).
