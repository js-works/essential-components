// A theme's tokens that are set: an `undefined` must not hide a value of the theme it is put on.
export function withoutUndefined<T extends object>(theme: T): Partial<T> {
  return Object.fromEntries(Object.entries(theme).filter(([, value]) => value !== undefined)) as Partial<T>;
}
