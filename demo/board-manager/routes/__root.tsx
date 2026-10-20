import { createRootRoute, Outlet } from '@tanstack/react-router';

import { MicroAppHeader } from '@local/micro-app';

import { useTranslate } from '../shared/lib/i18n/index.js';
import { appIcons } from '../shared/shared.js';
import { NotFound } from '../shared/ui/not-found.js';

// The app: the header (the app icon, the title, the modules as tabs; the breadcrumb below them) and the page of the
// route. No side navigation: the app is embedded in a page with content around it (later e.g. XWiki), where there is
// little horizontal space.
export const Route = createRootRoute({ component: Layout, notFoundComponent: () => <NotFound /> });

function Layout() {
  const t = useTranslate();
  const modules = [
    { to: '/', label: t('shell.overview'), exact: true },
    { to: '/boards', label: t('modules.boards') },
    { to: '/meetings', label: t('modules.meetings') },
    { to: '/members', label: t('modules.members') },
    { to: '/organizations', label: t('modules.organizations') },
  ];

  return (
    <div className="board-manager__app">
      <MicroAppHeader icon={appIcons.app} title={t('shell.appName')} modules={modules} />
      <main className="board-manager__main">
        <Outlet />
      </main>
    </div>
  );
}
