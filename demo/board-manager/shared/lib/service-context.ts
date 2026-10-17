import { createContext, useContext } from 'react';

export { createServiceContext };

// A feature's service, given by the app (its wiring decides on the repositories behind it): the context for the
// provider, and the hook that reads it (it throws without a provider around it).
function createServiceContext<S>(name: string) {
  const Context = createContext<S | null>(null);

  function useService(): S {
    const service = useContext(Context);

    if (service === null) {
      throw new Error(`use${name}: no ${name}Context around it.`);
    }

    return service;
  }

  return [Context, useService] as const;
}
