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
  FormMeta,
  FormProps,
  I18nAdapter,
  I18nConfig,
  Message,
  MessageCatalog,
  MessageContext,
  MessageFn,
  PluralForms,
  PropNames,
  SubmitContext,
  SubmitOutcome,
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

/**
 * The app's i18n system, the same shape as the adapters of the other components (data table, file upload), so one
 * adapter object fits all of them.
 */
interface I18nAdapter {
  currentLocale: () => string;
  /**
   * The namespace is `'formValidation'` for the messages of the library, and the app namespace (see
   * `FormConfig.appNamespace`) for the app's keys (labels, messages of the schema or the server). `defaultValue` is the
   * text the library would show (from `messages` or its catalog, already filled in): return it if there is no
   * translation.
   */
  resolveText: (
    namespace: string,
    key: string,
    params: Readonly<Record<string, unknown>> | null,
    defaultValue: string,
  ) => string;
  /** Reports a change of the language: the form renders again. */
  onChange?: (listener: () => void) => () => void;
}

/**
 * Where the adapter comes from: a factory, asked once per form with its `<form>` element (rendered with `form()`), or a
 * React hook, called on every render (e.g. for a React context). A shared adapter: `getAdapter: () => adapter`.
 */
type I18nConfig =
  | { type: 'factory'; getAdapter: (element: HTMLElement) => I18nAdapter }
  | { type: 'hook'; useAdapter: () => I18nAdapter };

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
  /** Gets the message, only while it is visible. */
  error: string;
  /**
   * Optional: gets `true` while the field is marked as invalid, also before its message is visible (see the validation
   * strategy). The same name as `error` (e.g. Mantine's `error`): the message, or `true` without one.
   */
  invalid?: string;
}

/** The error prop gets the visible message; the invalid prop (if configured) `true`, or both in one prop. */
type ErrorProps<P extends PropNames> = P extends { invalid: infer I extends string }
  ? I extends P['error'] ? { [K in I]?: string | true }
  : { [K in P['error']]?: string } & { [K in I]?: true }
  : { [K in P['error']]?: string };

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
  & ErrorProps<P>
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
  /** The submit event of `form()`; absent for `requestSubmit()`. */
  event?: React.FormEvent<HTMLFormElement>;
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
  /** Called with the parsed data on a valid submit of `form()`. Optional when someone else submits (see below). */
  submit?(
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
  /**
   * Validates and submits like a submit of `form()`, without a `<form>` event: for a `<form>` owned by someone else
   * (e.g. a dialog: overlays' `<Form confirm={requestSubmit}>`). Stable across renders. Resolves with the outcome:
   * `{ ok: true }` when `submit` succeeded, `{ ok: false }` when the form is invalid or the server reported field
   * errors, `{ ok: false, error }` with the form-wide error (server, or a thrown `submit`).
   */
  requestSubmit(): Promise<SubmitOutcome>;
  /**
   * Whether a value differs from its initial one (`initial`, else the schema's default), e.g. to ask before
   * discarding the form. A value changed and changed back does not count; empty values (`undefined`, `null`, `''`)
   * are alike. A function, stable across renders: it reads the values of the moment.
   */
  isDirty(): boolean;
}

type SubmitOutcome = { ok: true } | { ok: false; error?: string };

/* ---------------------------------------------------------------- Config */

interface FormConfig<P extends PropNames = PropNames> {
  i18n?: I18nConfig;
  /** The namespace of the app's keys (labels, messages of the schema or the server) for the adapter (default: "app"). */
  appNamespace?: string;
  /**
   * The form-wide message of a `submit` that throws (e.g. a server error with a text for the user): a text, or a key of
   * the app namespace. `undefined` (the default for everything): the generic message.
   */
  errorMessage?: (error: unknown) => string | undefined;
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
