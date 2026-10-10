// -------------------------------------------------------------------
// # Styles & timing
// -------------------------------------------------------------------

import { css } from "../../internal/css.js";
import type { DialogTheme } from "../contract/theme.js";

// Duration of the note appear/disappear (collapse) animation. Drives both the
// CSS transition and the JS timer that removes the element after the collapse finishes.
export const REJECT_MESSAGE_ANIM_MS = 450;

// Duration of the real dialog's grow-in (entrance) animation — used for the first real
// dialog in a scope and every in-scope swap (see #growIn in element.ts).
export const DIALOG_GROW_ANIM_MS = 200;

// Duration of the change between the form and a question in its place (FormAttempt.ask):
// the box morphs to its new size while the new content fades in (see #morphQuestion in
// element.ts).
export const QUESTION_MORPH_ANIM_MS = 220;

// Duration of the spinner placeholder's drop-in animation (see #growIn in element.ts).
export const SPINNER_DROP_ANIM_MS = 500;

// Duration of the dialog's fade-out (close) animation.
export const DIALOG_CLOSE_ANIM_MS = 200;

// Duration of the backdrop's fade-in animation (dialog opening).
export const BACKDROP_FADE_IN_ANIM_MS = 200;

// Duration of the backdrop's fade-out animation (dialog closing).
export const BACKDROP_FADE_OUT_ANIM_MS = 200;

// Duration of the quick fade-out when swapping one on-screen dialog for the next within
// a scope (the backdrop stays up; only the box content changes, then grows back in).
export const SWAP_OUT_MS = 140;

// Fade-out for the spinner placeholder when the real dialog is ready. Longer than
// SWAP_OUT_MS: the placeholder is a small circle handing off to a much larger box, and a
// swap that quick reads as a cut rather than a dissolve.
export const SPINNER_SWAP_OUT_MS = 300;

// If nothing opens within this delay, a round spinner dialog is shown as a placeholder.
export const SPINNER_DIALOG_DELAY_MS = 300;

// Delay before an action button's inline spinner appears once its handler is running.
export const BUTTON_SPINNER_DELAY_MS = 150;

// Belt-and-braces close timeout in case the close animation's `animationend` never fires.
export const CLOSE_ANIMATION_FALLBACK_MS = DIALOG_CLOSE_ANIM_MS + 100;

