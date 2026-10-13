export type { Theme };

// The cockpit's look, a few values (the colors are the design language's). Without a key, its default. The element's
// `theme` can be switched live (a new object).
type Theme = {
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
