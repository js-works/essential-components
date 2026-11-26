import type { LoginTheme } from '../index.js';
import { DEFAULT_COCKPIT_THEME } from '../themes/default-cockpit-theme.js';

export { loginStyles };

// The login's CSS (the frame and its buttons), in its shadow root, built from its theme (its values put straight in: no
// custom properties). Every `font-size` is a multiple of the theme's `fontSize` (`size(N)`, N the size in px at 14); no
// rem: a page's root font size must not change it. The host's content inherits the card's font and color (a slotted
// element inherits from its slot); its look is the host's.
//
// The card (with the hint, `.column`) a bit above the middle, like the overlays' dialogs: three rows, the free space
// split 40/60 above and below it. The card moves by 40% of a change of its height (another view, an error).
function loginStyles(theme: LoginTheme): string {
  const fontSize = theme.fontSize ?? DEFAULT_COCKPIT_THEME.fontSize;
  const accentColor = theme.accentColor ?? DEFAULT_COCKPIT_THEME.accentColor;
  const v = {
    // A custom accent: lighter in a dark scheme by a mix with white (like the cockpit's); the default has both.
    accent: theme.accentColor === undefined
      ? accentColor
      : `light-dark(${accentColor}, color-mix(in oklab, ${accentColor} 60%, white))`,
    fontSize,
    fontFamily: theme.fontFamily ?? DEFAULT_COCKPIT_THEME.fontFamily,
    screen: 'light-dark(#f1f3f5, #1a1a1a)',
    card: 'light-dark(#fff, #242424)',
    text: 'CanvasText',
    muted: 'light-dark(#666, #bbb)',
    field: 'light-dark(#fff, #111)',
    fieldText: 'light-dark(#111, #f5f5f5)',
    border: 'light-dark(#b2b8be, #696a6c)',
    divider: 'light-dark(#dee2e6, #424242)',
    hover: 'light-dark(#f5f5f5, #2e2e2e)',
    // Pressed: a step darker than the hover.
    active: 'light-dark(#e9ecef, #383838)',
    // The text on the accent: white, dark on the lighter accent of a dark scheme.
    onAccent: 'light-dark(#fff, #111)',
    danger: 'light-dark(#c92a2a, #ff8787)',
    shadow: '0 1px 3px light-dark(rgb(0 0 0 / 10%), rgb(0 0 0 / 45%))',
    buttonRadius: '5px',
    cardRadius: '6px',
  };
  const size = (px: number) => `calc(${fontSize} * ${px} / 14)`;

  return /* css */ `
:host {
  display: block;
  -webkit-user-select: none;
  user-select: none;
}

:host([hidden]) {
  display: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.screen {
  display: grid;
  grid-template-rows: minmax(32px, 2fr) auto minmax(16px, 3fr);
  justify-items: center;
  min-height: 100dvh;
  padding: env(safe-area-inset-top) max(16px, env(safe-area-inset-right)) env(safe-area-inset-bottom)
    max(16px, env(safe-area-inset-left));
  background: ${v.screen};
  color: ${v.text};
  font-family: ${v.fontFamily};
  font-size: ${v.fontSize};
  line-height: 1.5;
}

.column {
  display: grid;
  grid-row: 2;
  justify-items: center;
  gap: 16px;
}

/* The card's frame is ours, so the small screens below can take it away. Its children (and the host's, slotted into
   it) one below the other. */
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(440px, calc(100vw - 32px));
  padding: 32px;
  border: 1px solid ${v.divider};
  border-radius: ${v.cardRadius};
  background: ${v.card};
  box-shadow: ${v.shadow};
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  color: ${v.accent};

  svg {
    width: 28px;
    height: 28px;
  }
}

/* The host's logo in place of the default (the cockpit's four squares). */
::slotted(svg[slot='logo']) {
  width: 28px;
  height: 28px;
}

/* The app's name is the small line on top; the view's heading leads. */
.title {
  margin: 0;
  font-size: ${size(16)};
  font-weight: 600;
  line-height: 1.2;
}

.subtitle {
  margin: 2px 0 0;
  color: ${v.muted};
  font-size: ${size(12)};
}

.heading {
  margin: 0;
  font-size: ${size(20)};
  font-weight: 700;
  line-height: 1.25;
}

/* The submit button: it submits the host's form. */
.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  padding: 0 16px;
  border: 0;
  border-radius: ${v.buttonRadius};
  background: ${v.accent};
  color: ${v.onAccent};
  font: inherit;
  font-size: ${size(14)};
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, ${v.accent} 88%, black);
  }

  &:active:not(:disabled) {
    background: color-mix(in srgb, ${v.accent} 76%, black);
  }

  &:focus-visible {
    outline: 2px solid ${v.accent};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}

/* "or" between the host's content and the providers. */
.or {
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${v.muted};
  font-size: ${size(12)};

  &::before,
  &::after {
    flex: 1;
    border-top: 1px solid ${v.divider};
    content: '';
  }
}

.providers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.provider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  padding: 0 16px;
  border: 1px solid ${v.border};
  border-radius: ${v.buttonRadius};
  background: ${v.field};
  color: ${v.fieldText};
  font: inherit;
  font-size: ${size(14)};
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${v.hover};
  }

  &:active:not(:disabled) {
    background: ${v.active};
  }

  &:focus-visible {
    outline: 2px solid ${v.accent};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}

.provider-icon {
  display: grid;
  place-items: center;

  svg {
    width: 18px;
    height: 18px;
  }
}

/* The running provider's spinner, in place of its icon. */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

@keyframes login-spin {
  to {
    rotate: 1turn;
  }
}

/* A failed sign in with a provider. */
.alert {
  margin: 0;
  padding: 10px 12px;
  border-radius: ${v.buttonRadius};
  background: color-mix(in srgb, ${v.danger} 12%, transparent);
  color: ${v.danger};
  font-size: ${size(14)};
}

/* Below a line: the way to the other views, centered. */
.footer {
  padding-top: 16px;
  border-top: 1px solid ${v.divider};
  font-size: ${size(14)};
  text-align: center;

  &[hidden] {
    display: none;
  }
}

::slotted([slot='hint']) {
  color: ${v.muted};
  font-size: ${size(12)};
  text-align: center;
}

/* Short (a phone in landscape, a small window): less room above and inside the card; it scrolls if it still does not
   fit. */
@media (max-height: 640px) {
  .screen {
    grid-template-rows: minmax(16px, 2fr) auto minmax(16px, 3fr);
  }

  .card {
    padding: 24px;
  }
}

/* Narrow (a phone): the card is the whole page, edge to edge, from the top, without its frame. One column as wide as
   the screen, so every view has the same width. */
@media (max-width: 480px) {
  .screen {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    align-content: start;
    justify-items: stretch;
    padding-top: 0;
    padding-inline: 0;
    background: ${v.card};
  }

  .column {
    grid-row: auto;
    justify-items: stretch;
    gap: 0;
  }

  .card {
    width: 100%;
    padding: 32px max(24px, env(safe-area-inset-left)) 24px;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  ::slotted([slot='hint']) {
    padding: 0 24px 16px;
  }
}

/* Narrow or touch: bigger targets. */
@media (max-width: 480px), (pointer: coarse) {
  .submit,
  .provider {
    height: 44px;
  }
}
`;
}
