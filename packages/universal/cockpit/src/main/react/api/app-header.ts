import type { ReactNode } from 'react';

import type {
  AppHeaderClassConfig,
  AppHeaderCrumb,
  AppHeaderElement,
  AppHeaderLink,
  AppHeaderNavigateDetail,
  AppHeaderStep,
} from '../../api/header.js';
import type { CockpitTheme } from '../../api/theme.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { AppHeaderComponentConfig, AppHeaderProps };

type AppHeaderComponentConfig = Omit<AppHeaderClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `AppHeaderElement`; a missing prop is the element's default, `theme` the config's),
// its slots as nodes, its events as callbacks (the DOM events: `preventDefault()` cancels them). `icon` is the slot
// (the element's `icon` property, SVG markup, stays empty); `crumbLabels` the slots `crumb-<index>` (a crumb's label
// as a node, e.g. a name that is loaded).
type AppHeaderProps = CockpitCommonProps<AppHeaderElement> & {
  heading?: string;
  switcher?: readonly AppHeaderLink[];
  activeSwitcherItem?: string;
  modules?: readonly AppHeaderLink[];
  activeModule?: string;
  homeHref?: string;
  crumbs?: readonly AppHeaderCrumb[];
  back?: AppHeaderStep | null;
  forward?: AppHeaderStep | null;
  theme?: CockpitTheme;
  icon?: ReactNode;
  end?: ReactNode;
  crumbLabels?: readonly ReactNode[];
  backPage?: ReactNode;
  forwardPage?: ReactNode;
  onNavigate?: (event: CustomEvent<AppHeaderNavigateDetail>) => void;
  onBack?: (event: Event) => void;
  onForward?: (event: Event) => void;
};
