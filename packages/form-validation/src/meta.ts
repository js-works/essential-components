import { z } from 'zod';
import type { Binding, BindingConfig, FormMeta } from './types';

export { binding, formMeta, formRegistry, isBinding };

/**
 * An own registry instead of Zod's global `.meta()`, so the form info
 * does not show up in z.toJSONSchema() or in backend schemas.
 */
const formRegistry = z.registry<FormMeta>();

/** Attaches form-related metadata to a schema. Returns the same schema. */
function formMeta<T extends z.ZodType>(schema: T, meta: FormMeta): T {
  const existing = formRegistry.get(schema);
  formRegistry.add(schema, { ...existing, ...meta });
  return schema;
}

const BINDING = Symbol.for('@local/form-validation.binding');

/** A reusable binding for components with different conventions. */
function binding(config: BindingConfig): Binding {
  return Object.freeze({ ...config, [BINDING]: true }) as unknown as Binding;
}

function isBinding(value: unknown): value is Binding {
  return typeof value === 'object' && value !== null && (value as any)[BINDING] === true;
}
