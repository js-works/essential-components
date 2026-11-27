# overlays

`@local/overlays`: dialogs and toasts (`README.md`).

## Conventions

The general rules (`packages/ai`, always copied along with this package):

@../../ai/instructions/common/general.md
@../../ai/instructions/common/typescript.md
@../../ai/instructions/frontend/general.md
@../../ai/instructions/frontend/css.md
@../../ai/instructions/frontend/i18n.md
@../../ai/instructions/frontend/react.md
@../../ai/instructions/frontend/custom-elements.md

This repository's rules for it (see the root's `CLAUDE.md`):

- Tier 1 (for any stack): no UI library, no i18n library (an `I18nAdapter`), its theme a JS object. A tier-2 package may
  depend on it, never the other way round.
- Its default theme follows the design language (`ui.css`, its `ui-*` values; radii: `2px` for controls, `5px` for
  buttons, larger surfaces a bit rounder, dialogs `6px`): the same in every package that has one, never changed in just
  one of them. The `--ui-*` tokens only in its demo, never in `src/main/`.

## Working rules

- Its own code style: double quotes, no dprint; its imports sorted by the repository's Biome, like every package (the
  `.js` suffixes on relative imports are the rule of every package, `typescript.md`).
- The demo rules are in the comment of `src/demo/overlays-demo.ts`.
- `exports` in `package.json` (rather than an alias per package and entry in the root): the entries `.` and `./react`
  have a `source` condition first, their files in `src/`, then the built files in `dist/`. The root's demo resolves
  the package by name (`@local/…`) to its sources by that condition (its `vite.config.ts` and `tsconfig.json`);
  everywhere else, a customer's copy too, the condition is ignored and `dist/` counts.
