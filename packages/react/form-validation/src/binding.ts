import type { FieldBinding, FieldBindingConfig } from './index.js';

export { binding, isBinding };

const BINDING = Symbol.for('@local/form-validation.binding');

/** A reusable binding for components with different conventions. */
function binding(config: FieldBindingConfig): FieldBinding {
  return Object.freeze({ ...config, [BINDING]: true }) as unknown as FieldBinding;
}

function isBinding(value: unknown): value is FieldBinding {
  return typeof value === 'object' && value !== null && (value as any)[BINDING] === true;
}
