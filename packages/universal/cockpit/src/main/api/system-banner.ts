import type { I18nAdapter } from './i18n.js';
import type { CockpitTheme } from './theme.js';

export type { SystemBannerClass, SystemBannerClassConfig, SystemBannerElement, SystemBannerTone };

type SystemBannerClassConfig = {
  // Fixed per class: it reads `accentColor`, `fontSize`, `fontFamily`, `buttonActiveTransform`, `buttonBorderRadius`.
  theme?: CockpitTheme;
  // The close button's label (the namespace `'cockpit'`, the key `systemBannerDismiss`): the adapter, the same for every
  // element of the class. Without one: English and en-US.
  i18n?: I18nAdapter;
};

type SystemBannerClass = new() => SystemBannerElement;

// The banner's color and icon: `info` in the accent, `warning`, `danger`, `success`.
type SystemBannerTone = 'info' | 'warning' | 'danger' | 'success';

// A strip across the page (in the cockpit: its slot `banner`, above everything) for what every user must see: planned
// maintenance, a test environment, acting as another user. The tone's icon, the message (`message`, or the default
// slot for one with a link), an optional button (`action-label`), an optional close button (`dismissible`). Several
// stack. A `danger` banner is an alert (`role="alert"`), the others a status. The element adds no children of its own.
//
// Events: `action` (an `Event`, bubbling) when its button is clicked; `dismiss` (an `Event`, bubbling, cancelable) when
// its close button is: not canceled, the banner hides itself (`hidden`). Remembering it is the host's.
type SystemBannerElement = HTMLElement & {
  // The attribute `tone` (default `info`; an invalid attribute is the default, an invalid value a `RangeError`).
  tone: SystemBannerTone;
  // The text; empty: the default slot.
  message: string;
  // The attribute `action-label`: the button at the end (e.g. "Stop"; none when empty).
  actionLabel: string;
  dismissible: boolean;
};
