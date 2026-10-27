import { readFileSync } from 'node:fs';
import { tanstackRouterGenerator } from '@tanstack/router-plugin/vite';

export { appRoutes };

// The apps with file-based routes (TanStack Router): each has its `routes/` and its `tsr.config.json`, which both the
// CLI (`npm run routes`, before the typecheck) and this Vite plugin read, so both generate the same tree. Before React's
// plugin; shared by `vite.config.ts` and `vite.board-manager.config.ts`. Only the generator: the full plugin adds HMR code
// to each route file that patches the routes of the page's last router (`window.__TSR_ROUTER__`), which is another
// app's when several apps with TanStack Router share the page (their ids `__root__` and `/` collide).
const APPS = ['board-manager'] as const;

function appRoutes() {
  return APPS.map((app) => {
    const config = JSON.parse(readFileSync(`./demo/${app}/tsr.config.json`, 'utf8')) as {
      routesDirectory: string;
      generatedRouteTree: string;
    };

    return tanstackRouterGenerator({
      ...config,
      target: 'react',
      routesDirectory: `./demo/${app}/${config.routesDirectory}`,
      generatedRouteTree: `./demo/${app}/${config.generatedRouteTree}`,
    });
  });
}
