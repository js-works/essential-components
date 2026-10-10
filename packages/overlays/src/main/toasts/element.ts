// -------------------------------------------------------------------
// The single-toast custom element: its shadow-root stylesheet + markup, the dismiss
// event it emits, and lazy registration under the first free tag. Registration is lazy
// (and the element class is defined *inside* it) so importing this module never touches
// the DOM — keeping the library SSR-safe until a controller is created in a browser.
// -------------------------------------------------------------------

import { css } from "../internal/css.js";
import { registerFirstFreeTag } from "../internal/custom-element.js";
import { toastIcons } from "./icons.js";
import type { ToastTheme, ToastType } from "./contract/api.js";
import { defaultToastTheme } from "./contract/theme.js";

// Fired by the shadow-DOM close button and by swipe-to-dismiss; caught (composed +
// bubbling) on the container, which maps event.target (retargeted to the host) to an id.
export const DISMISS_EVENT = "internal-toast:dismiss";

// Size of the close/countdown affordance, and the single lever for it (see .close-wrap).
const AFFORDANCE_SIZE = "1.9em";

// The 600-level accents go muddy against the dark card, so the "dark" appearance lifts them
// toward white. Mixing rather than hard-coding lighter hexes means a caller's own accent
// gets the same lift.
export const darkAccent = (accent: string): string => `color-mix(in oklab, ${accent} 65%, white)`;

