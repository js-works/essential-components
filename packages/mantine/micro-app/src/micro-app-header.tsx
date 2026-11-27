import { useMatches, useMatchRoute, useRouter } from '@tanstack/react-router';
import type { ReactElement, ReactNode } from 'react';

import { createMantineCockpitTheme } from '@local/cockpit';
import type { AppHeaderNavigateDetail } from '@local/cockpit/react';
import { createAppHeaderComponent } from '@local/cockpit/react';

import type { MicroAppCrumb, MicroAppHeaderProps } from './api/header.js';
import { moduleOf, trimmed, useCrumbOf } from './crumbs.js';
import { useHistoryPosition } from './history.js';
import { useI18nAdapter } from './i18n-adapter.js';
import { useTexts } from './use-texts.js';

export { MicroAppHeader };

// The cockpit's app header (its React component, an internal element of the cockpit) in Mantine's look, its texts
// through the app's i18next instance.
const AppHeader = createAppHeaderComponent({ theme: createMantineCockpitTheme(), useI18n: useI18nAdapter });

// A label as text: the element's tabs and menus take strings (a module's label is one in every app so far).
const textOf = (node: ReactNode) => (typeof node === 'string' || typeof node === 'number' ? String(node) : '');

// The header of a micro-app: the cockpit's app header (`createAppHeaderComponent`), fed from the router (the modules'
// hrefs, the active module, the crumbs of the current route's matches, Back and Forward) and answers its events with
// the router (`navigate`, `back`, `forward`). What is not text is slotted: the icon, the crumbs
// (their components, e.g. a board's name), the pages of Back and Forward (read for the tooltips), the `actions`.
function MicroAppHeader(
  { icon, title, modules, actions, crumbs, switcher = [], activeSwitcherItem = '' }: MicroAppHeaderProps,
): ReactElement {
  const router = useRouter();
  const matchRoute = useMatchRoute();
  const matches = useMatches();
  const { text } = useTexts();
  const { back, forward } = useHistoryPosition();
  const crumbOf = useCrumbOf(modules);
  const hrefOf = (to: string) => router.buildLocation({ to } as never).href;
  const active = modules.find((module) =>
    matchRoute({ to: module.to, fuzzy: module.exact !== true } as never) !== false
  );

  // The crumbs: the current module (unless a route has a crumb for its path), then one per route with one; or the
  // app's own (`crumbs`).
  const fromRoutes = matches.flatMap((match) => {
    const crumb = (match.staticData as { crumb?: MicroAppCrumb }).crumb;

    return crumb === undefined ? [] : [{ to: trimmed(match.pathname), label: crumb(match.params) }];
  });
  const module = moduleOf(modules, matches.at(-1)?.pathname ?? '/');
  const withModule = module === undefined || fromRoutes.some((crumb) => crumb.to === module.to)
    ? fromRoutes
    : [{ to: module.to, label: module.label }, ...fromRoutes];
  const shown = crumbs ?? withModule;
  const pageOf = (
    path: string | undefined,
  ) => (path === undefined ? undefined : path === '/' ? text('home') : crumbOf(path));

  // A switcher's entry leads outside the router: not canceled, the browser follows it.
  const onNavigate = (event: CustomEvent<AppHeaderNavigateDetail>) => {
    if (switcher.some((link) => link.href === event.detail.href)) {
      return;
    }

    event.preventDefault();
    void router.navigate({ href: event.detail.href });
  };

  return (
    <AppHeader
      heading={textOf(title)}
      switcher={switcher}
      activeSwitcherItem={activeSwitcherItem}
      modules={modules.map((module) => ({ id: module.to, label: textOf(module.label), href: hrefOf(module.to) }))}
      activeModule={active?.to ?? ''}
      homeHref={hrefOf('/')}
      crumbs={shown.map((crumb) => ({ label: '', href: hrefOf(crumb.to) }))}
      back={back === undefined ? null : {}}
      forward={forward === undefined ? null : {}}
      icon={icon}
      end={actions}
      crumbLabels={shown.map((crumb) => crumb.label)}
      backPage={pageOf(back)}
      forwardPage={pageOf(forward)}
      onNavigate={onNavigate}
      onBack={(event) => {
        event.preventDefault();
        router.history.back();
      }}
      onForward={(event) => {
        event.preventDefault();
        router.history.forward();
      }}
    />
  );
}
