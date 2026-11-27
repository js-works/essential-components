export { withoutUndefined };

// A theme's keys that are set: an `undefined` must not hide a value of the ready theme it is put on.
function withoutUndefined<T extends object>(theme: T): Partial<T> {
  return Object.fromEntries(Object.entries(theme).filter(([, value]) => value !== undefined)) as Partial<T>;
}
