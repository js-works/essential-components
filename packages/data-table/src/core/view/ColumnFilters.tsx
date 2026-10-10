import { useEffect, useId, useState } from 'react';
import type { ReactElement } from 'react';
import type { DataTableComponent as Spec } from '../../react/api';
import { fallbackSummary, isRecord, optionsOf } from '../filters';
import type { FilterSummary, SummaryContext } from '../filters';
import { useTexts } from '../texts';
import { AutocompleteFilterInput, autocompleteIdsOf } from './AutocompleteFilter';
import * as styles from './classes';
import { DateRangeFilterInput, formatRange, rangeOf } from './DateRangeFilter';
import { FilterSelectField, FilterTextField, PrefixedTextField, Segmented } from './widgets';

export {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  summaryOf,
  textColumnFilter,
};

// The filters live in the filter popup. Every change there is only a draft (`onChange` of a filter changes the draft),
// which "Apply" applies, all filters at once. So no filter needs a draft of its own, and none waits for Enter.

type TextFilterProps = Spec.FilterProps & Spec.TextColumnFilterSettings;

type SelectFilterProps = Spec.FilterProps & Spec.SelectColumnFilterSettings;

type Summarize = (value: Spec.FilterValue, context: SummaryContext) => FilterSummary | undefined;

// The pill texts of the built-in filters, by their filter function. Any other filter (an app's own) gets the fallback.
const summaries = new WeakMap<Spec.ColumnFilter, Summarize>();

function withSummary(filter: Spec.ColumnFilter, summarize: Summarize): Spec.ColumnFilter {
  summaries.set(filter, summarize);

  return filter;
}

// What the pill of the filter shows for this value.
function summaryOf(filter: Spec.ColumnFilter, value: Spec.FilterValue, context: SummaryContext): FilterSummary {
  return summaries.get(filter)?.(value, context) ?? fallbackSummary(value);
}

const MATCHES: readonly Spec.TextFilterMatch[] = ['contains', 'startsWith', 'endsWith'];

function textValueOf(value: Spec.FilterValue | undefined): Spec.TextFilterValue | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { text, match } = value;

  return typeof text === 'string' && MATCHES.some((candidate) => candidate === match)
    ? { text, match: match as Spec.TextFilterMatch }
    : undefined;
}

function numberRangeOf(value: Spec.FilterValue | undefined): Spec.NumberRangeFilterValue | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const from = typeof value['from'] === 'number' ? value['from'] : undefined;
  const to = typeof value['to'] === 'number' ? value['to'] : undefined;

  return from === undefined && to === undefined
    ? undefined
    : { ...(from === undefined ? {} : { from }), ...(to === undefined ? {} : { to }) };
}

function numberFormatOf(locale: string): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale);
  } catch {
    return new Intl.NumberFormat('en-US');
  }
}

// A text input, with `matchModes` a select in front of it, how the text must match: contains (the default), starts
// with, ends with (it was a segmented control below the input at first). Without `matchModes` it always contains. The
// value is
// `{ text, match }` with the trimmed text; an empty text removes the filter. The text being typed is kept here, so a
// space at its end is not thrown away while typing (the value is trimmed).
function TextFilterInput(props: TextFilterProps): ReactElement {
  const { value, onChange, labelledBy, placeholder, matchModes = false } = props;
  const texts = useTexts();
  const current = textValueOf(value);
  const appliedText = current?.text ?? '';
  const [text, setText] = useState(appliedText);
  const [match, setMatch] = useState<Spec.TextFilterMatch>(current?.match ?? 'contains');

  // The value may change from outside (Reset): follow it, but keep what is being typed.
  useEffect(() => {
    setText((typed) => (typed.trim() === appliedText ? typed : appliedText));
  }, [appliedText]);

  useEffect(() => {
    if (current !== undefined) {
      setMatch(current.match);
    }
  }, [current?.match]);

  const emit = (nextText: string, nextMatch: Spec.TextFilterMatch) =>
    onChange(nextText.trim() === '' ? undefined : { text: nextText.trim(), match: nextMatch });

  const field = {
    value: text,
    placeholder: placeholder ?? texts.filterPlaceholder,
    labelledBy,
    clearLabel: texts.clearFilter,
    onChange: (next: string) => {
      setText(next);
      emit(next, match);
    },
    onClear: () => {
      setText('');
      emit('', match);
    },
  };

  if (!matchModes) {
    return <FilterTextField {...field} />;
  }

  return (
    <PrefixedTextField
      {...field}
      prefix={{
        value: match,
        label: texts.textMatch,
        options: [
          { value: 'contains', label: texts.textContains },
          { value: 'startsWith', label: texts.textStartsWith },
          { value: 'endsWith', label: texts.textEndsWith },
        ],
        onChange: (next) => {
          const nextMatch = MATCHES.find((candidate) => candidate === next) ?? 'contains';

          setMatch(nextMatch);
          emit(text, nextMatch);
        },
      }}
    />
  );
}

