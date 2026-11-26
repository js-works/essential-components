import './login-demo.css';

import type { TemplateResult } from 'lit';
import { html, nothing, render, svg } from 'lit';

import type { LoginElement } from '../main/index.js';
import { createLoginClass } from '../main/index.js';
import { accentColor } from './footer.js';
import { DEMO_I18N } from './i18n.js';

export type { LoginContent };
export { DEMO_SERVER, loginDemo, PROVIDERS, plainContent };

type LoginDemoOptions = {
  title: string;
  subtitle: string;
  // The page's initial accent (the footer's "Accent color", `accentSetting()`).
  accent: string;
  // Where signed out is remembered per browser (`false`).
  storageKey: string;
  // The login's content (the host's): `plainContent` without one.
  content?: LoginContent;
};

// Renders the views into the login element (its children: the host's) and returns what removes them; `signIn` shows
// the cockpit again.
type LoginContent = (login: LoginElement, signIn: () => void) => () => void;

type View = 'login' | 'forgot' | 'register';

const PROVIDERS = [
  {
    id: 'microsoft',
    label: 'Microsoft',
    icon:
      '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8.5" height="8.5" fill="#f25022"/><rect x="12.5" y="3" width="8.5" height="8.5" fill="#7fba00"/><rect x="3" y="12.5" width="8.5" height="8.5" fill="#00a4ef"/><rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#ffb900"/></svg>',
  },
  { id: 'google', label: 'Google', icon: undefined },
  {
    id: 'sso',
    label: 'Company SSO',
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15 19 4M18 5l3 3M15 8l2 2"/></svg>',
  },
] as const;

// Tabler's `eye` and `eye-off` (MIT).
const icon = (paths: ReturnType<typeof svg>) =>
  html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const EYE_ICON = icon(
  svg`<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />`,
);

const EYE_OFF_ICON = icon(
  svg`<path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" />`,
);

const HEADINGS = { login: 'Sign in', forgot: 'Reset password', register: 'Create account' } as const;

// The label of the element's submit button per view.
const SUBMIT_LABELS = { login: 'Sign in', forgot: 'Send instructions', register: 'Register' } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// The made-up server of the demos' login, the same for every content: each answers after a moment, and fails with the
// error's message (empty: the content's own text).
const DEMO_SERVER = {
  signIn: async (password: string) => {
    await wait(500);

    if (password === 'wrong') {
      throw new Error('');
    }
  },
  resetPassword: () => wait(600),
  register: async (username: string) => {
    await wait(600);

    if (username.toLowerCase() === 'taken') {
      throw new Error('This username is already taken.');
    }
  },
  signInWith: async (id: string) => {
    await wait(700);

    if (id === 'google') {
      throw new Error('');
    }
  },
};

