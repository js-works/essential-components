import type { LibCatalog } from './de';

export { hu };

const hu: LibCatalog = {
  required: 'Kérjük, töltse ki ezt a mezőt.',
  invalid: 'Kérjük, ellenőrizze a megadott adatot.',
  submitFailed: 'Hiba történt a küldés során. Kérjük, próbálja újra.',
  email: 'Kérjük, érvényes e-mail-címet adjon meg.',
  url: 'Kérjük, érvényes URL-t adjon meg.',
  format: 'A megadott érték formátuma nem megfelelő.',
  mustAccept: 'Kérjük, erősítse meg.',
  enum: 'Kérjük, válasszon a rendelkezésre álló lehetőségek közül.',
  'number.type': 'Kérjük, számot adjon meg.',
  'number.int': 'Kérjük, egész számot adjon meg.',
  'number.min': (p) => `Az érték legalább ${p.min} legyen.`,
  'number.max': (p) => `Az érték legfeljebb ${p.max} lehet.`,
  'number.gt': (p) => `Az értéknek nagyobbnak kell lennie, mint ${p.min}.`,
  'number.lt': (p) => `Az értéknek kisebbnek kell lennie, mint ${p.max}.`,
  'number.between': (p) => `Az értéknek ${p.min} és ${p.max} között kell lennie.`,
  'number.step': (p) => `Az értéknek ${p.step} többszörösének kell lennie.`,
  'string.min': (p) => `Kérjük, legalább ${p.min} karaktert adjon meg.`,
  'string.max': (p) => `Kérjük, legfeljebb ${p.max} karaktert adjon meg.`,
  'string.between': (p) => `A bevitel hossza ${p.min} és ${p.max} karakter között legyen.`,
  'string.length': (p) => `A bevitel pontosan ${p.length} karakter hosszú legyen.`,
  'date.type': 'Kérjük, érvényes dátumot adjon meg.',
  'date.min': (p) => `A dátum nem lehet korábbi, mint ${p.min}.`,
  'date.max': (p) => `A dátum nem lehet későbbi, mint ${p.max}.`,
};
