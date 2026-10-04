import type { en } from '../../shared/lib/i18n/locales/en';

export { AppError };
export type { ErrorKey };

// The keys of the messages the fake server (and the schemas) give: the UI translates them (`errors` of the texts).
type ErrorKey = keyof typeof en.errors;

// An error meant for the user, as a key with its values: the server does not know the user's language, the UI makes
// the text (`useForm.tsx`). The message is the key, for a log.
class AppError extends Error {
  readonly key: ErrorKey;
  readonly params: Readonly<Record<string, string | number>> | undefined;

  constructor(key: ErrorKey, params?: Readonly<Record<string, string | number>>) {
    super(key);
    this.name = 'AppError';
    this.key = key;
    this.params = params;
  }
}
