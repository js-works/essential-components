import './login.css';
import {
  Alert,
  Anchor,
  Button,
  Divider,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactElement, ReactNode } from 'react';
import type * as Spec from './api';
import { useLang } from './page';
import { textsFor } from './texts';

export { LoginScreen };

type View = 'login' | 'forgot' | 'register';

// The login screen: a card in the middle of its element (which it fills), with the logo, the app's title and subtitle,
// and one of three views. A Mantine component: it needs a `MantineProvider` above it (`mountLoginScreen()` brings its
// own).
//
// - Sign in: the username and the password, the button. With `onForgotPassword`: the link "Forgot password?" under the
//   password; with `onRegister`: "Not yet registered? Create an account" in the footer.
// - Providers (`providers` and `onProvider`, e.g. OIDC or SSO): full width buttons "Continue with …" below the form, a
//   line "or" between the form and them. The host does the actual sign in (a redirect to the identity provider, or a
//   popup) in `onProvider(id)`. While it runs: the button's spinner, the other buttons and the form are locked. With
//   `passwordLogin={false}`: only the providers (no form, no "Forgot password?", no "Create an account").
// - The footer (below a line): the other views' way back or on: "Not yet registered? Create an account" on the sign in
//   view, "Back to sign in" on the others, in the same place and style.
// - Reset password (`onForgotPassword`): the username or the email, "Send instructions". After it succeeded, the
//   answer is always the same message (it must not tell whether an account exists), and the form is gone.
// - Register (`onRegister`): username, email, and the password with its repetition side by side. After it succeeded, the sign in view again,
//   with a note that the account exists now.
// - Every submit checks the fields first ("Required" at the empty ones), then calls the host's function; while its
//   promise is pending, the button shows a spinner and the fields are read-only. A rejected promise (or a thrown error)
//   shows its message in a red alert above the button (else a text of the screen).
// - Texts in English and German, by `<html lang>`; each can be replaced (`texts`).
function LoginScreen(props: Spec.Props): ReactElement {
  const { title, subtitle, logo, hint, texts: custom } = props;
  const texts = { ...textsFor(useLang()), ...custom };
  const [view, setView] = useState<View>('login');
  const [notice, setNotice] = useState<string | undefined>();
  const show = (next: View, message?: string) => {
    setNotice(message);
    setView(next);
  };
  const passwordLogin = props.passwordLogin !== false;
  const providers = props.onProvider === undefined ? [] : props.providers ?? [];
  const [ssoBusy, setSsoBusy] = useState(false);
  const heading = view === 'login' ? texts.heading : view === 'forgot' ? texts.forgotHeading : texts.registerHeading;
  const footer = view !== 'login'
    ? <Anchor component="button" type="button" size="sm" onClick={() => show('login')}>{texts.back}</Anchor>
    : props.onRegister === undefined || !passwordLogin
    ? null
    : (
      <Text size="sm">
        {texts.registerPrompt}{' '}
        <Anchor component="button" type="button" size="sm" onClick={() => show('register')}>
          {texts.registerLink}
        </Anchor>
      </Text>
    );

  return (
    <div className="app-login__screen">
      <Paper component="main" className="app-login__card">
        <Stack gap="md">
          <div className="app-login__brand">
            {logo === undefined ? null : <span className="app-login__logo" aria-hidden>{markup(logo)}</span>}
            <div>
              <Title order={1} className="app-login__title">{title}</Title>
              {subtitle === undefined ? null : <Text size="xs" c="dimmed">{subtitle}</Text>}
            </div>
          </div>
          <Title order={2} className="app-login__heading">{heading}</Title>
          {notice === undefined ? null : <Alert color="green" variant="light" role="status">{notice}</Alert>}
          {view === 'login' && passwordLogin && (
            <LoginForm
              texts={texts}
              locked={ssoBusy}
              onLogin={props.onLogin}
              onForgot={props.onForgotPassword === undefined ? undefined : () => show('forgot')}
            />
          )}
          {view === 'login' && providers.length > 0 && passwordLogin && (
            <Divider label={texts.or} labelPosition="center" />
          )}
          {view === 'login' && providers.length > 0 && props.onProvider !== undefined && (
            <Providers texts={texts} providers={providers} onProvider={props.onProvider} onBusy={setSsoBusy} />
          )}
          {view === 'forgot' && props.onForgotPassword !== undefined && (
            <ForgotForm
              texts={texts}
              onForgotPassword={props.onForgotPassword}
            />
          )}
          {view === 'register' && props.onRegister !== undefined && (
            <RegisterForm
              texts={texts}
              onRegister={props.onRegister}
              onDone={() => show('login', texts.registerDone)}
            />
          )}
          {footer === null ? null : (
            <>
              <Divider />
              <div className="app-login__footer">{footer}</div>
            </>
          )}
        </Stack>
      </Paper>
      {hint === undefined ? null : <Text size="xs" c="dimmed" className="app-login__hint">{hint}</Text>}
    </div>
  );
}

