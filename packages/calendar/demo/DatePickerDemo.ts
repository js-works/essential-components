import { DatePickerElement } from '../src/index.js';
import type { DatePickerSelectionMode } from '../src/index.js';
import { setupUi } from './ui/ui.js';
import './demo.css';

export { DatePickerDemo };

// The demo of the date picker, as a light DOM custom element without attributes (like the demos of the other
// packages): the picker on the left, its switches on the right, and below the picker the `value` it reports. Taken
// over from picoui's "Date Picker" tab, with the design language's selects instead of picoui's own controls.

const SELECTION_MODES: readonly DatePickerSelectionMode[] = [
  'date',
  'dates',
  'dateTime',
  'dateRange',
  'dateTimeRange',
  'time',
  'timeRange',
  'week',
  'weeks',
  'weekRange',
  'month',
  'months',
  'monthRange',
  'quarter',
  'quarters',
  'quarterRange',
  'year',
  'years',
  'yearRange',
];

// The modes that show days, so the day-related switches only make sense for them.
const DAY_BASED_MODES: readonly DatePickerSelectionMode[] = [
  'date',
  'dates',
  'dateTime',
  'dateRange',
  'dateTimeRange',
  'week',
  'weeks',
  'weekRange',
];

const LOCALES = ['en-US', 'en-GB', 'en-GB-u-hc-h12', 'es-ES', 'fr-FR', 'de-DE', 'de-AT', 'de-CH', 'it-IT', 'ar-SA'];

const CALENDAR_SIZES = [
  ['default', 'default: show adjacent days/years/decades'],
  ['minimal', 'minimal: hide adjacent days/years/decades'],
  ['maximal', 'maximal: always show 42 days in month view'],
] as const;

// Divisors of 60, 60 itself, and one invalid value to show the fallback (the minute column offers 00 alone).
const MINUTE_STEPS = [
  ['1', '1: every minute'],
  ['5', '5'],
  ['10', '10'],
  ['15', '15: quarter hours'],
  ['30', '30'],
  ['60', '60: on the hour'],
  ['120', '120: invalid, falls back to 00'],
] as const;

// The on/off switches, the attribute each one sets, and whether it only applies to day-based modes.
const TOGGLES = [
  ['accentuate-header', 'Accentuate header', false, true],
  ['highlight-current', 'Highlight current', true, true],
  ['highlight-weekends', 'Highlight weekends', true, true],
  ['disable-weekends', 'Disable weekends', true, false],
  ['show-week-numbers', 'Show week numbers', true, true],
  ['enable-century-view', 'Enable century view', false, false],
] as const;

const PICKER_TAG = 'date-picker';

// The component under test, registered once (the demo may be on a page twice).
function definePicker(): void {
  if (customElements.get(PICKER_TAG) === undefined) {
    customElements.define(PICKER_TAG, class extends DatePickerElement {});
  }
}

const options = (entries: readonly (readonly [string, string])[], selected: string) =>
  entries
    .map(([value, label]) => `<option value="${value}"${value === selected ? ' selected' : ''}>${label}</option>`)
    .join('');

const field = (label: string, name: string, content: string) =>
  `<label class="ui-field ui-field--stacked">${label}
    <select class="ui-select" name="${name}">${content}</select>
  </label>`;

// A calendar icon (Tabler's `calendar`).
const CALENDAR_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
  <path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /></svg>`;

// An X icon (Tabler's `x`), for the clear button.
const CLEAR_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`;

// A date for a bound: a read-only text field (the date, yyyy-mm-dd, or empty) with, at its end, a clear button (only
// while there is a date) and a calendar button that opens our date picker above it (see setupDateField). Just enough
// for the demo.
const dateField = (label: string, name: string) =>
  `<div class="ui-field ui-field--stacked" data-date-field>
    <label for="">${label}</label>
    <span class="date-picker-demo__date-input">
      <input class="date-picker-demo__date" name="${name}" readonly>
      <button class="date-picker-demo__date-clear" type="button" aria-label="Clear ${label.toLowerCase()}" hidden>
        ${CLEAR_ICON}
      </button>
      <button class="date-picker-demo__date-button" type="button" aria-label="Choose ${label.toLowerCase()}">
        ${CALENDAR_ICON}
      </button>
    </span>
    <div class="date-picker-demo__popup" popover="auto">
      <${PICKER_TAG} selection-mode="date" calendar-size="default"></${PICKER_TAG}>
    </div>
  </div>`;

// An on/off switch: a checkbox (in the form data as "on" only while checked).
const checkbox = (label: string, name: string, checked: boolean, hook = '') =>
  `<label class="ui-field"${hook}>
    <input class="ui-checkbox" type="checkbox" name="${name}"${checked ? ' checked' : ''}> ${label}
  </label>`;

let idCounter = 0;

// How far the focus ring of a date field reaches out of it: outline width plus offset (demo.css).
const FOCUS_RING_OUTSET = 4;