// The package demo's content: plain inputs in the design language (`login-demo.css`), rendered by Lit into the element,
// with the checks, the pending states and the errors. English only.
function plainContent(login: LoginElement, signIn: () => void): () => void {
  let view: View = 'login';
  // A call to the server runs.
  let busy = false;
  let error: { message: string } | undefined;
  let problems: Partial<Record<string, string>> = {};
  let note: string | undefined;
  let resetDone = false;
  // The password inputs shown as text (the eye), by name.
  const revealed = new Set<string>();
  const show = (next: View, message?: string) => {
    view = next;
    note = message;
    error = undefined;
    problems = {};
    resetDone = false;
    revealed.clear();
    update();
    login.querySelector('input')?.focus();
  };

  // A host function, one at a time; true when it succeeded.
  const run = async (action: () => Promise<void>, failed: string): Promise<boolean> => {
    if (busy) {
      return false;
    }

    busy = true;
    error = undefined;
    update();

    try {
      await action();

      return true;
    } catch (reason) {
      const message = reason instanceof Error && reason.message !== '' ? reason.message : failed;

      error = { message };

      return false;
    } finally {
      busy = false;
      update();
    }
  };

  // The fields' problems; true when there are none.
  const check = (next: Partial<Record<string, string>>) => {
    problems = Object.fromEntries(Object.entries(next).filter(([, problem]) => problem !== undefined));
    update();

    return Object.keys(problems).length === 0;
  };

  const required = (value: string) => value === '' ? 'Required' : undefined;

  const submitLogin = async (event: SubmitEvent) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget as HTMLFormElement);
    const username = String(data.get('username')).trim();
    const password = String(data.get('password'));

    if (!check({ username: required(username), password: required(password) })) {
      return;
    }

    const ok = await run(() => DEMO_SERVER.signIn(password), 'Invalid username or password.');

    if (ok) {
      signIn();
    } else {
      login.querySelector<HTMLInputElement>('input[name="password"]')?.select();
    }
  };

  const submitForgot = async (event: SubmitEvent) => {
    event.preventDefault();

    const account = String(new FormData(event.currentTarget as HTMLFormElement).get('account')).trim();

    if (check({ account: required(account) }) && await run(DEMO_SERVER.resetPassword, 'Please try again.')) {
      resetDone = true;
      update();
    }
  };

  const submitRegister = async (event: SubmitEvent) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget as HTMLFormElement);
    const username = String(data.get('username')).trim();
    const email = String(data.get('email')).trim();
    const password = String(data.get('new-password'));
    const repeat = String(data.get('repeat'));
    const valid = check({
      username: required(username),
      email: required(email) ?? (EMAIL.test(email) ? undefined : 'Enter a valid email address.'),
      'new-password': required(password),
      repeat: required(repeat) ?? (repeat === password ? undefined : 'The passwords do not match.'),
    });

    if (!valid) {
      return;
    }

    const ok = await run(() => DEMO_SERVER.register(username), 'Please try again.');

    if (ok) {
      show('login', 'Your account has been created. You can sign in now.');
    }
  };

  // No suggestions of the browser in the inputs (`autocomplete="off"`: a demo, any input signs in; a real login keeps
  // `username` and `current-password`, which password managers need).
  const field = (name: string, label: string, attributes: { type?: string } = {}) => {
    const id = `login-demo-${name}`;
    const password = attributes.type === 'password';
    const input = html`
      <input
        class="login-demo__input"
        id=${id}
        name=${name}
        type=${password && revealed.has(name) ? 'text' : attributes.type ?? 'text'}
        autocomplete="off"
        ?readonly=${busy}
        aria-invalid=${problems[name] === undefined ? 'false' : 'true'}
      />
    `;

    return html`
      <div class="login-demo__field">
        <label class="login-demo__label" for=${id}>${label}</label>
        ${password ? html`<div class="login-demo__secret">${input}${eye(name, id)}</div>` : input}
        ${problems[name] === undefined ? nothing : html`<span class="login-demo__problem">${problems[name]}</span>`}
      </div>
    `;
  };

  // The eye of a password input: shows or hides the password.
  const eye = (name: string, id: string) =>
    html`
      <button
        class="login-demo__eye"
        type="button"
        aria-label="Show password"
        aria-pressed=${revealed.has(name) ? 'true' : 'false'}
        aria-controls=${id}
        @click=${() => {
      if (!revealed.delete(name)) {
        revealed.add(name);
      }

      update();
    }}
      >
        ${revealed.has(name) ? EYE_OFF_ICON : EYE_ICON}
      </button>
    `;

  const alert = () =>
    error !== undefined
      ? html`<p class="login-demo__alert" data-tone="danger" role="alert">${error.message}</p>`
      : nothing;

  const link = (label: string, onClick: () => void) =>
    html`<button class="login-demo__link" type="button" @click=${onClick}>${label}</button>`;

  const content = (): TemplateResult => {
    if (view === 'forgot') {
      return resetDone
        ? html`<p class="login-demo__alert" data-tone="success" role="status">If an account exists for this entry, instructions to reset the password have been sent.</p>`
        : html`
          <form class="login-demo__form" novalidate @submit=${submitForgot}>
            <p class="login-demo__intro">
              Enter your username or email address. We will send you instructions to reset your password.
            </p>
            ${field('account', 'Username or email')} ${alert()}
          </form>
        `;
    }

    if (view === 'register') {
      return html`
        <form class="login-demo__form" novalidate @submit=${submitRegister}>
          ${field('username', 'Username')}
          ${field('email', 'Email', { type: 'email' })}
          <div class="login-demo__pair">
            ${field('new-password', 'Password', { type: 'password' })}
            ${field('repeat', 'Repeat password', { type: 'password' })}
          </div>
          ${alert()}
        </form>
      `;
    }

    return html`
      ${note === undefined ? nothing : html`<p class="login-demo__alert" data-tone="success" role="status">${note}</p>`}
      <form class="login-demo__form" novalidate @submit=${submitLogin}>
        ${field('username', 'Username')}
        <div class="login-demo__password">
          ${field('password', 'Password', { type: 'password' })}
          ${link('Forgot password?', () => show('forgot'))}
        </div>
        ${alert()}
      </form>
    `;
  };

  // The host's content of the login element: the view, the footer, the hint.
  const update = () => {
    login.heading = HEADINGS[view];
    // The submit button is the element's: its label (none once the instructions are sent), its spinner.
    login.submitLabel = view === 'forgot' && resetDone ? '' : SUBMIT_LABELS[view];
    login.submitting = busy;
    login.providers = view === 'login' ? PROVIDERS : [];
    render(
      html`
        ${content()}
        <span slot="footer">${
        view === 'login'
          ? html`Not yet registered? ${link('Create an account', () => show('register'))}`
          : link('Back to sign in', () => show('login'))
      }</span>
        <span slot="hint">A demo: any username and password sign in ("wrong" fails).</span>
      `,
      login,
    );
  };

  show('login');

  return () => render(nothing, login);
}

