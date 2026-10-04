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
import { mountLoginScreen } from '../packages/app-login/src';
import type { AppLogin } from '../packages/app-login/src';

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

// Tabler icons (MIT), drawn in `currentColor`. The apps' icons are the ones in their own top bars (Media Manager:
// `TbFolders`, Board Manager: `TbPresentation`, User Manager: `TbShieldLock`).
const icon = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

// The hourglass of the subgroup "Planned".
const HOURGLASS = icon(
  '<path d="M6.5 7h11"/><path d="M6.5 17h11"/><path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1"/><path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1"/>',
);

const MAIN = 'Essentials';

// The made-up groups: only to show a larger navigation (the group select). Their apps are placeholders
// (`planned-demo`), without icons.
const FAKE: Record<string, Record<string, [string, string][]>> = {
  'Human Resources': {
    Employees: [['Directory', 'Everyone in the company, with their teams'], [
      'Onboarding',
      'Checklists for new colleagues',
    ], ['Org chart', 'Who reports to whom']],
    Absences: [['Vacation', 'Requests and approvals'], ['Sick leave', 'Reports and certificates'], [
      'Team calendar',
      'Who is away when',
    ]],
    Payroll: [['Salaries', 'Monthly payroll runs'], ['Expenses', 'Travel and other expenses']],
  },
  Finance: {
    Accounting: [['Invoices', 'Incoming and outgoing invoices'], ['Ledger', 'The general ledger'], [
      'Payments',
      'Transfers and their status',
    ]],
    Planning: [['Budgets', 'Budgets per department'], ['Forecasts', 'The expected figures of the year']],
    Reporting: [['Reports', 'Monthly and yearly reports'], ['Dashboards', 'The key figures at a glance']],
  },
};

