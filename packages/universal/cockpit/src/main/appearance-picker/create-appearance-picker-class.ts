import type { AppearancePickerClass, AppearancePickerClassConfig } from '../index.js';
import { AppearancePickerElementBase } from './appearance-picker-element-base.js';
import { appearancePickerStyles } from './appearance-picker-styles.js';

export { createAppearancePickerClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-appearance-picker', createAppearancePickerClass({ theme }))`. Every call creates a new
// class, because a registry accepts each class only once. The theme is fixed per class: its stylesheet is built here,
// once.
function createAppearancePickerClass(config: AppearancePickerClassConfig = {}): AppearancePickerClass {
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(appearancePickerStyles(config.theme ?? {}));

  return class extends AppearancePickerElementBase {
    constructor() {
      super(config, sheet);
    }
  };
}
