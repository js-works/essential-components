export type { CockpitTheme };

// The look of every element of the package (the cockpit, the taskbar, the nav tree, the app header, the login, the
// status view): one object, given to each class (`createLoginClass({ theme })`, …); each element reads the keys it
// needs. Without a key, its default (the colors are the design language's). A key that
// belongs to one part starts with its name (`sidebar…`, `navTree…`, `header…`). Elements with a `theme` property
// (the cockpit, the nav tree, the app header) switch it live (a new object); the login's and the status view's is
// fixed per class. Ready themes: `createCockpitTheme()`, `createMantineCockpitTheme()`.
type CockpitTheme = {
  // One color for all: the active entries, the buttons, the focus rings, the logo. A custom one is lighter in a dark
  // scheme (e.g. the dark navigation) by a mix with white (default: the design language's, which has both).
  accentColor?: string;
  // The base size of the text and the icons (default `14px`, the apps' normal text); every other size follows it.
  fontSize?: string;
  // Default `system-ui, sans-serif`: the package's own, so a mini-app's global CSS does not change it.
  fontFamily?: string;
  // Pressed, a push button's CSS `transform` (default `none`): e.g. `translateY(1px)` like Mantine's, `scale(0.96)`.
  // The push buttons: the cockpit's icon buttons (search, footer, topbar) and "Try again", the app header's switcher,
  // Back and Forward, the login's and the status view's buttons; not tabs, menu items or list entries.
  buttonActiveTransform?: string;
  // The corners of those push buttons (default `5px`, the design language's), except the app header's
  // (`headerBorderRadius`, its tabs and buttons alike).
  buttonBorderRadius?: string;

  // The cockpit: the sidebar's default width (`256px`; the user can resize it), the rail's (`68px`), the room around
  // the open app beside the expanded sidebar and with the bottom bar (`16px 20px`).
  sidebarWidth?: string;
  railWidth?: string;
  contentPadding?: string;

  // The nav tree: the icons of the items and folders (default: the accent; in the cockpit's sidebar white strokes).
  navTreeIconColor?: string;

  // The app header. Without them, the active tab, the links, the focus ring and the icon's tile follow the accent.
  headerBackgroundColor?: string;
  headerTextColor?: string;
  // The line below the first line (also the menus' border).
  headerDividerColor?: string;
  // The app's icon on its tile.
  headerIconBackgroundColor?: string;
  headerIconColor?: string;
  headerIconBorderRadius?: string;
  // The modules' tabs (and the narrow modules menu's trigger).
  headerTabHoverBackgroundColor?: string;
  headerTabActiveBackgroundColor?: string;
  headerTabActiveTextColor?: string;
  // The crumbs that are links; the marks between the crumbs.
  headerLinkTextColor?: string;
  headerSeparatorColor?: string;
  // The menus (the switcher, the narrow modules menu); the entries' descriptions.
  headerMenuBackgroundColor?: string;
  headerMenuBoxShadow?: string;
  headerMenuDescriptionTextColor?: string;
  // The tooltips of Back and Forward.
  headerTooltipBackgroundColor?: string;
  headerTooltipTextColor?: string;
  headerTooltipBorderRadius?: string;
  // Tabs and buttons (not the icon's tile: `headerIconBorderRadius`).
  headerBorderRadius?: string;
  headerFocusRingColor?: string;
};
