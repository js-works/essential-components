import { Popover as BasePopover } from '@base-ui/react/popover';
import { useContext, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import { useLocale, useTexts } from '../texts';
import { flag } from '../utils';
import * as styles from './DataNavigator.module.css';
import { createDatePicker, createRangePicker } from './dateRangePicker';
import type { RangeSelection } from './dateRangePicker';
import { icons } from './icons';
import { LayerContext } from './layer';
import { ClearButton } from './widgets';

export { DateInput, DateRangeFilterInput, formatRange, rangeOf };

// The date range filter: a trigger in the look of the select filters ("All", or the range, formatted for the locale),
// and a popover with two calendars that act as one of two months (see dateRangePicker.ts): the first click sets the
// start, the second one the end, which applies the range and closes the popover. The value is `{ from, to }`
// (yyyy-mm-dd, both inclusive); cleared, the filter is gone.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The filter value as a range, or undefined for anything else (so a broken value just shows "All").
function rangeOf(value: Spec.FilterValue | undefined): Spec.DateRangeFilterValue | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const { from, to } = value as { readonly [key: string]: Spec.FilterValue };

  return typeof from === 'string' && typeof to === 'string' && ISO_DATE.test(from) && ISO_DATE.test(to)
    ? { from, to }
    : undefined;
}

function localDate(iso: string): Date {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);

  return new Date(year, month - 1, day);
}

// The format of the dates (medium, e.g. "Sep 1, 2026"). An invalid locale falls back to en-US.
function dateFormatOf(locale: string): Intl.DateTimeFormat {
  const format = (tag: string) => new Intl.DateTimeFormat(tag, { dateStyle: 'medium' });

  try {
    return format(locale);
  } catch {
    return format('en-US');
  }
}

// "Sep 1 – 20, 2026": `formatRange` leaves out what both ends share.
function formatRange({ from, to }: Spec.DateRangeFilterValue, locale: string): string {
  return dateFormatOf(locale).formatRange(localDate(from), localDate(to));
}

// What is picked in the popover: the range, or only its start while the end is still to come ("Sep 14, 2026 – …").
function formatSelection({ from, to }: RangeSelection, locale: string): string {
  if (from === undefined) {
    return '';
  }

  return to === undefined ? `${dateFormatOf(locale).format(localDate(from))} – …` : formatRange({ from, to }, locale);
}

type PickerProps = {
  range: Spec.DateRangeFilterValue | undefined;
  locale: string;
  onPick: (range: Spec.DateRangeFilterValue) => void;
  onClear: () => void;
};

// The two calendars, and below them what is picked so far and a clear button. They start with the current range, and
// are created again when the locale or the texts change.
function RangePicker({ range, locale, onPick, onClear }: PickerProps): ReactElement {
  const texts = useTexts();
  const { calendarPrevious, calendarNext } = texts;
  const [selection, setSelection] = useState<RangeSelection>({ from: range?.from, to: range?.to });
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const onPickRef = useRef(onPick);
  const initialRef = useRef(range);

  onPickRef.current = onPick;

  useEffect(() => {
    if (fromRef.current === null || toRef.current === null) {
      return;
    }

    return createRangePicker(
      [fromRef.current, toRef.current],
      locale,
      { previous: calendarPrevious, next: calendarNext },
      initialRef.current,
      setSelection,
      (picked) => onPickRef.current(picked),
    );
  }, [locale, calendarPrevious, calendarNext]);

  return (
    <>
      <div className={styles.dateRange}>
        <div ref={fromRef} />
        <div ref={toRef} />
      </div>
      <div className={styles.dateRangeFooter}>
        <span aria-live="polite">{formatSelection(selection, locale)}</span>
        {selection.from === undefined ? null : (
          <button type="button" className={styles.button} onClick={onClear}>
            {texts.clear}
          </button>
        )}
      </div>
    </>
  );
}

type DateInputProps = {
  // yyyy-mm-dd, or '' for none. Anything else is shown as it is.
  value: string;
  placeholder: string | undefined;
  labelledBy: string;
  onChange: (value: string) => void;
};

