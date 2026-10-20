import { readFileSync } from 'node:fs';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export { appRoutes };

// The apps with file-based routes (TanStack Router): each has its `routes/` and its `tsr.config.json`, which both the
// CLI (`npm run routes`, before the typecheck) and this Vite plugin read, so both generate the same tree. Before React's
// plugin; shared by `vite.config.ts` and `vite.board-manager.config.ts`.
const APPS = ['board-manager'] as const;

function appRoutes() {
  return APPS.map((app) => {
    const config = JSON.parse(readFileSync(`./demo/${app}/tsr.config.json`, 'utf8')) as {
      routesDirectory: string;
      generatedRouteTree: string;
    };

    return tanstackRouter({
      ...config,
      target: 'react',
      routesDirectory: `./demo/${app}/${config.routesDirectory}`,
      generatedRouteTree: `./demo/${app}/${config.generatedRouteTree}`,
    });
  });
}
