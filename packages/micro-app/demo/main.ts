// The design language first, so the demo's own CSS comes after it.
import './ui/ui.css';

import { MicroAppDemo } from './micro-app-demo.js';

// The demo page: the demo element alone. The language (`<html lang>`) and the color scheme are the page's: to try the
// German texts, set `document.documentElement.lang = 'de-DE'` in the console.
customElements.define('micro-app-demo', MicroAppDemo);
