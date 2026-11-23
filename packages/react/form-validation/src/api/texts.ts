export type { BuiltInCatalog, MessageCatalog, MessageContext, MessageFn, MessageKey, PluralForms, ValidationMessage };

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>;

interface MessageContext {
  locale: string;
  /** Picks the plural form for the parameter `param`; `#` is replaced by the formatted number. */
  count(param: string, forms: PluralForms): string;
}

/** The parameters arrive already formatted for the locale (numbers, dates). */
type MessageFn = (params: Record<string, string>, ctx: MessageContext) => string;
type ValidationMessage = string | MessageFn;
type MessageCatalog = Record<string, ValidationMessage>;

/** The keys of the library's own messages (its bundled catalogs). */
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

type BuiltInCatalog = Record<MessageKey, ValidationMessage>;
