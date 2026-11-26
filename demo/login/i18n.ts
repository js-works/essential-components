import { createInstance } from 'i18next';
import ICU from 'i18next-icu';
import { useSyncExternalStore } from 'react';

import FORM_VALIDATION_DE from '@local/form-validation/locales/de.json' with { type: 'json' };
import FORM_VALIDATION_EN from '@local/form-validation/locales/en.json' with { type: 'json' };

export type { LoginTextKey };
export { i18n, useText };

// The login's texts (the namespace `login`, the default one) and the form validation's messages (`formValidation`), in
// English and German, ICU messages. It follows the page's language (`<html lang>`, the footer's switch).
const EN = {
  heading: 'Sign in',
  username: 'Username',
  password: 'Password',
  submit: 'Sign in',
  failed: 'Invalid username or password.',
  tryAgain: 'Something went wrong. Please try again.',
  forgotLink: 'Forgot password?',
  forgotHeading: 'Reset password',
  forgotIntro: 'Enter your username or email address. We will send you instructions to reset your password.',
  account: 'Username or email',
  forgotSubmit: 'Send instructions',
  forgotDone: 'If an account exists for this entry, instructions to reset the password have been sent.',
  registerPrompt: 'Not yet registered?',
  registerLink: 'Create an account',
  registerHeading: 'Create account',
  registerSubmit: 'Register',
  registerDone: 'Your account has been created. You can sign in now.',
  email: 'Email',
  passwordRepeat: 'Repeat password',
  mismatch: 'The passwords do not match.',
  back: 'Back to sign in',
  hint: 'A demo: any username and password sign in ("wrong" fails).',
};

const DE: Record<keyof typeof EN, string> = {
  heading: 'Anmelden',
  username: 'Benutzername',
  password: 'Passwort',
  submit: 'Anmelden',
  failed: 'Benutzername oder Passwort ist falsch.',
  tryAgain: 'Etwas ist schiefgegangen. Bitte versuchen Sie es erneut.',
  forgotLink: 'Passwort vergessen?',
  forgotHeading: 'Passwort zurücksetzen',
  forgotIntro:
    'Geben Sie Ihren Benutzernamen oder Ihre E-Mail-Adresse ein. Wir senden Ihnen eine Anleitung zum Zurücksetzen des Passworts.',
  account: 'Benutzername oder E-Mail',
  forgotSubmit: 'Anleitung senden',
  forgotDone:
    'Falls es zu dieser Eingabe ein Konto gibt, wurde eine Anleitung zum Zurücksetzen des Passworts gesendet.',
  registerPrompt: 'Noch nicht registriert?',
  registerLink: 'Konto erstellen',
  registerHeading: 'Konto erstellen',
  registerSubmit: 'Registrieren',
  registerDone: 'Ihr Konto wurde erstellt. Sie können sich jetzt anmelden.',
  email: 'E-Mail',
  passwordRepeat: 'Passwort wiederholen',
  mismatch: 'Die Passwörter stimmen nicht überein.',
  back: 'Zurück zur Anmeldung',
  hint: 'Eine Demo: Jeder Benutzername und jedes Passwort meldet an („wrong“ schlägt fehl).',
};

const language = () => (document.documentElement.lang.toLowerCase().startsWith('de') ? 'de' : 'en');

const i18n = createInstance();

void i18n.use(ICU).init({
  initAsync: false,
  lng: language(),
  fallbackLng: 'en',
  defaultNS: 'login',
  resources: {
    en: { login: EN, formValidation: FORM_VALIDATION_EN },
    de: { login: DE, formValidation: FORM_VALIDATION_DE },
  },
  interpolation: { escapeValue: false },
});

new MutationObserver(() => void i18n.changeLanguage(language()))
  .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

type LoginTextKey = keyof typeof EN;

const subscribe = (listener: () => void) => {
  i18n.on('languageChanged', listener);

  return () => i18n.off('languageChanged', listener);
};

// The login's texts, typed by its own keys (not through i18next's global resource types, which the Board Manager
// declares); a change of the language renders again.
function useText(): (key: LoginTextKey, params?: Readonly<Record<string, unknown>>) => string {
  const language = useSyncExternalStore(subscribe, () => i18n.language);

  return (key, params) => String(i18n.t(key, { ...params, lng: language } as never));
}
