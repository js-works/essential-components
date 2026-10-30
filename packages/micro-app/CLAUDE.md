# micro-app

`@local/micro-app`: highly opinionated building blocks for the cockpit's apps (micro-apps, as in micro frontends),
built on Mantine, TanStack Router and react-i18next. The rules of the root's `CLAUDE.md` apply; the
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
- The prefix `MicroApp` only where the thing is the micro-app's own: `MicroAppHeader`, `MicroAppProvider`,
  `microAppResources`. The others are named for what they are: `DataTable` (the data table exports no component of
  that name, only its factory), `MantineScope`, `createLook`, `defineForm` (not `defineUseForm`, form-validation's). The types keep the prefix (`MicroAppLook`, `MicroAppLookOptions`: the type names' rule).

## Decided

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

- The cockpit's app header (`createAppHeaderClass` of `@local/cockpit`, a dependency), fed from the router: the
  framework-free element draws it, this component wires it to TanStack Router and React.
- Props: `icon`, `title`, `modules` (`{ to, label, exact? }[]`, the start page's tab first with `exact: true`),
  `actions` (the app's own at the end of the line, before Back and Forward, e.g. a user menu), `crumbs` (`{ to, label
  }[]`: the app's own breadcrumb in place of the routes' crumbs, e.g. a folder's path in the File Center), `switcher`
  and `activeSwitcherItem` (the title as a switcher; its entries lead outside the router: the browser follows them).
- It sets the element's properties from the router: the modules' hrefs (`router.buildLocation`), the active module,
  the crumbs, Back and Forward; and answers its events: `navigate` (`router.navigate({ href })`), `back`, `forward`
  (the router's history).
- Labels are text (a module's label, the title); what is not (the icon, the crumbs' components, the pages of Back and
  Forward, `actions`) goes into the element's slots, as `micro-app__header-slot` (`display: contents`).
- The breadcrumb: one crumb per matched route with a crumb (`staticData: { crumb: (params) => … }`), after "Home"
  (the element's). The current module is a crumb by itself, right after "Home", unless a matched route has a crumb of
  its own for the module's path (no crumb twice); so a module's route needs no crumb (the package's demo has none).
- Back and Forward: where they lead is known from the history's index in each entry's state (`__TSR_index`,
  `history.ts`; a new entry forgets the ones after it). Their pages (the tooltips' "Back to …") are the last crumb of
  that path's routes (`router.matchRoutes`, `crumbs.ts`), else the module's label; `/` is "Home".
- Its element: an internal one (`internal-micro-app-header-<n>`, registered on first use) with
  `MANTINE_APP_HEADER_THEME`, one class per i18next instance (its `I18nAdapter` over the app's instance: the namespace
  `cockpit`, the element's keys; the German ones in `microAppResources`, i18next's `{{page}}`). The package's own
  `home` names the start page in the tooltips.
- Tests: `src/micro-app-header.test.tsx` (a memory router and an i18next instance; the element's properties and
  events: the title, the modules and the active one, the crumbs, the module's crumb, the texts in the app's language, `navigate`, Back and Forward).

## The other building blocks

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
  its CSS variables (more contrast: the links, `--mantine-color-anchor`, shade 9 of the accent in the light scheme, so
  every link and the app header follow) and the overlays' config in Mantine's look; the app's custom properties by the names it gives
  (`tokens: { accent, fontSize, fontFamily, scale }`), the app's Mantine scope for the dialogs' content.
- `MantineScope({ className, scheme? })`, `usePageScheme()`: the app's Mantine scope with the page's color scheme, or
  the one the app gives (`scheme`, e.g. the Board Manager's `<board-manager>` element, the `color-scheme` of
  the element). Test: `scope.test.tsx`.
- `mirrorInHash(router, element, prefix)`, `pathFromHash(prefix)`: a router on a memory history mirrored in the URL's
  hash after a prefix, the browser's Back and Forward in step with it (the history's `__TSR_index`).
- Dependencies of the repository's packages: `@local/cockpit` (the app header), `@local/data-table`, `@local/form-validation`, `@local/overlays`,
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

- The other building blocks (the root's TODO). All five root apps are built on the package.
- Check the header in the browser (only the tests ran).