- The API types live in `src/main/api/` (`typescript.md`):
  - `dialogs/` (`dialog.ts`, `adapter.ts`, `content.ts`, `theme.ts`), `toasts/` (`toast.ts`, `adapter.ts`, `theme.ts`),
    `theme.ts` (`ThemePalette`, `Themes`: both features), `texts.ts` (`OverlaysTextKey`, `OverlaysParams`, read from
    the English texts), `i18n.ts` (`I18nAdapter`, `TextParams`: a verbatim copy of those in `frontend/i18n.md`);
    `index.ts` re-exports them.
  - Per binding entry: `dom/`, `lit/`, `react/` (its `content.ts`, React's `provider.ts` too), each with an `index.ts`
    that re-exports `../index.js` and its own files.
  - The runtime code is beside its feature: `dialogs/theme.ts`, `dialogs/texts.ts` (the internal `TextKey`),
    `dialogs/form-data.ts`, `dialogs/view.ts` (the internal view types), `toasts/theme.ts`, `toasts/view.ts` (the
    policy helpers).
  - Every entry exports values and types flat (`import type { DialogTheme } from "@local/overlays/react"`).
  - Public: all exports of `api/dialogs/dialog.ts` (`DialogAborted`, `DialogAnswered`, `DialogDismissed`,
    `AnyDialogResult`, the parts of the result types).
  - `OverlaysConfig` keeps its name.
- Not yet following the conventions (older than them; to be discussed, not changed on the side):
  - Exports on the declarations (`export function …`) and TypeScript `private` in places (`typescript.md`).
- Texts (`frontend/i18n.md`): the English ones of both features in `src/main/texts/en.ts` (the master; no values),
  the namespace `'overlays'`; `textOf(i18n, key)` (`src/main/i18n/texts.ts`) asks the adapter's `translate`, `null`
  (or no adapter): English. The page's language is never read.
  - The adapter: `i18n` of `createDialogsController` and `createToastController` (a value; the configs are live,
    `configure()` of the toasts too), `config.i18n` of the React `OverlaysProvider` for both: the provider is rendered
    by the app, so the app builds the adapter with its own hooks (no `useI18n` here).
  - Its `onChange`: a dialog scope subscribes while its element is mounted and rebuilds the dialog on screen (content
    and input stay); the toasts' controller subscribes for its life and re-renders the stack. The provider also
    rebuilds the dialog on screen when its `i18n` is a new object (an i18n that only exists inside React), and
    compares it by identity for the toasts.
  - The translations: ICU messages, `locales/en.json`, `locales/de.json` (exported as `@local/overlays/locales/*.json`),
    derived from the master by hand (or the AI); `src/test/texts/texts.test.ts` checks them (`npm test`, Vitest).
- The dialogs' theme: its values are put straight into the dialog's stylesheet (`styleText(theme)` in
  `src/main/dialogs/element/styles.ts`, built once per theme), no `--dialog-*` custom properties on the host (they
  would inherit into the slotted content). The controller merges the caller's tokens over `defaultDialogTheme` once
  per scope. The template string's `${…}` stay in value positions, so the CSS tooling of `` css`…` `` keeps working.
- The toasts' theme: the same way. The controller merges the caller's tokens over `defaultToastTheme` and gives the
  theme to its stack container (`setToastTheme` in `src/main/toasts/element.ts`): each toast takes the shadow
  stylesheet of its stack's theme on connect (and at once on a `configure()`). The colors of the slotted action
  buttons (light DOM) are in a `<style>` inside the container (`themedContainerStyles` in `src/main/toasts/styles.ts`),
  scoped to it by a prelude-less `@scope`, with `:scope` in the selectors for the specificity (0,3,1) that beats the
  app's button styles. No custom properties on the container.
- The ready themes are functions (`css.md`), each taking the tokens to put on top (an `undefined` token hides
  nothing), a new object each call: `createToastTheme(theme?)`, `createDialogTheme(theme?)` (the defaults,
  `defaultToastTheme`, `defaultDialogTheme`: internal), `createWebawesomeToastTheme(theme?)`,
  `createWebawesomeDialogTheme(theme?)` (`@local/overlays/themes/webawesome`). `createThemes(palette)` stays: it builds
  both themes from a palette, not from a theme. Tests: `src/test/themes/themes.test.ts`.
- No internal helper properties: a value used several times is a JS constant or function in the template string
  (`AFFORDANCE_SIZE`, `darkAccent()` in `src/main/toasts/element.ts`), a value per variant a rule per variant (the
  named widths of the dialogs; the dark appearance's accents per type, also for the action buttons). The demo's
  (`src/demo/react.css`) are plain values.
- No run time custom properties either: the library's code defines and reads none (only theme values may refer to the
  app's or a design system's own, e.g. the Web Awesome theme).
  - The card scale (`size`) is baked into the toasts' shadow stylesheet with the theme (`setToastTheme(container,
    theme, scale)`), the gap and the stack's durations are constants in `src/main/toasts/styles.ts` (`TOAST_GAP_PX`,
    `STACK_SHUFFLE_MS`, `STACK_TOGGLE_MS`; which one: the container's `data-stack-motion`).
  - The stack's layout: the controller measures it (`syncStackIndices`) and sets the real properties inline for the
    current state (`applyStackLayout`: each host's `translate` and `scale`, the container's `height`); the anchored
    edge is `data-stack-from` on the container.
  - The ring: its duration inline on the ring (`animation-duration`), paused by the host attribute `paused` (the
    controller's `setToastsPaused`, while the tab is hidden).
  - The drawer's exit slide: a keyframe per writing direction (`drawer-slide-out`, `drawer-slide-out-rtl` for
    `:dir(rtl)`).
- The default dialog theme reads no custom properties of the page: plain values (`primaryText` `#ffffff`,
  `primaryBackground` `#007EC6`, `secondaryText` `#1f2430`, `successAccent` `#00883c`). The vanilla demo sets its blue
  through the theme (`DEMO_PRIMARY` in `src/demo/demo.ts`).
- The change between a form and its question in place (`FormAttempt.ask`, e.g. the discard question): the box takes
  its new size at once, its content is gone for a moment and then fades in, like a fade out and in without delaying
  the change (300 ms, `ease-out`, the first 30% empty; `#morphQuestion` in `src/main/dialogs/element/element.ts`).
  Weighed and dropped: a morph of the box from the form's size to the question's (did not look good), a fade alone
  (hardly seen), a fade rising 6px. None with reduced motion.
- The form's scroll position survives its question: the body, hidden while the question shows (`display: none` drops
  a scroll position), gets its `scrollTop` back when the form returns, and the focus goes back without scrolling
  (`preventScroll`; scrolling the focused field into view lands near, but not at the same place). `#syncQuestion` in
  `src/main/dialogs/element/element.ts`.
- A click on a button of a question (`FormAttempt.ask`, e.g. Discard) does not collapse the note: the note is the
  question itself, and its text must not vanish while the dialog fades out. A click in a form still dismisses its note
  first (an error note). (`#asking` in the click handlers of `src/main/dialogs/element/element.ts`.)
