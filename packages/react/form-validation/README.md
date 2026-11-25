# @local/form-validation

Fast, boilerplate-free form validation for React with Zod 4. Highly opinionated: the schema is the single source of
truth, the rendering stays with your own field components.

## Once per app

```ts
// src/form.ts
import { defineUseForm } from '@local/form-validation';

export const useForm = defineUseForm({
  useI18n: () => i18nAdapter, // optional, a hook: the adapter of the app's i18n
  appNamespace: 'myapp', // optional, the namespace of the app's keys (default: 'app')
  props: { label: 'label', error: 'errorText', invalid: 'invalid' }, // invalid: optional
  bindings: { date: fancyDate }, // optional, per semantic type
});
```

## Localization

The adapter's type is the same in every library with texts, so one object fits them all:

```ts
import type { I18nAdapter } from '@local/form-validation';

const i18nAdapter: I18nAdapter = {
  currentLocale: () => myI18n.language,
  translate: (namespace, key, params) => (myI18n.exists(key, namespace) ? myI18n.t(key, namespace, params) : null),
  onChange: (listener) => myI18n.subscribe(listener), // returns the unsubscribe function
};
```

- `useI18n` gives the adapter: a hook, called in `useForm` on every render. A global instance: `() => i18nAdapter`. An
  i18n that only exists inside React (a provider, a library with only a hook) builds it there; keep it the same object
  while nothing changes:
  ```ts
  useI18n: () => {
    const translator = useXyzTranslator();
    return useMemo(() => toAdapter(translator), [translator]);
  },
  ```
- `translate` returns the translation, or `null` when there is none: then the library uses its own text.
  - The library's messages (its English text without a translation, `en-US` formatting): namespace `'formValidation'`, the key (`'number.min'`, ...) and the raw params (numbers,
    dates; a length that drives a plural as `count`). Their types: `FormValidationTextKey`, `FormValidationParams`.
  - The app's keys (labels, messages of the schema or the server): the namespace `appNamespace`, params `null` for
    labels. Without a translation: the humanized field name, the literal text of the schema or the server.
- `onChange` is subscribed while the form is mounted: a change of the language renders the form again.
- Without an adapter: English texts and `en-US` formatting.

The translations: ICU messages as JSON, one file per language (`locales/en.json`, `locales/de.json`), for an i18n with ICU
(FormatJS, i18next with `i18next-icu`), under the namespace `formValidation`, e.g. loaded on demand:

```ts
i18n
  .use(ICU)
  .use(
    resourcesToBackend((lng, ns) =>
      ns === 'formValidation'
        ? import(`@local/form-validation/locales/${lng}.json`)
        : import(`./locales/${lng}/${ns}.json`)
    ),
  )
  .init({ ns: ['app', 'formValidation'], fallbackLng: 'en' });
```

- The adapter's `onChange` listens to i18next's `loaded` too, not only `languageChanged`: until a file arrives, the
  form shows its English texts.
- `en.json` is American English, the same texts as the library's default (`src/texts/en.ts`, functions of the values
  and the locale, the master); with it, the app's i18n knows every key (no missing keys). Another variant (`en-GB`,
  `de-CH`) only for keys whose wording differs; the formatting follows the locale anyway.
- An app without ICU translates the messages in its own format (the keys and values: `FormValidationParams`), or keeps
  the English ones.
- A test checks that the files match the master (keys, values).

## Usage

```tsx
const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  dob: z.iso.date(),
  newsletter: z.boolean().default(false),
});

export function SignupForm() {
  const { form, field, submitting } = useForm(signupSchema, {
    labels: 'signup',
    submit: (data) => api.signup(data),
  });

  return (
    <form {...form()}>
      <TextField {...field.email()} />
      <PasswordField {...field.password()} />
      <DatePicker {...field.dob()} />
      <CheckboxField {...field.newsletter()} />
      <Button type="submit" loading={submitting}>Sign up</Button>
    </form>
  );
}
```

## The opinions

**Contract for field components:** a component has a label prop and an error text prop (names configurable), takes
`defaultValue` or `defaultChecked`, and reports changes with `onChange`, with an event or a bare value. A component
that differs gets a `binding()`.

**Derived from the schema:** `name`, `id`, `required` (the schema does not accept `undefined`),
`min`/`max`/`minLength`/`maxLength`, initial values from `.default()`. Empty inputs become `undefined`, so `z.string()`
is required automatically.

