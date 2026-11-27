import { I18nController, setElementI18nAdapter } from '../core/i18n-controller.js';
import { createAppHeaderClass } from '../element/create-app-header-class.js';
import { createCockpitClass } from '../element/create-cockpit-class.js';
import { createLoginClass } from '../login/create-login-class.js';
import { createNavTreeClass } from '../nav-tree/create-nav-tree-class.js';
import { createStatusViewClass } from '../status-view/create-status-view-class.js';

// The part of the elements that needs the DOM (Lit). The React wrappers load it with `import()` on the first mount on
// the client, so importing them on the server never touches `HTMLElement`.
export {
  createAppHeaderClass,
  createCockpitClass,
  createLoginClass,
  createNavTreeClass,
  createStatusViewClass,
  I18nController,
  setElementI18nAdapter,
};