// The demos' login (the package's demo and the root page): signing out (the user menu's "Sign out") shows the login
// screen in place of the `<app-cockpit>`, with the host's content (`content`, e.g. the root page's Mantine forms). Any
// username and password sign in again (a demo: it is about the look); the made-up server answers after a moment: the
// password "wrong" fails, the account "taken" exists already (registering it fails); Google fails, the other providers
// sign in. Signed out is remembered per browser, so a reload stays there (`restore()`).
//
// The cockpit fades out first, if the page gives it a transition (`data-fading`); the login fades in by the page's CSS
// too (an animation of `app-login`). The login's class is defined when it is shown the first time, with the page's
// accent then (its theme is fixed per class).
function loginDemo(options: LoginDemoOptions): { signOut: () => Promise<void>; restore: () => void } {
  const content = options.content ?? plainContent;
  let login: LoginElement | undefined;
  let dispose: (() => void) | undefined;
  let signingOut = false;
  const cockpit = () => document.querySelector<HTMLElement>('app-cockpit')!;

  const remember = (signedIn: boolean) => {
    try {
      localStorage.setItem(options.storageKey, String(signedIn));
    } catch {
      // Not remembered.
    }
  };

  const signIn = () => {
    remember(true);
    dispose?.();
    dispose = undefined;
    login?.remove();
    login = undefined;
    cockpit().hidden = false;
  };

  const showLogin = () => {
    if (customElements.get('app-login') === undefined) {
      customElements.define(
        'app-login',
        createLoginClass({ i18n: DEMO_I18N, theme: { accentColor: accentColor(options.accent) } }),
      );
    }

    cockpit().hidden = true;
    login = document.createElement('app-login') as LoginElement;
    login.appTitle = options.title;
    login.subtitle = options.subtitle;
    // The providers' buttons are the element's (the content shows them on its sign in view: `PROVIDERS`); the made-up
    // server signs in after a moment (Google fails).
    login.signInWith = async (id) => {
      await DEMO_SERVER.signInWith(id);
      signIn();
    };
    document.body.append(login);
    dispose = content(login, signIn);
  };

  const signOut = async () => {
    if (signingOut) {
      return;
    }

    signingOut = true;
    remember(false);

    const element = cockpit();

    element.dataset['fading'] = '';
    await wait(parseFloat(getComputedStyle(element).transitionDuration) * 1000 || 0);
    delete element.dataset['fading'];
    showLogin();
    signingOut = false;
  };

  const restore = () => {
    try {
      if (localStorage.getItem(options.storageKey) === 'false') {
        showLogin();
      }
    } catch {
      // Signed in.
    }
  };

  return { signOut, restore };
}
