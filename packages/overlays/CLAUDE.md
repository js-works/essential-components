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

- Its own code style: double quotes, `.js` suffixes on relative imports, no dprint.
- The demo rules are in the comment of `src/demo/OverlaysDemo.ts`.
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
