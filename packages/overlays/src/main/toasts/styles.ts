// -------------------------------------------------------------------
// Document-level chrome styles for the toast container and its slotted action
// buttons, injected once per document or shadow root (wherever the stack is mounted).
// (Per-toast shadow styles live in element.ts.)
// -------------------------------------------------------------------

import { css } from "../internal/css.js";
import type { ToastTheme } from "./contract/api.js";
import { darkAccent } from "./element.js";

// The one source of truth for the space between cards: the flat list's `gap` (below) and
// the offsets an expanding stack animates to (the controller) have to agree exactly, or the
// two layouts land in different places.
export const TOAST_GAP_PX = 8;

// Re-stacking that accompanies an arriving toast travels with it, so it borrows the
// entrance's timing and the two read as one movement. Expanding the stack on hover or a tap
// is a direct answer to the user's own pointer and wants to be quicker still.
export const STACK_SHUFFLE_MS = 400;
export const STACK_TOGGLE_MS = 200;


// Global chrome + anything targeting the slotted action buttons. Placement is
// applied as inline styles per controller (see applyPlacement); a single
// toast's own box lives in the custom element's shadow root (see
// SHADOW_STYLES). The action buttons are the exception: they're slotted
// light-DOM <button>s, and ::slotted() styling of native form controls is
// unreliable across engines, so we style them here in the document scope where
// they actually live — which cleanly overrides the UA button chrome. Their theme
// colors are in a <style> of each controller (see themedContainerStyles).
const containerStyles = css`
.toasts-container {
  position: fixed;
  z-index: 10000;
  display: flex;
  /* TOAST_GAP_PX also drives the offsets an expanding stack animates to (the controller):
     the two have to agree or the layouts disagree on where a card goes. */
  gap: ${TOAST_GAP_PX}px;
  pointer-events: none;
}
/* Stacked layout, opt-in via the "stacked" option. Collapsed, every card occupies the
   same grid cell, so they overlap and the container keeps the height of one of them —
   absolute positioning would collapse it to nothing and take the hover target with it.
   Expanded, none of this applies and the ordinary flex column is back.

   Paint order is DOM order, and the newest host is the last child, so the newest card
   lands on top without any z-index. The controller offsets the cards behind it (inline
   translate and scale), away from the anchored edge, so the pile always grows into the
   screen. The offset stops growing after the third card: beyond that they are fully
   covered anyway, and letting them drift on would push the pile across the screen. */
/* Grid in BOTH states, never flex: the cards share one cell throughout and only their
   transform differs, so expanding is an animation rather than a relayout.

   Alignment is NOT set here. applyPlacement writes align-items inline for a flex column,
   which under grid names the other axis entirely, and an inline declaration outranks this
   rule — so the controller corrects both axes inline instead (see applyContainerOptions).
   The height is measured and set inline there too, since a one-cell grid cannot derive it. */
.toasts-container[data-stacked="on"] {
  display: grid;
  gap: 0;
  transition: height ${STACK_SHUFFLE_MS}ms ease;
}

/* The offset rides on the independent "translate"/"scale" properties, NOT on transform.
   transform belongs to the controller: the enter slide writes an off-screen transform,
   forces a reflow to commit it, and only then enables its own transition (see playEnter).
   A stylesheet transition on transform would animate that first write too, so the toast
   would creep a few pixels instead of sliding in. Swipe-to-dismiss and the exit slide
   write transform inline for the same reason. The independent properties compose with it
   rather than replacing it, so both effects can run at once and neither has to know about
   the other. */
/* Both offsets are computed by the controller and set inline (translate, scale): it is the
   only place that knows how tall the cards actually are — a card behind a shorter one has
   to sit further back to clear it by the same sliver. Expanded, a card steps back by the
   measured heights of everything in front of it, at full size — exactly where the flat
   list would have put it. transform-origin is the anchored edge (data-stack-from), so
   shrinking a card pulls its trailing edge in without moving the edge it lines up on. */
.toasts-container[data-stacked="on"] > [data-id] {
  grid-area: 1 / 1;
  transform-origin: bottom;
}

.toasts-container[data-stacked="on"][data-stack-from="top"] > [data-id] {
  transform-origin: top;
}

/* The re-stack when a toast arrives or leaves travels with its slide, so the pile settles in
   step with it rather than finishing first; expanding by hand (data-stack-motion="toggle")
   is brisker. Same easing as the slide, for the same reason. */
.toasts-container[data-stacked="on"] > [data-id] {
  transition:
    translate ${STACK_SHUFFLE_MS}ms ease-in-out,
    scale ${STACK_SHUFFLE_MS}ms ease-in-out;
}

.toasts-container[data-stacked="on"][data-stack-motion="toggle"] {
  transition-duration: ${STACK_TOGGLE_MS}ms;
}

.toasts-container[data-stacked="on"][data-stack-motion="toggle"] > [data-id] {
  transition-duration: ${STACK_TOGGLE_MS}ms;
}

@media (prefers-reduced-motion: reduce) {
  .toasts-container[data-stacked="on"] > [data-id] {
    transition: none;
  }
}

.toasts-liveregion {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Action buttons rendered as inline text links (not filled buttons).

   These are light-DOM buttons, so the host app's own global button styles
   (design-system resets, bare element rules, Tailwind/Bootstrap base layers)
   land on them too. To reliably out-rank that without !important, every rule
   here carries the extra [data-id] (raising specificity to (0,3,1)) and the
   base rule performs a FULL reset of the properties frameworks typically set —
   not just border/background — so a stray app declaration can't re-boxify the
   link. If your app forces button styles with !important, override via the
   theme's actionColor or add your own higher-specificity rule. */
.toasts-container [data-id] button[slot="action"] {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  display: inline;
  width: auto;
  min-width: 0;
  height: auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: none;
  box-shadow: none;
  font: inherit;
  font-size: 0.9em;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: normal;
  text-transform: none;
  text-align: inherit;
  text-decoration: none;
  vertical-align: baseline;
  cursor: pointer;
  transition: opacity 150ms ease;
}

/* Hover feedback is a subtle dim rather than an underline: these actions sit in
   their own row (not inline in prose), where semibold accent text already reads
   as actionable, so the underline convention isn't needed and reads dated. */
.toasts-container [data-id] button[slot="action"]:hover {
  opacity: 0.75;
  background: none;
}

.toasts-container [data-id] button[slot="action"]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .toasts-container [data-id] button[slot="action"] {
    transition: none;
  }
}
`;

