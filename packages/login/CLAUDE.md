# login

`@local/login`: a generic login screen for apps (React, Mantine). Created 2026-10-03 (`@local/app-login` until 2026-10-10); the details are to be
discussed. The rules of the root's `CLAUDE.md` apply.

## Conventions

The general rules (copies of the repository's master, `docs/conventions/`):

@docs/conventions/general.md
@docs/conventions/css.md
@docs/conventions/typescript.md
@docs/conventions/react.md

## Working rules

- `src/api.ts` holds the API types. Types only, flat exports; `src/index.ts` re-exports them as a namespace:
  `export type * as Login from './api'` (`Login.Props`).
- Always add the decisions (also small ones) to this file, in the same step as the code.

## Decided (2026-10-03)

- React and Mantine (peer dependencies: `react`, `react-dom` `>=19`, `@mantine/core`, `@mantine/hooks` `^9.5.1`;
  the workspace has 9.5.1, pinned in the dev dependencies like `overlays`).
- Generic: the host decides what a login is (`onLogin`); the screen only collects and checks the input.
- `LoginScreen` (a React component, needs a `MantineProvider` above it) and `mountLoginScreen(element, props)` for a
  host without React: its own Mantine scope (`.login`, Mantine's variables on it, not on `:root`; Mantine's
  layered styles), returns `{ update(props), unmount() }`.
- Props (`Login.Props`): `title`, `subtitle?`, `logo?` (a React node, or a string of markup, e.g. an SVG in
  `currentColor`, drawn in the accent), `hint?` (a small note below the card, e.g. "A demo: any username and
  password"), `texts?` (each text can be replaced), `onLogin({ username, password })` (may return a promise).
- Forgot password and registration (2026-10-04, "as you like it"): two optional host functions; each switches on its
  part of the screen, so an app without them keeps the plain sign in:
  - `onForgotPassword({ account })` (the username or the email): the link "Forgot password?" under the password input.
  - `onRegister({ username, email, password })`: the line "Not yet registered? Create an account" under the button.
  - Both may return a promise, and reject (or throw) with a message to show.
- Providers, e.g. OIDC or SSO (2026-10-04): the screen only shows the buttons, the host signs in (a redirect to the
  identity provider with its own library, e.g. `oidc-client-ts`, or a popup): nothing of OIDC is in this package.
  - `providers: { id, label, icon? }[]` (the icon: a node or markup, optional per provider) and `onProvider(id)`
    (may return a promise, and reject with a message). Both are needed, else no buttons.
  - `passwordLogin` (default `true`): `false` hides the form, "Forgot password?" and "Create an account": only the
    providers (SSO only, the usual setup of a company's back office).
  - An OIDC helper (login redirect, callback, renew) in the package, a thin wrapper around `oidc-client-ts`, was left
    for later: it needs a real identity provider to test. Passkeys would be the same pattern (`onPasskey`).

## Behavior

- A card (30rem; 24rem, 26rem, then 28rem before) on a subtle background (Mantine's `gray.0`, `dark.8`), at least the window's height: the logo with the
  title and the subtitle (small, the app's name as a line on top), the heading "Sign in" (large: the view leads), the
  username (focused), the password (Mantine's `PasswordInput`, with its eye), the button (full width), below a line the
  footer. The card (with the hint, in `.login__column`) sits a bit above the middle (2026-10-08, the user's wish,
  like the overlays' dialogs): the screen is a grid of three rows, `minmax(xl, 2fr) auto minmax(md, 3fr)`, so the free
  space is split 40/60 above and below it. Accepted: the card moves by 40% of a change of its height (another view, an
  error). Before, it hung from the top (`clamp(1.5rem, 14vh, 7rem)`, 2026-10-04), so it never moved; exactly centered
  it had jumped by half the change. On a narrow screen (up to 30rem) it still hangs from the top, edge to edge.
- Submitting: both fields must be filled (else "Required" at the empty ones; the username is trimmed); then `onLogin`.
  While its promise is pending: the button's spinner, the fields read-only. A rejected promise (or a thrown error)
  shows its message in a red alert above the button (an empty message: "Invalid username or password."), and the
  password is selected again.
- The page's color scheme (`<html>`: its computed `color-scheme`) and language (`<html lang>`: English, German) are
  followed live.
- The look with `mountLoginScreen()` (2026-10-10, Claude's choice, the user left it open for later): the option
  `theme` (`Login.MountOptions`, a Mantine theme override, e.g. `{ primaryColor: 'teal' }`), merged over the login's
  own (Mantine's indigo, a small radius); `update(props, options)` changes it. Before: the accent from the page's
  custom property `--app-login-accent-color` (Mantine's ten shades as `color-mix()` of it), gone with the rule
  "no custom properties in the packages". `LoginScreen` inside an app's own `MantineProvider` uses that app's theme.

- The layout of the views (2026-10-04, after a critique of the register view: too tall and uniform, two stacked
  headers, a jumping card, inconsistent links):
  - The labels stay above their inputs (labels to the left of the inputs, left and right aligned, were tried and dropped).
  - The register view's passwords side by side (password, repeated password: they belong together); username and email
    full width above them. One row less than four stacked fields.
  - The footer, below a line, in every view, centered, the same style: "Not yet registered? Create an account" on the
    sign in view (only with `onRegister`), "Back to sign in" on the others. "Forgot password?" in the same size (`sm`).
  - Not solved: an error line pushes the next field down (about 20px each); reserving the room would make every form
    taller.
- Provider buttons (sign in view only): below the form, after a line with "or" (no line without the form; above the
  form first, 2026-10-04: the password login is the main way in, with "Forgot password?" and registration, so the
  providers are the alternative), full width, outlined (`default` variant), "Continue with {provider}" with the icon if
  there is one; below them the footer. One
  host function at a time: the clicked button shows the spinner, the other buttons and the form are locked (read-only
  fields, disabled button); a rejected promise shows its message (else "The sign in failed. Please try again.") under
  the buttons. New texts: `continueWith` (`{provider}` is replaced), `or`, `providerFailed` (English and German, each
  replaceable).
- `user-select: none` on the screen (2026-10-04), like the cockpit's frame; the inputs keep `text` (Safari: a field with `none`
  cannot be typed into).
- Small screens (2026-10-04, `login.css`):
  - The card's frame (border, radius, shadow, padding) is our CSS, not Paper's props, so it can be taken away.
  - Narrow (up to 30rem, a phone): the card is the whole page, edge to edge: full width (one grid column, `minmax(0, 1fr)`:
    with a centered column the card was as wide as its content, and a different width in each view), the page's
    background, no border, no shadow, no rounded corners, no space above it; the hint below it.
  - Short (up to 40rem high, e.g. a phone in landscape): at least 1rem above the card (the first row's minimum) and a
    smaller padding in it; it scrolls when it still does not fit (the sign in view with three providers needs about
    730px).
  - Narrow or touch (`pointer: coarse`): inputs and buttons 44px high, the inputs' text 16px (iOS zooms into a focused
    input with a smaller text), the link buttons with room above and below (bigger targets).
  - The safe areas of the screen (`env(safe-area-inset-*)`) are kept as padding.
- Three views in the one card, the heading and the fields change, the logo and the title stay (`LoginForm`,
  `ForgotForm`, `RegisterForm` in `LoginScreen.tsx`): "Sign in", "Reset password", "Create account". Each but the first
  has a link "Back to sign in".
  - Reset password: one field (username or email), the intro text, "Send instructions". After it succeeded, only the
    message "If an account exists for this entry, instructions … have been sent." (always the same: it must not tell
    whether an account exists) and the link back; the form is gone.
  - Register: username, email, password, repeated password. Checked before the call: all required, the email looks
    like one (`a@b.c`, not more: the server decides), the two passwords equal. No rule for the password's strength (that
    is the host's: it rejects with its message). After it succeeded: the sign in view with a green note "Your account
    has been created. You can sign in now.".
  - The same for each submit: required fields first, then the host's function (spinner, read-only fields), a rejected
    promise as the red alert (the error's message, else the text of the screen).
  - New texts (English and German, each replaceable): `forgotLink`, `forgotHeading`, `forgotIntro`, `account`,
    `forgotSubmit`, `forgotDone`, `registerPrompt`, `registerLink`, `registerHeading`, `registerSubmit`, `registerDone`,
    `email`, `passwordRepeat`, `invalidEmail`, `mismatch`, `back`.

## Layout and commands

- `src/api.ts` (types), `src/LoginScreen.tsx`, `src/mount.tsx`, `src/login.css`, `src/texts.ts`, `src/page.ts`
  (language and scheme of the page).
- `demo/`: the package's demo (`npm run dev`): any username and password sign in after 600 ms, the password "wrong"
  fails; the account "taken" exists already (registering it fails); reset and register answer after 600 ms; three made-up providers
  (Microsoft and Company SSO with an icon, Google without, which fails) sign in after 700 ms; `?sso=only` shows only
  the providers (`passwordLogin={false}`); signed in, a button signs out again. `demo/ui/`: the design language (a copy, like in every package).
- `npm run typecheck`, `npm run build` (library mode: `dist/index.js` and `dist/login.css`, also as
  `@local/login/style.css`; React and Mantine stay outside, also Mantine's styles, imported by `index.js`), `npm run format`.

## Not set up yet

- Tests.
