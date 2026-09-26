// The public API of `@local/calendar`, for the type checking of other packages. Written by hand, because it is small:
// other packages then check against this declaration, not against the sources (the core is not written for their
// stricter compiler options, e.g. `noUncheckedIndexedAccess`). Keep it in sync with src/index.ts and
// src/date-picker-element.ts.

export { DatePickerElement };
export type { DatePickerSelectionMode };

type DatePickerSelectionMode =
  | 'date'
  | 'dates'
  | 'dateTime'
  | 'dateRange'
  | 'time'
  | 'timeRange'
  | 'dateTimeRange'
  | 'week'
  | 'weeks'
  | 'weekRange'
  | 'month'
  | 'months'
  | 'monthRange'
  | 'quarter'
  | 'quarters'
  | 'quarterRange'
  | 'year'
  | 'years'
  | 'yearRange';

declare class DatePickerElement extends HTMLElement {
  static observedAttributes: string[];
  value: string;
  selectionMode: DatePickerSelectionMode;
  readonly minDate: Date | null;
  readonly maxDate: Date | null;
  /** Returns the view to the month containing today. */
  resetView(): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(name: string): void;
}