**Labels by convention:** `labels: 'signup'` plus the field path gives `signup.email`, translated by the adapter.
Different keys with `formMeta(schema, { labelKey })` (applies everywhere) or `field.x({ labelKey })` or
`field.x({ label })` (only here). If a translation is missing (the adapter returns `null`, or there is no adapter), the
field name is humanized, and reported as a warning in development mode.

**Validation strategy:** a field shows errors only after a change and a blur, then live on every input. On submit,
everything is shown and the first invalid field is focused. Per field differently with `validateOn: 'change'`.
Like the browser's `:user-invalid` and its bubble, the red mark and the message are separate: a field that turns
invalid while being edited (e.g. a valid required field emptied again) is marked at once, but gets its message only on
blur or submit. A message that is already visible stays while typing and follows the value; a valid value removes both
at once. With `validateOn: 'change'` the message is live as well.

**Error and invalid props:** the error prop (`props.error`) gets the message only while it is visible. The optional
invalid prop (`props.invalid`) gets `true` while the field is marked as invalid, also before its message is visible.
Without it, a component sees the mark only in `aria-invalid` and `data-user-invalid`. One prop for both, e.g. Mantine's
`error` (a text, or `true` for red without one): `props: { label: 'label', error: 'error', invalid: 'error' }`.

**Error messages:** the default errors are keys with raw values, translated by the app's adapter; the library's
English text (`en-US` formatting, English's plural) is the default. `min` and `max` together become "between".
Errors are stored as keys and only translated when rendering, so a change of the locale applies at once. An explicit
message in the schema (or of the server) is a key of the app (`appNamespace`), or a literal text if nothing translates
it.

**Variadic field arguments:** `field.x(binding, { onBlur }, condition && extra)` is merged from left to right. Handlers
are chained (the library first), refs combined, everything else overrides. `false`, `null` and `undefined` are ignored.

**Submit:** `submit(data, ctx)` gets the parsed, typed data. `ctx.submitter` for several buttons, `ctx.setErrors()` or
returning `{ fieldErrors, formError }` for server errors (keys or texts), `ctx.reset()`. Field errors from the server
(during the submit) focus the first of these fields, like invalid fields on the client; a `formError` alone moves no
focus, and neither does a later `ctx.setErrors()` after the submit. If `submit` throws, `formError`
shows a generic message, or the one `errorMessage(error)` of the config gives (a text or a key, once per app, e.g.
`(error) => error instanceof Error ? error.message : undefined` for a server whose errors are meant for the user).

**A foreign `<form>`:** when the `<form>` belongs to someone else (e.g. a dialog), the fields are used without
`form()`, and the owner runs `requestSubmit()` (stable across renders): it validates and submits like a submit of
`form()` (`ctx.event` is absent) and resolves with the outcome, `{ ok: true }`, `{ ok: false }` (invalid, or field
errors from the server) or `{ ok: false, error }` (the form-wide error, translated; a thrown `submit` gives the generic
message). The overlays' form dialog takes it directly:

```tsx
const { requestSubmit, field } = useForm(schema, { submit: save });
return <Form confirm={requestSubmit}>…</Form>; // Form from @local/overlays/react
```

**Changed:** `isDirty()` (stable across renders, reads the values of the moment) tells whether a value differs from
its initial one (`initial`, else the schema's default), e.g. to ask before a dialog discards the form. A value changed
and changed back does not count; empty values (`undefined`, `null`, `''`) are alike, dates compare by time.

**invalid and user-invalid:** native elements get the Zod result with `setCustomValidity()`, so `:invalid` and
`:user-invalid` also work for regexes or `.refine()`. In addition, the library sets `aria-invalid`, `data-invalid` and
`data-user-invalid`. `valid` returns the current overall state.

## Bindings

```ts
export const fancyDate = binding({
  valueProp: 'selected', // set = controlled
  changeProp: 'onPick',
  fromComponent: (d: Dayjs | null) => d?.format('YYYY-MM-DD') ?? null,
  toComponent: (v) => (v ? dayjs(v as string) : null),
});
```

More options: `defaultValueProp`, `blurProp`, `errorProp`, `invalidProp`, `labelProp`.

## Open points

- `reset()` resets native inputs and controlled fields, but not uncontrolled third-party components (their internal
  state stays). The solution is still open.
- Bindings are not yet part of the return type of `field.x()` (e.g. `selected` instead of `defaultValue`), the type is
  loose there.
- Arrays and dynamic field lists are deliberately not supported yet.
- The catalogs other than de and en should be proofread by native speakers.
