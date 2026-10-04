import type { MantineColorsTuple } from '@mantine/core';

export { parseHex, shades };

// A color as ten shades of Mantine, in OKLCH (no dependency): the given color is shade 6 (Mantine's filled color in
// light mode), the lighter shades lose chroma towards an almost white tint, the darker ones keep it. Taken from the
// Board Manager's `colors.ts` of the root (2026-10-04), without the browser: only hex colors.

type Oklch = { l: number; c: number; h: number };

// The lightness of Mantine's own shades (roughly the same for all its colors), as the ladder of the steps.
const LADDER = [0.97, 0.93, 0.86, 0.79, 0.72, 0.67, 0.62, 0.57, 0.52, 0.45];
const BASE = 6;

// `#rrggbb` or `#rgb` as OKLCH, or `undefined` for anything else.
function parseHex(value: string): Oklch | undefined {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());

  if (match === null) {
    return undefined;
  }

  const hex = match[1]!.length === 3 ? [...match[1]!].map((digit) => digit + digit).join('') : match[1]!;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);

  return toOklch(r, g, b);
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
