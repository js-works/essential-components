// The design language first, so the demo's own CSS comes after it.
import './ui/ui.css';

import { RichTextDemo } from './rich-text-demo.js';

// The demo page: the demo element alone. The language (`<html lang>`) and the color scheme are the page's: to try the
// German texts of BlockNote, set `document.documentElement.lang = 'de-DE'` in the console.
customElements.define('rich-text-demo', RichTextDemo);
