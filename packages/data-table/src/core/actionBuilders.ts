export { buildAction };

// An action of the given type: the other fields, the key, and the handler, whose result (e.g. a promise) is ignored.
// Typed by the builders of each entry (`src/react/actionBuilders.ts`, `src/element/actionBuilders.ts`).
function buildAction<Type extends string, Args extends unknown[], Fields extends object>(
  type: Type,
  key: string,
  onClick: (...args: Args) => unknown,
  fields: Fields,
): Fields & { type: Type; key: string; onClick: (...args: Args) => void } {
  return { ...fields, type, key, onClick: (...args: Args) => void onClick(...args) };
}
