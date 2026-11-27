import type { CockpitTheme } from '../index.js';
import { accentOf, DEFAULT_COCKPIT_THEME } from '../themes/default-cockpit-theme.js';

export type { ScreenValues };
export { primaryButtonStyles, screenStyles, screenValues };

// The values of a screen's CSS (the login's, the status view's), from its theme.
type ScreenValues = ReturnType<typeof screenValues>;

function screenValues(theme: CockpitTheme) {
  const fontSize = theme.fontSize ?? DEFAULT_COCKPIT_THEME.fontSize;

  return {
    accent: accentOf(theme),
    fontSize,
    fontFamily: theme.fontFamily ?? DEFAULT_COCKPIT_THEME.fontFamily,
    buttonActiveTransform: theme.buttonActiveTransform ?? DEFAULT_COCKPIT_THEME.buttonActiveTransform,
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
    buttonRadius: theme.buttonBorderRadius ?? DEFAULT_COCKPIT_THEME.buttonBorderRadius,
    cardRadius: '6px',
    size: (px: number) => `calc(${fontSize} * ${px} / 14)`,
  };
}

// The CSS of a screen with a card (the login, the status view's `screen`), in its shadow root, built from its theme (its values
// put straight in: no custom properties). Every `font-size` is a multiple of the theme's `fontSize` (`size(N)`, N the
// size in px at 14); no rem: a page's root font size must not change it. The host's content inherits the card's font
// and color (a slotted element inherits from its slot); its look is the host's.
//
// The card (with the hint, `.column`) a bit above the middle, like the overlays' dialogs: three rows, the free space
// split 40/60 above and below it. The card moves by 40% of a change of its height. `minHeight`: the screen's (the
// login: the window's; the status view: its container's).
function screenStyles(v: ScreenValues, minHeight: string): string {
  const { size } = v;

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
  min-height: ${minHeight};
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

${primaryButtonStyles(v)}
/* Below a line: e.g. the way to the other views, centered. */
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

/* Narrow (a phone): the card is the whole screen, edge to edge, from the top, without its frame. One column as wide as
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

`;
}

// The main button `.primary` in the accent (the login's submit button, the status view's action), full width; 44px
// high when narrow or touch.
function primaryButtonStyles(v: ScreenValues): string {
  const { size } = v;

  return /* css */ `
.primary {
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
    transform: ${v.buttonActiveTransform};
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

@media (max-width: 480px), (pointer: coarse) {
  .primary {
    height: 44px;
  }
}
`;
}
