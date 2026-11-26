// Mantine's layered styles (`@layer mantine`): below every unlayered rule of the page, so its global rules do not
// restyle the other demos.
import '@mantine/core/styles.layer.css';
import '@local/micro-app/styles.css';
import './mantine-login.css';
import { Alert, Anchor, MantineProvider, PasswordInput, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import type { ReactNode } from 'react';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { z } from 'zod';

import type { LoginElement } from '@local/cockpit';
import { createLook, defineForm, MantineScope, usePageScheme } from '@local/micro-app';

import type { LoginContent } from '../../packages/universal/cockpit/src/demo/login.js';
import { DEMO_SERVER, PROVIDERS } from '../../packages/universal/cockpit/src/demo/login.js';
import { i18n, useText } from './i18n.js';

export { mantineContent };

type View = 'login' | 'forgot' | 'register';

// Mantine's variables and color scheme are set on the login element itself (this class): its children are its slots'
// content, so no element of ours may sit between them.
const SCOPE_CLASS = 'login-mantine';

const LOOK = createLook({
  Scope: ({ children }: { children: ReactNode }) => <MantineScope className={SCOPE_CLASS}>{children}</MantineScope>,
  tokens: { accent: '--app-accent-color' },
});

// The apps' form hook: form-validation, its messages from the i18next instance above (`I18nextProvider`), the message
// of an invalid field as a popover (`FieldError`, `@local/micro-app`'s styles).
const useForm = defineForm();

const loginSchema = z.object({ username: z.string().trim().min(1), password: z.string().min(1) });

const forgotSchema = z.object({ account: z.string().trim().min(1) });

const registerSchema = z
  .object({
    username: z.string().trim().min(1),
    email: z.email(),
    password: z.string().min(1),
    repeat: z.string().min(1),
  })
  .refine((data) => data.password === data.repeat, { path: ['repeat'], message: 'mismatch' });

// No suggestions of the browser in the inputs (`autoComplete="off"`: a demo, any input signs in; a real login keeps
// `username` and `current-password`, which password managers need).
//
// The root page's login content: Mantine's inputs and buttons in the login element's slots, rendered by React into the
// element (a fragment: its children are the element's), the checks by form-validation, the texts by i18next (English
// and German, the page's language). The made-up server is the demos' (`DEMO_SERVER`).
const mantineContent: LoginContent = (login, signIn) => {
  const root = createRoot(login);

  login.classList.add(SCOPE_CLASS);
  root.render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <Frame login={login} signIn={signIn} />
      </I18nextProvider>
    </StrictMode>,
  );

  return () => root.unmount();
};

type FrameProps = {
  login: LoginElement;
  signIn: () => void;
};

// Mantine follows the page's color scheme, set on the element (the scope) as Mantine's attribute.
function Frame({ login, signIn }: FrameProps) {
  const scheme = usePageScheme();

  useEffect(() => {
    login.dataset['mantineColorScheme'] = scheme;
  }, [login, scheme]);

  return (
    <MantineProvider
      theme={LOOK.theme}
      cssVariablesResolver={LOOK.cssVariablesResolver}
      forceColorScheme={scheme}
      cssVariablesSelector={`.${SCOPE_CLASS}`}
      deduplicateCssVariables={false}
      getRootElement={() => undefined}
    >
      <LoginViews login={login} signIn={signIn} />
    </MantineProvider>
  );
}

function LoginViews({ login, signIn }: FrameProps) {
  const t = useText();
  const [view, setView] = useState<View>('login');
  const [note, setNote] = useState<string>();

  const show = (next: View, message?: string) => {
    setNote(message);
    setView(next);
  };

  // The element's heading (the view's), and its provider buttons on the sign in view only.
  useEffect(() => {
    login.heading = t(view === 'login' ? 'heading' : view === 'forgot' ? 'forgotHeading' : 'registerHeading');
    login.providers = view === 'login' ? PROVIDERS : [];
  });

  return (
    <>
      <Stack gap="md">
        {note === undefined ? null : <Alert color="green" variant="light" role="status">{note}</Alert>}
        {view === 'login' && <LoginForm login={login} signIn={signIn} onForgot={() => show('forgot')} />}
        {view === 'forgot' && <ForgotForm login={login} />}
        {view === 'register' && <RegisterForm login={login} onDone={() => show('login', t('registerDone'))} />}
      </Stack>
      <Text slot="footer" size="sm" component="span">
        {view === 'login'
          ? (
            <>
              {t('registerPrompt')}{' '}
              <Anchor component="button" type="button" size="sm" onClick={() => show('register')}>
                {t('registerLink')}
              </Anchor>
            </>
          )
          : <Anchor component="button" type="button" size="sm" onClick={() => show('login')}>{t('back')}</Anchor>}
      </Text>
      <Text slot="hint" size="xs" c="dimmed" component="span">{t('hint')}</Text>
    </>
  );
}