const fakeApps = (): AppCockpit.MiniApp[] =>
  Object.entries(FAKE).flatMap(([group, subgroups]) =>
    Object.entries(subgroups).flatMap(([subgroup, apps]) =>
      apps.map(([title, description]) => ({
        id: `${group}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        description,
        group,
        subgroup,
        element: 'planned-demo',
        attributes: { description, note: 'A made-up app, only to show a larger navigation.' },
        load: planned,
      }))
    )
  );

customElements.define(
  'app-cockpit',
  createAppCockpitClass({
    title: 'Back Office',
    subtitle: 'Acme Corporate',
    // The search (Ctrl K), although there are only a few apps.
    search: true,
    // One group at a time (a select on top of the list): the real one, and two made-up ones. The subgroup "Planned" has
    // an icon (an hourglass); its entries have none.
    groupDisplay: 'select',
    groups: [
      {
        name: MAIN,
        icon: icon(
          '<path d="M3 12l3 3l3 -3l-3 -3z"/><path d="M15 12l3 3l3 -3l-3 -3z"/><path d="M9 6l3 3l3 -3l-3 -3z"/><path d="M9 18l3 3l3 -3l-3 -3z"/>',
        ),
        subgroups: [{ name: 'Planned', icon: HOURGLASS }],
      },
      {
        name: 'Human Resources',
        icon: icon(
          '<path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>',
        ),
        subgroups: [
          {
            name: 'Employees',
            icon: icon(
              '<path d="M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"/><path d="M7 10a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M15 8l2 0"/><path d="M15 12l2 0"/><path d="M7 16l10 0"/>',
            ),
          },
          {
            name: 'Absences',
            icon: icon(
              '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/><path d="M10 16l4 -2"/>',
            ),
          },
          {
            name: 'Payroll',
            icon: icon(
              '<path d="M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"/><path d="M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2"/>',
            ),
          },
        ],
      },
      {
        name: 'Finance',
        icon: icon(
          '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1"/><path d="M12 7v10"/>',
        ),
        subgroups: [
          {
            name: 'Accounting',
            icon: icon(
              '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 7l1 0"/><path d="M9 13l6 0"/><path d="M13 17l2 0"/>',
            ),
          },
          {
            name: 'Planning',
            icon: icon(
              '<path d="M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-6.8a2 2 0 0 1 -2 -2v-7a.9 .9 0 0 0 -1 -.8"/><path d="M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a1 1 0 0 1 -1 -1v-4.5"/>',
            ),
          },
          {
            name: 'Reporting',
            icon: icon(
              '<path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M4 20h14"/>',
            ),
          },
        ],
      },
    ],
    // Opened when the page starts without a hash.
    defaultApp: 'board-manager',
    storageKey: 'essential-components',
    // The cockpit's navigation (position and colors), the accent color, the page's color scheme, and a made-up menu
    // with the page's language, from the cockpit's own demo.
    footer: {
      actions: [
        navigationSetting(),
        accentSetting(),
        ...pageSettings({ schemes: ['system', 'light', 'dark'], scheme: 'light' }),
      ],
      menu: MENU,
    },
    // A made-up signed-in user, with their menu (from the cockpit's own demo).
    user: USER,
    userMenu: userMenu(() => signOut()),
    apps: [
      {
        id: 'data-navigator',
        title: 'Data navigator',
        description: 'A data table: search, filters, sorting, paging',
        group: MAIN,
        subgroup: 'Components',
        icon: icon('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>'),
        element: 'data-navigator-demo',
        load: async () => {
          define(
            'data-navigator-demo',
            (await import('../packages/data-navigator/demo/DataNavigatorDemo')).DataNavigatorDemo,
          );
        },
      },
      {
        id: 'file-upload',
        title: 'File upload',
        description: 'Drop or choose files, with progress and validation',
        group: MAIN,
        subgroup: 'Components',
        icon: icon('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="m7 9 5-5 5 5M12 4v12"/>'),
        element: 'file-upload-demo',
        load: async () => {
          define('file-upload-demo', (await import('../packages/file-upload/demo/FileUploadDemo')).FileUploadDemo);
        },
      },
      {
        id: 'dialogs-toasts',
        title: 'Dialogs + Toasts',
        description: 'Confirmations, prompts, forms in dialogs, and toasts',
        group: MAIN,
        subgroup: 'Components',
        icon: icon(
          '<path d="M8 9h8M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/>',
        ),
        element: 'overlays-demo',
        load: async () => {
          define('overlays-demo', (await import('../packages/overlays/src/demo/OverlaysDemo')).OverlaysDemo);
        },
      },
      {
        id: 'form-validation',
        title: 'Form validation',
        description: 'Validated forms with Zod, a useForm hook for React',
        group: MAIN,
        subgroup: 'Planned',
        element: 'planned-demo',
        attributes: {
          description:
            'Form validation for React with Zod: a useForm hook, the messages on the inputs, in any language.',
          note: 'Planned: the package exists (with tests, used by the Board Manager), its demo does not yet.',
        },
        load: planned,
      },
      {
        id: 'autocomplete',
        title: 'Autocomplete',
        description: 'A text input that suggests as you type',
        group: MAIN,
        subgroup: 'Planned',
        element: 'planned-demo',
        attributes: {
          description:
            'A text input that suggests as you type: local or loaded options, keyboard friendly, accessible.',
          note: 'Planned: there is no package and no demo yet.',
        },
        load: planned,
      },
      {
        id: 'media-manager',
        title: 'Media Manager',
        description: 'Folders and files, like a file manager',
        group: MAIN,
        subgroup: 'Apps',
        icon: icon(
          '<path d="M9 3h3l2 2h5a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"/><path d="M17 16v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h2"/>',
        ),
        element: 'media-manager-demo',
        load: async () => {
          define('media-manager-demo', (await import('./media-manager/app/MediaManagerDemo')).MediaManagerDemo);
        },
      },
      {
        id: 'board-manager',
        title: 'Board Manager',
        description: 'Boards, meetings, agendas, minutes and documents',
        group: MAIN,
        subgroup: 'Apps',
        icon: icon(
          '<path d="M3 4l18 0"/><path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10"/><path d="M12 16l0 4"/><path d="M9 20l6 0"/><path d="M8 12l3 -3l2 2l3 -3"/>',
        ),
        element: 'board-manager-demo',
        load: async () => {
          define('board-manager-demo', (await import('./board-manager/app/BoardManagerDemo')).BoardManagerDemo);
        },
      },
      {
        id: 'user-manager',
        title: 'User Manager',
        description: 'Users, groups, roles, and who may do what where',
        group: MAIN,
        subgroup: 'Apps',
        icon: icon(
          '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/><path d="M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12l0 2.5"/>',
        ),
        element: 'user-manager-demo',
        load: async () => {
          define('user-manager-demo', (await import('./user-manager/app/UserManagerDemo')).UserManagerDemo);
        },
      },
      ...fakeApps(),
    ],
  }),
);

// Signing out (the user menu's "Sign out") shows the login screen in place of the cockpit; any username and password
// sign in again (a demo: it is about the look). Signed out is remembered per browser, so a reload stays there.
const cockpit = document.querySelector<HTMLElement>('app-cockpit')!;
const loginHost = document.createElement('div');
let login: AppLogin.Mounted | undefined;

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
    subtitle: 'Acme Corporate',
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
  });
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
