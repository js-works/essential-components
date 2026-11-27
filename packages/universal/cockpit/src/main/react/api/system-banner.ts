import type { ReactNode } from 'react';

import type { SystemBannerClassConfig, SystemBannerElement, SystemBannerTone } from '../../api/system-banner.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { SystemBannerComponentConfig, SystemBannerProps };

type SystemBannerComponentConfig = Omit<SystemBannerClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `SystemBannerElement`), `children` the default slot (a message with a link), its
// events as callbacks (`onDismiss`: the DOM event, `preventDefault()` keeps the banner shown).
type SystemBannerProps = CockpitCommonProps<SystemBannerElement> & {
  tone?: SystemBannerTone;
  message?: string;
  actionLabel?: string;
  dismissible?: boolean;
  children?: ReactNode;
  onAction?: (event: Event) => void;
  onDismiss?: (event: Event) => void;
};
