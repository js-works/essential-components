import { DatePicker as Picker } from './vanilla/date-picker.js';
import { GregorianCalendar } from './vanilla/calendars/gregorian/gregorian-calendar.js';
import { bridgeStyles } from './date-picker-element.styles.js';

export { DatePickerElement };
export type { DatePickerSelectionMode };

type DatePickerSelectionMode = Picker.SelectionMode;

// A first vanilla version of the calendar date/time picker (taken over from picoui, where a Lit element wrapped the
// same core). The core in ./vanilla/ is unchanged: it renders and patches its own DOM through its small virtual DOM.
// This class only owns the custom element: attributes and properties become the core's props, the core renders into
// a container in the shadow root, and its `change` becomes a DOM `change` event.
//
// The class is exported and not registered: the page registers it under a tag name of its choice.
//
// Known gaps (from picoui, still open): not form-associated; the core's `setValue` is best-effort.

// Boolean attributes, and the property each one feeds.
const BOOLEAN_ATTRIBUTES = {
  'accentuate-header': 'accentuateHeader',
  'show-week-numbers': 'showWeekNumbers',
  'highlight-current': 'highlightCurrent',
  'highlight-weekends': 'highlightWeekends',
  'disable-weekends': 'disableWeekends',
  'enable-century-view': 'enableCenturyView',
} as const;

// One stylesheet for all elements: the core's CSS plus the bridge that sets its `--cal-*` tokens.
let sharedSheet: CSSStyleSheet | undefined;

function styleSheet(): CSSStyleSheet {
  if (!sharedSheet) {
    sharedSheet = new CSSStyleSheet();
    sharedSheet.replaceSync(`${Picker.styles}\n${bridgeStyles}`);
  }

  return sharedSheet;
}

// Parses a date attribute (yyyy-mm-dd) into a local Date; anything else means "no bound".
function parseDate(value: string | null): Date | null {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year = 0, month = 1, day = 1] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

// The language and direction in effect: the element's own, else the nearest ancestor's, else the document's.
function closestLang(element: Element): string {
  return element.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || navigator.language;
}

function closestDir(element: Element): string {
  return element.closest('[dir]')?.getAttribute('dir') || document.documentElement.dir || 'ltr';
}

class DatePickerElement extends HTMLElement {
  static observedAttributes = [
    'value',
    'selection-mode',
    'calendar-size',
    'minute-step',
    'min-date',
    'max-date',
    ...Object.keys(BOOLEAN_ATTRIBUTES),
  ];

  readonly #picker: Picker;
  readonly #container: HTMLDivElement;
  #localeObserver: MutationObserver | undefined;
  // What the core last reported, so a `value` set from outside can be told apart from the echo of the core's own
  // change.
  #lastValue = '';
  #updateQueued = false;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [styleSheet()];
    this.#container = document.createElement('div');
    this.#container.className = 'base';
    shadow.append(this.#container);

    this.#picker = new Picker({
      calendar: new GregorianCalendar(() => closestLang(this)),
      getLocale: () => closestLang(this),
      getDirection: () => closestDir(this),
      getProps: () => this.#props(),
      requestUpdate: () => this.#requestUpdate(),
      onChange: () => {
        this.#lastValue = this.#picker.getValue();
        this.setAttribute('value', this.#lastValue);
        this.dispatchEvent(new Event('change', { bubbles: true }));
      },
    });
  }

  get value(): string {
    return this.getAttribute('value') ?? '';
  }

  set value(value: string) {
    this.setAttribute('value', value);
  }

  get selectionMode(): DatePickerSelectionMode {
    return (this.getAttribute('selection-mode') as DatePickerSelectionMode | null) ?? 'date';
  }

  set selectionMode(value: DatePickerSelectionMode) {
    this.setAttribute('selection-mode', value);
  }

  get minDate(): Date | null {
    return parseDate(this.getAttribute('min-date'));
  }

  get maxDate(): Date | null {
    return parseDate(this.getAttribute('max-date'));
  }

  /** Returns the view to the month containing today. */
  resetView(): void {
    this.#picker.resetView();
  }

  connectedCallback(): void {
    // `lang` and `dir` are not observed attributes of ours: watch the element and the document root, where a
    // page-wide language switch lands.
    this.#localeObserver = new MutationObserver(() => this.#requestUpdate());
    this.#localeObserver.observe(this, { attributes: true, attributeFilter: ['lang', 'dir'] });
    this.#localeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
    this.#update();
  }

  disconnectedCallback(): void {
    this.#localeObserver?.disconnect();
    this.#localeObserver = undefined;
    this.#picker.destroy();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'value' && this.value === this.#lastValue) {
      return;
    }

    this.#requestUpdate();
  }

  // The props the core reads on every render.
  #props(): Picker.Props {
    const flag = (name: keyof typeof BOOLEAN_ATTRIBUTES) => this.hasAttribute(name);
    const minuteStep = Number(this.getAttribute('minute-step') ?? '1');
    const size = this.getAttribute('calendar-size');

    return {
      selectionMode: this.selectionMode,
      accentuateHeader: flag('accentuate-header'),
      showWeekNumbers: flag('show-week-numbers'),
      calendarSize: size === 'default' || size === 'maximal' ? size : 'minimal',
      highlightCurrent: flag('highlight-current'),
      highlightWeekends: flag('highlight-weekends'),
      disableWeekends: flag('disable-weekends'),
      enableCenturyView: flag('enable-century-view'),
      minuteStep: Number.isFinite(minuteStep) ? minuteStep : 1,
      minDate: this.minDate,
      maxDate: this.maxDate,
    };
  }

  // Several changes in one task render once.
  #requestUpdate(): void {
    if (this.#updateQueued) {
      return;
    }

    this.#updateQueued = true;
    queueMicrotask(() => {
      this.#updateQueued = false;
      this.#update();
    });
  }

  #update(): void {
    if (!this.isConnected) {
      return;
    }

    if (this.value !== this.#lastValue) {
      this.#lastValue = this.value;
      this.#picker.setValue(this.value);
    }

    this.#picker.render(this.#container);
  }
}