const shadowStyles = (theme: ToastTheme, scale: string): string => css`
:host {
  position: relative;
  box-sizing: border-box;
  /* The scale (default 1) is the controller's \`size\` multiplier: width, padding,
     font-size and gap all scale by it, so the whole card grows/shrinks together. At the
     default 1 every value below computes to exactly the px/em written here. */
  width: min(calc(360px * ${scale}), calc(100vw - 40px));
  padding: calc(14px * ${scale}) calc(18px * ${scale})
    calc(14px * ${scale}) calc(22px * ${scale});
  background: ${theme.background};
  color: ${theme.text};
  border-radius: ${theme.radius};
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: calc(1em * ${scale});
  line-height: 1.5;
  box-shadow: ${theme.shadow};
  overflow: hidden;
  pointer-events: auto;
  transform: translateX(0);
  display: flex;
  align-items: center;
  gap: calc(12px * ${scale});
  /* Pin the card's minimum height to the affordance box plus the vertical padding, so a
     collapsed affordance can't shorten the card. Without this, a toast that is both
     sticky and non-dismissible — a loading toast, typically — drops .close-wrap out of
     this flex row entirely and ends up shorter than every other toast. */
  min-height: calc(${AFFORDANCE_SIZE} + 28px * ${scale});
  /* Let vertical scroll pass through while we own horizontal swipe. */
  touch-action: pan-y;
}

.accent {
  position: absolute;
  inset-inline-start: 0.25em;
  top: 0.25em;
  bottom: 0.25em;
  width: 4px;
  border-radius: 2em;
  background: ${theme.infoAccent};
}

:host([type="success"]) .accent {
  background: ${theme.successAccent};
}

:host([type="warn"]) .accent {
  background: ${theme.warnAccent};
}

:host([type="error"]) .accent {
  background: ${theme.errorAccent};
}

:host([type="loading"]) .accent {
  background: ${theme.loadingAccent};
}

.icon {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
  color: ${theme.iconColor ?? theme.infoAccent};
}

:host([type="success"]) .icon {
  color: ${theme.iconColor ?? theme.successAccent};
}

:host([type="warn"]) .icon {
  color: ${theme.iconColor ?? theme.warnAccent};
}

:host([type="error"]) .icon {
  color: ${theme.iconColor ?? theme.errorAccent};
}

:host([type="loading"]) .icon {
  color: ${theme.iconColor ?? theme.loadingAccent};
}

/* Built-in severity icon: shown only when the policy opts in and the caller
   didn't provide their own (loading always opts in). */
:host([icon-mode="default"]) .icon {
  display: inline-flex;
}

.icon svg {
  display: block;
  width: 1.4em;
  height: 1.4em;
}

/* The loading spinner rotates; everything else is static. */
:host([type="loading"]) .icon svg {
  animation: toast-spin 0.75s linear infinite;
}

@keyframes toast-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Caller-supplied icon (light-DOM slot): sized to match the built-in, but not
   tinted — a custom icon keeps its own colors. */
.icon-slot {
  flex: none;
  display: none;
  align-items: center;
  justify-content: center;
}

:host([icon-mode="custom"]) .icon-slot {
  display: inline-flex;
}

::slotted([slot="icon"]) {
  display: block;
  width: 1.4em;
  height: 1.4em;
}

slot {
  display: contents;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

::slotted([slot="title"]) {
  font-weight: 600;
  color: ${theme.titleColor};
}

::slotted([slot="content"]) {
  color: ${theme.messageColor};
}

/* Screen-reader-only severity prefix. Absolute so it never affects layout. */
::slotted([slot="severity"]) {
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(16px * ${scale});
  margin-top: calc(4px * ${scale});
}

:host(:not([has-actions])) .actions {
  display: none;
}

/* The action buttons themselves are styled at the document level (see
   containerStyles) — ::slotted() is unreliable for native form controls. This
   element only lays them out via the slot above. */

/* AFFORDANCE_SIZE is the one size lever here: the ring fills this box via
   inset: 0 and scales with it through its viewBox units, .close is sized in percentages
   of it, and :host derives its min-height from it so collapsing this box never changes
   the card's height. */
.close-wrap {
  flex: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${AFFORDANCE_SIZE};
  height: ${AFFORDANCE_SIZE};
  /* Pulls the affordance toward the card edge. Was -0.4em when the box was 2.4em with a
     2em button inset inside it; -0.2em keeps the same optical gap now the button fills
     the box. */
  margin-inline-end: -0.2em;
}

/* Non-dismissible + nothing to count down: the whole affordance collapses. */
:host([dismissible="false"][duration="0"]) .close-wrap {
  display: none;
}

.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
  display: block;
}

.progress-ring__value {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  /* r is chosen so the circumference is exactly 100 user units, so the dash
     values read as a simple 0..100 "percent remaining". */
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  stroke: ${theme.progressColor ?? theme.infoAccent};
  /* The duration is the toast's own, set inline on this element (attribute "duration"). */
  animation: toast-countdown 7000ms linear forwards;
}

/* Paused by the controller while the tab is hidden. */
:host([paused]) .progress-ring__value {
  animation-play-state: paused;
}

:host([type="success"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? theme.successAccent};
}

:host([type="warn"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? theme.warnAccent};
}

:host([type="error"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? theme.errorAccent};
}

/* Freezes together with the JS auto-dismiss timer, which also pauses on hover. */
:host(:hover) .progress-ring__value {
  animation-play-state: paused;
}

/* Sticky toasts (duration 0), incl. loading, have nothing to count down. */
:host([duration="0"]) .progress-ring {
  display: none;
}

/* Hide the button (but keep the ring) when the user can't dismiss. */
:host([dismissible="false"]) .close {
  display: none;
}

@keyframes toast-countdown {
  to {
    stroke-dashoffset: 100;
  }
}

.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Fills .close-wrap so that box stays the single size lever. */
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: ${theme.closeColor};
  cursor: pointer;
  border-radius: 50%;
  transition: color 150ms ease, background 150ms ease;
}

.close:hover {
  color: ${theme.closeHoverColor};
  background: ${theme.closeHoverBackground};
}

.close svg {
  display: block;
  width: 0.9em;
  height: 0.9em;
}

/* -------------------------------------------------------------------------
   Appearance variants (see ToastControllerOptions.appearance). Placed after the
   per-type rules above so they win on equal-specificity ties by source order.

   "solid": the whole card takes the severity accent as its background, with a
   light foreground (the theme's solidText, default white). Good for e.g. white-on-red
   errors.
   ------------------------------------------------------------------------- */
:host([appearance="solid"]) {
  background: ${theme.infoAccent};
  color: ${theme.solidText};
}

:host([appearance="solid"][type="success"]) {
  background: ${theme.successAccent};
}

:host([appearance="solid"][type="warn"]) {
  background: ${theme.warnAccent};
}

:host([appearance="solid"][type="error"]) {
  background: ${theme.errorAccent};
}

:host([appearance="solid"][type="loading"]) {
  background: ${theme.loadingAccent};
}

/* The whole card is the accent now, so the little stripe is redundant. */
:host([appearance="solid"]) .accent {
  display: none;
}

:host([appearance="solid"]) .icon,
:host([appearance="solid"]) ::slotted([slot="title"]),
:host([appearance="solid"]) ::slotted([slot="content"]) {
  color: ${theme.solidText};
}

:host([appearance="solid"]) .close {
  color: ${theme.solidText};
  opacity: 0.85;
}

:host([appearance="solid"]) .close:hover {
  color: ${theme.solidText};
  opacity: 1;
  background: rgba(255, 255, 255, 0.18);
}

:host([appearance="solid"]) .progress-ring__value {
  stroke: ${theme.solidText};
  opacity: 0.85;
}

/* "dark": a neutral dark card (--dark-background) with light text
   (--dark-text). Unlike "solid", the severity color is *kept* for the accent
   stripe, icon and countdown ring — so it reads as a dark-mode toast rather
   than a colored one. */
:host([appearance="dark"]) {
  background: ${theme.darkBackground};
  color: ${theme.darkText};
}

:host([appearance="dark"]) ::slotted([slot="title"]),
:host([appearance="dark"]) ::slotted([slot="content"]) {
  color: ${theme.darkText};
}

:host([appearance="dark"]) .close {
  color: ${theme.darkCloseColor};
}

:host([appearance="dark"]) .close:hover {
  color: ${theme.darkText};
  background: rgba(255, 255, 255, 0.1);
}

/* The dark appearance's accents (see darkAccent), per type. These tie on specificity with
   the per-type .accent / .icon / .progress-ring__value rules further up (the info ones),
   or beat them, so being below them makes them win. Keep them after those rules. */

:host([appearance="dark"]) .accent {
  background: ${darkAccent(theme.infoAccent)};
}

:host([appearance="dark"]) .icon {
  color: ${theme.iconColor ?? darkAccent(theme.infoAccent)};
}

:host([appearance="dark"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? darkAccent(theme.infoAccent)};
}

:host([appearance="dark"][type="success"]) .accent {
  background: ${darkAccent(theme.successAccent)};
}

:host([appearance="dark"][type="success"]) .icon {
  color: ${theme.iconColor ?? darkAccent(theme.successAccent)};
}

:host([appearance="dark"][type="success"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? darkAccent(theme.successAccent)};
}

:host([appearance="dark"][type="warn"]) .accent {
  background: ${darkAccent(theme.warnAccent)};
}

:host([appearance="dark"][type="warn"]) .icon {
  color: ${theme.iconColor ?? darkAccent(theme.warnAccent)};
}

:host([appearance="dark"][type="warn"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? darkAccent(theme.warnAccent)};
}

:host([appearance="dark"][type="error"]) .accent {
  background: ${darkAccent(theme.errorAccent)};
}

:host([appearance="dark"][type="error"]) .icon {
  color: ${theme.iconColor ?? darkAccent(theme.errorAccent)};
}

:host([appearance="dark"][type="error"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? darkAccent(theme.errorAccent)};
}

:host([appearance="dark"][type="loading"]) .accent {
  background: ${darkAccent(theme.loadingAccent)};
}

:host([appearance="dark"][type="loading"]) .icon {
  color: ${theme.iconColor ?? darkAccent(theme.loadingAccent)};
}

:host([appearance="dark"][type="loading"]) .progress-ring__value {
  stroke: ${theme.progressColor ?? darkAccent(theme.loadingAccent)};
}

@media (prefers-reduced-motion: reduce) {
  :host,
  .close {
    transition: none;
  }

  .progress-ring,
  :host([type="loading"]) .icon svg {
    animation: none;
  }
}
`;

