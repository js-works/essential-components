export type { AppHeaderTheme, CockpitTheme };

// The cockpit's look, a few values (the colors are the design language's). Without a key, its default. The element's
// `theme` can be switched live (a new object).
type CockpitTheme = {
  // One color, lighter in the dark navigation by a mix with white (default: the design language's).
  accent?: string;
  // The base size of the cockpit's text and icons (default `14px`, the apps' normal text).
  fontSize?: string;
  // Default `system-ui, sans-serif`: the cockpit's own, so a mini-app's global CSS does not change it.
  fontFamily?: string;
  // The sidebar's default width (`256px`; the user can resize it), the rail's (`68px`).
  sidebarWidth?: string;
  railWidth?: string;
  // Around the open app beside the expanded sidebar and with the bottom bar (default `16px 20px`).
  contentPadding?: string;
};

// The app header's look (draft; a key is added when needed). Without a key, its default (the design language's). The
// package's `mantineAppHeaderTheme` gives Mantine's variables (`var(--mantine-…)`), so it looks almost like Mantine.
type AppHeaderTheme = {
  fontFamily?: string;
  fontSize?: string;
  backgroundColor?: string;
  textColor?: string;
  // The line below the first line (also the menus' border); the app's icon on its tile.
  dividerColor?: string;
  iconBackgroundColor?: string;
  iconColor?: string;
  iconBorderRadius?: string;
  // The modules' tabs (and the narrow modules menu's trigger).
  tabHoverBackgroundColor?: string;
  tabActiveBackgroundColor?: string;
  tabActiveTextColor?: string;
  // The crumbs that are links; the marks between the crumbs.
  linkTextColor?: string;
  separatorColor?: string;
  // The menus (the switcher, the narrow modules menu).
  menuBackgroundColor?: string;
  menuBoxShadow?: string;
  // The entries' descriptions (the switcher's menu).
  menuDescriptionTextColor?: string;
  // The tooltips of Back and Forward.
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
  tooltipBorderRadius?: string;
  // Tabs and buttons (not the icon's tile: `iconBorderRadius`).
  borderRadius?: string;
  focusRingColor?: string;
};
