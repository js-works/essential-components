// The design language first, so the demo's own CSS comes after it.
import './ui/ui.css';
import './demo.css';
import { createAppCockpitClass } from '../src';
import type { AppCockpit } from '../src';
import { FEW, GROUPS, MANY, SOME } from './apps';
import { DemoApp } from './DemoApp';
import { accentSetting, layoutSetting, MENU, pageSettings, USER, USER_MENU } from './footer';

// The page: a cockpit with 3, 30 or 100 apps (kept in the query string: the apps of a cockpit are fixed, so a change
// reloads the page). Its footer has the page's settings: the number of apps, the language and the color scheme.
const SETS = { few: FEW, some: SOME, many: MANY } as const;
const param = new URLSearchParams(location.search).get('apps');
const set: keyof typeof SETS = param === 'some' || param === 'many' ? param : 'few';

const appsAction: AppCockpit.Action = {
  id: 'apps',
  label: 'Apps',
  icon:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
  choices: {
    options: [{ value: 'few', label: '3 apps' }, { value: 'some', label: '30 apps' }, {
      value: 'many',
      label: '100 apps',
    }],
    value: () => set,
    onChange: (value) => {
      location.href = `${location.pathname}${value === 'few' ? '' : `?apps=${value}`}`;
    },
  },
};

customElements.define('demo-app', DemoApp);
customElements.define(
  'app-cockpit',
  createAppCockpitClass({
    title: set === 'few' ? 'My Office' : 'Acme Office',
    subtitle: set === 'few' ? 'Team workspace' : 'Acme Corporation · Headquarters',
    apps: SETS[set],
    // The 100 apps: icons for their groups.
    ...(set === 'many' ? { groups: GROUPS } : {}),
    // The 100 apps: one group at a time (a select on top of the list).
    groupDisplay: set === 'many' ? 'select' : 'sections',
    footer: {
      actions: [
        appsAction,
        layoutSetting(),
        accentSetting(),
        ...pageSettings({ schemes: ['system', 'light', 'dark'], scheme: 'system' }),
      ],
      menu: MENU,
    },
    user: USER,
    userMenu: USER_MENU,
    storageKey: `app-cockpit-demo-${set}`,
  }),
);