// A server's refusal as the form's error: its message, else `fallback`.
async function refusal(call: () => Promise<void>, fallback: string): Promise<{ formError: string } | undefined> {
  try {
    await call();

    return undefined;
  } catch (reason) {
    return { formError: reason instanceof Error && reason.message !== '' ? reason.message : fallback };
  }
}

// The element's submit button (it submits the form, Enter too): the view's label (none: no button), its spinner while
// the form's handler runs.
function useSubmitButton(login: LoginElement, label: string, submitting: boolean) {
  useEffect(() => {
    login.submitLabel = label;
    login.submitting = submitting;
  });
}

type LoginFormProps = {
  login: LoginElement;
  signIn: () => void;
  onForgot: () => void;
};

function LoginForm({ login, signIn, onForgot }: LoginFormProps) {
  const t = useText();
  const { form, field, submitting, formError } = useForm(loginSchema, {
    submit: async ({ password }) => {
      const result = await refusal(() => DEMO_SERVER.signIn(password), t('failed'));

      if (result === undefined) {
        signIn();
      }

      return result;
    },
  });

  useSubmitButton(login, t('submit'), submitting);

  return (
    <form {...form()}>
      <Stack gap="md">
        <TextInput autoFocus autoComplete="off" readOnly={submitting} {...field.username({ label: t('username') })} />
        <Stack gap={4}>
          <PasswordInput autoComplete="off" readOnly={submitting} {...field.password({ label: t('password') })} />
          <Anchor component="button" type="button" size="sm" ml="auto" onClick={onForgot}>{t('forgotLink')}</Anchor>
        </Stack>
        {formError === undefined ? null : <Alert color="red" variant="light" role="alert">{formError}</Alert>}
      </Stack>
    </form>
  );
}

function ForgotForm({ login }: { login: LoginElement }) {
  const t = useText();
  const [done, setDone] = useState(false);
  const { form, field, submitting, formError } = useForm(forgotSchema, {
    submit: async () => {
      const result = await refusal(DEMO_SERVER.resetPassword, t('tryAgain'));

      setDone(result === undefined);

      return result;
    },
  });

  useSubmitButton(login, done ? '' : t('forgotSubmit'), submitting);

  if (done) {
    return <Alert color="green" variant="light" role="status">{t('forgotDone')}</Alert>;
  }

  return (
    <form {...form()}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">{t('forgotIntro')}</Text>
        <TextInput autoFocus autoComplete="off" readOnly={submitting} {...field.account({ label: t('account') })} />
        {formError === undefined ? null : <Alert color="red" variant="light" role="alert">{formError}</Alert>}
      </Stack>
    </form>
  );
}

type RegisterFormProps = {
  login: LoginElement;
  onDone: () => void;
};

function RegisterForm({ login, onDone }: RegisterFormProps) {
  const t = useText();
  const { form, field, submitting, formError } = useForm(registerSchema, {
    submit: async ({ username }) => {
      const result = await refusal(() => DEMO_SERVER.register(username), t('tryAgain'));

      if (result === undefined) {
        onDone();
      }

      return result;
    },
  });

  useSubmitButton(login, t('registerSubmit'), submitting);

  return (
    <form {...form()}>
      <Stack gap="md">
        <TextInput autoFocus autoComplete="off" readOnly={submitting} {...field.username({ label: t('username') })} />
        <TextInput type="email" autoComplete="off" readOnly={submitting} {...field.email({ label: t('email') })} />
        <SimpleGrid cols={2} spacing="sm">
          <PasswordInput autoComplete="off" readOnly={submitting} {...field.password({ label: t('password') })} />
          <PasswordInput autoComplete="off" readOnly={submitting} {...field.repeat({ label: t('passwordRepeat') })} />
        </SimpleGrid>
        {formError === undefined ? null : <Alert color="red" variant="light" role="alert">{formError}</Alert>}
      </Stack>
    </form>
  );
}
