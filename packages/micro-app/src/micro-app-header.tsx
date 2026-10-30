import { useMatches, useMatchRoute, useRouter } from '@tanstack/react-router';
import type { i18n as I18nInstance } from 'i18next';
import type { ReactElement, ReactNode } from 'react';
import { createElement, useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppHeaderClass, AppHeaderElement, AppHeaderNavigateDetail, I18nAdapter } from '@local/cockpit';
import { createAppHeaderClass, MANTINE_APP_HEADER_THEME } from '@local/cockpit';

import type { MicroAppCrumb, MicroAppHeaderProps } from './api/header.js';
import { moduleOf, trimmed, useCrumbOf } from './crumbs.js';
import { useHistoryPosition } from './history.js';
import { useTexts } from './use-texts.js';

export { MicroAppHeader };

const tags = new WeakMap<I18nInstance, string>();

// The element's texts (the namespace `cockpit`) from an app's i18next instance: the translation of the key, else the
// English text the element gives.
function adapterOf(i18n: I18nInstance): I18nAdapter {
  return {
    currentLocale: () => i18n.language,
    resolveText: (namespace, key, params, defaultValue) =>
      String(i18n.t(key, { ns: namespace, ...params, defaultValue, interpolation: { escapeValue: false } } as never)),
    onChange: (listener) => {
      i18n.on('languageChanged', listener);

      return () => i18n.off('languageChanged', listener);
    },
  };
}

// The cockpit's app header as an internal element of this package (a package never takes a tag of its own): the first
// `internal-micro-app-header-<n>` not registered yet, registered on first use, in Mantine's look. One per i18next
// instance: the element's adapter is given to its class.
function headerTag(i18n: I18nInstance): string {
  let tag = tags.get(i18n);

  if (tag === undefined) {
    const headerClass: AppHeaderClass = createAppHeaderClass({
      theme: MANTINE_APP_HEADER_THEME,
      i18n: { type: 'factory', getAdapter: () => adapterOf(i18n) },
    });
    let n = 1;

    while (customElements.get(`internal-micro-app-header-${n}`) !== undefined) {
      n++;
    }

    tag = `internal-micro-app-header-${n}`;
    customElements.define(tag, headerClass);
    tags.set(i18n, tag);
  }

  return tag;
}

// A label as text: the element's tabs and menus take strings (a module's label is one in every app so far).
const textOf = (node: ReactNode) => (typeof node === 'string' || typeof node === 'number' ? String(node) : '');

// The header of a micro-app: the cockpit's app header (`createAppHeaderClass`), fed from the
// router (the modules' hrefs, the active module, the crumbs of the current route's matches, Back and Forward) and
// answers its events with the router (`navigate`, `back`, `forward`). What is not text is slotted: the icon, the crumbs
// (their components, e.g. a board's name), the pages of Back and Forward (read for the tooltips), the `actions`.
function MicroAppHeader(
  { icon, title, modules, actions, crumbs, switcher = [], activeSwitcherItem = '' }: MicroAppHeaderProps,
): ReactElement {
  const router = useRouter();
  const matchRoute = useMatchRoute();
  const matches = useMatches();
  const { text } = useTexts();
  const { i18n } = useTranslation();
  const { back, forward } = useHistoryPosition();
  const crumbOf = useCrumbOf(modules);
  const ref = useRef<AppHeaderElement>(null);
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

  useLayoutEffect(() => {
    const element = ref.current;

    if (element === null) {
      return;
    }

    element.heading = textOf(title);
    element.switcher = switcher;
    element.activeSwitcherItem = activeSwitcherItem;
    element.modules = modules.map((module) => ({
      id: module.to,
      label: textOf(module.label),
      href: hrefOf(module.to),
    }));
    element.activeModule = active?.to ?? '';
    element.homeHref = hrefOf('/');
    element.crumbs = shown.map((crumb) => ({ label: '', href: hrefOf(crumb.to) }));
    element.back = back === undefined ? null : {};
    element.forward = forward === undefined ? null : {};
  });

  useEffect(() => {
    const element = ref.current;

    if (element === null) {
      return;
    }

    // A switcher's entry leads outside the router: not canceled, the browser follows it.
    const onNavigate = (event: Event) => {
      const { href } = (event as CustomEvent<AppHeaderNavigateDetail>).detail;

      if (element.switcher.some((link) => link.href === href)) {
        return;
      }

      event.preventDefault();
      void router.navigate({ href });
    };
    const onBack = (event: Event) => {
      event.preventDefault();
      router.history.back();
    };
    const onForward = (event: Event) => {
      event.preventDefault();
      router.history.forward();
    };

    element.addEventListener('navigate', onNavigate);
    element.addEventListener('back', onBack);
    element.addEventListener('forward', onForward);

    return () => {
      element.removeEventListener('navigate', onNavigate);
      element.removeEventListener('back', onBack);
      element.removeEventListener('forward', onForward);
    };
  }, [router]);

  return createElement(
    headerTag(i18n),
    { ref },
    <span slot="icon" className="micro-app__header-slot">{icon}</span>,
    ...shown.map((crumb, index) => (
      <span key={`crumb-${index}`} slot={`crumb-${index}`} className="micro-app__header-slot">{crumb.label}</span>
    )),
    <span key="back" slot="back-page">{pageOf(back)}</span>,
    <span key="forward" slot="forward-page">{pageOf(forward)}</span>,
    actions === undefined ? null : <span key="end" slot="end" className="micro-app__header-slot">{actions}</span>,
  );
}
