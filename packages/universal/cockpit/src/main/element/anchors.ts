export { addAnchorName, MENU_ANCHOR, MENU_EDGE, removeAnchorName, TIP_ANCHOR };

// The anchor names of CSS anchor positioning (in the shadow root: tree-scoped, so they do not meet the page's). One
// menu is open at a time, and one tooltip shows at a time.
// The anchor of the open menu: its trigger, or the element it opens at (e.g. the footer).
const MENU_ANCHOR = '--menu-anchor';
// The edge the open menu touches in place of its anchor's (the sidebar's right one, the bottom of the topbar's line).
const MENU_EDGE = '--menu-edge';
// The target of the tooltip.
const TIP_ANCHOR = '--tip-anchor';

// An element can be the anchor of a menu and of the tooltip at once: its `anchor-name` is a list. Set inline: which
// element is the anchor is only known at run time.
function addAnchorName(element: ElementCSSInlineStyle, name: string): void {
  element.style.anchorName = [...namesOf(element).filter((other) => other !== name), name].join(', ');
}

function removeAnchorName(element: ElementCSSInlineStyle, name: string): void {
  element.style.anchorName = namesOf(element).filter((other) => other !== name).join(', ');
}

function namesOf(element: ElementCSSInlineStyle): string[] {
  return element.style.anchorName.split(',').map((name) => name.trim()).filter((name) => name !== '');
}
