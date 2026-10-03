import type { Texts } from './api';

export { textsFor };

// The login screen's own texts, in the language of the page (`<html lang>`): German for `de…`, else English. A host
// can replace each of them (`texts`).
const EN: Texts = {
  heading: 'Sign in',
  username: 'Username',
  password: 'Password',
  submit: 'Sign in',
  required: 'Required',
  failed: 'Invalid username or password.',
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
  invalidEmail: 'Enter a valid email address.',
  mismatch: 'The passwords do not match.',
  back: 'Back to sign in',
  continueWith: 'Continue with {provider}',
  or: 'or',
  providerFailed: 'The sign in failed. Please try again.',
};

const DE: Texts = {
  heading: 'Anmelden',
  username: 'Benutzername',
  password: 'Passwort',
  submit: 'Anmelden',
  required: 'Erforderlich',
  failed: 'Benutzername oder Passwort ist falsch.',
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
  invalidEmail: 'Geben Sie eine gültige E-Mail-Adresse ein.',
  mismatch: 'Die Passwörter stimmen nicht überein.',
  back: 'Zurück zur Anmeldung',
  continueWith: 'Weiter mit {provider}',
  or: 'oder',
  providerFailed: 'Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
};

function textsFor(lang: string): Texts {
  return lang.toLowerCase().startsWith('de') ? DE : EN;
}
