import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, useSyncExternalStore } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { binding, defineUseForm, formMeta } from './index';

/* A minimal locale store as a stand-in for the app adapter */
let currentLocale = 'de';
const listeners = new Set<() => void>();
const setLocale = (l: string) => {
  currentLocale = l;
  listeners.forEach((fn) => fn());
};
const labels: Record<string, Record<string, string>> = {
  de: { 'signup.email': 'E-Mail', 'signup.age': 'Alter' },
  en: { 'signup.email': 'Email', 'signup.age': 'Age' },
};

const useForm = defineUseForm({
  i18n: {
    useLocale: () => useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), () => currentLocale),
    translate: (key, _p, locale) => labels[locale]?.[key],
  },
  props: { label: 'label', error: 'errorText' },
});

/* A typical field component with label + errorText */
function TextField({ label, errorText, ...rest }: { label: string; errorText?: string } & Record<string, any>) {
  return (
    <div>
      <label htmlFor={rest.id}>{label}</label>
      <input {...rest} />
      {errorText && <p role="alert">{errorText}</p>}
    </div>
  );
}

const schema = z.object({
  email: z.email(),
  age: z.number().int().min(18).max(120),
  nickname: z.string().optional(),
  newsletter: z.boolean().default(false),
});

function Signup({ onData }: { onData: (d: unknown) => void }) {
  const { form, field, submitting, valid } = useForm(schema, {
    labels: 'signup',
    submit: (data) => onData(data),
  });
  return (
    <form {...form()}>
      <TextField {...field.email()} />
      <TextField {...field.age()} />
      <TextField {...field.nickname()} />
      <TextField type="checkbox" {...field.newsletter()} />
      <span data-testid="valid">{String(valid)}</span>
      <button type="submit" disabled={submitting}>Send</button>
    </form>
  );
}

