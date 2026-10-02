# @local/form-validation

Fast, boilerplate-free form validation for React with Zod 4. Highly opinionated: the schema is the single source of
truth, the rendering stays with your own field components.

## Once per app

```ts
// src/form.ts
import { defineUseForm } from '@local/form-validation';

export const useForm = defineUseForm({
  i18n: { type: 'factory', getAdapter: () => i18nAdapter }, // or { type: 'hook', useAdapter }
  appNamespace: 'myapp', // optional, the namespace of the app's keys (default: 'app')
  props: { label: 'label', error: 'errorText', invalid: 'invalid' }, // invalid: optional
  bindings: { date: fancyDate }, // optional, per semantic type
});
```

## Localization

The adapter has the same shape as the one of the data navigator and the file upload, so one object fits all of them:

```ts
const i18nAdapter: I18nAdapter = {
  currentLocale: () => myI18n.language,
  resolveText: (namespace, key, params, defaultValue) => myI18n.t(key, { ns: namespace, ...params, defaultValue }),
  onChange: (listener) => myI18n.subscribe(listener), // returns the unsubscribe function
};
```

- `i18n` says where the adapter comes from:
  - `{ type: 'factory', getAdapter: (element) => I18nAdapter }`: asked once per form, with its `<form>` element (the
    one `form()` is spread on), when it is committed, before the first paint (the texts are rendered once more). So an
    adapter can read e.g. the `lang` of an ancestor (two parts of a page in two languages). A shared adapter:
    `getAdapter: () => i18nAdapter`. Without `form()` on a `<form>`, the factory is never asked (a warning in
    development mode).
  - `{ type: 'hook', useAdapter: () => I18nAdapter }`: called in `useForm` on every render (e.g. for a React context).
  - Another `type` (e.g. the old `{ useLocale, translate }`) makes `defineUseForm` throw a `TypeError`.
- `resolveText` gets the text the library would show as `defaultValue` (already filled in) and returns it if it has no
  translation.
  - The library's messages: namespace `'formvalidation'`, the key (`'number.min'`, ...) and the raw params.
  - The app's keys (labels, messages of the schema or the server): the namespace `appNamespace`, params `null` for
    labels.
- `onChange` is subscribed while the form is mounted: a change of the language renders the form again.
- Without an adapter (or before the factory is asked): the locale of `<html lang>`, otherwise the browser language.

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
`field.x({ label })` (only here). If a translation is missing (the adapter returns the `defaultValue`), the field name
is humanized. Without an adapter, a missing label is also reported as a warning in development mode; with one, the i18n
library reports its missing keys itself (a translation may equal the humanized name).

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

**Error messages:** the default errors come from bundled catalogs (de, en, fr, es, ru, hu, ar, zh-CN, zh-TW) with
`Intl` formatting and plural rules. `min` and `max` together become "between". Errors are stored as keys and only
translated when rendering, so a change of the locale applies at once. Order: an explicit message in the schema,
`messages` from the config, the library catalog (exact locale, base language, fallback); the result goes to the app
adapter as `defaultValue`, so the adapter has the last word.

**Variadic field arguments:** `field.x(binding, { onBlur }, condition && extra)` is merged from left to right. Handlers
are chained (the library first), refs combined, everything else overrides. `false`, `null` and `undefined` are ignored.

**Submit:** `submit(data, ctx)` gets the parsed, typed data. `ctx.submitter` for several buttons, `ctx.setErrors()` or
returning `{ fieldErrors, formError }` for server errors (keys or texts), `ctx.reset()`. If `submit` throws, `formError`
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
