import type { LoginClass, LoginClassConfig } from '../index.js';
import { LoginElementBase } from './login-element-base.js';
import { loginStyles } from './login-styles.js';

export { createLoginClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `customElements.define('app-login', createLoginClass({ theme }))`. Every call creates a new class, because a registry
// accepts each class only once. The theme is fixed per class: its stylesheet is built here, once.
function createLoginClass(config: LoginClassConfig = {}): LoginClass {
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(loginStyles(config.theme ?? {}));

  return class extends LoginElementBase {
    constructor() {
      super(config, sheet);
    }
  };
}
