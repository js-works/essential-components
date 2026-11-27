import type { CockpitTheme } from '../index.js';
import { screenStyles, screenValues } from '../screen/screen-styles.js';

export { loginStyles };

// The login's CSS, in its shadow root: the screen's (`screenStyles`: the card, the brand, the heading, the submit
// button `.primary`, the footer, the hint; at least the window's height) and its own parts (the line "or", the
// providers, the spinner, the alert).
function loginStyles(theme: CockpitTheme): string {
  const v = screenValues(theme);
  const { size } = v;

  return screenStyles(v, '100dvh') + /* css */ `
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

/* Narrow or touch: bigger targets. */
@media (max-width: 480px), (pointer: coarse) {
  .provider {
    height: 44px;
  }
}
`;
}
