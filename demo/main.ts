// The design language first, so the CSS of the demos comes after it.
import './ui/ui.css';
import './demo.css';
import { layoutSetting, MENU, pageSettings, USER, USER_MENU } from '../packages/app-cockpit/demo/footer';
import { createAppCockpitClass } from '../packages/app-cockpit/src';

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

customElements.define(
  'app-cockpit',
  createAppCockpitClass({
    title: 'App Center',
    // The search (Ctrl K), although there are only a few apps.
    search: true,
    // The subgroup "Planned" has an icon (an hourglass); its entries have none.
    groups: [
      {
        name: 'Components',
        subgroups: [
          {
            name: 'Planned',
            icon: icon(
              '<path d="M6.5 7h11"/><path d="M6.5 17h11"/><path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1"/><path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1"/>',
            ),
          },
        ],
      },
    ],
    // Opened when the page starts without a hash.
    defaultApp: 'board-manager',
    storageKey: 'essential-components',
    // The cockpit's layout, the page's settings (language, color scheme) and a made-up menu, from the cockpit's own demo.
    footer: {
      actions: [layoutSetting(), ...pageSettings({ schemes: ['system', 'light', 'dark'], scheme: 'light' })],
      menu: MENU,
    },
    // A made-up signed-in user, with their menu (from the cockpit's own demo).
    user: USER,
    userMenu: USER_MENU,
    apps: [
      {
        id: 'data-navigator',
        title: 'Data navigator',
        description: 'A data table: search, filters, sorting, paging',
        group: 'Components',
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
        group: 'Components',
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
        group: 'Components',
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
        group: 'Components',
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
        group: 'Components',
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
        group: 'Apps',
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
        group: 'Apps',
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
        group: 'Apps',
        icon: icon(
          '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/><path d="M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12 12l0 2.5"/>',
        ),
        element: 'user-manager-demo',
        load: async () => {
          define('user-manager-demo', (await import('./user-manager/app/UserManagerDemo')).UserManagerDemo);
        },
      },
    ],
  }),
);
