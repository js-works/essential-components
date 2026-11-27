import type { CockpitTheme } from '../index.js';
import { screenValues } from '../screen/screen-styles.js';

export { systemBannerStyles };

// The system banner's CSS, in its shadow root, built from its theme (no custom properties: the tone's colors are put
// into a rule per tone; every `font-size` a multiple of the theme's `fontSize`). A strip as wide as its container: a
// light tint of the tone's color, its icon and its border line in that color, the text the page's; the button outlined
// in the tone's color, the close button an icon. `info` is the accent; the other tones are the design language's.
function systemBannerStyles(theme: CockpitTheme): string {
  const v = screenValues(theme);
  const { size } = v;
  const tones = {
    info: v.accent,
    warning: 'light-dark(#b35c00, #ffb35c)',
    danger: v.danger,
    success: 'light-dark(#2b8a3e, #69db7c)',
  };
  const toneRules = (tone: string, color: string) => /* css */ `
:host([tone='${tone}']) {
  .banner {
    border-bottom-color: color-mix(in srgb, ${color} 35%, transparent);
    background: light-dark(color-mix(in srgb, ${color} 12%, #fff), color-mix(in srgb, ${color} 22%, #1a1a1a));
  }

  .icon {
    color: ${color};
  }

  .action {
    border-color: ${color};
  }

  .action:hover,
  .close:hover {
    background: color-mix(in srgb, ${color} 14%, transparent);
  }

  .action:focus-visible,
  .close:focus-visible {
    outline-color: ${color};
  }
}
`;

  return /* css */ `
:host {
  display: block;
}

:host([hidden]) {
  display: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.banner {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  padding: 4px 8px 4px 16px;
  border-bottom: 1px solid transparent;
  color: CanvasText;
  ${theme.fontFamily === undefined ? '' : `font-family: ${theme.fontFamily};`}
  font-size: ${size(14)};
  line-height: 1.4;
}

.icon {
  display: flex;
  flex: none;

  svg {
    font-size: ${size(18)};
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.message {
  flex: 1;
  min-width: 0;
  padding-block: 4px;
}

.action,
.close {
  flex: none;
  border-radius: ${v.buttonRadius};
  font: inherit;
  cursor: pointer;

  &:active {
    transform: ${v.buttonActiveTransform};
  }

  &:focus-visible {
    outline: 2px solid;
    outline-offset: 2px;
  }
}

.action {
  height: 28px;
  padding: 0 12px;
  border: 1px solid;
  background: transparent;
  color: inherit;
  font-size: ${size(13)};
  font-weight: 600;
}

.close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;

  svg {
    font-size: ${size(16)};
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
}
${Object.entries(tones).map(([tone, color]) => toneRules(tone, color)).join('')}
@media (pointer: coarse) {
  .action,
  .close {
    min-width: 44px;
    height: 44px;
  }
}
`;
}
