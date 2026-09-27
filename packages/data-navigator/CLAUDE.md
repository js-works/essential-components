# data-navigator

A React data navigator component (data table with sorting, filtering, pagination, ...).
The component is called `DataNavigator`.
The main goal is a very nice, yet simple, API, designed together with the user.

## Working rules

- Design first: discuss the API step by step.
  - Do NOT implement anything until the user gives an explicit GO.
- Keep answers short: not longer than necessary to understand them. No long recaps or lists of what was done.
  One topic per step.
- When offering alternatives, number them, add small code examples, and always state which one is proposed and
  how confident that proposal is (e.g. a percentage).
- Prefer bullet lists over prose, in answers and in this file, wherever reasonable.
- Never run `git commit` or `git push`.
  - The user does this personally.
  - This overrides any default attribution or commit guidance.
- Never read, list or scan anything outside this project folder.
  - This includes sibling projects, parent folders, the repo root and the home directory (e.g. `~/.claude`).
  - Only the user may explicitly grant an exception for a specific path.
- Two files hold the draft API types we are discussing. Types only, no comments for now (comments come later).
  - `src/api.ts`: the namespace `DataNavigator`: the custom element and the shared types (`Query`, `Source`, `Theme`,
    `I18nAdapter`, `Texts`, ...).
  - `src/react/api.ts`: the namespace `DataNavigatorComponent`: the React component (`Props`, `Column`, `Action`,
    `Controller`, ...), which re-exports the shared types, so React code never needs `DataNavigator`.
  - Both namespaces use the same short names (`Column`, `Action`, ...) with their own meaning.
  - Exception: `DataNavigator.Texts` has the en-US text as a comment after each line.
  - Each API decision changes only these files.
  - Type-only namespaces are fine. Do not use runtime (value) namespaces.
- Do not update `README.md` until the first release. It only has a few general lines and the alpha notice.
- Do not mention any specific i18n library by name in code, docs or specs, except react-i18next as the example.
- Always add behavior details we decide (also small ones) to this spec, in the same step as the code.
- Add coding guidelines to this file whenever they result from our discussion, and tell the user.

## Theming (decided)

- One generic React implementation, customized by CSS custom properties. One CSS file per UI library (Mantine, Ant
  Design, ...) makes it look "good enough" there.
- Widgets: native HTML elements with our own CSS, no UI library. Selects, menus and tooltips come from a headless
  library, Base UI.
  - Checkbox, radio, button, text input: native elements (`<input type="checkbox">`, `<button>`, ...).
    Checkboxes and radios are real inputs drawn by us (`appearance: none`): a light box (or circle) with a gray border.
    Checked, only the border and the tick (a CSS mask) or the dot take the check color, without a fill (the user found
    the filled native look too loud). The check color is the input's `color`: `--datnav-color-primary`. Indeterminate (the
    select-all box while some rows are selected) shows a short dash. Disabled ones are half transparent.
  - Selects (single and multiple): Base UI's `Select` (`@base-ui/react`, MIT), unstyled, styled by us with the theme values.
    - This reverses the first decision ("no headless library"): native selects could not be made to look and behave
      the same in every browser (`::picker(select)` has no Firefox support and no dropdown for `<select multiple>`).
    - Base UI was chosen over React Aria Components (Apache-2.0, more dependencies, its own API), Headless UI, Ariakit
      and Downshift: it has all the parts we may need (Select, Combobox, Autocomplete, Menu, Tooltip, Popover), is
      MIT and version 1.x.
  - Menu buttons: Base UI's `Menu`, since the select (step 2).
  - Tooltips: Base UI's `Tooltip` (step 3). Our own popover code (`popover.ts`, `useTooltip`, `useToggle`) is gone.
  - Result of the three steps (September 2026): our own component code went from 2904 to 2762 source lines, and the
    code that is left mostly describes the parts instead of implementing positioning, focus and keyboard handling.
  - The popups of Base UI (the list of a select, a menu) share one look (`.popupPositioner`, `.popup`) and are
    rendered into the layer of the root (`LayerContext`), so they get the values of the theme.
  - Icons: inline SVGs shipped with the component (the paths of the Tabler icons, `view/icons.tsx`).
  - Runtime dependencies: `@base-ui/react` and `@local/calendar` (the date picker of the date range filter, a sibling
    package of the `essential-components` monorepo; a copy of this package needs a copy of it too), besides the
    peers.
- Customization: a small set of general design values, the `DataNavigator.Theme` (see Configuration), not one per part.
  - The values (29), with their internal custom properties (`colorTextDimmed` → `--datnav-color-text-dimmed`):
    - Colors: `colorText`, `colorTextDimmed`, `colorSurface`, `colorBorder`, `colorHeader`, `colorHeaderHover`,
      `colorHover`, `colorHoverBorder`, `colorHoverAccent`, `colorStripe`, `colorStripeHover`, `colorSelected`,
      `colorSelectedBorder`, `colorSelectedNeutral`, `colorPrimary`, `colorPrimaryHover`, `colorOnPrimary`,
      `colorDanger`, `colorFocus`.
    - Shape and type: `radius`, `shadow`, `fontFamily`, `fontSize`, `fontSizeSm`, `fontWeightBold`.
    - Spacing and size: `spacingXs`, `spacingSm`, `spacingMd`, `controlHeight`.
  - Every color is its own value, mapped by the theme. No colors derived with `color-mix()` (except pressed states).
  - `selectionAppearance` stays. `'neutral'` uses `colorSelectedNeutral` and a gray selection border (`colorBorder`).
  - More specific values (per part) may be added later if a library needs them (not breaking: all are optional).
  - `colorHoverBorder` (the lines of a hovered row): Mantine has no lighter border color that adapts to dark mode, so
    its theme maps it onto its normal border. antd maps it onto `--ant-color-split`.
  - `colorHoverAccent` (the row hover with `selectionAppearance="accent"`, stronger than the selection): Mantine
    `--mantine-primary-color-light-hover`, antd `--ant-color-primary-bg-hover`.
  - antd: `colorBorder` is `--ant-color-border` (the border of antd's inputs, `#d9d9d9`), not
    `--ant-color-border-secondary` (`#f0f0f0`, almost invisible on inputs and buttons).
  - Sizes that have no value of their own are derived with `calc()` (e.g. the title is `1.25 * fontSize`, a row button
    is `0.75 * controlHeight`).
  - The tooltip turns the colors around: `colorText` as background, `colorSurface` as text.
- Themes are objects in the configuration, not CSS files (see Configuration): `defaultTheme`, `mantineTheme`,
  `antdTheme`.
  - The Mantine and antd themes map the values onto the CSS variables of their library (`var(--mantine-…)`,
    `var(--ant-…)`), which already adapt to dark mode.
  - antd 6 does not set its variables on `:root`, but on a class of its own (`cssVar.key` of its theme config,
    `css-var-root` by default), which only its own components carry. The table must sit inside an element with that
    class.
- The default theme (`src/themes/default.ts`) is the neutral look, for apps without a UI library that has a theme here.
  - All its grays are pure grays (equal red, green and blue). It has a high contrast, for readability: text `#111`,
    dimmed text `#555`, borders `#a8a8a8`, a row hover of `#dfdfdf` over a lighter neutral selection (`#eee`), a soft
    zebra (`#f8f8f8`), and a light control hover (`#f9f9f9`). Primary and danger are deep enough for 6:1 against
    white. Radius 5px.
  - Its colors have a light and a dark value (`{ light, dark }`), which follow the color scheme of the page. Dark mode:
    text `#f5f5f5`, borders `#5c5c5c`, and a lighter primary with dark text on it.
  - It is the only place with hard-coded colors (besides the demo).
- Class names come from CSS modules (hashed). They are not public, and neither are the `--datnav-*` custom properties.
  - What the theme values do not cover cannot be restyled by apps (accepted, to keep the public surface small).

## Custom element

- The library exports a custom element, next to the React component (`src/element/`).
- The two APIs differ on purpose: React components and custom elements are different beasts, and each API follows its
  own platform (React: props, hooks, `ReactNode`; the element: setup, controller, attributes, content adapter). Do not
  align them for the sake of similarity.
- Rule: before a new feature is decided for one of them, check how it looks on the other, in that one's own style.
  - Props become properties of the element (functions, arrays and objects cannot be attributes). Callbacks of the React
    API need an equivalent as DOM events or properties.
  - Hooks exist only in React. Whatever a hook offers (e.g. a reload) needs a plain, framework-free core that the hook
    only wraps, so the custom element can use the core directly.
- Implementation: the element wraps the React component, with React bundled into the element's entry.
- Entries (like `file-upload`):
  - `@local/data-navigator`: the element (`setupDataNavigator`), its column filters and the types (namespace
    `DataNavigator`). React is bundled in, the app needs none.
  - `@local/data-navigator/react`: `createDataNavigatorComponent` (renamed from `createDataNavigator`), the hooks, the
    React column filters and their types (namespace `DataNavigatorComponent`), with the app's React (an optional peer
    dependency).
  - `@local/data-navigator/themes`: `defaultTheme`, `mantineTheme`, `antdTheme` (plain data, used by both; no React,
    no element). The other entries export no themes.
  - Shared types (`Theme`, `I18nAdapter`, `Query`, ...) stay in `DataNavigator` of the main entry: a type-only import
    loads no bundle, so React apps may import them from there.
  - Needs the built files (`exports` to `dist/`), else the app's bundler resolves `react` itself.
- `setupDataNavigator(config)` is called once per app with the config (theme, i18n, content adapter) and returns a
  tuple: an element class without a type parameter, and the controller factory, both bound to that config. The app
  names them itself and registers the class under its own tag name (and adds it to `HTMLElementTagNameMap`). We never
  register elements ourselves.
  ```ts
  const [DataNavigatorBase, createNavigatorController] = setupDataNavigator({ theme, i18n, content: litContent });
  class DataNavigatorElement extends DataNavigatorBase {}
  customElements.define('data-navigator', DataNavigatorElement);
  ```
- Everything that depends on the row type is one object, built by the controller factory and set as one property:
  ```ts
  const users = createNavigatorController({ source: fetchUsers, rowKey: 'id', columns, actions, renderDetail });
  html`<data-navigator .controller=${users} density="compact" striped></data-navigator>`;
  ```
  - The controller factory checks all parts against one `Row` (inferred from `source` or given explicitly) and against
    the content type `C` of its setup. The controller keeps `Row` only in return values, so a
    `NavigatorController<User>` can be set on the element's property (typed `NavigatorController<unknown>`).
  - A controller belongs to one element (like the React controller): setting it on a second element is an error. It also
    controls that element: `reload()`, `clearRowSelection()`, `getSelectedRows()` (typed: `readonly User[]`).
  - A new controller replaces all parts at once (one render).
  - `defaultSort` is part of the controller (its `key` is a column key).
  - Events: the element fires no events of its own; to hear anything, you need the controller. Subscriptions are
    methods named `onXyz(listener)` that return an unsubscribe function (rarely needed: listener, controller and
    element usually live and die together). No event callbacks in the controller's options.
    - `onSelectionChange((rows) => …)`: `rows` is typed (`readonly User[]`).
