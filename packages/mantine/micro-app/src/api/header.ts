import type { ReactNode } from 'react';

import type { AppHeaderLink } from '@local/cockpit';

export type { MicroAppCrumb, MicroAppCrumbItem, MicroAppHeaderProps, MicroAppModule };

type MicroAppModule = { to: string; label: ReactNode; exact?: boolean };

type MicroAppHeaderProps = {
  icon: ReactNode;
  title: ReactNode;
  modules: readonly MicroAppModule[];
  actions?: ReactNode;
  crumbs?: readonly MicroAppCrumbItem[];
  // The title as a switcher: its entries lead outside the app's router (the browser follows them).
  switcher?: readonly AppHeaderLink[];
  activeSwitcherItem?: string;
};

type MicroAppCrumbItem = { to: string; label: ReactNode };

type MicroAppCrumb = (params: Readonly<Record<string, string>>) => ReactNode;

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    crumb?: MicroAppCrumb;
  }
}
