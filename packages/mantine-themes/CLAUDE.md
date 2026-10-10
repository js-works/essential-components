# mantine-themes

`@local/mantine-themes`: a few nicer Mantine themes, to be used easily. Created 2026-10-04. The rules of the root's
`CLAUDE.md` apply.

## Conventions

The general rules (copies of the repository's master, `docs/conventions/`):

@docs/conventions/general.md
@docs/conventions/css.md
@docs/conventions/typescript.md
@docs/conventions/react.md

## Working rules

- This package knows nothing of the root's design language (`ui.css`, its `--ui-*` tokens): it depends only on
  Mantine (an exception to the design language rule of `css.md`).
- `src/api.ts` holds the API types. Types only, flat exports; `src/index.ts` re-exports them as a namespace:
  `export type * as MantineThemes from './api'` (`MantineThemes.Options`).
- Always add the decisions (also small ones) to this file, in the same step as the code.

## Decided (2026-10-04)

- Mantine and React are peer dependencies (`@mantine/core` `^9.5.1`, `react` `>=19`); the workspace has 9.5.1, pinned
  in the dev dependencies like `overlays` and `login`.
- Library mode, only the latest browsers (`build.target: 'esnext'`), Mantine and React stay outside the build.
- Idea taken from `shoelace-themes` (github.com/js-works/shoelace-themes, MIT, a prototype from 2023, looked at
  2026-10-04): a theme is the combination of independent axes (colors, size, variant, light/dark) and a few named color
  setups. Not taken: its Shoelace tokens, its builder chain, its dark mode derived by swapping shades (Mantine does the
  dark mode), `loadTheme()` (Mantine has its `MantineProvider`).
- `createMantineTheme(options?)` returns `{ theme, cssVariablesResolver }` for a `MantineProvider` (`src/create.ts`):
  - `colors`: a name of `colorSetups` or `{ primary?, success?, warning?, danger? }` (hex colors only, no DOM needed:
    also for the server). Each is made into ten shades (`src/colors.ts`, OKLCH, the color is shade 6; the Board
    Manager's `colors.ts` without the browser): the theme colors `accent` (the primary color), `success`, `warning`,
    `danger`, the names the root's apps use. Not given: Mantine's indigo, green, orange, red. An unknown name or an
    invalid color throws (a typo should not pass silently).
  - `size`: `default` or `compact` (Mantine's `scale` 0.9: every size, also the text).
  - `variant`: `default` (Mantine's own look) or `modern` (small corners `2 3 6 8 10px`, Inter for text and
    headings, headings 600, buttons 500, badges not uppercase, the inputs' borders two steps stronger:
    `gray.6`, `dark.2`, since 2026-10-10; one step before).
  - `accentProperty` (e.g. `--app-accent-color`): the accent live from this custom property (any CSS color, set by the
    page's CSS): the same CSS-only mechanism as the root's apps (ten shades as `color-mix()` of it with white and black;
    the theme's own shades where it is not set; Mantine's dark `light` and `outline-hover` as `color-mix()`).
  - Always `autoContrast`, `defaultRadius: 'sm'`.
- `modernTheme` (2026-10-04): the ready-made modern theme, `createMantineTheme({ variant: 'modern' })` (a `ThemeBundle`: the theme and its CSS variables resolver; called `Kit` until 2026-10-04), and
  `combineCssVariables(...resolvers)` to combine CSS variables resolvers (the later ones win). The modern parts are in
  `src/modern.ts` (`modernOverride`, `modernVariables`: one source for `createMantineTheme()` and the apps):
  - smaller corners: `2 3 6 8 10px` (2026-10-06, the user's wish: a tiny bit rounder; `1 2 5 6 8px` from 2026-10-04,
    first `0 1 2 3 4px`), instead of Mantine's `2 4 8 16 32px` (the default radius `sm`: 3px instead of 4px, so
    buttons and inputs follow it together); the package's own values, not tied to any other scale;
  - a bit more contrast, each one step stronger than Mantine's: the borders (`gray.5`, dark `dark.3`), the secondary text
    (`gray.7`, dark `dark.1`) and the placeholders (`gray.6`, dark `dark.2`);
  - the borders of the inputs (2026-10-04): Mantine's inputs ignore `--mantine-color-default-border` (their CSS sets
    `--input-bd` to `gray-4` / `dark-4` per variant), so the `Input` component's `styles` set `--input-bd` on the default
    variant to `light-dark(gray.6, dark.2)` since 2026-10-10 (the user's wish: they looked too light; about 3.3:1 on
    white, the contrast WCAG asks of a control's border; only the inputs, the lines stay `gray.5`; `light-dark()`
    follows the CSS `color-scheme`, which Mantine sets, and a scoped app's scope inherits the page's; before:
    `var(--mantine-color-default-border)`, `gray.5`, dark `dark.3`). The filled and unstyled
    variants keep their transparent borders. It reaches `TextInput`, `Select`, `PasswordInput`, `NumberInput`,
    `Textarea` (checked by rendering them);
  - the danger color (2026-10-04, the user's wish: Mantine's `red.6`, `#fa5252`, looked odd): `#c92a2a` (Mantine's
    `red.9` as shade 6) where the color setup gives none (`MODERN_DANGER`); the default variant keeps Mantine's red. The
    root's apps take it as their default danger color (`modernTheme.theme.colors.danger`), unless the host sets one.
  - Inter (2026-10-09; the system's UI font before, which looked different on every system: Segoe UI, San Francisco,
    Noto Sans): self-hosted, `@fontsource-variable/inter` (OFL-1.1, a dependency of this package, pinned 5.3.0), imported
    by `modern.ts`, so the page loads it with the theme (only the woff2 files of the scripts it uses); the system's font
    is the fallback while it loads. The root's apps take it as their font (`modernTheme.theme.fontFamily`), unless the
    host sets one. Headings 600, buttons 500, badges not uppercase;
  - the labels of the inputs (2026-10-04, the user's wish): a bit smaller, 13px, with weight 600 (Mantine's own: 14px, 600;
    500 was tried and dropped). Set on `InputWrapper` in the theme's `components` (`styles.label`); it reaches every input (text, password, select,
    native select, textarea ...). The size is `calc(var(--mantine-font-size-sm) * 13 / 14)`: proportional to the base text
    size, so it follows the apps' text size and scale.
  - An app with its own theme merges it: `mergeThemeOverrides(modernTheme.theme, ownTheme)` and
    `combineCssVariables(modernTheme.cssVariablesResolver, ownResolver)`. The root's apps do (see their `CLAUDE.md`).
- `colorSetups` (`src/color-setups.ts`): `blue`, `skyBlue`, `pacificBlue`, `bostonBlue`, `teal`, `violet`, `orchid`,
  `cranberry`, `pink`, `orange`, `coral`, `tomato`, `bootstrap` (all four colors), `baseweb`; a primary color and, where
  Mantine's red does not go well with it, a danger color. From `shoelace-themes`, without the very light ones
  (aquamarine, turquoise, horizon: no contrast in a filled button). Its `default` is called `blue` here (`default`
  would mean "not given": Mantine's indigo).

## Not set up yet

- More themes (the user is looking for some), more variants and sizes.
- The toasts and dialogs of `overlays` in the theme.
- Tests.

## Layout and commands

- `src/api.ts` (types), `src/create.ts` (`createMantineTheme()`), `src/colors.ts` (shades), `src/color-setups.ts`.
- `demo/` (`npm run dev`): Mantine's components on a page, with the choices on top: the colors, the size, the variant,
  the color scheme, and a live accent (a color input that sets `--demo-accent-color`).
- `npm run typecheck`, `npm run build` (library mode: `dist/index.js`), `npm run format`.
