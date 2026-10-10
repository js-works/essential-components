// The design language first, so the CSS of the demos comes after it.
import './ui/ui.css';
import './demo.css';
import {
  accentSetting,
  MENU,
  navigationSetting,
  pageSettings,
  USER,
  userMenu,
} from '../packages/app-cockpit/demo/footer';
import { createAppCockpitClass } from '../packages/app-cockpit/src';
import type { AppCockpit } from '../packages/app-cockpit/src';
import { mountLoginScreen } from '../packages/login/src';
import type { Login } from '../packages/login/src';

// The page: an app cockpit, with every demo as one of its mini-apps. The page's settings (in the cockpit's footer) set
// `<html lang>` and the color scheme for every demo. Each demo is a light DOM custom element of its project, loaded
// when it is opened the first time, and registered then under a tag name of our choice.
function define(tag: string, element: CustomElementConstructor): void {
  if (customElements.get(tag) === undefined) {
    customElements.define(tag, element);
  }
}

// The placeholder of the planned components (one element for all, told apart by its attributes).
const planned = async () => {
  define('planned-demo', (await import('./planned/PlannedDemo')).PlannedDemo);
};

// Prototypes to try out, in a section of the kebab menu (2026-10-09, the user's wish), before "Reset demo": a check
// item each, remembered per browser. "Filter drawer": the data table's filters in a drawer at the right edge
// instead of the filter view, for every table (the attribute `data-data-table-filter-drawer` on `<html>`, which every
// table follows live; a page flag of the prototype, not an API, see the todo in `packages/data-table/CLAUDE.md`).
const FILTER_DRAWER = 'data-data-table-filter-drawer';
const FILTER_DRAWER_KEY = 'demo-page:filter-drawer';

try {
  document.documentElement.toggleAttribute(FILTER_DRAWER, localStorage.getItem(FILTER_DRAWER_KEY) === 'on');
} catch {
  // Not remembered: off.
}

const prototypesSection: AppCockpit.MenuSection = {
  label: 'Prototypes',
  items: [{
    id: 'filter-drawer',
    label: 'Filter drawer',
    checked: () => document.documentElement.hasAttribute(FILTER_DRAWER),
    onSelect: () => {
      const on = document.documentElement.toggleAttribute(FILTER_DRAWER);

      try {
        localStorage.setItem(FILTER_DRAWER_KEY, on ? 'on' : 'off');
      } catch {
        // Not remembered.
      }
    },
  }],
};

// The made-up kebab menu of the cockpit's demo, with the prototypes before its last section ("Reset demo").
const menu: AppCockpit.Footer['menu'] = MENU === undefined
  ? [prototypesSection]
  : [...MENU.slice(0, -1), prototypesSection, ...MENU.slice(-1)];

// Tabler icons (MIT), drawn in `currentColor`. The folders and the five real apps have icons, the demos of the components (Internals) none (2026-10-07).
const icon = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

