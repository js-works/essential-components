import type { ReactNode } from 'react';

import type {
  StatusViewClassConfig,
  StatusViewElement,
  StatusViewKind,
  StatusViewLayout,
} from '../../api/status-view.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { StatusViewComponentConfig, StatusViewProps };

type StatusViewComponentConfig = Omit<StatusViewClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `StatusViewElement`), its slots as nodes (`children`: the default slot), its event as
// a callback.
type StatusViewProps = CockpitCommonProps<StatusViewElement> & {
  layout?: StatusViewLayout;
  kind?: StatusViewKind;
  headline?: string;
  subheadline?: string;
  heading?: string;
  message?: string;
  actionLabel?: string;
  children?: ReactNode;
  icon?: ReactNode;
  logo?: ReactNode;
  footer?: ReactNode;
  hint?: ReactNode;
  onAction?: (event: Event) => void;
};