- Settings that do not depend on `Row` are attributes, reflected to properties (booleans default to `false`):
  - `density` (`compact`, `normal`, `comfortable`; default `normal`), `striped`, `searchable`,
    `selection-appearance` (`selectionAppearance`: `neutral`, `accent`), `page-size` (`pageSize`).
  - `pageSizeOptions`: a property only (an array).
- Content (`render`, `renderDetail`, the `header` function) is `string | C`. `C` comes from a content adapter in the
  config of `setupDataNavigator` (`content`); the default adapter is for `Node`.
  ```ts
  type ContentAdapter<C> = {
    render: (content: C, container: HTMLElement) => void; // called again with new content
    clear?: (container: HTMLElement) => void; // when a cell or detail goes away
  };
  const litContent: DataNavigator.ContentAdapter<TemplateResult> = {
    render: (content, container) => render(content, container),
  };
  ```
  - Strings are always allowed, with every adapter: the library renders them itself, as text.
  - The library does not depend on Lit or any other framework: the app writes its adapter (a few lines).
  - A column `header` and an action `label` are `string | (() => string | C)`, an action `icon` is `() => C` (no
    string), an action `tip` is `string | (() => string)`.
    - Functions, because a DOM node can be in one place only (a row action's icon is in every row), and to follow the
      locale: the element calls every text and content function again when the i18n adapter reports a change
      (`onChange`). Plain strings stay fixed.
- Column filters: the element's entry exports the same factories as the React entry (`textColumnFilter()`,
  `selectColumnFilter({ options, multiple })`, `dateRangeColumnFilter()`); internally they use the React filters.
  - A custom filter is a function `(props: { value, onChange, labelledBy }) => C`, rendered by the content adapter.
- Light DOM, no shadow root: the app's CSS reaches everything, also its own content in cells, details and filters.
  - No slots: the element owns its children (the app must not put anything inside it). `title`, `subtitle` and `empty`
    are options of the controller, each `string | (() => string | C)`.
  - Custom content is rendered by the content adapter into an empty container that React creates.
  - Our stylesheet is added once per document, or per shadow root when the element sits inside one.
  - Page rules for bare elements (e.g. a global `button {}`) can reach our table; our class names are scoped.
- Draft types: in `src/api.ts` (`SetupDataNavigator`, `SetupConfig`, `ContentAdapter`, `ControllerOptions`,
  `NavigatorController`, `Column`, `Action`, `Element`, `ElementClass`, ...).
  - `Element<C>` and `NavigatorController<Row, C>` carry the content type of their setup, so a controller of one setup
    cannot be set on the element of another (e.g. Lit and `Node`).
- Styling from outside: the theme. Stable hooks for app CSS come when needed (see "Todo (later)").
- Behavior details:
  - Without a controller the element is empty.
  - Setting a controller checks it: not a controller, or one of another setup, throws a `TypeError`; one that is set
    on another element throws an `Error`. Setting another controller (or `undefined`) releases the previous one.
  - A new controller remounts the view (keyed by the controller), so all of its parts change at once.
  - `page-size` is the page size the table starts with; `pageSizeOptions` (property only) default to 10, 25, 50, 100.
  - `onSelectionChange` listeners hear only real changes of the selection (not the connecting of the table).
  - A move (removed and added again in the same task) keeps the table; it unmounts when it stays removed.
  - Properties set before the class is registered are taken over on connect.
  - The element gets the attribute `data-datnav-host`, which our stylesheet makes `display: block` (we do not know the
    tag name). The stylesheet is a `<style>` element, added once to the document's `<head>`, or once to the shadow
    root the element is in (the CSS module, imported with `?inline`).
  - The built-in filters of the element are opaque markers for the React filters (`src/element/filters.ts`).

## Controller

- Apps talk to a table from outside through a controller: reload it after a change, clear its selection, read the
  selected rows.
  ```tsx
  const nav = useDataNavigatorController<User>(); // stable, one per table
  <DataNavigator controller={nav} … />;
  nav.reload();
  nav.clearRowSelection();
  nav.getSelectedRows(); // readonly User[], read at the moment of the call
  const selected = useDataNavigatorSelection(nav); // the same, re-renders when the selection changes
  ```
  - The same pattern as MUI X's `apiRef` (a hook creates the object, a prop connects it). Other options were weighed
    and dropped: a source hook with `reload` (covers only the reload), a ref handle (the same sharing problem, and
    `null` before the mount), a hook that returns a bound component (fragile), helpers in the action callbacks (no
    triggers from outside the table), controlled props (more wiring, and still no reload).
  - `DataNavigator.Controller<Row>` has exactly the three methods. The `controller` prop is optional: without it the
    table works as before.
- The framework-free core is `createDataNavigatorController()` (`src/core/controller.ts`, no React). The hooks only
  wrap it (`src/core/controllerHooks.ts`): `useDataNavigatorController` keeps one stable, `useDataNavigatorSelection`
  subscribes with `useSyncExternalStore`. The custom element's controller (see "Custom element") will build on the
  same core (`reload()`, `clearRowSelection()`, `getSelectedRows()`, `onSelectionChange()`).
- One controller serves one table: a mounted table connects in an effect and disconnects when it unmounts. A second
  table that connects while the first is still connected throws ("already used by another DataNavigator"), in every
  build. After an unmount, the controller can be used again (e.g. switching between tables). StrictMode's test mount
  passes (the first connection is released before the second).
  - Sharing cannot be prevented by types; no other library does that either.
- Without a connected table, calls do nothing and `getSelectedRows()` is `[]`.
- `reload()`: the current page again, with page size, sort, search and filters kept. The selection and the expanded
  details are cleared, like on every new load. If the page no longer exists (fewer rows now), it goes to the last one.
  - The source is not memoized by the app: a new function identity never reloads. A source that depends on something
    of the component (e.g. a `customerId`) is reloaded by the app with `reload()`, or remounted with `key`.
- `clearRowSelection()`: clears the selection (and the anchor of the block selection).
- `getSelectedRows()`: the selected row objects of the current page (what a `rows` action gets). The array stays the
  same until the rows or the selection change (`useMemo`), which the selection hook relies on.

## Configuration

- The component is not exported directly. The app creates it once, with a factory, and uses the result everywhere:
  ```tsx
  const DataNavigator = createDataNavigatorComponent({ i18n, theme }); // once, at module level
  <DataNavigator source={source} rowKey="id" columns={columns} />; // no localization or theme in sight
  ```
  - The same model as the `file-upload` project (`createFileUploadClass({ i18n })`), so both are configured alike.
  - `createDataNavigatorComponent(config?: DataNavigatorComponent.Config)`. Both parts are optional.
  - Create it once, at module level, never inside a component (a new component per render would remount the table).
  - It is the only way to get the component: no ready-made, unconfigured `DataNavigator` next to it.
  - Several looks or languages in one app: several factory calls.
  - Internally the created component passes its config down with a private context (e.g. to the built-in filters).
- Localization: `config.i18n`, an `I18nAdapter` of exactly the shape of `file-upload`'s (`currentLocale`,
  `resolveText(namespace, key, params, defaultValue)`, optional `onChange`).
  - Only `string`, `unknown`, `Record`, `null` and functions, nothing component-specific, so one adapter object fits
    both components (structural typing). Never change it incompatibly, only add optional members.
  - Our namespace is `'datanav'`, the keys are the keys of `DataNavigator.Texts`. `defaultValue` is the English text,
    already filled in.
  - `currentLocale()` is read on every render, for `Intl` (numbers). `onChange` is subscribed while mounted (an
    effect in `useTexts`), and a notification re-renders, so every text and number is refreshed.
  - The params hold raw numbers (`count`, `from`, `to`, `total`, `pages`); the adapter formats them itself.
    Texts without params get `null`.
  - Without an adapter: the English texts, and the locale of `<html lang>` (else `en-US`).
  - No i18n library is a dependency. An adapter for react-i18next (or any other library) is a few lines.
  - This replaced a hidden `useTranslation('datanav')` of react-i18next, which tied every app to one i18n library.