const SHADOW_HTML = `
<style></style>
<span class="accent"></span>
<span class="icon" aria-hidden="true"></span>
<span class="icon-slot" aria-hidden="true"><slot name="icon"></slot></span>
<div class="content">
  <slot name="severity"></slot>
  <slot name="title"></slot>
  <slot name="content"></slot>
  <div class="actions"><slot name="action"></slot></div>
</div>
<div class="close-wrap">
  <svg class="progress-ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
    <circle class="progress-ring__value" cx="18" cy="18" r="15.9155"></circle>
  </svg>
  <button class="close" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
      <line x1="6" y1="6" x2="18" y2="18"></line>
      <line x1="18" y1="6" x2="6" y2="18"></line>
    </svg>
  </button>
</div>
`;

// Resolved lazily on first controller creation so importing this module never
// touches the DOM (SSR-safe) and the element class only references HTMLElement
// when actually running in a browser. Returns the plain tag string; adapters
// decide how to use it.
let tagCache: string | null = null;

// The theme of each stack container (set by its controller), and the shadow stylesheet of
// each theme, built once. The values are put straight into the CSS (no custom properties
// on the container, so nothing inherits into the slotted content).
type ContainerStyle = { theme: ToastTheme; scale: string; text: string };
const containerStyles = new WeakMap<Element, ContainerStyle>();
const shadowTexts = new WeakMap<ToastTheme, Map<string, string>>();

