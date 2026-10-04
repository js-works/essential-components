export { colorSetups };
export type { ColorName, ColorSetup };

// A color as a hex string (`#0ea5e9`, or `#09f`).
type ColorSetup = {
  primary?: string;
  success?: string;
  warning?: string;
  danger?: string;
};

type ColorName = keyof typeof colorSetups;

// Named color setups for `createMantineTheme({ colors: 'skyBlue' })`: the primary color and, where the primary does not
// go well with Mantine's red, a danger color. The success and the warning colors are Mantine's green and orange unless
// given. A curated part of the color setups of `shoelace-themes` (looked at 2026-10-04), without the very light ones
// (aquamarine, turquoise, horizon: a filled button in them has no contrast).
const colorSetups = {
  blue: { primary: '#1c73e8', danger: '#f15f41' },
  skyBlue: { primary: '#0ea5e9', danger: '#e95420' },
  pacificBlue: { primary: '#0e94bb', danger: '#ff5000' },
  bostonBlue: { primary: '#45b1e8', danger: '#e34234' },
  teal: { primary: '#008080' },
  violet: { primary: '#b882ed' },
  orchid: { primary: '#bf68bd' },
  cranberry: { primary: '#dd5a8c' },
  pink: { primary: '#d24899' },
  orange: { primary: '#ff7606' },
  coral: { primary: '#ff7f50' },
  tomato: { primary: '#ff6347' },
  bootstrap: { primary: '#0d6efd', success: '#198754', warning: '#ffc107', danger: '#dc3545' },
  baseweb: { primary: '#266ef1', danger: '#f25238' },
} as const satisfies Record<string, ColorSetup>;
