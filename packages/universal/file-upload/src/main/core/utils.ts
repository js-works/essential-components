export { clamp, constant, withoutUndefined };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Makes a value a constant: freezes it deeply, and its type is that of its literal (like `as const`).
function constant<const T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) {
      constant(child);
    }

    Object.freeze(value);
  }

  return value;
}

// An object's keys that are set: an `undefined` must not hide a value it is put on (a theme's keys over a ready theme).
function withoutUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, each]) => each !== undefined)) as Partial<T>;
}
