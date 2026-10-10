export { AppError };
export type { AppErrorKey };

// What the server refuses, as a key of the app's texts (`errors.<key>`) and its values: the app translates it (the
// message itself is the English text, for the console).
type AppErrorKey =
  | 'emailTaken'
  | 'notFound'
  | 'clockState'
  | 'endBeforeStart'
  | 'halfDayMultiple'
  | 'noWorkingDays'
  | 'overlap'
  | 'notEnoughDays'
  | 'cannotCancel'
  | 'alreadyDecided'
  | 'futureDate'
  | 'overlapEntries';

class AppError extends Error {
  readonly key: AppErrorKey;
  readonly params: Readonly<Record<string, string | number>>;

  constructor(key: AppErrorKey, params: Readonly<Record<string, string | number>> = {}) {
    super(`${key} ${JSON.stringify(params)}`);
    this.key = key;
    this.params = params;
  }
}
