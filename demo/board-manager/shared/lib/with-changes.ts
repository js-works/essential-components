export { withChanges };

// A service whose changing methods say so: after each of `changing` has finished (its promise resolved), `onChange` is
// called, e.g. by the app to load every read again. The other methods stay as they are.
function withChanges<S extends object>(service: S, changing: readonly (keyof S & string)[], onChange: () => void): S {
  const wrapped: Record<string, unknown> = { ...(service as Record<string, unknown>) };

  for (const key of changing) {
    const method = service[key];

    if (typeof method === 'function') {
      wrapped[key] = async (...args: unknown[]) => {
        const result: unknown = await method(...args);

        onChange();

        return result;
      };
    }
  }

  return wrapped as S;
}
