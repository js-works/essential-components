export { chain, mergeProps, mergeRefs };

type AnyFn = (...args: any[]) => any;

function chain(first: AnyFn, second: AnyFn): AnyFn {
  return (...args) => {
    first(...args);
    second(...args);
  };
}

function mergeRefs(...refs: unknown[]): (el: unknown) => void {
  return (el) => {
    for (const r of refs) {
      if (typeof r === 'function') r(el);
      else if (r && typeof r === 'object') (r as { current: unknown }).current = el;
    }
  };
}

const isHandler = (key: string) => /^on[A-Z]/.test(key);

/**
 * Merges instead of overriding: handlers are chained, refs combined,
 * all other values are overridden by the later object.
 * `libFirst` decides whether the handlers of the library run before those of the caller.
 */
function mergeProps(
  base: Record<string, unknown>,
  extra: Record<string, unknown>,
  libFirst = true,
): Record<string, unknown> {
  const result = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    const current = result[key];
    if (current === undefined || value === undefined) {
      if (value !== undefined) result[key] = value;
    } else if (key === 'ref') {
      result[key] = mergeRefs(current, value);
    } else if (isHandler(key) && typeof current === 'function' && typeof value === 'function') {
      result[key] = libFirst ? chain(current as AnyFn, value as AnyFn) : chain(value as AnyFn, current as AnyFn);
    } else {
      result[key] = value;
    }
  }
  return result;
}
