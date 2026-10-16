import { createFileUploadClass } from '../element/create-file-upload-class.js';
import { setElementI18nAdapter } from '../element/file-upload-element.js';

// The part of the element that needs the DOM. The React wrapper loads it with `import()` on the first mount on the
// client, so importing the wrapper on the server never touches `HTMLElement`.
export { createFileUploadClass, setElementI18nAdapter };
