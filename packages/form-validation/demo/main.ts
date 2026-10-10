// The design language first, so the demo's own CSS comes after it.
import './ui/ui.css';
import { FormValidationDemo } from './FormValidationDemo';

// The page around the demo: its global switches set `<html lang>` and the color scheme for everything on the page.
const switches = document.querySelector<HTMLFormElement>('#page-switches');

function apply(): void {
  if (switches === null) {
    return;
  }

  const data = new FormData(switches);

  document.documentElement.lang = String(data.get('language') ?? 'en-US');
  document.documentElement.dataset['scheme'] = String(data.get('scheme') ?? 'system');
}

switches?.addEventListener('change', apply);
apply();
customElements.define('form-validation-demo', FormValidationDemo);