// A logo as a string is markup (e.g. an SVG from a host without React), drawn in the accent color (`currentColor`);
// anything else is rendered as it is.
function markup(content: ReactNode | string): ReactNode {
  return typeof content === 'string' ? <span dangerouslySetInnerHTML={{ __html: content }} /> : content;
}

// The host's function of a form, run once at a time: `busy` while its promise is pending, `error` when it rejected
// (the message of the error, else `failed`). `run()` is true when it succeeded.
function useAction(failed: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const run = async (action: () => void | Promise<void>): Promise<boolean> => {
    if (busy) {
      return false;
    }

    setBusy(true);
    setError(undefined);

    try {
      await action();

      return true;
    } catch (reason) {
      if (mounted.current) {
        setError(reason instanceof Error && reason.message !== '' ? reason.message : failed);
      }

      return false;
    } finally {
      if (mounted.current) {
        setBusy(false);
      }
    }
  };

  return { busy, error, run };
}

type FormProps = { texts: Spec.Texts };

function LoginForm(
  { texts, locked, onLogin, onForgot }: FormProps & {
    locked: boolean;
    onLogin: Spec.Props['onLogin'];
    onForgot: (() => void) | undefined;
  },
): ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [missing, setMissing] = useState<{ username?: boolean; password?: boolean }>({});
  const { busy, error, run } = useAction(texts.failed);
  const passwordRef = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const next = { username: username.trim() === '', password: password === '' };

    setMissing(next);

    if (next.username || next.password) {
      return;
    }

    if (!await run(() => onLogin({ username: username.trim(), password }))) {
      requestAnimationFrame(() => passwordRef.current?.select());
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <Stack gap="md">
        <TextInput
          label={texts.username}
          name="username"
          autoComplete="username"
          autoFocus
          readOnly={busy || locked}
          value={username}
          error={missing.username ? texts.required : undefined}
          onChange={(event) => setUsername(event.currentTarget.value)}
        />
        <div>
          <PasswordInput
            ref={passwordRef}
            label={texts.password}
            name="password"
            autoComplete="current-password"
            readOnly={busy || locked}
            value={password}
            error={missing.password ? texts.required : undefined}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          {onForgot === undefined
            ? null
            : (
              <Anchor component="button" type="button" size="sm" className="app-login__forgot" onClick={onForgot}>
                {texts.forgotLink}
              </Anchor>
            )}
        </div>
        {error === undefined ? null : <Alert color="red" variant="light" role="alert">{error}</Alert>}
        <Button type="submit" fullWidth loading={busy} disabled={locked}>{texts.submit}</Button>
      </Stack>
    </form>
  );
}

// The provider buttons: one host function at a time (`onProvider(id)`); the clicked button shows the spinner, the
// others are locked (`onBusy` locks the form too). A rejected promise shows its message.
function Providers(
  { texts, providers, onProvider, onBusy }: FormProps & {
    providers: readonly Spec.Provider[];
    onProvider: NonNullable<Spec.Props['onProvider']>;
    onBusy: (busy: boolean) => void;
  },
): ReactElement {
  const { busy, error, run } = useAction(texts.providerFailed);
  const [active, setActive] = useState<string | undefined>();

  const choose = async (id: string) => {
    setActive(id);
    onBusy(true);
    await run(() => onProvider(id));
    onBusy(false);
  };

  return (
    <Stack gap="xs">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="default"
          fullWidth
          loading={busy && active === provider.id}
          disabled={busy && active !== provider.id}
          leftSection={provider.icon === undefined
            ? undefined
            : <span className="app-login__provider-icon" aria-hidden>{markup(provider.icon)}</span>}
          onClick={() => void choose(provider.id)}
        >
          {texts.continueWith.replace('{provider}', provider.label)}
        </Button>
      ))}
      {error === undefined ? null : <Alert color="red" variant="light" role="alert">{error}</Alert>}
    </Stack>
  );
}

