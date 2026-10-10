import { FileUploadElement, TableElement } from './setup';
import { XwikiAttachmentManager } from './XwikiAttachmentManager';

// The entry of the bundle: registers the elements (once, also if the bundle is loaded twice on a page). The data
// table and the file upload get tag names of their own (prefix "xam-"), so they cannot clash with other copies.
const define = (tag: string, element: CustomElementConstructor) => {
  if (customElements.get(tag) === undefined) {
    customElements.define(tag, element);
  }
};

define('xam-data-table', TableElement);
define('xam-file-upload', FileUploadElement);
define('xwiki-attachment-manager', XwikiAttachmentManager);
