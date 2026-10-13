import type * as Spec from '../api/index.js';
import { CockpitElement } from './CockpitElement.js';

export { createCockpitClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-cockpit', createCockpitClass({ title, items }))`. Every call creates a new class,
// because a registry accepts each class only once.
function createCockpitClass(config: Spec.Config): Spec.ElementClass {
  return class extends CockpitElement {
    constructor() {
      super(config);
    }
  };
}
