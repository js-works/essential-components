import { Popover as BasePopover } from '@base-ui/react/popover';
import { createElement, useContext, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { DataNavigator as Spec } from '../../api';
import { useLocale, useTexts } from '../texts';
import { flag } from '../utils';
import * as styles from './DataNavigator.module.css';
import { icons } from './icons';
import { LayerContext } from './layer';
import { ClearButton } from './widgets';

export { DateRangeFilterInput, rangeOf };

// The date range filter: a trigger in the look of the select filters ("All", or the range, formatted for the locale),
// and a popover with the date picker of the calendar package in its range mode. The second click of a range applies
// it and closes the popover. The value is `{ from, to }` (yyyy-mm-dd, both inclusive); cleared, the filter is gone.

// The date picker is a custom element of `@local/calendar`. It is loaded on first use (a dynamic import, so importing
// the data navigator needs no DOM, e.g. on a server) and registered once, under the first free generated tag name.
let pickerTag: Promise<string> | undefined;

function loadPickerTag(): Promise<string> {
  pickerTag ??= import('@local/calendar').then(({ DatePickerElement }) => {
    let index = 1;

    while (customElements.get(`datnav-date-picker-${index}`) !== undefined) {
      index++;
    }

    const tag = `datnav-date-picker-${index}`;

    customElements.define(tag, class extends DatePickerElement {});

    return tag;
  });

  return pickerTag;
}

function usePickerTag(): string | undefined {
  const [tag, setTag] = useState<string>();

  useEffect(() => {
    let active = true;

    void loadPickerTag().then((loaded) => active && setTag(loaded));

    return () => {
      active = false;
    };
  }, []);

  return tag;
}

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

// "Sep 1 – 20, 2026": `formatRange` leaves out what both ends share. An invalid locale falls back to en-US.
function formatRange({ from, to }: Spec.DateRangeFilterValue, locale: string): string {
  const format = (tag: string) => new Intl.DateTimeFormat(tag, { dateStyle: 'medium' });

  let formatter: Intl.DateTimeFormat;

  try {
    formatter = format(locale);
  } catch {
    formatter = format('en-US');
  }

  return formatter.formatRange(localDate(from), localDate(to));
}

type PickerProps = {
  range: Spec.DateRangeFilterValue | undefined;
  locale: string;
  onPick: (range: Spec.DateRangeFilterValue) => void;
};

// The date picker in range mode. A range is complete when the picker reports two dates.
function RangePicker({ range, locale, onPick }: PickerProps): ReactElement | null {
  const tag = usePickerTag();
  const ref = useRef<HTMLElement & { value: string }>(null);
  const onPickRef = useRef(onPick);

  onPickRef.current = onPick;

  useEffect(() => {
    const picker = ref.current;

    if (picker === null) {
      return;
    }

    const listener = () => {
      const [from, to] = picker.value.split(',');

      if (from !== undefined && to !== undefined && ISO_DATE.test(from) && ISO_DATE.test(to)) {
        onPickRef.current({ from, to });
      }
    };

    picker.addEventListener('change', listener);

    return () => picker.removeEventListener('change', listener);
  }, [tag]);

  if (tag === undefined) {
    return null;
  }

  return createElement(tag, {
    ref,
    lang: locale,
    'selection-mode': 'dateRange',
    'calendar-size': 'default',
    value: range === undefined ? '' : `${range.from},${range.to}`,
  });
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
