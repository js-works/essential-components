import type { MantineColorsTuple } from '@mantine/core';

export { dangerFor, parseColor, shades };
export type { Oklch };

// The colors of the `<board-manager>` element's `accent-color` and `danger-color`: any CSS color, turned into Mantine's
// ten shades in OKLCH (no dependency). The given color is shade 6 (Mantine's filled color in light mode), the lighter
// shades lose chroma towards an almost white tint, the darker ones keep it.

type Oklch = { l: number; c: number; h: number };

// The lightness of Mantine's own shades (roughly the same for all its colors), as the ladder of the steps.
const LADDER = [0.97, 0.93, 0.86, 0.79, 0.72, 0.67, 0.62, 0.57, 0.52, 0.45];
const BASE = 6;

// Any CSS color as OKLCH, or `undefined` for none: the browser parses it (a pixel of a canvas, so every syntax works);
// transparency is ignored.
function parseColor(value: string | null): Oklch | undefined {
  if (value === null || value.trim() === '' || !CSS.supports('color', value)) {
    return undefined;
  }

  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });

  if (context === null) {
    return undefined;
  }

  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);

  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;

  return toOklch(r / 255, g / 255, b / 255);
}

function shades(color: Oklch): MantineColorsTuple {
  const top = LADDER[0]!;
  const step = LADDER[BASE]!;
  const bottom = LADDER[LADDER.length - 1]!;
  const darkest = color.l * 0.72;

  return LADDER.map((l, index) => {
    if (index < BASE) {
      const t = (l - step) / (top - step);

      return toHex({ l: color.l + t * (Math.max(top, color.l) - color.l), c: color.c * (1 - 0.85 * t), h: color.h });
    }

    const t = (step - l) / (step - bottom);

    return toHex({ l: color.l - t * (color.l - darkest), c: color.c * (1 - 0.15 * t), h: color.h });
  }) as unknown as MantineColorsTuple;
}

// A red that goes with the accent: its lightness (within a readable range) and at least a clear chroma. An accent
// close to red (within 30° of its hue, and not a gray) moves the red away from it, so a danger button still differs
// from a primary one: towards crimson (an orange becomes not a warning), unless the accent is a crimson itself (more
// than 10° below red), then towards orange red.
const RED_HUE = 25;
const MIN_DISTANCE = 30;

function dangerFor(accent: Oklch): Oklch {
  const l = Math.min(Math.max(accent.l, 0.55), 0.66);
  const c = Math.min(Math.max(accent.c, 0.17), 0.22);
  const distance = hueDistance(accent.h, RED_HUE);

  if (accent.c < 0.05 || Math.abs(distance) >= MIN_DISTANCE) {
    return { l, c, h: RED_HUE };
  }

  return { l, c, h: (accent.h + (distance >= -10 ? -MIN_DISTANCE : MIN_DISTANCE) + 360) % 360 };
}

// The signed difference `from - to`, in -180..180.
function hueDistance(from: number, to: number): number {
  return ((from - to + 540) % 360) - 180;
}

// sRGB <-> OKLCH (Björn Ottosson's OKLab).

function toLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function fromLinear(value: number): number {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
}

function toOklch(red: number, green: number, blue: number): Oklch {
  const r = toLinear(red);
  const g = toLinear(green);
  const b = toLinear(blue);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return { l: L, c: Math.hypot(A, B), h: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}

function toLinearRgb({ l: L, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos(h * Math.PI / 180);
  const B = c * Math.sin(h * Math.PI / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// Out of the sRGB gamut, the chroma is lowered until it fits (the hue and the lightness stay).
function toHex(color: Oklch): string {
  const l = Math.min(Math.max(color.l, 0), 1);
  let low = 0;
  let high = Math.max(color.c, 0);

  if (!inGamut(toLinearRgb({ l, c: high, h: color.h }))) {
    for (let i = 0; i < 20; i++) {
      const middle = (low + high) / 2;

      if (inGamut(toLinearRgb({ l, c: middle, h: color.h }))) {
        low = middle;
      } else {
        high = middle;
      }
    }

    high = low;
  }

  return `#${
    toLinearRgb({ l, c: high, h: color.h })
      .map((value) => Math.round(fromLinear(Math.min(Math.max(value, 0), 1)) * 255).toString(16).padStart(2, '0'))
      .join('')
  }`;
}

function inGamut(rgb: number[]): boolean {
  return rgb.every((value) => value >= -0.0001 && value <= 1.0001);
}
