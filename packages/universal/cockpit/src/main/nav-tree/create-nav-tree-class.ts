import type { NavTreeClass, NavTreeClassConfig } from '../index.js';
import { NavTreeElementBase } from './nav-tree-element-base.js';

export { createNavTreeClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-nav-tree', createNavTreeClass({ i18n }))`. Every call creates a new class,
// because a registry accepts each class only once.
function createNavTreeClass(config: NavTreeClassConfig = {}): NavTreeClass {
  return class extends NavTreeElementBase {
    constructor() {
      super(config);
    }
  };
}
