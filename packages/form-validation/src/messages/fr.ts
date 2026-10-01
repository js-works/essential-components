import type { LibCatalog } from './de';

export { fr };

const chars = { one: '# caractère', other: '# caractères' };

const fr: LibCatalog = {
  required: 'Veuillez remplir ce champ.',
  invalid: 'Veuillez vérifier votre saisie.',
  submitFailed: 'Une erreur s\'est produite lors de l\'envoi. Veuillez réessayer.',
  email: 'Veuillez saisir une adresse e-mail valide.',
  url: 'Veuillez saisir une URL valide.',
  format: 'La saisie n\'a pas le format attendu.',
  mustAccept: 'Veuillez confirmer.',
  enum: 'Veuillez choisir l\'une des options disponibles.',
  'number.type': 'Veuillez saisir un nombre.',
  'number.int': 'Veuillez saisir un nombre entier.',
  'number.min': (p) => `La valeur doit être d'au moins ${p.min}.`,
  'number.max': (p) => `La valeur ne doit pas dépasser ${p.max}.`,
  'number.gt': (p) => `La valeur doit être supérieure à ${p.min}.`,
  'number.lt': (p) => `La valeur doit être inférieure à ${p.max}.`,
  'number.between': (p) => `La valeur doit être comprise entre ${p.min} et ${p.max}.`,
  'number.step': (p) => `La valeur doit être un multiple de ${p.step}.`,
  'string.min': (_, c) => `Veuillez saisir au moins ${c.count('min', chars)}.`,
  'string.max': (_, c) => `Veuillez saisir au maximum ${c.count('max', chars)}.`,
  'string.between': (p) => `La saisie doit comporter entre ${p.min} et ${p.max} caractères.`,
  'string.length': (_, c) => `La saisie doit comporter exactement ${c.count('length', chars)}.`,
  'date.type': 'Veuillez saisir une date valide.',
  'date.min': (p) => `La date ne doit pas être antérieure au ${p.min}.`,
  'date.max': (p) => `La date ne doit pas être postérieure au ${p.max}.`,
};