customElements.define(
  'app-cockpit',
  createAppCockpitClass({
    title: 'Back Office',
    subtitle: 'Acme Corporate',
    // The search (Ctrl K), although there are only a few apps.
    search: true,
    // The apps of "Apps" pinned (`placement`, 2026-10-08, the user's wishes; "Administration" too for a few hours):
    // entries of their own, first (the topbar's line, the rail, the start page); in the expanded sidebar and the search
    // still in their folder.
    // No "Recent" section. Two groups (sections): "Main" with the folders "Apps" (Human Resources, Time Tracker, Board
    // Manager) and "Administration" (File Center, User Manager; 2026-10-08, the user's wish: one folder "Applications"
    // before), "Internals" with the folders
    // (subgroups, their apps indented along a guide line). The folders "Components" and "Planned" and the five real apps have icons, the folders "Apps" and "Administration" none (2026-10-09, the user's wish).
    recent: false,
    collapsibleGroups: false,
    // The open apps below the open one (2026-10-07): switch between them, close them.
    taskbar: true,
    groups: [{
      name: 'Main',
      subgroups: [{
        name: 'Apps',
      }, {
        name: 'Administration',
        // Pinned (2026-10-08, the user's wish): an entry of its own in the topbar (a dropdown) and the rail.
        placement: 'pinned',
      }],
    }, {
      name: 'Internals',
      subgroups: [
        {
          name: 'Components',
          icon: icon(
            '<path d="M3 12l3 3l3 -3l-3 -3z"/><path d="M15 12l3 3l3 -3l-3 -3z"/><path d="M9 6l3 3l3 -3l-3 -3z"/><path d="M9 18l3 3l3 -3l-3 -3z"/>',
          ),
        },
        {
          name: 'Planned',
          icon: icon(
            '<path d="M6.5 7h11"/><path d="M6.5 17h11"/><path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z"/><path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z"/>',
          ),
        },
      ],
    }],
    // Opened without a hash (2026-10-08, the user's wish; the start page for a few hours that day, Human Resources
    // before, the Board Manager before that).
    defaultItem: 'human-resources',
    // The start page (2026-10-08, the user's wish): shown when every app is closed, and by the logo. Not
    // `startPage: true` here: the footer's "Navigation" menu sets the attribute `start-page` (on by default), and a
    // stored "Off" must win over the config (an absent boolean attribute would not).
    storageKey: 'essential-components',
    // The base text size of the cockpit, the same as the apps' (`demo/demo.css`).
    theme: { fontSize: '14px' },
    // The cockpit's navigation (position and colors), the accent color, the page's color scheme, and a made-up menu
    // with the page's language, from the cockpit's own demo.
    footer: {
      actions: [
        // The navigation dark by default (2026-10-08, the user's wish; like the page before), the topbar of two lines
        // by default (2026-10-08, the user's wish; automatic before).
        // The start page on by default, switchable (2026-10-08, the user's wish).
        navigationSetting('app-cockpit', { scheme: 'dark', nav: 'top', startPage: true }),
        accentSetting('indigo'),
        ...pageSettings({ schemes: ['system', 'light', 'dark'], scheme: 'light' }),
      ],
      menu,
    },
    // A made-up signed-in user, with their menu (from the cockpit's own demo).
    user: USER,
    userMenu: userMenu(() => signOut()),
    items: [
      {
        id: 'human-resources',
        title: 'Human Resources',
        description: 'Employees, departments, recruiting, onboarding and offboarding',
        group: 'Main',
        subgroup: 'Apps',
        placement: 'pinned',
        icon: icon(
          '<path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1"/><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M17 10h2a2 2 0 0 1 2 2v1"/><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M3 13v-1a2 2 0 0 1 2 -2h2"/>',
        ),
        element: 'human-resources-demo',
        load: async () => {
          define(
            'human-resources-demo',
            (await import('./human-resources/app/HumanResourcesDemo')).HumanResourcesDemo,
          );
        },
      },
      {
        id: 'time-tracker',
        title: 'Time Tracker',
        description: 'The clock, timesheets, leave, sick calls and the team calendar',
        group: 'Main',
        subgroup: 'Apps',
        placement: 'pinned',
        icon: icon('<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>'),
        element: 'time-tracker-demo',
        load: async () => {
          define('time-tracker-demo', (await import('./time-tracker/app/TimeTrackerDemo')).TimeTrackerDemo);
        },
      },
      {
        id: 'board-manager',
        title: 'Board Manager',
        description: 'Boards, meetings, agendas, minutes and documents',
        group: 'Main',
        subgroup: 'Apps',
        placement: 'pinned',
        icon: icon(
          '<path d="M3 4l18 0"/><path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10"/><path d="M12 16l0 4"/><path d="M9 20l6 0"/><path d="M8 12l3 -3l2 2l3 -3"/>',
        ),
        element: 'board-manager-demo',
        load: async () => {
          define('board-manager-demo', (await import('./board-manager/app/BoardManagerDemo')).BoardManagerDemo);
        },
      },
      {
        id: 'file-center',
        title: 'File Center',
        description: 'Storages, folders and files, like a file manager',
        group: 'Main',
        subgroup: 'Administration',
        icon: icon(
          '<path d="M9 3h3l2 2h5a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"/><path d="M17 16v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h2"/>',
        ),
        element: 'file-center-demo',
        load: async () => {
          define('file-center-demo', (await import('./file-center/app/FileCenterDemo')).FileCenterDemo);
        },
      },
      {
        id: 'user-manager',
        title: 'User Manager',
        description: 'Users, groups, roles, and who may do what where',
        group: 'Main',
        subgroup: 'Administration',
        icon: icon(
          '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/><path d="M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12l0 2.5"/>',
        ),
        element: 'user-manager-demo',
        load: async () => {
          define('user-manager-demo', (await import('./user-manager/app/UserManagerDemo')).UserManagerDemo);
        },
      },
      {
        id: 'data-table',
        title: 'Data table',
        description: 'A data table: search, filters, sorting, paging',
        group: 'Internals',
        subgroup: 'Components',
        element: 'data-table-demo',
        load: async () => {
          define(
            'data-table-demo',
            (await import('../packages/data-table/demo/DataTableDemo')).DataTableDemo,
          );
        },
      },
      {
        id: 'file-upload',
        title: 'File upload',
        description: 'Drop or choose files, with progress and validation',
        group: 'Internals',
        subgroup: 'Components',
        element: 'file-upload-demo',
        load: async () => {
          define('file-upload-demo', (await import('../packages/file-upload/demo/FileUploadDemo')).FileUploadDemo);
        },
      },
      {
        id: 'dialogs-toasts',
        title: 'Dialogs + Toasts',
        description: 'Confirmations, prompts, forms in dialogs, and toasts',
        group: 'Internals',
        subgroup: 'Components',
        element: 'overlays-demo',
        load: async () => {
          define('overlays-demo', (await import('../packages/overlays/src/demo/OverlaysDemo')).OverlaysDemo);
        },
      },
      {
        id: 'form-validation',
        title: 'Form validation',
        description: 'Validated forms with Zod, a useForm hook for React',
        group: 'Internals',
        subgroup: 'Components',
        element: 'form-validation-demo',
        load: async () => {
          define(
            'form-validation-demo',
            (await import('../packages/form-validation/demo/FormValidationDemo')).FormValidationDemo,
          );
        },
      },
      {
        id: 'autocomplete',
        title: 'Autocomplete',
        description: 'A text input that suggests as you type',
        group: 'Internals',
        subgroup: 'Planned',
        element: 'planned-demo',
        attributes: {
          description:
            'A text input that suggests as you type: local or loaded options, keyboard friendly, accessible.',
          note: 'Planned: there is no package and no demo yet.',
        },
        load: planned,
      },
    ],
  }),
);