- Theme: `config.theme`, a typed `DataNavigator.Theme`: the design values in camelCase (`colorText`, `colorSelected`,
  `radius`, `fontSize`, ...), all optional; missing ones come from the default theme.
  - Colors take a string or `{ light, dark }`, which becomes `light-dark(light, dark)`: it follows the `color-scheme`
    the root inherits from the page (the root sets none: `light dark` would follow the system's scheme instead). Values
    may be `var(...)` of the app's design system. `light-dark()` works only for colors, so the shadow is a plain string;
    the default theme puts `light-dark()` into the color of its shadow.
  - The created component sets the values as custom properties on its root (inline: runtime values). The stylesheet
    stays a static CSS module and reads them.
  - The custom properties are internal: prefix `--datnav-` (it was `--dn-` while they were public), not documented
    and not promised. Apps configure only through `theme`. Overriding a single value in plain CSS is not an official
    way.
  - The themes are exported objects: `defaultTheme`, `mantineTheme`, `antdTheme` (`src/themes/*.ts`). There are no
    CSS theme files anymore.
  - Without `theme`: the default theme, so the table always has its colors.
  - This reversed "Themes are CSS only: no theme prop, nothing in the API", decided at first.
- The stylesheet itself (`data-navigator.css`) is still imported by the app.
- The public API of the React entry (`@local/data-navigator/react`): `createDataNavigatorComponent`,
  `useDataNavigatorController`, `useDataNavigatorSelection`, `textColumnFilter`, `selectColumnFilter`,
  `dateRangeColumnFilter`, and the types (`DataNavigatorComponent.Config`, `.Theme`, `.I18nAdapter`, `.Component`,
  `.Controller`, `.Props`, ...). The themes (`defaultTheme`, `mantineTheme`, `antdTheme`) come from
  `@local/data-navigator/themes`.

## Safepoints

- Snapshots of the project live in `.safepoints/` (ignored by git), as `<date>-<name>.tar.gz`, without `node_modules`
  and `dist`.
- Restore only when the user asks: look at the target first, then unpack over the project folder.
- `2026-09-24-before-design-changes.tar.gz`: the generic component with native widgets and the three themes, before
  trying out general design changes.

## Stack (decided)

- TypeScript (strict), Vite (library mode), React 19, npm
- Tests: Vitest with jsdom and Testing Library
- One generic implementation with native elements. Themes for Mantine 9 and Ant Design 6. `@mantine/core` and `antd`
  are dev dependencies only, for `scripts/library-variables.mjs` (the variable snapshots of the demo); no library code
  runs in the demo.
- i18n: no library. The app gives an `I18nAdapter` in the configuration (namespace `datanav`, see Configuration).
- npm never runs install scripts of dependencies: `.npmrc` has `ignore-scripts=true`. (Our own `npm run` scripts are
  not affected.)
- npm only installs versions that are at least 7 days old: `.npmrc` has `min-release-age=7`. It applies when npm
  resolves versions (a new install or an update), not to what is already in `package-lock.json`.
- `.editorconfig`: 2 spaces, LF, UTF-8, max line length 120
- Formatter: dprint (`dprint.json`), line width 120. Not Prettier.
  - Manual line breaks in method chains are preserved, so break chains by hand where it reads better.
  - Single quotes in TS, double quotes in JSX attributes.
- Peer dependencies (also dev dependencies for the demo and tests): `react`, `react-dom`. No UI library and no i18n
  library is a peer.
- Runtime dependency: `@base-ui/react` (MIT), for the selects, menus and tooltips. It is external in the library
  build, like React.
  - Size (September 2026): our own bundle is about 44 kB (11.6 kB gzip). With Base UI bundled in, it is 217 kB (62 kB
    gzip) with the Select, 274 kB (76 kB gzip) with the Menu too, and 291 kB (81 kB gzip) with the Tooltip too. So Base
    UI costs an app about 69 kB gzip (less if the app uses Base UI itself). The user accepts that: the size matters less than the behavior.

## Project layout and commands

- `src/api.ts` and `src/react/api.ts`: the spec (types only), see "Working rules".
  - The React code (`src/core/`, `src/react/`) imports `DataNavigatorComponent as Spec`.
- Three entries (`exports` in `package.json`, to `dist/`):
  - `src/index.ts` (`@local/data-navigator`): the custom element (`setupDataNavigator`, the element's column filters)
    and the type namespace `DataNavigator`.
  - `src/react/index.ts` (`@local/data-navigator/react`): the React API and the type namespace
    `DataNavigatorComponent`.
  - `src/themes/index.ts` (`@local/data-navigator/themes`): the three themes.
- `src/element/`: the custom element, a wrapper of the React view:
  - `setupDataNavigator.tsx`: the setup and the element class (attributes, properties, the React root in the light
    DOM, the i18n subscription).
  - `controller.tsx`: the controller factory, the one-element guard, and the controller's options as the props of the
    React view.
  - `content.tsx`: strings as text, everything else through the content adapter (the default one for `Node`).
  - `filters.ts`: the element's built-in filters. `styles.ts`: the stylesheet in the document or shadow root.
  - `DataNavigatorElement.test.ts`: its tests (jsdom).
- `src/react/createDataNavigatorComponent.tsx`: the factory. It resolves the configuration once and returns the
  component, which provides it (private `ConfigContext`) and renders `DataNavigatorView`.
- `src/core/`: the state and the logic.
  - `useDataNavigator.ts`: the headless hook with all state and behavior (source calls, paging, sorting, selection,
    block selection, row details, actions, loading). The view only renders what it returns.
  - `controller.ts`: the framework-free core of the controller (`createDataNavigatorController`, connecting, the
    one-table guard, the selection listeners), with its unit test `controller.test.ts`. `controllerHooks.ts`: the two
    React hooks around it.
  - `config.ts`: the private `ConfigContext` and `resolveConfig` (the i18n adapter, and the theme turned into the
    inline custom properties of the root).
  - `actions.ts` (which actions are visible where), `layout.ts` (column groups), `texts.ts` (`useTexts`: texts via the
    adapter, en-US defaults), `filters.ts`, `hooks.ts`, `utils.ts`.
  - `view/`: the whole rendering. `DataNavigatorView.tsx` (grid, header rows, filter row, data rows, detail rows,
    empty state), `Toolbar.tsx`, `Footer.tsx`, `Actions.tsx`, `ColumnFilters.tsx` (the built-in filters).
    - `widgets.tsx`: the leaves (checkbox, radio, buttons, menu, fields, selects, tooltip, spinner, pill). They never
      know about rows, queries, selection or loading.
    - `icons.tsx` (inline SVGs).
    - `layer.ts`: the context with the layer element inside the root, where the popups of Base UI are rendered.
    - `DataNavigator.module.css`: the one stylesheet (all rules, no values of its own), with its typed declaration file
      `DataNavigator.module.d.css.ts`.
- `src/themes/`: the theme objects: `default.ts` (the neutral look, with hard-coded values, light and dark) and one per
  UI library (`mantine.ts`, `antd.ts`).
- `src/DataNavigator.test.tsx`: the test suite of the component (it was the conformance suite of the old
  implementations), plus the theming tests (every theme has every value, the root gets them as custom properties, the
  stylesheet reads only known ones) and the i18n tests (with small adapters).
- `demo/` + `index.html`: the demo app (`npm run dev`): 245 users, 1 second loading time, en/de, all selection modes
  (through the Actions selector). It starts striped.
  - Columns: first name, last name, date of birth (ISO, yyyy-mm-dd, with the date range filter; the dates come from
    the index, not from the random generator, so the other demo data stays the same), email, country, role. No city
    column (the users still have a city: the search and the details use it).
  - `index.html` + `main.ts`: the page, a shell around the demo element: a header with the title and, top right, the
    global switches (language, color scheme), which change `<html>` (`lang`, `data-scheme`). It registers the demo
    element as `data-navigator-demo`.
  - `DataNavigatorDemo.tsx`: the whole demo as a light DOM custom element (see "Demo element" below), with two tabs:
    "React component" and "Custom element". On connect it renders `App` into the first panel (React, `StrictMode`),
    mounts the element demo into the second one and calls `setupUi(this)`; on disconnect it cleans up.
  - `ElementDemo.ts` (+ `element-demo.css`): the custom element tab, plain TypeScript with DOM nodes as content: the
    same users, `setupDataNavigator` with the demo's i18n adapter, text and select filters, a role badge (a node per
    row, styled by the demo's global CSS), a rows action, switches for density, striped and searchable, and reload,
    clear selection and the selected rows (`onSelectionChange`). Titles, headers and labels are functions, so they
    follow the language.
  - One plain demo (`Demo.tsx`) for all themes, with no UI library: plain elements, a small toast for the actions
    (`Toasts.tsx`) and inline SVG icons (`icons.tsx`, Tabler paths).
  - The Theme selector at the top switches between Default, Mantine and Ant Design. It starts with Default.
    - The demo creates one data navigator per theme at module level (`createDataNavigatorComponent({ i18n, theme })`,
      all with the same adapter) and shows the one of the chosen theme.
    - The Mantine and antd themes read the variables of their library, which a real app gets from the library at
      runtime. The demo runs no library code, so it adds static snapshots of exactly the variables the two themes read
      (`demo/variables/mantine.css`, `demo/variables/antd.css`), light and dark (`prefers-color-scheme`), rendered as a
      `<style>` element for the chosen theme.
      - They are generated by `scripts/library-variables.mjs` (`npm run library-variables`) from the installed
        libraries: Mantine's `default-css-variables.css`, antd's `theme.getDesignToken()` (with and without the dark
        algorithm). It follows `var()` references, so every value is complete. Do not edit them by hand.
      - So `@mantine/*` and `antd` are only needed to regenerate the snapshots. No demo code imports them.
      - Their dark values apply with the system's dark scheme (unless the page chose light, `data-scheme='light'` on
        `<html>`) and when the page chose dark (`data-scheme='dark'`), so they follow the color scheme switch.
  - The settings of the component are plain native `<select>` elements with a label (`DemoControls.tsx`).
    - They are not part of the component and do not follow the theme: they, the buttons below the table and the page
      are styled by the design language in `demo/ui/` (`ui-toolbar`, `ui-field`, `ui-select`, `ui-button`,
      `ui-note`). `Demo.module.css` has only what is specific to this demo. The demo imports nothing from `src/core`.
  - Below the table: a Reload and a Clear selection button and a line with the selected users, through a controller
    (`useDataNavigatorController`, `useDataNavigatorSelection`).
  - The Action variants selector (default off): off shows every action secondary, on makes "Add user" primary and
    both deletes (toolbar and row) danger. So both looks can be compared.
  - `App.tsx` keeps the settings.
  - Custom cell content of the demo has fixed colors of its own (the custom properties of the table are internal): the
    role badge is a gray pill with a darker gray border, the detail text is small.
  - The language switch of the page sets `<html lang>`. The demo's `I18nAdapter` (`demo/i18n.ts`, no i18n library, the same idea
    as in the `file-upload` demo) reads the locale from it, looks up its German texts, and watches the attribute with
    a `MutationObserver`.
- `demo/ui/`: `ui.css` and `ui.ts`, a small general-purpose design language (BEM classes and tokens with the prefix
  `ui-`, tabs), copied between projects (identical copies in every project that uses it). Its purpose, usage and the
  rules for changing it are documented in the header of `ui.css`: read them before changing it.
