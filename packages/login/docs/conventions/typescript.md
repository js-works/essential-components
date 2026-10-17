# TypeScript conventions

- Strict mode.
- The API types live in the folder `src/api/` (2026-10-12): types only, one file per topic.
  - `theme.ts` (the theme), `texts.ts` (the texts) and `i18n.ts` (the `I18nAdapter`) are files of their own;
    the rest by topic (`config.ts`, `events.ts`, …).
  - The entry exports them, one line per file: `export type * from './api/theme.js'` (2026-10-14). A barrel
    (`src/api/index.ts`, only re-exports) where it is reasonable, e.g. when several entries share the types
    (`data-table`, `file-upload`, `overlays`).
  - Code inside the package imports the types from the entry (`import type * as Spec from '../index.js'`) or from
    the topic files, never through a value import.
- Type names (2026-10-14, the user's decision): at least two words where reasonable, so the types of different
  packages do not collide in an app (auto-import, one file importing several packages).
  - A generic word gets a prefix: the package's name where that reads well (`DataTableTheme`, `FileUploadProps`,
    `CockpitTheme`), else the feature it belongs to (`RowQuery`, `TableColumn`, `NavGroup`, `ToastPlacement`).
  - Names that are specific already stay (`FilterValue`, `NavItem`, `FileItem`, `MenuSection`).
  - The class an element factory returns is the package's name and `Class` (`DataTableClass`, `FileUploadClass`), its
    config named after the factory (`FileUploadClassConfig`, `DataTableComponentConfig`).
  - No name of a global type of the DOM or of JavaScript (2026-10-13, the user's rule): it would hide that one in the
    files that import it. Not `Element`, `Node`, `Event`, `Text`, `Comment`, `Document`, `Range`, `Selection`, `File`,
    …: the element's type is the package's name and `Element` (`FileUploadElement`, `CockpitElement`,
    `DataTableElement`).
  - Unique within an entry. A further entry (e.g. `/react`) may replace a type of the same name with its own meaning
    (the data table's `TableColumn` with `ReactNode` content): it has a barrel of its own (`src/api/react/index.ts`),
    and the replaced types sit in files of their own, which only the main entry's barrel re-exports.
- Each entry exports the types flat (2026-10-14; a type namespace per package for two days before):
  `export type * from './api/columns.js'` (or a barrel), used as
  `import type { TableColumn } from '@local/data-table/react'`.
  - No type namespaces, no runtime (value) namespaces, no `declare namespace`.
- `.tsx` only for a file with JSX, else `.ts` (2026-10-16, the user's choice): `board-filters.ts` (factory calls only),
  `board-flows.tsx` (forms in dialogs). The imports do not change: they end in `.js` either way.
- Something to dispose (a dialog scope of the overlays) with `using` (2026-10-16, the user's wish), not `try` and
  `finally` with `dispose()`: `using scope = dialogs.open();`, disposed at the end of the block. The builds lower it
  (`build.target: 'es2024'`, see `general.md`).
- Relative imports end in `.js` (2026-10-13), also for `.ts` and `.tsx` files: `from './theme.js'`; a folder by its
  index, `from './api/index.js'`. It works with every setup a customer's copy may have (a bundler, `tsc` emitting
  files, Node's ESM, `moduleResolution: nodenext`); without an extension only with a bundler. Not for imports with
  their own extension (`./styles.css`, `?inline`).
- Class members are either public or `#private` (ECMAScript private fields). Never the TypeScript `private` or
  `protected` keywords.
- No `any`: use `unknown` and narrow it. No `@ts-ignore`; `@ts-expect-error` only with a reason comment.
- `readonly` wherever useful and reasonable:
  - arrays in public types: `readonly T[]` (input we don't own must not be mutated)
  - class fields that are never reassigned
  - constant lookup data: `as const`
  - not needed for props or local variables (`const` is enough there)
- Named exports only, never `export default`.
  - Per file, exports are declared in exactly two places, directly after the imports: at most one `export { … }` for
    values and at most one `export type { … }` for types.
  - Never `export` on the declarations themselves.
  - The public API is exactly what the package's entries export. Everything else is internal.
- Imports in three groups, an empty line between them (2026-10-17, the user's choice, proposed at about 60%, like
  IntelliJ's import layout): the packages of npm (and Node's), the repository's own packages (`@local/…`), the relative
  ones. Sorted within a group, by module, an `import type` before the value import of the same module. No other empty
  lines between imports. The repository's `npm run format` does it, the packages included (Biome's organize imports, the
  root's `biome.json`); a package's dprint leaves the order alone (`maintain`), so a copy outside keeps it, and sorts by
  hand. (2026-10-15 to 2026-10-17 instead: an empty line before and after every import that spans several lines; a
  script kept it for a few hours: dprint left the empty lines when it joined an import into one line.) An export
  statement that spans several lines gets an empty line after it (2026-10-15):
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
