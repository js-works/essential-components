import type { Message } from '../types';

export { de };
export type { LibCatalog, MessageKey };

type MessageKey =
  | 'required'
  | 'invalid'
  | 'submitFailed'
  | 'email'
  | 'url'
  | 'format'
  | 'mustAccept'
  | 'enum'
  | 'number.type'
  | 'number.int'
  | 'number.min'
  | 'number.max'
  | 'number.gt'
  | 'number.lt'
  | 'number.between'
  | 'number.step'
  | 'string.min'
  | 'string.max'
  | 'string.between'
  | 'string.length'
  | 'date.type'
  | 'date.min'
  | 'date.max';

type LibCatalog = Record<MessageKey, Message>;

const de: LibCatalog = {
  required: 'Bitte füllen Sie dieses Feld aus.',
  invalid: 'Bitte überprüfen Sie Ihre Eingabe.',
  submitFailed: 'Beim Absenden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
  email: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
  url: 'Bitte geben Sie eine gültige URL an.',
  format: 'Die Eingabe hat nicht das erwartete Format.',
  mustAccept: 'Bitte bestätigen Sie dies.',
  enum: 'Bitte wählen Sie eine der verfügbaren Optionen.',
  'number.type': 'Bitte geben Sie eine Zahl an.',
  'number.int': 'Bitte geben Sie eine ganze Zahl an.',
  'number.min': (p) => `Der Wert muss mindestens ${p.min} betragen.`,
  'number.max': (p) => `Der Wert darf höchstens ${p.max} betragen.`,
  'number.gt': (p) => `Der Wert muss größer als ${p.min} sein.`,
  'number.lt': (p) => `Der Wert muss kleiner als ${p.max} sein.`,
  'number.between': (p) => `Der Wert muss zwischen ${p.min} und ${p.max} liegen.`,
  'number.step': (p) => `Der Wert muss ein Vielfaches von ${p.step} sein.`,
  'string.min': (p) => `Bitte geben Sie mindestens ${p.min} Zeichen ein.`,
  'string.max': (p) => `Bitte geben Sie höchstens ${p.max} Zeichen ein.`,
  'string.between': (p) => `Die Eingabe muss zwischen ${p.min} und ${p.max} Zeichen lang sein.`,
  'string.length': (p) => `Die Eingabe muss genau ${p.length} Zeichen lang sein.`,
  'date.type': 'Bitte geben Sie ein gültiges Datum an.',
  'date.min': (p) => `Das Datum darf nicht vor dem ${p.min} liegen.`,
  'date.max': (p) => `Das Datum darf nicht nach dem ${p.max} liegen.`,
};
