import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

import { MicroAppHeader, mirrorInHash, pathFromHash } from '@local/micro-app';

import { useBoard } from '../features/boards/index.js';
import { BoardPage } from '../features/boards/pages/board-page.js';
import { BoardsPage } from '../features/boards/pages/boards-page.js';
import { HomePage } from '../features/home/pages/home-page.js';
import { useMeeting } from '../features/meetings/index.js';
import { MeetingPage } from '../features/meetings/pages/meeting-page.js';
import { MeetingsPage } from '../features/meetings/pages/meetings-page.js';
import { usePerson } from '../features/members/index.js';
import { MemberPage } from '../features/members/pages/member-page.js';
import { MembersPage } from '../features/members/pages/members-page.js';
import { useOrganization } from '../features/organizations/index.js';
import { OrganizationPage } from '../features/organizations/pages/organization-page.js';
import { OrganizationsPage } from '../features/organizations/pages/organizations-page.js';
import { useTranslate } from '../shared/lib/i18n/index.js';
import { appIcons } from '../shared/shared.js';
import { NotFound } from '../shared/ui/not-found.js';

export { createAppRouter };

// The app: the header (the app icon, the title, the modules as tabs; the breadcrumb below them) and the page of the
// route. No side navigation: the app is embedded in a page with content around it (later e.g. XWiki), where there is
// little horizontal space.

const MODULES = [
  { to: '/boards', label: 'modules.boards' },
  { to: '/meetings', label: 'modules.meetings' },
  { to: '/members', label: 'modules.members' },
  { to: '/organizations', label: 'modules.organizations' },
] as const;

// A crumb of a module: its name in the current language.
function TextCrumb({ label }: { label: (typeof MODULES)[number]['label'] }) {
  return useTranslate()(label);
}

function BoardCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return useBoard(id).board?.name ?? t('entities.board');
}

function MemberCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return usePerson(id).person?.name ?? t('entities.member');
}

function OrganizationCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return useOrganization(id).organization?.name ?? t('entities.organization');
}

function MeetingCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return useMeeting(id).meeting?.title ?? t('entities.meeting');
}

function Layout() {
  const t = useTranslate();
  const modules = [
    { to: '/', label: t('shell.overview'), exact: true },
    ...MODULES.map((module) => ({ to: module.to, label: t(module.label) })),
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

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: () => <NotFound /> });

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });

const boardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/boards',
  staticData: { crumb: () => <TextCrumb label="modules.boards" /> },
});
const boardListRoute = createRoute({ getParentRoute: () => boardsRoute, path: '/', component: BoardsPage });
const boardRoute = createRoute({
  getParentRoute: () => boardsRoute,
  path: '$boardId',
  staticData: { crumb: (params) => <BoardCrumb id={params['boardId'] ?? ''} /> },
});
const boardPageRoute = createRoute({ getParentRoute: () => boardRoute, path: '/', component: BoardPage });
// A meeting is below its board, and below "Meetings".
const boardMeetingsRoute = createRoute({ getParentRoute: () => boardRoute, path: 'meetings' });
const boardMeetingRoute = createRoute({
  getParentRoute: () => boardMeetingsRoute,
  path: '$meetingId',
  staticData: { crumb: (params) => <MeetingCrumb id={params['meetingId'] ?? ''} /> },
  component: MeetingPage,
});

const meetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/meetings',
  staticData: { crumb: () => <TextCrumb label="modules.meetings" /> },
});
const meetingListRoute = createRoute({ getParentRoute: () => meetingsRoute, path: '/', component: MeetingsPage });
const meetingRoute = createRoute({
  getParentRoute: () => meetingsRoute,
  path: '$meetingId',
  staticData: { crumb: (params) => <MeetingCrumb id={params['meetingId'] ?? ''} /> },
  component: MeetingPage,
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  staticData: { crumb: () => <TextCrumb label="modules.members" /> },
});
const memberListRoute = createRoute({ getParentRoute: () => membersRoute, path: '/', component: MembersPage });
const memberRoute = createRoute({
  getParentRoute: () => membersRoute,
  path: '$personId',
  staticData: { crumb: (params) => <MemberCrumb id={params['personId'] ?? ''} /> },
  component: MemberPage,
});

const organizationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations',
  staticData: { crumb: () => <TextCrumb label="modules.organizations" /> },
});
const organizationListRoute = createRoute({
  getParentRoute: () => organizationsRoute,
  path: '/',
  component: OrganizationsPage,
});
const organizationRoute = createRoute({
  getParentRoute: () => organizationsRoute,
  path: '$organizationId',
  staticData: { crumb: (params) => <OrganizationCrumb id={params['organizationId'] ?? ''} /> },
  component: OrganizationPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  boardsRoute.addChildren([
    boardListRoute,
    boardRoute.addChildren([boardPageRoute, boardMeetingsRoute.addChildren([boardMeetingRoute])]),
  ]),
  meetingsRoute.addChildren([meetingListRoute, meetingRoute]),
  membersRoute.addChildren([memberListRoute, memberRoute]),
  organizationsRoute.addChildren([organizationListRoute, organizationRoute]),
]);

const createBoardManagerRouter = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

// The routes live in memory, and can be mirrored in the URL hash after a prefix: `#board-manager/boards/b1/meetings/m12`.
// So a reload (or a shared link) opens the same page, and the browser's Back and Forward step through them. A hash with
// another start is left alone (the page's other tabs, `ui.ts`, or a host page's anchors). Without an element and a
// prefix (the `<board-manager>` element without `hash`), only the memory router.
function createAppRouter(element?: HTMLElement, hashPrefix?: string) {
  if (element === undefined || hashPrefix === undefined) {
    return { router: createBoardManagerRouter('/'), dispose: () => {} };
  }

  const prefix = `#${hashPrefix}`;
  const router = createBoardManagerRouter(pathFromHash(prefix) ?? '/');

  return { router, dispose: mirrorInHash(router, element, prefix) };
}
