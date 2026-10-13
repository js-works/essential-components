import type { Nav, NavItem, NavScheme } from './navigation.js';
import type { Theme } from './theme.js';

export type { CockpitElement, Density, ElementClass };

// The density of the sidebar (its rows and the gaps between its sections and groups) and of the popups' rows; the
// same values as the data table's `density`. The topbar's lines and the font sizes stay.
type Density = 'compact' | 'normal' | 'comfortable';

type CockpitElement = HTMLElement & {
  nav: Nav;
  navScheme: NavScheme;
  density: Density;
  readonly activeItem: NavItem | undefined;
  open(id: string): void;
  // Closes an open item (removes its element, so its state is lost); the open one: the one used before it is shown.
  // The last open item cannot be closed, except with a start page (then that is shown).
  close(id: string): void;
  // A start page (the attribute `start-page`; see the config's `startPage`).
  startPage: boolean;
  // The look (see `Theme`); a new object to change it.
  theme: Theme;
};

type ElementClass = new() => CockpitElement;
