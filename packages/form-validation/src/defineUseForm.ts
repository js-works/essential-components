import type * as React from 'react';
import { useEffect, useId, useReducer, useRef } from 'react';
import type { z } from 'zod';
import { createTranslator, documentLocale, type ErrorData, warnOnce } from './i18n';
import { DEFAULT_MESSAGE, issueToError } from './issues';
import { mergeProps } from './merge';
import { formRegistry, isBinding } from './meta';
import { collectFields, type FieldInfo, getPath, setPath } from './schema';
import type {
  BindingConfig,
  FieldArg,
  FormConfig,
  PropNames,
  SubmitContext,
  UseFormOptions,
  UseFormReturn,
  ValidateOn,
} from './types';

export { defineUseForm };

interface Store {
  schema: z.ZodObject<any>;
  fields: FieldInfo[];
  byPath: Map<string, FieldInfo>;
  initial: Record<string, unknown>;
  values: Record<string, unknown>;
  output: unknown;
  dirty: Set<string>;
  shown: Set<string>;
  errors: Map<string, ErrorData>;
  rootError?: ErrorData | undefined;
  serverErrors: Map<string, ErrorData>;
  serverFormError?: ErrorData | undefined;
  submitAttempted: boolean;
  submitting: boolean;
  elements: Map<string, Element>;
  refs: Map<string, (el: Element | null) => void>;
  rendered: Set<string>;
  formEl: HTMLFormElement | null;
  idBase: string;
}

/* ----------------------------------------------------------------- Store */

function createStore(schema: z.ZodObject<any>, initialValues: unknown): Store {
  const fields = collectFields(schema);
  const initial: Record<string, unknown> = {};
  for (const f of fields) {
    const given = getPath(initialValues, f.path);
    initial[f.path] = given !== undefined ? given : (f.defaultValue ?? (f.kind === 'boolean' ? false : undefined));
  }
  const store: Store = {
    schema,
    fields,
    byPath: new Map(fields.map((f) => [f.path, f])),
    initial,
    values: { ...initial },
    output: undefined,
    dirty: new Set(),
    shown: new Set(),
    errors: new Map(),
    serverErrors: new Map(),
    submitAttempted: false,
    submitting: false,
    elements: new Map(),
    refs: new Map(),
    rendered: new Set(),
    formEl: null,
    idBase: '',
  };
  validate(store);
  return store;
}

function validate(store: Store): void {
  const data: Record<string, any> = {};
  for (const f of store.fields) setPath(data, f.path, store.values[f.path]);
  const result = store.schema.safeParse(data, { error: () => DEFAULT_MESSAGE });
  store.errors.clear();
  store.rootError = undefined;
  if (result.success) {
    store.output = result.data;
    return;
  }
  for (const iss of result.error.issues) {
    const path = iss.path.map(String).join('.');
    const info = store.byPath.get(path);
    if (info) {
      if (!store.errors.has(path)) store.errors.set(path, issueToError(iss, info, store.values[path]));
    } else {
      store.rootError ??= issueToError(iss, undefined, data);
    }
  }
}

const isValid = (s: Store) => s.errors.size === 0 && !s.rootError;

/** The error the user currently sees ("user-invalid"). */
function displayed(s: Store, path: string): ErrorData | undefined {
  return s.serverErrors.get(path) ?? (s.shown.has(path) ? s.errors.get(path) : undefined);
}

function signature(s: Store): string {
  let sig = isValid(s) ? '1' : '0';
  for (const path of s.shown) {
    const e = displayed(s, path);
    if (e) sig += `|${path}:${e.key}:${JSON.stringify(e.params ?? null)}`;
  }
  return sig + `|r:${s.rootError?.key ?? ''}`;
}

/* ---------------------------------------------------------------- Values */

function isEventLike(arg: unknown): arg is { target: unknown } {
  return (
    typeof arg === 'object'
    && arg !== null
    && 'target' in arg
    && ('nativeEvent' in arg || (typeof Event !== 'undefined' && arg instanceof Event))
  );
}

/** The universal convention: an event or a bare value. */
function readValue(arg: unknown): unknown {
  if (!isEventLike(arg)) return arg;
  const t = arg.target as HTMLInputElement | null;
  if (!t) return undefined;
  if (t.type === 'checkbox') return t.checked;
  if (t.type === 'radio') return t.checked ? t.value : undefined;
  return t.value;
}

