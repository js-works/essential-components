# form-validation

Form validation for React with Zod 4: a `useForm` hook, defined once per app with `defineUseForm(config)`.
The schema is the single source of truth, the rendering stays with the app's own field components.
The behavior and the open points are described in `README.md`.

## Conventions

The general rules (copies of the repository's master, `docs/conventions/`):

@docs/conventions/general.md
@docs/conventions/typescript.md
@docs/conventions/i18n.md
@docs/conventions/react.md

## Working rules

- Always add behavior details we decide (also small ones) to `README.md`, in the same step as the code.
- Add coding guidelines to this file whenever they result from our discussion, and tell the user.

## Stack (decided)

- TypeScript (strict), Vite (library mode), npm. React hook, no custom element.
- No runtime dependencies. Peer dependencies: `react` (`>=19`) and `zod` (`^4`), both outside the build.
- Tests: Vitest with jsdom, `@testing-library/react` and `@testing-library/user-event` (`src/**/*.test.ts(x)`, with
  `vitest.setup.ts`).
- A small demo (2026-10-07; `npm run dev`): a React sign-up form with the demo's own field components, the app's
  keys in English and German (following `<html lang>`), a made-up server (a taken email, a failing name).
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
- `demo/`: the demo (not part of the library; typechecked with it). `FormValidationDemo.ts`: the whole demo as a light DOM
  custom element (exported, not registered; see "Demo element" in the `CLAUDE.md` of the file upload; the root page
  registers it as `form-validation-demo`). `FormDemo.tsx`: the form and the schema. `fields.tsx`: text, select and
  checkbox field components. `FieldMessage.tsx`: the message of a field as a popover (2026-10-07, the user's wish; a copy of
  the Board Manager's `FieldError` of the root page, for a plain input: in the top layer, shown while the field has the
  focus, placed by script below the control, the arrow up or down; its CSS in `demo.css`). `useForm.ts`: `defineUseForm` once. `i18n.ts`: texts and adapter. `demo.css`, `ui/` (the
  design language, a copy of `packages/ui-theme/src`), `main.ts` + `index.html` (the standalone page).
- Commands:
  - `npm run dev`: the demo
  - `npm run build`: typecheck + library build (`dist/index.js`)
  - `npm run typecheck`
  - `npm test`: Vitest (once). `npm run test:watch`: watch mode
  - `npm run format`: dprint. `npm run format:check`
- Run `npm run format` and `npm run typecheck` after changes.

## Code rules

- No `export ... from` re-exports (import, then export).

## TODO

- `requestSubmit` in the overlays' form dialog (`<Form confirm>`), to check in a real dialog: on `{ ok: false }` both
  focus the first invalid field, form-validation at once (`focusFirstInvalid()`), the dialog by `aria-invalid="true"`,
  which it reads a few frames later (the re-render is batched). Check that the focus ends up in the right field.

- Edge case of the validation strategy vs. the browser's `:user-invalid`: a user types into a field, restores the old
  value (e.g. types "A" into an empty required field and deletes it) and leaves it. The browser fires no `change`, so
  the field is not "user invalid"; form-validation counts it as changed and shows the error on blur. Possible fix: a
  field counts as changed on blur only if its value differs from the value it had on focus. Left as it is for now
  (2026-10-02). Asking the browser (`el.matches(':user-valid, :user-invalid')`) was rejected: not every input component
  is based on a native, form-associated element, and one form would get two different rules.

- "No `any`" (the rule of the other packages: `unknown` and narrow it) is not applied yet. The code uses `any` for
  Zod internals (`_zod.def`, issue fields), `z.ZodObject<any>`, and the props of `field.x()` / `form()`
  (`Record<string, any>`, so they can be spread into any component). Decide whether and how to remove it.
- The tests do not run in the root's deploy workflow (`.github/workflows/deploy-demo.yml`, which runs the tests of
  `data-table` and `file-upload` before publishing the demo page). Decide whether to add them there.
