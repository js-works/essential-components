# ui-theme

`@local/ui-theme`: the master of the design language (`ui.css`, `ui.ts`) that styles the demo pages. Created
2026-10-06. The rules of the root's `CLAUDE.md` apply.

## Conventions

The general rules (copies of the repository's master, `docs/conventions/`):

@docs/conventions/general.md
@docs/conventions/css.md

## Working rules

- Always add the decisions (also small ones) to this file, in the same step as the code.

## Decided (2026-10-06)

- This package is the master of `ui.css` and `ui.ts`, nothing else.
  - No other package depends on it, and nothing is imported from it: every project that needs the design language
    keeps its own copy (`demo/ui/` at the root, `demo/ui/` or `src/demo/ui/` in the packages), so each package stays
    copyable on its own.
  - A change is made here first, then copied by hand into every copy, so they stay identical. There is no sync
    script (the user's decision).
- The rules for changing the design language stay in the header of `src/ui.css` for now.
- No demo page yet: it is on the root's TODO list.
- Layout: `src/ui.css`, `src/ui.ts`. `npm run typecheck` checks `ui.ts`.
