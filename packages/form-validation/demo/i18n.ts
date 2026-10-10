import { useSyncExternalStore } from 'react';
import type { I18nAdapter } from '../src';

export { adapter, text, useLocale };

// The demo's i18n: the texts of the demo and the app's keys for the form (labels, messages of the schema and the
// server), in English and German. It follows `<html lang>`, which the page's switch sets (a MutationObserver reports
// a change). The messages of the library come from its own catalogs.
const TEXTS: Readonly<Record<'en' | 'de', Readonly<Record<string, string>>>> = {
  en: {
    'demo.intro': 'The schema is the only place that says what a valid value is. The fields only render.',
    'demo.hint':
      'Try: an email that is already taken (taken@example.com), the name "boom" (the server fails), different passwords.',
    'demo.submit': 'Sign up',
    'demo.reset': 'Reset',
    'demo.sending': 'Sending…',
    'demo.state': 'State',
    'demo.valid': 'valid',
    'demo.submitting': 'submitting',
    'demo.sent': 'Sent to the server',
    'demo.nothing': 'Nothing sent yet.',
    'demo.choose': 'Choose…',
    'signup.name': 'Name',
    'signup.email': 'Email',
    'signup.age': 'Age',
    'signup.password': 'Password (validated while typing)',
    'signup.confirm': 'Confirm password',
    'signup.country': 'Country',
    'signup.country.de': 'Germany',
    'signup.country.at': 'Austria',
    'signup.country.ch': 'Switzerland',
    'signup.newsletter': 'Send me the newsletter',
    'signup.terms': 'I accept the terms',
    'signup.passwordsDiffer': 'The passwords do not match.',
    'signup.taken': 'This email is already registered.',
  },
  de: {
    'demo.intro': 'Das Schema ist der einzige Ort, der sagt, was ein gültiger Wert ist. Die Felder stellen nur dar.',
    'demo.hint':
      'Probiere: eine vergebene E-Mail (taken@example.com), den Namen „boom“ (der Server schlägt fehl), verschiedene Passwörter.',
    'demo.submit': 'Registrieren',
    'demo.reset': 'Zurücksetzen',
    'demo.sending': 'Wird gesendet…',
    'demo.state': 'Zustand',
    'demo.valid': 'gültig',
    'demo.submitting': 'sendet',
    'demo.sent': 'An den Server gesendet',
    'demo.nothing': 'Noch nichts gesendet.',
    'demo.choose': 'Wählen…',
    'signup.name': 'Name',
    'signup.email': 'E-Mail',
    'signup.age': 'Alter',
    'signup.password': 'Passwort (wird beim Tippen geprüft)',
    'signup.confirm': 'Passwort bestätigen',
    'signup.country': 'Land',
    'signup.country.de': 'Deutschland',
    'signup.country.at': 'Österreich',
    'signup.country.ch': 'Schweiz',
    'signup.newsletter': 'Newsletter senden',
    'signup.terms': 'Ich akzeptiere die Bedingungen',
    'signup.passwordsDiffer': 'Die Passwörter stimmen nicht überein.',
    'signup.taken': 'Diese E-Mail ist schon registriert.',
  },
};

const language = (): 'en' | 'de' => document.documentElement.lang.toLowerCase().startsWith('de') ? 'de' : 'en';

const subscribe = (listener: () => void): () => void => {
  const observer = new MutationObserver(listener);

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  return () => observer.disconnect();
};

// The text of a key in the current language (the key itself if it is unknown).
const text = (key: string): string => TEXTS[language()][key] ?? key;

// Renders the component again when the page's language changes.
const useLocale = (): string => useSyncExternalStore(subscribe, () => document.documentElement.lang || 'en');

const adapter: I18nAdapter = {
  currentLocale: () => document.documentElement.lang || 'en',
  resolveText: (_namespace, key, _params, defaultValue) => TEXTS[language()][key] ?? defaultValue,
  onChange: subscribe,
};
