import type * as Spec from '../api';
import { FileUploadElement } from './FileUploadElement';
import { createStyleSheet } from './styles';

export { createFileUploadClass };

// A new element class with the given config. The app registers it itself, under a tag name of its choice:
// `class AcmeUpload extends createFileUploadClass({ theme }) {}`, then `customElements.define('acme-upload', AcmeUpload)`.
// Every call creates a new class, because a registry accepts each class only once.
function createFileUploadClass(config: Spec.Config = {}): Spec.ElementClass {
  // Built once per class, when the first element is created, and shared by all its elements.
  let styles: CSSStyleSheet | string | undefined;

  return class extends FileUploadElement {
    constructor() {
      super(styles ??= createStyleSheet(config), config.i18n?.getAdapter);
    }
  };
}
