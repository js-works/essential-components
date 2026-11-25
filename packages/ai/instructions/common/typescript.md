# TypeScript conventions

- Strict mode.
- The API types live in the folder `src/api/`: types only.
  - `theme.ts` (the theme), `texts.ts` (the texts) and `i18n.ts` (the i18n adapter), where a package has them, are
    always files of their own: the same in every package, found by their names.
  - The rest in `base.ts` (the component, its class, its config, the items): the base that the theme, the texts and
    i18n build on, a generic name like theirs. A package with several topics there splits it by topic (`columns.ts`,
    `filters.ts`, …). Weighed: the package's name (not generic), `component.ts` (theme, texts and i18n are the
    component's too), `core.ts` (clashes with `src/core/`), `main.ts` (reads like an entry).
  - The entry exports them, one line per file: `export type * from './api/theme.js'`. A barrel (`src/api/index.ts`,
    only re-exports) where it is reasonable, e.g. when several entries share the types.
  - An add-on entry (e.g. `/react`) keeps its own API types in its folder (`src/react/api.ts`): the add-on can be
    removed in one piece.
  - A file or a folder by the number of topics, for the main part and an add-on alike: one topic, one file `api.ts`
    (`src/react/api.ts`); several topics, a folder `api/` with one file per topic (`src/api/theme.ts`, …).
  - Code inside the package imports the types by name from the entry (`import type { FileItem } from '../index.js'`)
    or from the topic files, never through a value import. No namespace import (`import type * as Spec`): the names
    are unique and carry their prefix already, so `Spec.FileItem` only repeats it.
- Type names: at least two words where reasonable, so the types of different packages do not collide in an app
  (auto-import, one file importing several packages).
  - A generic word gets a prefix: the package's name where that reads well (`DataTableTheme`, `FileUploadProps`),
    else the feature it belongs to (`RowQuery`, `TableColumn`, `NavGroup`, `ToastPlacement`).
  - Names that are specific already stay (`FilterValue`, `NavItem`, `FileItem`, `MenuSection`).
  - No name of a global type of the DOM or of JavaScript: it would hide that one in the files that import it. Not
    `Element`, `Node`, `Event`, `Text`, `Comment`, `Document`, `Range`, `Selection`, `File`, …
  - Unique within an entry. A further entry (e.g. `/react`) may replace a type of the same name with its own meaning
    (a `TableColumn` with `ReactNode` content): it has a barrel of its own, and the replaced types sit in files of
    their own, which only the main entry's barrel re-exports.
- Each entry exports the types flat: `export type * from './api/columns.js'` (or a barrel), used as
  `import type { TableColumn } from '@scope/data-table/react'`.
  - No type namespaces, no runtime (value) namespaces, no `declare namespace`.
- `.tsx` only for a file with JSX, else `.ts`: `user-filters.ts` (factory calls only), `user-flows.tsx` (forms in
  dialogs). The imports do not change: they end in `.js` either way.
- Something to dispose (a scope, a subscription) with `using`, not `try` and `finally` with `dispose()`:
  `using scope = dialogs.open();`, disposed at the end of the block. The build lowers it (`build.target: 'es2024'`).
- Relative imports end in `.js`, also for `.ts` and `.tsx` files: `from './theme.js'`; a folder by its index,
  `from './api/index.js'`. It works with every setup (a bundler, `tsc` emitting files, Node's ESM,
  `moduleResolution: nodenext`); without an extension only with a bundler. Not for imports with their own extension
  (`./styles.css`, `?inline`).
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
- "Not set" (a missing value) in plain objects (configs, items) and React props: an optional field, left out
  (`maxFiles?: number`), so `undefined`. `null` there only for an argument that is always passed and explicitly has no
  value (`params` of the i18n adapter's `translate`).
  - Never a magic number (`-1`, `NaN`) for "not set".
- Class members are either public or `#private` (ECMAScript private fields). Never the TypeScript `private` or
  `protected` keywords.
- No `any`: use `unknown` and narrow it. No `@ts-ignore`; `@ts-expect-error` only with a reason comment.
- `readonly` wherever useful and reasonable:
  - arrays in public types: `readonly T[]` (input we don't own must not be mutated)
  - class fields that are never reassigned
  - constant lookup data: `constant(…)` (see Constants above)
  - not needed for props or local variables (`const` is enough there); SonarQube's rule for it (`typescript:S6759`,
    "Mark the props of the component readonly") does not apply.
- Named exports only, never `export default`.
  - Per file, exports are declared in exactly two places, directly after the imports: at most one `export { … }` for
    values and at most one `export type { … }` for types.
  - Never `export` on the declarations themselves. Except where a framework documents that form, e.g. a route file of
    TanStack Router's file-based routing: `export const Route = createFileRoute(…)({ … })`.
  - The public API is exactly what the package's entries export. Everything else is internal.
- Imports in three groups, an empty line between them (like IntelliJ's import layout): the packages of npm (and
  Node's), the repository's own packages (e.g. `@scope/…`), the relative ones. Sorted within a group, by module, an
  `import type` before the value import of the same module. No other empty lines between imports. An export statement
  that spans several lines gets an empty line after it:
  ```ts
  import { useMemo } from 'react';

  import { selectFilter, textFilter, useDataTableController } from '@scope/data-table/react';
  import { useDialogs } from '@scope/overlays/react';

  import type { User } from '../../domain/index.js';
  import { useTranslate } from '../../shared/lib/i18n/index.js';
  ```
