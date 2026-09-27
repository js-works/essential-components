// vanillajs-datepicker (https://github.com/mymth/vanillajs-datepicker), MIT License, Copyright (c) 2019 Hidenao
// Miyamoto. Bundled into our build; its license is in the builds' third-party license files.
import type { Datepicker } from 'vanillajs-datepicker';
import type { DatepickerOptions } from 'vanillajs-datepicker/Datepicker';

export { createRangePicker };
export type { CalendarLabels, PickedRange, RangeSelection };

// A date range with two inline calendars of vanillajs-datepicker (bundled into our build, MIT), side by side, that act
// as one calendar of two months: the first click (in either calendar) sets the start, the second one the end. The
// range is highlighted in both.
//
// The start and the end are ours, not the pickers': the library's own DateRangePicker only works with two `<input>`s
// (dropdowns), and it has one date per picker. Each picker gets the small range object the library reads for the
// highlighting (`rangepicker.dates`, and `rangeSideIndex` for the end of the range), which returns our range. These
// are internals of the library, used by the pinned version we bundle. The pickers themselves hold no dates.

type PickedRange = {
  from: string;
  to: string;
};

// What is picked so far: nothing, the start, or the start and the end (ISO dates).
type RangeSelection = {
  from: string | undefined;
  to: string | undefined;
};

// The accessible names of the previous and next buttons (a month, a year or a decade back or ahead, depending on the
// view).
type CalendarLabels = {
  previous: string;
  next: string;
};

type DatepickerClass = typeof Datepicker;

// The library is loaded on first use: it touches `document` when it is imported, and importing this package must work
// without a DOM (e.g. on a server).
let library: Promise<DatepickerClass> | undefined;

function loadDatepicker(): Promise<DatepickerClass> {
  library ??= import('vanillajs-datepicker').then((module) => module.Datepicker);

  return library;
}

const ISO = 'yyyy-mm-dd';

// The texts of the calendars for a locale, from `Intl` (no locale files needed): registered once per locale.
function languageOf(Datepicker: DatepickerClass, locale: string): string {
  const locales = Datepicker.locales as Record<string, unknown>;
  const key = `datnav-${locale}`;

  if (locales[key] === undefined) {
    const names = (options: Intl.DateTimeFormatOptions, count: number, dateOf: (index: number) => Date) => {
      const format = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });

      return Array.from({ length: count }, (_, index) => format.format(dateOf(index)));
    };
    // 2023-01-01 was a Sunday: the library counts the days of the week from Sunday.
    const day = (index: number) => new Date(Date.UTC(2023, 0, 1 + index));
    const month = (index: number) => new Date(Date.UTC(2023, index, 1));
    const daysShort = names({ weekday: 'short' }, 7, day);

    locales[key] = {
      days: names({ weekday: 'long' }, 7, day),
      daysShort,
      daysMin: daysShort.map((name) => name.replace(/\.$/, '').slice(0, 2)),
      months: names({ month: 'long' }, 12, month),
      monthsShort: names({ month: 'short' }, 12, month),
      today: '',
      clear: '',
      titleFormat: 'MM y',
    };
  }

  return key;
}

// The first day of the week of a locale (0 = Sunday), where the browser knows it.
function weekStartOf(locale: string): number {
  try {
    // `getWeekInfo()` in newer browsers, the `weekInfo` property in older ones (not in every browser's types yet).
    const intlLocale = new Intl.Locale(locale);
    const getWeekInfo: unknown = Reflect.get(intlLocale, 'getWeekInfo');
    const info: unknown = typeof getWeekInfo === 'function'
      ? getWeekInfo.call(intlLocale)
      : Reflect.get(intlLocale, 'weekInfo');
    const firstDay: unknown = typeof info === 'object' && info !== null ? Reflect.get(info, 'firstDay') : undefined;

    if (typeof firstDay === 'number') {
      return firstDay % 7;
    }
  } catch {
    // An invalid locale: the default below.
  }

  return locale.startsWith('en-US') ? 0 : 1;
}

// The first day of the month of a date, and of the month after it.
function monthOf(date: Date, offset = 0): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

// Unique ids for the month titles, which name the calendars.
let nextId = 1;

