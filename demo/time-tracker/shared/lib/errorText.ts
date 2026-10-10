import { AppError } from '../../infra/in-memory';
import { translateKey } from './i18n';

export { errorText };

// A refusal of the server in the app's language (`errors.<key>`); anything else as it is.
function errorText(error: unknown): string {
  return error instanceof AppError
    ? translateKey(`errors.${error.key}`, error.params)
    : error instanceof Error
    ? error.message
    : String(error);
}
