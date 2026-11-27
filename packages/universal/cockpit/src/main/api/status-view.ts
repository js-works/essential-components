import type { I18nAdapter } from './i18n.js';
import type { CockpitTheme } from './theme.js';

export type { StatusViewClass, StatusViewClassConfig, StatusViewElement, StatusViewKind, StatusViewLayout };

type StatusViewClassConfig = {
  // Fixed per class: it reads `accentColor`, `fontSize`, `fontFamily`, `buttonActiveTransform`, `buttonBorderRadius`.
  theme?: CockpitTheme;
  // The default texts of the kinds (the namespace `'cockpit'`, the keys `statusView…`): the adapter, the same for every
  // element of the class. Without one: English and en-US.
  i18n?: I18nAdapter;
};

type StatusViewClass = new() => StatusViewElement;

// A preset: its icon, its default heading and message. `default`: none (only what the host gives).
type StatusViewKind =
  | 'default'
  | 'empty'
  | 'no-results'
  | 'not-found'
  | 'forbidden'
  | 'expired'
  | 'maintenance'
  | 'error';

// `inline`: inside a page (the page's background and text color); `screen`: a card on a screen of its own, filling its
// container (the host gives the height: `100dvh` for the whole window), like the login.
type StatusViewLayout = 'inline' | 'screen';

// Why there is nothing (else) to show: an empty list, no results, a page that does not exist, no access, an expired
// session, maintenance, an error. Every part is shown only when given: the brand (with `headline`), the icon (the
// kind's or the slot's), the heading and the message (the kind's or the host's), the host's extras, the button, the
// footer, the hint. The element adds no children of its own.
//
// Slots: the default one (below the message: the host's extras, e.g. an error id), `icon` (in place of the kind's, an
// SVG in `currentColor`, drawn in the accent), `logo` (with the brand; default: the cockpit's logo, four squares),
// `footer` (below a line, centered), `hint` (a small note at the end; below the card on a screen).
//
// Events: `action` (an `Event`, bubbling) when its button is clicked.
type StatusViewElement = HTMLElement & {
  // The attributes `layout` (default `inline`) and `kind` (default `default`): an invalid attribute is the default, an
  // invalid value a `RangeError`.
  layout: StatusViewLayout;
  kind: StatusViewKind;
  // The attribute `headline` (not `title`: the browser would show it as a tooltip): the brand, with `subheadline` and the
  // logo; none when empty.
  headline: string;
  subheadline: string;
  // In place of the kind's heading and message (the kind's when empty).
  heading: string;
  message: string;
  // The attribute `action-label`: the button below the message (e.g. "Back to start"; none when empty).
  actionLabel: string;
};
