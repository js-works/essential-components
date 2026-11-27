import type { StatusViewClass, StatusViewClassConfig } from '../index.js';
import { StatusViewElementBase } from './status-view-element-base.js';
import { statusViewStyles } from './status-view-styles.js';

export { createStatusViewClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-status-view', createStatusViewClass({ theme }))`. Every call creates a new class,
// because a registry accepts each class only once. The theme is fixed per class: its stylesheet is built here, once.
function createStatusViewClass(config: StatusViewClassConfig = {}): StatusViewClass {
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(statusViewStyles(config.theme ?? {}));

  return class extends StatusViewElementBase {
    constructor() {
      super(config, sheet);
    }
  };
}
