import type * as React from 'react';
import type { z } from 'zod';

export type {
  Binding,
  BindingConfig,
  FieldArg,
  FieldFn,
  FieldOptions,
  FieldProps,
  Fields,
  FormConfig,
  FormI18n,
  FormMeta,
  FormProps,
  Message,
  MessageCatalog,
  MessageContext,
  MessageFn,
  PluralForms,
  PropNames,
  SubmitContext,
  SubmitResult,
  UseFormOptions,
  UseFormReturn,
  ValidateOn,
};

/* ------------------------------------------------------------------ i18n */

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>;

interface MessageContext {
  locale: string;
  /** Picks the plural form for the parameter `param`; `#` is replaced by the formatted number. */
  count(param: string, forms: PluralForms): string;
}

/** The parameters arrive already formatted for the locale (numbers, dates). */
type MessageFn = (params: Record<string, string>, ctx: MessageContext) => string;
type Message = string | MessageFn;
type MessageCatalog = Record<string, Message>;

interface FormI18n {
  /** A React hook: returns the current locale and triggers a re-render when it changes. */
  useLocale(): string;
  /** Optional: delegates to the i18n system of the app. `undefined` = not available. */
  translate?(key: string, params: Record<string, unknown>, locale: string): string | undefined;
}

/* ------------------------------------------------------------- Bindings */

interface BindingConfig {
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
  /** Overrides the globally configured name of the label prop. */
  labelProp?: string;
  /** Reads the value from the arguments of the change callback (default: an event or a bare value). */
  fromComponent?: (...args: any[]) => unknown;
  /** Prepares the value for the component (e.g. an ISO string to a dayjs object). */
  toComponent?: (value: unknown) => unknown;
}

declare const bindingBrand: unique symbol;
type Binding = Readonly<BindingConfig> & { readonly [bindingBrand]: true };

/* --------------------------------------------------------------- Fields */

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

type FieldArg = Binding | FieldOptions | false | null | undefined;

interface PropNames {
  label: string;
  error: string;
}

type FieldProps<P extends PropNames> =
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
  & { [K in P['error']]?: string }
  & Record<string, any>;

type Unwrap<T> = T extends z.ZodOptional<infer I> ? Unwrap<I>
  : T extends z.ZodNullable<infer I> ? Unwrap<I>
  : T extends z.ZodDefault<infer I> ? Unwrap<I>
  : T;

type FieldFn<P extends PropNames> = (...args: FieldArg[]) => FieldProps<P>;

type Fields<Shape, P extends PropNames> = {
  [K in keyof Shape]: Unwrap<Shape[K]> extends z.ZodObject<infer S> ? Fields<S, P> : FieldFn<P>;
};

/* ------------------------------------------------------------------ Form */

interface SubmitResult {
  /** Field path (e.g. "address.zip") to a message key or text. */
  fieldErrors?: Record<string, string>;
  formError?: string;
}

interface SubmitContext {
  event: React.FormEvent<HTMLFormElement>;
  /** The button that triggered the submit (the native `SubmitEvent.submitter`). */
  submitter: HTMLButtonElement | HTMLInputElement | null;
  setErrors(fieldErrors: Record<string, string>, formError?: string): void;
  reset(): void;
}

type DeepPartial<T> = T extends Date ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

interface UseFormOptions<S extends z.ZodObject<any>> {
  /** Prefix of the label keys, e.g. "customer" gives "customer.name". */
  labels?: string;
  /** Initial values, e.g. for edit forms. */
  initial?: DeepPartial<z.input<S>>;
  submit(
    data: z.output<S>,
    ctx: SubmitContext,
  ): void | SubmitResult | Promise<void | SubmitResult>;
}

interface FormProps {
  noValidate: true;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  ref: (el: HTMLFormElement | null) => void;
  [prop: string]: any;
}

interface UseFormReturn<S extends z.ZodObject<any>, P extends PropNames> {
  form(...args: Array<Record<string, unknown> | false | null | undefined>): FormProps;
  field: Fields<S['shape'], P>;
  submitting: boolean;
  /** `true` if the schema currently reports no errors (regardless of user interaction). */
  valid: boolean;
  /** A form-wide error (server, or an object refinement without a path), already translated. */
  formError: string | undefined;
  reset(): void;
}

/* ---------------------------------------------------------------- Config */

interface FormConfig<P extends PropNames = PropNames> {
  i18n?: FormI18n;
  props?: P;
  /** Bindings per semantic field type ("date", "email", "number", ... or set with formMeta). */
  bindings?: Record<string, Binding>;
  /** Additional or overriding messages per locale. */
  messages?: Record<string, MessageCatalog>;
  /** The locale used when nothing is found for the current one (default: "en"). */
  fallbackLocale?: string;
}

interface FormMeta {
  labelKey?: string;
  /** The semantic type, if it cannot be derived from the schema (e.g. "richtext"). */
  type?: string;
  /** On the object schema: the label prefix, if not given to useForm. */
  labels?: string;
}
