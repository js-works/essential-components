import type { CockpitTheme } from '../index.js';
import { screenStyles, screenValues } from '../screen/screen-styles.js';

export { statusViewStyles };

// The status view's CSS, in its shadow root: the screen's (`screenStyles`, for `layout="screen"`: the card on its
// screen, at least its container's height; the brand, the heading, the button `.primary`, the footer, the hint) and its
// own parts: the status (the icon on a light ground of the accent, an error's in the error color; the heading and the
// message, centered) and the inline layout (no background of its own, the page's text color, the font the theme's
// only when given; a smaller heading and icon, the button as wide as its text).
function statusViewStyles(theme: CockpitTheme): string {
  const v = screenValues(theme);
  const { size } = v;

  return screenStyles(v, '100%') + /* css */ `
:host([layout='screen']) {
  height: 100%;
}

.inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  ${theme.fontFamily === undefined ? '' : `font-family: ${theme.fontFamily};`}
  font-size: ${v.fontSize};
  line-height: 1.5;
  text-align: center;

  .brand {
    justify-content: center;
    text-align: start;
  }

  .heading {
    font-size: ${size(16)};
    font-weight: 600;
    line-height: 1.5;
  }

  .primary {
    width: auto;
  }

  .footer {
    width: min(400px, 100%);
  }
}

.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  .screen & {
    padding-block: 8px;
  }
}

.status-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  border-radius: 50%;
  background: color-mix(in srgb, ${v.accent} 12%, transparent);
  color: ${v.accent};

  &[hidden] {
    display: none;
  }

  svg {
    font-size: ${size(28)};
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  [data-kind='error'] > & {
    background: color-mix(in srgb, ${v.danger} 12%, transparent);
    color: ${v.danger};
  }

  .inline & {
    width: 48px;
    height: 48px;
    margin-bottom: 4px;

    svg {
      font-size: ${size(24)};
    }
  }
}

::slotted(svg[slot='icon']) {
  width: ${size(24)};
  height: ${size(24)};
}

.message {
  max-width: 400px;
  margin: 0;
  color: ${v.muted};
  font-size: ${size(14)};
}
`;
}
