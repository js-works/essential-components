import type * as React from 'react';
import type { z } from 'zod';
import type { FieldBinding, FieldPropNames, FormFields } from './fields.js';
import type { I18nConfig } from './i18n.js';
import type { MessageCatalog } from './texts.js';

export type {
  FormConfig,
  FormMeta,
  FormProps,
  SubmitContext,
  SubmitOutcome,
  SubmitResult,
  UseFormOptions,
  UseFormReturn,
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

interface UseFormReturn<S extends z.ZodObject<any>, P extends FieldPropNames> {
  form(...args: Array<Record<string, unknown> | false | null | undefined>): FormProps;
  field: FormFields<S['shape'], P>;
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

interface FormConfig<P extends FieldPropNames = FieldPropNames> {
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
  bindings?: Record<string, FieldBinding>;
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
