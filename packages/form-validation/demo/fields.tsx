import type { InputHTMLAttributes, ReactElement, SelectHTMLAttributes } from 'react';
import { FieldMessage } from './FieldMessage';

export { CheckboxField, SelectField, TextField };

// The demo's own field components: the contract is a label prop, an error text prop and the usual props of a native
// element (what `field.x()` hands over: name, id, ref, required, onChange, onBlur, `aria-invalid`, ...).
type Common = { label: string; errorText?: string };

function Label({ label, id, required }: { label: string; id: string; required: boolean }): ReactElement {
  return (
    <label className="ui-label" htmlFor={id}>
      {label}
      {required && <span aria-hidden="true">{' *'}</span>}
    </label>
  );
}

function Message({ id, message }: { id: string; message?: string }): ReactElement | null {
  return message === undefined ? null : <FieldMessage id={id} message={message} />;
}

function TextField({ label, errorText, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>): ReactElement {
  const errorId = `${rest.id}-error`;

  return (
    <div className="fv-field">
      <Label label={label} id={rest.id ?? ''} required={rest.required === true} />
      <input
        className="fv-input"
        aria-describedby={errorText === undefined ? undefined : errorId}
        {...rest}
      />
      <Message id={errorId} message={errorText} />
    </div>
  );
}

function SelectField(
  { label, errorText, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>,
): ReactElement {
  const errorId = `${rest.id}-error`;

  return (
    <div className="fv-field">
      <Label label={label} id={rest.id ?? ''} required={rest.required === true} />
      <select
        className="ui-select"
        aria-describedby={errorText === undefined ? undefined : errorId}
        {...rest}
      >
        {children}
      </select>
      <Message id={errorId} message={errorText} />
    </div>
  );
}

function CheckboxField({ label, errorText, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>): ReactElement {
  const errorId = `${rest.id}-error`;

  return (
    <div className="fv-field">
      <label className="ui-field">
        <input
          className="ui-checkbox"
          type="checkbox"
          aria-describedby={errorText === undefined ? undefined : errorId}
          {...rest}
        />
        {label}
      </label>
      <Message id={errorId} message={errorText} />
    </div>
  );
}
