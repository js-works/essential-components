import type { CockpitClass, CockpitClassConfig } from '../index.js';
import { CockpitElementBase } from './cockpit-element-base.js';

export { createCockpitClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-cockpit', createCockpitClass({ title, items }))`. Every call creates a new class,
// because a registry accepts each class only once.
function createCockpitClass(config: CockpitClassConfig): CockpitClass {
  return class extends CockpitElementBase {
    constructor() {
      super(config);
    }
  };
}