// A select changes the draft at once. The placeholder "All" is only shown while nothing is selected.
function SelectFilterInput(props: SelectFilterProps): ReactElement {
  const { value, onChange, labelledBy, options, multiple = false } = props;
  const texts = useTexts();
  const selected = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : typeof value === 'string'
    ? [value]
    : [];

  return (
    <FilterSelectField
      value={selected}
      placeholder={texts.filterAll}
      labelledBy={labelledBy}
      clearLabel={texts.clearFilter}
      multiple={multiple}
      options={optionsOf(options)}
      onChange={(next) => onChange(next.length === 0 ? undefined : multiple ? [...next] : next[0])}
    />
  );
}

// Two number inputs, `from – to`, both inclusive. An empty side is open; both empty remove the filter.
function NumberRangeFilterInput({ value, onChange, labelledBy }: Spec.FilterProps): ReactElement {
  const texts = useTexts();
  const id = useId();
  const range = numberRangeOf(value);
  const [from, setFrom] = useState(range?.from === undefined ? '' : String(range.from));
  const [to, setTo] = useState(range?.to === undefined ? '' : String(range.to));
  const empty = range === undefined;

  // Reset from outside: the inputs follow.
  useEffect(() => {
    if (empty) {
      setFrom('');
      setTo('');
    }
  }, [empty]);

  const parse = (text: string): number | undefined => {
    const number = Number(text);

    return text.trim() === '' || !Number.isFinite(number) ? undefined : number;
  };

  const emit = (nextFrom: string, nextTo: string) => {
    const [low, high] = [parse(nextFrom), parse(nextTo)];

    onChange(
      low === undefined && high === undefined
        ? undefined
        : { ...(low === undefined ? {} : { from: low }), ...(high === undefined ? {} : { to: high }) },
    );
  };

  const input = (side: 'from' | 'to') => {
    const text = side === 'from' ? from : to;

    return (
      <input
        id={`${id}-${side}`}
        type="number"
        className={styles.input}
        aria-label={side === 'from' ? texts.rangeFrom : texts.rangeTo}
        aria-labelledby={`${labelledBy} ${id}-${side}`}
        placeholder={side === 'from' ? texts.rangeFrom : texts.rangeTo}
        value={text}
        onChange={(event) => {
          const next = event.currentTarget.value;

          if (side === 'from') {
            setFrom(next);
            emit(next, to);
          } else {
            setTo(next);
            emit(from, next);
          }
        }}
      />
    );
  };

  return (
    <div className={styles.filterRange}>
      {input('from')}
      <span aria-hidden>–</span>
      {input('to')}
    </div>
  );
}

// All, Yes or No. All removes the filter; Yes and No are `true` and `false`.
function BooleanFilterInput({ value, onChange, labelledBy }: Spec.FilterProps): ReactElement {
  const texts = useTexts();

  return (
    <Segmented
      labelledBy={labelledBy}
      value={value === true ? 'yes' : value === false ? 'no' : 'all'}
      options={[
        { value: 'all', label: texts.filterAll },
        { value: 'yes', label: texts.filterYes },
        { value: 'no', label: texts.filterNo },
      ]}
      onChange={(next) => onChange(next === 'all' ? undefined : next === 'yes')}
    />
  );
}