describe('defineUseForm', () => {
  it('derives labels, required and constraints', () => {
    setLocale('de');
    render(<Signup onData={() => {}} />);
    const email = screen.getByLabelText('E-Mail');
    expect(email).toHaveProperty('required', true);
    expect(screen.getByLabelText('Alter')).toHaveProperty('min', '18');
    expect(screen.getByLabelText('Nickname')).toHaveProperty('required', false); // humanized
  });

  it('shows errors only after blur, then live', async () => {
    setLocale('de');
    const user = userEvent.setup();
    render(<Signup onData={() => {}} />);
    const email = screen.getByLabelText('E-Mail');
    await user.type(email, 'kaputt');
    expect(screen.queryByRole('alert')).toBeNull();
    await user.tab();
    expect(screen.getByRole('alert').textContent).toBe('Bitte geben Sie eine gültige E-Mail-Adresse an.');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.matches(':invalid')).toBe(true);
    await user.clear(email);
    await user.type(email, 'a@b.de');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('combines min and max into \'between\' and translates again when the locale changes', async () => {
    setLocale('de');
    const user = userEvent.setup();
    render(<Signup onData={() => {}} />);
    await user.type(screen.getByLabelText('Alter'), '5');
    await user.tab();
    expect(screen.getByRole('alert').textContent).toBe('Der Wert muss zwischen 18 und 120 liegen.');
    act(() => setLocale('en'));
    expect(screen.getByRole('alert').textContent).toBe('The value must be between 18 and 120.');
    expect(screen.getByLabelText('Age')).toBeTruthy();
  });

  it('validates everything on submit, focuses the first field and passes the parsed data', async () => {
    setLocale('de');
    const user = userEvent.setup();
    const onData = vi.fn();
    render(<Signup onData={onData} />);
    await user.click(screen.getByText('Send'));
    expect(onData).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').map((e) => e.textContent)).toEqual([
      'Bitte füllen Sie dieses Feld aus.',
      'Bitte füllen Sie dieses Feld aus.',
    ]);
    expect(document.activeElement).toBe(screen.getByLabelText('E-Mail'));

    await user.type(screen.getByLabelText('E-Mail'), 'a@b.de');
    await user.type(screen.getByLabelText('Alter'), '42');
    expect(screen.getByTestId('valid').textContent).toBe('true');
    await user.click(screen.getByText('Send'));
    expect(onData).toHaveBeenCalledWith({ email: 'a@b.de', age: 42, newsletter: false });
  });

  it('chains handlers from several arguments instead of overriding them', async () => {
    setLocale('de');
    const user = userEvent.setup();
    const a = vi.fn();
    const b = vi.fn();
    function F() {
      const { form, field } = useForm(z.object({ name: z.string().min(3) }), { submit: () => {} });
      return (
        <form {...form()}>
          <TextField {...field.name({ onBlur: a }, { onBlur: b, label: 'Name' })} />
        </form>
      );
    }
    render(<F />);
    await user.type(screen.getByLabelText('Name'), 'ab');
    await user.tab();
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert').textContent).toBe('Bitte geben Sie mindestens 3 Zeichen ein.');
  });

  it('supports bindings for components with their own conventions', async () => {
    setLocale('en');
    const fancyDate = binding({
      valueProp: 'selected',
      changeProp: 'onPick',
      errorProp: 'problem',
      fromComponent: (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null),
      toComponent: (v) => (typeof v === 'string' ? new Date(v) : null),
    });
    function Picker(p: { label: string; selected: Date | null; onPick(d: Date | null): void; problem?: string }) {
      return (
        <div>
          <button type="button" onClick={() => p.onPick(new Date('2026-10-01'))}>{p.label}</button>
          <span data-testid="sel">{p.selected ? p.selected.toISOString().slice(0, 10) : '-'}</span>
          {p.problem && <p role="alert">{p.problem}</p>}
        </div>
      );
    }
    const onData = vi.fn();
    function F() {
      const { form, field } = useForm(z.object({ dob: z.iso.date() }), { submit: onData });
      return (
        <form {...form()}>
          <Picker {...(field.dob(fancyDate, { label: 'Birthday' }) as any)} />
          <button type="submit">Go</button>
        </form>
      );
    }
    const user = userEvent.setup();
    render(<F />);
    await user.click(screen.getByText('Go'));
    expect(screen.getByRole('alert').textContent).toBe('Please fill out this field.');
    await user.click(screen.getByText('Birthday'));
    expect(screen.getByTestId('sel').textContent).toBe('2026-10-01');
    expect(screen.queryByRole('alert')).toBeNull();
    await user.click(screen.getByText('Go'));
    expect(onData.mock.calls[0]?.[0]).toEqual({ dob: '2026-10-01' });
  });

  it('shows server errors as translatable keys and tells submit buttons apart', async () => {
    setLocale('de');
    const user = userEvent.setup();
    const submitters: (string | undefined)[] = [];
    function F() {
      const { form, field } = useForm(z.object({ email: z.email() }), {
        submit: (_d, ctx) => {
          submitters.push((ctx.submitter as HTMLButtonElement | null)?.value);
          return { fieldErrors: { email: 'This address is already taken.' } };
        },
      });
      return (
        <form {...form()}>
          <TextField {...field.email({ label: 'E-Mail' })} />
          <button type="submit" name="action" value="next">Next</button>
        </form>
      );
    }
    render(<F />);
    await user.type(screen.getByLabelText('E-Mail'), 'a@b.de');
    await user.click(screen.getByText('Next'));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'This address is already taken.');
    expect(submitters).toEqual(['next']);
    await user.type(screen.getByLabelText('E-Mail'), 'x');
    expect(screen.queryByRole('alert')).toBeNull(); // the server error disappears on change
  });

  it('respects explicit schema messages and formMeta labels', async () => {
    setLocale('de');
    const user = userEvent.setup();
    function F() {
      const { form, field } = useForm(
        z.object({ code: formMeta(z.string().regex(/^\d{5}$/, 'Five digits, please.'), { labelKey: 'x.code' }) }),
        { submit: () => {} },
      );
      return (
        <form {...form()}>
          <TextField {...field.code()} />
        </form>
      );
    }
    render(<F />);
    const input = screen.getByLabelText('Code'); // x.code is not translated -> humanized
    await user.type(input, '12');
    fireEvent.blur(input);
    expect(screen.getByRole('alert').textContent).toBe('Five digits, please.');
  });

  it('provides messages in all bundled languages with correct plural forms', async () => {
    const user = userEvent.setup();
    const results: Record<string, string> = {};
    for (const locale of ['ru', 'fr', 'zh-TW', 'zh', 'de-AT', 'xx']) {
      setLocale(locale);
      function F() {
        const { form, field } = useForm(z.object({ s: z.string().min(2) }), { submit: () => {} });
        const [n] = useState(0);
        return (
          <form {...form()} key={n}>
            <TextField {...field.s({ label: 'S' })} />
          </form>
        );
      }
      const { unmount } = render(<F />);
      await user.type(screen.getByLabelText('S'), 'a');
      await user.tab();
      results[locale] = screen.getByRole('alert').textContent!;
      unmount();
    }
    expect(results).toEqual({
      ru: 'Пожалуйста, введите не менее 2 символов.',
      fr: 'Veuillez saisir au moins 2 caractères.',
      'zh-TW': '請至少輸入 2 個字元。',
      zh: '请至少输入 2 个字符。',
      'de-AT': 'Bitte geben Sie mindestens 2 Zeichen ein.',
      xx: 'Please enter at least 2 characters.',
    });
  });
});
