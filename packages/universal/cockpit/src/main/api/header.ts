import type { I18nAdapter } from './i18n.js';
import type { AppHeaderTheme } from './theme.js';

export type {
  AppHeaderClass,
  AppHeaderClassConfig,
  AppHeaderCrumb,
  AppHeaderElement,
  AppHeaderLink,
  AppHeaderNavigateDetail,
  AppHeaderStep,
};

// A link of the header (a module, an entry of the switcher): a real `<a href>`, so a middle click opens a new tab; a
// plain click fires `navigate` first (see `AppHeaderNavigateDetail`).
type AppHeaderLink = {
  id: string;
  label: string;
  href: string;
  // SVG markup, drawn in `currentColor`, and a line below the label, muted (only in the switcher's menu).
  icon?: string;
  description?: string;
};

// A crumb after "Home"; the last one is the current page (no link, its `href` ignored).
type AppHeaderCrumb = {
  label: string;
  href?: string;
};

// Back or Forward is possible; `page`, the page it leads to, names it in the tooltip ("Back to …").
type AppHeaderStep = {
  page?: string;
};

// The detail of the cancelable `navigate` event (a plain click on a link, "Home", a crumb, an entry of the switcher).
// A router adapter calls `preventDefault()` and navigates itself; else the browser follows the link.
type AppHeaderNavigateDetail = {
  href: string;
};

// The header of an app: one line with its icon, its title (a switcher when `switcher` has entries), its modules as tabs
// (a menu when narrow), the host's slot `end` (e.g. a user menu) and Back and Forward (hidden when narrow); below it the
// breadcrumb ("Home", then `crumbs`). It never changes the URL itself: it only shows the state and fires events
// (`navigate`, `back`, `forward`).
type AppHeaderElement = HTMLElement & {
  // SVG markup; `''`: none.
  icon: string;
  // Not `title`: that is the global attribute of every element (its tooltip).
  heading: string;
  // The other apps the title switches to (with the current one, see `activeSwitcherItem`); `[]`: the title is text.
  switcher: readonly AppHeaderLink[];
  activeSwitcherItem: string;
  modules: readonly AppHeaderLink[];
  // The `id` of the current module; `''`: none (e.g. the start page).
  activeModule: string;
  homeHref: string;
  crumbs: readonly AppHeaderCrumb[];
  // `null`: at that end of the history (the button disabled).
  back: AppHeaderStep | null;
  forward: AppHeaderStep | null;
  theme: AppHeaderTheme;
};

type AppHeaderClassConfig = {
  // The first value of the element's `theme`.
  theme?: AppHeaderTheme;
  // The texts (the namespace `'cockpit'`, `CockpitTexts`): the adapter, asked once on the first connect with the element
  // itself. Without one: English and en-US.
  i18n?: { type: 'factory'; getAdapter: (element: HTMLElement) => I18nAdapter };
};

type AppHeaderClass = new() => AppHeaderElement;
