import type { z } from 'zod';

export type {
  FieldArg,
  FieldBinding,
  FieldBindingConfig,
  FieldFn,
  FieldOptions,
  FieldPropNames,
  FieldProps,
  FormFields,
  ValidateOn,
};

/* ------------------------------------------------------------- Bindings */

interface FieldBindingConfig {
  /** Name of the value prop. If set, the field is controlled. */
  valueProp?: string;
  /** Name of the initial value prop when uncontrolled (default: defaultValue or defaultChecked). */
  defaultValueProp?: string;
  /** Name of the change callback (default: onChange). */
  changeProp?: string;
  /** Name of the blur callback (default: onBlur). */
  blurProp?: string;
  /** Overrides the globally configured name of the error prop. */
  errorProp?: string;
  /** Overrides the globally configured name of the invalid prop. */
  invalidProp?: string;
  /** Overrides the globally configured name of the label prop. */
  labelProp?: string;
  /** Reads the value from the arguments of the change callback (default: an event or a bare value). */
  fromComponent?: (...args: any[]) => unknown;
  /** Prepares the value for the component (e.g. an ISO string to a dayjs object). */
  toComponent?: (value: unknown) => unknown;
}

declare const bindingBrand: unique symbol;
type FieldBinding = Readonly<FieldBindingConfig> & { readonly [bindingBrand]: true };

/* ---------------------------------------------------------------- Fields */

type ValidateOn = 'blur' | 'change';

interface FieldOptions {
  /** A finished label text, wins over everything else. */
  label?: string;
  /** The i18n key of the label. */
  labelKey?: string;
  /** A different validation strategy for this field. */
  validateOn?: ValidateOn;
  /** All other props are merged (handlers chained, refs combined, the rest overrides). */
  [prop: string]: unknown;
}

type FieldArg = FieldBinding | FieldOptions | false | null | undefined;

interface FieldPropNames {
  label: string;
  /** Gets the message, only while it is visible. */
  error: string;
  /**
   * Optional: gets `true` while the field is marked as invalid, also before its message is visible (see the validation
   * strategy). The same name as `error` (e.g. Mantine's `error`): the message, or `true` without one.
   */
  invalid?: string;
}

/** The error prop gets the visible message; the invalid prop (if configured) `true`, or both in one prop. */
type ErrorProps<P extends FieldPropNames> = P extends { invalid: infer I extends string }
  ? I extends P['error'] ? { [K in I]?: string | true }
  : { [K in P['error']]?: string } & { [K in I]?: true }
  : { [K in P['error']]?: string };

type FieldProps<P extends FieldPropNames> =
  & {
    name: string;
    id: string;
    ref: (el: any) => void;
    onChange: (...args: any[]) => void;
    onBlur: (...args: any[]) => void;
    required: boolean;
    'aria-invalid'?: true;
    'data-invalid'?: '';
    'data-user-invalid'?: '';
  }
  & { [K in P['label']]: string }
  & ErrorProps<P>
  & Record<string, any>;

type Unwrap<T> = T extends z.ZodOptional<infer I> ? Unwrap<I>
  : T extends z.ZodNullable<infer I> ? Unwrap<I>
  : T extends z.ZodDefault<infer I> ? Unwrap<I>
  : T;

type FieldFn<P extends FieldPropNames> = (...args: FieldArg[]) => FieldProps<P>;

type FormFields<Shape, P extends FieldPropNames> = {
  [K in keyof Shape]: Unwrap<Shape[K]> extends z.ZodObject<infer S> ? FormFields<S, P> : FieldFn<P>;
};
