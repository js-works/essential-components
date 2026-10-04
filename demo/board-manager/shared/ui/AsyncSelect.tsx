import { CheckIcon, Group, Loader, Select, Text } from '@mantine/core';
import type { ComboboxItem } from '@mantine/core';
import { forwardRef, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslate } from '../lib/i18n';

export { AsyncSelect };
export type { AsyncOption };

// An option: the value, the label (the input shows it once chosen) and an optional second line (dimmed, smaller).
type AsyncOption = { value: string; label: string; description?: string };

type AsyncSelectProps = {
  load: (query: string, signal: AbortSignal) => Promise<readonly AsyncOption[]>;
  // From 0 on, all options show when the list opens.
  minQueryLength?: number;
  placeholder?: string;
  // What form-validation's `field.x()` gives (uncontrolled: `defaultValue` in, `onChange(value)` out). No label is
  // known for a `defaultValue`, so it is only used without one for now.
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  onBlur?: () => void;
  label?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  name?: string;
  id?: string;
};

// How long typing must pause before `load` is called, in milliseconds (like the data navigator's autocomplete filter).
const LOAD_DELAY = 250;

// Mantine's `Select` (searchable, clearable), with its options loaded while typing, like the data navigator's
// autocomplete filter: `load(query, signal)` LOAD_DELAY ms after the last key while the list is open, once the trimmed
// query has `minQueryLength` characters; a newer query aborts the older one. No filtering here: `load` did it. While
// the input shows the chosen label (the list was opened again), `load('')` gives all options. Mantine's `Loader` in the
// field while loading; the list says "Type to search", "No results" or "Could not load" when it has no options. The
// popup is in the dialog with a fixed position, like the other popups of the forms (see `forms.tsx`).
const AsyncSelect = forwardRef<HTMLInputElement, AsyncSelectProps>(function AsyncSelect(props, ref) {
  const { load, minQueryLength = 1, defaultValue, onChange, ...input } = props;
  const t = useTranslate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const [options, setOptions] = useState<readonly AsyncOption[]>([]);
  const [state, setState] = useState<'loading' | 'failed' | 'done'>('done');
  const loadRef = useRef(load);
  const typed = query === chosen ? '' : query.trim();
  const short = typed.length < minQueryLength;
  const descriptions = new Map(options.map((option) => [option.value, option.description]));

  loadRef.current = load;

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

  const loading = state === 'loading' && !short;

  return (
    <Select
      ref={ref}
      {...input}
      searchable
      clearable
      defaultValue={defaultValue ?? null}
      data={short ? [] : options.map(({ value, label }) => ({ value, label }))}
      filter={({ options: all }) => all}
      searchValue={query}
      onSearchChange={setQuery}
      onDropdownOpen={() => setOpen(true)}
      onDropdownClose={() => setOpen(false)}
      onChange={(value: string | null, option: ComboboxItem | undefined) => {
        setChosen(option?.label);
        onChange?.(value ?? undefined);
      }}
      nothingFoundMessage={short
        ? t('asyncSelect.typeToSearch')
        : state === 'failed'
        ? t('asyncSelect.couldNotLoad')
        : loading
        ? t('asyncSelect.loading')
        : t('asyncSelect.noResults')}
      rightSection={loading ? <Loader size={16} /> : undefined}
      renderOption={({ option, checked }) => (
        <Group gap="xs" wrap="nowrap">
          {checked && <CheckIcon size={12} style={{ opacity: 0.4, flex: 'none' }} />}
          <div>
            <Text size="sm">{option.label}</Text>
            {descriptions.get(option.value) && <Text size="xs" c="dimmed">{descriptions.get(option.value)}</Text>}
          </div>
        </Group>
      )}
      comboboxProps={{ withinPortal: false, floatingStrategy: 'fixed' }}
    />
  );
});
