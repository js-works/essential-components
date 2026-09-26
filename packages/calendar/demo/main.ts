// The design language first, so the demo's own CSS comes after it.
import './ui/ui.css';
import { DatePickerDemo } from './DatePickerDemo.js';

// The page around the demo: its global switch sets the color scheme for everything on the page. (The picker's
// language is a switch of the demo itself: it is what the demo shows.)
const switches = document.querySelector<HTMLFormElement>('#page-switches');

function apply(): void {
  if (switches === null) {
    return;
  }

  const data = new FormData(switches);

  document.documentElement.dataset['scheme'] = String(data.get('scheme') ?? 'system');
}

switches?.addEventListener('change', apply);
apply();
customElements.define('date-picker-demo', DatePickerDemo);
