import type { AppHeaderClass, AppHeaderClassConfig } from '../index.js';
import { AppHeaderElementBase } from './app-header-element-base.js';

export { createAppHeaderClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-header', createAppHeaderClass({ theme }))`. Every call creates a new class, because a
// registry accepts each class only once.
function createAppHeaderClass(config: AppHeaderClassConfig = {}): AppHeaderClass {
  return class extends AppHeaderElementBase {
    constructor() {
      super(config);
    }
  };
}
