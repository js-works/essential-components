import type { I18nAdapter } from "../api/i18n.js";
import type { OverlaysTextKey } from "../api/texts.js";
import { EN } from "../texts/en.js";

export { textOf };

// The namespace of the texts of the dialogs and the toasts for the adapter.
const NAMESPACE = "overlays";

// The adapter's translation, else (`null`, or no adapter) the English text. The page's language is never read
// (`i18n.md`).
function textOf(i18n: I18nAdapter | undefined, key: OverlaysTextKey): string {
  return i18n?.translate(NAMESPACE, key, null) ?? EN[key]();
}
