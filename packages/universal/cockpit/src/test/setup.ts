import { afterEach } from 'vitest';

afterEach(() => {
  document.body.replaceChildren();
});

// jsdom has constructable stylesheets, but no `adoptedStyleSheets`: kept as a plain list.
for (const prototype of [Document.prototype, ShadowRoot.prototype]) {
  if (!('adoptedStyleSheets' in prototype)) {
    const sheets = new WeakMap<object, CSSStyleSheet[]>();

    Object.defineProperty(prototype, 'adoptedStyleSheets', {
      get(this: object) {
        return sheets.get(this) ?? [];
      },
      set(this: object, value: CSSStyleSheet[]) {
        sheets.set(this, value);
      },
    });
  }
}

// jsdom has no `ResizeObserver` (the cockpit watches its own size): one that never reports.
globalThis.ResizeObserver ??= class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};
