import type * as React from 'react';
import type { z } from 'zod';

import type { FieldBinding, FieldPropNames, FormFields } from './fields.js';
import type { I18nAdapter } from './i18n.js';

export type { FormConfig, FormProps, SubmitContext, SubmitOutcome, SubmitResult, UseFormOptions, UseFormReturn };

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
  /**
   * The adapter of the app's i18n: a hook, called in `useForm` on every render. A global instance:
   * `() => i18nAdapter`; or built from a React context (keep it the same object while nothing changes, e.g. `useMemo`).
   */
  useI18n?: () => I18nAdapter;
  /**
   * The namespace of the app's keys (labels, messages of the schema or the server) for the adapter. Without it, the
   * adapter gets `null`: the app's default namespace.
   */
  appNamespace?: string;
  /**
   * The form-wide message of a `submit` that throws (e.g. a server error with a text for the user): a text, or a key of
   * the app namespace. `undefined` (the default for everything): the generic message.
   */
  errorMessage?: (error: unknown) => string | undefined;
  props?: P;
  /** Bindings per semantic field type of the schema ("date", "email", "number", ...). */
  bindings?: Record<string, FieldBinding>;
}
