# form-validation

Form validation for React with Zod 4: a `useForm` hook, defined once per app with `defineUseForm(config)`.
The schema is the single source of truth, the rendering stays with the app's own field components.
The behavior and the open points are described in `README.md`.

## Conventions

The general rules (`packages/ai`, always copied along with this package):

@../../ai/instructions/common/general.md
@../../ai/instructions/common/typescript.md
@../../ai/instructions/frontend/general.md
@../../ai/instructions/frontend/i18n.md
@../../ai/instructions/frontend/react.md

This repository's rules for it (see the root's `CLAUDE.md`):

- Tier 1 (for React apps): no UI library, no i18n library (an `I18nAdapter`), its theme a JS object. A tier-2 package may
  depend on it, never the other way round.

## Working rules

- Always add behavior details we decide (also small ones) to `README.md`, in the same step as the code.

## Stack (decided)

- TypeScript (strict), Vite (library mode), npm. React hook, no custom element.
- No dependencies. Peer dependencies: `react` (`>=19`) and `zod` (`^4`), both outside the build.
- Tests: Vitest with jsdom, `@testing-library/react` and `@testing-library/user-event` (`src/**/*.test.ts(x)`, with
  `vitest.setup.ts`).
  Mantine (`@mantine/core`, `@mantine/hooks`, `@mantine/dates`, `dayjs`) as dev dependencies only, for the tests with
  its real components.
- A small demo (`npm run dev`): a React sign-up form with the demo's own field components, the app's
  keys in English and German (following `<html lang>`), a made-up server (a taken email, a failing name).
- npm never runs install scripts of dependencies: `.npmrc` has `ignore-scripts=true`.
- npm only installs versions that are at least 7 days old: `.npmrc` has `min-release-age=7`.
- `.editorconfig`: 2 spaces, LF, UTF-8, max line length 120
- Formatter: dprint (`dprint.json`), line width 120. Not Prettier. Single quotes in TS.

## Project layout and commands

- `exports` in `package.json` (rather than an alias per package and entry in the root): each entry has a `source` condition first, its file in `src/`, then its built file in `dist/`.
  The root's demo resolves the package by name (`@local/…`) to its sources by that condition (its `vite.config.ts`
  and `tsconfig.json`); everywhere else, a customer's copy too, the condition is ignored and `dist/` counts.
- `src/index.ts`: the public API (`defineUseForm`, `binding` and the types,
  all flat: `import type { UseFormOptions } from '@local/form-validation'`).
- `src/define-use-form.ts`: the hook factory: the store (values, errors, dirty and shown fields), events, submit and
  the props of `form()` and `field.x()`.
- `src/api/`: the public types: `fields.ts` (bindings, field options and props),
  `form.ts` (`UseFormOptions`, `UseFormReturn`, the submit, `FormConfig`), `texts.ts`
  (`FormValidationTextKey`, `FormValidationParams`, read from the English messages), `i18n.ts` (`I18nAdapter`, `TextParams`: a
  verbatim copy of those in `frontend/i18n.md`);
  `src/index.ts` exports them (no barrel).
- `src/schema.ts`: reads the fields from the Zod schema (kind, semantic type, required, default, bounds).
- `src/issues.ts`: turns Zod issues into message keys with parameters.
- `src/i18n.ts`: the translator (the adapter, the English default of `texts/en.ts`), `humanize`.
- `src/texts/en.ts`: the English (en-US) texts as functions of their values and the locale (typed), the library's
  default and the master.
- `locales/`: the translations as ICU messages (`en.json`, `de.json`), derived from the master, by hand (or the AI) after
  every change; exported as they are (`@local/form-validation/locales/de.json`), no part of the build.
- `src/binding.ts`: `binding`. `src/merge.ts`: `mergeProps` (chained handlers,
  combined refs).
- `src/define-use-form.test.tsx`: the tests. `src/mantine.test.tsx`: Mantine's real components with the defaults (no bindings, only
  Mantine's prop names): the value each gives, its message, the initial values. `src/texts.test.ts`: the files in `locales/` match the master (keys, values).
- `demo/`: the demo (not part of the library; typechecked with it). `form-validation-demo.ts`: the whole demo as a light DOM
  custom element (exported, not registered; see "Demo element" in the `CLAUDE.md` of the file upload; the root page
  registers it as `form-validation-demo`). `form-demo.tsx`: the form and the schema. `fields.tsx`: text, select and
  checkbox field components. `field-message.tsx`: the message of a field as a popover (a copy of
  the Board Manager's `FieldError` of the root page, for a plain input: in the top layer, shown while the field has the
  focus, placed by script below the control, the arrow up or down; its CSS in `demo.css`). `use-form.ts`: `defineUseForm` once. `i18n.ts`: texts and adapter. `demo.css`, `ui/` (the
  design language, a copy of `frontend/design-language.md`), `main.ts` + `index.html` (the standalone page).
- Commands:
  - `npm run dev`: the demo
  - `npm run build`: typecheck + library build (`dist/index.js`)
  - `npm run typecheck`
  - `npm test`: Vitest (once). `npm run test:watch`: watch mode
  - `npm run format`: dprint. `npm run format:check`
- Run `npm run format` and `npm run typecheck` after changes.

## Texts (decided)

- The texts come only from the app's adapter (`translate(…)`, `frontend/i18n.md`); without one, or without a
  translation (`null`), the library's English default: functions of the values and the locale (`Intl`, the plural by
  `count === 1`). The library renders English only, never ICU or another format, and has no translations of its own
  at run time.
- The params go raw to the adapter, so the translation formats them and picks the plural (the value of a plural is
  `count`: `string.min`, `string.max`, `string.length`).
- The translations as ICU JSON (`locales/en.json`, `locales/de.json`), for the app's i18n with ICU; `en.json` (American
  English) too, so the app's i18n knows every key.

## Code rules

- No `export ... from` re-exports (import, then export). Except the types (`typescript.md`):
  the entry's `export type * from './api/….js'`.

## TODO

- The demo shows the messages in English only (its small adapter has no ICU).

- `requestSubmit` in the overlays' form dialog (`<Form confirm>`), to check in a real dialog: on `{ ok: false }` both
  focus the first invalid field, form-validation at once (`focusFirstInvalid()`), the dialog by `aria-invalid="true"`,
  which it reads a few frames later (the re-render is batched). Check that the focus ends up in the right field.

- Edge case of the validation strategy vs. the browser's `:user-invalid`: a user types into a field, restores the old
  value (e.g. types "A" into an empty required field and deletes it) and leaves it. The browser fires no `change`, so
  the field is not "user invalid"; form-validation counts it as changed and shows the error on blur. Possible fix: a
  field counts as changed on blur only if its value differs from the value it had on focus. Left as it is for now. Asking the browser (`el.matches(':user-valid, :user-invalid')`) was rejected: not every input component
  is based on a native, form-associated element, and one form would get two different rules.

- "No `any`" (the rule of the other packages: `unknown` and narrow it) is not applied yet. The code uses `any` for
  Zod internals (`_zod.def`, issue fields), `z.ZodObject<any>`, and the props of `field.x()` / `form()`
  (`Record<string, any>`, so they can be spread into any component). Decide whether and how to remove it.
- The tests do not run in the root's deploy workflow (`.github/workflows/deploy-demo.yml`, which runs the tests of
  `data-table` and `file-upload` before publishing the demo page). Decide whether to add them there.
