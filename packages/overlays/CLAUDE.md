# overlays

`@local/overlays`: dialogs and toasts (`README.md`). Created 2026-10-10 (its conventions were in the root's `CLAUDE.md`
before).

## Conventions

The general rules (copies of the repository's master, `docs/conventions/`):

@docs/conventions/general.md
@docs/conventions/css.md
@docs/conventions/typescript.md
@docs/conventions/i18n.md
@docs/conventions/react.md

## Working rules

- Its own code style: double quotes, no dprint; its imports sorted by the repository's Biome (2026-10-17, like every
  package; its own empty lines between them before) (the `.js` suffixes on relative imports are the rule of every
  package since 2026-10-13, `typescript.md`).
- The demo rules are in the comment of `src/demo/overlays-demo.ts`.
- `exports` in `package.json` (2026-10-15, the user's choice; proposed at about 70%, over an alias per package and
  entry in the root): the entries `.` and `./react` have a `source` condition first, their files in `src/`, then
  the built files in `dist/`. The root's demo resolves the package by name (`@local/…`) to its sources by that
  condition (its `vite.config.ts` and `tsconfig.json`); everywhere else, a customer's copy too, the condition is
  ignored and `dist/` counts.
- The API types live in `src/main/api/` (2026-10-12, `typescript.md`; `dialogs/contract/` and `toasts/contract/`
  before, types and runtime code mixed):
  - `dialogs/` (`dialog.ts`, `adapter.ts`, `content.ts`, `theme.ts`, `texts.ts`), `toasts/` (`toast.ts`, `adapter.ts`,
    `theme.ts`, `texts.ts`), `theme.ts` (`ThemePalette`, `Themes`: both features); `index.ts` re-exports them.
  - Per binding entry: `dom/`, `lit/`, `react/` (its `content.ts`, React's `provider.ts` too), each with an `index.ts`
    that re-exports `../index.js` and its own files.
  - The runtime code of the former `contract/` is beside its feature: `dialogs/theme.ts`, `dialogs/texts.ts` (the
    defaults; `TextKey` stays internal there), `dialogs/form-data.ts`, `dialogs/view.ts` (the internal view types),
    `toasts/theme.ts`, `toasts/texts.ts`, `toasts/view.ts` (the policy helpers).
  - Every entry exports values and types flat (`import type { DialogTheme } from "@local/overlays/react"`; the type
    namespace `overlays` for two days until 2026-10-14). Renamed then (`typescript.md`, two words): `Placement` →
    `ToastPlacement`, `OverflowMode` → `ToastOverflow`, `Renderable` → `OverlayContent`, `Themes` → `OverlayThemes`,
    `Child`, `Attrs` → `DomChild`, `DomAttrs`.
  - Public since 2026-10-12 too (all exports of `api/dialogs/dialog.ts`): `DialogAborted`, `DialogAnswered`,
    `DialogDismissed`, `AnyDialogResult`, the parts of the result types.
  - `OverlaysConfig` keeps its name (2026-10-13, the user's decision).
- Not yet following the conventions (older than them; to be discussed, not changed on the side):
  - Exports on the declarations (`export function …`) and TypeScript `private` in places (`typescript.md`).
  - i18n through picolingo namespaces (`createNamespace()`), not the `I18nAdapter` of `i18n.md`.
- The dialogs' theme (2026-10-10): its values are put straight into the dialog's stylesheet (`styleText(theme)` in
  `src/main/dialogs/element/styles.ts`, built once per theme), no `--dialog-*` custom properties on the host any more
  (they inherited into the slotted content). The controller merges the caller's tokens over `defaultDialogTheme` once
  per scope. The template string's `${…}` stay in value positions, so the CSS tooling of `` css`…` `` keeps working.
- The toasts' theme (2026-10-10): the same way. The controller merges the caller's tokens over `defaultToastTheme`
  and gives the theme to its stack container (`setToastTheme` in `src/main/toasts/element.ts`): each toast takes the
  shadow stylesheet of its stack's theme on connect (and at once on a `configure()`). The colors of the slotted action
  buttons (light DOM) are in a `<style>` inside the container (`themedContainerStyles` in `src/main/toasts/styles.ts`),
  scoped to it by a prelude-less `@scope`, with `:scope` in the selectors for the specificity (0,3,1) that beats the
  app's button styles. No custom properties on the container any more (`toCssVariable` is gone).
- No internal helper properties (2026-10-10): a value used several times is a JS constant or function in the
  template string (`AFFORDANCE_SIZE`, `darkAccent()` in `src/main/toasts/element.ts`), a value per variant a rule per
  variant (the named widths of the dialogs; the dark appearance's accents per type, also for the action buttons). The
  demo's (`src/demo/react.css`) are plain values.
- No run time custom properties either (2026-10-10): the library's code defines and reads none (only theme
  values may refer to the app's or a design system's own, e.g. the Web Awesome theme).
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
- The default dialog theme reads no custom properties of the page (2026-10-10): plain values (`primaryText`
  `#ffffff`, `primaryBackground` `#007EC6`, `secondaryText` `#1f2430`, `successAccent` `#00883c`), the
  `var(--theme-…, …)` pass-through of a host's `--theme-*` tokens is gone. The vanilla demo sets its blue through the
  theme (`DEMO_PRIMARY` in `src/demo/demo.ts`); its `--theme-color-primary-500` on `:root` (`demo.css`) is gone.
- Always add the decisions (also small ones) to this file, in the same step as the code.
- The change between a form and its question in place (`FormAttempt.ask`, e.g. the discard question; 2026-10-11, the
  user's wish: the morph did not look good): the box takes its new size at once, its content is gone for a moment and
  then fades in, like a fade out and in without delaying the change (300 ms, `ease-out`, the first 30% empty; tried
  the same day: a fade alone, 150 ms, hardly seen; a fade rising 6px, 250 ms; `#morphQuestion` in `src/main/dialogs/element/element.ts`). Before: the box morphed from the
  form's size to the question's (220 ms) while the content faded in. None with reduced motion.
- The form's scroll position survives its question (2026-10-11, the user's wish): the body, hidden while the question
  shows (`display: none` drops a scroll position), gets its `scrollTop` back when the form returns, and the focus goes
  back without scrolling (`preventScroll`; it scrolled the focused field into view before, near but not the same
  place). `#syncQuestion` in `src/main/dialogs/element/element.ts`.
- A click on a button of a question (`FormAttempt.ask`, e.g. Discard) does not collapse the note (2026-10-11, the
  user's wish): the note is the question itself; before, its text vanished at once while the dialog faded out. A
  click in a form still dismisses its note first (an error note). (`#asking` in the click handlers of
  `src/main/dialogs/element/element.ts`. A guard that ignored updates while closing was tried first, the same day, and
  reverted: it was not the cause.)