// A long list of values is summarized in its pill: the first one and how many more (`Open +2`).
const LONG_SUMMARY = 16;

// The built-in column filters.
// A text filter: `{ text, match }`, `match` always `contains` without `settings.matchModes` (no select then). Its
// placeholder is `settings.placeholder`, or the localized `Texts.filterPlaceholder`.
function textColumnFilter(settings: Spec.TextColumnFilterSettings = {}): Spec.ColumnFilter {
  return withSummary(
    (props) => <TextFilterInput {...props} {...settings} />,
    (value) => {
      const current = textValueOf(value);

      return current === undefined ? undefined : {
        relation: ':',
        value: current.text,
        boxed: true,
        before: current.match !== 'startsWith',
        after: current.match !== 'endsWith',
      };
    },
  );
}

// A select: the value of the chosen option, or with `multiple` a list of them.
function selectColumnFilter(settings: Spec.SelectColumnFilterSettings): Spec.ColumnFilter {
  const options = optionsOf(settings.options);
  const labelOf = (item: Spec.FilterValue) => options.find((option) => option.value === item)?.label ?? String(item);

  return withSummary(
    (props) => <SelectFilterInput {...props} {...settings} />,
    (value) => listSummary((Array.isArray(value) ? value : [value]).map(labelOf)),
  );
}

// The labels of a list of values in a pill: all of them, or the first one and how many more.
function listSummary(labels: readonly string[]): FilterSummary {
  const joined = labels.join(', ');

  return labels.length > 1 && joined.length > LONG_SUMMARY
    ? { relation: ':', value: labels[0] ?? '', more: labels.length - 1 }
    : { relation: ':', value: joined };
}

// An autocomplete: its options come from `settings.load` while typing (see AutocompleteFilter.tsx). The value is the
// value of the chosen option, or with `multiple` a list of them. The labels of the chosen options are kept by the
// filter, for its pill (there are no initial filters, so every value was chosen in it).
function autocompleteColumnFilter(settings: Spec.AutocompleteColumnFilterSettings): Spec.ColumnFilter {
  const labels = new Map<string, string>();

  return withSummary(
    (props) => <AutocompleteFilterInput {...props} {...settings} labels={labels} />,
    (value) => {
      const ids = autocompleteIdsOf(value);

      return ids.length === 0 ? undefined : listSummary(ids.map((id) => labels.get(id) ?? id));
    },
  );
}

// A date range: two calendars (vanillajs-datepicker, see dateRangePicker.ts) in a popover. The value is `{ from, to }`
// (yyyy-mm-dd, both inclusive, see `DataTable.DateRangeFilterValue`). The placeholder is the localized
// `Texts.filterAll`.
function dateRangeColumnFilter(): Spec.ColumnFilter {
  return withSummary(
    (props) => <DateRangeFilterInput {...props} />,
    (value, { locale }) => {
      const range = rangeOf(value);

      return range === undefined ? undefined : { relation: ':', value: formatRange(range, locale) };
    },
  );
}

// A number range: `{ from?, to? }`, both inclusive, at least one of them.
function numberRangeColumnFilter(): Spec.ColumnFilter {
  return withSummary(
    (props) => <NumberRangeFilterInput {...props} />,
    (value, { locale }) => {
      const range = numberRangeOf(value);
      const format = (number: number) => numberFormatOf(locale).format(number);

      if (range === undefined) {
        return undefined;
      }

      const { from, to } = range;

      if (from !== undefined && to !== undefined) {
        return from === to
          ? { relation: '=', value: format(from) }
          : { relation: '', value: `${format(from)}–${format(to)}` };
      }

      return from === undefined
        ? { relation: '≤', value: format(to ?? 0) }
        : { relation: '≥', value: format(from) };
    },
  );
}

// Yes or no: `true` or `false`. "All" is no filter (and no pill).
function booleanColumnFilter(): Spec.ColumnFilter {
  return withSummary(
    (props) => <BooleanFilterInput {...props} />,
    (value, { texts }) =>
      typeof value === 'boolean' ? { relation: ':', value: value ? texts.filterYes : texts.filterNo } : undefined,
  );
}