- Demo element (decided): the demo is a light DOM custom element without attributes, so a "meta demo" can combine the
  demos of several components (e.g. with vertical tabs on the left). Rules (the same for the demos of all components):
  - A class extending `HTMLElement`, exported and never registered: the page registers it under a tag name of its
    choice (here `index.html`/`main.ts` as `data-navigator-demo`).
  - Light DOM, no shadow root: the design language and the page reach into it.
  - Global switches (language, color scheme: they change `<html>`) belong to the page, not to the demo. A demo only has
    the switches of its own component.
  - No fixed ids (the demo may be on a page twice): tabs get theirs from `ui.ts`, other ids are generated per instance.
  - Connect: `setupUi(this)` and mounting (React); disconnect: their cleanups.
  - Its CSS is global where it is not a CSS module (light DOM), so such rules are specific to the demo's own content,
    never a change of the design language. Colors that depend on the scheme use `light-dark()`, not
    `prefers-color-scheme` (so they follow the page's switch).
  - Nested tabs: the URL hash has one segment per level (`#data-navigator/…`), see `ui.ts`.
  - The meta demo is the sibling project `../combined-demo`: it imports the demo element by a relative path
    (`../../<project>/demo/<Name>Demo`), so the file name and the export must stay stable.
- `.github/workflows/deploy-demo.yml`: on every push to `main` (and by hand), runs the tests, builds the demo and
  publishes it on GitHub Pages: https://js-works.github.io/data-navigator/
  - The repository needs "Settings → Pages → Build and deployment → Source: GitHub Actions".
  - It assumes this folder is the root of the repository `js-works/data-navigator` (workflows must live in the
    repository root's `.github/`).
- `vitest.setup.ts`: jsdom polyfills (`matchMedia`, `ResizeObserver`, `scrollIntoView`) and cleanup.
- `scripts/library-variables.mjs`: writes the snapshots of the library variables for the demo (see the demo).
- `scripts/loc.mjs`: the lines-of-code report (`npm run loc`), built on the `sloc` dev dependency.
  - Every file lands in exactly one area: public API, component, themes, demo, tests, build and setup.
  - It also breaks the count down by language and says what the component costs against what one theme costs.
- Commands:
  - `npm run dev`: demo
  - `npm run build`: typecheck + library build in two steps: `dist/react.js`, `dist/themes.js` and the stylesheet
    `dist/data-navigator.css` (React and Base UI outside), then `--mode element`: `dist/index.js` with everything
    bundled in (React too, about 165 kB gzip; the stylesheet is inside)
  - `npm run build:demo`: typecheck + the demo page for GitHub Pages (`vite build --mode demo`, base `/data-navigator/`,
    into `demo-dist/`)
  - `npm run typecheck`
  - `npm run loc`: lines of code by area and by language
  - `npm run library-variables`: regenerate the library variable snapshots of the demo (after a library update, or
    when a theme reads other variables)
  - `npm test`: Vitest (once). `npm run test:watch`: watch mode
  - `npm run format`: dprint. `npm run format:check`
- Run `npm run format` and `npm run typecheck` after changes.

## Code rules

- Class members are either public or `#private` (ECMAScript private fields).
  - Never use the TypeScript `private` or `protected` keywords.
- No `any`.
  - Use `unknown` and narrow it.
  - No `@ts-ignore`. `@ts-expect-error` only with a reason comment.
- Use `readonly` wherever useful and reasonable.
  - Arrays in public types: `readonly T[]`, never mutable `T[]` (input we don't own must not be mutated).
  - Class fields that are never reassigned: `readonly`.
  - Constant lookup data: `as const`.
  - Not needed for props object properties or local variables (`const` is enough there).
- Function components and hooks only. No class components.
- Named exports only, never `export default`.
  - Per file, exports are declared in exactly two places, directly after the import statements at the top:
    - at most one `export { ... }` for values (functions, components, constants)
    - at most one `export type { ... }` for types
  - Never put `export` on the declarations themselves.
  - The public API is exactly what the three entries (`src/index.ts`, `src/react/index.ts`, `src/themes/index.ts`)
    export. Everything else is internal.
- Every public API change comes with a Vitest test and a usage example (demo). No feature without both.
- Ask before adding a dependency.
  - Keep runtime dependencies minimal.
  - `react` is a peer dependency.

## CSS guidelines

- No inline styles (`style={{ ... }}`) if at all possible.
  - Styles live in CSS modules (`*.module.css`) next to the component.
  - Exception: values that are only known at runtime (the grid template from the column width ratios, the grid
    placement of a cell, a measured height).
    - Set the real CSS property inline (`style={{ gridColumn: '3 / span 2' }}`), never a custom property of our own
      that the stylesheet reads back. That indirection buys nothing and invents names nobody asked for.
- Use `data-*` attributes for state (`data-selected`, `data-expanded`, `data-sorted`), not conditional inline styles.
  - Hover, focus, selected rows and transitions are done in CSS.
- CSS modules are type-safe, and Claude maintains the types.
  - Every `X.module.css` has a declaration file next to it (`X.module.d.css.ts`, needs `allowArbitraryExtensions`).
  - It declares exactly the class names of the CSS file, as named exports (no default export, see export rules).
  - Class names in CSS modules are camelCase, so they are valid identifiers.
  - Change the CSS and its declaration file together, in the same step.
- Use native CSS nesting where reasonable (no Sass or other preprocessors).
  - Nest states, pseudo-classes, pseudo-elements and media queries: `&:hover`, `&::before`, `@media`.
  - Keep it shallow: at most two or three levels.
  - Native nesting cannot build names by appending to `&` (no `&__element` like in Sass). Write full BEM names.
- Colors, spacing, radii, fonts and shadows come from the internal `--datnav-*` custom properties (the theme values,
  see Theming and Configuration), never hard-coded values.
  - The only hard-coded values are in the default theme (`src/themes/default.ts`). The stylesheet has none.
  - No derived colors (`rgba()`, `hsl()`, opacity tricks on colors). A test checks this.
  - One exception: pressed states (`:active`) may use `color-mix()`, to mix a little of `--datnav-color-text` into the
    hover or fill color (darker in light mode, lighter in dark mode). The user allowed it, to avoid a token per
    pressed color. The test checks that every `color-mix()` sits in an `:active` rule.
  - A library theme only maps the values onto the library's own variables, which already adapt to dark mode.
  - Do not use `light-dark()` in the stylesheet: the Vite 8 build (Lightning CSS) rewrites it into a form that needs
    extra variables. In theme values it is fine: they are set inline and never pass the build.
- Global CSS (any stylesheet that is not a CSS module) always uses BEM.
  - Format: `dn-block__element--modifier`, lowercase, words separated by hyphens, prefix `dn-`.
  - Inside CSS modules, plain local class names are fine. BEM is not needed there.
- Custom properties: only the 29 internal `--datnav-*` ones, set from the theme. No other custom properties of our
  own, and none for passing other runtime values to the stylesheet either: set the real property inline instead.
- No `!important`. Never remove focus outlines. Every button, input and menu item has a `:focus-visible` outline in
  `--datnav-color-focus`.
- The library build emits one stylesheet (`dist/data-navigator.css`). Apps import it, like Mantine's `styles.css`.

## Look and feel

- `striped?: boolean` (default `false`): a zebra look on the data rows.
  - Off by default: rows have no alternating background colors.
  - The tint starts on the first data row, then every other one. A striped row and its detail row are one unit, as
    they are for hover and selection.
  - The tint is `--datnav-color-stripe` (the subtlest gray of the library). Selection and hover always win over it: the
    stripe rule is wrapped in `:where()`, so it weighs one class only.
  - Every row hovers with `--datnav-color-stripe-hover` (one shade over the stripes), striped or not, gray or white rows
    alike. `--datnav-color-hover` is only for controls (buttons, list and menu items).
  - While striped, the zebra is the separator, so the horizontal lines between the data rows go. Only on unselected
    rows: a selected row keeps its lines, which is what frames it.
    - Only the color goes (`border-bottom-color: transparent`), never the width. The cells keep their 1px, so nothing
      shifts and a selected row still lines up with the rows around it.
    - Detail rows follow their data row here too. The line under the header stays.
  - The root carries `data-striped`, and every tinted data row carries `data-stripe`. The parity cannot be done in
    CSS: rows are `display: contents` and expanded detail rows break `:nth-child`.
- Density: `density?: 'compact' | 'normal' | 'comfortable'` (default `'normal'`, which is the standard look).
  - Only the vertical padding of the header cells and data cells changes. The horizontal padding stays.
  - The values map onto the spacing values: `calc(var(--datnav-spacing-xs) / 2)`, `--datnav-spacing-xs`,
    `--datnav-spacing-md`.
  - In `compact`, the column headers get a little more vertical padding than the data cells (3/4 of `spacingXs`
    instead of half of it), so a header (often a click target) does not look squeezed.
  - The root element carries `data-density`, and the stylesheet does the rest (with `:where()`, so more specific cell
    classes like the group header keep their own padding).
  - Toolbar and footer change in `compact` only, both flatter, with a font between `fontSizeSm` and `fontSize` and
    controls of 0.875 × `controlHeight`:
    - Toolbar: `spacingXs` above, below and between its lines (instead of `spacingSm`; the sides stay), the title at
      1.1 × `fontSize` (instead of 1.25 ×), smaller action and menu buttons and search field.
    - Footer: less room around it (`spacingSm` above instead of `spacingMd`, `spacingXs` below), smaller pager buttons,
      page size select and page field.
    - The heights are set on those controls directly (the stylesheet only reads the theme's custom properties and never
      sets one).
- Pressed state: buttons (toolbar, row, pager, details toggle) and sortable headers get a darker background while
  pressed (`:active`): their hover or fill color with 10% (filled buttons: 15%) of `--datnav-color-text` mixed in.
- Sortable column headers get a light gray, rounded shape on hover (only on devices that can hover).
  - The whole header cell is the click target for sorting, not only the text. It gets `cursor: pointer`.
  - Headers that cannot be sorted, and group headers, have no hover: they are not clickable.
  - The hover only covers the lower cell of a column (that is why ungrouped headers do not span two rows).
  - The shape is `--datnav-color-header-hover` with `--datnav-radius`, 3px inside the cell, behind the text (a `::before` of
    the cell). The whole cell stays the click target, and the line below the header stays straight.
  - The default theme's color is a light gray (`#efefef`, dark `#262626`).
- Header look: no gray band, in every mode (striped or not): the header shows the plain surface color
  (`--datnav-color-surface`), with bold text and a 1px line below it. The filter row too.
  - It is not transparent: it stays opaque, so scrolled rows never shine through the sticky header.
  - The hover shape of a sortable header (`--datnav-color-header-hover`) lies on the surface, so a theme may map it onto
    a translucent color (antd does).
  - Before, the header had a light gray band (`--datnav-color-header`), and only striped mode gave it up. The user wants
    no band at all. `--datnav-color-header` is now only used for other soft gray areas (the selection pill, the role
    badges of the demo).
- Tooltips: Base UI's `Tooltip` (`WithTip` in `widgets.tsx`), shown on hover and on keyboard focus, hidden on leave,
  blur, Escape and click. Never the native `title` attribute.
  - It opens after 300 ms, and at once when moving from one trigger to the next (one `Tooltip.Provider` at the root).
  - It is rendered into the layer of the root, above the trigger (4px gap; the sort hint 12px, so it sits above the
    whole header cell, not over its padding and hover shape), and gets the values of the theme. It is as wide as
    its text (`width: max-content`, at most 20rem): the layer has no width of its own, so without that every word would
    get its own line.
  - The trigger element is ours; Base UI renders it through `render`. On a menu button, the tooltip trigger renders
    the menu trigger, and the tooltip is disabled while the menu is open.
  - Base UI disables tooltips on touch devices (a tap would conflict with the click).
  - Base UI's tooltip is visual only (no `aria-describedby`). So an element whose name is not the tip (a button with a
    label, a sortable header) carries the tip as its `aria-description`. An icon-only button is named by the tip
    (`aria-label`) and needs no description.
  - This applies to the tips of actions and to the hint of a sortable header ("Sort ascending", "Sort descending").
  - The text of a tooltip is a `Texts` entry or a `tip`, so it is localizable.
- Sort arrow: the sorted column always shows its arrow (up or down).
  - The arrow is the only marker of the sorted column: its header gets no extra color or background.
  - The up/down icon of a sortable column that is not sorted is only visible while its header is hovered or has
    keyboard focus. Its space stays reserved, so the header text does not jump.
  - On devices that cannot hover (touch, `@media (hover: none)`) the icon is always visible on unsorted sortable
    columns, because nothing could reveal it there.
- Empty state: `empty?: ReactNode`. It replaces the default when given.
  - Default: a generic database icon above the text `Texts.empty`, centered and dimmed, in one cell that spans all
    columns. The icon is Phosphor's `PiDatabaseThin` (MIT, the thin weight, its path inlined), 40px, in
    `--datnav-color-text-dimmed`. (It replaced Tabler's `database` with a thinner stroke, and before that an inbox icon,
    which looked like an empty box.) Custom content is not dimmed.
  - It is shown only when a load has finished and returned no rows (never before the first load).
  - It has no line below it (nothing follows it). That applies to the default content and to a custom `empty`.
  - The footer is shown only if at least one data row is shown. So it is hidden while the empty state is shown, and
    also before the first load returned rows (no item range, page size or pager: there is nothing to page).
  - The old rows stay visible while a new load runs, so the footer stays then too.
  - The search box in the toolbar stays, so a search can be changed or cleared.
  - The demo has a Data selector: users, empty (default content) and custom (own content).
- Cell text: `Column.wrap?: boolean` (default `false`).
  - Without `wrap`, plain text stays on one line and is cut off with an ellipsis when it does not fit. Plain text has
    a span of its own (`.cellText`), which gets `overflow: hidden`, `text-overflow: ellipsis` and `white-space:
    nowrap`.
  - With `wrap: true`, the cell carries `data-wrap`, and the text wraps at word boundaries. Long words are hyphenated
    at syllable boundaries (`hyphens: auto`). Only a word that does not fit on a line at all (an email address) is
    broken at any place (`overflow-wrap: break-word`, not `anywhere`, which broke words at any letter).
  - The text of a detail row always wraps (like `wrap: true`).
  - Custom `render` and `renderDetail` content is left alone: its layout is the app's business.
  - A tooltip with the full text of a cut-off cell may come later (only when it is really cut off).
  - Hyphenation uses the language of the page: the app sets `lang` on `<html>` (or on an ancestor of the table). The
    demo's language switch sets it (`document.documentElement.lang`), so German content is hyphenated by German rules.
- Column headers never wrap: the header text stays on one line and gets an ellipsis when it does not fit.
  - This also applies to group headers.
  - The sort arrow never shrinks and always stays visible, only the text is shortened.
- Selection color: `selectionAppearance?: 'neutral' | 'accent'` (default `'neutral'`).
  - `neutral` (the default): `--datnav-color-selected-neutral`, a light gray tint. The row hover is stronger than it
    (`--datnav-color-stripe-hover`), so a hovered row stands out even when it is selected (the default theme swapped the two
    grays for that: selection `#eee`, hover `#dfdfdf`).
  - `accent`: `--datnav-color-selected`, the standard selection color of the UI library (its primary color, lightly
    tinted). The name follows the common term "accent color" (the highlight color of a UI).
  - It was `'default' | 'neutral'` with `'default'` (now `accent`) as the default. Renamed before the first release.
  - It applies to selected data rows and to their detail rows (see below).
  - Selected rows get a line on top and at the bottom, in both appearances.
    - `neutral`: gray, the normal border color (`--datnav-color-border`).
    - `accent`: in the brand color family, only slightly darker than the selection background: the next shade of the
      same tint, never the strong primary color (`--datnav-color-selected-border`).
    - The cell borders are collapsed: the top border of a selected row overlaps the bottom border of the row above.
      So there is one line between two rows, never a double line, and the row does not grow.
    - It applies to the cells of the detail row of a selected row too, so a selected row and its detail row look like
      one framed block.
    - The first row is the exception: it has no top line, because the line below the header is right above it. (A
      line of its own could not overlap the header's line, since the sticky header paints above; it would be a second
      line, and the row would grow by 1px.) With `accent`, the top edge of a selected first row is therefore the gray
      header line.
    - The stylesheet has the neutral look (gray background, gray lines) as the base, and `accent` overrides the colors.
    - Before, `neutral` had no top line (only the normal line below each row). The user wants the frame in both.
  - With `neutral`, the selection checkboxes and radios of the rows and the select-all checkbox are gray too
    (`color: --datnav-color-text-dimmed`). With `accent` they have the primary color. Other checkboxes (for
    example in a custom filter) always keep the primary color.
  - There is no `none`: selection is always visible in the row. The root element carries
    `data-selection-appearance`, and the stylesheet does the rest.
- Hovering a data row changes the background color of the whole row.
  - The color is `--datnav-color-stripe-hover` (with `accent`: `--datnav-color-hover-accent`).
  - The hover color wins over the selection color: a hovered selected row shows the hover color too (its selection
    lines stay). The empty row has no hover.
  - With `selectionAppearance="accent"`, the hover is a tint of the accent color (`--datnav-color-hover-accent`), stronger
    than the selection color, so a hovered row stands out even when it is selected. In striped and unstriped tables
    alike.
  - A data row and its detail row (when it is expanded) are one unit for the hover: hovering either of the two gives
    both the same, different background color (the hover color), whichever of the two the pointer is over.
    - Otherwise the detail row has no background of its own.
  - The detail row of a selected row that is expanded has the selection color too, including the empty cells beside
    the detail cell. The hover color wins over it while hovered. When the row is deselected, the detail row loses
    it again. So selecting works like hovering: the data row and its detail row are one unit.
  - A hovered row also gets a line on top and at the bottom (`--datnav-color-hover-border`, lighter than the normal
    lines in the default theme), around the data row and its detail
    row together, whichever of the two is hovered.
    - The top line overlaps the line of the row above (negative margin, like the selection border), so nothing
      shifts and the row does not grow.
    - The first row gets no top line: the line of the header is right above it, and a line of its own could not
      overlap it (the sticky header paints above), so the row would grow on hover.
    - Selected rows keep their own lines. In striped mode (no row lines) the hover lines appear all the same.
  - Only on devices that can hover (`@media (hover: hover)`), so touch devices show no sticky hover.
- Separators: horizontal lines between rows and under the header, no vertical lines between data columns.
  - Two exceptions: a vertical line after the meta columns (selection, details toggle) and one before the action
    column. They run through all data rows and the detail rows.
  - Selected rows and hovered rows (with their detail rows) show no vertical dividers: only the color goes
    (`transparent`), never the width, so nothing shifts. The user finds it a bit unusual, but interesting, and keeps
    it.
  - The header has no vertical lines at all. The two dividers start at the first data row, and the header band (group
    header row, column header row and filter row) is left clean. So with no data row shown there is no vertical line
    anywhere.
  - No outer border.
- Search: `searchable?: boolean` (default `false`) shows a search box. There is no initial search text (no
  `defaultSearch`), and there will be no initial filters either (no `defaultFilters`): the initial state of the search
  and of the filters is always empty.
  - The text goes to `source` as `Query.search: string` (trimmed, `''` when empty). `source` does the searching.
  - The box sits in the bar of the toolbar, at its right end (right of the action buttons, with the free space
    between them), with a fixed width of 16rem: search icon on the left, a clear button on the right while there is
    text. Placeholder and labels are texts (`searchPlaceholder`, `clearSearch`).
  - Only Enter searches: what is typed is a draft, like in a text filter (no search after a pause in typing, and none
    when the box loses its focus). Escape, the clear button and emptying the box by hand remove the search at once.
  - Before, typing searched after a pause of 300 ms. The user wants a new load only on Enter.
  - A new search goes back to page 1 and clears the selection (like sorting).
  - The box stays usable while loading (everything else is blocked), so it does not lose its focus while the user types.
    A newer search replaces a running one, and the response of the outdated one is ignored.
  - If a search finds nothing, or any filter is active, the default empty state says `Texts.emptySearch` (a generic
    text that does not contain the search term or the filters, e.g. "No results found") instead of `Texts.empty`. A
    custom `empty` always wins.
  - The toolbar is shown when the component is searchable, even without title and actions.
- No text selection around the data: the toolbar (title, subtitle, buttons), the header (column headers, group headers,
  filter row) and the footer have `user-select: none`. Text inputs inside (search box, text filters, page number) stay
  selectable (`user-select: text`). The rows stay selectable, so cell text can be copied.
- Toolbar and footer: plain, with no background and no lines of their own.
  - Both have a padding of `--datnav-spacing-sm` on all sides. The footer has a little more room on top
    (`--datnav-spacing-md`), between the table and the footer.
  - The pager buttons (first, previous, next, last) are text-only icon buttons. A disabled one has a transparent
    background (no gray box): it is only faded (`opacity: 0.4`, in the normal text color), with the `not-allowed`
    cursor.
- Fixed header and footer: the toolbar, the column headers and the footer stay fixed.
  - When the data navigator gets less height than it needs, the rows area shows a vertical scrollbar and only the
    rows scroll.
  - The height comes from outside: the parent gives the component a height, the component has `max-height: 100%`.
    There is no `height` prop for now.
  - Without a limited height nothing scrolls, and the footer directly follows the last row.
  - The vertical scrollbar of the rows area always reserves its space: `scrollbar-gutter: stable`.
    - So the columns keep their width whether or not a page needs the scrollbar (also when paging).
  - All header rows (group headers and column headers) are sticky together inside the scroll area.
- More rules will be added here as we discuss them.

## Design decisions

- No virtual scrolling. Pagination only.
- The specification (this file and `src/api.ts`) is the durable part. See Theming for how it looks in each library.
  - No `components` prop and no slots.
  - The state and logic live in the headless hook `useDataNavigator` in `src/core/`, the rendering in
    `src/core/view/`.
  - The widgets in `widgets.tsx` are leaves: they take what they need in neutral terms and never know about rows,
    queries, selection or loading. Everything else belongs in the view.
- Icons: our own inline SVGs (`view/icons.tsx`, the paths of the Tabler icons), drawn in the current text color and
  `aria-hidden`. The pager buttons: `chevron-left-pipe` (first), `chevron-left`, `chevron-right`, `chevron-right-pipe`
  (last). The filled Material arrows were tried and dropped: they did not match the line style of the other icons.
  - The sort icons are the filled Bootstrap arrows (MIT, 16×16): `BsArrowDownUp` for a sortable column that is not
    sorted, `BsArrowUp` and `BsArrowDown` for the sorted one. They replaced the Tabler chevrons (and before that a
    chevron pair of our own).
  - The empty state's icon is Phosphor's `PiDatabaseThin` (MIT, 256×256), see "Empty state".
- Data comes from exactly one prop: `source`, a function `(query, signal) => Promise<{ rows, total }>`.
  - The table itself never sorts, filters or pages. It delegates everything to `source`.
  - There is no `data` array prop. For arrays, a helper turns an array into a `source` (name and place undecided).
  - The table tracks the promise itself, so there is no `loading` prop.
  - The second argument is an `AbortSignal`, so the app can cancel a request (e.g. `fetch(url, { signal })`). It is a
    separate argument, not part of `Query`, which stays plain JSON.
    - Whenever a newer load starts (a new page, page size, sort, search text or filter value), the table aborts the
      signal of the running load. So `onChange` of a filter aborts the load before it. A value that equals the current
      one starts no load and aborts nothing.
    - The signal is aborted on unmount too.
    - The response or the rejection of an aborted load is ignored, and the rejection is not logged.
    - A source may ignore the signal (a one-argument function still works): the outdated response is ignored anyway.
- Naming: `header` is the heading of a column or column group. `label` is the text of a control (action, menu item).
- Paging: `pageSize` is the initial page size, `pageSizeOptions` fills the page size dropdown.
  - `pageSize` is the only way to set the initial size.
  - Defaults (proposed): options `[10, 25, 50, 100]`, initial size 25.
- Initial sorting is set with `defaultSort` (same type as `Query.sort`). There is no `defaultQuery`.
  - Only one column can be sorted at a time (no multi-column sort). Clicking another header replaces the sort.
  - Clicking a sorted header toggles ascending and descending. There is no "off" state.
    - Once a column is sorted, the table stays sorted. Only the initial state can be unsorted.
    - A new column starts ascending.
  - `Sort` is a single object `{ key, direction }`, not an array. `Query.sort` is `undefined` when unsorted.
  - The table must know the sort itself, to draw the sort indicator in the header.
  - There are no initial filters (no `defaultFilters`), and no initial search text either.
- Column width is a plain number.
  - It is a ratio relative to the sum of all column widths.
  - Widths stay identical when the page changes.
  - Columns cannot be resized by mouse (for now).

- Column grouping is allowed, but only one level deep.
  - A group is a header spanning several columns. Groups cannot contain groups.
  - At most two header rows.
  - All column header cells sit in the lower header row, with their content aligned to the bottom.
    - Below a group header row, the column headers have a little more room on top (half the xs spacing more than the
      density gives), so the two header rows are a bit apart. It is padding, not a gap: the sticky header stays
      opaque.
    - Titles and sort controls of all columns then sit on the same line.
    - Above a column without a group is an empty filler cell (same background, no bottom border), so the header
      looks like one band. The filler is not a header (`role="presentation"`) and has no hover.
    - The header cells of the meta columns and of the action column span both rows (they are never hovered).
  - Only leaf columns can sort or filter, never a group header.
  - `sortable` is `false` by default: only columns marked `sortable` can be sorted.
  - `align` is `'start' | 'center' | 'end'` (default `'start'`). It aligns the header and all cells of the column.
    - The values follow the writing direction (they are not left and right).
    - Group headers are always centered. The action column and the meta columns are not affected.
  - A group has no `width`. It is the sum of its children.
  - The horizontal line below a group header spans the group (the widths of all its columns), inset by the radius
    (`--datnav-radius`) on each side, so neighboring lines are 2 × the radius apart.
    - It is a `::after` of the cell, drawn over the cell's own 1px bottom border, which stays (transparent), so the
      height of the header does not change.
    - The line is 1px thick and gray: `--datnav-color-border`.
    - Before, the lines of neighboring groups touched (the bottom border of the cell). The user wants gaps.
    - The line runs over all data columns of the upper header row: under the group headers and also under the fillers
      above the columns without a group (the meta columns and the action column have their own cells that span both
      rows). The fillers get the same inset line, so there is a gap between a group and a filler too.
  - Neighboring groups are not separated by a vertical line. Only the horizontal line below a group header tells them
    apart, and the gaps between the lines show where one ends and the next begins. There is no `data-separator`.

- The component must be localizable (i18n).
  - No hard-coded user-visible strings.
  - The needed texts are defined by the type `DataNavigator.Texts` in `src/api.ts`, with the en-US text after each line.
    - A text without parameters is a `string`. A text with parameters is `(params: { ... }) => string`.
    - The en-US comments use the simplest valid ICU MessageFormat, e.g. `{count} selected`.
      Full ICU syntax (plural, select) only where a text really needs it.
    - The comments are a neutral notation. The English defaults in `texts.ts` use the same `{count}` placeholders.
  - There is no `messages` prop and no i18n in `Props`: the texts come from the `I18nAdapter` of the configuration.
    - Numbers are formatted in the locale of the adapter (`Intl`), or of `<html lang>` without one.
  - The tests check that every text is provided.

- Loading state:
  - A spinner is shown only after a short delay (about 200 ms, not immediately), to avoid flicker.
  - All user interaction is prevented while loading, from the very start (also during the delay). The exceptions are
    the search box (see Search) and the filter inputs (see Filtering).
  - The loading overlay never covers the header (the toolbar, the column headers and the footer stay undimmed).
    - It only covers the rows area below the column headers: the rows are dimmed to `opacity: 0.3` (the overlay is
      70% opaque), and the spinner is centered in the visible part of that area.
    - The rows stay visible under the dimming, as before.
  - Two minimum heights, both six times the medium spacing token (`calc(6 * var(--datnav-spacing-md))`, 96px by default),
    which is the spinner plus a generous padding:
    - The rows area, so the table does not collapse to the header alone while the first load runs.
    - The loading overlay itself, so the spinner always has room below the header, whatever the header costs (with
      group headers and a filter row it is tall). The overlay is out of flow, so this never changes the table height:
      in the rare case where the header alone is taller than the minimum, the spinner reaches past the rows area.
  - The spinner is always shown over the rows area, vertically centered in its visible part, never over the header.
  - If the parent gives the component even less height, the component overflows it: the minimum height wins.
- Row selection has three modes: none, single, multi. There is no `selection` prop: the mode is derived from the
  actions.
  - Any `rows` action (also inside a menu) means multi. Otherwise any `row` action shown in the toolbar
    (`show: 'toolbar'` or `'both'`, also inside a menu) means single. Otherwise none: general actions and row actions
    that only live in the action column need no selection.
  - Only the action definitions decide, never what is visible at the moment. A `rows` action that is hidden because
    nothing is selected yet still means multi, so the checkboxes are there to select something.
  - If a row should be selectable one at a time, make the action a `row` action.
  - A later controlled selection (see Open) may need an explicit way to select without actions. Adding an optional
    `selection` prop back then is not a breaking change.
  - The table owns the selection. There is no `selected` prop for now. Actions receive the selected rows.
  - The selection is cleared when the sorting, the filters, the page or the page size change.
  - So the selection never spans pages. Multi-row actions receive the selected row objects of the current page.
  - Multi uses checkboxes (with a select-all checkbox in the header). The whole selection cell is clickable, see the
    row click below.
  - Single uses radio buttons.
  - Clicking a data row selects it (row click):
    - Single mode: the row becomes the selected row. Clicking the selected row again keeps it selected.
    - Multi mode: the row is toggled (selected or deselected).
    - No selection mode: clicking a row does nothing.
    - Only the free space of a cell selects: the padding and whatever is left beside the content. Not the text of
      the cell, and not anything a custom `render` or `renderDetail` drew.
      - Plain text therefore gets a `<span>` of its own, so a click on it is not a click on the cell. Custom output
        is already its own target and is not wrapped.
      - This also rules out buttons, links, inputs, menus and anything inside them, without listing them: none of
        them is a cell. Clicks from a portal (an open action menu) are ruled out the same way.
      - The action cell (`data-control`) is the only cell that never selects.
      - A detail row is part of the row click: its free space selects the row it belongs to, exactly like the data
        row above it. That covers the detail cell beside its content and the empty cells next to it.
      - What `renderDetail` returns is its own target, so a click on it does not select, like custom `render`
        output in a data cell.
    - The two meta cells are not control cells: the selection cell (checkbox or radio) and the details toggle cell
      (chevron). Clicking their free space selects or deselects the row, and they get the pointer cursor like a data
      cell.
      - The checkbox and the chevron inside them are their own click targets, so each still does its own job exactly
        once: the checkbox toggles the selection, the chevron only expands, and neither goes through the cell as
        well.
      - Shift + click works there too, so block selection can be driven from the whole cell.
    - A click that ends a text selection made with the mouse does not count either.
    - The free space of a cell gets `cursor: pointer`, in data rows and detail rows alike, but only when a row click
      actually selects: the root carries `data-selection` with the mode, and the stylesheet keys off `single` and
      `multi`. Everything a cell shows keeps the normal caret (one rule on the children of a cell), since `cursor`
      inherits and a value set on the content itself wins over what it would inherit.
    - The checkbox or radio stays the way to select with the keyboard.
  - Block selection (multi mode only): shift + click changes a range of rows, like in Gmail.
    - The range goes from the anchor row (the row that was clicked last) to the shift-clicked row, both included, in
      the order shown on the current page.
    - The range gets the state of the anchor row: if the anchor row is selected, the whole range becomes selected.
      If the anchor row is deselected, the whole range becomes deselected.
    - Rows outside the range keep their state.
    - After a shift + click, the shift-clicked row is the new anchor, so the next shift + click extends from there.
    - It works for a row click and for a click on a row's checkbox.
    - Without an anchor (or when the anchor row is not on the page), a shift + click behaves like a normal click.
      A shift + click on the anchor row itself is also a normal click (it toggles the row).
    - The anchor is forgotten whenever the selection is cleared (sorting, filters, page or page size change).
    - Shift + mouse down must not select text in the browser (except in text inputs inside cells).
    - Single mode and no selection mode ignore the shift key.

- The default footer (navigation bar) looks like this:
  - `(pill: N selected)  Items 1-50 / 245        Page Size [50 v]   << < Page [1] of 5 > >>`
  - Left: selection pill, item range and total.
    - The pill is only visible when at least one row is selected.
    - It is a gray pill (`--datnav-color-header`) with a darker gray border (`--datnav-color-border`), like the role badges of
      the demo, fully rounded, with small bold text.
  - Right: page size dropdown, first/previous buttons, page number input, "of N", next/last buttons.
  - All texts are localizable.

- Filtering is done with quick filters in an extra filter row below the header rows.
  - One cell per leaf column, containing an input, a select, etc.
  - The filter row is part of the sticky header: it stays fixed together with the column headers when the rows scroll.
    It always takes its vertical space.
  - The filter row is always shown when at least one column has a `filter`. There is no button to show or hide it.
  - Cells without a filter of their own get empty cells (`role="presentation"`): columns without a `filter`, the
    selection column, the details toggle column and the action column. So the horizontal lines and the two vertical
    dividers continue through the filter row, like in a detail row.
  - It stays visible when no row is shown (an empty result), so the filter that caused it can be changed. The footer and
    the action column disappear then, as decided before.
  - Look: the filter row belongs to the header band: same background, and one line under it (not under each row of the
    header). The height follows the cell padding of the density.
  - A filter always fills the full width of its column, inside a small horizontal cell padding, whatever the `align` of
    the column and whatever a custom filter renders (the stylesheet gives its top element `width: 100%`).
    - The side padding of the filter cells is half the `xs` spacing token (`calc(var(--datnav-spacing-xs) / 2)`), less
      than the other header cells. So is their top padding, so the filters sit a little closer to the column headers. So neighboring inputs are only about 10px apart. The
      inputs then sit a little left of the header text, which is accepted.
  - The group header row stays above the column headers. The filter cells line up under the leaf headers.
  - The header cells of the meta columns and of the action column span the header rows (group row and column header
    row) only, not the filter row. So their content (e.g. the select-all checkbox) stays next to the column titles.
  - The per-column API is `Column.filter?: ColumnFilter`. A filter is a plain function
    `(props: FilterProps) => ReactNode` (returning an element that has its own state if it needs one), and
    `FilterProps = { value: FilterValue | undefined; onChange(value: FilterValue | undefined): void; labelledBy: string }`.
    - `value` is the applied value (`undefined` for none), `onChange` applies a new one, and `labelledBy` is the id of
      the column header, for `aria-labelledby` (a filter has no visible label of its own).
    - The built-in filters are factories, exported next to the component: `textColumnFilter()`,
      `selectColumnFilter({ options, multiple? })` (`options` are strings, or `{ value, label }`) and
      `dateRangeColumnFilter()`. A custom filter is just another function.
    - `dateRangeColumnFilter()` (`view/DateRangeFilter.tsx`): a trigger in the look of the selects (`Texts.filterAll`
      while empty, dimmed; else the range, formatted with `Intl.DateTimeFormat#formatRange` (`dateStyle: 'medium'`) in
      the adapter's locale, e.g. "Sep 12 – 20, 2026"), with a calendar icon at its end, or the clear button while set.
      It opens a Base UI `Popover` (in the layer of the root, not modal, below the trigger) with the date picker of
      `@local/calendar` in `dateRange` mode. The second click of a range (also the same day twice) applies it and
      closes the popover; Escape and a click outside close it without a change.
      - The date picker is loaded on first use (`import('@local/calendar')`), so importing this package needs no DOM
        (e.g. on a server), and registered once under the first free tag name `datnav-date-picker-<n>`.
      - Its colors are the date picker's own, fixed ones (not the theme's), for now.
    - The built-in filters are small (`0.8 * --datnav-control-height`) and fill the cell. Their text is between the small
      and the normal size (`(--datnav-font-size-sm + --datnav-font-size) / 2`), and they keep their own small side padding
      (`--datnav-spacing-xs`).
    - Text inputs and selects outside the filter row (the search box, the page number, the page size) have a side
      padding of `0.75 * --datnav-spacing-sm`.
    - Every select (the single and the multiple select filter, the page size) is one widget, `SelectField`, on Base
      UI's `Select`. The trigger looks like our text inputs (same classes), with our chevron, or our clear button
      while something is chosen. It shows the chosen labels (comma separated) or the placeholder, dimmed
      (`data-empty`) while nothing is chosen.
    - The list opens below the trigger (`alignItemWithTrigger={false}`, not over it as Base UI does by default), at
      least as wide as the trigger, in the look of our menus: `--datnav-color-surface`, `--datnav-color-border`,
      `--datnav-radius`, `--datnav-shadow`. The highlighted option is `--datnav-color-hover`, a chosen one is bold.
      - Single select: a checkmark (`--datnav-color-primary`) in front of the chosen option. Its room is kept on every
        option, so the labels line up.
      - Multiple select: a checkbox in front of every option, the same native checkbox as in the rows. It is only a
        picture of the state (`aria-hidden`, `tabIndex={-1}`, no pointer events): the option is the control. It is gray
        (`--datnav-color-text-dimmed`), whatever the selection appearance.
    - The list is rendered into a layer element inside the root (`LayerContext`), not at the end of the body, so it
      gets the values of the theme. It is `position: fixed`, so the scroll area does not cut it off.
    - It is not modal (`modal={false}`): the page stays scrollable and usable while a list is open.
    - A single select filter has `Texts.filterAll` (value `''`) as its first option, which removes the filter. A
      single select closes when an option is chosen. A multiple select has no such option and stays open while
      options are chosen (Escape or a click outside closes it).
    - Selects (the single select filter, the page size, the button of a multiple select) have 1px more padding on
      every side than the text inputs.
    - The page size select and the page number field of the footer are 2px lower than the other controls
      (`--datnav-control-height - 2px`), with no vertical padding. The page number field has the same side padding as
      the start of the page size select (`0.75 * --datnav-spacing-sm + 1px`), and 2px extra room on each side. The filters
      are not affected.
    - Placeholders: a select shows `Texts.filterAll`, only while nothing is selected (also with `multiple`). A text filter shows `Texts.filterPlaceholder` ("Filter"), or
      `textColumnFilter({ placeholder })`. That is a plain string the app localizes itself, and it wins over the
      default. `Texts.clearFilter` is the label of their clear button.
  - When a filter is applied is decided by its type:
    - `textColumnFilter`: only on Enter. What is typed is just a draft: a pause in typing or leaving the input applies
      nothing (unlike the search box, which searches after a pause). Escape clears the box, and so does its clear
      button, and emptying the box by hand does too. All three remove the filter at once.
    - `selectColumnFilter`: at once, when the selection changes (also when it is cleared). With `multiple` the value is
      an array of strings, and an empty selection removes the filter.
    - custom: at once, on every `onChange(value)` call. That is the whole contract: a custom filter that needs a delay
      implements it itself. There is no separate apply button or draft state.
  - Every applied filter goes back to page 1 and clears the selection. A newer change replaces a running load, and the
    response of the outdated load is ignored (as for the search).
  - The filter values in `Query.filters` (the type is `Record<string, FilterValue>`):
    - The key is the `key` of the column. A filter without a value is absent: `{}` means no filters. An emptied text
      filter or a cleared select removes its key. `undefined`, `null` and `''` are never used for "no filter".
    - Values are JSON values only: `FilterValue = string | number | boolean | null | readonly FilterValue[] | { readonly
      [key: string]: FilterValue }`.
      - So a custom filter uses ISO strings for dates, never a `Date`.
      - The whole query is serializable (server, URL, storage).
      - A custom `onChange` takes a `FilterValue`, or `undefined` to remove the filter.
    - `textColumnFilter` gives a trimmed string, `selectColumnFilter` gives the string value of the chosen option (an
      array of them with `multiple`), `dateRangeColumnFilter` gives `{ from, to }` (`DataNavigator.DateRangeFilterValue`,
      ISO dates yyyy-mm-dd, both inclusive).
    - Applying a value that equals the current one does not start a new load.
    - The keys are plain strings (not checked against the row type). Keys typed against the row type are a todo.
  - All filter inputs stay usable while loading (like the search box), whatever their type: everything else is blocked,
    but a filter can be changed or typed into during a load. A newer change replaces the running load.
  - Clearing filters: every filter provides its own way to clear itself. There is no "clear all filters" button and no
    summary of the active filters.
    - `textColumnFilter`: a clear button inside the input while there is text (also Escape, see above).
    - `selectColumnFilter`: a clear button (`Texts.clearFilter`) takes the place of the arrow while something is
      selected.
    - `dateRangeColumnFilter`: the same clear button takes the place of the calendar icon while a range is set.
    - custom: the custom component provides its own clear control and calls `onChange(undefined)`.

- The toolbar above the table has two parts, one below the other, `--datnav-spacing-sm` apart:
  - The heading: the optional title and the subtitle below it.
    - Props `title` and `subtitle`, both optional and of type `ReactNode`.
    - The title is bold and `1.25 * --datnav-font-size`. The subtitle is smaller (`--datnav-font-size-sm`) and dimmed.
    - There is little gap between title and subtitle: both use a tight line height (1.3). No extra margin.
    - Without title and subtitle, the heading is not rendered.
  - The bar: the action buttons on the left, the search box on the right, the free space between them.
    - Toolbar buttons are `calc(--datnav-spacing-xs / 2)` apart, the search box `--datnav-spacing-xs` from them.
    - New buttons (the actions for a selection) are added at the end of the button group, so the buttons that are
      already there never move, and neither does the search box.
    - Without visible actions and without a search box, the bar is not rendered.
  - If there is no title, no subtitle, no visible action and no search box, the toolbar is not rendered.
  - Tried and dropped: a batch action bar like IBM Carbon's (a bar in the brand color with "N selected", the actions
    for the selection and "Cancel", replacing the toolbar while rows are selected). It did not fit, and the actions
    for the selection stay in the normal bar.
- Actions come in three types: general, single-row and multi-row.
  - They are described declaratively (a list of actions), not by hand-written render functions.
  - Actions are native buttons, and a menu is Base UI's `Menu` (`role="menu"`, items `role="menuitem"`).
    - Opened from the keyboard (Enter, Space or ArrowDown on the button), the first item has the focus. Opened with the
      mouse, no item is highlighted yet (like native menus on the desktop).
    - Arrow keys (wrapping), Home, End and typing move between the items. Escape closes it and gives the focus back to
      its button, a click outside closes it.
    - Choosing an item closes the menu and runs the action once. A second click on the menu button closes it.
    - It opens below the button: in the toolbar (buttons on the left) aligned to the start of the button, in the action
      column (at the right edge of the rows) aligned to its end, so it does not reach past the table. Base UI flips it
      when there is no room. It is not modal (`modal={false}`).
    - The item under the pointer or the keyboard focus is `--datnav-color-hover` (Base UI's `data-highlighted`).
  - General and multi-row actions are shown in the bar of the toolbar, on the left side.
  - Single-row actions can be shown in an optional action column at the very right, in the toolbar, or in both.
    - When no data row is shown, the whole action column is not shown: header cell and left border included.
    - It is up to the user which one to use.
  - Every action and every menu has a look: `icon?: ReactNode`, `label?: ReactNode` and `tip?: string`. What the app
    gives decides what is shown:
    - `label` only. `icon` and `label`. `icon` and `tip` (icon only, with a tooltip). Or all three.
    - An icon-only action has no label, so `tip` is required (the type checks it). The tip is its accessible name
      (`aria-label`) and its tooltip. On an action with a label, the tip is a tooltip only.
    - Tooltips are Base UI's (see Tooltips), on hover and on focus.
    - It applies to toolbar buttons, to the buttons in the action column and to menu buttons (an icon-only menu
      button has no chevron). In a dropdown, an item shows its icon and its label, or its tip if it has no label.
    - Touch devices have no hover, so an icon-only button has no visible name there (screen readers read the tip).
      Recommendation: give actions that matter a label, and use icon-only buttons for well-known icons (edit, delete).
      A long-press tooltip is on the todo list.
    - The icons are the app's business: `icon` is any `ReactNode` (the demo uses the icon set of each library).
  - Every action and every menu has a `variant?: 'primary' | 'secondary' | 'danger'` (default `'secondary'`).
    - `primary`: the one main action, emphasized. `secondary`: the normal look. `danger`: destructive actions, in a red
      tone. There is no combination of primary and danger.
    - Guidance for apps: at most one primary (the thing most users come for), danger only for actions that destroy
      something (still with a confirmation or undo in the app), everything else secondary. An app that never sets a
      variant gets an all-secondary, calm toolbar.
    - Colors come from the theme.
    - Toolbar: primary is filled (`--datnav-color-primary`, text `--datnav-color-on-primary`, hover
      `--datnav-color-primary-hover`), danger is filled too (`--datnav-color-danger`, text `--datnav-color-on-primary`),
      secondary is outlined and neutral (`--datnav-color-border`). Height `--datnav-control-height`, an icon-only button is
      square.
      - There is no hover color for danger (no token), so a filled danger button keeps its red on hover.
    - The action column is different: only link-style buttons, in three colors, one per variant (primary color,
      neutral, red). Buttons with a border or a background of their own look odd on a hovered or selected row, while
      link-style buttons are transparent, so the row color shows through.
      - Transparent, no border, `--datnav-font-size-sm`, `0.75 * --datnav-control-height` high. Hovered, they get
        `--datnav-color-hover-border` (one shade over the hovered row). The details chevron and the pager buttons (the same
        icon button class) too.
    - In a menu, the menu button follows the variant of the menu. An item of a menu is red when it is `danger`
      (the other variants look the same there).
    - Every action button carries `data-variant` with its variant.
  - Any action can be placed inside a menu.
    - A menu is a flat dropdown: a button with a list of actions. No submenus (max. two levels).
    - Its separators are lighter than its frame: `colorHoverBorder` (the lighter line color of the theme).
    - Declaratively, a menu is an `ActionMenu` (`type: 'menu'`) holding an `actions` list. It is not an `Action` itself.
    - The visibility rules apply to each child. A menu without visible children is hidden.
    - A menu can contain separators (`{ type: 'separator' }`, an `ActionSeparator`, no key). A separator is only shown if
      a visible action is before and after it: none at the start or at the end, and only one where several follow each
      other. A menu with only separators and invisible actions is hidden.
    - Works in the toolbar and in the action column.
  - A single-row action can be the default action: `default?: boolean` on `RowAction`.
    - A double click on the free space of a row runs it, with that row. The same area as the single click: the free
      space of any cell of the data row or its detail row, never the text, custom content or a control cell.
    - The name says the role, not the trigger, so a second trigger (Enter on a focused row, a long press) can be
      added later without renaming it.
    - The browser is stopped from selecting a word: the second mouse down is prevented, so nothing stays highlighted
      behind whatever the action opened. Only on the free space of a cell, where the double click does something. On
      the text itself nothing is prevented, so a word can still be double clicked and copied.
    - There is no text selection guard on the double click, unlike the single click. A double click makes the browser
      select a word, so a selection would be the consequence of this very gesture, not something that was already
      there. Guarding on it would mean the double click almost never fires. jsdom has no text selection, so only a
      real browser shows this: the test suite mocks `getSelection` to pin it.
    - A double click leaves the selection exactly as it was, in single and in multi mode alike.
      - No delay and no guessed threshold: the browser counts the clicks itself and reports the count in
        `event.detail`. The second mouse down already carries 2, which is the earliest moment anything can know a
        double click is happening, before the second click and before the double click event.
      - So a row click still selects at once, and the selection from before it is kept in a ref (no re-render). On
        that second mouse down it is put back, so the row is only changed for the span of the user's own gap between
        the two clicks.
      - The second click of a double click never counts on its own (`event.detail >= 2`).
      - Never invent a double click duration. It differs per system and per browser, the web platform does not
        expose it, and `event.detail` makes knowing it unnecessary.
    - The first action marked `default` wins, the rest are ignored. The type cannot check that there is only one.
    - It counts wherever the action lives: in the action column, in the toolbar, or inside a menu, whatever `show`
      says. It does not change the selection mode either, so a table can have a default action and no checkboxes.
    - No touch equivalent (there is no double tap) and no cursor of its own: the button stays the discoverable way.
  - Toolbar actions are only visible when the matching number of rows is selected (not merely disabled).
    - Single-row actions: exactly one row selected.
    - Multi-row actions: at least one row selected.

- Row details (expandable rows) are supported.
  - A chevron column sits right next to the selection column: pointing right when collapsed, down when expanded.
  - The chevron change is animated (a CSS rotation).
  - The detail cell spans only the data columns, not the meta columns (selection, details toggle) and not the action
    column.
  - Under the meta columns and under the action column, the detail row has empty cells (`role="presentation"`), so the
    horizontal lines and the vertical dividers continue through the detail row.
  - There is never a line between a data row and its detail row: the two are one block. The detail row has no top
    border in any state, and the data row above it gives up its bottom line. The bottom border of the detail row
    closes the block.
    - Only the color goes (`transparent`), never the width, so nothing shifts and a selected block still lines up
      with the rows around it.
    - Both rules sit after the selection border rules in the stylesheet, which they override at equal weight.
  - The header has a matching chevron next to the select-all checkbox, to show/hide all row details at once.
  - Details are optional per row: a row without details shows no chevron.
  - If no row on the current page has details, the whole chevron column (header chevron included) is hidden. So it is
    also hidden when no data row is shown at all (empty result, first load).
    - Accepted for now: the data columns' pixel widths may shift when the chevron column appears or disappears
      between pages. Reserving the space is a possible later improvement.

## Implementation notes

- The table is one CSS grid (`role="table"`), not a `<table>`.
  - Column width ratios are `fr` units. The selection, chevron and action columns are `max-content`.
  - Group headers and `rowspan`-like headers are placed with explicit `grid-column` and `grid-row`.
  - Rows are `display: contents`. The empty row spans all columns. The detail cell spans the data columns.
  - Runtime values are set as the real CSS property inline: `gridTemplateColumns` on the table, `gridColumn` and
    `gridRow` on the cells (`headerRowSpan`, `filterRow` and `columnSpan` come from `useDataNavigator`), and the
    measured `top` of the loading overlay. The stylesheet holds no grid placement at all.
  - State is expressed with `data-*` attributes, set with `flag()` in `utils.ts`.
  - Vitest processes CSS modules with readable (non-scoped) class names, so tests can check them.
- Fixed header and footer: the root is a flex column with `max-height: 100%`. The toolbar and the footer are flex items
  that do not shrink. The table sits in a `scroller` (`overflow-y: auto`, the only part that scrolls) inside a
  `scrollArea`, which also holds the loading overlay.
  - All header cells are children of one `role="row"` element (`headerRow`): `position: sticky; top: 0` with
    `grid-template-columns: subgrid`, so the group header row and the column header row stick together.
  - The header is opaque: it has the surface color (`--datnav-color-surface`).
  - The demo has a Height selector (auto or fixed at 30rem) to show it.
- Loading: the toolbar (except the search box), the rows area and the footer are `inert`, and the root is
  `aria-busy`, from the start. After 200 ms, `data-dimmed` is set on the root and the spinner appears.
  - The rows are dimmed by CSS (`opacity` on everything inside a row), so the header row is never dimmed.
  - The spinner (a CSS ring in `--datnav-color-border` and `--datnav-color-primary`, `role="status"`, slower with
    `prefers-reduced-motion`) sits in an `overlay` inside the `scrollArea`,
    which starts below the measured header height (`useElementHeight`), set inline as its `top`.
  - The minimum heights of the rows area and of the overlay are plain CSS (`calc(6 * var(--datnav-spacing-md))`). The header
    height is not part of them: an element that needs room asks for it itself, instead of the component measuring the
    header and the stylesheet adding a token to it.
  - Each load has its own `AbortController`. The effect cleanup (a newer load, or the unmount) aborts it and marks the
    load as outdated, so its response and its rejection are ignored.
  - A rejected `source` is only logged with `console.error` (see Todo: error state).
- The current page, page size and sort live in the component. `source` is called when one of them changes.
  - A changed `source` function identity does not trigger a reload.
  - Changing the sort also goes back to page 1.
  - Selection and expanded details are cleared on every such change.
- Mouse down on a row suppresses two things the browser would otherwise do, each only where the gesture means
  something else: `suppressesTextSelection` for shift (the range between the last click and this one) and
  `suppressesWordSelection` for the second mouse down of a double click (a word). Neither applies inside a text
  input, and the word one only on the free space of a cell.
- Block selection: the anchor is the key of the last clicked row (kept in a ref, no re-render). `selectByClick` in
  `useDataNavigator.ts` toggles a row or sets a range. The `Checkbox` widget reads `shiftKey` from the native change
  event and passes it on. Text selection is prevented with `preventDefault` on shift + mouse down
  (`suppressesTextSelection` in `utils.ts`).
- Row click: `isRowTarget` in `utils.ts` answers "did this hit the free space of a cell of the row".
  `isPlainRowClick` adds the text selection guard on top of it, `isPlainRowDoubleClick` does not. It is one check: rows are `display: contents`, so the cells are
  the direct children of the row, and the click target has to be one of them and not `data-control`. Everything else
  follows from that, so there is no list of interactive elements to keep up to date. The data row and the detail row
  share one `rowHandlers(key)` in the view, so they cannot drift apart.
- Texts: `useTexts` reads the `I18nAdapter` from the private `ConfigContext`. Without an adapter, or without a
  translation, the en-US defaults (in `texts.ts`) are used. Numbers in texts are formatted with `Intl.NumberFormat`.
- Popups (the list of a select, a menu, a tooltip) are Base UI's: it positions them (flipped when there is no room,
  kept inside the viewport, following scrolling). They are all rendered into the layer of the root (`LayerContext`).
- Tests choose an option of a Base UI select with the pointer sequence of a real mouse (`chooseIn` in the test file):
  Base UI ignores a bare click event on an option.
- Tests read the stylesheet with a `?raw` import (`vite.config.ts` lets Vitest process it).

## Todo (later)

- Toolbar on narrow screens: the bar does not wrap yet. When space runs out, the search box should go on its own
  full-width line below the buttons.
- A hover color for danger (`--datnav-color-danger-hover`, a 28th token), so a filled danger button reacts on hover.

- Look at the demo in a real browser and polish the styling (group headers, spacing, dark mode, the native widgets,
  the popovers, both themes).
  - Not verified visually yet: only the tests and the build were run.
  - Check that the antd variables really reach the table through the `cssVar.key` class.

- Combobox and autocomplete (Base UI), when a filter needs one. Select and multiple select are unified already.

- `src/api.ts`, `src/react/api.ts`: add the final comments to all types, and group the `Props` properties with blank
  lines again.

- Array helper: turns an array into a `source` (client-side sorting, filtering and paging).
  - Name and place undecided (`DataNavigator.fromArray(rows)` or a separate export).
- Long-press tooltip on touch devices for icon-only actions (Base UI disables tooltips on touch). Try the icon-only
  buttons on a real touch device first.
- `Query.filters` with keys typed against the row type (`Query<Row>`), a possible later safety net.
- Array helper and filters: how the helper applies `Query.filters` (contains for text, equals for select, a list means
  "one of"), and how an own filter supplies its predicate.
- More built-in filters (number range, boolean) if there is demand. (A date range filter exists.)
- Controlled query state (`query` and `onQueryChange`), e.g. for URL sync or "reset all" from outside.
  - Design it as one unit, together with `pageSize` and the selection reset.
- Error state: what happens when `source` rejects (display, retry, texts in `DataNavigator.Texts`).
  - Not specified yet, and not part of the component or the demo yet.
- `rowKey` as a function `(row) => string`, for rows with a composite key. For now it is only a property name.
- Custom element, when really needed: stable styling hooks for app CSS, `data-part="…"` attributes on the main pieces
  (`toolbar`, `header`, `row`, `cell`, `footer`, ...), e.g. `data-navigator [data-part="footer"] { … }` (the light DOM
  counterpart to `::part()`; our class names are generated and not stable).
- Idea (custom element): bundle `preact/compat` instead of React in the element's entry (much smaller; test whether
  Base UI works with it).

## Open

- Linter (ESLint or none): not decided yet.
- Package layout: the import path of the stylesheet (e.g. `data-navigator/styles.css`). For now the build emits
  `dist/data-navigator.css` next to the three entries.
- Controlling the selection from outside: at least clearing it must be possible. Not for v1, discuss later.