// Signing out (the user menu's "Sign out") shows the login screen in place of the cockpit; any username and password
// sign in again (a demo: it is about the look). Signed out is remembered per browser, so a reload stays there.
const cockpit = document.querySelector<HTMLElement>('app-cockpit')!;
const loginHost = document.createElement('div');
let login: Login.Mounted | undefined;

const LOGO =
  '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" opacity="0.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" opacity="0.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg>';

function remember(signedIn: boolean): void {
  try {
    localStorage.setItem('demo-page:signed-in', String(signedIn));
  } catch {
    // Not remembered.
  }
}

// Signing out: the cockpit fades out (its CSS transition, `data-fading`), then the login screen is shown, which fades
// in by itself (the animation of `.login-host`, when it is added).
let signingOut = false;

async function signOut(): Promise<void> {
  if (signingOut) {
    return;
  }

  signingOut = true;
  remember(false);
  cockpit.dataset['fading'] = '';
  await new Promise((resolve) =>
    setTimeout(resolve, parseFloat(getComputedStyle(cockpit).transitionDuration) * 1000 || 0)
  );
  delete cockpit.dataset['fading'];
  showLogin();
  signingOut = false;
}

function showLogin(): void {
  cockpit.hidden = true;
  loginHost.className = 'login-host';
  document.body.append(loginHost);
  login ??= mountLoginScreen(loginHost, {
    title: 'Back Office',
    subtitle: 'Welcome to Acme Corporate',
    logo: LOGO,
    hint: 'A demo: any username and password sign in.',
    // Made-up identity providers (OIDC or SSO): the host would redirect to them. Here they sign in after a moment.
    providers: [
      {
        id: 'microsoft',
        label: 'Microsoft',
        icon:
          '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8.5" height="8.5" fill="#f25022"/><rect x="12.5" y="3" width="8.5" height="8.5" fill="#7fba00"/><rect x="3" y="12.5" width="8.5" height="8.5" fill="#00a4ef"/><rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#ffb900"/></svg>',
      },
      { id: 'google', label: 'Google' },
      {
        id: 'sso',
        label: 'Company SSO',
        icon:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.85 12.15 19 4M18 5l3 3M15 8l2 2"/></svg>',
      },
    ],
    onProvider: async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      signIn();
    },
    // The made-up server: both answer after a moment (the account "taken" exists already).
    onForgotPassword: () => new Promise((resolve) => setTimeout(resolve, 600)),
    onRegister: async ({ username }) => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (username.toLowerCase() === 'taken') {
        throw new Error('This username is already taken.');
      }
    },
    onLogin: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      signIn();
    },
  }, { theme: { primaryColor: loginAccent() } });
}

// The login's accent: the page's (the footer's "Accent color", remembered per browser; indigo by default), as one of
// Mantine's colors (the menu's colors are Mantine's, shade 6); the design language's: Mantine's blue, the closest.
function loginAccent(): string {
  let accent = 'indigo';

  try {
    accent = localStorage.getItem('demo-page:accent') ?? accent;
  } catch {
    // The default.
  }

  return accent === 'design' ? 'blue' : accent;
}

function signIn(): void {
  remember(true);
  login?.unmount();
  login = undefined;
  loginHost.remove();
  cockpit.hidden = false;
}

try {
  if (localStorage.getItem('demo-page:signed-in') === 'false') {
    showLogin();
  }
} catch {
  // Signed in.
}
