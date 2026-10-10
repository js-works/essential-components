// The design language first, so the demo's own CSS comes after it.
import './ui/ui.css';
import './demo.css';
import { mountLoginScreen } from '../src';
import type { Login } from '../src';

// The demo: the login screen; any username and password sign in (after a short delay), except the password "wrong",
// which shows the error; so do the made-up providers, except "Google" (it fails). Signed in: the user's name and a button to sign out again.
const app = document.querySelector<HTMLElement>('#app')!;

const LOGO =
  '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" opacity="0.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" opacity="0.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>';

let login: Login.Mounted | undefined;

function signOut(): void {
  app.replaceChildren();
  login = mountLoginScreen(app, {
    title: 'Back Office',
    subtitle: 'Acme Corporate',
    logo: LOGO,
    hint: 'A demo: any username and password sign in (the password "wrong" fails).',
    // Made-up identity providers (OIDC or SSO): the host would redirect to them. Here they sign in after a moment.
    providers: [
      {
        id: 'microsoft',
        label: 'Microsoft',
        icon:
          '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8.5" height="8.5" fill="#f25022"/><rect x="12.5" y="3" width="8.5" height="8.5" fill="#7fba00"/><rect x="3" y="12.5" width="8.5" height="8.5" fill="#00a4ef"/><rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#ffb900"/></svg>',
      },
      { id: 'google', label: 'Google' },
      {
        id: 'sso',
        label: 'Company SSO',
        icon:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15 19 4M18 5l3 3M15 8l2 2"/></svg>',
      },
    ],
    onProvider: async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (id === 'google') {
        throw new Error('');
      }

      signIn(`${id} user`);
    },
    // `?sso=only`: only the providers (no password login).
    passwordLogin: new URLSearchParams(location.search).get('sso') !== 'only',
    // The made-up server: both answer after a moment (the account "taken" exists already).
    onForgotPassword: () => new Promise((resolve) => setTimeout(resolve, 600)),
    onRegister: async ({ username }) => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (username.toLowerCase() === 'taken') {
        throw new Error('This username is already taken.');
      }
    },
    onLogin: async ({ username, password }) => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (password === 'wrong') {
        throw new Error('');
      }

      signIn(username);
    },
  });
}

function signIn(username: string): void {
  login?.unmount();
  login = undefined;

  const panel = document.createElement('div');
  const text = document.createElement('p');
  const button = document.createElement('button');

  panel.className = 'signed-in';
  text.textContent = `Signed in as ${username}.`;
  button.className = 'ui-button';
  button.type = 'button';
  button.textContent = 'Sign out';
  button.addEventListener('click', signOut);
  panel.append(text, button);
  app.replaceChildren(panel);
}

signOut();
