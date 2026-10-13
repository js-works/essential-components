# TypeScript conventions

- Strict mode.
- The API types live in the folder `src/api/` (2026-10-12): types only, one file per topic.
  - `theme.ts` (the theme), `texts.ts` (the texts) and `i18n.ts` (the `I18nAdapter`) are files of their own;
    the rest by topic (`config.ts`, `events.ts`, …).
  - `src/api/index.ts` only re-exports them: `export type * from './theme.js'`, one line per file.
  - Short type names (`Theme`, `Column`), no package prefix; unique within an entry's namespace (`DialogTheme`,
    `ToastTheme`).
  - No name of a global type of the DOM or of JavaScript (2026-10-13, the user's rule): it would hide that one in the
    files that import it. Not `Element`, `Node`, `Event`, `Text`, `Comment`, `Document`, `Range`, `Selection`, `File`,
    …: the element's type is the package's name and `Element` (`FileUploadElement`, `CockpitElement`,
    `DataTableElement`).
- Each entry exports the types as one type namespace, the package's name in camelCase (like the i18n namespace):
  `export type * as dataTable from './api/index.js'`. Values stay flat exports.
  - Why: the editor's auto-import offers one `dataTable`, not a `Theme` of every package; and the namespace does not
    clash with the app's component (`DataTable`).
  - Usage: `import type { dataTable } from '@local/data-table'`, then `dataTable.Column<User>`.
  - A further entry (e.g. `/react`) exports the same namespace, with its own types added to it (e.g. `Props`), from
    a barrel of its own (`src/api/react/index.ts`). It may replace types of the same name with its own meaning (the
    data table's `Column` with `ReactNode` content, 2026-10-12): then the replaced ones sit in files of their own,
    which only the main entry's barrel re-exports.
  - No runtime (value) namespaces, no `declare namespace`.
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
