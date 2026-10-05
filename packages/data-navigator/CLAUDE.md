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
- VERY IMPORTANT: never introduce a new CSS custom property (`--…`) without the user's explicit permission.
  - Ask first, with the name and why none of the existing ones does.
  - The need should be rare: use the existing ones (`--ui-*`, the package's own), plain values, or a local calc.
  - A new one, once allowed, carries the package's prefix (never a generic name like `--shadow` or `--border`: the
    mini-apps are light DOM children and inherit them, and they collide with other libraries).
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
  - Runtime dependency: `@base-ui/react`, besides the peers.
  - The date range filter uses vanillajs-datepicker (MIT), a dev dependency only: it is bundled completely into our
    build (a chunk loaded on first use), so an app never installs it. Its stylesheet is not used (see the filter).
  - The builds list the licenses of everything bundled in: `dist/third-party-licenses-react.md` (the React entry) and
    `dist/third-party-licenses.md` (the custom element, with Preact and Base UI).
- Customization: a small set of general design values, the `DataNavigator.Theme` (see Configuration), not one per part.
  - The values (27), with their internal custom properties (`colorTextDimmed` → `--datnav-color-text-dimmed`):
    - Colors: `colorText`, `colorTextDimmed`, `colorSurface`, `colorSurfaceStrong`, `colorBorder`, `colorDivider`, `colorHover`,
      `colorHoverAccent`, `colorSelected`, `colorSelectedBorder`, `colorPrimary`, `colorPrimaryHover`, `colorOnPrimary`,
      `colorDanger`, `colorFocus`.
    - Shape and type: `radius`, `buttonRadius` (buttons with a shape: text and icon buttons, the clear buttons of the
      fields and the date picker's Clear), `shadow` (menus and tooltips), `shadowSm` (the filter panel), `fontFamily`, `fontSize`, `fontSizeSm`, `fontWeightBold`.
    - Spacing and size: `spacingXs`, `spacingSm`, `spacingMd`, `controlHeight`.
  - The grays are three steps (2026-10-04, the user's wish: far too many tokens; 20 colors became 14): `colorSurface`,
    `colorHover` (the row hover, the stripes), `colorSurfaceStrong` (everything stronger: the group header band, the
    hover and press of buttons, menu items and sortable headers, the neutral selection, the hover of striped rows, the
    separators of menus), and the line `colorBorder` (also the lines of a hovered row). Removed: `colorHeader`,
    `colorHeaderHover`, `colorHoverBorder`, `colorStripe`, `colorStripeHover`, `colorSelectedNeutral`.
  - `colorDivider` (2026-10-05, the user's wish: lighter lines between the rows; the user allowed the new property
    `--datnav-color-divider`): the line below every row (`.cell`; data, detail, group, edit form and empty rows), the
    header's line (since the same day), the line at the bottom of the rows and the one before the action column. The
    frame of a hovered or selected row, the dragged row, the inputs, buttons and popups keep `colorBorder`. Like the design language's `--ui-color-divider` next to `--ui-color-border`. Default `#e0e0e0`, dark
    `#363636` (pure grays, like the rest of the default theme; `#dee2e6` of `ui.css` is bluish); soft `#ececec`, dark
    `#2e2e2e`; Mantine `gray-3`, dark `dark-4` (lighter than `default-border`, which `modernTheme` makes `gray-5`); antd
    `--ant-color-border-secondary` (antd's own table lines). Why not `colorSurfaceStrong`: in Mantine (`gray-1`) the
    lines almost vanished; why not a lighter `colorBorder`: the inputs would lose their contrast.
  - `colorSurfaceStrong` (added 2026-09-30, since 2026-10-04 also what the removed header, stripe-hover and neutral
    values were): default `#eee`, dark `#262626` (`#ededed`/`#3a3a3a` before), soft `#f0f0f0` (dark `#262626`), Mantine `gray-1`
    (`#f1f3f5`, dark `dark-5`; Mantine's light grays are all slightly bluish, and it has no neutral light gray), antd
    `--ant-color-fill-secondary`.
  - Every color is its own value, mapped by the theme. No colors derived with `color-mix()` (except pressed states).
  - `selectionAppearance` stays. `'neutral'` uses `colorSurfaceStrong` and a gray selection border (`colorBorder`).
  - More specific values (per part) may be added later if a library needs them (not breaking: all are optional).
  - `colorSelected` in the Mantine theme (2026-10-04, the user's wish): in light mode `--mantine-primary-color-0` (shade 0, the
    next lighter value than `light`, shade 1), in dark mode as before (`--mantine-primary-color-light`). So the row hover
    (`colorHoverAccent`, shade 1 now) stays one step stronger than the selected rows. Only the Mantine theme: the default
    theme's `#e2f1ff` is light enough.
  - `colorHoverAccent` (the row hover with `selectionAppearance="accent"`, stronger than the selection): Mantine
    `--mantine-primary-color-light` since 2026-10-04 (the user's wish, the next lighter value; `light-hover` before, a
    clear lavender in the apps; now the same color as the selected rows: a hovered selected row shows no change, the
    selection is told by its lines and checkbox), antd `--ant-color-primary-bg-hover` (unchanged).
  - antd: `colorBorder` is `--ant-color-border` (the border of antd's inputs, `#d9d9d9`), not
    `--ant-color-border-secondary` (`#f0f0f0`, almost invisible on inputs and buttons).
  - Sizes that have no value of their own are derived with `calc()` (e.g. the title is `1.25 * fontSize`, a row button
    is `0.75 * controlHeight`).
  - The tooltip turns the colors around: `colorText` as background, `colorSurface` as text.
- Themes are objects in the configuration, not CSS files (see Configuration): `defaultTheme`, `softTheme`,
  `mantineTheme`, `antdTheme`.
- The soft theme (`src/themes/soft.ts`, decided 2026-09-28): the look of the design spec of the filter popup and the
  selection bar, for apps without a UI library that want it instead of the neutral default. Hard-coded values like the
  default theme, light and dark: lighter lines (`#dcdcdc`), a brighter blue as the one accent (`#2b72d6`), a light blue
  selection (`#eaf2fd`), rounder corners (`radius` and `buttonRadius` 6px), 13px text (12px small) and a medium weight
  (`fontWeightBold: '500'`). The spacing and the control height are the default's.
  - Not covered by it (no theme values): the outer border with the 12px corner radius of the spec, a stronger line
    under the header, the footer of the spec (see Todo).
  - The Mantine and antd themes map the values onto the CSS variables of their library (`var(--mantine-…)`,
    `var(--ant-…)`), which already adapt to dark mode.
  - antd 6 does not set its variables on `:root`, but on a class of its own (`cssVar.key` of its theme config,
    `css-var-root` by default), which only its own components carry. The table must sit inside an element with that
    class.
- The default theme (`src/themes/default.ts`) is the neutral look, for apps without a UI library that has a theme here.
  - All its grays are pure grays (equal red, green and blue). It has a high contrast, for readability: text `#111`,
    dimmed text `#555`, borders `#c6c6c6` (it was `#a8a8a8` until 2026-09-29, too dark; `#bababa` for a moment), a row hover of `#e4e4e4` (dark `#303030`; it was `#dfdfdf` / `#333` until 2026-09-29, a tiny bit
    too dark) over a lighter neutral selection (`#eee`), a soft
    zebra (`#f8f8f8`), and a light control hover (`#f9f9f9`). Primary and danger are deep enough for 6:1 against
    white. Radius 2px, buttons 5px (the `--ui-radius-sm` and `--ui-radius-md` of the design language of the demos, see the
    root `CLAUDE.md`). Mantine and antd map `buttonRadius` onto their normal radius (their buttons use it).
  - Its colors have a light and a dark value (`{ light, dark }`), which follow the color scheme of the page. Dark mode:
    text `#f5f5f5`, borders `#474747` (it was `#5c5c5c`), and a lighter primary with dark text on it.
  - It and the soft theme are the only places with hard-coded colors (besides the demo).
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
- Implementation: the element wraps the React component. Its entry bundles Preact instead of React (`preact/compat`,
  through aliases in `vite.config.ts`): about 101 kB gzip instead of 166 kB with React. Our code and Base UI work
  with it (checked in the browser: rendering, sorting, search, paging, all filters, selection, actions, the menu,
  tooltips, row details, the language switch).
- Entries (like `file-upload`):
  - `@local/data-navigator`: the element (`setupDataNavigator`), its column filters and editors and the types (namespace
    `DataNavigator`). Preact is bundled in (as React), the app needs no React.
  - `@local/data-navigator/react`: `createDataNavigatorComponent` (renamed from `createDataNavigator`), the hooks, the
    React column filters and their types (namespace `DataNavigatorComponent`), with the app's React (an optional peer
    dependency).
  - `@local/data-navigator/themes`: `defaultTheme`, `softTheme`, `mantineTheme`, `antdTheme` (plain data, used by both; no React,
    no element). The other entries export no themes.
  - Shared types (`Theme`, `I18nAdapter`, `Query`, ...) stay in `DataNavigator` of the main entry: a type-only import
    loads no bundle, so React apps may import them from there.
  - Needs the built files (`exports` to `dist/`), else the app's bundler resolves `react` itself.
- `setupDataNavigator(config)` is called once per app with the config (theme, i18n factory, content adapter) and
  returns a tuple: an element class without a type parameter, and the controller factory, both bound to that config. The
  app names them itself and registers the class under its own tag name (and adds it to `HTMLElementTagNameMap`). We
  never register elements ourselves.
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
  - `density` (`compact`, `normal`, `comfortable`; default `normal`), `footer` (`always`, `auto`, `never`; default
    `always`), `striped`, `searchable`, `reloadable`, `selectable-groups` (`selectableGroups`), `row-action-look` (`rowActionLook`: `icon`, `label`, `iconAndLabel`),
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
      locale: the element calls every text and content function again when its i18n adapter reports a change
      (`onChange`). Plain strings stay fixed.
- Localization of the element: `i18n: { type: 'factory', getAdapter: (element: HTMLElement) => I18nAdapter }`, as in
  the `file-upload` project (`createFileUploadClass({ i18n: { type: 'factory', getAdapter } })`). The element calls it
  once, on its first connect, with itself (so an adapter can read e.g. the `lang` of the element or of an ancestor). It
  may return one shared adapter or a new one per element. Another `type` (e.g. an adapter given directly) makes
  `setupDataNavigator` throw a `TypeError`.
- Column filters: the element's entry exports the same factories as the React entry (`textColumnFilter()`,
  `selectColumnFilter({ options, multiple })`, `dateRangeColumnFilter()`, `numberRangeColumnFilter()`,
  `booleanColumnFilter()`, `autocompleteColumnFilter()`); internally they use the React filters.
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
  - The element stops `input`, `keypress` and `keydown` at its border (`stopPropagation` on the host), so global
    keyboard shortcuts of the page (e.g. XWiki's) do not react to typing inside it. Except Escape: Base UI closes its
    popups (selects, menus, the date popover) through the document.
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
  - `DataNavigator.Controller<Row>` has exactly these methods, and `editRow(row)` and `addRow(template)` since
    2026-09-30 (see "Row editing and new rows"). The `controller` prop is optional: without it the table works as
    before.
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
- `getSelectedRows()`: the selected row objects (all of the current page), in the order they were selected (what a
  `multiRow` action gets). The array stays the same until the selection changes (`useMemo`), which the selection hook relies on.

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
- Localization: `config.i18n`, a discriminated union on `type`, the same as the `file-upload` React wrapper's (decided
  2026-10-02, to unify both packages). Without `i18n`: the English defaults. Another `type` (e.g. an adapter given
  directly, as before) makes `createDataNavigatorComponent` throw a `TypeError`.
  - `{ type: 'factory', getAdapter: (element: HTMLElement) => I18nAdapter }` (for i18n libraries that read the DOM, e.g.
    `lang`): asked once per instance, with the root element of the table, when it is committed (a ref callback, before
    the first paint; the texts are rendered once more, in the adapter's language). The same config object works for
    `setupDataNavigator`. A shared adapter: `{ type: 'factory', getAdapter: () => i18n }`.
    - Also in React (decided 2026-10-02): e.g. two parts of a page in two languages, told apart by `lang` on a
      container and not by a React context. No `{ type: 'adapter' }` for a fixed adapter: `getAdapter: () => i18n` is
      short enough, and written once per app.
  - `{ type: 'hook', useAdapter: () => I18nAdapter }` (for i18n libraries with a React context): called in the
    component on every render, so each instance follows the nearest provider. The `use` prefix keeps the hooks lint
    rules working.
  - Internally the adapter goes into the private `ConfigContext` per instance (with `onRoot`, the callback the view's
    root ref calls for the factory).
- The `I18nAdapter`: exactly the shape of `file-upload`'s (`currentLocale`,
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
  - The themes are exported objects: `defaultTheme`, `softTheme`, `mantineTheme`, `antdTheme` (`src/themes/*.ts`). There are no
    CSS theme files anymore.
  - Without `theme`: the default theme, so the table always has its colors.
  - This reversed "Themes are CSS only: no theme prop, nothing in the API", decided at first.
- The stylesheet itself (`data-navigator.css`) is still imported by the app.
- The public API of the React entry (`@local/data-navigator/react`): `createDataNavigatorComponent`,
  `useDataNavigatorController`, `useDataNavigatorSelection`, `textColumnFilter`, `selectColumnFilter`,
  `dateRangeColumnFilter`, `numberRangeColumnFilter`, `booleanColumnFilter`, `autocompleteColumnFilter`, `textColumnEditor`, `selectColumnEditor`,
  `dateColumnEditor`, and the types (`DataNavigatorComponent.Config`, `.Theme`, `.I18nAdapter`, `.Component`,
  `.Controller`, `.Props`, ...). The themes (`defaultTheme`, `softTheme`, `mantineTheme`, `antdTheme`) come from
  `@local/data-navigator/themes`.

## Safepoints

- Snapshots of the project live in `.safepoints/` (ignored by git), as `<date>-<name>.tar.gz`, without `node_modules`
  and `dist`.
- Restore only when the user asks: look at the target first, then unpack over the project folder.
- `2026-09-24-before-design-changes.tar.gz`: the generic component with native widgets and the three themes, before
  trying out general design changes.
- `2026-09-28-before-filter-popup.tar.gz`: with the filter row, before the filter popup, the pills, the selection bar
  and the selection across pages.

## Stack (decided)

- TypeScript (strict), Vite (library mode), React 19, npm
- Tests: Vitest with jsdom and Testing Library
- One generic implementation with native elements. Themes for Mantine 9 and Ant Design 6. `@mantine/core` and `antd`
  are dev dependencies only, for `scripts/library-variables.mjs` (the variable snapshots of the demo); no library code
  runs in the demo.
- i18n: no library. The app gives an `I18nAdapter` through a factory or a hook in the configuration (namespace
  `datanav`, see Configuration).
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
  - `actions.ts` (which actions are visible where), `layout.ts` (column groups), `grouping.ts` (row groups: the page
    as runs and lines, and the moves between groups; with `grouping.test.ts`), `texts.ts` (`useTexts`: texts via the
    adapter, en-US defaults), `filters.ts`, `hooks.ts`, `utils.ts`.
  - `view/`: the whole rendering. `DataNavigatorView.tsx` (grid, header rows, data rows, detail rows, empty state),
    `Toolbar.tsx` (the bar and the selection bar), `FilterPanel.tsx` (the filter button, the filter view, the pills),
    `Footer.tsx`, `Actions.tsx`, `ColumnFilters.tsx` (the built-in filters and the summaries for their pills).
    - `widgets.tsx`: the leaves (checkbox, radio, buttons, menu, fields, selects, tooltip, loading bar, pill). They never
      know about rows, queries, selection or loading.
    - `icons.tsx` (inline SVGs).
    - `layer.ts`: the context with the layer element inside the root, where the popups of Base UI are rendered.
    - `DataNavigator.module.css`: the one stylesheet (all rules, no values of its own), with its typed declaration file
      `DataNavigator.module.d.css.ts`.
- `src/themes/`: the theme objects: `default.ts` (the neutral look, with hard-coded values, light and dark), `soft.ts`
  (the look of the design spec, hard-coded too) and one per
  UI library (`mantine.ts`, `antd.ts`).
- `src/DataNavigator.test.tsx`: the test suite of the component (it was the conformance suite of the old
  implementations), plus the theming tests (every theme has every value, the root gets them as custom properties, the
  stylesheet reads only known ones) and the i18n tests (with small adapters).
- `demo/` + `index.html`: the demo app (`npm run dev`): 245 users, 1 second loading time, en/de, all selection modes
  (through the Actions selector). It starts striped.
  - Columns: first name, last name, date of birth (ISO, yyyy-mm-dd, with the date range filter; the dates come from
    the index, not from the random generator, so the other demo data stays the same), email, country, role, logins
    (a number range filter) and active (Yes/No, a boolean filter; both from the index as well, in a group "Account"
    when grouped). No city column (the users still have a city: the search and the details use it).
    - Every column but the names is `hideable` (the column toggle menu); logins and active start `hidden`. The custom
      element tab has a hideable email column.
    - The email filter is an autocomplete (multiple, in both tabs): `suggestEmails` (`data.ts`, 300ms) loads at most
      20 users whose name or email contains the query; each option shows the email with the name below it (JSX in
      React, a DOM node in the element tab).
  - `index.html` + `main.ts`: the page, a shell around the demo element: a header with the title and, top right, the
    global switches (language, color scheme), which change `<html>` (`lang`, `data-scheme`). It registers the demo
    element as `data-navigator-demo`.
  - `DataNavigatorDemo.tsx`: the whole demo as a light DOM custom element (see "Demo element" below), with tabs:
    "React component", "Custom element", and further examples of the React component, one per tab (a new example may
    get a tab of its own, one more entry in `EXAMPLES`): "Row reordering", "Row grouping", "Grouped reordering". On connect it renders `App`
    into the first panel (React, `StrictMode`), mounts the element demo into the second one, each further example
    into its panel (a React root each), and calls `setupUi(this)`; on disconnect it cleans up.
  - `GroupingDemo.tsx` (the "Row grouping" tab): the users grouped by country (`groupBy="country"`, no country
    column), 25 per page (page sizes 10, 25, 50, 100, 250), sorted by last name within the countries, searchable, text and role filters, a multi-row
    action ("Send message", a toast), striped, `selectableGroups` (a checkbox in every group header). The source is
    `fetchUsersByCountry` (`data.ts`: sorted by country
    first, with the totals of the groups). Selectors: "Group totals" (from the source, or page only) and "Group
    header" (default, or a custom `renderGroup`).
  - `ReorderDemo.tsx` + `tasks.ts` (the "Row reordering" tab): a backlog of 24 tasks in the order of their priority,
    kept in memory (`tasks.ts`: the source, 500ms, and the save of a move, 300ms), 10 per page, searchable, a status
    filter, a multi-row action ("Mark as done", a toast), striped, row details for 10 of the tasks (a note each; the
    others have none). A "Saving" selector (`succeeds`, `fails`: the save
    rejects, and the page is loaded again), and a line with the last move.
  - `GroupedReorderDemo.tsx` + `agenda.ts` (the "Grouped reordering" tab): an agenda whose items are all in sections
    (`groupBy="section"`, `reorder`), kept in memory (`agenda.ts`: the sections with their items; the source, 400ms,
    with the totals of the sections; the saves, 300ms): "Opening", "Reports", "Proposals for decision", "Closing"; one
    page. Items are moved within a section or into another one. "Delete section" (a group action, a trash icon)
    deletes one, its items go to the blank group (section `''`, "(Blank)", at the end); a line with the last move.
  - `ElementDemo.ts` (+ `element-demo.css`): the custom element tab, plain TypeScript with DOM nodes as content: the
    same users, `setupDataNavigator` with the demo's i18n factory, text, select and autocomplete filters, a role badge (a node per
    row, styled by the demo's global CSS), a rows action, switches for density, striped and searchable, and reload,
    clear selection and the selected rows (`onSelectionChange`). Titles, headers and labels are functions, so they
    follow the language.
  - One plain demo (`Demo.tsx`) for all themes, with no UI library: plain elements, a small toast for the actions
    (`Toasts.tsx`) and inline SVG icons (`icons.tsx`, Tabler paths).
  - The Theme selector at the top switches between Default, Soft, Mantine and Ant Design. It starts with Default.
    - The demo creates one data navigator per theme at module level (`createDataNavigatorComponent({ i18n, theme })`,
      all with the same adapter: `demo/i18n.ts` exports `i18n` as `{ type: 'factory', getAdapter: () => adapter }`) and
      shows the one of the chosen theme.
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
  - The Row actions selector (`rowActionLook`: Icon, the default, Label, Icon and label): how the action column shows
    the row actions "Edit" and "Delete" (both have a label, an icon and a tip).
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
  - `npm run dev:preact`: the same demo on Preact (both tabs; `vite --mode preact`, the aliases of the element's
    build), to see at once when something does not work with `preact/compat`. The unit tests run on React only.
  - `npm run build`: typecheck + library build in two steps: `dist/react.js`, `dist/themes.js` and the stylesheet
    `dist/data-navigator.css` (React and Base UI outside), then `--mode element`: `dist/index.js` with everything
    bundled in (Preact as React, about 101 kB gzip; the stylesheet is inside)
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
  - The only hard-coded values are in the default and the soft theme (`src/themes/default.ts`, `soft.ts`). The
    stylesheet has none.
  - No new theme values for one widget (e.g. the calendars of the date range filter): a widget uses the existing
    ones. The theme stays a small set of general design values.
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
- Custom properties: only the internal `--datnav-*` ones (one per theme value), set from the theme. No other custom properties of our
  own, and none for passing other runtime values to the stylesheet either: set the real property inline instead.
- No `!important`. Never remove focus outlines. Every button and input has a `:focus-visible` outline in
  `--datnav-color-focus`.
  - The one exception: the items of a menu (the toolbar's menus, the context menu). Their highlight background
    (Base UI's `data-highlighted`, `--datnav-color-surface-strong`) marks the item of the keyboard, like in a native menu. Base
    UI moves the focus to the item under the pointer too, and after a key press the browser counts that as keyboard
    focus, so an outline came and went on hover.
- The library build emits one stylesheet (`dist/data-navigator.css`). Apps import it, like Mantine's `styles.css`.

## Look and feel

- `striped?: boolean` (default `false`): a zebra look on the data rows.
  - Off by default: rows have no alternating background colors.
  - The tint starts on the first data row, then every other one. A striped row and its detail row are one unit, as
    they are for hover and selection.
  - The tint is `--datnav-color-hover` (the subtlest gray of the library). Selection and hover always win over it: the
    stripe rule is wrapped in `:where()`, so it weighs one class only.
  - Every row hovers with `--datnav-color-surface-strong` (one shade over the stripes), striped or not, gray or white rows
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
  - The values map onto the spacing values: `calc(var(--datnav-spacing-xs) / 3)` (2026-10-05, the user's wish: a tiny
    bit less; `/ 2` before), `--datnav-spacing-xs`, `--datnav-spacing-md`.
  - In `compact`, the column headers get a little more vertical padding than the data cells (3/4 of `spacingXs`
    instead of a third of it), so a header (often a click target) does not look squeezed.
  - The root element carries `data-density`, and the stylesheet does the rest (with `:where()`, so more specific cell
    classes like the group header keep their own padding).
  - Toolbar and footer change in `compact` only, both flatter, with controls of 0.875 × `controlHeight`; their text
    has the table's size (`fontSize`; 2026-10-05, the user's wish: one size; a size between `fontSizeSm` and
    `fontSize` before, 13px next to the rows' 14px):
    - Toolbar: `spacingXs` above, below and between its lines (instead of `spacingSm`; the sides stay), smaller action
      and menu buttons and search field. The title and the subtitle keep their sizes in every density (2026-10-05, the
      user's wish: density changes spacing only; the title was 1.1 × `fontSize` in compact).
    - Footer: less room around it (`spacingSm` above instead of `spacingMd`, `spacingXs` below). (The pager is small
      in every density since 2026-10-05, the page size a ghost button of the toolbar's size.)
    - The heights are set on those controls directly (the stylesheet only reads the theme's custom properties and never
      sets one).
- Animations (decided 2026-09-28): short and subtle, and none at all with the system's reduced motion setting
  (`prefers-reduced-motion: reduce`: one rule at the end of the stylesheet turns off every animation and transition
  inside the root; the loading bar then stands still).
  - The bar and the selection bar: see the toolbar. Popups (menus, selects, the filter popup, the date popover) fade in
    with a tiny downward move (120ms). Rows fade their background when they are selected or hovered (120ms), buttons
    on hover (100ms).
- Pressed state: buttons (toolbar, row, pager, details toggle) and sortable headers get a darker background while
  pressed (`:active`): their hover or fill color with 10% (filled buttons: 15%) of `--datnav-color-text` mixed in.
- Sortable column headers get a light gray, rounded shape on hover (only on devices that can hover).
  - The whole header cell is the click target for sorting, not only the text. It gets `cursor: pointer`.
  - Headers that cannot be sorted, and group headers, have no hover: they are not clickable.
  - The hover only covers the lower cell of a column (that is why ungrouped headers do not span two rows).
  - The shape is `--datnav-color-surface-strong` with `--datnav-radius`, 3px inside the cell, behind the text (a `::before` of
    the cell). The whole cell stays the click target, and the line below the header stays straight.
  - The default theme's color is a light gray (`#efefef`, dark `#262626`).
- Header look: no gray band, in every mode (striped or not): the header shows the plain surface color
  (`--datnav-color-surface`), with bold text and a 1px line below it.
  - The header text is muted (`--datnav-color-text-dimmed`); the sorted column is the only one in the full text color
    (`data-sorted`). (Decided 2026-09-28, with the filter popup. Before, the arrow was the only marker.)
  - It is not transparent: it stays opaque, so scrolled rows never shine through the sticky header.
  - With `selectionAppearance="accent"` (2026-10-04, the user's wish) the hover shape and the pressed shape of a sortable
    header are light accent tints too: the hover is `--datnav-color-selected` (the tint of the selected rows), the pressed
    shape `--datnav-color-hover-accent` (the tint of the hovered rows). (A first try: the hover-accent tint for the hover and
    the same with 10% of the text color for the pressed shape: a bit too dark, the user said.) The neutral appearance
    keeps the grays (`--datnav-color-surface-strong`).
  - The hover shape of a sortable header (`--datnav-color-surface-strong`) lies on the surface, so a theme may map it onto
    a translucent color (antd does).
  - Before, the header had a light gray band (`--datnav-color-surface-strong`), and only striped mode gave it up. The user wants
    no band at all. `--datnav-color-surface-strong` is now only used for other soft gray areas (the item highlight of menus and selects,
    the hover of the ghost buttons, the track of the segmented control, the role badges of the demo).
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
- Sort arrow: the sorted column always shows its arrow (up or down), and its header is in the full text color (the
  other headers are muted); no background.
  - The up/down icon of a sortable column that is not sorted is always shown, but faint (`opacity: 0.45`); it is clear
    while its header is hovered or has keyboard focus. (Before, it was only visible on hover or focus, and always on
    touch devices.)
- Empty state: `empty?: ReactNode`. It replaces the default when given.
  - Default: no icon, only the text `Texts.empty` ("No entries"), centered and dimmed, in one cell that spans all
    columns. (Before: a database icon above the text; removed by decision, the default is "no icon".) Custom content
    is not dimmed.
  - It is shown only when a load has finished and returned no rows (never before the first load).
  - It has no line below it, for the default content and for a custom `empty` (decided 2026-09-29, again: it had
    none for a while, then the line of the last row for a while).
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
- Selection color: `selectionAppearance?: 'neutral' | 'accent'` (default `'accent'`, since 2026-09-28: the design of
  the selection bar wants selected rows in a light accent tint with checkboxes in the accent color; it was
  `'neutral'`; the element's attribute `selection-appearance` follows).
  - `neutral`: `--datnav-color-surface-strong`, a light gray tint. The row hover is stronger than it
    (`--datnav-color-surface-strong`), so a hovered row stands out even when it is selected (the default theme swapped the two
    grays for that: selection `#eee`, hover `#e4e4e4`).
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
  - The color is `--datnav-color-surface-strong` (with `accent`: `--datnav-color-hover-accent`).
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
  - The border of an unchecked checkbox in a hovered row is the one of a selected checkbox (2026-10-04, the user's wish:
    `currentColor`, the checkbox's own color: the primary color, or the gray of the neutral appearance; in both
    appearances; a first try took the line color of the accent hover and was not what was meant). A checked one has it
    anyway. (A test skips these rules: they are about the checkbox, not the row's cells. Write them with chained
    `:not()`, no commas inside: the test splits the selectors at commas.)
  - The rows have a transparent line of 1px on their outer sides (2026-10-04, the user's wish): `border-inline-start` on
    the first and `border-inline-end` on the last cell of a row (logical, so right-to-left works; also on the header and
    the group rows, which are cells too, so the select-all checkbox still lines up with the row checkboxes). On hover and
    with a selection the line takes the color of the row's lines on top and at the bottom (hover: `--datnav-color-border`,
    with the accent appearance `--datnav-color-selected-border`; selected: `--datnav-color-border`, accent
    `--datnav-color-selected-border`), so the row is framed. Only the color changes, never the width: nothing shifts. A detail
    row's single cell has both. (A real border and no inset shadow: a transparent border is what was asked, and a border
    follows the writing direction.)
  - A hovered row also gets a line on top and at the bottom (`--datnav-color-border`, the normal
    lines in the default theme; with `selectionAppearance="accent"` `--datnav-color-selected-border`, the line color
    of the accent selection, to go with the accent hover, since 2026-09-29), around the data row and its detail
    row together, whichever of the two is hovered.
    - The top line overlaps the line of the row above (negative margin, like the selection border), so nothing
      shifts and the row does not grow.
    - The first row gets no top line: the line of the header is right above it, and a line of its own could not
      overlap it (the sticky header paints above), so the row would grow on hover.
    - Selected rows keep their own lines. In striped mode (no row lines) the hover lines appear all the same.
  - Only on devices that can hover (`@media (hover: hover)`), so touch devices show no sticky hover.
- Meta columns (drag handle, selection, details toggle) sit close together (decided 2026-09-29; before, each had the
  full cell padding on both sides): half of xs on the sides that face another meta cell, the normal padding (sm) at
  the start of the first one and at the end of the last one. Every meta cell (data, detail, header and group rows)
  carries `data-meta` with its outer edges (`first`, `last`, both, or empty), so they all align.
- Separators: horizontal lines between rows and under the header, no vertical lines between data columns.
  - All horizontal lines of the table are `colorDivider` (2026-10-05): the lines between the rows, the line under the
    header (the user's wish, the same day: `colorBorder` looked heavy at a display scaling of 125%, where every 1px line
    falls between device pixels and is smeared over a second one; it was `colorBorder`, stronger than the row lines)
    and the line at the bottom of the rows.
  - One vertical line: before the action column (`data-divider="start"` on its cells, `border-inline-start` in
    `colorDivider`), through the data rows and the detail rows; not in the header and not on group rows. A selected or
    hovered row (with its detail row) shows none: only its color goes (`transparent`), never its width, so nothing
    shifts.
  - None after the meta columns (selection, details toggle, handle). History (2026-10-05, the user's wishes): both lines
    (after the meta columns, `end`, and before the action column, in `colorBorder`) were removed in the first step of
    the look's rework; the one before the action column came back a few hours later, lighter: it sets the actions apart
    from the data, while the one after the meta columns was not missed.
  - A line at the bottom of the rows area (2026-10-05, the user's wish; like the line under the header, but in
    `colorDivider`), also where the rows scroll (a table of a limited height), so they never end open. A 1px line laid
    over the bottom edge of the rows area (`.scrollArea::after`, `z-index: 2`, above the fixed cells): where the rows
    do not scroll it covers the last row's own line exactly, never a double line. It adds nothing to scroll. (First,
    the same day: the scroller's bottom border with `margin-bottom: -1px` of the table; the cut-off line was content
    to scroll, so every table had a scrollbar for 1px.) None below the empty state and below cards. It spans the
    scrollbar's reserved space too (a few pixels wider than the row lines).
  - No outer border.
- Search: `searchable?: boolean` (default `false`) shows a search box. There is no initial search text (no
  `defaultSearch`), and there will be no initial filters either (no `defaultFilters`): the initial state of the search
  and of the filters is always empty.
  - The text goes to `source` as `Query.search: string` (trimmed, `''` when empty). `source` does the searching.
  - The box sits at the start of the toolbar's bar (see the toolbar), growing with the table up to 22.5rem: search
    icon on the left, a clear button on the right while there is text. Placeholder and labels are texts
    (`searchPlaceholder`, `clearSearch`). (It was at the right end, 16rem wide, before the filter popup.)
  - Only Enter searches: what is typed is a draft, like in a text filter (no search after a pause in typing, and none
    when the box loses its focus). Escape, the clear button and emptying the box by hand remove the search at once.
  - Before, typing searched after a pause of 300 ms. The user wants a new load only on Enter.
  - A new search goes back to page 1 and clears the selection (like sorting).
  - The box stays usable while loading (everything else is blocked), so it does not lose its focus while the user types.
    A newer search replaces a running one, and the response of the outdated one is ignored.
  - If a search finds nothing, the default empty state says `Texts.emptySearch` (a generic text that does not contain
    the search term, e.g. "No results found") instead of `Texts.empty`; with any filter active, `Texts.emptyFilters`
    (see Filtering). A custom `empty` always wins.
  - The toolbar is shown when the component is searchable, even without title and actions.
- No text selection around the data: the toolbar (title, subtitle, buttons, pills), the header (column headers, group
  headers), the header bands of the row groups (`.groupRow`, since 2026-10-01), the footer, the filter view and the
  empty state (its text and a custom `empty`, since 2026-10-01) have
  `user-select: none`. Text inputs inside (search box, page number,
  the text and number inputs of the filters) stay
  selectable (`user-select: text`).
  - Cell text can be copied, one cell at a time (2026-10-04): `.table` has `user-select: none`; on `pointerdown` the view
    marks the cell under the pointer (`data-selecting`), and only a marked cell has `user-select: text`, so a drag
    never reaches the next cell. A cell with an input (the edit form) is always selectable.
- Reload: `reloadable?: boolean` (default `false`, the element's attribute `reloadable`) shows a Reload button.
  - It sits at the start of the bar, before the search box, and stays there without one (see the toolbar; since
    2026-09-29, it was on the right next to the filter button). An icon-only ghost button (the
    secondary variant, Tabler's `refresh`), with the tooltip and accessible name `Texts.reload` ("Reload"). Its icon
    turns while loading.
  - It does the same as the controller's `reload()`: the current page again with the same query; selection and
    details are cleared.
  - Blocked while loading, like the rest of the toolbar. The toolbar is shown when the component is reloadable.
  - To be reviewed (see "Todo"): whether being reloadable should come from the source instead of a prop.
- Toolbar and footer: plain, with no background and no lines of their own.
  - Both have a padding of `--datnav-spacing-sm` on all sides. The footer has a little more room on top
    (`--datnav-spacing-md`), between the table and the footer.
  - The pager buttons (previous, next) are text-only icon buttons. A disabled one has a transparent
    background (no gray box): it is only faded (`opacity: 0.4`, in the normal text color), with the `not-allowed`
    cursor.
- Cards in a narrow table (2026-10-05, the user's wish; a first step, details TBD, see "Todo (later)"): below a
  width of the data navigator of 576px (`CARDS_BELOW` in the view, 36rem at a 16px root; fixed, no prop yet) its rows
  are cards instead of a table. The width is the root's (`useNarrowerThan` in `hooks.ts`, a `ResizeObserver`, measured
  before the first paint), not the window's: a table in a drawer or a narrow column gets cards too. Without a width (not
  laid out, jsdom) it is a table.
  - The view renders a list instead of the grid (`renderCard`, `renderCardGroup`; the root carries `data-cards`), with
    the same hook, actions, handlers and texts. Chosen over a CSS-only change of the grid (a container query): every
    cell would need a hidden copy of its header as its label, and the roles of the grid would not match what is shown.
  - The list (`role="list"`, the trigger of the context menu like the grid) has as many columns of cards as fit, each
    card at least 20rem wide (`repeat(auto-fill, minmax(min(100%, 20rem), 1fr))`, 2026-10-05, the user's wish): one in a
    narrow table, two or more with "Cards" chosen in a wide one. The cards fill a line from left to right; the cards of
    a line are equally high; group headers and the empty state span all columns. Each card has its own two columns,
    the labels (as wide as its widest) and the values. (First the same day: one column, with the labels of all cards
    lined up by a subgrid of the list; that cannot work with several columns of cards. At most two columns with lined-up
    labels was weighed: four tracks and a fixed switch point, more rigid.)
  - A card (`role="listitem"`, `data-row-key`, `data-selected`): a bar on top (only when there is something for it):
    the selection checkbox or radio (its free space a click on it, like the selection cell), the details toggle (only
    for a row with details) and the row actions at the end (`rowActionLook`); then one line per shown column, its
    header as the label (dimmed) and its content as in a cell (`render`, else the value; the text wraps); the row
    details at the end, below a line. The selection is told by the checkbox (no `aria-selected` on a list item).
  - Framed (`--datnav-color-divider`, `calc(2 * --datnav-radius)`), on the surface color; hovered and selected like a
    row (`--datnav-color-surface-strong`, with the accent appearance `--datnav-color-hover-accent` and
    `--datnav-color-selected`), the frame then in the line color of the selection (`--datnav-color-border`,
    `--datnav-color-selected-border`). The pointer cursor where a click selects. The checkbox like a row's: on a
    hovered card the border of an unchecked one takes its own color (the primary color, with the neutral appearance the
    gray; 2026-10-05, the user's wish), a selected one is checked anyway; with the neutral appearance the cards'
    checkboxes are gray, like the rows' (`.cardSelect > .check`, `.cardGroup > .check`).
  - The same row click, Ctrl/Cmd and Shift click, double click (default action) and context menu as a grid row: the
    bar, the labels and the values are the direct children of the card, so their free space is the row's
    (`isRowTarget`), their content is not.
  - Group headers (`groupBy`) are lines between the cards: the group checkbox (`selectableGroups`), the toggle (the
    same as the grid's, `groupToggle`) and the group actions.
  - The empty state is a line of the list. The toolbar, the selection bar, the pills, the filter view and the footer
    stay as they are (the footer's own narrow pager comes below 28rem).
  - The edited row is its edit form, in the place of its card (no folding animation); a new row's form comes first.
  - The layout can be chosen in the column menu (2026-10-05): a group "Layout" (`Texts.layout`) at its top, radio
    items "Automatic" (the default: cards below the breakpoint), "Table" (always; a narrow table scrolls sideways) and
    "Cards" (always), with a check at the chosen one; the menu stays open. Not kept after a remount (like the hidden
    columns). While the rows are cards, "Optimize column widths" and "Reset column widths" are disabled. (Weighed: one
    checkbox "Show as cards", which could not tell automatic from always a table; an icon button of its own in the bar,
    one more button.) The menu widget: `choice` of `ToggleMenu` (Base UI's `Menu.RadioGroup` in a `Menu.Group` with
    its label; `.menuGroup` has no box, so the items line up with the others).
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
  `aria-hidden`. The pager buttons: `chevron-left`, `chevron-right` (`chevron-left-pipe` and `chevron-right-pipe` for
  first and last until 2026-10-05, gone with the page numbers). The filled Material arrows were tried and dropped: they did not match the line style of the other icons.
  - The filter button's icon is `VscFilter` (react-icons, the Codicons of VS Code, filled, 16×16; Tabler's `filter` until
    2026-10-04, the user's wish). Codicons are CC BY 4.0 (attribution required, unlike the MIT Tabler and Bootstrap icons).
  - The filled icons (`filledIcon` in `icons.tsx`: the sort arrows, the calendar, the filter, the column menu) have
    `overflow="visible"` (2026-10-05): their shapes reach the very edge of their grid, and at a fractional position (a
    display scaling of 125%) the SVG's box cut their outer line (the date range filter's calendar looked clipped).
  - The sort icons are the filled Bootstrap arrows (MIT, 16×16): one arrow with a head at both ends
    (since 2026-09-29; it was `BsArrowDownUp`, two arrows side by side; our own path: the heads of `BsArrowUp` and
    `BsArrowDown` on one line, since Bootstrap's `BsArrowsVertical` has smaller heads) for a sortable column that is
    not sorted,
    `BsArrowUp` and `BsArrowDown` for the sorted one. They replaced the Tabler chevrons (and before that a
    chevron pair of our own).
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
- Column visibility (decided 2026-09-29): a column toggle menu, derived from the columns (like the selection mode from
  the actions): `Column.hideable?: boolean` puts a column into the menu, `Column.hidden?: boolean` is its start value
  (only on a hideable column: otherwise it could not be shown again). The same options on the element's columns.
  - The menu is always there (2026-10-04, since it also has the column width actions, see "Column width"): in a table
    without a hideable column it has only those, with no separator and no checkboxes.
  - Columns without `hideable` are always shown and not in the menu (e.g. the key column). A table prop
    (`columnToggle`, every column hideable) was considered and not taken: the app could not protect a column.
  - Look: an icon-only ghost button (Bootstrap's `BsLayoutThreeColumns`, filled, 16×16, like the sort arrows; Tabler's `columns-3` at first;
    `data-placement="tool"`), named and tipped `Texts.columns`
    ("Columns"), at the very end of the bar, after a divider. Hidden in the selection bar, like the other view
    controls. Usable while loading (it only changes the view).
  - The menu (`ToggleMenu` in `widgets.tsx`, Base UI's `Menu` with `Menu.CheckboxItem`): first the layout (radio items,
    since 2026-10-05, see "Cards in a narrow table") and a separator, then its actions (plain items,
    "Optimize column widths" (our own `fitWidth`: a double arrow between two bars) and "Reset column widths" (`arrow-back-up`, disabled until a column was resized), each with an icon in the checkboxes' place; they close the menu), then a separator (only when
    there are checkboxes too), then one item per hideable column,
    in the order of the columns, its header as the text and a checkbox in front (only a picture of the state, gray,
    like in a multiple select). It opens below the button, aligned to its end, and stays open while items are
    toggled (Escape or a click outside closes it).
  - The last shown column cannot be hidden: its item is disabled (half transparent).
  - Groups: the items are the leaf columns. A group whose columns are all hidden is left out (`withoutHidden` in
    `layout.ts`), so its header goes too.
  - Filters: a hidden column keeps its filter, its pill and its row in the filter view (the filters use all
    columns). The sorting stays too.
  - Not kept: after a remount the table starts again from `hidden` (like search and filters, which always start
    empty). Keeping it (e.g. in the URL or the storage) may come with the controlled query state.
- Column width: `width?: number | string`.
  - A number is a ratio relative to the sum of all the numbers (`fr`), shared out of the free width.
  - A string is a CSS length (decided 2026-09-30), a fixed track of the grid, e.g. `'3rem'` for a number column
    (with ratios only, a narrow column got too little room in a narrow table). The same on the element's columns.
  - Widths stay identical when the page changes.
  - Columns can be resized by mouse (2026-10-04): a handle (`ColumnResizer`) at the end edge of every leaf column's
    header, a thin line in a light accent (`--datnav-color-selected-border` at 70% opacity; the primary color at 80% while it is dragged), 3px wide (the grab area is the handle's 10px, 5px either side of the edge; the line is centered on the edge, so half a pixel either side: a little soft on a screen without a high pixel density) and high (from 10% to 90% of the header), centered on the edge between two columns (its header goes above the next one while the line shows: a sortable header is a stacking context of its own, which would hide the half of the line over the next header) (half of it over the next header cell) and shown only while the pointer is on the handle itself (the cursor is `col-resize`; not on the whole header's hover, 2026-10-04, the user's wish) and while dragging; then no header shows its hover shape (the line is the only feedback; the shapes of neighboring sortable headers are 10px apart). Always on; `resizable: false` on a
    column leaves it out (e.g. a narrow icon or number column with a fixed `width`). Not on group headers and the
    meta and action columns.
    - Only the dragged column changes: it gets a pixel track (`gridTemplateColumns`), so the table may become wider
      than its view and scroll horizontally (the scroller does). When a drag starts, the columns without a width of
      their own are fixed at what they are then (`freezeColumns`, measured, in pixels; 2026-10-04): the `fr` tracks
      would else share out the free width again with every step, and all columns would change with the dragged one.
      After that, the table no longer fills its view by itself; "Optimize column widths" does that again.
    - At least 64px; a double click gives the column its own `width` back. The widths are not kept after a remount
      (like the hidden columns).
    - "Reset column widths" in the column menu gives all columns their own `width` back (`Texts.resetColumnWidths`).
      "Optimize column widths" (`optimizeColumnWidths` in `useDataNavigator.ts`) sets every resizable column to the width
      its content needs now: the table is laid out once with `max-content` tracks (the rows of the page and the
      headers count), the header cells' widths are read, and the template is put back at once (no paint between). At
      least 64px, at most 480px (`MIN_COLUMN_WIDTH`, `MAX_OPTIMAL_COLUMN_WIDTH` in `utils.ts`): a column with long
      texts would else take the whole table. The widths are minimums that grow (`minmax(<px>px, <px>fr)`): the free width
      is shared in proportion to them, so the table keeps filling its view, also when it is resized. A dragged column
      is a fixed pixel width instead. A one-time action: later pages, filters and searches do not change it.
      A column with `resizable: false` is left as it is.
    - Fixed columns (2026-10-04): when the table is wider than its view, the control columns (handle, selection,
      details) stay at the start and the action column at the end (`position: sticky`, `data-sticky="start"|"end"`
      on their header and row cells; the data columns scroll between them).
      - The start columns' offsets are the widths of those before them (`useStickyOffsets`, measured from the header
        cells with a `ResizeObserver`, set inline as `insetInlineStart`); the action column is `inset-inline-end: 0`.
      - The cells are opaque (`:where([data-sticky])` sets the surface color; the stripe, hover and selection colors
        win over it, so a theme's colors for those must be opaque too: a translucent one lets the scrolled cells shine
        through on a hovered or selected row).
      - A soft shadow (`--datnav-color-border`, no `color-mix`: the stylesheet test allows it only for pressed states)
        sits on the innermost start column and on the action column, only while content is scrolled away behind them
        (`data-overflow-start`/`data-overflow-end` on the scroller, `useScrollEdges`).
      - Not fixed: group rows, detail rows, the edit form and the empty row (they span the columns and scroll along).
        The shadow is physical (left/right): not right for right-to-left yet.
    - Pointer only for now: the handle is `aria-hidden`, since a labeled one would become part of the header's
      accessible name. Resizing by keyboard is open.
    - The handle's click does not reach the header (it would sort the column).

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
  - The loading indicator is shown only after a short delay (about 200 ms, not immediately), to avoid flicker.
  - It is a thin bar in the accent color, no spinner (decided 2026-09-29; a spinner in the primary color, centered in the rows area,
    before): 1px high (2px at first), across the whole width at the top of the rows area, right below the column headers. Its track
    is `--datnav-color-selected`, a segment of 30% in `--datnav-color-primary` slides from left to right (gray at
    first: `--datnav-color-surface-strong` and `--datnav-color-text-dimmed`; the user wanted the accent color)
    (2.4s per pass, again and again; 1.2s at first, too fast; it stands still with reduced motion). `LoadingBar` in `widgets.tsx`, `role="status"`,
    named by `Texts.loading`. It covers nothing, and works with any height of the table.
  - All user interaction is prevented while loading, from the very start (also during the delay). The exceptions are
    the search box (see Search) and the filter button with the filter view (see Filtering).
  - The loading overlay never covers the header (the toolbar, the column headers and the footer stay undimmed).
    - It only covers the rows area below the column headers: the rows are dimmed to `opacity: 0.3`, and the bar sits
      at the top of that area (the overlay takes no pointer events).
    - The rows stay visible under the dimming, as before.
  - A minimum height of the rows area, six times the medium spacing token (`calc(6 * var(--datnav-spacing-md))`, 96px
    by default), so the table does not collapse to the header alone while the first load runs. (The overlay had one
    of its own for the spinner; the bar needs none.)
  - If the parent gives the component even less height, the component overflows it: the minimum height wins.
- Row selection has three modes: none, single, multi. There is no `selection` prop: the mode is derived from the
  actions.
  - Any `multiRow` action (also inside a menu) means multi. Otherwise any `singleRow` action shown in the toolbar
    (`show: 'toolbar'` or `'both'`, also inside a menu) means single. Otherwise none: general actions and row actions
    that only live in the action column need no selection.
  - Only the action definitions decide, never what is visible at the moment. A `multiRow` action that is hidden because
    nothing is selected yet still means multi, so the checkboxes are there to select something.
  - If a row should be selectable one at a time, make the action a `singleRow` action.
  - A later controlled selection (see Open) may need an explicit way to select without actions. Adding an optional
    `selection` prop back then is not a breaking change.
  - The table owns the selection. There is no `selected` prop for now. Actions receive the selected rows.
  - The selection is cleared when the page, the page size, the sorting, the search or the filters change, and on a
    reload. So the selection never spans pages. (Decided 2026-09-29, again: a selection across pages, kept on paging,
    the page size and at first the sorting, was tried on 2026-09-28 with the selection bar, and dropped by the user.)
    The table keeps the row objects of the selected rows (a newer object from a later load replaces the older one).
  - Multi-row actions receive the selected row objects of the current page, in the order they were selected.
  - The select-all checkbox: empty, partial (–) or full for the rows of the page; a click selects them all or none.
  - Escape clears the selection, when nothing else takes it: not in a text input, not in an open popup (a menu or a
    select; their Escape bubbles up to the root through the portal, and they close first). The selection pill and
    the "deselect" button at the end of the selection bar clear it too.
  - Multi uses checkboxes (with a select-all checkbox in the header). The whole selection cell is clickable, see the
    row click below. The same for the select-all cell: its free space is a click on the select-all checkbox (with the
    pointer cursor, while there are rows).
  - Without column groups, the select-all checkbox is centered vertically in the header (on the center line of the
    column titles, which sit at the bottom of their cells). With groups, it stays at the bottom, next to the lower
    header row.
  - Single uses radio buttons.
  - Clicking a data row selects it (row click):
    - Single mode: the row becomes the selected row. Clicking the selected row again keeps it selected.
    - Multi mode, like in a file manager (decided 2026-09-29; before, a plain click toggled the row):
      - A plain click selects only this row (all others are deselected) and makes it the anchor of Shift + click.
      - Ctrl/Cmd + click toggles the row (selected or deselected), and keeps the others.
      - Shift + click: block selection (below).
      - The checkbox of a row always toggles it, whatever the row click does. On touch devices (no Ctrl/Cmd) it is the
        way to select several rows one by one.
      - So the first click of a double click already leaves the selection the double click ends with (see the
        default action), and nothing flashes.
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
    - The two meta cells are not control cells, and get the pointer cursor like a data cell:
      - The selection cell (checkbox or radio, `data-select`): its free space is a click on the checkbox or radio
        (decided 2026-09-29; before, it was a row click), so a click a few pixels beside it still hits. In multi mode
        it toggles the row and keeps the others, with Shift + click for block selection; in single mode it selects
        the row. It is no row click, so a double click there does not run the default action.
      - The details toggle cell (chevron): clicking its free space is a row click.
      - The checkbox and the chevron inside them are their own click targets, so each still does its own job exactly
        once: the checkbox toggles the selection, the chevron only expands, and neither goes through the cell as
        well.
    - A click that ends a text selection made with the mouse does not count either.
    - The free space of a cell gets `cursor: pointer`, in data rows and detail rows alike, but only when a row click
      actually selects: the root carries `data-selection` with the mode, and the stylesheet keys off `single` and
      `multi`. Everything a cell shows keeps the normal caret (one rule on the children of a cell), since `cursor`
      inherits and a value set on the content itself wins over what it would inherit. Links in a cell
      (`a:any-link`, also deeper inside custom output) keep `cursor: pointer`.
    - The checkbox or radio stays the way to select with the keyboard.
  - Block selection (multi mode only): shift + click changes a range of rows, like in Gmail.
    - The range goes from the anchor row (the row that was clicked last) to the shift-clicked row, both included, in
      the order shown on the current page.
    - The range gets the state of the anchor row: if the anchor row is selected, the whole range becomes selected.
      If the anchor row is deselected, the whole range becomes deselected.
    - Rows outside the range keep their state.
    - After a shift + click, the shift-clicked row is the new anchor, so the next shift + click extends from there.
    - It works for a row click and for a click on a row's checkbox.
    - Without an anchor (or when the anchor row is not on the page), a shift + click toggles the row, like
      Ctrl/Cmd + click. A shift + click on the anchor row itself toggles it too.
    - The anchor is forgotten whenever the selection is cleared (sorting, filters, page or page size change).
    - Shift + mouse down must not select text in the browser (except in text inputs inside cells).
    - Single mode and no selection mode ignore the shift key.

- The footer only when it is needed (decided 2026-09-30): `footer?: 'always' | 'auto' | 'never'` (default
  `'always'`; `FooterMode`; the element's attribute `footer`, reflected like `density`).
  - `always`: as before, whenever data rows are shown. `never`: no footer at all (for lists that never need a second
    page). `auto`: only when there is something to page or to choose: more than one page, or more rows (`total`) than
    the smallest page size option. So a short list (a dialog's list, an agenda) ends with its last row.
  - Decided from the last load (the result stays while a new one runs), so the footer does not flicker during a load;
    a search or a filter that shrinks the result to one page does take it away with `auto` (accepted: that was the
    trade-off against `paging={false}`, a list without paging, which was proposed as the other option).
  - The demo has a "Footer" selector (always, auto, never).
- The default footer (navigation bar) looks like this:
  - `1-50 of 1350        ‹ 1 … 17 (18) 19 … 27 › │ 50 items per page ⌄`
  - The item range is only the numbers (`Texts.itemRange`, `{from}-{to} of {total}`, German `{from}-{to} von {total}`;
    "of" since 2026-10-06, the user's wish, a slash before; 2026-10-05: "Items" once, on the right; it was
    `Items {from}-{to} / {total}`, German `Einträge …`). A range of one item has a text of its own
    (`Texts.itemSingle`, `{item} of {total}`; 2026-10-05, the user's wish): "1 of 1", "21 of 21" on a last page with
    one row, not "1-1 of 1" (one text with an ICU `select` was weighed: the default texts and the demo's adapter only
    replace `{name}` placeholders). In a narrow footer the item range ("11-20 of 57") and the pager ("2 of 6", the pages)
    read alike; accepted for now.
  - Between the pager and the page size the toolbar's divider (`.toolbarDivider`, 1px, `--datnav-color-border`;
    2026-10-05, the user's wish), also with the narrow pager. Lower than in the toolbar (0.4 × the control height,
    half of it there) and without its side margin; the right side of the footer is `spacingXs` apart (`spacingMd`
    before), so the line sits close to the pager and the page size (the user's wish, the same day).
  - Left: item range and total. (The selection pill that was here moved into the selection bar, 2026-09-28.)
  - Right: the pager (previous, the page numbers, next), then the page size at the very end (2026-10-05, the user's
    wish, like Ant Design's pager; before the pager until then): nothing on the right moves while paging. The user
    liked that about the old pager ("Page [18] of 27": always the same width); with the page size before the numbered
    pager, it jumped whenever the pager changed its width. The pager now changes its width only with fewer than seven
    pages (a filter, a search) or a new page size, the user's own action.
    - The page size (2026-10-05, the user's wish: a select drawn by us never matches the selects of the app's UI
      library, so it should not look like a form field): one ghost button, "10 items per page" (`Texts.perPage`) and a
      chevron (turned while the list is open), like the view controls of the toolbar (`.button[data-placement='tool']`,
      `.pageSizeButton`, tabular figures); its text is its name. "Items" (German "Einträge") since 2026-10-05, the
      user's wish ("10 per page" for a few hours; shorter, a matter of taste); the item range on the left has only
      its numbers since.
    - Its menu (2026-10-05, the user's wish): in the look of the other menus (the context menu, the layout choice of
      the column menu): the sizes one below the other, a check at the current one (`PageSizeField` in `widgets.tsx`,
      Base UI's `Menu`, a `RadioGroup` of `RadioItem`s in `.menuWithIcons`, `.menuItem`, `.pageSizeItem` for the
      tabular figures; the group named `Texts.pageSize`, "Page Size", the menu by its button). Above the button, aligned
      to its end (the footer is at the bottom; the button is at its end); another size closes it.
    - Choosing the current size changes nothing and keeps the menu open (`closeOnClick` only on the other sizes; the
      user's wish, it closed it for a moment). Base UI reports it as a change, and the change of the page size cleared
      the selection and went back to page 1 (2026-10-05): checked in `PageSizeField` and in `changePageSize` (the same
      size returns at once). The current size has the normal cursor.
    - History: an outlined select with the label "Page Size" before it (`SelectField`); a ghost select was tried on
      2026-09-29 and dropped (with the old pager); 2026-10-05: proposed and not taken, the select only without its
      border; then the ghost button with the list of a single select (a check at the chosen size), the same day; then
      a menu with the sizes in one row, round like the page numbers in a capsule (the current one filled, then in the
      context menu's gray and bold), dropped the same day for the look of the other menus (the user: "go back to the
      style in the context menu"). (Weighed: the sizes directly in the footer as a segmented row, too wide.)
  - The page numbers (2026-10-05, the user's wish, to make the footer nicer; before: first, previous, "Page [18] of
    27" with a page number field, next, last, chosen for its narrowness; the soft design spec of 2026-09-28 had asked
    for numbers too):
    - Always seven slots once there are more than seven pages (`pagerSlots` in `core/pager.ts`, with its unit test), so
      the pager keeps its width while paging: `[1] 2 3 4 5 … 27` near the start (the current page up to 4),
      `1 … 17 [18] 19 … 27` in the middle, `1 … 23 24 25 26 [27]` near the end; up to seven pages all of them. The first
      and the last page are always there, so there are no first and last buttons.
    - Small and close together (2026-10-05, the user's wish: a denser pager): the numbers, the gaps, previous and next
      are 0.65 × `controlHeight` in every density, the numbers with a side padding of a quarter of `spacingXs`, a
      quarter of `spacingXs` and 1px apart (the 1px since the same day, the user's wish). (Steps the same day: the full control height, 0.875 × in compact, half of
      `spacingXs` apart; then 0.75 ×, the row buttons' size, with half of `spacingXs` as the side padding; then 0.65 ×.)
      Every slot (number and gap) gets the width the largest page number needs, set inline by `Footer`
      (`max(0.65 × controlHeight, <digits>ch + spacingXs / 2)`, `min-width` of a number, `width` of a gap): when the
      digits do not fit, the slots widen all alike, so the pager keeps its width while paging.
    - A number is a ghost button like the pager buttons (`.pageButton`, composes `.iconButton`), with tabular figures; named `Texts.goToPage` ("Page 18"). The current page has
      `aria-current="page"` and is filled like a primary button (`--datnav-color-primary`, text
      `--datnav-color-on-primary`; the light accent tint of the selected rows with the number in the primary color
      before, the same day), the number bold; it keeps that look on hover and does nothing when clicked.
    - Fully round (`border-radius: 999px`, 2026-10-05, the user's wish: a higher radius; `--datnav-button-radius`
      before): the numbers are circles (pills for longer numbers), and previous and next too, so the pager is one row
      of circles. The one round control of the table besides the pills. (Proposed, not taken: twice the button
      radius.)
    - A gap is a dimmed `…` (`.pagerGap`, `aria-hidden`), not clickable, as wide as a page number (2026-10-05; three
      quarters of it before, so the pager grew by the difference when a second gap came, past page 4). So the pager
      keeps its width while paging (see the slot width above). (A field to jump to a
      page, e.g. behind the gap, may come later.)
    - A narrow footer (below 28rem; a container query on the footer, `datnav-footer`, e.g. in a drawer): previous,
      "18 of 27" (`Texts.pageOf`, `.pagerCompact`), next, so it never wraps.
    - Texts: `pageOf` is `{page} of {pages}` now (it was `of {pages}`, after "Page" and the field); `goToPage` is new;
      `page`, `firstPage` and `lastPage` are gone.
  - While a page or a page size loads (2026-10-05, the user's wish: the footer jumped ahead of the rows): the footer
    shows the rows shown, not the requested state: the item range, the current page, the page numbers and the page size
    of the last finished load (`shownPage`, `shownPageSize`, `shownPageCount` of the hook, set when a load succeeds), so
    it changes together with the rows. A failed or replaced load leaves it as it is.
    - What is loading gets a small indicator: the clicked page number after the delay of the loading bar (200ms,
      `spinnerVisible`, so a fast load shows none), the page size at once (2026-10-05, the user's wish: with the delay,
      the chevron first turned back as the menu closed, then the spinner came). The clicked page number (also the target of previous and next, when it is shown) a thin ring
      in the primary color turning around its circle, open at the top (`data-pending` on `.pageButton`, its `::after`);
      the page size button a small turning spinner in place of its chevron (`.pendingSpinner`, as large as the
      chevron). They stand still with reduced motion. (`pendingPage`, `pendingPageSize` of the hook; a new page size
      also goes back to page 1, which shows no ring.)
    - The footer is blocked while loading anyway (`inert`), so nothing else can be clicked meanwhile.
  - All texts are localizable.

- Filtering: a filter view and filter pills (decided 2026-09-28, after a design spec from a chat about the look; it
  replaced the filter row below the column headers). The filter controls themselves stayed (the user likes their
  look): the text input, `SelectField` for the single and the multiple select, the date range trigger with its two
  calendars. They moved from the filter row into the filter view.
  - The filter button (in the toolbar's bar, see the toolbar): a ghost button with a funnel (Tabler `filter`) and the
    label `Texts.filters` ("Filters"; the label since 2026-09-29, it was icon-only with a tooltip), only when at least
    one column has a `filter`. With active filters, its icon is in the primary color, and a small round badge
    (`--datnav-color-primary`, text `--datnav-color-on-primary`) after the label shows their number (hidden from
    assistive technology). No tooltip; `Texts.activeFilters` ("{count} active") is its description.
    It stays usable while loading (like the search box). It shows and hides the filter view, and is pressed
    (`aria-pressed`, `--datnav-color-surface-strong` as its background) while the view is shown.
    - While filters are active (whether the view is shown or not), a small × is joined to it (`.filterButtonGroup`, an
      icon-only ghost button right after it, no line between the two: each has its own hover; a thin line was tried and dropped, it looked like a second kind of divider): it removes all filters at once.
      Its name and tooltip are `Texts.clearFilters` ("Clear filters"). Redundant with "Clear all" of the pills on
      purpose (decided 2026-09-29): the × is where the filters are opened, "Clear all" where they are read.
      - While the view is shown, the × also closes it (its draft is dropped) and gives the focus to the filter button
        (2026-09-29; hidden while the view was shown before, so clearing there took "Clear" and "Apply").
  - The filter view (`FilterView` in `view/FilterPanel.tsx`, decided 2026-09-29): it takes the place of the column
    headers, the rows and the footer while it is shown; the toolbar stays above it, with the pill row too
    (2026-10-04, the user's wish: it was not rendered while the view was shown, as the view shows the same filters, as a
    draft): disabled (`inert`) and faint (`opacity: 0.2`, like the bar's other parts), so the toolbar keeps its height. It has at most as much room as the table, and works the same on a page, in
    a drawer and in a narrow column.
    - The height of the table does not change when the view opens or closes (decided 2026-09-29, the user's idea):
      the grid with the footer (`.tableArea`) and the view lie in one grid cell (`.stack`), so the height is the
      larger of the two. While the view is shown, the table area stays mounted below it, and is faded to 15% (`opacity: 0.15`, 2026-10-04, the user's wish; 0.4 before; a white veil over an
      unfaded table was tried and dropped: it looked the same, but not in a dark theme) and `inert`, the header row(s) too (they were
      invisible, `opacity: 0`, from 2026-10-04 until the view got only as wide as its filters the same day: the header
      next to it would have been missing); the toolbar's disabled parts and the pills fade in the same times as the table area
      (400ms in, 250ms back; 2026-10-04, the user's wish: they switched at once before); a click on it does nothing (it does not close the view, so a
      stray click never drops the draft). (Hidden with `visibility: hidden` until 2026-09-30: seeing only the filters
      looked odd.) Only when the filters need more room than
      the rows (a short table) does the table grow, by that much. The table stays mounted meanwhile: its scroll
      position, expanded rows and state are still there, and closing is instant. (Before, the view replaced the grid
      and the footer, and the table got as high as the filters, usually lower; measuring the old height was
      considered.) The view is opaque (`--datnav-color-surface`: white in the default theme; a stripe-colored gray was tried 2026-10-04 and dropped).
    - Before, it was a popup (Base UI's `Popover`, below the filter button, with an arrow, 20rem wide and at most 24rem
      high; a drawer of the viewport and a panel inside the table were discussed). The user did not like the popup.
    - It is a sheet over the top of the table area (decided 2026-09-30): only as high as its filters and footer, with
      the theme's small shadow (`--datnav-shadow-sm`, since 2026-10-04, the user's wish; the medium one `--datnav-shadow` for a few hours; none from 2026-10-01 to 2026-10-04).
      As wide as its filters, their side padding and the frame, and it ends where the filter button ends (2026-10-04,
      the user's wish, "not full width if not necessary"; `justify-self: end`, the width, a `max-width` of the room
      before the end and `margin-inline-end` set inline by `FilterView`, measured from the button: the button is not at
      the end of the toolbar, the general actions and the column menu come after it), so the nose always points to the
      button; in a narrow table it is as wide as the table, with one column of filters. History: from 2026-09-30 it was
      as wide as the filters at the table's right end (the nose then could miss the button); as wide as the table from
      2026-10-01 (the user's wish) to 2026-10-04. More room above the filters (24px, 1.5 times `--datnav-spacing-md`) and below the buttons (20px; 16px and 12px
      before; 2026-10-04, the user's wish). The side padding of the body and the
      footer is `--datnav-spacing-md` (`--datnav-spacing-sm` until 2026-09-30, too little). It sits a little below the
      toolbar (`margin-top: calc(--datnav-spacing-xs / 2)`, 4px; it was `--datnav-spacing-sm`, which showed the top
      of the table's scrollbar, its faded arrow button in Chromium on Windows, like a bump), with a nose on its top edge
      pointing to the middle of the filter button (`.filterViewNose`, a 10px square turned by 45°, with the frame on
      its upper sides; its distance from the end of the view is measured and kept up to date with a `ResizeObserver`
      on the view and the table, at least 16px from the corners; mirrored for right-to-left; no nose without the
      button; removed and put back 2026-10-04). On opening it unrolls from its top edge down, like a roller blind, and fades in, and the table
      fades out, both in 250ms, `ease-in-out` (2026-10-04, the user's wish; 400ms, 600ms, `linear` and `ease-out` were tried, and `cubic-bezier(0.3, 0, 0.2, 1)` and before `0.2, 0, 0, 1` were tried; sliding down by 8px in 180ms, then 260ms, were too
      subtle; doubled to 800ms on 2026-10-01, then back, too slow with the height animation). Closing plays it back, a
      bit faster (250ms, `ease-in`). The unrolling animates the view's height (2026-10-01, the user's wish; before: a `clip-path` over a
      fixed frame): measured, from 0 and back with the Web Animations API (`FilterView`; CSS cannot animate to an
      unknown height in every browser), so its lower edge, shadow and buttons move down with it; meanwhile
      `data-animating` lifts its min height, keeps its body from scrolling and from shrinking (2026-10-04: the buttons showed first, then the fields) and cuts off what does not fit yet. Closing
      during the opening starts from the height reached. The times are `FILTER_VIEW_OPEN_TIME` and
      `FILTER_VIEW_CLOSE_TIME` (`FilterPanel.tsx`), the table's fade in the stylesheet (`.stack`): the view rolls up and the table fades
      back. Everything else is back at once (the toolbar, the pills, the focus on the filter button); the closed view
      stays only for its animation (`inert`, `aria-hidden`, then removed), and one opened meanwhile is a new one. No
      animation with reduced motion (the view goes at once). (Before, it filled the whole
      table area.)
    - A click outside closes the filter view (2026-10-04, the user's wish), but only while nothing was changed since it
      opened (`!changed`: the draft equals the applied filters; else the draft would be lost by accident, so the click does
      nothing). Not outside: the view, its popups (the layer) and the filter button (it toggles). The click that closes it
      does nothing else (it is swallowed: the faded table acts like a scrim, so a row is not selected by it). Only the
      primary button. `FilterView` listens for `pointerdown` on the document (capture) while it is open and unchanged.
  - It is a `<section>` named `Texts.filters` (no headline), with a line all around (2026-10-04, the user's wish: at the sides too; above and below before), rounded
    at all four corners (`calc(2 * --datnav-radius)`, since 2026-10-04, the user's wish; the bottom ones only before;
    square from 2026-10-01 with the full width), 1px, gray: the color of the lines
    (`--datnav-color-border`), the nose too, on the surface color as its background (white in the default theme; the
    stripe color was tried and dropped). History (2026-10-04, the user's wishes): the color of the lines; darker grays (a theme value
    `colorBorderStrong`, removed again); the accent (the primary color); 2px; a tiny bit of the accent in the
    background (the tint of the selected rows over the stripe color at 20%, as an overlay behind the content: no
    `color-mix()`, the stylesheet mixes colors only for pressed states, and a test checks it, comments included);
    all of it dropped for the gray lines and the plain stripe background ("try grayish"); tried on 2026-09-30: the light
    accent, and the primary color of Apply, 1px and 2px). It is at least
    `calc(6 * --datnav-spacing-md)` high; in a table of a limited height only its filters scroll, the footer stays. The footer follows right after the filters and ends the sheet.
    - The search is not part of the filters (decided 2026-09-29): filters describe a subset worth coming back to (and,
      later, worth saving as a view, together with the sorting and the visible columns), the search is a quick,
      one-off lookup. So the search box stays in the toolbar. (Taking the search into the filter view as a draft
      field was tried and dropped for that reason.)
    - While the view is shown, everything of the toolbar's bar but the filter button is disabled (`inert`) and faint
      (`opacity: 0.2`, 2026-10-04; the dividers between them too, `.toolbarBar[data-filtering] > [inert]`): the Reload button, the search box, the general
      actions and the column toggle menu. The filter button is the way back to the rows (besides Cancel, Apply and
      Escape). So nothing loads into the hidden table meanwhile.
    - Body: one filter per column that has one, in the order of the columns, in one or two columns (never more; as
      many as fit was tried first and looked bad), centered in the view (since 2026-09-29; at its right edge at first)
      (`.filterViewColumns`, `margin-inline: auto`; one column only for a single filter). The button row below has the width of the filters too (plus its side padding) and is centered the same way, with its buttons at its end: so "Apply" ends where the last column ends. When only one column fits (a narrow table), it takes the whole width, and its filters sit at its right end (right aligned, with "Apply" below them): the user found both cases right. A column is as wide as
      a filter: a label of about 4rem and the control (at most 20rem, decided 2026-09-29; a longer label narrows the
      control a little); two when there is room for both, else one. Two filters of a column are `--datnav-spacing-xs` apart (it was
      `--datnav-spacing-sm`). The columns are `--datnav-spacing-sm` apart (it was
      `--datnav-spacing-md`, and columns for 6rem labels: the free room before a short label made the gap look too
      wide). They are CSS columns, like newspaper columns: down the first, then on in the second, and each filter is
      only as high as it is (`break-inside: avoid`). A grid of rows made every filter as high as the tallest of its
      row, which left gaps next to the text filter. A filter: the column header as the label, followed by a dot in
      the primary color (`.filterPanelDot`, 6px) while the filter is set in the draft (2026-09-30, the user's wish:
      the only accent besides Apply; its room is always kept, hidden while not set, so nothing moves) (in the text color since 2026-09-30, like the labels of a form: the muted one was too light in some themes, e.g. Mantine's; in the normal size since 2026-09-29, the small
      one was too small; no fixed width since 2026-09-29, it was 4.5rem, then 6rem) right before its control. Every
      label gets the width of the widest label of the view (measured when the view opens, `scrollWidth`, and set
      inline as the first grid track of every row and in the width of the columns): so every control gets its full
      width (at most 20rem) and the controls line up on both edges. (With each label as wide as its own text, a long
      label, "Date of birth", made its control narrower than the others.) So on the left the label, the filter on the right (the `labelledBy` of the filter is the id of
      that label). Custom filters are rendered there too, as wide as the column of the controls.
    - Footer (`.filterPanelFooter`; no line above it: a full-width one was removed 2026-09-29, one as wide as the filter columns on 2026-09-30, the user's wish), all on the right: `Reset Clear | Cancel [Apply]`
      (2026-09-29): "Reset" (`Texts.resetFilters`), "Clear" (`Texts.clear`) and "Cancel" (`Texts.cancelFilters`) are
      ghost buttons (`data-placement="tool"`, like the view controls of the toolbar); a divider (the toolbar's)
      separates the two that change the draft from the two that close the view; "Apply" after "Cancel", a little more
      room before it.
      - "Reset" and "Clear" are shown only when they would change something (hidden, not disabled): "Reset" while the
        draft differs from the applied filters, "Clear" while the draft has a filter. The divider only with one of them. (Tried before: "Reset" as a quiet text button on the left with a muted "Cancel"; dividers
        between all; `Reset Clear Cancel | [Apply]`; `Reset | Clear | Cancel [Apply]`; `Reset Clear Cancel [Apply]`.)
    - "Apply" (`Texts.applyFilters`, labeled "Apply filters" since 2026-10-01, the user's wish: clearer next to
      "Cancel", and the view has the room; "Apply" before; "Show results" was dropped, since the number of results is not
      known before applying): a filled button in the primary color, like the primary actions of the toolbar
      (`--datnav-color-primary`, text `--datnav-color-on-primary`, normal weight, `--datnav-color-primary-hover` on
      hover; since 2026-09-30, the user's wish: an accent; before, outlined like the secondary actions), as wide as its
      text (side padding `--datnav-spacing-md`). All four buttons of the footer are as high as the filters
      (`0.8 * --datnav-control-height`, since 2026-09-30; Apply had the full control height, the ghost buttons
      `0.875 *`, like in the toolbar). (It was a full-width button in the primary color at first, as the
      spec had it, then only filled.)
    - No live result count (a query may be expensive).
  - Everything changed in the filter view is a draft: the `onChange` of a filter changes the draft (so custom filters
    work unchanged, their `onChange` just means "draft" now). "Apply" and Enter in a text input (not in a select,
    where Enter opens the list) apply the draft, all filters at once (one load), and close the view. "Reset" puts the
    draft back to the applied filters (it undoes the changes in the view), "Clear" empties it (since 2026-09-29; before,
    "Reset" emptied it); neither applies anything, "Apply" does. "Cancel", Escape and the filter button close the view and throw the draft away.
    - "Apply" applies at once. (A delay between closing the view and applying, so the table is seen before its new
      load starts, was tried on 2026-09-29, one second, then 300ms, and dropped.)
    - The draft starts with the applied filters on every opening (the view is mounted anew).
    - The select lists and the date popover are popups of their own (in the layer; their keys bubble up to the view
      through the portal): an Enter or an Escape there belongs to them and does not apply or close the view.
    - The view focuses the first control of the first filter when it opens, or of the filter of a clicked pill. When
      it closes, the focus goes back to the filter button.
  - The pills (below the bar, part of the toolbar): one per active filter, in the order of the columns, then "Clear
    all" (`Texts.clearAllFilters`, a quiet text button, pushed to the end of the row). Nothing is shown without an
    active filter. They wrap onto more lines.
    - The row has a line above and below it (`--datnav-color-border`, 1px, edge to edge over the side padding of the
      toolbar, `--datnav-spacing-xs` inside). As the last part of the toolbar, the toolbar gives up its bottom padding,
      so the line below sits right on the column headers. (Decided 2026-09-29.)
    - Look: outlined (since 2026-09-29; the spec's light accent tint, then a gray fill like the selection pill were
      tried first): a gray border (`--datnav-color-border`) on a transparent background, the text color, the box of a text filter's
      value and the hover of the × in gray too; the small font, fully rounded, at most 13.75rem wide (or the whole row). Only the value is cut off with an ellipsis: the label, the `⋯`
      and the × always stay.
    - A click on a pill opens the filter view with its filter focused. Its × (`Texts.removeFilter`) removes the filter at
      once. No tooltips (they do not work on touch).
    - While the selection bar is shown, a pill cannot open the filter view (the filter button is not there either);
      its × and "Clear all" still work.
    - The text of a pill: the column header, then the summary of the value, which the built-in filters provide (a
      `WeakMap` from the filter function to its summary, in `ColumnFilters.tsx`):
      - text: `Name: ⋯[ber]⋯` (contains), `Name: [ber]⋯` (starts with), `Name: ⋯[ber]` (ends with): the text in a small
        outlined box, the faded `⋯` where other text may be (display only).
      - select: `Role: Admin`; multiple: `Country: Austria, Spain`, or the first and the number of the others
        (`Country: Austria +2`) when the joined labels are longer than 16 characters.
      - date range: `Born: Sep 1 – 20, 2026` (like the trigger).
      - number range: `Logins 1,000–5,000`, `Logins ≥ 1,000`, `Logins ≤ 5,000`, both equal `Logins = 1,000` (numbers in
        the locale).
      - boolean: `Active: Yes` / `Active: No`.
      - A custom filter (the library does not know its value): strings, numbers and booleans as they are, a list by its
        values, anything else as JSON. A way for custom filters to give their own pill text may come later.
  - No filter icons in the column headers: the pills and the badge are the only filter indicators.
  - The per-column API is unchanged: `Column.filter?: ColumnFilter`, a plain function
    `(props: FilterProps) => ReactNode`, `FilterProps = { value: FilterValue | undefined; onChange(value: FilterValue |
    undefined): void; labelledBy: string }`.
    - `value` is the value in the draft (`undefined` for none), `onChange` changes the draft, `labelledBy` is the id of
      the label of the filter in the filter view.
  - The built-in filters are factories, exported next to the component (and by the element's entry, as opaque
    markers):
    - `textColumnFilter({ placeholder?, matchModes? })`: a plain text input (`FilterTextField`) by default, the value
      always `{ text, match: 'contains' }` (decided 2026-10-02: the select is noise in most columns; the select was
      always there before). With `matchModes: true`, the input with the select described here (the React demo's first
      and last name keep it).
      The text input with a select inside it, at its start (`PrefixedTextField` in
      `widgets.tsx`; the select is our `SelectField` with its chevron, named `Texts.textMatch` "Match"). The wrapper
      (`.prefixedField`) is the field, with the border and the focus outline of the input; the select is a chip in it,
      2px from its top, start and bottom edge, that looks like the knob of the segmented control (flat,
      `--datnav-color-surface`, a thin `--datnav-color-border`, the text color); the input fills the rest without a
      border (2026-09-30, the user's wish). (Tried the same day: the chip white, then in the light accent, then the
      select at the end of the field as quiet text without a box, which the user moved back to the start. Before
      that, the select in front of the input, joined side by side with overlapping borders, on a transparent
      background, at first `--datnav-color-surface-strong`.) The modes: `contains` (default), `starts with`, `ends with`
      (`Texts.textContains`, ...). (A segmented control below the input was tried first, 2026-09-28; the user replaced
      it on 2026-09-29.) When the view opens, the text input (not the select) gets the focus. The value is
      `{ text, match }` (`DataNavigator.TextFilterValue`, `match`: `'contains' | 'startsWith' | 'endsWith'`), the text
      trimmed; an empty text removes the filter. (It was a plain string, before the match modes.) The placeholder is
      `Texts.filterPlaceholder` ("Filter") or `placeholder`. Its clear button (`Texts.clearFilter`) empties it.
    - `selectColumnFilter({ options, multiple? })`: unchanged (`SelectField`): the value of the chosen option, or a list
      of them with `multiple`; "All" (`Texts.filterAll`, value `''`) as the first option of a single select; a clear
      button while something is chosen, before the chevron (2026-10-02; it took the chevron's place before), like the
      autocomplete (`.listField`).
    - `dateRangeColumnFilter()`: unchanged (see below): `{ from, to }`. The second click sets the range in the draft and
      closes the calendars (not the filter view); Clear removes it from the draft.
    - `numberRangeColumnFilter()` (new): two number inputs in one row, `from – to` (placeholders and names
      `Texts.rangeFrom` "From", `Texts.rangeTo` "To", each named with the label of the filter in front, e.g. "Logins
      From"). The value is `{ from?, to? }` (`DataNavigator.NumberRangeFilterValue`), both inclusive; an empty side is
      open, both empty remove the filter. Native `<input type="number">`, without the spin buttons.
    - `booleanColumnFilter()` (new): a segmented control `All` / `Yes` / `No` (`Texts.filterAll`, `filterYes`,
      `filterNo`); the value is `true` or `false`, "All" removes the filter (and shows no pill).
    - `autocompleteColumnFilter({ load, multiple?, minQueryLength?, maxChips? })` (decided 2026-10-02,
      `view/AutocompleteFilter.tsx`): a text input whose options are loaded while typing (Base UI's `Combobox`; its
      `Autocomplete` is for free text). The value is the `value` of the chosen option, or a list of them with
      `multiple`.
      - `load(query, signal)` returns `{ value, label, content? }[]` (`AutocompleteOption`). `label` is a string,
        always: the pill, the input text and the accessible name need one. `content` is only the look of the entry in
        the list (falls back to `label`).
      - The types differ per entry (no generic, `BuiltInColumnFilter` stays as it is): React `content?: () =>
        ReactNode`, the element `content?: () => string | Node`. The element renders a `Node` itself (like the
        default content adapter), whatever the adapter of its setup, so it works with every setup (a Lit setup
        returns a node, not a template). Its factory wraps `load` and calls the React factory.
      - `load` is called 250ms after the last key (`LOAD_DELAY`, fixed), once the trimmed query has `minQueryLength`
        characters (default 1; with 0 it is also called with `''` when the list opens). A newer query aborts the older
        one (`signal`). No cache: the app decides about caching.
      - The list shows its state (Base UI's `Status`, announced): below the minimum `Texts.typeToSearch` ("Type to
        search"), while loading `Texts.loading` (or the previous options, faded), no options `Texts.emptySearch` ("No
        results found"), a rejected `load` (not an abort) `Texts.loadFailed` ("Could not load"; no retry button:
        typing again tries again; no toast, the package has no overlays).
      - Single: the input shows the label of the chosen option. Multiple: the chosen ones are shown before the input
        (`.chipsField`); the list shows a checkbox in front of every option, like the multiple select. The list is placed
        below the whole field (`anchor`), not below the input, which moves right with the values before it.
        - `maxChips` (2026-10-02, default 0): with 0, the values are comma-separated text on one line, cut off with an
          ellipsis (the input keeps at least 4rem); else at most that many chips (the field grows with them), each
          with a remove button (`Texts.removeValue`, "Remove {label}"), and `+N` for the rest: like a chip, without a
          remove button, not focusable, a click opens the list (where every value has its checked box).
        - Backspace in the empty input removes the last value, in both modes (our own handler: Base UI's removes the
          last chip shown, which is not the last value while some are hidden).
      - The placeholder is `Texts.filterAll` while nothing is chosen. The field ends with a clear button
        (`Texts.clearFilter`) while something is chosen or typed, and always a chevron (2026-10-02, it replaced a
        search icon): Base UI's `Combobox.Trigger`, a click opens or closes the list (a click on the input does not
        close it; the multiple select's whole field is its trigger, so it has this already). Not reachable with Tab
        and `aria-hidden` (the keyboard has the arrow keys and Escape). It turns while the list is open.
      - The pill shows the labels (like the select: `Ann+2` when long). The filter keeps the labels of the options
        chosen in it (there are no initial filters, so every value was chosen there).
      - In the filter view, Enter and Escape in its input belong to the open list (choose, close): they apply or
        cancel the view only while the list is closed (`aria-expanded`).
    - Ranges are always inclusive on both ends. All filters are combined with AND (the source does that).
  - The segmented control (`Segmented` in `widgets.tsx`): a `radiogroup` of buttons (`role="radio"`), outlined
    (`--datnav-color-border`) on a transparent background; the chosen one is a flat knob on the surface color
    (`--datnav-color-surface`) with a thin border (`--datnav-color-border`), no shadow (2026-09-30, the user's wish).
    (Before, the same day: in the light accent, and white with a small shadow. Before that, a light gray fill, `--datnav-color-surface-strong`, too gray. At first a gray track, `--datnav-color-surface-strong`, with the chosen one on the surface
    color with a border.) Used by the boolean filter
    (its smaller variant was for the match of the text filter, which is a select now).
  - The controls in the filter view are small (`0.8 * --datnav-control-height`), with a text size between the small and the
    normal size, like the filter row had them.
  - `dateRangeColumnFilter()` (`view/DateRangeFilter.tsx`): a trigger in the look of the selects (`Texts.filterAll`
    while empty, dimmed; else the range, formatted with `Intl.DateTimeFormat#formatRange` (`dateStyle: 'medium'`) in
    the adapter's locale, e.g. "Sep 12 – 20, 2026"), with a calendar icon at its end (Bootstrap's `BsCalendar4`, filled, 16×16, since 2026-10-01; Tabler's `calendar`
    before), or the clear button while set.
    It opens a Base UI `Popover` (in the layer of the root, not modal, below the trigger) with two inline calendars
    of vanillajs-datepicker (`view/dateRangePicker.ts`), side by side, that act as one calendar of two months, with
    the range highlighted in both and today marked.
    - The first click (in either calendar) sets the start; nothing changes yet. Until the second click, the range is
      shown up to the day under the mouse (or the keyboard position), in the look of a picked range, and goes when the
      mouse leaves the calendars. The second click (in either calendar) sets the end, puts the range into the draft
      and closes the calendars. An end before the start is swapped; the same day twice is a range of one day. With a
      range set, the next click starts a new one. Escape and a click outside close the calendars without a change.
    - Below the calendars (`.dateRangeFooter`, always as high as a control): what is picked so far on the left (the
      range like on the trigger, or only its start while the end is still to come, "Sep 14, 2026 – …"; announced
      politely), and while something is picked, a clear button on the right (`Texts.clear`, "Clear"; 80% of a
      control high, with the text size of the filters): it removes the range and closes the calendars.
    - The keyboard: the arrow keys move the keyboard position (while one of the calendar's buttons has the focus),
      Enter picks that day like a click (in the days view; the button's own action is prevented there).
    - The left calendar always shows the month before the right one: they move together. The left one has only
      its ‹ button, the right one only its ›; when one moves (a button, the keyboard, a month or year chosen in its
      title view), the other follows. They open at the month of today and the next one, or with a range at the month
      of its start and the next one.
    - The days of the adjacent months are hidden. Those of the previous month keep their place (so the 1st is below
      its day of the week), those of the next month take none (`display: none`), so there is no empty last row (the
      library always renders six weeks); a month with more weeks makes the popover a little higher.
    - Dense: a day and a header button are 80% of `--datnav-control-height` high (and a day as wide), the days of the
      week 60%; the days' text is between the small and the normal size (like the filters); the calendars are
      `--datnav-spacing-md` apart, the footer `--datnav-spacing-xs` below them.
    - The month and year above a calendar have the weight 500 (since 2026-10-01; the theme's bold before): a fixed value
      in the stylesheet, the one exception to "no values of its own", as no theme value is a medium weight.
    - The library's keyboard position (a gray day) is only shown while the keyboard is in that calendar.
    - Today: a short bar below its number (in `--datnav-color-primary`; sized from `--datnav-control-height`: half of
      it wide, a sixteenth high, rounded), visible on every background, and its number bold and in the primary color.
      As an end of the range, the number and the bar are in `--datnav-color-on-primary`, like every end. (A dot was
      tried: quieter, but easier to miss. A text underline would look like a link.)
    - Every day that can be picked has the pointer cursor, the ends of the range too. The day under the mouse gets a
      ring in `--datnav-color-primary` (1px, inside), the same inside the range and outside it; the ends of the range
      keep their look. (A background was too weak to see within the range.)
    - The start and the end are ours: the library's own `DateRangePicker` only works with two `<input>`s
      (dropdowns) and has one date per picker, and a click on a picker's selected day reports no change (a range of
      one day). So we handle the clicks and Enter on the days, keep the range, and give both pickers the small range
      object the library reads for the highlighting (`rangepicker.dates`, `rangeSideIndex`), which returns our range:
      internals of the pinned, bundled version. The pickers themselves hold no dates; `setDate` with `viewDate`
      keeps their months.
    - Texts come from `Intl` in the adapter's locale (names of days and months; the first day of the week from
      `Intl.Locale#getWeekInfo`, else Monday, Sunday for `en-US`), so no locale files are needed.
    - Accessible names: each calendar is a group named by its month title; the ‹ and › buttons by `Texts`
      `calendarPrevious` ("Previous") and `calendarNext` ("Next"; a month, a year or a decade, depending on the view).
      The calendars are created again when these texts or the locale change.
    - The library is loaded on first use (a dynamic import: it touches `document` when imported, and importing this
      package must work without a DOM).
    - Styled by our stylesheet with the theme's values (`.dateRange`, the library's class names as `:global`), not
      by the library's own stylesheet, so it follows the theme and the color scheme.
  - Text inputs outside the filter view (the search box) have a side padding of
    `0.75 * --datnav-spacing-sm`.
  - Every select (the single and the multiple select filter) is one widget, `SelectField`, on Base
    UI's `Select`. The trigger looks like our text inputs (same classes), with our chevron; in the select filters
    (`FilterSelectField`) the clear button comes before it while something is chosen, and the chevron turns while the
    list is open (only a picture: the whole field is the trigger, a second click on it closes the list). It shows the chosen labels (comma separated) or the placeholder, dimmed
    (`data-empty`) while nothing is chosen.
  - The list opens below the trigger (`alignItemWithTrigger={false}`, not over it as Base UI does by default), at
    least as wide as the trigger, in the look of our menus: `--datnav-color-surface`, `--datnav-color-border`,
    `--datnav-radius`, `--datnav-shadow`. The highlighted option is `--datnav-color-surface-strong` (like the menus), a
    chosen one is bold.
    - Single select: a checkmark (`--datnav-color-primary`) in front of the chosen option. Its room is kept on every
      option, so the labels line up.
    - Multiple select: a checkbox in front of every option, the same native checkbox as in the rows. It is only a
      picture of the state (`aria-hidden`, `tabIndex={-1}`, no pointer events): the option is the control. It is gray
      (`--datnav-color-text-dimmed`), whatever the selection appearance.
  - The list is rendered into a layer element inside the root (`LayerContext`), not at the end of the body, so it
    gets the values of the theme. It is `position: fixed`, so the scroll area does not cut it off.
  - It is not modal (`modal={false}`): the page stays scrollable and usable while a list is open.
  - A single select closes when an option is chosen. A multiple select stays open while options are chosen (Escape
    or a click outside closes it).
  - Selects (the single select filter, the button of a multiple select) have 1px more padding on every side than the
    text inputs. (The page size is no select field since 2026-10-05, see the footer.)
  - Every applied change of the filters goes back to page 1 and clears the selection. A newer change replaces a
    running load, and the response of the outdated load is ignored (as for the search). Equal filters (as JSON
    values) start no load.
  - The filter values in `Query.filters` (the type is `Record<string, FilterValue>`):
    - The key is the `key` of the column. A filter without a value is absent: `{}` means no filters. `undefined`,
      `null` and `''` are never used for "no filter".
    - Values are JSON values only: `FilterValue = string | number | boolean | null | readonly FilterValue[] | { readonly
      [key: string]: FilterValue }`.
      - So a custom filter uses ISO strings for dates, never a `Date`.
      - The whole query is serializable (server, URL, storage).
      - A custom `onChange` takes a `FilterValue`, or `undefined` to remove the filter.
    - The keys are plain strings (not checked against the row type). Keys typed against the row type are a todo.
  - Empty result with active filters: the default empty state says `Texts.emptyFilters` ("No rows match these
    filters") with a "Clear filters" ghost button in the text color (`Texts.clearFilters`, `data-placement="tool"`; it was a text button in the primary color) below it (it removes all filters). With a
    search only: `Texts.emptySearch`. A custom `empty` always wins (and has no button).

- The toolbar above the table (decided 2026-09-28, with the filter popup): the heading, the bar, the pills, one below
  the other, `--datnav-spacing-sm` apart.
  - The heading: the optional title and the subtitle below it.
    - Props `title` and `subtitle`, both optional and of type `ReactNode`.
    - The title is bold and `1.25 * --datnav-font-size`. The subtitle is smaller (`--datnav-font-size-sm`) and dimmed.
      Both in every density alike (since 2026-10-05).
    - There is little gap between title and subtitle: both use a tight line height (1.3). No extra margin.
    - Without title and subtitle, the heading is not rendered.
  - The bar, one line of a fixed height (`--datnav-control-height`), left to right:
    - The Reload button (`reloadable`), always at the start, also without a search box (so it is in the same place in
      every table, and "refresh this list, search in it" reads from the left).
    - The search box (only `searchable`; disabled while the filter view is shown): it grows
      with the table, up to 22.5rem (at least 8rem); the free space goes
      between it and the buttons.
    - The free space.
    - The filter button (see Filtering).
    - A thin vertical divider (1px, half a control high), only when there are a filter button and general actions.
    - The general actions (menus included; the app puts rarer ones into an icon-only menu, e.g. "⋯").
    - A divider (when a filter button or general actions come before it) and the column menu (see "Column
      visibility"; always there since 2026-10-04), at the very end.
    - Without Reload and search box everything sits on the right: the bar stays in its place with its height, so
      every table looks the same, and the selection bar has the same line to take.
    - Buttons are `calc(--datnav-spacing-xs / 4)` apart.
    - The bar (and the selection bar) has the text size of the table (`--datnav-font-size`; decided 2026-09-30). From
      2026-09-28 it had a larger one (`8 / 7 *`, 16px with the default 14px), as the controls of the table rather than
      its content; the buttons looked too big, also next to Mantine's own. The buttons keep their height.
    - Without search box, view controls and general actions (and without a selection mode), the bar is not rendered.
  - The selection bar (IBM Carbon's batch action bar, adopted now; "tried and dropped" before, when it was a bar in the
    brand color): while at least one row is selected, it takes the place of the bar, in the same place and with the
    same height, so nothing below moves. When the selection is cleared, the bar comes back (with the search text kept).
    - Left to right: the selection pill, the free space, the actions on the selection (on the right, like the general
      actions of the bar; they were on the left, next to the pill, at first). Then a divider and an icon-only
      ghost button with a "deselect" icon (a dashed square with a diagonal line, drawn by us in the style of Tabler's `deselect`; tried before: a plain × like the pill's, a circled ×, and this icon once already; the dashed
      square came back on 2026-09-29) (`data-placement="tool"`; name and tooltip `Texts.clearSelection`, "Clear selection", the
      same as the pill), which clears the selection, like the pill. Redundant on purpose: after the actions, the
      pointer is on the right, and the pill is far away on the left (like the "Cancel" of Carbon's batch action bar).
      (History, 2026-09-28/29: a muted "Cancel" text button, removed for a while, then a "Cancel" ghost button;
      "Cancel" was vague, so an icon: a ×, the "deselect" icon, a circled ×, and back to the plain ×.)
    - Its text is the normal size (`--datnav-font-size`, 14px; the small one, 12px, until 2026-10-04: the user's wish, it
      was too small), normal weight (400; bold before, 2026-10-04), with a × of 14px (12px before); the line height 1.6 keeps it as high as the filter pills (24px).
    - The selection pill: `Texts.selectedCount` ("2 selected") and a × in the pill that the footer had before
      (`Pill`, `.pill`, fully rounded, small bold text), outlined like the filter pills: a gray border
      (`--datnav-color-border`) on a transparent background, the × dimmed (`--datnav-color-text-dimmed`), in the middle of the room between the text and the right edge
      (`calc(--datnav-spacing-xs / 2)` before and after it). (2026-09-29:
      a gray fill and the accent color were tried too; the user went back to transparent. The spec's accent pill "2x"
      was tried first.) It counts the selected rows (of the current page: the selection never spans pages). The footer has no pill
      anymore.
      - The whole pill is one button that clears the selection (`.selectionPill`), so it is easy to find: hovered, the
        pill gets `--datnav-color-surface-strong` and the × the text color, pressed a little darker; the tooltip and the
        accessible name are `Texts.clearSelection` ("Clear selection"). The count is announced by a `role="status"`
        inside. (A small round × button of its own at the end of the pill was tried first, next to "Cancel".)
    - The actions on the selection: the rows actions (at least one selected) and the row actions shown in the toolbar
      (exactly one selected: e.g. "Edit", hidden, not disabled, otherwise). General actions are not there.
    - "Show only the selected rows" (a click on the pill, with "N selected shown" in the footer) was part of the spec,
      and is left out for now (see Todo): it needs a change of the footer.
  - The pills of the active filters (see Filtering).
  - If there is no title, no subtitle, no bar and no pill, the toolbar is not rendered.
  - While loading, everything is blocked (`inert`), except the search box and the filter button.
  - The actions (of the bar and of the selection bar, `data-placement="toolbar"`): the standard buttons, as before
    the redesign: secondary outlined (`--datnav-color-border` on the surface), primary and danger filled (see Action
    variants), `--datnav-control-height` high, normal weight (bold until 2026-09-30), `calc(--datnav-spacing-xs / 2)` apart. (Ghost buttons, as the
    spec wanted, were tried first and replaced by the user, 2026-09-28.) Their menus open aligned to the end of the
    button.
  - The view controls (the filter button, the Reload button, `data-placement="tool"`): ghost buttons: no border and
    no background at rest; `--datnav-color-surface-strong` on hover and while their popup is open (`data-popup-open`) or they are pressed (`aria-pressed`, the filter button while the filter view is shown), a little
    darker while pressed. `0.875 * --datnav-control-height` high (28px), `0.75 * --datnav-spacing-xs` side padding,
    `--datnav-button-radius`, in the weight of the actions: normal since 2026-09-30, like every button (actions,
    view controls, the buttons of the filter view, row actions with a label); they were bold, and a normal "Filters"
    next to a bold "Add user" looked smaller. An icon-only one is at least square (the filter button grows with
    its badge).
  - The Reload button's icon turns while loading (`data-busy`).
  - Animations (short, and none with the system's reduced motion setting, see "Look and feel"): a new bar (the bar or
    the selection bar) fades in with a tiny upward shift (150ms); the selection pill and the filter pills scale in
    from 0.7 (160ms, the selection pill from its left); the text of the selection pill bumps (1.15 wide and 1.25 high, 150ms; it was 1.25 in both directions, then 1.1 wide) when the count
    changes.
- Actions come in four types: general, single-row, multi-row and group (the group one since 2026-09-30, see "Group
  actions" under Row grouping).
  - The discriminator `type` of an action is `'general' | 'singleRow' | 'multiRow'` (renamed on 2026-09-29 from
    `'general' | 'row' | 'rows'`: `'row'` and `'rows'` differed by one letter, easy to misread). Only a single-row
    action has `show` and `default`. The TypeScript names of the types (`RowAction`, `RowsAction`) stay.
  - What the action column shows of an action is a setting of the table, not of the action (decided 2026-09-29):
    `rowActionLook?: 'icon' | 'label' | 'iconAndLabel'` (default `'icon'`; the element's attribute `row-action-look`,
    property `rowActionLook`). Actions describe their whole look (label, icon, tip); the table decides for the rows.
    - `'icon'`: only the icon, with the label as the tooltip and the accessible name (or the tip, when there is one).
      An action without an icon (or without text for the name: a label that is not a string, and no tip) shows its
      label all the same. `'label'`: only the label. `'iconAndLabel'`: both. An action without a label (icon-only,
      with a tip) always shows its icon.
    - The toolbar and the selection bar show an action as it is (icon and label, or what it has).
    - So one action can be shown in both places (`show: 'both'`), with a label in the toolbar and only an icon in the
      rows. The rows look uniform. (A per-action `iconOnlyIn` was tried first and replaced; dropping `show: 'both'`
      for two actions per place was considered.)
    - The type cannot check that every action of the column has an icon when the table shows icons.
    - Later (a separate step): make the label required and the icon optional in `ActionLook` (the label is then always
      there for the name, the tooltip and the menus).
  - `contextMenu?: boolean` on every action (default `true`, decided 2026-09-29): `false` leaves it out of the context
    menu (also inside a menu), for an action that does the same as another one there. E.g. a single-row "Delete" in
    the rows next to a multi-row "Delete" of the selection: on a right-click both would be about the clicked row.
  - They are described declaratively (a list of actions), not by hand-written render functions.
  - Actions are native buttons, and a menu is Base UI's `Menu` (`role="menu"`, items `role="menuitem"`).
    - Opened from the keyboard (Enter, Space or ArrowDown on the button), the first item has the focus. Opened with the
      mouse, no item is highlighted yet (like native menus on the desktop).
    - Arrow keys (wrapping), Home, End and typing move between the items. Escape closes it and gives the focus back to
      its button, a click outside closes it.
    - Choosing an item closes the menu and runs the action once. A second click on the menu button closes it.
    - It opens below the button, aligned to its end: the actions of the toolbar (since 2026-09-28) and the action
      column both sit at the right, so it does not reach past the table. Base UI flips it
      when there is no room. It is not modal (`modal={false}`).
    - The item under the pointer or the keyboard focus is `--datnav-color-surface-strong` (Base UI's `data-highlighted`):
      darker than `--datnav-color-hover` (too light on the popup; it was that before), an existing theme value.
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
      secondary is outlined and neutral (`--datnav-color-border`). Height `--datnav-control-height`, an icon-only
      button is square.
      - There is no hover color for danger (no token), so a filled danger button keeps its red on hover.
    - The action column is different: only link-style buttons, in three colors, one per variant (primary color,
      neutral, red). Buttons with a border or a background of their own look odd on a hovered or selected row, while
      link-style buttons are transparent, so the row color shows through.
      - Transparent, no border, `--datnav-font-size-sm`, `0.75 * --datnav-control-height` high. Hovered, they get
        `--datnav-color-surface-strong` (one shade over the hovered row). The details chevron and the pager buttons (the same
        icon button class) too.
      - With `selectionAppearance="accent"` (where the row hovers in the accent tint), the action column buttons and
        the details chevron get `--datnav-color-selected-border` instead, a darker shade of that tint, like the drag
        handle (2026-09-29). The pager buttons (not on a row) keep the gray.
    - In a menu, the menu button follows the variant of the menu. An item of a menu is red when it is `danger`
      (the other variants look the same there).
    - Every action button carries `data-variant` with its variant.
  - Any action can be placed inside a menu.
    - A menu is a flat dropdown: a button with a list of actions. No submenus (max. two levels).
    - Its separators are lighter than its frame: `colorSurfaceStrong`.
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
    - A double click selects only its row (with a selection mode) and runs the action: its first click is a plain
      row click, which already selects only this row (see the row click), and nothing flashes.
      - Before (until 2026-09-29), a double click left the selection exactly as it was: the first click selected, and
        the second mouse down put the selection from before back. The checkbox then showed a short flash, so it was
        dropped.
      - No delay and no guessed threshold: a row click selects at once. The second click of a double click never
        counts on its own (`event.detail >= 2`, the browser counts the clicks itself).
      - Never invent a double click duration. It differs per system and per browser, the web platform does not
        expose it, and `event.detail` makes knowing it unnecessary.
    - The first action marked `default` wins, the rest are ignored. The type cannot check that there is only one.
    - It counts wherever the action lives: in the action column, in the toolbar, or inside a menu, whatever `show`
      says. It does not change the selection mode either, so a table can have a default action and no checkboxes.
    - No touch equivalent (there is no double tap) and no cursor of its own: the button stays the discoverable way.
  - Toolbar actions are only visible when the matching number of rows is selected (not merely disabled).
    - Single-row actions: exactly one row selected.
    - Multi-row actions: at least one row selected.

- Context menu of the rows: Base UI's `ContextMenu` (right-click, long press, the context menu key and Shift+F10),
  with the actions' texts and icons. `view/RowContextMenu.tsx`; its entries: `contextMenuItems` in `actions.ts`.
  - Icons, in the context menu and in the toolbar's menus: when at least one entry of a menu (or submenu) has an icon,
    the menu is a grid (icon, text, submenu arrow; `.menuWithIcons`) and every entry takes its columns over (subgrid),
    so all texts start at the same place, also next to an entry without icon. Without any icon, no icon column. No
    cloning: a `ReactNode` is rendered anew in every place, and the element's icons are functions (`() => C`).
  - Order: the actions of the clicked row (all single-row actions, wherever else they are shown; only while the menu is
    about one row, see below), then those of the selected rows (multi-row, only with multi-selection), then the
    general ones, and last the action menus as submenus (with the entries that apply here: single-row ones for the
    clicked row, multi-row ones for the selection). A separator between the groups that are present. The most
    specific first, closest to the pointer.
  - The selection, like a file manager: a right-click on a row that is not selected selects only that row (the
    selection is replaced); on a selected row, the selection stays. So the clicked row is always part of the selection
    the multi-row actions get; the single-row actions get the clicked row.
    - With several selected rows (a right-click on one of them), the menu is about all of them: no single-row actions
      (like the toolbar, which shows them only for exactly one selected row). Otherwise "Edit" would act on the row
      under the pointer only, easy to misread with several rows selected. Without selection (no multi-row actions),
      nothing is selected. On touch, this happens when the menu opens (after the long press), not on the first touch.
  - Always on, without a prop. The browser's own menu stays where it is clearly wanted or ours would be empty:
    - on links, fields to type in (not on checkboxes or radios, like the row's selection) and text selected in the
      row (to copy it, or to open a link in a new tab);
    - outside the data rows (header, filters, empty state), and when there is no action for the menu.
    - (Shift+right-click for the browser's menu was considered and left out for now.)
  - Icon-only actions show their `tip` as the text.
  - The custom element has it too (it renders the same view).
  - Implementation notes:
    - The table element is the trigger (Base UI's `render` prop), the rows carry `data-row-key` (also the detail
      rows, which belong to their row).
    - Base UI's trigger keeps the browser's menu away from everything inside it (a listener on the document), also
      when its own handler is skipped. So where the browser's menu is wanted, our listener on the table stops the
      event there (`stopPropagation`): neither Base UI's handler nor its document listener get it.
    - Base UI keeps the open handler of its first render: it calls our latest `prepare` through a ref.
- Row reordering (decided 2026-09-29, our own code, no library): the user moves rows, and the table tells the app.
  - `reorder?: (move: Move<Row>) => void | Promise<void>`, `Move<Row> = { row, group, after, before }`: the moved row,
    the group it landed in (with `groupBy`, `''` for the blank group; `undefined` without `groupBy`), and its new
    neighbors on the page (`undefined` at the start or the end of the page; in the order of the source, rows of
    collapsed groups included). The app saves the order (e.g. "put `row` after `after`", or before `before` at the top
    of a page) and the group. The same option on the element's controller.
  - Use cases: short lists without paging (priorities, steps, favorites) and long paged lists (a backlog). Moves stay
    within the page (no drop on another page).
  - With `reorder`, there is no column sorting: `sortable` and `defaultSort` are ignored (a warning in development);
    the order of the source is the order.
  - The handles are hidden (with their room kept, `data-inactive`, `inert`) while a search or a filter is active: where
    a row lands among the rows hidden by them is unclear. Also on a page with a single row (with `groupBy`: unless
    there is another group, e.g. an empty one, where the row could go).
  - The handle column: the first column (before the selection and the details toggle), `max-content`, a control cell
    (clicking it never selects). It is there whenever
    `reorder` is given, also while its handles are hidden. Its header cell is empty; detail rows get an empty cell.
  - The handle: an icon button (Tabler's `grip-vertical`), dimmed, the text color on hover, `cursor: grab`, named
    `Texts.moveRow` ("Move row"), no tooltip. Its hover background is the gray of the row buttons
    (`--datnav-color-surface-strong`), and with `selectionAppearance="accent"` (where the row hovers in the accent tint)
    `--datnav-color-selected-border`, a darker shade of that tint (2026-09-29), like the other row buttons.
  - Pointer (mouse, touch, pen; `view/rowDrag.ts`): pressing the handle starts a drag (the pointer is captured, no
    scrolling on touch, `touch-action: none`). The row itself moves (decided 2026-09-29; a faded row with a 2px drop
    line in the primary color was the first version): it follows the pointer (an inline `translateY` on its cells and
    those of its detail row, `data-drag="dragged"`), lifted above the others (`z-index: 2`, opaque: above the fixed columns of the other rows too,
    which are `z-index: 1` and come later in the DOM; 2026-10-04; the sticky header, `z-index: 3`, stays above it), with a line on top and at the bottom of the normal width (real borders, the top one
    overlapping the line above, like the selection border): `--datnav-color-border`, and with
    `selectionAppearance="accent"` `--datnav-color-selected-border`, hovered or not, also on the first row (an inset
    shadow on top of the borders was tried first: too thick), shown within the rows of the page (never over
    the header or below the last row). The rows between its old and its new place slide aside by its height
    (`data-drag="up"`/`"down"`, 150ms, none with reduced motion), so the gap is where it will land. Nothing changes in
    the DOM until the release. The rows are measured once at the start (the transforms would change the measures), in
    the coordinates of the rows area, so a scroll during the drag counts. The target is the number of the other lines
    (rows, and with `groupBy` the group headers, which slide aside too; `data-line` on every row) whose middle is above
    the middle of the dragged row, where the pointer took it (not clamped: so the first and the last place are
    reachable with rows of different heights). Releasing moves it; Escape and a cancelled pointer end
    the drag without a move. The grabbing hand while dragging, and no text selection.
  - Keyboard: Alt+ArrowUp / Alt+ArrowDown on the handle move the row by one line (`aria-keyshortcuts`); the handle
    keeps the focus. With `groupBy`, a group header counts as a line (see "Moving between groups").
  - A move shows at once (optimistic), and a screen reader hears `Texts.movedTo` ("Moved to position 3", a hidden
    `role="status"`). Then `reorder` saves it; the saves run one after the other, in the order of the moves. If a save
    fails (rejects), the error is logged and the page is loaded again (the source's order is the truth). The next load
    (any: page, reload) shows the order of the source.
  - Not while loading.
- Row grouping (decided 2026-09-29): the table groups the rows of the page; the source may add the totals.
  - `groupBy?: (keyof Row & string) | ((row: Row) => string)`: a column key (its value as a string) or a function.
    The same option on the element's controller.
  - Classic grouping, as in data grids (decided 2026-09-30): every row is in a group. An empty value (`''`, `null`,
    `undefined`) is the blank group `''`, a normal group (like "(Blanks)" in AG Grid and Excel): the source decides
    where it goes; its default header shows `Texts.emptyGroup` ("(Blank)"), `renderGroup` and group actions get `key:
    ''`.
    - Rows without a group between the groups (an outline, like an agenda with "Opening" before its sections) were
      built first and dropped: that is tree data, not grouping. With them went the indentation of grouped rows and the
      sideways moves (dragging left or right, Alt+ArrowLeft/ArrowRight).
  - The source delivers the rows sorted by group (the group is its first sort key; the column sort applies within the
    groups). The table groups consecutive rows with the same key, so unsorted rows give a group more than once.
  - `Result.groups?: readonly ResultGroup[]` (optional), `ResultGroup = { key, total }` (it was `GroupTotal`): the
    total of every group on the page. Without it, a group counts only its rows on the page. Paging stays over rows.
  - Groups come from the rows, as in data grids (decided 2026-09-30), and the order of the groups is the order of the
    source (its sorting). Dragging whole groups (`reorderGroup`, with all groups collapsing during the drag) was built
    and dropped for it.
  - Empty groups from the source (decided 2026-09-30, for an agenda section without items): a group of `Result.groups`
    with `total: 0` that has no rows on the page gets its header (count `0`, no checkbox), at its place in the order of
    `groups`: right before the next group of that order that is on the page, else right after the one before it; none
    when no group of that order is on the page, or the page has no rows (the empty state). A row can be moved into it
    (below its header). `segmentsOf` in `grouping.ts`. (A first version, with `ResultGroup.at`, the place of an empty
    group's header, was dropped: the order of `groups` gives the place.)
  - Moving a row between groups changes the caret of the groups involved (2026-10-04, the user's wish; `moveLine` in
    `useDataNavigator.ts`, also for the keyboard move):
    - A group whose last row is moved out collapses (nothing left to show).
    - A collapsed empty group a row is moved into expands (the row is its only content).
    - A collapsed group that has rows stays collapsed when a row is moved into it (the row lands at its end; its count
      changes): opening a long list would push everything down and lose the user's place. Expanding it, or scrolling
      the row into view, was considered and dropped for that reason.
  - `renderGroup?: (group: RowGroup<Row>) => ReactNode` (the element: `string | C`), `RowGroup = { key, rows (of the
    page), total (from the source, or undefined) }`: the content of the group header. It replaces the default (the key
    and the count). Plain content only: it is inside the toggle button.
  - The group header row (`.groupRow`, `.groupCell`): over the whole width, with bold text and no background of
    its own since 2026-10-04 (the user's wish; a gray band, `--datnav-color-surface-strong`, was the look from
    2026-09-30, then a light one, the hover color, for a few hours: both looked heavy; the weight, the caret and the gap
    above set a group apart; the line below is the cell's own), of the normal height of a row (decided 2026-09-30), the
    normal text color, the caret too; the count dimmed and small. No hover and no row click. With `selectableGroups` and multi selection, a checkbox in the
    selection column (`Texts.selectGroup` / `deselectGroup`, indeterminate while some are selected; gray with the
    neutral appearance) selects all rows of the group on the page, or none. The rest is one button
    (`aria-expanded`): a filled caret (Tabler's `caret-right-filled`; right while collapsed, turned down while expanded)
    and the content. Not the chevron of the row details (decided 2026-09-30): a group hides or shows rows, the details
    toggle a row's own content, like the triangles of outlines and spreadsheet groups.
    - The text of a group header is not selectable (`user-select: none`, 2026-10-04, the user's wish): the cells of the
      header row are never marked as the selectable cell (`markSelectableCell` in the view), where a click on a data
      cell marks it for text selection.
    - A gap above every group header (2026-10-04, the user's wish): a transparent top border of
      `--datnav-spacing-sm` on the cells of the header row. It is
      part of the cell, so the row drag, which measures the cells, still moves the rows by the right amount (a margin
      would not be in that height). The first group has it too (it had none for a few hours: without a band, a bold label tight under the
      column headers' line would look like a part of them).
    - The band spans the whole width: with a checkbox and a handle column (`reorder`), an empty band cell sits in the
      handle column, so the checkbox stays in line with the rows' checkboxes.
    - History (2026-09-30): first a soft gray band (`--datnav-color-surface-strong`), too close to the neutral selection, the
      row hover and the stripes, and almost white in the Mantine theme; then set apart like a section heading (room
      above, a dimmed line on top, a larger title), which made the rows taller; then a dark band with light text
      (`--datnav-color-text-dimmed`, the surface color as text), too much; then the line color (`#c6c6c6`), a bit too
      dark; then the new value `colorSurfaceStrong`; on 2026-10-04 the light hover color (a caret in the primary color was tried and dropped).
    - The band spans the whole width: with a checkbox and a handle column (`reorder`), an empty band cell sits in the
      handle column, so the checkbox stays in line with the rows' checkboxes.
    - Set apart like a section heading (decided 2026-09-30; the band alone was too close to the neutral selection, the
      row hover and the stripes, and almost white in the Mantine theme): `spacingXs + spacingSm` of room above its
      text, a 1px line on top in `--datnav-color-text-dimmed` (overlapping the line of the row above, so nothing
      grows; none right below the column headers), and the title at `1.07 × fontSize`.
    - The default content: the key, then the count, dimmed and small: `Texts.groupCount` ("37"), or
      `Texts.groupPartial` ("5 of 37") when the source's total is larger than the rows on the page (a group that runs
      over a page break; which side it continues on is not known, so there is no "continued").
  - Collapsing: a matter of the view (no new load), by key, kept across loads (a collapsed group stays collapsed on the
    next page) until the table is remounted. The rows of a collapsed group are not rendered; their selection stays.
  - The stripes start again in every group.
  - Row details, the context menu, the selection and the actions work inside groups as without them. The select-all
    checkbox of the header is about all rows of the page.
  - The group checkbox is opt-in (decided 2026-09-30, like in other grids: AG Grid's `groupSelects`, MUI X's
    `rowSelectionPropagation`): `selectableGroups?: boolean` (default `false`; the element's attribute
    `selectable-groups`). Without it (or without multi selection), the header's content (the caret and the name)
    starts in the first column, over the handle and selection columns (decided 2026-09-30, the user's wish; an empty
    cell in the selection column pushed it to the right at first). Before, every group header had one with multi
    selection.
  - Group actions (decided 2026-09-30): `type: 'group'` in `actions` (`GroupAction`, `onClick(group: RowGroup<Row>)`),
    the same on the element's controller. Chosen over a separate `groupActions` prop: `actions` describes everything
    the table offers, and menus and the context menu work the same.
    - At the end of every group header, in the action column (the band's toggle ends before it), in the look of the
      row actions (`rowActionLook`), in the normal weight. They may sit in a menu (`type: 'menu'`). The action column
      is there as soon as a group has a header, also without rows or row actions.
    - The context menu of a group header (`data-group-key` on the row): its group actions, without those with
      `contextMenu: false`; nothing else. The context menu of a row has no group actions.
    - Never in the toolbar or the selection bar; they do not change the selection mode.
  - Moving between groups (decided 2026-09-30; before, `reorder` was ignored with `groupBy`): with `reorder`, a row
    moves within its group or into another group (like dragging a row onto another group in AG Grid, which changes its
    group value); `Move.group` says where it landed. The logic is pure (`core/grouping.ts`: the page as runs,
    `Segment`, and its lines; `moveInSegments`), with its unit test.
    - A row lands in the group of the line above it: below a row, right after it (also below the last row of a
      group); right below the header of an expanded group, its start; below a collapsed group, its end (it stays
      collapsed, its count grows); below a group whose rows were all moved away, in it. At the very top, the start of
      the first group.
    - Keyboard: Alt+ArrowUp on the first row of a group puts it at the end of the group above; Alt+ArrowDown on the
      last row, at the start of the group below.
    - A group whose rows were all moved away stays on the page, empty, until the next load.
    - The counts in the headers change at once; the totals from the source by ±1, until the next load.
- Row editing and new rows (decided 2026-09-30): an edit form below the row, over the whole width of the table, one
  row at a time; "OK" saves the whole row.
  - History: first like ExtJS's `RowEditing` (the editors in the cells of the row, "Save" and "Cancel" in the action
    column). Dropped the same day: only the visible columns could be edited, and a narrow column left little room for
    its editor.
  - `saveRow?: SaveRow<Row>`, `(row, draft) => void | Row | Promise<void | Row>`: saves an edited row. What it returns
    (else the draft) takes the place of the row on the page, without a new load (the app may `reload()`).
  - `createRow?: CreateRow<Row>`, `(draft) => Row | Promise<Row>`: creates a new row; it returns the created row (with
    its real key). Two functions, not one `saveRow(row | undefined, draft)` (decided): clear types, and a table may
    offer only one of the two.
  - The fields of the form: every column with `edit` (also the hidden ones, in the order of the columns; the column
    header is the label), then `editFields?: readonly EditField<Row>[]`, `{ key, label, edit }`: values that are no
    column (e.g. notes).
  - `Column.edit?: ColumnEditor<Row>`, `(props: EditorProps<Row>) => ReactNode`, `EditorProps = { row, draft,
    columnKey, value, change, labelledBy }`: `value` is the draft's value of the field, `change(patch)` merges a
    `Partial<Row>` into the draft (so an editor may change other values too), `labelledBy` is the id of the field's
    label. `row` is the edited row (the template of a new one).
    - Built-in editors (factories, like the filters): `textColumnEditor({ placeholder? })` (a text input, not trimmed:
      that is up to `saveRow`), `selectColumnEditor({ options })` (a single select that always has a value,
      `SelectInput` in `widgets.tsx`), `dateColumnEditor({ placeholder? })` (see below). Small, like the controls of
      the filter view.
    - `dateColumnEditor()` (`DateInput` in `view/DateRangeFilter.tsx`, decided 2026-09-30, instead of a text input or
      a native `<input type="date">`): a trigger in the look of the date range filter (the date in the medium format of
      the locale, "Apr 6, 1953", or the placeholder, dimmed; a calendar icon, or the clear button while set). It opens
      a popover with one calendar of the same library (`createDatePicker` in `dateRangePicker.ts`, next to
      `createRangePicker`): at the month of the date (else of today), the date selected, both ‹ and › shown
      (`data-single`), the month title up to the decades (`maxView: 3`, quick for a date of birth). A click on a day,
      or Enter on the keyboard position, sets it and closes the popover. The value is `yyyy-mm-dd`, `''` when cleared;
      any other text is shown as it is.
    - The element: the same built-ins (opaque markers, `src/element/editors.tsx`), or a function `(props) => string | C`
      that is called once when the form opens (its content, e.g. a DOM input, keeps its own state and reports with
      `change`; a new call per render would replace the input and take its focus). `saveRow`, `createRow` and
      `editFields` (its `label` a `TextContent<C>`) are options of the element's controller.
  - Starting, through the controller: `editRow(row)` (the row is found on the page by its key; needs `saveRow` and a
    field), `addRow(template)` (needs `createRow` and a field). No built-in actions: the app makes them (e.g. "Edit" as
    the default row action, for a double click; "Add" as a general action) and calls the controller. Nothing happens
    while loading, while the filter view is shown, or while a form is open.
    - `addRow` takes a full row as the template (the start values), so the editors always get a complete `draft: Row`.
      Its key does not count: the new row has a key of its own until it is saved.
  - The form (`view/EditForm.tsx`, a row of the grid with one cell over all columns, `data-edit-form`; a `group` named
    `Texts.editRow` "Edit row" or `Texts.newRow` "New row"): the fields, in as many columns as fit (a column: the
    widest label, the gap and an editor of at least 12rem); below them, on the right, "Cancel" (`Texts.cancelEdit`, a
    ghost button) and "OK" (`Texts.confirmEdit`, outlined, like "Apply" of the filter view; it was "Save",
    `Texts.saveRow`, until 2026-09-30: "OK" in capitals, like the dialogs of the overlays package), for a new row "Add"
    (`Texts.confirmNew`, since 2026-10-01, the user's wish: with "OK" it looked too much like the filter view; like the
    app's "Add …" action that opens it; "Insert" sounded too technical). Both buttons are as high as the editors and the
    buttons of the filter view (`0.8 * --datnav-control-height`, since 2026-10-01, the user's wish; before, the full
    control height and `0.875 *`, like in the toolbar). On the left the
    message
    of a failed save.
    - The labels (decided 2026-09-30, like the filter view; they were above the editors at first): muted, right
      aligned, before their editor, all as wide as the widest one (measured when the form opens, `scrollWidth`, and set
      inline as the labels' `min-width` and in the width of the columns), so the editors line up. In a narrow form
      (`@container edit-form (width < 24rem)`: a drawer, a phone) the label is above its editor, small and left
      aligned.
    - It takes the place of the edited row (decided 2026-09-30; before, the row stayed above it and showed the draft):
      it follows the row (after its detail row, if it is expanded), and the row folds up while the form is open.
    - A new row is only its form, first on the page (before its rows, also in an empty table: no empty state
      meanwhile). (Before, an empty row with the draft stood above it.)
    - Animation (decided 2026-09-30): when it opens, the form unfolds from no height to its own and its content fades
      in, while its row (and its detail row) folds up to no height, in 400 ms (`cubic-bezier(0.2, 0, 0, 1)`: the filter view's time and easing, 2026-10-04, the user's wish; 180 ms `ease` before), so the rows below slide
      by the difference; the rest of the table fades to its faded look meanwhile. Nothing with reduced motion.
      - "Cancel" and Escape (decided 2026-09-30, the user's wish): the other way round, in 250 ms (`ease-in`, the filter view's closing; 180 ms before): the form
        folds up (`data-closing`, inert meanwhile) while its row unfolds again and the rest of the table fades back
        (`data-edit-closing` on the root); then the form closes (`cancelEdit` of the view, a timer; the hook's
        `keyDownEdit` takes it as the cancel of Escape). Not while the draft is saved.
      - "OK" (and a new load) closes it at once, and the row is back at once (the saved row takes its place).
      - The form: CSS, a grid of one row from `0fr` to `1fr` (`@starting-style`), the padding inside the clipped part
        (`.editFormClip`), so nothing of it shows before.
      - The row: a Web Animation of its cells (`useLayoutEffect` in the view, before the first paint) from their
        measured height, padding, bottom line and opacity to none (CSS cannot animate from `auto`), kept with
        `fill: 'forwards'` while the form is open and cancelled when it closes. "Cancel" plays its keyframes backwards
        as a new animation (not `reverse()`, which also turns the easing around: the row lagged behind the form and
        jumped at the end). `EDIT_FORM_OPEN_TIME` and `EDIT_FORM_CLOSE_TIME` in the view are the filter view's times, as in the stylesheet.
    - The first editor gets the focus (its text selected); once the form has unfolded, it comes into view as far as it
      fits. When it closes, the focus goes back to where it was (e.g. the row's "Edit", or "Add" in the toolbar), else
      to the first button of the row's actions.
    - Enter in a text input saves, Escape cancels (it does not clear the selection). Not in an editor's popup (the list
      of a select: its keys are its own). Both are handled (`preventDefault`, `stopPropagation`), so a dialog around the
      table (e.g. the board manager's "Sections" drawer) neither confirms on Enter nor closes on Escape.
      - A native `keydown` listener on the form's cell, not React's `onKeyDown` (decided 2026-09-30): React handles
        events where its root is, and the dialog of the overlays package (its `<dialog>` in a shadow root gets the
        events of its slotted content first) confirmed on Enter before the form had marked it as handled.
    - Everything else is blocked (`inert`): the toolbar (the search box and the filter button too), all rows, the
      footer. The other rows and the footer are faded to 15% and the toolbar to 20%, as under the open filter view, in the same times
      (2026-10-04, the user's wish; `opacity: 0.4` and 180 ms before); the edited row is not, and the
      column headers are only blocked (they stay opaque over the rows). No reordering.
  - Saving: an edited row without a change just closes the form (no call); a new row is always created. While the save
    runs, "OK" shows a turning icon, and the editors and the buttons do nothing (the form keeps its focus). A
    rejection keeps the form open, with the draft, and shows the message (`role="alert"`, in `colorDanger`): the
    `Error`'s message, else `Texts.saveFailed`. The next change removes it.
    - A created row comes first on the page, and the total grows by one, until the next load puts it where the source
      has it (with `groupBy`, it may be a group of its own at the top until then).
  - A new load (a reload of the controller) closes the form; the draft is dropped. "Cancel" of a new row removes it.
  - The controller's target is kept current in a layout effect (it was a passive effect): a call right after a render
    (e.g. `editRow` from a click on a row that just came) gets the state of that render.
  - The demo ("React component" tab): "Edit" (the default action) opens the form of the names, the date of birth (the
    date editor), the email, the country, the role and, as extra fields, the city and the notes; "Add user" a new user (`newUser()`).
    `saveUser` and `createUser` in `data.ts` (in memory, 500 ms) fail for an empty name and an email without "@", and a
    toast says "Saved …" or "Added …".
  - Later: F2 or Enter on a focused row to start, validation per field (a message at the field) before the save,
    required fields, the element demo.
- Row details (expandable rows) are supported.
  - A chevron column sits right next to the selection column: pointing right when collapsed, down when expanded.
  - The chevron change is animated (a CSS rotation).
  - The detail cell spans only the data columns, not the meta columns (selection, details toggle) and not the action
    column.
  - Under the meta columns and under the action column, the detail row has empty cells (`role="presentation"`), so the
    horizontal lines continue through the detail row, and the vertical line before the action column.
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
    measured `top` and `right` of the loading overlay. The stylesheet holds no grid placement at all.
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
  `aria-busy`, from the start. After 200 ms, `data-dimmed` is set on the root and the loading bar appears.
  - The rows are dimmed by CSS (`opacity` on everything inside a row), so the header row is never dimmed.
  - The loading bar (`.loadingBar`, its segment a `::before`) sits at the top of an `overlay` inside the
    `scrollArea`, which starts below the measured header height (`useElementHeight`), set inline as its `top`, and
    ends before the scrollbar of the rows area (its reserved space, `scrollbar-gutter: stable`; measured with
    `useScrollbarWidth` as `offsetWidth - clientWidth` of the scroller, set inline as its `right`), so the bar is as
    wide as the rows and does not reach into the scrollbar.
  - The minimum height of the rows area is plain CSS (`calc(6 * var(--datnav-spacing-md))`). The header
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
- Block selection: the anchor is the key of the last clicked row (kept in a ref, no re-render). `applyRowClick` in
  `useDataNavigator.ts` picks: a plain click `selectOnly`, Ctrl/Cmd or Shift `selectByClick` (toggles a row or sets
  a range). The `Checkbox` widget reads `shiftKey` from the native change
  event and passes it on. Text selection is prevented with `preventDefault` on shift + mouse down
  (`suppressesTextSelection` in `utils.ts`).
- Row click: `isRowTarget` in `utils.ts` answers "did this hit the free space of a cell of the row".
  `isPlainRowClick` adds the text selection guard on top of it, `isPlainRowDoubleClick` does not. It is one check: rows are `display: contents`, so the cells are
  the direct children of the row, and the click target has to be one of them and not `data-control`. Everything else
  follows from that, so there is no list of interactive elements to keep up to date. The data row and the detail row
  share one `rowHandlers(key)` in the view, so they cannot drift apart.
- Texts: `useTexts` reads the `I18nAdapter` of the instance from the private `ConfigContext`. Without an adapter, or
  without a translation, the en-US defaults (in `texts.ts`) are used. Numbers in texts are formatted with `Intl.NumberFormat`.
- Popups (the list of a select, a menu, a tooltip) are Base UI's: it positions them (flipped when there is no room,
  kept inside the viewport, following scrolling). They are all rendered into the layer of the root (`LayerContext`).
- Tests choose an option of a Base UI select with the pointer sequence of a real mouse (`chooseIn` in the test file):
  Base UI ignores a bare click event on an option.
- Tests read the stylesheet with a `?raw` import (`vite.config.ts` lets Vitest process it).

## Todo (later)

- Cards in a narrow table (2026-10-05, the first step is done, see "Cards in a narrow table"). TBD:
  - Sorting: there are no column headers; e.g. a sort menu in the toolbar (the sortable columns, ascending or
    descending).
  - Select all: there is no header checkbox; e.g. in the selection bar or a line above the cards.
  - Reordering (`reorder`): no drag handles on cards yet (their rows cannot be moved in card mode).
  - The edit form in a card: it takes the card's place for now, without the folding animation, in the layout of the
    grid's form.
  - The breakpoint: fixed at 576px. A prop (`cardsBelow`), `'auto'` (cards when the columns do not fit at their
    minimum widths), or none.
  - Column groups: the labels are the leaf headers only; the group's header could prefix them or head a block.
  - Which columns a card shows: all shown ones now; a column option for "not in cards", or a title line (the first
    column bold, without a label).
  - Keyboard: no focus on cards, like the rows of the grid (only their controls).
  - A prop for the starting layout (`layout?: 'auto' | 'table' | 'cards'`, like `hidden` of a column), and keeping the
    chosen one (with the hidden columns and the widths).
  - The custom element: it renders the same view, so it gets cards and the layout choice too; its demo.
  - Look at it in a real browser (only the tests ran).

- The look of the data navigator (2026-10-04): the user does not like it yet. What exactly is not decided: ask first.
  Suspects, from what the demo shows in the root's cockpit:
  - Corners that do not match: the buttons are 5px (`buttonRadius`), the rest of the root page has 1 to 2px now (the
    modern look of `packages/mantine-themes`).
  - Too many lines: the full grid (vertical lines between all columns, and the row lines); horizontal lines only?
  - The header row: the gray, the bold labels, the sort arrows on every column.
  - The toolbar: an icon-only refresh, a bordered search field, outlined "Filters", "Add user", "Export": different
    weights, tight together.
  - Density and contrast: the row height (about 41px), the striped rows, light text and borders (a step stronger
    elsewhere now).
  - Tried 2026-10-04 (the user said go): the default theme's `buttonRadius` 5px → 2px, `colorBorder` one step stronger and
    a lighter `colorHoverAccent`: reverted the same day, the user's rule: the default theme (the `ui-*` values) is the same
    in every package and must never be changed in just one (see the root `CLAUDE.md`). A change of the look needs all
    packages (and the tokens of `ui.css`) together. Not done then: the pills (filter pills, count badge, selection pill)
    stay round by design. Open: which of the suspects was it, really?
  - 2026-10-05: improved step by step, seen in the Board Manager's tables on the root page (a "Table Lab" of the root,
    the meetings table alone, was made and removed the same day: the Board Manager shows the same): step 1, the
    vertical dividers beside the meta and the action columns are gone (see "Separators"; the one before the action column
    came back, lighter, later the same day); step 2, lighter lines between
    the rows (`colorDivider`); step 3, page numbers in the footer instead of the page field, round,
    the current one filled; step 4, the page size as a ghost button "10 per page" (see the footer).

- From the design spec of 2026-09-28 (filter popup, pills, selection bar), not done yet:
  - Look at it in a real browser (only written, not run: no Node.js was available to that session).
  - "Show only the selected rows": a click on the selection pill toggles it (the pill then solid, and the footer says
    "N selected shown" with "Show all" instead of the pager). Needs a change of the footer, which was out of scope.
  - The footer of the spec: "Rows" with the page size, "21–30 of 37". (Its page numbers, the current one in a light
    accent tint, came 2026-10-05: see the footer.)
  - The grid as one container with a hairline border and a 12px radius, and a slightly stronger line under the
    header. Out of scope for now (the table body was to stay as it is).
  - A date range with one open side (`Created ≥ Aug 1, 2026`): the calendars always pick both ends.
  - A pill text of its own for custom filters (e.g. `summary?: (value) => string` next to the filter function).
  - A multiple select with the chosen values as small inline tags (each with a ×), as the spec showed: the current
    comma separated trigger was kept (the user likes the current controls).

- Row grouping: groups loaded per group (a tree: only the group rows at first, expanding one loads its rows), with
  paging per group; collapsing that leaves the rows out of the query; "collapse all"; a way to tell a group continued
  from the page before.
- Row reordering: scrolling the rows area while dragging near its top or bottom edge (auto-scroll); moving several
  selected rows at once; a drop onto another page.
- Inline editing per cell (asked for 2026-09-30, by the board manager's "Sections" drawer, which renders its own
  inputs for now): the edit form came first (see "Row editing and new rows"); editing single cells (a double click or
  F2 on a cell) may follow, on the same `edit` of the columns.

- Review `reloadable`: should the source say whether its data can change (and so whether the Reload button makes
  sense), instead of a prop of the table? Decided for now: a prop, like `searchable` (showing the button is a UI
  decision, the source is a plain function, and nearly every remote source can change).
- Toolbar on narrow screens: the bar does not wrap yet. When space runs out, the search box should go on its own
  full-width line below the buttons.
- A hover color for danger (`--datnav-color-danger-hover`, one more token), so a filled danger button reacts on hover.

- Look at the demo in a real browser and polish the styling (group headers, spacing, dark mode, the native widgets,
  the popovers, both themes).
  - Not verified visually yet: only the tests and the build were run.
  - Check that the antd variables really reach the table through the `cssVar.key` class.

- Combobox and autocomplete (Base UI), when a filter needs one. Select and multiple select are unified already.

- Consider replacing Base UI with Zag.js (2026-10-05, the user's idea): the app cockpit uses Zag.js (with Lit), so all
  packages would have one headless library. Not now: only with a concrete reason, and then step by step.
  - For it: one library for all packages (the same concepts, keyboard and focus behavior, one dependency to keep up to
    date in the customers' copies); Zag's state machines are framework-independent (Base UI is React only), which fits
    the custom element better (today React on Preact plus Base UI) and a framework-free core (see below); probably a
    smaller bundle (Base UI costs about 69 kB gzip; Zag's machines come one by one; not measured).
  - Against it: a large rewrite of finely tuned widgets (the single and multiple selects, the menus with their radio
    items, the page size menu, the context menu with submenus, the tooltips, the date popover, the autocomplete with
    chips: the layer, the positioning, Escape, closing on a choice or not), on which many tests depend; more markup of
    our own (Zag's React adapter gives props to spread, no ready components); Base UI is stable (1.x) and blocks
    nothing; the choice of Base UI (over React Aria, Headless UI, …; see Theming) did not weigh Zag, so a switch
    revisits it on purpose.
  - If done: one kind of widget per step (tooltips, menus, selects, the context menu, the autocomplete), each with its
    tests; until the last step both libraries are bundled.

- `src/api.ts`, `src/react/api.ts`: add the final comments to all types, and group the `Props` properties with blank
  lines again.

- Array helper: turns an array into a `source` (client-side sorting, filtering and paging).
  - Name and place undecided (`DataNavigator.fromArray(rows)` or a separate export).
- Long-press tooltip on touch devices for icon-only actions (Base UI disables tooltips on touch). Try the icon-only
  buttons on a real touch device first.
- `Query.filters` with keys typed against the row type (`Query<Row>`), a possible later safety net.
- Array helper and filters: how the helper applies `Query.filters` (contains for text, equals for select, a list means
  "one of"), and how an own filter supplies its predicate.
- Controlled query state (`query` and `onQueryChange`), e.g. for URL sync or "reset all" from outside.
  - Design it as one unit, together with `pageSize` and the selection reset.
- Error state: what happens when `source` rejects (display, retry, texts in `DataNavigator.Texts`).
  - Not specified yet, and not part of the component or the demo yet.
- `rowKey` as a function `(row) => string`, for rows with a composite key. For now it is only a property name.
- To discuss: keep the details toggle column and the action column while there are no rows. Today both go away
  without data rows (their width is their content's), so the columns jump exactly when a filter or the search finds
  nothing, and the filter fields move under the cursor (the details column is on the left: every column moves).
  Suggestion: the details toggle column whenever `renderDetail` is given (its width is fixed: one toggle button); the
  action column whenever there are row actions for it, with the width it had the last time rows were shown (measured
  then; before the first load it is still missing). A fixed width does not work for it: its buttons may have labels.
- Custom element, when really needed: stable styling hooks for app CSS, `data-part="…"` attributes on the main pieces
  (`toolbar`, `header`, `row`, `cell`, `footer`, ...), e.g. `data-navigator [data-part="footer"] { … }` (the light DOM
  counterpart to `::part()`; our class names are generated and not stable).

## Open

- Linter (ESLint or none): not decided yet.
- Package layout: the import path of the stylesheet (e.g. `data-navigator/styles.css`). For now the build emits
  `dist/data-navigator.css` next to the three entries.
- Controlling the selection from outside: at least clearing it must be possible. Not for v1, discuss later.
