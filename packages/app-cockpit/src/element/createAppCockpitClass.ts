import type * as Spec from '../api';
import { AppCockpitElement } from './AppCockpitElement';

export { createAppCockpitClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-cockpit', createAppCockpitClass({ title, items }))`. Every call creates a new class,
// because a registry accepts each class only once.
function createAppCockpitClass(config: Spec.Config): Spec.ElementClass {
  return class extends AppCockpitElement {
    constructor() {
      super(config);
    }
  };
}
