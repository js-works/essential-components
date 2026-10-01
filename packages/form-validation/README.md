# @local/form-validation

Fast, boilerplate-free form validation for React with Zod 4. Highly opinionated: the schema is the single source of
truth, the rendering stays with your own field components.

## Once per app

```ts
// src/form.ts
import { defineUseForm } from '@local/form-validation';

export const useForm = defineUseForm({
  i18n: {
    useLocale: () => useAppStore((s) => s.language),
    translate: (key, params, locale) => myI18n.translate(key, params, locale),
  },
  props: { label: 'label', error: 'errorText' },
  bindings: { date: fancyDate }, // optional, per semantic type
});
```

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
`field.x({ label })` (only here). If a translation is missing, the field name is humanized, with a warning in
development mode.

**Validation strategy:** a field shows errors only after a change and a blur, then live on every input. On submit,
everything is shown and the first invalid field is focused. Per field differently with `validateOn: 'change'`.

**Error messages:** the default errors come from bundled catalogs (de, en, fr, es, ru, hu, ar, zh-CN, zh-TW) with
`Intl` formatting and plural rules. `min` and `max` together become "between". Errors are stored as keys and only
translated when rendering, so a change of the locale applies at once. Order: an explicit message in the schema, the app
adapter, `messages` from the config, the library catalog (exact locale, base language, fallback).

**Variadic field arguments:** `field.x(binding, { onBlur }, condition && extra)` is merged from left to right. Handlers
are chained (the library first), refs combined, everything else overrides. `false`, `null` and `undefined` are ignored.

**Submit:** `submit(data, ctx)` gets the parsed, typed data. `ctx.submitter` for several buttons, `ctx.setErrors()` or
returning `{ fieldErrors, formError }` for server errors (keys or texts), `ctx.reset()`. If `submit` throws, `formError`
shows a generic message.

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

More options: `defaultValueProp`, `blurProp`, `errorProp`, `labelProp`.

## Open points

- `reset()` resets native inputs and controlled fields, but not uncontrolled third-party components (their internal
  state stays). The solution is still open.
- Bindings are not yet part of the return type of `field.x()` (e.g. `selected` instead of `defaultValue`), the type is
  loose there.
- Arrays and dynamic field lists are deliberately not supported yet.
- The catalogs other than de and en should be proofread by native speakers.
