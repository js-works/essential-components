import type { CockpitTheme } from '../index.js';
import { screenValues } from '../screen/screen-styles.js';

export { appearancePickerStyles };

// The appearance picker's CSS, in its shadow root, built from its theme (no custom properties; every `font-size` a
// multiple of the theme's `fontSize`). No background of its own, the text color the page's, the font the theme's only
// when given. The schemes a segmented control (a track, the chosen one raised on it, its icon in the accent); the
// accents round swatches (the chosen one with a ring in the text color and a white check).
function appearancePickerStyles(theme: CockpitTheme): string {
  const v = screenValues(theme);
  const { size } = v;

  return /* css */ `
:host {
  display: inline-block;
  ${theme.fontFamily === undefined ? '' : `font-family: ${theme.fontFamily};`}
}

:host([hidden]) {
  display: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.picker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: ${size(14)};
  line-height: 1.4;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: ${v.muted};
  font-size: ${size(12)};
  font-weight: 600;
}

.scheme-group {
  display: inline-flex;
  gap: 2px;
  width: max-content;
  padding: 3px;
  border-radius: calc(${v.buttonRadius} + 3px);
  background: light-dark(#eceef1, #2e2e2e);
}

.scheme {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: ${v.buttonRadius};
  background: transparent;
  color: ${v.muted};
  font: inherit;
  font-size: ${size(13)};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: CanvasText;
  }

  &[aria-checked='true'] {
    background: light-dark(#fff, #4a4a4a);
    color: CanvasText;
    box-shadow: 0 1px 2px light-dark(rgb(0 0 0 / 12%), rgb(0 0 0 / 40%));

    .scheme-icon {
      color: ${v.accent};
    }
  }

  &:focus-visible {
    outline: 2px solid ${v.accent};
    outline-offset: 1px;
  }
}

.scheme-icon {
  font-size: ${size(16)};
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.accent-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.swatch {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;

  &[aria-checked='true'] {
    outline: 2px solid CanvasText;
    outline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid ${v.accent};
    outline-offset: 2px;
  }
}

.check {
  font-size: ${size(16)};
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (pointer: coarse) {
  .scheme {
    height: 44px;
  }

  .swatch {
    width: 40px;
    height: 40px;
  }
}
`;
}
