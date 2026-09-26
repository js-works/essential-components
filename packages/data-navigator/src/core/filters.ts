import { useEffect, useState } from 'react';
import type { DataNavigator as Spec } from '../api';

export { optionsOf, sameValue, useTextFilter };
export type { NormalizedOption };

type NormalizedOption = { value: string; label: string };

function optionsOf(options: readonly Spec.FilterOption[]): NormalizedOption[] {
  return options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));
}

// Unlike Array.isArray, this also rules out readonly arrays in the false branch.
function isList(value: object): value is readonly Spec.FilterValue[] {
  return Array.isArray(value);
}

// Two filter values are the same if they are equal as JSON values (so an equal value does not reload).
function sameValue(a: Spec.FilterValue | undefined, b: Spec.FilterValue | undefined): boolean {
  if (a === b) {
    return true;
  }

  if (
    a === undefined || b === undefined || a === null || b === null || typeof a !== 'object' || typeof b !== 'object'
  ) {
    return false;
  }

  if (isList(a) || isList(b)) {
    return isList(a) && isList(b) && a.length === b.length && a.every((item, index) => sameValue(item, b[index]));
  }

  const keys = Object.keys(a);

  return keys.length === Object.keys(b).length && keys.every((key) => key in b && sameValue(a[key], b[key]));
}

// The behavior of a text filter, independent of the UI library: the text of the input is only a draft while typing. It
// is applied on Enter, and removed at once when the input gets empty, is cleared with its button, or on Escape.
function useTextFilter(
  value: Spec.FilterValue | undefined,
  onChange: (value: Spec.FilterValue | undefined) => void,
) {
  const applied = typeof value === 'string' ? value : '';
  const [text, setText] = useState(applied);
  // The table may change the value from outside (e.g. cleared). Follow it, but keep what is being typed: the applied
  // value is trimmed, so a space at the end of the text must not be thrown away.
  useEffect(() => {
    setText((current) => (current.trim() === applied ? current : applied));
  }, [applied]);

  return {
    text,
    change: (next: string) => {
      setText(next);

      if (next.trim() === '') {
        onChange(undefined);
      }
    },
    submit: () => onChange(text.trim() === '' ? undefined : text.trim()),
    clear: () => {
      setText('');
      onChange(undefined);
    },
  };
}
