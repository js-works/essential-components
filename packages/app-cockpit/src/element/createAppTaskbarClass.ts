import type * as Spec from '../api';
import { AppTaskbarElement } from './AppTaskbarElement';

export { createAppTaskbarClass, defineAppTaskbar };

// A new element class of the taskbar, for a host without the cockpit: `customElements.define('app-taskbar',
// createAppTaskbarClass())`. Every call creates a new class, because a registry accepts each class only once.
function createAppTaskbarClass(): Spec.TaskbarElementClass {
  return class extends AppTaskbarElement {};
}

// The cockpit renders `<app-taskbar>` in its shadow root (`taskbar: true`): it registers the tag itself, unless the
// host has done so.
function defineAppTaskbar(): void {
  if (customElements.get('app-taskbar') === undefined) {
    customElements.define('app-taskbar', createAppTaskbarClass());
  }
}
