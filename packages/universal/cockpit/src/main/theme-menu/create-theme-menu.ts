import { textsOf } from '../core/texts.js';
import type {
  MenuItem,
  MenuSection,
  NavDensity,
  ThemeMenu,
  ThemeMenuOptions,
  ThemeMenuScheme,
  ThemeMenuValue,
} from '../index.js';

export { createThemeMenu };

const SCHEMES = Object.freeze(['light', 'system', 'dark'] as const);
const DENSITIES = Object.freeze(['compact', 'normal', 'comfortable'] as const);

const icon = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

// Tabler's (MIT): `sun`, `device-desktop`, `moon`.
const SCHEME_ICONS = Object.freeze(
  {
    light: icon(
      '<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/><path d="M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7 .7m12.1-.7l-.7 .7m0 11.4l.7 .7m-12.1-.7l-.7 .7"/>',
    ),
    system: icon(
      '<path d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5z"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>',
    ),
    dark: icon('<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/>'),
  } as const satisfies Record<ThemeMenuScheme, string>,
);

// An accent's icon: a filled circle in its color (escaped: it goes into SVG markup), with a thin ring, so a light
// color shows on a light menu.
const swatchIcon = (color: string) => {
  const fill = color.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);

  return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${fill}" stroke="currentColor" stroke-opacity="0.25"/></svg>`;
};

// The button's icon: Tabler's `palette` (MIT).
const PALETTE_ICON = icon(
  '<path d="M12 21a9 9 0 0 1 0-18c4.97 0 9 3.582 9 8c0 1.06-.474 2.078-1.318 2.828c-.844 .75-1.989 1.172-3.182 1.172h-2.5a2 2 0 0 0-1 3.75a1.3 1.3 0 0 1-1 2.25"/><path d="M7.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M11.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/><path d="M15.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/>',
);

const SCHEME_TEXTS = Object.freeze(
  { light: 'themeMenuLight', system: 'themeMenuSystem', dark: 'themeMenuDark' } as const,
);
const DENSITY_TEXTS = Object.freeze(
  { compact: 'themeMenuCompact', normal: 'themeMenuNormal', comfortable: 'themeMenuComfortable' } as const,
);

// A menu for the look, ready for the cockpit: the color scheme, the accent color (with `accents`) and the density
// (with `densities`), each a section of checked items; the choice kept (not remembered across visits: a host that wants
// it saves it in `onChange` and gives it back as `initial`) and given to the host (`onChange`), which applies it. The labels are getters, read whenever the menu renders, so a change of the
// language shows at once.
function createThemeMenu(options: ThemeMenuOptions): ThemeMenu {
  const accents = options.accents ?? [];
  const t = () => textsOf(options.i18n);
  // A value that is not offered (e.g. one the host kept, then taken out): the default.
  const offered = {
    scheme: (scheme: unknown): scheme is ThemeMenuScheme => SCHEMES.includes(scheme as ThemeMenuScheme),
    accent: (accent: unknown): accent is string => accents.some((each) => each.id === accent),
    density: (density: unknown): density is NavDensity =>
      options.densities === true && DENSITIES.includes(density as NavDensity),
  };
  const valid = (value: Partial<ThemeMenuValue>): ThemeMenuValue => ({
    scheme: offered.scheme(value.scheme) ? value.scheme : 'system',
    accent: offered.accent(value.accent) ? value.accent : accents[0]?.id ?? '',
    density: offered.density(value.density) ? value.density : 'normal',
  });
  let value = valid(options.initial ?? {});

  const set = (change: Partial<ThemeMenuValue>) => {
    value = valid({ ...value, ...change });

    options.onChange({ ...value });
  };

  // A radio item (the cockpit shows the check, then the icon): its label read whenever the menu renders.
  const item = (
    id: string,
    label: () => string,
    checked: () => boolean,
    choose: () => void,
    icon?: string,
  ): MenuItem => ({
    id,
    get label() {
      return label();
    },
    checked,
    onSelect: choose,
    ...(icon === undefined ? {} : { icon }),
  });

  const section = (label: () => string, items: readonly MenuItem[]): MenuSection => ({
    get label() {
      return label();
    },
    items,
  });

  const sections: MenuSection[] = [
    section(
      () => t().themeMenuScheme,
      SCHEMES.map((scheme) =>
        item(
          `theme-scheme:${scheme}`,
          () => t()[SCHEME_TEXTS[scheme]],
          () => value.scheme === scheme,
          () => set({ scheme }),
          SCHEME_ICONS[scheme],
        )
      ),
    ),
    ...(accents.length === 0 ? [] : [section(
      () => t().themeMenuAccent,
      accents.map((accent) =>
        item(
          `theme-accent:${accent.id}`,
          () => accent.label,
          () => value.accent === accent.id,
          () => set({ accent: accent.id }),
          swatchIcon(accent.color),
        )
      ),
    )]),
    ...(options.densities !== true ? [] : [section(
      () => t().themeMenuDensity,
      DENSITIES.map((density) =>
        item(
          `theme-density:${density}`,
          () => t()[DENSITY_TEXTS[density]],
          () => value.density === density,
          () => set({ density }),
        )
      ),
    )]),
  ];

  // The start: after the module's code, so the host's elements are defined.
  queueMicrotask(() => options.onChange({ ...value }));

  return {
    action: {
      id: 'theme',
      get label() {
        return t().themeMenu;
      },
      icon: options.icon ?? PALETTE_ICON,
      menu: sections,
    },
    sections,
    value: () => ({ ...value }),
    set,
  };
}
