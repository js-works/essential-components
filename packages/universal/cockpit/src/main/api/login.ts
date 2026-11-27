import type { I18nAdapter } from './i18n.js';
import type { CockpitTheme } from './theme.js';

export type { LoginClass, LoginClassConfig, LoginElement, LoginProvider };

type LoginClassConfig = {
  theme?: CockpitTheme;
  // The texts of the provider buttons (the namespace `'cockpit'`, the keys `login…`): the adapter, the same for every
  // element of the class. Without one: English and en-US.
  i18n?: I18nAdapter;
};

type LoginClass = new() => LoginElement;

// An identity provider (OIDC, SSO) of the login: a button "Continue with <label>".
type LoginProvider = {
  id: string;
  label: string;
  // SVG markup (drawn in `currentColor`, or in its own colors).
  icon?: string;
};

// The login screen: its layout (a card a bit above the middle, edge to edge on a phone) and its buttons (the submit
// button, the providers'). The host gives the rest of the content and its logic (its forms, the views) and owns it;
// the element adds no children of its own, so the host's inputs stay in the light DOM (password managers, autofill).
//
// Slots: the default one (the view: a form, notes), `logo` (e.g. an SVG in `currentColor`, drawn in the accent;
// default: the cockpit's logo, four squares), `footer` (below a line, centered, e.g. "Not yet registered? Create an
// account"; no line without it), `hint` (a small note below the card).
type LoginElement = HTMLElement & {
  // The attribute `headline` (not `title`: the browser would show it as a tooltip).
  headline: string;
  subheadline: string;
  // The view's heading, e.g. "Sign in" (none when empty).
  heading: string;
  // The attribute `submit-label`: the submit button below the host's content (e.g. "Sign in"; none when empty). It
  // submits the host's form (the first `<form>` in the default slot: `requestSubmit()`, its submit event); so does
  // Enter in its inputs. The host's form has no submit button of its own.
  submitLabel: string;
  // While the host's handler runs: the submit button's spinner, the providers disabled.
  submitting: boolean;
  // The buttons below the host's content (after a line "or" when there is content), with `signInWith`.
  providers: readonly LoginProvider[];
  // The host signs in with a provider (a redirect, a popup); `null`: no buttons. It may return a promise (the button's
  // spinner while pending, the other buttons disabled) and reject with a message to show (else the login's own text).
  signInWith: ((providerId: string) => void | Promise<void>) | null;
};
