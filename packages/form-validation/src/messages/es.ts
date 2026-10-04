import type { LibCatalog } from './de';

export { es };

const chars = { one: '# carácter', other: '# caracteres' };

const es: LibCatalog = {
  required: 'Por favor, rellene este campo.',
  invalid: 'Por favor, revise su entrada.',
  submitFailed: 'Se ha producido un error al enviar. Por favor, inténtelo de nuevo.',
  email: 'Por favor, introduzca una dirección de correo electrónico válida.',
  url: 'Por favor, introduzca una URL válida.',
  format: 'La entrada no tiene el formato esperado.',
  mustAccept: 'Por favor, confírmelo.',
  enum: 'Por favor, seleccione una de las opciones disponibles.',
  'number.type': 'Por favor, introduzca un número.',
  'number.int': 'Por favor, introduzca un número entero.',
  'number.min': (p) => `El valor debe ser como mínimo ${p.min}.`,
  'number.max': (p) => `El valor debe ser como máximo ${p.max}.`,
  'number.gt': (p) => `El valor debe ser mayor que ${p.min}.`,
  'number.lt': (p) => `El valor debe ser menor que ${p.max}.`,
  'number.between': (p) => `El valor debe estar entre ${p.min} y ${p.max}.`,
  'number.step': (p) => `El valor debe ser un múltiplo de ${p.step}.`,
  'string.min': (_, c) => `Por favor, introduzca al menos ${c.count('min', chars)}.`,
  'string.max': (_, c) => `Por favor, introduzca como máximo ${c.count('max', chars)}.`,
  'string.between': (p) => `La entrada debe tener entre ${p.min} y ${p.max} caracteres.`,
  'string.length': (_, c) => `La entrada debe tener exactamente ${c.count('length', chars)}.`,
  'date.type': 'Por favor, introduzca una fecha válida.',
  'date.min': (p) => `La fecha no puede ser anterior al ${p.min}.`,
  'date.max': (p) => `La fecha no puede ser posterior al ${p.max}.`,
};
