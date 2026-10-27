# TypeScript conventions

- Strict mode.
- The API types live in the folder `src/api/`: types only.
  - `theme.ts` (the theme), `texts.ts` (the texts) and `i18n.ts` (the `I18nAdapter`) are always files of their own:
    the same in every package, found by their names.
  - The rest in `base.ts` (`src/api/base.ts`: the element, its class, its config, the items): the base that the
    theme, the texts and i18n build on, a generic name like theirs. A package with several topics there splits it by
    topic (`columns.ts`, `filters.ts`, …). Weighed: the package's name (not generic), `component.ts` (theme, texts and
    i18n are the component's too), `core.ts` (clashes with `src/core/`), `main.ts` (reads like an entry).
  - The entry exports them, one line per file: `export type * from './api/theme.js'`. A barrel (`src/api/index.ts`,
    only re-exports) where it is reasonable, e.g. when several entries share the types (`data-table`, `overlays`).
  - An add-on entry (e.g. `/react`) keeps its own API types in its folder (`src/react/api.ts`): the add-on can be
    removed in one piece. (The data table's `src/api/react/` is still to be moved.)
  - A file or a folder by the number of topics, for the main part and an add-on alike: one topic, one file `api.ts`
    (`src/react/api.ts`); several topics, a folder `api/` with one file per topic (`src/api/theme.ts`, …). The main
    part always has several (theme, texts, i18n).
  - Code inside the package imports the types by name from the entry (`import type { FileItem } from '../index.js'`)
    or from the topic files, never through a value import. No namespace import (`import type * as Spec`): the names
    are unique and carry their prefix already, so `Spec.FileItem` only repeats it.
- Type names: at least two words where reasonable, so the types of different packages do not collide in an app
  (auto-import, one file importing several packages).
  - A generic word gets a prefix: the package's name where that reads well (`DataTableTheme`, `FileUploadProps`,
    `CockpitTheme`), else the feature it belongs to (`RowQuery`, `TableColumn`, `NavGroup`, `ToastPlacement`).
  - Names that are specific already stay (`FilterValue`, `NavItem`, `FileItem`, `MenuSection`).
  - The class an element factory returns is the package's name and `Class` (`DataTableClass`, `FileUploadClass`), its
    config named after the factory (`FileUploadClassConfig`, `DataTableComponentConfig`).
  - No name of a global type of the DOM or of JavaScript: it would hide that one in the files that import it. Not
    `Element`, `Node`, `Event`, `Text`, `Comment`, `Document`, `Range`, `Selection`, `File`, …: the element's type is
    the package's name and `Element` (`FileUploadElement`, `CockpitElement`, `DataTableElement`).
  - Unique within an entry. A further entry (e.g. `/react`) may replace a type of the same name with its own meaning
    (the data table's `TableColumn` with `ReactNode` content): it has a barrel of its own (`src/api/react/index.ts`),
    and the replaced types sit in files of their own, which only the main entry's barrel re-exports.
- Each entry exports the types flat: `export type * from './api/columns.js'` (or a barrel), used as
  `import type { TableColumn } from '@local/data-table/react'`.
  - No type namespaces, no runtime (value) namespaces, no `declare namespace`.
- `.tsx` only for a file with JSX, else `.ts`: `board-filters.ts` (factory calls only), `board-flows.tsx` (forms in
  dialogs). The imports do not change: they end in `.js` either way.
- Something to dispose (a dialog scope of the overlays) with `using`, not `try` and `finally` with `dispose()`:
  `using scope = dialogs.open();`, disposed at the end of the block. The builds lower it (`build.target: 'es2024'`,
  see `general.md`).
- Relative imports end in `.js`, also for `.ts` and `.tsx` files: `from './theme.js'`; a folder by its index,
  `from './api/index.js'`. It works with every setup a customer's copy may have (a bundler, `tsc` emitting files,
  Node's ESM, `moduleResolution: nodenext`); without an extension only with a bundler. Not for imports with their own
  extension (`./styles.css`, `?inline`).
- Constants (Google's Java style guide, made checkable): every fixed value of data at the top level of a module is a
  constant, named in CONSTANT_CASE.
  - Numbers, strings and booleans as they are; objects and arrays (lookup tables, lists, a default theme) through the
    package's `constant(…)` (`core/utils.ts`): it freezes the value deeply, and its type is that of the literal (like
    `as const`, which it makes unneeded, except before a `satisfies`, which drops the literal types). So the name
    never claims more than the code enforces.
    ```ts
    const DEFAULT_PAGE_SIZE = 50;
    const DEFAULT_PAGE_SIZES = constant([25, 50, 100, 200, 500]);
    const STATUS_ICONS = constant({ ready: 'file', done: 'done' } as const satisfies Record<Status, Icon>);
    ```
  - camelCase for the rest: functions (also as a `const`), symbols (used like names), objects with behavior (an
    adapter, a context, a DOM element), local variables.
  - Weighed: CONSTANT_CASE only for primitives (a list of defaults beside its single default would differ), Google's
    "deeply immutable" by intent (`as const` is only a type: the objects stay mutable at run time); the name
    `deepFreeze` ("deep" looks odd at a flat list).
- "Not set" (a missing value). A property returns the value with its meaning; `null` only where no value exists.
  - An element's properties follow the DOM:
    - `string`: `''` (`name`, `label`).
    - `boolean`: `false`, the attribute missing (`disabled`).
    - A set of values: its default (`density`: `'normal'`).
    - `number` with a meaning for "not set" (a limit, a count, a size): plain `number`, that value as the default: no
      minimum `0`, no maximum `Infinity`, else the default (`maxParallel`: `3`). `Infinity` removes the attribute (it
      cannot be written); a missing or invalid attribute is the default.
    - `number` without one (a field's value, a chosen index): `number | null`.
    - An object or a function: `null` for none (`upload: UploadFunction | null`, like `onclick` and `form`).
  - Never a magic number (`-1`, `NaN`) for "not set".
  - An invalid value: the setter throws a `RangeError` (a negative limit), like `input.maxLength = -3`.
  - Plain objects (configs, items) and React props: an optional field, left out (`maxFiles?: number`), so `undefined`.
    `null` there only for an argument that is always passed and explicitly has no value (`params` of `resolveText`).
  - Weighed: `undefined` for the element's properties (TypeScript's own guideline, but an element's API is the DOM's);
    `-1` like `input.maxLength` (a value to translate).
- Class members are either public or `#private` (ECMAScript private fields). Never the TypeScript `private` or
  `protected` keywords.
- No `any`: use `unknown` and narrow it. No `@ts-ignore`; `@ts-expect-error` only with a reason comment.
- `readonly` wherever useful and reasonable:
  - arrays in public types: `readonly T[]` (input we don't own must not be mutated)
  - class fields that are never reassigned
  - constant lookup data: `constant(…)` (see Constants above)
  - not needed for props or local variables (`const` is enough there); SonarQube's rule for it (`typescript:S6759`,
    "Mark the props of the component readonly") does not apply. SonarQube for IDE does not analyze the repository
    (`sonarlint.analysisExcludesStandalone: "**/*"` in `.vscode/settings.json`): its rules cannot be switched off per
    project, `sonarlint.rules` only works in the user settings.
- Named exports only, never `export default`.
  - Per file, exports are declared in exactly two places, directly after the imports: at most one `export { … }` for
    values and at most one `export type { … }` for types.
  - Never `export` on the declarations themselves. Except in a route file of TanStack Router's file-based routing:
    `export const Route = createFileRoute(…)({ … })`, the router's documented form.
  - The public API is exactly what the package's entries export. Everything else is internal.
- Imports in three groups, an empty line between them (like IntelliJ's import layout): the packages of npm (and
  Node's), the repository's own packages (`@local/…`), the relative ones. Sorted within a group, by module, an
  `import type` before the value import of the same module. No other empty lines between imports. The repository's
  `npm run format` does it, the packages included (Biome's organize imports, the root's `biome.json`); a package's
  dprint leaves the order alone (`maintain`), so a copy outside keeps it, and sorts by hand. An export statement that
  spans several lines gets an empty line after it:
  ```ts
  import { useMemo } from 'react';

  import {
    dateRangeFilter,
    defineActions,
    defineColumns,
    defineFilters,
    selectFilter,
    textFilter,
    useDataTableController,
  } from '@local/data-table/react';
  import { useDialogs } from '@local/overlays/react';

  import type { Board } from '../../domain/index.js';
  import { useTranslate } from '../../shared/lib/i18n/index.js';
  ```
