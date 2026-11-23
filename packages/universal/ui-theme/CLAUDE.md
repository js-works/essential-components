# ui-theme

`@local/ui-theme`: the master of the design language (`ui.css`, `ui.ts`) that styles the demo pages. The rules of
the root's `CLAUDE.md` apply.

## Conventions

The general rules (`packages/ai`, always copied along with this package):

@../../ai/instructions/common/general.md
@../../ai/instructions/frontend/general.md
@../../ai/instructions/frontend/css.md

This repository's rules for it (see the root's `CLAUDE.md`):

- Tier 1 (for any stack): no UI library, no i18n library (an `I18nAdapter`), its theme a JS object. A tier-2 package may
  depend on it, never the other way round.

## Working rules


## Decided

- This package is the master of `ui.css` and `ui.ts`, nothing else.
  - No other package depends on it, and nothing is imported from it: every project that needs the design language
    keeps its own copy (`demo/ui/` at the root, `demo/ui/` or `src/demo/ui/` in the packages), so each package stays
    copyable on its own.
  - A change is made here first, then copied by hand into every copy, so they stay identical. There is no sync
    script.
- The rules for changing the design language stay in the header of `src/ui.css` for now.
- No demo page yet: it is on the root's TODO list.
- Layout: `src/ui.css`, `src/ui.ts`. `npm run typecheck` checks `ui.ts`.
