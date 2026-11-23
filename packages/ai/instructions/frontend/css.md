# CSS conventions

- No CSS custom properties (`--…`) in a component package: it neither defines nor requires any.
  - Values come from the package's theme (a JS object), put into the CSS by script (see the placeholders below), or are
    plain values or a local calc.
  - A value only known at run time is set as the real CSS property inline (`style.gridColumn = '3 / span 2'`), never as
    a custom property that the stylesheet reads back.
  - A theme made for a UI library may read that library's own custom properties (e.g. `var(--mantine-…)`,
    `var(--ant-color-text)`). Never new ones of our own.
  - Apps may have a handful of their own, each only with explicit permission (ask first, with the name and why nothing
    else does), always with the app's prefix (`--user-manager-accent-color`), never a generic name like `--shadow`:
    they inherit into everything inside and collide with other libraries.
- Theme tokens (the keys of a package's theme): `<area><state><cssProperty>` in camelCase, the full name of the CSS
  property they set last; no area for the whole component: `textColor`, `borderRadius`, `fontSize`,
  `buttonHoverBackgroundColor`, `dialogBorderRadius`, `toastTitleColor`, `sidebarWidth`.
  - A part that is only a line, a ring, a bar or a mark ends in `Color` (`dividerColor`, `focusRingColor`,
    `progressColor`, `badgeIconColor`).
  - The same pattern in every package, so a theme reads alike everywhere.
  - Weighed: short words (`radius`, `background`, `text`: the color or the size, the color or the width), the kind
    first (`colorText`, Ant Design's: fits a few semantic tokens, awkward for concrete ones like
    `colorButtonHoverBackground`).
- Placeholders in a stylesheet source: `var(--param-…)`, e.g. `var(--param-text-color)`.
  - Script replaces each by a value (e.g. the theme's) before the browser sees the CSS: no custom property at run time.
  - Valid CSS for the tooling (editors, formatters, linters), unlike Less or Sass variables.
  - No package name in it.
- CSS without shadow DOM and without CSS modules: BEM.
  - The block is the package's name (`data-table`), its elements `data-table__cell-text` (kebab case), state as `data-*`
    attributes (`data-selected`), no modifiers so far.
  - Every selector is scoped to a block of its own (e.g. `.demo-fields .mantine-TextInput-error`), never bare classes
    of a library like Mantine's (they reach every app on the page).
  - Keyframes and container names carry the prefix too (`data-table-spin`).
- Native CSS nesting, no preprocessors. Keep it shallow (two or three levels); write full BEM names (no `&__element`).
- No inline styles where a stylesheet can do it, no `!important`, never remove focus outlines.
- State as attributes (`data-*`, `inert`, `hidden`), not as conditional inline styles.
- No overscroll: every scroll area has `overscroll-behavior: none` (sideways-only ones `overscroll-behavior-x: none`):
  no bounce at the ends, and the page does not scroll on.