function shadowText(theme: ToastTheme, scale: string): string {
  let texts = shadowTexts.get(theme);
  if (texts === undefined) {
    texts = new Map();
    shadowTexts.set(theme, texts);
  }
  let text = texts.get(scale);
  if (text === undefined) {
    text = shadowStyles(theme, scale);
    texts.set(scale, text);
  }
  return text;
}

const defaultShadowText = (): string => shadowText(defaultToastTheme, "1");

// Called by the controller whenever its theme or card scale (the `size` option) is
// (re)applied: the toasts already in the stack take the new stylesheet at once, later ones
// on connect.
export function setToastTheme(container: Element, theme: ToastTheme, scale: string): void {
  containerStyles.set(container, { theme, scale, text: shadowText(theme, scale) });
  if (tagCache) {
    container
      .querySelectorAll(tagCache)
      .forEach((host) => (host as unknown as { syncTheme(): void }).syncTheme());
  }
}

// Pauses or resumes the countdown rings of a stack (the tab hidden or shown): the toasts in
// it at once, later ones on connect.
export function setToastsPaused(container: Element, paused: boolean): void {
  container.toggleAttribute("data-paused", paused);
  if (tagCache) {
    container
      .querySelectorAll(tagCache)
      .forEach((host) => host.toggleAttribute("paused", paused));
  }
}

