import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createContext, useContext, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { binding, defineUseForm, formMeta, type I18nAdapter, type I18nConfig } from './index';

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

/* The app adapter: labels from the table above, everything else as the library has it */
const adapter: I18nAdapter = {
  currentLocale: () => currentLocale,
  resolveText: (_ns, key, _params, defaultValue) => labels[currentLocale]?.[key] ?? defaultValue,
  onChange: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const useForm = defineUseForm({
  i18n: { type: 'factory', getAdapter: () => adapter },
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

  it('marks a field that turns invalid while typing at once, but shows its message only on blur', async () => {
    setLocale('en');
    const user = userEvent.setup();
    render(<Signup onData={() => {}} />);
    const email = screen.getByLabelText('Email');
    await user.type(email, 'a@b.de');
    await user.tab();
    expect(email.getAttribute('aria-invalid')).toBeNull();

    await user.click(email);
    await user.keyboard('{Backspace}{Backspace}{Backspace}');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.hasAttribute('data-user-invalid')).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();

    await user.tab();
    expect(screen.getByRole('alert').textContent).toBe('Please enter a valid email address.');

    // A visible message stays while typing and goes with a valid value.
    await user.click(email);
    await user.keyboard('x');
    expect(screen.getByRole('alert')).toBeTruthy();
    await user.clear(email);
    await user.type(email, 'a@b.de');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(email.getAttribute('aria-invalid')).toBeNull();
  });

  it('passes `true` to the invalid prop while the message is not visible, or to the error prop if they are one', async () => {
    const seen: unknown[] = [];
    function Probe(props: Record<string, any>) {
      seen.push([props['errorText'], props['invalid'], props['error']]);
      return (
        <input
          name={props['name']}
          id={props['id']}
          ref={props['ref']}
          onChange={props['onChange']}
          onBlur={props['onBlur']}
        />
      );
    }
    const separate = defineUseForm({ props: { label: 'label', error: 'errorText', invalid: 'invalid' } });
    const together = defineUseForm({ props: { label: 'label', error: 'error', invalid: 'error' } });
    for (const use of [separate, together]) {
      seen.length = 0;
      function F() {
        const { form, field } = use(z.object({ code: z.string().min(3) }), { submit: () => {} });
        return (
          <form {...form()}>
            <Probe {...field.code({ label: 'Code' })} />
          </form>
        );
      }
      const user = userEvent.setup();
      const { container, unmount } = render(<F />);
      const input = container.querySelector('input')!;
      await user.type(input, 'abc');
      await user.tab();
      await user.click(input);
      await user.keyboard('{Backspace}');
      expect(seen.at(-1)).toEqual(use === separate ? [undefined, true, undefined] : [undefined, undefined, true]);
      await user.tab();
      const text = use === separate ? (seen.at(-1) as unknown[])[0] : (seen.at(-1) as unknown[])[2];
      expect(typeof text).toBe('string');
      unmount();
    }
  });

  it('requestSubmit validates and submits without a <form> event, and resolves with the outcome', async () => {
    setLocale('en');
    const outcomes: unknown[] = [];
    const seen = new Set<unknown>();
    let fail: 'field' | 'throw' | undefined;
    const submit = vi.fn(async (_data: { age: number }) => {
      if (fail === 'field') return { fieldErrors: { age: 'Too old for us' } };
      if (fail === 'throw') throw new Error('offline');
      return undefined;
    });
    function Owner() {
      const { requestSubmit, field } = useForm(z.object({ age: z.number().min(18) }), { labels: 'signup', submit });
      seen.add(requestSubmit);
      return (
        <div>
          <TextField {...field.age()} />
          <button type="button" onClick={async () => outcomes.push(await requestSubmit())}>OK</button>
        </div>
      );
    }
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<Owner />);
    await user.click(screen.getByText('OK'));
    expect(outcomes.at(-1)).toEqual({ ok: false });
    expect(screen.getByRole('alert').textContent).toBe('Please fill out this field.');
    expect(document.activeElement).toBe(screen.getByLabelText('Age'));

    await user.type(screen.getByLabelText('Age'), '30');
    await user.click(screen.getByText('OK'));
    expect(outcomes.at(-1)).toEqual({ ok: true });
    expect(submit).toHaveBeenLastCalledWith({ age: 30 }, expect.objectContaining({ event: undefined }));

    fail = 'field';
    await user.click(screen.getByText('OK'));
    expect(outcomes.at(-1)).toEqual({ ok: false });
    expect(screen.getByRole('alert').textContent).toBe('Too old for us');

    fail = 'throw';
    await user.click(screen.getByText('OK'));
    expect(outcomes.at(-1)).toEqual({ ok: false, error: expect.any(String) });

    expect(seen.size).toBe(1); // stable across renders
  });

  it('shows the message of a thrown submit through errorMessage, the generic one without it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const schema = z.object({ code: z.string().optional() });
    const submit = async () => {
      throw new Error('Server down');
    };
    const withMessage = defineUseForm({
      errorMessage: (error) => (error instanceof Error ? error.message : undefined),
    });
    const generic = defineUseForm();
    const outcomes: unknown[] = [];
    for (const use of [withMessage, generic]) {
      function F() {
        const { requestSubmit } = use(schema, { submit });
        return <button type="button" onClick={async () => outcomes.push(await requestSubmit())}>OK</button>;
      }
      const { unmount } = render(<F />);
      await userEvent.setup().click(screen.getByText('OK'));
      unmount();
    }
    expect(outcomes).toEqual([{ ok: false, error: 'Server down' }, {
      ok: false,
      error: expect.not.stringMatching('Server down'),
    }]);
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

  it('tells with isDirty() whether a value differs from the initial one', async () => {
    setLocale('de');
    const user = userEvent.setup();
    let isDirty = () => false;
    function F() {
      const form = useForm(z.object({ name: z.string(), note: z.string().optional() }), {
        initial: { name: 'Ann' },
        submit: () => {},
      });
      isDirty = form.isDirty;
      return (
        <form {...form.form()}>
          <TextField {...form.field.name({ label: 'Name' })} />
          <TextField {...form.field.note({ label: 'Note' })} />
        </form>
      );
    }
    render(<F />);
    expect(isDirty()).toBe(false);
    await user.type(screen.getByLabelText('Name'), 'a');
    expect(isDirty()).toBe(true);
    await user.type(screen.getByLabelText('Name'), '{Backspace}');
    expect(isDirty()).toBe(false); // changed back
    await user.type(screen.getByLabelText('Note'), 'x{Backspace}');
    expect(isDirty()).toBe(false); // '' is like the missing initial value
  });

  it('focuses the first field with an error of an async server check', async () => {
    setLocale('de');
    const user = userEvent.setup();
    function F() {
      const { form, field } = useForm(z.object({ name: z.string(), username: z.string() }), {
        submit: async (data) => {
          await new Promise((r) => setTimeout(r, 10));
          if (data.username === 'taken') return { fieldErrors: { username: 'This username is already taken.' } };
        },
      });
      return (
        <form {...form()}>
          <TextField {...field.name({ label: 'Name' })} />
          <TextField {...field.username({ label: 'Username' })} />
          <button type="submit">Send</button>
        </form>
      );
    }
    render(<F />);
    await user.type(screen.getByLabelText('Name'), 'Ann');
    await user.type(screen.getByLabelText('Username'), 'taken');
    await user.click(screen.getByText('Send'));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'This username is already taken.');
    expect(document.activeElement).toBe(screen.getByLabelText('Username'));
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

describe('i18n adapter', () => {
  const ageSchema = z.object({ age: z.number().min(18) });

  function AgeForm({ use }: { use: typeof useForm }) {
    const { form, field } = use(ageSchema, { labels: 'signup', submit: () => {} });
    return (
      <form {...form()}>
        <TextField {...field.age()} />
      </form>
    );
  }

  it('asks the factory once per form, with its <form> element', async () => {
    const getAdapter = vi.fn((_el: HTMLElement) => adapter);
    const use = defineUseForm({ i18n: { type: 'factory', getAdapter }, props: { label: 'label', error: 'errorText' } });
    setLocale('de');
    const { container, rerender } = render(<AgeForm use={use} />);
    rerender(<AgeForm use={use} />);
    expect(screen.getByLabelText('Alter')).toBeTruthy();
    expect(getAdapter).toHaveBeenCalledTimes(1);
    expect(getAdapter).toHaveBeenCalledWith(container.querySelector('form'));
  });

  it('calls the hook on every render, so each form follows its nearest provider', () => {
    const Language = createContext('en');
    const use = defineUseForm({
      i18n: {
        type: 'hook',
        useAdapter: () => {
          const locale = useContext(Language);
          return {
            ...adapter,
            currentLocale: () => locale,
            resolveText: (_n, key, _p, d) => labels[locale]?.[key] ?? d,
          };
        },
      },
      props: { label: 'label', error: 'errorText' },
    });
    render(
      <>
        <AgeForm use={use} />
        <Language value="de">
          <AgeForm use={use} />
        </Language>
      </>,
    );
    expect(screen.getByLabelText('Age')).toBeTruthy();
    expect(screen.getByLabelText('Alter')).toBeTruthy();
  });

  it('passes the namespace, the key, the raw params and the text of the library', async () => {
    const resolveText = vi.fn((_n: string, _k: string, _p: unknown, defaultValue: string) => defaultValue);
    const use = defineUseForm({
      appNamespace: 'myapp',
      i18n: { type: 'hook', useAdapter: () => ({ currentLocale: () => 'en', resolveText }) },
      props: { label: 'label', error: 'errorText' },
    });
    const user = userEvent.setup();
    render(<AgeForm use={use} />);
    await user.type(screen.getByLabelText('Age'), '5');
    await user.tab();
    expect(resolveText).toHaveBeenCalledWith('myapp', 'signup.age', null, 'Age');
    expect(resolveText).toHaveBeenCalledWith(
      'formValidation',
      'number.min',
      { min: 18 },
      screen.getByRole('alert').textContent,
    );
  });

  it('warns about a missing label only without an adapter', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const schemaOf = () => z.object({ title: z.string() });
    function Title({ use, labels }: { use: typeof useForm; labels: string }) {
      const { form, field } = use(schemaOf(), { labels });
      return (
        <form {...form()}>
          <TextField {...field.title()} />
        </form>
      );
    }
    const withAdapter = defineUseForm({
      i18n: { type: 'hook', useAdapter: () => ({ currentLocale: () => 'en', resolveText: (_n, _k, _p, d) => d }) },
      props: { label: 'label', error: 'errorText' },
    });
    const without = defineUseForm({ props: { label: 'label', error: 'errorText' } });
    render(<Title use={withAdapter} labels="adapted" />);
    expect(warn.mock.calls.some((c) => String(c[0]).includes('adapted.title'))).toBe(false);
    render(<Title use={without} labels="plain" />);
    expect(warn.mock.calls.some((c) => String(c[0]).includes('plain.title'))).toBe(true);
    warn.mockRestore();
  });

  it('throws a TypeError for an unknown i18n type (e.g. the old form)', () => {
    const old = { useLocale: () => 'en' } as unknown as I18nConfig;
    expect(() => defineUseForm({ i18n: old })).toThrow(TypeError);
  });
});
