import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import { flag } from '../utils';
import * as classes from './DataNavigator.module.css';
import { icons } from './icons';
import { ActionButton } from './widgets';

export { EditForm };

type EditFormProps<Row> = {
  // The key of the row it belongs to (a new row has one of its own).
  rowKey: string;
  isNew: boolean;
  row: Row;
  draft: Row;
  saving: boolean;
  // Folding up after "Cancel": nothing in it reacts anymore.
  closing: boolean;
  error: string | undefined;
  fields: readonly Spec.EditField<Row>[];
  texts: Spec.Texts;
  fieldId: (key: string) => string;
  onChange: (patch: Partial<Row>) => void;
  onSave: () => void;
  onCancel: () => void;
  // A native event (see the listener below).
  onKeyDown: (event: KeyboardEvent) => void;
};

// The edit form of a row (and of a new one), in its place over the whole width: every field with its label before its
// editor (right aligned, like the filter view; above it in a narrow form), in as many columns as fit, then the message
// of a failed save and "Cancel" and "Save" (like the filter view: a ghost button and an outlined one).
function EditForm<Row>(props: EditFormProps<Row>): ReactElement {
  const { draft, saving, error, texts } = props;
  const cellRef = useRef<HTMLDivElement>(null);
  const onKeyDownRef = useRef(props.onKeyDown);
  const fieldsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onKeyDownRef.current = props.onKeyDown;
  });

  // The keys of the form (Enter saves, Escape cancels) with a native listener on its cell, not React's `onKeyDown`:
  // React handles events where its root is, and a dialog around the table (e.g. a drawer of the overlays, whose
  // `<dialog>` in its shadow root gets the events of its slotted content first) would take Enter and Escape before
  // the form has marked them as handled.
  useEffect(() => {
    const cell = cellRef.current;
    const listener = (event: KeyboardEvent) => onKeyDownRef.current(event);

    cell?.addEventListener('keydown', listener);

    return () => cell?.removeEventListener('keydown', listener);
  }, []);
  // The width of the widest label, measured when the form opens: every label gets it, so the editors line up. Before
  // it is measured, each label is as wide as its text.
  const [labelWidth, setLabelWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const labels = [...(fieldsRef.current?.querySelectorAll<HTMLElement>('[data-edit-label]') ?? [])];

    setLabelWidth(labels.length === 0 ? undefined : Math.ceil(Math.max(...labels.map((label) => label.scrollWidth))));
  }, [props.fields, texts]);

  return (
    <div role="row" className={classes.row} data-row-key={props.rowKey} data-edit-form>
      <div
        role="cell"
        className={classes.editFormCell}
        style={{ gridColumn: '1 / -1' }}
        ref={cellRef}
        data-closing={flag(props.closing)}
        inert={props.closing}
      >
        {/* Clips the form while it unfolds (see the stylesheet). */}
        <div className={classes.editFormClip}>
          <div role="group" aria-label={props.isNew ? texts.newRow : texts.editRow} className={classes.editForm}>
            {/* A column: the label, the gap and an editor of at least 12rem. */}
            <div
              ref={fieldsRef}
              className={classes.editFields}
              style={labelWidth === undefined ? undefined : {
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, calc(${labelWidth}px + `
                  + 'var(--datnav-spacing-sm) + 12rem)), 1fr))',
              }}
            >
              {props.fields.map((field) => (
                <div key={field.key} className={classes.editField}>
                  <span
                    id={props.fieldId(field.key)}
                    className={classes.editLabel}
                    style={labelWidth === undefined ? undefined : { minWidth: labelWidth }}
                    data-edit-label
                  >
                    {field.label}
                  </span>
                  <div className={classes.editControl}>
                    {field.edit({
                      row: props.row,
                      draft,
                      columnKey: field.key,
                      value: draft[field.key],
                      change: props.onChange,
                      labelledBy: props.fieldId(field.key),
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className={classes.editFooter}>
              {error !== undefined && <span role="alert" className={classes.editError}>{error}</span>}
              <ActionButton
                look={{ label: texts.cancelEdit }}
                variant="secondary"
                placement="tool"
                onClick={props.onCancel}
              />
              {/* While the draft is saved, a turning icon; the buttons and the editors do nothing then. */}
              <button
                type="button"
                className={classes.applyButton}
                data-busy={flag(saving)}
                aria-busy={saving}
                onClick={props.onSave}
              >
                {saving && <icons.Refresh size={14} />}
                {props.isNew ? texts.confirmNew : texts.confirmEdit}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
