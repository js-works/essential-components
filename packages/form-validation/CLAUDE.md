# form-validation

Form validation for React with Zod 4: a `useForm` hook, defined once per app with `defineUseForm(config)`.
The schema is the single source of truth, the rendering stays with the app's own field components.
The behavior and the open points are described in `README.md`.

## Working rules

- Design first: discuss the API step by step.
  - Do NOT implement anything until the user gives an explicit GO.
- Keep answers short: not longer than necessary to understand them. No long recaps or lists of what was done.
  One topic per step.
- When offering alternatives, number them, add small code examples, and always state which one is proposed and
  how confident that proposal is (e.g. a percentage).
- Prefer bullet lists over prose, in answers and in this file, wherever reasonable.
- English is the language of the project: code, comments, docs, specs and rules. Never German there.
  - Exception: translated texts, like the message catalogs in `src/messages/` and the German labels in the tests.
  - The conversation may be German.
- Never run `git commit` or `git push`.
  - The user does this personally.
  - This overrides any default attribution or commit guidance.
- Never read, list or scan anything outside this project folder.
  - This includes sibling projects, parent folders, the repo root and the home directory (e.g. `~/.claude`).
  - Only the user may explicitly grant an exception for a specific path.
- Always add behavior details we decide (also small ones) to `README.md`, in the same step as the code.
- Add coding guidelines to this file whenever they result from our discussion, and tell the user.

## Stack (decided)

- TypeScript (strict), Vite (library mode), npm. React hook, no custom element.
- No runtime dependencies. Peer dependencies: `react` (`>=19`) and `zod` (`^4`), both outside the build.
- Tests: Vitest with jsdom, `@testing-library/react` and `@testing-library/user-event` (`src/**/*.test.ts(x)`, with
  `vitest.setup.ts`). No demo for now.
- npm never runs install scripts of dependencies: `.npmrc` has `ignore-scripts=true`.
- npm only installs versions that are at least 7 days old: `.npmrc` has `min-release-age=7`.
- `.editorconfig`: 2 spaces, LF, UTF-8, max line length 120
- Formatter: dprint (`dprint.json`), line width 120. Not Prettier. Single quotes in TS.

## Project layout and commands

- `src/index.ts`: the public API (`defineUseForm`, `binding`, `formMeta`, `formRegistry`, `catalogs` and the types).
- `src/defineUseForm.ts`: the hook factory: the store (values, errors, dirty and shown fields), events, submit and
  the props of `form()` and `field.x()`.
- `src/types.ts`: the public types.
- `src/schema.ts`: reads the fields from the Zod schema (kind, semantic type, required, default, bounds).
- `src/issues.ts`: turns Zod issues into message keys with parameters.
- `src/i18n.ts`: the translator (adapter, app messages, catalogs), `Intl` formatting, plural forms, `humanize`.
- `src/messages/`: the bundled catalogs (de, en, fr, es, ru, hu, ar, zh-CN, zh-TW) and `localeCandidates`.
- `src/meta.ts`: `formMeta` (an own Zod registry) and `binding`. `src/merge.ts`: `mergeProps` (chained handlers,
  combined refs).
- `src/defineUseForm.test.tsx`: the tests.
- Commands:
  - `npm run build`: typecheck + library build (`dist/index.js`)
  - `npm run typecheck`
  - `npm test`: Vitest (once). `npm run test:watch`: watch mode
  - `npm run format`: dprint. `npm run format:check`
- Run `npm run format` and `npm run typecheck` after changes.

## Code rules

- Named exports only, never `export default`.
  - Per file, exports are declared in exactly two places, directly after the import statements at the top:
    - at most one `export { ... }` for implementations
    - at most one `export type { ... }` for types
  - Never put `export` on the declarations themselves, and no `export ... from` re-exports (import, then export).
  - The public API is exactly what `src/index.ts` re-exports. Everything else is internal.
- Every public API change comes with a Vitest test.
- Ask before adding a dependency.

## TODO

- "No `any`" (the rule of the other packages: `unknown` and narrow it) is not applied yet. The code uses `any` for
  Zod internals (`_zod.def`, issue fields), `z.ZodObject<any>`, and the props of `field.x()` / `form()`
  (`Record<string, any>`, so they can be spread into any component). Decide whether and how to remove it.
- The tests do not run in the root's deploy workflow (`.github/workflows/deploy-demo.yml`, which runs the tests of
  `data-navigator` and `file-upload` before publishing the demo page). Decide whether to add them there.