// Wires a date field: the button, a click on the field or its focus opens the popup with the picker, placed above the field (the popover is in the top
// layer, so it is placed by hand); a click on a day takes it and closes the popup. The popover closes itself on a
// click outside and on Escape.
function setupDateField(element: HTMLElement, onChange: () => void): void {
  const label = element.querySelector('label');
  const input = element.querySelector('input');
  const button = element.querySelector<HTMLButtonElement>('.date-picker-demo__date-button');
  const clear = element.querySelector<HTMLButtonElement>('.date-picker-demo__date-clear');
  const popup = element.querySelector<HTMLElement>('[popover]');
  const picker = popup?.querySelector<DatePickerElement>(PICKER_TAG);

  if (!label || !input || !button || !clear || !popup || !picker) {
    return;
  }

  input.id = `date-picker-demo-${++idCounter}`;
  label.htmlFor = input.id;

  const open = () => {
    if (popup.matches(':popover-open')) {
      return;
    }

    popup.showPopover();

    // The popup is flush with the outer edge of the field's focus ring on the left (the ring is 2px wide, 2px outside
    // the field: see .date-picker-demo__date in demo.css), so the two line up while the field has the focus.
    const field = input.getBoundingClientRect();

    popup.style.left = `${field.left - FOCUS_RING_OUTSET}px`;
    popup.style.top = `${field.top - popup.offsetHeight - 8}px`;
  };

  // The whole field opens it: the button, a click on the text field, and the focus arriving there (e.g. by Tab).
  button.addEventListener('click', open);
  input.addEventListener('click', open);
  input.addEventListener('focus', open);

  // Takes a date (or none) into the field, the picker in the popup and the demo.
  const set = (value: string) => {
    input.value = value;
    picker.value = value;
    clear.hidden = value === '';
    onChange();
  };

  picker.addEventListener('change', (event) => {
    event.stopPropagation();
    popup.hidePopover();
    set(picker.value);
  });

  clear.addEventListener('click', () => set(''));
}

class DatePickerDemo extends HTMLElement {
  #rendered = false;
  #cleanupUi: (() => void) | undefined;

  connectedCallback(): void {
    if (!this.#rendered) {
      this.#rendered = true;
      this.#render();
    }

    this.#cleanupUi = setupUi(this);
  }

  disconnectedCallback(): void {
    this.#cleanupUi?.();
    this.#cleanupUi = undefined;
  }

  #render(): void {
    definePicker();

    this.innerHTML = `
      <div class="date-picker-demo">
        <div class="ui-stack ui-stack--tight date-picker-demo__main">
          <${PICKER_TAG} class="date-picker-demo__picker" lang="en-US" dir="ltr" calendar-size="default"
            accentuate-header highlight-current highlight-weekends show-week-numbers minute-step="15"></${PICKER_TAG}>
          <p class="ui-note"><code>value</code>: <strong data-value>(nothing selected)</strong></p>
        </div>
        <form class="ui-stack ui-stack--tight date-picker-demo__controls" data-switches>
          ${field('Locale', 'locale', options(LOCALES.map((locale) => [locale, locale]), 'en-US'))}
          ${field('Selection mode', 'selection-mode', options(SELECTION_MODES.map((mode) => [mode, mode]), 'date'))}
          ${field('Calendar size', 'calendar-size', options(CALENDAR_SIZES, 'default'))}
          ${field('Minute step', 'minute-step', options(MINUTE_STEPS, '15'))}
          <div class="ui-stack ui-stack--tight">
            ${
        TOGGLES.map(([name, label, dayBased, on]) => checkbox(label, name, on, dayBased ? ' data-day-based' : ''))
          .join('')
      }
          </div>
          <div class="date-picker-demo__range">
            ${dateField('Min. date', 'min-date')}
            ${dateField('Max. date', 'max-date')}
          </div>
        </form>
      </div>
    `;

    const picker = this.querySelector<DatePickerElement>(PICKER_TAG);
    const switches = this.querySelector<HTMLFormElement>('[data-switches]');
    const value = this.querySelector('[data-value]');

    if (picker === null || switches === null || value === null) {
      return;
    }

    const apply = () => {
      const data = new FormData(switches);
      const get = (name: string) => String(data.get(name) ?? '');
      const locale = get('locale');
      const mode = get('selection-mode') as DatePickerSelectionMode;

      picker.lang = locale;
      picker.dir = locale === 'ar-SA' ? 'rtl' : 'ltr';
      picker.setAttribute('selection-mode', mode);
      picker.setAttribute('calendar-size', get('calendar-size'));
      picker.setAttribute('minute-step', get('minute-step'));

      for (const [name] of TOGGLES) {
        picker.toggleAttribute(name, get(name) === 'on');
      }

      for (const name of ['min-date', 'max-date']) {
        const date = get(name);

        if (date) {
          picker.setAttribute(name, date);
        } else {
          picker.removeAttribute(name);
        }
      }

      // The day-related switches only for the modes that show days.
      for (const element of switches.querySelectorAll<HTMLElement>('[data-day-based]')) {
        element.hidden = !DAY_BASED_MODES.includes(mode);
      }
    };

    for (const dateFieldElement of this.querySelectorAll<HTMLElement>('[data-date-field]')) {
      setupDateField(dateFieldElement, apply);
    }

    switches.addEventListener('change', apply);
    switches.addEventListener('input', apply);
    picker.addEventListener('change', () => {
      value.textContent = picker.value.replaceAll(',', ', ') || '(nothing selected)';
    });
    apply();
  }
}
