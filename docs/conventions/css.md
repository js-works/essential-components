# CSS conventions

- No CSS custom properties (`--…`) in the packages (2026-10-10, the user's rule): a package neither defines nor
  requires any.
  - Values come from the package's theme (a JS object), put into the CSS by script (see the placeholders below), or are
    plain values or a local calc.
  - A value only known at run time is set as the real CSS property inline (`style.gridColumn = '3 / span 2'`), never as
    a custom property that the stylesheet reads back.
  - The `--ui-*` tokens of the design language (`ui.css`) are allowed ONLY in demos (2026-10-10, the user's rule):
    never in a package's library code (`src/`), not even read with a fallback.
  - A theme made for a library may read that library's own custom properties (2026-10-10, the user's rule): e.g. the
    data table's `antd` and `mantine` themes (`var(--ant-color-text)`, `var(--mantine-…)`), the overlays' Web Awesome
    theme (`var(--wa-…)`). Never new ones of our own.
  - The apps may have a handful of their own, each only with the user's explicit permission (ask first, with the name
    and why nothing else does), always with the app's prefix (`--board-manager-accent-color`), never a generic name
    like `--shadow`: they inherit into everything inside and collide with other libraries.
- Placeholders in a stylesheet source (2026-10-10): `var(--param-…)`, e.g. `var(--param-color-text)`.
  - Script replaces each by a value (e.g. the theme's) before the browser sees the CSS: no custom property at run time.
  - Valid CSS for the tooling (editors, formatters, linters), unlike Less or Sass variables.
  - No package name in it.
- CSS without shadow DOM and without CSS modules: BEM (2026-10-07).
  - The block is the package's name (`data-table`), its elements `data-table__cell-text` (kebab case), state as `data-*`
    attributes (`data-selected`), no modifiers so far.
  - Every selector is scoped to a block of its own (e.g. `.overlays-react-demo-fields .mantine-TextInput-error`),
    never bare classes of a library like Mantine's (they reach every app on the page).
  - Keyframes and container names carry the prefix too (`data-table-spin`).
- Native CSS nesting, no preprocessors. Keep it shallow (two or three levels); write full BEM names (no `&__element`).
- No inline styles where a stylesheet can do it, no `!important`, never remove focus outlines.
- State as attributes (`data-*`, `inert`, `hidden`), not as conditional inline styles.
- No overscroll (2026-10-08): every scroll area has `overscroll-behavior: none` (sideways-only ones
  `overscroll-behavior-x: none`): no bounce at the ends, and the page does not scroll on.
- The default look follows the design language (`ui.css`, its `ui-*` values; the master is `packages/ui-theme/src/`).
  - The default theme is the same in every package that has one, and is never changed in just one of them.
  - Radii: `2px` for controls (inputs, selects, menus), `5px` for buttons, larger surfaces a bit rounder (dialogs
    `6px`).