// One calendar for a single date (see createDatePicker): it starts with the date, and is created again when the locale
// or the texts change.
function SinglePicker(
  { value, locale, onPick }: { value: string; locale: string; onPick: (date: string) => void },
): ReactElement {
  const { calendarPrevious, calendarNext } = useTexts();
  const ref = useRef<HTMLDivElement>(null);
  const onPickRef = useRef(onPick);
  const initialRef = useRef(ISO_DATE.test(value) ? value : undefined);

  onPickRef.current = onPick;

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    return createDatePicker(
      ref.current,
      locale,
      { previous: calendarPrevious, next: calendarNext },
      initialRef.current,
      (date) => onPickRef.current(date),
    );
  }, [locale, calendarPrevious, calendarNext]);

  return (
    <div className={styles.dateRange} data-single>
      <div ref={ref} />
    </div>
  );
}

// A single date (the date editor of a row): a trigger in the look of the selects (the date in the medium format of
// the locale, e.g. "Apr 6, 1953", or the placeholder, dimmed), with a calendar icon at its end, or the clear button
// while a date is set. It opens a popover with one calendar; a pick sets the date and closes it.
function DateInput({ value, placeholder, labelledBy, onChange }: DateInputProps): ReactElement {
  const texts = useTexts();
  const locale = useLocale();
  const layer = useContext(LayerContext);
  const [open, setOpen] = useState(false);
  const shown = ISO_DATE.test(value) ? dateFormatOf(locale).format(localDate(value)) : value;

  return (
    <div className={styles.field}>
      <BasePopover.Root open={open} onOpenChange={setOpen} modal={false}>
        <BasePopover.Trigger
          className={`${styles.input} ${styles.select}`}
          data-empty={flag(value === '')}
          aria-labelledby={labelledBy}
        >
          <span className={styles.selectText}>{value === '' ? placeholder : shown}</span>
        </BasePopover.Trigger>
        <BasePopover.Portal container={layer}>
          <BasePopover.Positioner
            className={styles.popupPositioner}
            align="start"
            sideOffset={4}
            positionMethod="fixed"
          >
            <BasePopover.Popup className={`${styles.popup} ${styles.datePopup}`}>
              <SinglePicker
                value={value}
                locale={locale}
                onPick={(date) => {
                  onChange(date);
                  setOpen(false);
                }}
              />
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
      {value === ''
        ? (
          <span className={styles.fieldEnd}>
            <icons.Calendar size={14} />
          </span>
        )
        : <ClearButton label={texts.clear} onClick={() => onChange('')} />}
    </div>
  );
}

function DateRangeFilterInput({ value, onChange, labelledBy }: Spec.FilterProps): ReactElement {
  const texts = useTexts();
  const locale = useLocale();
  const layer = useContext(LayerContext);
  const [open, setOpen] = useState(false);
  const range = rangeOf(value);

  return (
    <div className={styles.field}>
      <BasePopover.Root open={open} onOpenChange={setOpen} modal={false}>
        <BasePopover.Trigger
          className={`${styles.input} ${styles.select}`}
          data-empty={flag(range === undefined)}
          aria-labelledby={labelledBy}
        >
          <span className={styles.selectText}>
            {range === undefined ? texts.filterAll : formatRange(range, locale)}
          </span>
        </BasePopover.Trigger>
        <BasePopover.Portal container={layer}>
          <BasePopover.Positioner
            className={styles.popupPositioner}
            align="start"
            sideOffset={4}
            positionMethod="fixed"
          >
            <BasePopover.Popup className={`${styles.popup} ${styles.datePopup}`}>
              <RangePicker
                range={range}
                locale={locale}
                onPick={(picked) => {
                  onChange(picked);
                  setOpen(false);
                }}
                onClear={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              />
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
      {range === undefined
        ? (
          <span className={styles.fieldEnd}>
            <icons.Calendar size={14} />
          </span>
        )
        : <ClearButton label={texts.clearFilter} onClick={() => onChange(undefined)} />}
    </div>
  );
}
