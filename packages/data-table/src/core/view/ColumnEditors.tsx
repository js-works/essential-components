import type { ReactElement } from 'react';
import type { DataTableComponent as Spec } from '../../react/api';
import { optionsOf } from '../filters';
import * as styles from './classes';
import { DateInput } from './DateRangeFilter';
import { SelectInput } from './widgets';

export { dateColumnEditor, selectColumnEditor, textColumnEditor };

// The built-in editors of a row in edit mode (`saveRow`). Each one edits the value of its column in the draft: what it
// changes goes to `change`, and the table saves the whole draft at once ("Save", or Enter).

// A text input. The value is the text as it is typed (not trimmed: that is up to `saveRow`).
function textColumnEditor<Row>(settings: Spec.TextColumnEditorSettings = {}): Spec.ColumnEditor<Row> {
  return (props) => <TextEditor {...props} placeholder={settings.placeholder} />;
}

// A single select of fixed options. The value is the value of the chosen option.
function selectColumnEditor<Row>(settings: Spec.SelectColumnEditorSettings): Spec.ColumnEditor<Row> {
  const options = optionsOf(settings.options);

  return ({ columnKey, value, change, labelledBy }) => (
    <SelectInput
      value={value === null || value === undefined ? '' : String(value)}
      options={options}
      labelledBy={labelledBy}
      onChange={(next) => change(patchOf<Row>(columnKey, next))}
    />
  );
}

// A date: the trigger shows it in the locale, a popover has a calendar (like the date range filter). The value is
// `yyyy-mm-dd`, or `''` when it is cleared.
function dateColumnEditor<Row>(settings: Spec.DateColumnEditorSettings = {}): Spec.ColumnEditor<Row> {
  return ({ columnKey, value, change, labelledBy }) => (
    <DateInput
      value={typeof value === 'string' ? value : ''}
      placeholder={settings.placeholder}
      labelledBy={labelledBy}
      onChange={(next) => change(patchOf<Row>(columnKey, next))}
    />
  );
}

// A patch of one column: the editors know the key of their column, not its type.
function patchOf<Row>(key: keyof Row & string, value: unknown): Partial<Row> {
  return { [key]: value } as Partial<Row>;
}

function TextEditor<Row>(props: Spec.EditorProps<Row> & { placeholder: string | undefined }): ReactElement {
  const { columnKey, value, change, labelledBy, placeholder } = props;

  return (
    <input
      type="text"
      className={styles.input}
      aria-labelledby={labelledBy}
      placeholder={placeholder}
      value={value === null || value === undefined ? '' : String(value)}
      onChange={(event) => change(patchOf<Row>(columnKey, event.currentTarget.value))}
    />
  );
}
