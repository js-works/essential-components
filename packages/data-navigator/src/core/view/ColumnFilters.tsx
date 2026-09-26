import type { ReactElement } from 'react';
import type { DataNavigator as Spec } from '../../api';
import { optionsOf, useTextFilter } from '../filters';
import { useTexts } from '../texts';
import { textFieldKeys } from '../utils';
import { FilterSelectField, FilterTextField } from './widgets';

export { selectColumnFilter, textColumnFilter };

type TextFilterProps = Spec.FilterProps & Spec.TextColumnFilterSettings;

type SelectFilterProps = Spec.FilterProps & Spec.SelectColumnFilterSettings;

// The filters are components of their own, so the text being typed (a draft until Enter) has a place to live.
function TextFilterInput({ value, onChange, labelledBy, placeholder }: TextFilterProps): ReactElement {
  const texts = useTexts();
  const filter = useTextFilter(value, onChange);

  return (
    <FilterTextField
      value={filter.text}
      placeholder={placeholder ?? texts.filterPlaceholder}
      labelledBy={labelledBy}
      clearLabel={texts.clearFilter}
      onChange={filter.change}
      onClear={filter.clear}
      onKeyDown={textFieldKeys(filter.submit, filter.clear)}
    />
  );
}

// A select applies at once. The placeholder "All" is only shown while nothing is selected.
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

// The built-in column filters.
// A text filter applies on Enter, and is removed at once when it gets empty, on Escape, or with its clear button.
// Its placeholder is `settings.placeholder`, or the localized `Texts.filterPlaceholder`.
function textColumnFilter(settings: Spec.TextColumnFilterSettings = {}): Spec.ColumnFilter {
  return (props) => <TextFilterInput {...props} {...settings} />;
}

function selectColumnFilter(settings: Spec.SelectColumnFilterSettings): Spec.ColumnFilter {
  return (props) => <SelectFilterInput {...props} {...settings} />;
}
