import { ActionIcon, Breadcrumbs, Menu, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { Link, useMatches, useMatchRoute, useRouter } from '@tanstack/react-router';
import type { ReactElement, ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { AnchorLink } from './anchor-link.js';
import type { MicroAppCrumb, MicroAppCrumbItem, MicroAppHeaderProps, MicroAppModule } from './api/header.js';
import { useHistoryPosition } from './history.js';
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, HomeIcon } from './icons.js';
import { useTexts } from './use-texts.js';

export { MicroAppHeader };

// The header of a micro-app, in two lines: the app's icon and title, its modules as tabs (a menu when the header is
// narrow), the app's own `actions` (e.g. a user menu) and Back and Forward (hidden when it is narrow); below them the
// breadcrumb: the crumbs of the current route's matches, or the app's own (`crumbs`, e.g. a folder's path). It reads
// the router: the active module, the crumbs (`staticData.crumb`), the history. Sticky at the top.
function MicroAppHeader({ icon, title, modules, actions, crumbs }: MicroAppHeaderProps): ReactElement {
  return (
    <header className="micro-app__header">
      <div className="micro-app__header-line">
        <ThemeIcon variant="filled" size="lg" radius="sm" className="micro-app__icon" aria-hidden>{icon}</ThemeIcon>
        <Text fw={700} className="micro-app__title">{title}</Text>
        <ModuleTabs modules={modules} />
        <ModuleMenu modules={modules} />
        <div className="micro-app__end">
          {actions}
          <HistoryButtons modules={modules} />
        </div>
      </div>
      <Crumbs given={crumbs} modules={modules} />
    </header>
  );
}

function ModuleTabs({ modules }: { modules: readonly MicroAppModule[] }) {
  return (
    <nav className="micro-app__modules">
      {modules.map((module) => (
        <Link
          key={module.to}
          to={module.to}
          activeOptions={{ exact: module.exact === true }}
          className="micro-app__module"
        >
          {module.label}
        </Link>
      ))}
    </nav>
  );
}

// The modules as a menu, in place of the tabs on a narrow header: the current module and a chevron.
function ModuleMenu({ modules }: { modules: readonly MicroAppModule[] }) {
  const { text } = useTexts();
  const matchRoute = useMatchRoute();
  const current = modules.find((module) => matchRoute({ to: module.to, fuzzy: module.exact !== true }) !== false);

  return (
    <Menu position="bottom-start" withinPortal={false}>
      <Menu.Target>
        <UnstyledButton className="micro-app__module-menu" aria-label={text('modules')}>
          {current?.label ?? text('modules')}
          <ChevronDownIcon />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {modules.map((module) => (
          <Menu.Item key={module.to} renderRoot={(props) => <Link to={module.to} {...props} />}>
            {module.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

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

// Back and Forward through the router's history, disabled at either end; their tooltips name the page ("Back to …").
function HistoryButtons({ modules }: { modules: readonly MicroAppModule[] }) {
  const { text, t } = useTexts();
  const router = useRouter();
  const { back, forward } = useHistoryPosition();
  const crumbOf = useCrumbOf(modules);
  const tip = (path: string | undefined, key: 'back' | 'forward') => {
    const page = path === undefined ? undefined : path === '/' ? text('home') : crumbOf(path);

    return page === undefined
      ? text(key)
      : (
        <Trans
          t={t}
          // The package's own key, whatever keys the app declares for its resources.
          i18nKey={(key === 'back' ? 'backTo' : 'forwardTo') as never}
          components={{ page: <>{page}</> }}
        />
      );
  };

  return (
    <div className="micro-app__history">
      <Tooltip label={tip(back, 'back')} openDelay={400} fz="xs" disabled={back === undefined}>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={text('back')}
          disabled={back === undefined}
          onClick={() => router.history.back()}
        >
          <ArrowLeftIcon />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={tip(forward, 'forward')} openDelay={400} fz="xs" disabled={forward === undefined}>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={text('forward')}
          disabled={forward === undefined}
          onClick={() => router.history.forward()}
        >
          <ArrowRightIcon />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}

// "Home" (a house icon and the text, a link to the start page), then the current module (its label, unless a route
// has a crumb of its own for the module's path), then one crumb per route with one (or the app's own instead); the
// last one is the current page, no link. On the start page, "Home" alone, no link.
function Crumbs({ given, modules }: {
  given: readonly MicroAppCrumbItem[] | undefined;
  modules: readonly MicroAppModule[];
}) {
  const { text } = useTexts();
  const matches = useMatches();
  const fromRoutes = matches.flatMap((match) => {
    const crumb = (match.staticData as { crumb?: MicroAppCrumb }).crumb;

    return crumb === undefined ? [] : [{ id: match.id, to: trimmed(match.pathname), label: crumb(match.params) }];
  });
  const module = moduleOf(modules, matches.at(-1)?.pathname ?? '/');
  const withModule = module === undefined || fromRoutes.some((crumb) => crumb.to === module.to)
    ? fromRoutes
    : [{ id: `module:${module.to}`, to: module.to, label: module.label }, ...fromRoutes];
  const crumbs = given === undefined ? withModule : given.map((crumb) => ({ id: crumb.to, ...crumb }));
  const home = (
    <span className="micro-app__home">
      <HomeIcon />
      {text('home')}
    </span>
  );

  return (
    <Breadcrumbs separator="›" separatorMargin={6} className="micro-app__crumbs">
      {crumbs.length === 0 ? <Text size="sm">{home}</Text> : <AnchorLink to="/" size="sm">{home}</AnchorLink>}
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1
          ? <Text key={crumb.id} size="sm" className="micro-app__crumb">{crumb.label}</Text>
          : (
            <AnchorLink key={crumb.id} to={crumb.to} size="sm" className="micro-app__crumb">
              {crumb.label}
            </AnchorLink>
          )
      )}
    </Breadcrumbs>
  );
}
