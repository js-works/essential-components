import type { SystemBannerClass, SystemBannerClassConfig } from '../index.js';
import { SystemBannerElementBase } from './system-banner-element-base.js';
import { systemBannerStyles } from './system-banner-styles.js';

export { createSystemBannerClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-system-banner', createSystemBannerClass({ theme }))`. Every call creates a new class,
// because a registry accepts each class only once. The theme is fixed per class: its stylesheet is built here, once.
function createSystemBannerClass(config: SystemBannerClassConfig = {}): SystemBannerClass {
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(systemBannerStyles(config.theme ?? {}));

  return class extends SystemBannerElementBase {
    constructor() {
      super(config, sheet);
    }
  };
}