// Creates the two calendars in the given containers and returns their cleanup. `onSelect` gets what is picked after
// every pick, `onPick` the range when its end is picked.
function createRangePicker(
  containers: readonly [HTMLElement, HTMLElement],
  locale: string,
  labels: CalendarLabels,
  initial: PickedRange | undefined,
  onSelect: (selection: RangeSelection) => void,
  onPick: (range: PickedRange) => void,
): () => void {
  let destroyed = false;
  let cleanup = () => {};

  void loadDatepicker().then((Datepicker) => {
    if (destroyed) {
      return;
    }

    const parse = (iso: string | undefined) => (iso === undefined ? undefined : Datepicker.parseDate(iso, ISO));
    // Time values of local midnights, like the library's dates. Only a start: the end is not picked yet.
    let start = parse(initial?.from);
    let end = parse(initial?.to);
    // While only the start is picked: the day under the mouse or the keyboard position, shown as the end of the range.
    let preview: number | undefined;

    // Without a range: this month and the next one; with one: the month of its start and the next one.
    const firstMonth = monthOf(start === undefined ? new Date() : new Date(start));
    const options: DatepickerOptions = {
      format: ISO,
      language: languageOf(Datepicker, locale),
      weekStart: weekStartOf(locale),
      maxView: 2,
      todayHighlight: true,
      prevArrow: '‹',
      nextArrow: '›',
    };
    const left = new Datepicker(containers[0], { ...options, defaultViewDate: firstMonth });
    const right = new Datepicker(containers[1], { ...options, defaultViewDate: monthOf(firstMonth, 1) });
    const pickers = [left, right] as const;
    const range = {
      get dates(): readonly (number | undefined)[] {
        if (start !== undefined && end === undefined && preview !== undefined) {
          return preview < start ? [preview, start] : [start, preview];
        }

        return [start, end];
      },
    };

    pickers.forEach((picker, index) => {
      Reflect.set(picker, 'rangepicker', range);
      Reflect.set(picker, 'rangeSideIndex', index);
    });

    // Named for assistive technology: each calendar by its month title, the buttons by our texts. The elements stay
    // while the picker lives (their contents change), so this is done once.
    containers.forEach((container) => {
      const title = container.querySelector('.view-switch');

      if (title !== null) {
        title.id = `datnav-calendar-${nextId++}`;
        container.setAttribute('role', 'group');
        container.setAttribute('aria-labelledby', title.id);
      }

      container.querySelector('.prev-button')?.setAttribute('aria-label', labels.previous);
      container.querySelector('.next-button')?.setAttribute('aria-label', labels.next);
    });

    // The left calendar always shows the month before the right one: when one of them moves (its button, the keyboard,
    // or a month or year chosen in its title view), the other one follows. The inner buttons are hidden (CSS).
    let aligning = false;

    const align = (moved: 0 | 1) => {
      const focused: unknown = pickers[moved].getFocusedDate();

      if (aligning || !(focused instanceof Date)) {
        return;
      }

      aligning = true;
      pickers[moved === 0 ? 1 : 0].setFocusedDate(monthOf(focused, moved === 0 ? 1 : -1));
      aligning = false;
    };

    // Shows our range in both calendars, where they are. A click leaves the clicked date in its picker (the library
    // selects it): it is cleared, the range is shown by the highlighting.
    const render = () => {
      aligning = true;
      pickers.forEach((picker) => {
        picker.setDate({ clear: true, viewDate: picker.getFocusedDate(), forceRefresh: true });
      });
      aligning = false;
    };

    // The first pick (or the first one after a complete range) is the start; the second one the end, which completes
    // the range (swapped when it is before the start; the same day twice is a range of one day).
    const pick = (date: number) => {
      preview = undefined;

      if (start === undefined || end !== undefined) {
        start = date;
        end = undefined;
      } else {
        [start, end] = date < start ? [date, start] : [start, date];
      }

      render();

      const iso = (date: number | undefined) => (date === undefined ? undefined : Datepicker.formatDate(date, ISO));
      const from = iso(start);
      const to = iso(end);

      onSelect({ from, to });

      if (from !== undefined && to !== undefined) {
        onPick({ from, to });
      }
    };

    // The date of the day an event happened on, if any.
    const dayOf = (event: Event): number | undefined => {
      const cell = event.target instanceof Element ? event.target.closest('.datepicker-cell.day') : null;

      return cell instanceof HTMLElement && !cell.classList.contains('disabled')
        ? Number(cell.dataset['date'])
        : undefined;
    };

    // A click on a day of either calendar.
    const onClick = (event: MouseEvent) => {
      const date = dayOf(event);

      if (date !== undefined) {
        pick(date);
      }
    };

    // While only the start is picked, the range follows the mouse (or the keyboard position) up to the day it would end
    // on, like it will look after the second click.
    const showPreview = (date: number | undefined) => {
      const next = start !== undefined && end === undefined ? date : undefined;

      if (next !== preview) {
        preview = next;
        render();
      }
    };

    const onMouseOver = (event: MouseEvent) => showPreview(dayOf(event));
    const onMouseLeave = () => showPreview(undefined);

    // Enter on the keyboard position of a calendar (moved with the arrow keys, while one of its buttons has the
    // focus): the same as a click on that day. Only in the days view; in the others, the library opens the chosen month
    // or year (and cancels the event). The button's own action is prevented.
    const onKeydown = (picker: Datepicker, container: HTMLElement) => (event: KeyboardEvent) => {
      const date: unknown = picker.getFocusedDate();

      if (!event.defaultPrevented && container.querySelector('.days') !== null && date instanceof Date) {
        if (event.key === 'Enter') {
          event.preventDefault();
          pick(date.getTime());
        } else if (event.key.startsWith('Arrow')) {
          // The library has moved the keyboard position already (its listener comes first).
          showPreview(date.getTime());
        }
      }
    };

    const listeners = pickers.map((picker, index) => {
      const container = containers[index === 0 ? 0 : 1];

      return {
        container,
        keydown: onKeydown(picker, container),
        moved: () => align(index === 0 ? 0 : 1),
      };
    });

    for (const { container, keydown, moved } of listeners) {
      container.addEventListener('click', onClick);
      container.addEventListener('mouseover', onMouseOver);
      container.addEventListener('mouseleave', onMouseLeave);
      container.addEventListener('keydown', keydown);
      container.addEventListener('changeMonth', moved);
      container.addEventListener('changeYear', moved);
    }

    render();

    cleanup = () => {
      for (const { container, keydown, moved } of listeners) {
        container.removeEventListener('click', onClick);
        container.removeEventListener('mouseover', onMouseOver);
        container.removeEventListener('mouseleave', onMouseLeave);
        container.removeEventListener('keydown', keydown);
        container.removeEventListener('changeMonth', moved);
        container.removeEventListener('changeYear', moved);
        container.removeAttribute('role');
        container.removeAttribute('aria-labelledby');
      }

      left.destroy();
      right.destroy();
    };
  });

  return () => {
    destroyed = true;
    cleanup();
  };
}
