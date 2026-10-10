import { useState } from 'react';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { CheckboxField, SelectField, TextField } from './fields';
import { text, useLocale } from './i18n';
import { useForm } from './useForm';

export { FormDemo };

// The schema is the single source of truth: types, required, bounds, defaults and the messages' parameters all come
// from it. The two keys (`demo.passwordsDiffer`) are the app's own messages, translated by the demo's adapter.
const schema = z
  .object({
    name: z.string().min(2).max(40),
    email: z.email(),
    age: z.number().int().min(18).max(120),
    password: z.string().min(8),
    confirm: z.string(),
    country: z.enum(['de', 'at', 'ch']),
    newsletter: z.boolean().default(false),
    terms: z.literal(true),
  })
  .refine((data) => data.password === data.confirm, { path: ['confirm'], message: 'signup.passwordsDiffer' });

// A made-up server: it knows one email, and fails for one name.
const signUp = async (data: z.output<typeof schema>): Promise<{ taken: boolean }> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (data.name.toLowerCase() === 'boom') {
    throw new globalThis.Error('The server is down.');
  }

  return { taken: data.email.toLowerCase() === 'taken@example.com' };
};

function FormDemo(): ReactElement {
  useLocale();

  const [sent, setSent] = useState<string>();
  const { form, field, submitting, valid, formError, reset } = useForm(schema, {
    labels: 'signup',
    submit: async (data) => {
      const { taken } = await signUp(data);

      if (taken) {
        // Server errors go to the fields (a key of the app or a text), like errors of the schema.
        return { fieldErrors: { email: 'signup.taken' } };
      }

      const { confirm: _confirm, ...shown } = data;

      setSent(JSON.stringify(shown, null, 2));
      reset();

      return undefined;
    },
  });

  return (
    <div className="ui-columns">
      <form className="ui-stack" {...form()}>
        <p>{text('demo.intro')}</p>
        <TextField {...field.name()} autoComplete="off" />
        <TextField {...field.email()} type="email" autoComplete="off" />
        <TextField {...field.age()} type="number" />
        {/* validateOn: 'change': this field shows its message while typing, the others after the first blur. */}
        <TextField {...field.password({ validateOn: 'change' })} type="password" autoComplete="new-password" />
        <TextField {...field.confirm()} type="password" autoComplete="new-password" />
        <SelectField {...field.country()}>
          <option value="">{text('demo.choose')}</option>
          <option value="de">{text('signup.country.de')}</option>
          <option value="at">{text('signup.country.at')}</option>
          <option value="ch">{text('signup.country.ch')}</option>
        </SelectField>
        <CheckboxField {...field.newsletter()} />
        <CheckboxField {...field.terms()} />
        {formError !== undefined && <p className="fv-error" role="alert">{formError}</p>}
        <div className="ui-toolbar">
          <button className="ui-button" type="submit" disabled={submitting}>
            {submitting ? text('demo.sending') : text('demo.submit')}
          </button>
          <button className="ui-button" type="button" onClick={() => reset()}>{text('demo.reset')}</button>
        </div>
        <p className="ui-note">{text('demo.hint')}</p>
      </form>
      <section className="ui-stack">
        <h2 className="ui-heading">{text('demo.state')}</h2>
        <output className="ui-result">
          {text('demo.valid')}: {String(valid)} · {text('demo.submitting')}: {String(submitting)}
        </output>
        <h2 className="ui-heading">{text('demo.sent')}</h2>
        <output className="ui-result fv-sent">{sent ?? text('demo.nothing')}</output>
      </section>
    </div>
  );
}