const dialogStyles = (theme: DialogTheme): string => css`
  dialog {
    outline: none;
    position: fixed;
    /* Horizontally centered; vertically a bit above the middle (2026-10-08, the user's
       wish; a top anchor at 12dvh for most dialogs and exact centering for forms before):
       the top edge at the middle, then up by 40% of the dialog's own height (a percentage
       of translate is the element's own size) plus 10dvh, so the free space is split
       40/60 above and below it. Never closer than 2em to the top (max()), and with the
       max-height below never past the bottom. translate is its own property: the open
       animation's transform (element.ts, #growIn) adds to it. */
    inset-inline: 0;
    inset-block: 50dvh auto;
    translate: 0 max(calc(2em - 50dvh), calc(-40% - 10dvh));
    width: fit-content;
    /* Cap the line length so a long single-line message wraps to a few lines instead of
       stretching the dialog very wide - a calmer width/height ratio. Still shrinks to fit
       the viewport on small screens.
       The cap is what a message *just* over it has to live with: sizing here is computed
       from the unwrapped text and never revisited once it wraps, so such a message pins
       the box to the full cap and then fills only part of it. A tighter cap keeps that
       leftover small. It costs height on genuinely long text, which wraps a line or two
       further, and nothing at all on text that already fits. */
    max-width: min(calc(100dvw - 4em), 26em);
    height: fit-content;
    max-height: calc(100dvh - 4em);
    margin-inline: auto;
    margin-block: 0;
    color: ${theme.text};
    background-color: ${theme.background};
    border: none;
    border-radius: ${theme.radius};
    min-width: 22em;
    box-sizing: border-box;
    padding: 0;
    overflow: auto;
    /* No bounce at the ends of a scroll area (Firefox's elastic overscroll), here and in
       the bodies below (2026-10-08). */
    overscroll-behavior: none;
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.25), 0 4px 10px -4px rgba(0,0,0,0.15);  
  }

  dialog[open].closing {
    animation: dialog-fade-out ${DIALOG_CLOSE_ANIM_MS}ms ease-in-out;
  }

  dialog[open]::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }

  dialog[open]:not(.closing)::backdrop {
    animation: backdrop-fade-in ${BACKDROP_FADE_IN_ANIM_MS}ms ease-in-out;
  }

  dialog[open].closing::backdrop {
    animation: backdrop-fade-out ${BACKDROP_FADE_OUT_ANIM_MS}ms ease-in-out;
  }

  /* Form dialogs get a bit more room so labelled fields aren't cramped. Placed like every
     centered dialog (above); a note added to a form (a failed save) moves it up by 40% of
     the note's height. */
  :host([data-dialog-type="form"]) dialog,
  :host([data-dialog-type="formCritical"]) dialog {
    min-width: 26em;
  }

  /* ---- Drawer surface ------------------------------------------------------
     Same modal <dialog> as the centered surface, for every dialog type — only the geometry changes, so the focus
     trap, inert background, Escape handling and ::backdrop all keep working untouched.
     Undoes the centering above: auto on the start side pushes the panel to the inline-end
     edge (right in LTR, left in RTL) and it fills the block axis. */
  :host([data-surface="drawer"]) dialog {
    inset: 0;
    translate: none;
    margin-inline-start: auto;
    margin-inline-end: 0;
    margin-block: 0;
    /* As wide as the content's narrowest layout (min-content: text still wraps), at least
       the named width (data-width, below; 30em by default) and never past the viewport:
       content that needs more room (a min-width, a wide table) widens it. The floor also
       replaces the base rule's 22em, which would exceed the panel on a narrow phone. */
    width: min-content;
    min-width: min(calc(100dvw - 2em), 30em);
    max-width: calc(100dvw - 2em);
    height: 100dvh;
    max-height: none;
    border-radius: 0;
    /* The panel itself doesn't scroll — its body does (below) — so the title and the
       action buttons stay put on a long form. */
    overflow: hidden;
  }

  /* ---- Named widths (data-width) ------------------------------------------
     For both surfaces. "default" keeps each surface's own sizing (a centered dialog sizes
     itself to its text, up to 26em; a drawer is 30em). The others are the floor of the
     width: 48em, 64em, the viewport. */
  :host([data-surface="drawer"][data-width="wide"]) dialog {
    min-width: min(calc(100dvw - 2em), 48em);
  }

  :host([data-surface="drawer"][data-width="extraWide"]) dialog {
    min-width: min(calc(100dvw - 2em), 64em);
  }

  :host([data-surface="drawer"][data-width="full"]) dialog {
    min-width: calc(100dvw - 2em);
  }

  /* A centered dialog of a named width: like the drawer, as wide as its content needs, at
     least that width, and never past the viewport (2em of it on each side). After the
     form rule above, whose 26em floor it replaces. Placed vertically like every centered
     dialog (the base rule). */
  :host(:not([data-surface="drawer"]):is([data-width="wide"], [data-width="extraWide"], [data-width="full"])) dialog {
    width: min-content;
    max-width: calc(100dvw - 4em);
  }

  :host(:not([data-surface="drawer"])[data-width="wide"]) dialog {
    min-width: min(calc(100dvw - 4em), 48em);
  }

  :host(:not([data-surface="drawer"])[data-width="extraWide"]) dialog {
    min-width: min(calc(100dvw - 4em), 64em);
  }

  :host(:not([data-surface="drawer"])[data-width="full"]) dialog {
    min-width: calc(100dvw - 4em);
  }

  /* A question in place of the content: the dialog is only as
     wide as the question needs, not the form's floor (the attributes are always on the
     host; naming them all outweighs the rules of the form and the named widths above). */
  :host([data-asking][data-dialog-type][data-surface][data-width]:not([data-surface="drawer"])) dialog {
    width: fit-content;
    min-width: 0;
  }

  /* The morph between the form and a question (data-morphing, see #morphQuestion in
     element.ts): no scrollbars while the box changes its size, and nothing outside the box
     (2026-10-10, the user's wish: the open dialog no longer clips, see below, and the
     content, kept at its final size meanwhile, stuck out of the morphing box).
     ([data-surface] is always on the host, and \`dialog[open]:not(.spinner-dialog)\`
     matches the open dialog's rule: together they outweigh it and the body's rules below,
     which come later.) */
  :host([data-morphing][data-surface]) dialog[open]:not(.spinner-dialog),
  :host([data-morphing][data-surface]) .dialog-content .body {
    overflow: hidden;
  }

  /* ---- Maximized (data-maximized, see DialogConfig.maximizable) --------------------
     The whole viewport, for both surfaces and every width: no margin, no rounding. The
     three attributes are always on the host; naming them all makes this more specific than
     the rules of the named widths above (two conditions in their :host()). */
  :host([data-maximized][data-surface][data-width]) dialog {
    inset: 0;
    translate: none;
    width: 100dvw;
    min-width: 0;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    border-radius: 0;
  }

  /* Its content fills that height, so the buttons sit at the bottom edge and the body
     takes the rest (the drawer's content does already). */
  :host([data-maximized]:not([data-surface="drawer"])) .dialog-content {
    flex: 1 1 auto;
  }

  :host([data-maximized]:not([data-surface="drawer"])) .dialog-content .body {
    flex: 1 1 auto;
  }

  /* The content part passes that height on (both surfaces), so content can fill the
     maximized dialog: the part is a column at least as high as the body's free room, and
     the slotted content grows with it. The page takes it from there with CSS keyed on
     [data-maximized], which is on the dialog element, an ancestor of the content in the
     light DOM. Not shrinking: longer content still scrolls the body, as before. */
  :host([data-maximized]) .dialog-content .body > .part[data-part="content"] {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }

  :host([data-maximized]) ::slotted([slot="content"]) {
    flex: 1 0 auto;
  }

  /* Only the body scrolls, also in a centered dialog: the header (title, close button) and
     the footer (note, action buttons) stay in place, like in the drawer below. The open
     dialog is a column whose one child, the content, shrinks to the dialog's max-height
     (not a max-height of its own: the content's em may differ from the dialog's, e.g. with
     a theme's fontSize, and the few pixels between them gave the dialog a second scroll
     bar). Not the spinner placeholder, which centers its spinner itself.
     Not clipping (2026-10-10; hidden before): its body scrolls, the dialog never does. The
     dialog's \`translate\` (its vertical position) makes it the containing block of the
     fixed popups inside it (a date picker's calendar, a select's list: \`floatingStrategy:
     "fixed"\`, meant to escape the scrolling body), so its own overflow clipped them at its
     edges. */
  :host(:not([data-surface="drawer"])) dialog[open]:not(.spinner-dialog) {
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  :host(:not([data-surface="drawer"])) .dialog-content {
    display: flex;
    flex-direction: column;
    flex: 0 1 auto;
    min-height: 0;
  }

  :host(:not([data-surface="drawer"])) .dialog-content .body {
    flex: 0 1 auto;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  :host(:not([data-surface="drawer"])) .dialog-content > :not(.body) {
    flex: none;
  }

  :host([data-surface="drawer"]) .dialog-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    /* Same reason as min-width above: the base 20em floor is wider than the panel on a
       small screen. */
    min-width: 0;
  }

  :host([data-surface="drawer"]) .dialog-content .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: none;
  }

  /* Slides out to the edge rather than fading in place. Transforms have no logical
     equivalent, so right-to-left text has a keyframe of its own (to the left edge). */
  :host([data-surface="drawer"]) dialog[open].closing {
    animation: drawer-slide-out ${DIALOG_CLOSE_ANIM_MS}ms ease-in-out;
  }

  :host([data-surface="drawer"]:dir(rtl)) dialog[open].closing {
    animation-name: drawer-slide-out-rtl;
  }

  /* Hidden rather than absent when the dialog has no icon: the adapter renders a fixed
     set of slot wrappers (that is what lets a framework diff them), so an empty one is
     always assigned and would otherwise claim the header's gap. The id selector beats the
     UA [hidden] rule, hence the explicit pairing. */
  #icon[hidden] {
    display: none;
  }

  #icon {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    /* The slotted glyphs are sized in em (width/height="1em" in the markup), so this
       is the single lever for how large the header icon renders. */
    font-size: 1.6em;
    line-height: 1;
  }

  /* The icon is projected through the "icon" slot (light DOM), so this stylesheet
     can't reach the actual <svg> inside it: ::slotted() only selects the top-level
     slotted node itself, never its descendants (this previous rule tried
     "::slotted([slot=\"icon\"]) svg", which is invalid — a pseudo-element can't be
     followed by a further compound selector — and, being comma-listed with #icon
     svg, silently invalidated this whole rule). Sizing/overflow for these glyphs is
     baked into the SVG markup itself (see internal/icons.ts, dialogs/icons.ts)
     instead; this just avoids the inline-element baseline gap on the wrapper. */
  ::slotted([slot="icon"]) {
    display: flex;
  }

  :host([data-dialog-type="info"]) #icon,
  :host([data-dialog-type="confirm"]) #icon,
  :host([data-dialog-type="decide"]) #icon,
  :host([data-dialog-type="success"]) #icon {
    color: ${theme.primaryBackground};
  }

  :host([data-dialog-type="warn"]) #icon,
  :host([data-dialog-type="error"]) #icon,
  :host([data-dialog-type="confirmCritical"]) #icon,
  :host([data-dialog-type="decideCritical"]) #icon {
    color: ${theme.dangerBackground};
  }

  .dialog-content {
    /* Chrome (titles, buttons) stays unselectable; the body and note opt back
       into text selection below so error messages can be copied. */
    user-select: none;
    min-width: 20em;
    font-size: ${theme.fontSize};
    font-family: ${theme.fontFamily};
  }

  .dialog-content .header {
    display: flex;
    align-items: center;
    gap: 0.6em;
    padding: 1.25em 1.5em 0.75em;
  }

  /* Grows to fill the row so the close button is pushed to the far edge; min-width: 0
     lets long titles wrap/ellipsize instead of overflowing. */
  .dialog-content .header .titles {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .dialog-content .header .titles .title {
    font-size: 1.1em;
    font-weight: 600;
    line-height: 1.25;
  }

  .dialog-content .header .titles .subtitle {
    font-size: 0.95em;
    line-height: 1.25;
    margin-top: -0.1em;
    opacity: 0.8;
  }

  .dialog-content .body {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 0 1.5em 1.1em 1.5em;
    min-height: 1.75em;
    line-height: 1.25em;
    user-select: text;
    /* pretty, not balance. The dialog is sized from the *unwrapped* text (see the
       width/max-width above), so a message just past the width cap takes the box to full
       width - and balance would then split it into two short, equal lines and leave the
       rest of that width empty, because balancing never feeds back into sizing. pretty
       keeps the orphan avoidance and lets the lines fill the box.
       Progressively enhanced: browsers without support fall back to normal wrapping. */
    text-wrap: pretty;
  }

  /* One shadow-side part per body slot, so an empty intro/outro can be taken out of the
     flex flow — the row gap above would otherwise show around nothing. It has to be a
     shadow element: styling the slotted wrapper instead is not an option, since any rule
     in the outer tree beats ::slotted() regardless of specificity. */
  .dialog-content .body > .part {
    min-width: 0;
  }
  .dialog-content .body > .part[hidden] {
    display: none;
  }

  /* Turns "\n" in a caller's plain string into a line break. Set only on slots the
     element has found to hold text and no markup (see #syncSlotPresence) — a Lit or JSX
     template is full of source-formatting newlines that must stay collapsed. */
  .pre-line {
    white-space: pre-line;
  }

  .dialog-content .footer {
    user-select: none;
  }

  /* A question asked in place of the content: the body is
     hidden (still in the DOM, so nothing typed is lost) and the footer, with the question
     and its two buttons, shows alone; */
  /* The header's stand-ins: a question icon, and the question's title if it has one. */
  #ask-icon,
  .ask-title {
    display: none;
  }
  :host([data-asking]) #icon {
    display: none;
  }
  /* No close button (and no maximize button) while a question is asked (2026-10-10, the
     user's wish): its two buttons are the answers; Escape still gives the one it gives. */
  :host([data-asking]) .header-buttons {
    display: none;
  }
  :host([data-asking]) #ask-icon {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    font-size: 1.6em;
    line-height: 1;
    color: ${theme.primaryBackground};
  }
  :host([data-asking]) #ask-icon[data-tone="error"] {
    color: ${theme.dangerBackground};
  }
  #ask-icon svg {
    display: block;
    width: 1em;
    height: 1em;
    overflow: visible;
  }
  :host([data-asking][data-ask-title]) .ask-title {
    display: block;
  }
  :host([data-asking][data-ask-title]) .titles > :not(.ask-title) {
    display: none;
  }
  :host([data-asking]) .dialog-content .footer .note-icon {
    display: none;
  }
  :host([data-asking]) .dialog-content .body {
    display: none;
  }
  :host([data-asking]) .dialog-content .footer {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  :host([data-asking]) .dialog-content .footer .note {
    border: none;
    background: none;
    font-size: 1em;
  }
  /* The question's text left-aligned, the buttons stay centered. */
  :host([data-asking]) .dialog-content .footer .note-inner {
    justify-content: start;
    text-align: start;
  }
  :host([data-asking]) .dialog-content .footer .action-buttons {
    justify-content: center;
  }

  .dialog-content .footer .action-buttons {
    display: flex;
    flex-direction: row-reverse;
    gap: 0.4em;
    /* A little more room above and below the buttons (2026-10-06, the user's wish; 0.6em before). */
    padding: 0.8em 1.5em;
  }

  .action-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
    border: none;
    border-radius: ${theme.actionRadius};
    padding: 0.65em 1.5em;
    /* A stack that ships a Medium (500) face, so the weight below is visible (unlike
       Helvetica/Arial, which only have 400 + 700). */
    font-family:
      system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif;
    font-weight: 500;
    /* Pin the line-height so the label box doesn't inherit the host page's line-height
       (which crosses the shadow boundary) — keeps the button snug and centering exact. */
    line-height: 1;
    cursor: pointer;
    transition:
      background-color ${theme.buttonTransition},
      border-color ${theme.buttonTransition},
      transform ${theme.buttonTransition};
  }

  .action-button:active {
    transform: scale(${theme.buttonActiveScale});
  }

  .action-button .spinner {
    display: none;
  }

  .action-button.loading .spinner {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    width: 1.5em;
    height: 1.5em;
    border: 3px solid color-mix(in srgb, currentColor 20%, transparent);
    border-top: 3px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    overflow: hidden;
    box-sizing: border-box;
  }

  .action-button.loading .button-text {
    visibility: hidden;
  }

  .action-button[data-type="primary"] {
    color: ${theme.primaryText};
    background-color: ${theme.primaryBackground};
  }
  .action-button[data-type="primary"]:hover {
    background-color: color-mix(in srgb, ${theme.primaryBackground}, black 10%);
  }
  .action-button[data-type="primary"]:active {
    background-color: color-mix(in srgb, ${theme.primaryBackground}, black 20%);
  }

  .action-button[data-type="secondary"] {
    color: ${theme.secondaryText};
    background-color: ${theme.secondaryBackground};
    border: 1px solid ${theme.secondaryBorder};
  }
  .action-button[data-type="secondary"]:hover {
    background-color: color-mix(in srgb, ${theme.secondaryBackground}, black 5%);
  }
  .action-button[data-type="secondary"]:active {
    background-color: color-mix(in srgb, ${theme.secondaryBackground}, black 10%);
  }

  .action-button[data-type="danger"] {
    color: ${theme.dangerText};
    background-color: ${theme.dangerBackground};
  }
  .action-button[data-type="danger"]:hover {
    background-color: color-mix(in srgb, ${theme.dangerBackground}, black 15%);
  }
  .action-button[data-type="danger"]:active {
    background-color: color-mix(in srgb, ${theme.dangerBackground}, black 40%);
  }

  /* A link action: text only, in the primary color. */
  .action-button[data-type="link"] {
    color: ${theme.primaryBackground};
    background-color: transparent;
  }
  .action-button[data-type="link"]:hover {
    text-decoration: underline;
  }

  /* The separate buttons (danger and link actions) on the footer's other side: it is
     row-reverse, so the free space goes after the first of them (overridden buttons: a
     spacer between their two slots). */
  .action-button.separate-first {
    margin-inline-end: auto;
  }
  .actions-spacer {
    flex: 1;
  }

  .action-button[data-type="success"] {
    color: white;
    background-color: ${theme.successAccent};
  }
  .action-button[data-type="success"]:hover {
    background-color: color-mix(in srgb, ${theme.successAccent}, black 10%);
  }
  .action-button[data-type="success"]:active {
    background-color: color-mix(in srgb, ${theme.successAccent}, black 20%);
  }

  /* Maximize/Restore (only with maximizable) and close, at the end of the header, at its
     top. Close together: they are one group, not two items of the header's gap. */
  .header-buttons {
    flex: none;
    display: flex;
    align-self: flex-start;
    gap: 0.15em;
  }

  /* The maximize button has the look of the close button (it carries both classes). */
  .close-button {
    align-self: flex-start;
    border: none;
    border-radius: ${theme.closeRadius};
    outline: none;
    margin: 0;
    font-size: 1em;
    line-height: 0;
    background-color: transparent;
    cursor: pointer;
    padding: 0.3em;
  }
  .close-button:hover {
    background-color: light-dark(
      color-mix(in srgb, white, black 7%),
      color-mix(in srgb, black, white 7%)
    );
  }
  .close-button:active {
    background-color: light-dark(
      color-mix(in srgb, #f0f0f0, black 10%),
      color-mix(in srgb, #f0f0f0, white 10%)
    );
  }

  /* Note (see FormAttempt.reject): lives inside the footer (see element.ts
     #buildChrome), as its first child — flush against the footer's top border
     (the divider line) with no gap, and edge-to-edge across the dialog with no rounding.
     Flat fill, normal text color, reddish icon.

     The enter/exit collapse is animated in JS (element.ts #animateNoteHeight)
     via the Web Animations API, using the element's actual measured height rather than a
     CSS transition — a height transition needs a concrete end value and "auto" isn't
     one. Two CSS-only workarounds were tried and discarded: an oversized max-height
     spent most of the transition idle and then clipped unevenly right at the end (the
     icon and text visibly diverged), and an animated CSS Grid fr track wasn't reliably
     smooth across engines. overflow: hidden below just clips content during that
     JS-driven height animation. */
  /* The animated wrapper. It is the element whose height is driven (see
     #animateNoteHeight), and it stays in the chrome for the dialog's whole life —
     only its slots fill and empty — so the collapse has something stable to run on. */
  .note-region {
    box-sizing: border-box;
    overflow: hidden;
  }
  /* Collapsed rather than display:none so the region stays in the accessibility tree and
     its role="alert" can announce (see #buildChrome). Its own overflow does the hiding,
     and the JS height animation overrides this while it plays. */
  .note-region.collapsed {
    height: 0;
  }

  .note {
    margin: 0;
    /* Border-box so the two 1px borders sit inside the natural height the wrapper
       measures, rather than adding to it. */
    box-sizing: border-box;
    border: none;
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 0;
    color: ${theme.text};
    background-color: #f8f8f8;
    font-size: 0.85em;
    line-height: 1.35;
    user-select: text;
    overflow: hidden;
  }

  .note-inner {
    display: flex;
    align-items: center;
    gap: 0.85em;
    padding: 0.85em 1.5em;
  }

  .note .note-icon {
    flex: none;
    display: flex;
    align-items: center;
    font-size: 1.5em;
    line-height: 1;
    color: ${theme.dangerBackground};
  }

  /* A question (FormAttempt.ask): not an error, so the primary color on a light ground of
     it, with a question mark. */
  .note[data-tone="question"] {
    background-color: color-mix(in srgb, ${theme.primaryBackground} 8%, transparent);
  }
  .note[data-tone="question"] .note-icon {
    color: ${theme.primaryBackground};
  }

  .note-body {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .note-title {
    font-weight: 600;
    line-height: 1.15;
  }
  /* A plain string: "\n" breaks the line (e.g. the discard question and its Esc hint). */
  .note-text {
    line-height: 1.25;
    white-space: pre-line;
  }
  .note-icon svg {
    display: block;
    width: 1em;
    height: 1em;
    /* This glyph draws to the edge of its 16×16 viewBox; the SVG viewport would
       otherwise shave that outer edge at this small size. */
    overflow: visible;
  }


  @keyframes drawer-slide-out {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes drawer-slide-out-rtl {
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  @keyframes dialog-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes backdrop-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes backdrop-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const placeholderStyles = (theme: DialogTheme): string => css`
  :host {
    display: contents;
  }

  dialog.spinner-dialog {
    min-width: 0;
    width: 3.25em;
    height: 3.25em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-spinner {
    width: 2.2em;
    height: 2.2em;
    border: 3px solid color-mix(in srgb, currentColor 20%, transparent);
    border-top: 3px solid ${theme.spinner};
    border-radius: 50%;
    animation: spin-plain 1s linear infinite;
    box-sizing: border-box;
  }

  @keyframes spin-plain {
    to { transform: rotate(360deg); }
  }
`;

// The stylesheet of a theme: its values are put straight into the CSS (no custom properties, so nothing
// inherits into the slotted content). Built once per theme object.
const styleTexts = new WeakMap<DialogTheme, string>();

export function styleText(theme: DialogTheme): string {
  let text = styleTexts.get(theme);
  if (text === undefined) {
    text = dialogStyles(theme) + placeholderStyles(theme);
    styleTexts.set(theme, text);
  }
  return text;
}