function coerce(info: FieldInfo, raw: unknown): unknown {
  if (raw === null || raw === '') return undefined;
  if (info.kind === 'number' && typeof raw === 'string') {
    const s = raw.trim();
    if (s === '') return undefined;
    const normalized = /^-?\d+,\d+$/.test(s) ? s.replace(',', '.') : s;
    const n = Number(normalized);
    return Number.isNaN(n) ? raw : n; // an invalid number stays a string, Zod reports "number.type"
  }
  if (info.kind === 'date' && typeof raw === 'string') return new Date(raw);
  return raw;
}

const identity = (v: unknown) => v;

/* ------------------------------------------------------------------ Hook */

const OPTION_KEYS = new Set(['label', 'labelKey', 'validateOn']);

function defineUseForm<const P extends PropNames = { label: 'label'; error: 'error' }>(
  config: FormConfig<P> = {},
) {
  const names: PropNames = { label: 'label', error: 'error', ...config.props };
  const i18n = config.i18n ?? documentLocale;
  const t = createTranslator(config, i18n);

  return function useForm<S extends z.ZodObject<any>>(schema: S, options: UseFormOptions<S>): UseFormReturn<S, P> {
    const locale = i18n.useLocale();
    const idBase = useId();
    const [, forceRender] = useReducer((n: number) => n + 1, 0);
    const storeRef = useRef<Store | null>(null);
    storeRef.current ??= createStore(schema, options.initial);
    const store = storeRef.current;
    store.idBase = idBase;
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const prefix = options.labels ?? formRegistry.get(schema)?.labels;
    const idOf = (path: string) => `${store.idBase}${path.replace(/\./g, '-')}`;
    store.rendered.clear();

    // Mirrors the validity to the native elements (:invalid, :user-invalid) and reports missing refs.
    useEffect(() => {
      for (const [path, el] of store.elements) {
        const err = store.serverErrors.get(path) ?? store.errors.get(path);
        (el as HTMLInputElement).setCustomValidity?.(err ? t.message(err, locale) : '');
      }
      for (const path of store.rendered) {
        if (!store.elements.has(path)) {
          warnOnce(
            `ref:${path}`,
            `The field "${path}" got no element by ref. Focus on errors and :user-invalid do not work for it.`,
          );
        }
      }
    });

    /* -------------------------------------------------------------- Events */

    function update(mutate: () => void, force = false) {
      const before = signature(store);
      mutate();
      if (force || signature(store) !== before) forceRender();
    }

    function handleChange(info: FieldInfo, value: unknown, validateOn: ValidateOn, controlled: boolean) {
      update(() => {
        store.values[info.path] = value;
        store.dirty.add(info.path);
        if (validateOn === 'change') store.shown.add(info.path);
        validate(store);
      }, controlled || store.serverErrors.delete(info.path));
    }

    function handleBlur(info: FieldInfo) {
      if (!store.dirty.has(info.path)) return;
      update(() => store.shown.add(info.path));
    }

    function applyServer(fieldErrors?: Record<string, string>, formError?: string) {
      for (const [path, msg] of Object.entries(fieldErrors ?? {})) {
        store.serverErrors.set(path, { key: msg, custom: true });
        store.shown.add(path);
      }
      if (formError) store.serverFormError = { key: formError, custom: true };
      forceRender();
    }

    function focusFirstInvalid() {
      for (const f of store.fields) {
        if (!store.errors.has(f.path) && !store.serverErrors.has(f.path)) continue;
        const el = store.elements.get(f.path) ?? document.getElementById(idOf(f.path));
        (el as HTMLElement | null)?.focus?.();
        return;
      }
    }

    function reset() {
      store.values = { ...store.initial };
      store.dirty.clear();
      store.shown.clear();
      store.serverErrors.clear();
      store.serverFormError = undefined;
      store.submitAttempted = false;
      store.formEl?.reset();
      validate(store);
      forceRender();
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (store.submitting) return;
      store.submitAttempted = true;
      store.serverErrors.clear();
      store.serverFormError = undefined;
      for (const f of store.fields) store.shown.add(f.path);
      validate(store);
      if (!isValid(store)) {
        forceRender();
        focusFirstInvalid();
        return;
      }
      const ctx: SubmitContext = {
        event,
        submitter: ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null) ?? null,
        setErrors: applyServer,
        reset,
      };
      store.submitting = true;
      forceRender();
      try {
        const result = await optionsRef.current.submit(store.output as z.output<S>, ctx);
        if (result) applyServer(result.fieldErrors, result.formError);
      } catch (err) {
        store.serverFormError = { key: 'submitFailed' };
        console.error(err);
      } finally {
        store.submitting = false;
        forceRender();
      }
    }

    /* -------------------------------------------------------------- Fields */

    function refFor(path: string) {
      let ref = store.refs.get(path);
      if (!ref) {
        ref = (el) => (el ? store.elements.set(path, el) : store.elements.delete(path));
        store.refs.set(path, ref);
      }
      return ref;
    }

    function fieldProps(info: FieldInfo, args: FieldArg[]) {
      const path = info.path;
      store.rendered.add(path);

      const bind: BindingConfig = {};
      const opts: { label?: string; labelKey?: string; validateOn?: ValidateOn } = {};
      let extra: Record<string, unknown> = {};
      for (const arg of [config.bindings?.[info.type], ...args]) {
        if (!arg) continue;
        if (isBinding(arg)) {
          Object.assign(bind, arg);
          continue;
        }
        const rest: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(arg)) {
          if (OPTION_KEYS.has(k)) (opts as Record<string, unknown>)[k] = v;
          else rest[k] = v;
        }
        extra = mergeProps(extra, rest); // chained from left to right
      }

      const isBool = info.kind === 'boolean';
      const controlled = bind.valueProp != null;
      const from = bind.fromComponent ?? readValue;
      const to = bind.toComponent ?? (controlled ? (v: unknown) => v ?? (isBool ? false : '') : identity);
      const validateOn = opts.validateOn ?? 'blur';

      const err = displayed(store, path);
      const labelKey = opts.labelKey ?? info.meta.labelKey ?? (prefix ? `${prefix}.${path}` : path);

      const base: Record<string, unknown> = {
        name: path,
        id: idOf(path),
        ref: refFor(path),
        required: info.required,
        [bind.labelProp ?? names.label]: opts.label ?? t.label(labelKey, path, locale),
        [bind.errorProp ?? names.error]: err ? t.message(err, locale) : undefined,
        [bind.changeProp ?? 'onChange']: (...a: unknown[]) =>
          handleChange(info, coerce(info, from(...a)), validateOn, controlled),
        [bind.blurProp ?? 'onBlur']: () => handleBlur(info),
      };
      if (controlled) base[bind.valueProp!] = to(store.values[path]);
      else base[bind.defaultValueProp ?? (isBool ? 'defaultChecked' : 'defaultValue')] = to(store.initial[path]);
      if (info.min != null) base.min = info.min;
      if (info.max != null) base.max = info.max;
      if (info.minLength != null) base.minLength = info.minLength;
      if (info.maxLength != null) base.maxLength = info.maxLength;
      if (store.errors.has(path) || store.serverErrors.has(path)) base['data-invalid'] = '';
      if (err) {
        base['aria-invalid'] = true;
        base['data-user-invalid'] = '';
      }
      return mergeProps(base, extra);
    }

    const field: Record<string, any> = {};
    for (const info of store.fields) {
      setPath(field, info.path, (...args: FieldArg[]) => fieldProps(info, args));
    }

    /* ---------------------------------------------------------------- Form */

    const formRef = (el: HTMLFormElement | null) => {
      store.formEl = el;
    };

    function form(...args: Array<Record<string, unknown> | false | null | undefined>) {
      let extra: Record<string, unknown> = {};
      for (const a of args) if (a) extra = mergeProps(extra, a);
      // Own handlers on the <form> run before the library (e.g. tracking before the validation).
      return mergeProps({ noValidate: true, onSubmit, ref: formRef }, extra, false) as any;
    }

    const formErr = store.serverFormError ?? (store.submitAttempted ? store.rootError : undefined);

    return {
      form,
      field: field as UseFormReturn<S, P>['field'],
      submitting: store.submitting,
      valid: isValid(store),
      formError: formErr ? t.message(formErr, locale) : undefined,
      reset,
    };
  };
}