export function ensureElementRegistered(): string {
  if (tagCache) {
    return tagCache;
  }

  class ToastElement extends HTMLElement {
    private button: HTMLButtonElement | null = null;
    private styleEl: HTMLStyleElement | null = null;
    private styleText: string | null = null;
    private iconEl: HTMLElement | null = null;
    private ringEl: SVGElement | null = null;

    // Swipe state.
    private dragging = false;
    private dragStartX = 0;
    private dx = 0;
    private swipeDir: "left" | "right" | null = null;

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = SHADOW_HTML;
      this.styleEl = root.querySelector<HTMLStyleElement>("style");
      this.button = root.querySelector<HTMLButtonElement>("button.close");
      this.iconEl = root.querySelector<HTMLElement>(".icon");
      this.ringEl = root.querySelector<SVGElement>(".progress-ring__value");
      this.button?.addEventListener("click", () => this.emitDismiss());

      this.addEventListener("pointerdown", this.onPointerDown);
      this.addEventListener("pointermove", this.onPointerMove);
      this.addEventListener("pointerup", this.onPointerUp);
      this.addEventListener("pointercancel", this.onPointerUp);
    }

    connectedCallback(): void {
      this.syncTheme();
    }

    // The stylesheet of the stack this toast is in (the defaults outside one), and its
    // paused state.
    syncTheme(): void {
      const container = this.closest(".toasts-container");
      const text = (container && containerStyles.get(container)?.text) ?? defaultShadowText();
      if (text !== this.styleText && this.styleEl) {
        this.styleText = text;
        this.styleEl.textContent = text;
      }
      this.toggleAttribute("paused", container?.hasAttribute("data-paused") ?? false);
    }

    private emitDismiss(): void {
      this.dispatchEvent(
        new CustomEvent(DISMISS_EVENT, { bubbles: true, composed: true }),
      );
    }

    static get observedAttributes(): string[] {
      return ["dismiss-label", "duration", "type"];
    }

    attributeChangedCallback(
      name: string,
      _oldValue: string | null,
      value: string | null,
    ): void {
      if (name === "dismiss-label") {
        this.button?.setAttribute("aria-label", value ?? "");
      } else if (name === "duration") {
        // A duration change on a persistent host (e.g. loading -> success via
        // update/promise) must restart the countdown from full, otherwise the
        // already-"finished" forwards animation leaves an empty ring.
        if (value && value !== "0" && this.ringEl) {
          this.ringEl.style.animation = "none";
          void this.ringEl.getBoundingClientRect();
          this.ringEl.style.animation = "";
        }
        // The ring's duration, inline on the ring in the shadow root (after the restart,
        // which clears the inline animation): it never meets the slide transform the
        // controller writes to the host's style.
        this.ringEl?.style.setProperty("animation-duration", `${value ?? "0"}ms`);
      } else if (name === "type" && this.iconEl) {
        // Swap in the severity icon. Decorative only (aria-hidden), since the
        // severity is already conveyed by role + the sr-only prefix.
        const icon = value
          ? toastIcons[value as ToastType]
          : undefined;
        this.iconEl.innerHTML = icon ?? "";
      }
    }

    // --- swipe-to-dismiss ---------------------------------------------------
    // Only toward the anchored edge (matching the exit slide's direction, read
    // from the container's data-swipe). Buttons and non-dismissible hosts are
    // exempt. On release past threshold we just emit the dismiss event and let
    // the core run its normal slide-out from wherever the finger left off.

    private onPointerDown = (event: PointerEvent): void => {
      if (event.button !== 0 && event.pointerType === "mouse") {
        return;
      }
      // A press on the close button (which lives in the shadow root) or a slotted action
      // button must not start a swipe — doing so captures the pointer and swallows the
      // button's click. For shadow-internal presses `event.target` is retargeted to the
      // host, so `event.target.closest("button")` misses the close button; consult the
      // composed path instead (pointer events are composed), which pierces the shadow root.
      if (
        event
          .composedPath()
          .some((node) => node instanceof HTMLElement && node.tagName === "BUTTON")
      ) {
        return;
      }
      if (this.getAttribute("dismissible") === "false") {
        return;
      }
      const dir = this.closest<HTMLElement>(".toasts-container")?.dataset
        .swipe;
      if (dir !== "left" && dir !== "right") {
        return;
      }
      this.swipeDir = dir;
      this.dragging = true;
      this.dx = 0;
      this.dragStartX = event.clientX;
      this.style.transition = "none";
      this.setPointerCapture(event.pointerId);
    };

    private onPointerMove = (event: PointerEvent): void => {
      if (!this.dragging) {
        return;
      }
      let dx = event.clientX - this.dragStartX;
      // Clamp to the anchored direction so an "away" drag doesn't pull it out.
      dx = this.swipeDir === "right" ? Math.max(0, dx) : Math.min(0, dx);
      this.dx = dx;
      const width = this.offsetWidth || 1;
      const progress = Math.min(1, Math.abs(dx) / width);
      this.style.transform = `translateX(${dx}px)`;
      this.style.opacity = String(1 - progress * 0.6);
    };

    private onPointerUp = (): void => {
      if (!this.dragging) {
        return;
      }
      this.dragging = false;
      const width = this.offsetWidth || 1;
      const threshold = Math.max(60, width * 0.3);
      if (Math.abs(this.dx) > threshold) {
        this.emitDismiss();
      } else {
        // Snap back.
        this.style.transition = "transform 200ms ease, opacity 200ms ease";
        this.style.transform = "";
        this.style.opacity = "";
      }
    };
  }

  const { tag } = registerFirstFreeTag(
    "internal-toast",
    ToastElement,
  );
  tagCache = tag;
  return tag;
}
