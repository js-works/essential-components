import { createFileUploadClass } from '../element/createFileUploadClass';
import { setElementI18nAdapter } from '../element/FileUploadElement';

// The part of the element that needs the DOM. The React wrapper loads it with `import()` on the first mount on the
// client, so importing the wrapper on the server never touches `HTMLElement`.
export { createFileUploadClass, setElementI18nAdapter };
