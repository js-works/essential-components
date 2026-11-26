import { MENU_ANCHOR, MENU_EDGE } from './anchors.js';

export { MENU_PLACEMENT_STYLES };

// Where a menu's positioner (`data-placement`, `data-edge`, `data-same-width`; `menu.ts`) lies: CSS anchor positioning,
// no script. It follows its anchor by itself (a scroll, a resize). Part of the cockpit's and the app header's
// stylesheets.
const MENU_PLACEMENT_STYLES = `
[data-placement] {
  position: fixed;
  inset: auto;
  margin: 0;
  position-anchor: ${MENU_ANCHOR};
  box-sizing: border-box;
  /* Its panel takes the room it is given (a panel that scrolls shrinks to it). */
  display: flex;
  flex-direction: column;
  min-width: max-content;

  & > * {
    min-height: 0;
  }
}

/* As wide as its anchor. */
[data-placement][data-same-width] {
  width: anchor-size(width);
  min-width: 0;
}

/* Below or above its anchor: its own height on its side; when that does not fit, the side with more room, as high as
   that room (it scrolls). At the window's edge it is aligned to the other edge of its anchor (flip-inline). */
[data-placement='bottom-start'] {
  position-area: bottom span-right;
}

[data-placement='bottom-end'] {
  position-area: bottom span-left;
}

[data-placement='top-start'] {
  position-area: top span-right;
}

:is([data-placement^='bottom'], [data-placement^='top']) {
  position-try: most-height flip-inline, --menu-fit, --menu-fit flip-inline, flip-block, flip-block flip-inline,
    flip-block --menu-fit, flip-block flip-inline --menu-fit;
}

/* Its top at the bottom of the edge (the topbar's line), not of its anchor. */
[data-placement^='bottom'][data-edge] {
  top: anchor(${MENU_EDGE} bottom);
}

@position-try --menu-fit {
  max-height: 100%;
}

/* To the right of its anchor (the flyouts, the footer's menus in the rail): its top at the anchor's top (\`start\`) or
   its bottom at the anchor's bottom (\`end\`), else the other one; when neither fits, moved into the window, at most as
   high as the window (it scrolls). */
[data-placement='right-start'] {
  position-area: right span-bottom;
}

[data-placement='right-end'] {
  position-area: right span-top;
}

[data-placement^='right'] {
  max-height: 100dvh;
  position-try-fallbacks: flip-block;
}

/* Its left at the edge (the sidebar's right one), not at its anchor's. */
[data-placement^='right'][data-edge] {
  left: anchor(${MENU_EDGE} right);
}

/* Where it grows from (the open animation): the corner at its anchor, as asked (not the side it flipped to). */
[data-placement='bottom-start'] > * {
  transform-origin: left top;
}

[data-placement='bottom-end'] > * {
  transform-origin: right top;
}

[data-placement='top-start'] > * {
  transform-origin: left bottom;
}

[data-placement='right-start'] > * {
  transform-origin: left top;
}

[data-placement='right-end'] > * {
  transform-origin: left bottom;
}
`;
