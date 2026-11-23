export { clamp, constant };

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
