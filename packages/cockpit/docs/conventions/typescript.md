# TypeScript conventions

- Strict mode.
- The API types live in `src/api.ts`: types only, flat exports. `src/index.ts` re-exports them as a namespace:
  `export type * as DataTable from './api'`, so users write `DataTable.Theme`.
  - Type-only namespaces are fine. No runtime (value) namespaces, no `declare namespace`.
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
