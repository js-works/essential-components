import { useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import type { MicroAppCrumb, MicroAppModule } from './api/header.js';

export { moduleOf, trimmed, useCrumbOf };

// A path without a trailing slash (an index route's `/boards/` is the module's `/boards`).
const trimmed = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path);

// The module a path belongs to (not the start page's): the one whose path it is or starts with.
function moduleOf(modules: readonly MicroAppModule[], path: string): MicroAppModule | undefined {
  return modules.find((module) =>
    module.exact !== true && (trimmed(path) === module.to || trimmed(path).startsWith(`${module.to}/`))
  );
}

// The crumb of the page at a path: the last crumb of its routes, else the module's label where the path is a module's;
// none for a path without one.
function useCrumbOf(modules: readonly MicroAppModule[]): (path: string) => ReactNode | undefined {
  const router = useRouter();

  return (path) => {
    const matches = router.matchRoutes(path) as readonly {
      staticData?: { crumb?: MicroAppCrumb };
      params: Record<string, string>;
    }[];
    const match = matches.findLast((candidate) => candidate.staticData?.crumb !== undefined);

    return match?.staticData?.crumb?.(match.params)
      ?? modules.find((module) => module.exact !== true && module.to === trimmed(path))?.label;
  };
}
