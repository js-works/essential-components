import type { ReactNode } from 'react';

import type { LoginClassConfig, LoginElement, LoginProvider } from '../../api/login.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { LoginComponentConfig, LoginProps };

type LoginComponentConfig = Omit<LoginClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `LoginElement`), its slots as nodes (`children`: the default slot, the host's form,
// rendered straight into the element's light DOM).
type LoginProps = CockpitCommonProps<LoginElement> & {
  headline?: string;
  subheadline?: string;
  heading?: string;
  submitLabel?: string;
  submitting?: boolean;
  providers?: readonly LoginProvider[];
  signInWith?: ((providerId: string) => void | Promise<void>) | null;
  children?: ReactNode;
  logo?: ReactNode;
  footer?: ReactNode;
  hint?: ReactNode;
};
