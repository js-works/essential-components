import type { ReactNode } from 'react';

export type { MicroAppCrumb, MicroAppCrumbItem, MicroAppHeaderProps, MicroAppModule };

type MicroAppModule = { to: string; label: ReactNode; exact?: boolean };

type MicroAppHeaderProps = {
  icon: ReactNode;
  title: ReactNode;
  modules: readonly MicroAppModule[];
  actions?: ReactNode;
  crumbs?: readonly MicroAppCrumbItem[];
};

type MicroAppCrumbItem = { to: string; label: ReactNode };

type MicroAppCrumb = (params: Readonly<Record<string, string>>) => ReactNode;

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    crumb?: MicroAppCrumb;
  }
}