// The colors of the slotted action buttons in one controller's theme: a <style> inside its
// container, scoped to it by a prelude-less `@scope` (the parent of the <style>); `:scope`
// keeps the (0,3,1) of the rules below. Built once per theme. The values are put straight in
// (no custom properties).
const themedTexts = new WeakMap<ToastTheme, string>();

export function themedContainerStyles(theme: ToastTheme): string {
  let text = themedTexts.get(theme);
  if (text === undefined) {
    text = themedStyles(theme);
    themedTexts.set(theme, text);
  }
  return text;
}

const themedStyles = (theme: ToastTheme): string => css`
@scope {
  :scope [data-id] button[slot="action"] {
    color: ${theme.actionColor ?? theme.infoAccent};
  }

  :scope [data-id][type="success"] button[slot="action"] {
    color: ${theme.actionColor ?? theme.successAccent};
  }

  :scope [data-id][type="warn"] button[slot="action"] {
    color: ${theme.actionColor ?? theme.warnAccent};
  }

  :scope [data-id][type="error"] button[slot="action"] {
    color: ${theme.actionColor ?? theme.errorAccent};
  }

  :scope [data-id][type="loading"] button[slot="action"] {
    color: ${theme.actionColor ?? theme.loadingAccent};
  }

  /* Solid appearance: light links on the accent-colored card (same dim-on-hover). */
  :scope [data-id][appearance="solid"] button[slot="action"] {
    color: ${theme.solidText};
  }

  /* Dark appearance: the same lightened accent the stripe, icon and countdown ring use
     (darkAccent in element.ts), since the 600-level accents are hard to read on the dark
     card. After the per-type rules above, which they tie with or beat on specificity. */
  :scope [data-id][appearance="dark"] button[slot="action"] {
    color: ${theme.actionColor ?? darkAccent(theme.infoAccent)};
  }

  :scope [data-id][appearance="dark"][type="success"] button[slot="action"] {
    color: ${theme.actionColor ?? darkAccent(theme.successAccent)};
  }

  :scope [data-id][appearance="dark"][type="warn"] button[slot="action"] {
    color: ${theme.actionColor ?? darkAccent(theme.warnAccent)};
  }

  :scope [data-id][appearance="dark"][type="error"] button[slot="action"] {
    color: ${theme.actionColor ?? darkAccent(theme.errorAccent)};
  }

  :scope [data-id][appearance="dark"][type="loading"] button[slot="action"] {
    color: ${theme.actionColor ?? darkAccent(theme.loadingAccent)};
  }
}
`;

// The shadow roots that have the styles already (the document is marked by the id).
const styledShadowRoots = new WeakSet<ShadowRoot>();

// Into the root the stack is mounted in: its shadow root, or the document's head.
export function injectContainerStyles(target: ParentNode) {
  const root = (target as Node).getRootNode();
  const shadowRoot = root instanceof ShadowRoot ? root : null;

  if (shadowRoot ? styledShadowRoots.has(shadowRoot) : document.getElementById("toasts-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = containerStyles;

  if (shadowRoot) {
    styledShadowRoots.add(shadowRoot);
    shadowRoot.append(style);
  } else {
    style.id = "toasts-styles";
    document.head.appendChild(style);
  }
}
