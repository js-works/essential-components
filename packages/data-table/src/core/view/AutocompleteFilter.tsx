import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { useContext, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { DataTableComponent as Spec } from '../../react/api';
import { useTexts } from '../texts';
import { flag } from '../utils';
import * as styles from './classes';
import { icons } from './icons';
import { LayerContext } from './layer';
import { ClearButton } from './widgets';

export { AutocompleteFilterInput, autocompleteIdsOf, LOAD_DELAY };

type Option = Spec.AutocompleteOption;

type AutocompleteFilterProps = Spec.FilterProps & Spec.AutocompleteColumnFilterSettings & {
  // The labels of the values chosen so far, by value (shared by all inputs of one filter, and read by its pill).
  labels: Map<string, string>;
};

// How long typing must pause before `load` is called, in milliseconds.
const LOAD_DELAY = 250;

// The chosen values: a string, or with `multiple` a list of them.
function autocompleteIdsOf(value: Spec.FilterValue | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : typeof value === 'string'
    ? [value]
    : [];
}

// A text input whose list of options is loaded while typing (Base UI's Combobox): `load(query, signal)` is called
// LOAD_DELAY ms after the last key, once the trimmed query has `minQueryLength` characters (1 by default; with 0 it is
// also called with '' when the list opens). A newer query aborts the older one (`signal`). Nothing is cached. The list
// shows the state: below the minimum `Texts.typeToSearch`, while loading `Texts.loading` (or the previous options,
// faded), `Texts.emptySearch` without options, `Texts.loadFailed` when `load` fails. A single filter shows the label of
// its value in the input. A multiple one shows its values before the input: as comma-separated text (`maxChips` 0, the
// default), or as at most `maxChips` chips and a `+N` chip for the rest. Backspace in its empty input removes the last
// value.
function AutocompleteFilterInput(props: AutocompleteFilterProps): ReactElement {
  const { value, onChange, labelledBy, load, multiple = false, minQueryLength = 1, maxChips = 0, labels } = props;
  const texts = useTexts();
  const layer = useContext(LayerContext);
  const selected: Option[] = autocompleteIdsOf(value).map((id) => ({ value: id, label: labels.get(id) ?? id }));
  const selectedLabel = multiple ? '' : selected[0]?.label ?? '';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedLabel);
  const [options, setOptions] = useState<readonly Option[]>([]);
  const [state, setState] = useState<'loading' | 'failed' | 'done'>('done');
  const loadRef = useRef(load);
  // The list is placed below the whole field, not below the input (which moves right with the values before it).
  const fieldRef = useRef<HTMLDivElement>(null);
  const typed = query.trim();
  const short = typed.length < minQueryLength;
  const shown = short ? [] : options;

  loadRef.current = load;

  // A single value may change from outside (Reset, Clear): the input follows.
  useEffect(() => {
    if (!multiple) {
      setQuery(selectedLabel);
    }
  }, [multiple, selectedLabel]);

  useEffect(() => {
    if (!open || short) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadRef.current(typed, controller.signal).then(
        (loaded) => {
          if (!controller.signal.aborted) {
            setOptions(loaded);
            setState('done');
          }
        },
        () => {
          if (!controller.signal.aborted) {
            setState('failed');
          }
        },
      );
    }, LOAD_DELAY);

    setState('loading');

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, short, typed]);

  const status = short
    ? texts.typeToSearch
    : state === 'failed'
    ? texts.loadFailed
    : state === 'loading'
    ? (shown.length === 0 ? texts.loading : undefined)
    : shown.length === 0
    ? texts.emptySearch
    : undefined;

  const remember = (chosen: readonly Option[]) => chosen.forEach((option) => labels.set(option.value, option.label));

  const clear = () => {
    setQuery('');
    onChange(undefined);
  };

  const chips = maxChips > 0 ? selected.slice(0, maxChips) : [];
  const hidden = selected.length - chips.length;

  const input = (
    <BaseCombobox.Input
      className={multiple ? styles.chipsInput : styles.input}
      aria-labelledby={labelledBy}
      placeholder={selected.length === 0 ? texts.filterAll : undefined}
      onKeyDown={(event) => {
        // Base UI removes the last chip shown, which is not the last value while some are hidden (`+N`, or the text).
        if (multiple && event.key === 'Backspace' && query === '' && selected.length > 0) {
          event.preventBaseUIHandler();
          onChange(selected.length === 1 ? undefined : selected.slice(0, -1).map((option) => option.value));
        }
      }}
    />
  );

  return (
    <BaseCombobox.Root<Option, boolean>
      multiple={multiple}
      items={shown}
      filter={null}
      open={open}
      onOpenChange={setOpen}
      inputValue={query}
      onInputValueChange={setQuery}
      value={multiple ? selected : selected[0] ?? null}
      isItemEqualToValue={(a, b) => a.value === b.value}
      itemToStringLabel={(option) => option.label}
      onValueChange={(next) => {
        if (Array.isArray(next)) {
          remember(next);
          onChange(next.length === 0 ? undefined : next.map((option) => option.value));
        } else if (next === null) {
          onChange(undefined);
        } else {
          remember([next]);
          setQuery(next.label);
          onChange(next.value);
        }
      }}
    >
      <div ref={fieldRef} className={`${styles.field} ${styles.listField}`}>
        {multiple
          ? (
            <BaseCombobox.Chips
              className={`${styles.input} ${styles.chipsField}`}
              data-text={flag(maxChips === 0)}
            >
              {maxChips === 0 && selected.length > 0 && (
                <span className={styles.chipsText}>{selected.map((option) => option.label).join(', ')}</span>
              )}
              {chips.map((option) => (
                <BaseCombobox.Chip key={option.value} className={styles.chip}>
                  <span className={styles.chipText}>{option.label}</span>
                  <BaseCombobox.ChipRemove
                    className={styles.chipRemove}
                    aria-label={texts.removeValue({ label: option.label })}
                  >
                    <icons.Close size={12} />
                  </BaseCombobox.ChipRemove>
                </BaseCombobox.Chip>
              ))}
              {/* Not a chip of Base UI: it is not focusable, and a click on it opens the list (with every value). */}
              {maxChips > 0 && hidden > 0 && (
                <span
                  className={`${styles.chip} ${styles.chipMore}`}
                  onClick={() => setOpen(true)}
                >
                  +{hidden}
                </span>
              )}
              {input}
            </BaseCombobox.Chips>
          )
          : input}
        {(selected.length > 0 || query !== '') && <ClearButton label={texts.clearFilter} onClick={clear} />}
        {
          /* Opens and closes the list with the mouse (a click on the input does not close it). Not reachable with Tab
            and hidden from assistive technology: the keyboard has the arrow keys and Escape. */
        }
        <BaseCombobox.Trigger className={`${styles.clearButton} ${styles.fieldToggle}`} tabIndex={-1} aria-hidden>
          <icons.ChevronDown size={14} />
        </BaseCombobox.Trigger>
      </div>
      <BaseCombobox.Portal container={layer}>
        <BaseCombobox.Positioner
          anchor={fieldRef}
          className={styles.popupPositioner}
          align="start"
          sideOffset={4}
          positionMethod="fixed"
        >
          <BaseCombobox.Popup
            className={`${styles.popup} ${styles.autocompletePopup}`}
            data-loading={flag(state === 'loading' && shown.length > 0)}
          >
            <BaseCombobox.Status className={styles.autocompleteStatus}>{status}</BaseCombobox.Status>
            <BaseCombobox.List className={styles.autocompleteList}>
              {(option: Option) => (
                <BaseCombobox.Item key={option.value} value={option} className={styles.selectItem}>
                  {multiple
                    ? (
                      <input
                        type="checkbox"
                        className={styles.check}
                        checked={selected.some((item) => item.value === option.value)}
                        readOnly
                        tabIndex={-1}
                        aria-hidden
                      />
                    )
                    : (
                      <span className={styles.selectCheck}>
                        <BaseCombobox.ItemIndicator>
                          <icons.Check size={14} />
                        </BaseCombobox.ItemIndicator>
                      </span>
                    )}
                  <span className={styles.selectText}>
                    {option.content === undefined ? option.label : option.content()}
                  </span>
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
