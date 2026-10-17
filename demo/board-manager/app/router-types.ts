import type { createAppRouter } from './app.js';

// The Board Manager's router, for TanStack Router's types (the routes' params, the links): only in the app's own check
// (`tsconfig.json` of the app); nothing imports this file, so the root's check, which sees every app, has none.
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>['router'];
  }
}