function ForgotForm(
  { texts, onForgotPassword }: FormProps & {
    onForgotPassword: NonNullable<Spec.Props['onForgotPassword']>;
  },
): ReactElement {
  const [account, setAccount] = useState('');
  const [missing, setMissing] = useState(false);
  const [done, setDone] = useState(false);
  const { busy, error, run } = useAction(texts.failed);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMissing(account.trim() === '');

    if (account.trim() !== '' && await run(() => onForgotPassword({ account: account.trim() }))) {
      setDone(true);
    }
  };

  return (
    <Stack gap="md">
      {done
        ? <Alert color="green" variant="light" role="status">{texts.forgotDone}</Alert>
        : (
          <form onSubmit={(event) => void submit(event)} noValidate>
            <Stack gap="md">
              <Text size="sm" c="dimmed">{texts.forgotIntro}</Text>
              <TextInput
                label={texts.account}
                name="account"
                autoComplete="username"
                autoFocus
                readOnly={busy}
                value={account}
                error={missing ? texts.required : undefined}
                onChange={(event) => setAccount(event.currentTarget.value)}
              />
              {error === undefined ? null : <Alert color="red" variant="light" role="alert">{error}</Alert>}
              <Button type="submit" fullWidth loading={busy}>{texts.forgotSubmit}</Button>
            </Stack>
          </form>
        )}
    </Stack>
  );
}

function RegisterForm(
  { texts, onRegister, onDone }: FormProps & {
    onRegister: NonNullable<Spec.Props['onRegister']>;
    onDone: () => void;
  },
): ReactElement {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  // The kind of each problem, not its text: it follows a change of the page's language.
  const [problems, setProblems] = useState<
    Partial<Record<'username' | 'email' | 'password' | 'repeat', 'required' | 'invalidEmail' | 'mismatch'>>
  >({});
  const { busy, error, run } = useAction(texts.failed);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const next: typeof problems = {};

    if (username.trim() === '') {
      next.username = 'required';
    }

    if (email.trim() === '') {
      next.email = 'required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'invalidEmail';
    }

    if (password === '') {
      next.password = 'required';
    }

    if (repeat === '') {
      next.repeat = 'required';
    } else if (repeat !== password) {
      next.repeat = 'mismatch';
    }

    setProblems(next);

    if (
      Object.keys(next).length === 0
      && await run(() => onRegister({ username: username.trim(), email: email.trim(), password }))
    ) {
      onDone();
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      <Stack gap="md">
        <TextInput
          label={texts.username}
          name="username"
          autoComplete="username"
          autoFocus
          readOnly={busy}
          value={username}
          error={problems.username && texts[problems.username]}
          onChange={(event) => setUsername(event.currentTarget.value)}
        />
        <TextInput
          label={texts.email}
          name="email"
          type="email"
          autoComplete="email"
          readOnly={busy}
          value={email}
          error={problems.email && texts[problems.email]}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <SimpleGrid cols={2} spacing="sm">
          <PasswordInput
            label={texts.password}
            name="new-password"
            autoComplete="new-password"
            readOnly={busy}
            value={password}
            error={problems.password && texts[problems.password]}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <PasswordInput
            label={texts.passwordRepeat}
            name="new-password-repeat"
            autoComplete="new-password"
            readOnly={busy}
            value={repeat}
            error={problems.repeat && texts[problems.repeat]}
            onChange={(event) => setRepeat(event.currentTarget.value)}
          />
        </SimpleGrid>
        {error === undefined ? null : <Alert color="red" variant="light" role="alert">{error}</Alert>}
        <Button type="submit" fullWidth loading={busy}>{texts.registerSubmit}</Button>
      </Stack>
    </form>
  );
}
