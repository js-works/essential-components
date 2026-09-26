import type { Action, StatusIcon } from '../core/view';

export { createIcon };
export type { IconName };

// The icons are copied from Tabler Icons (https://tabler.io/icons).
//
// MIT License. Copyright (c) 2020-2024 Paweł Kuna.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright
// notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

type IconName = Action | StatusIcon | 'drop';

// The paths of each icon, drawn on a 24 x 24 grid with round ends.
const PATHS = {
  file: ['M14 3v4a1 1 0 0 0 1 1h4', 'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2'],
  upload: ['M7 4v16l13 -8l-13 -8'],
  cancel: ['M18 6l-12 12', 'M6 6l12 12'],
  stop: ['M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z'],
  retry: ['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'],
  // The same X as `cancel`.
  remove: ['M18 6l-12 12', 'M6 6l12 12'],
  spinner: ['M12 3a9 9 0 1 0 9 9'],
  done: ['M5 12l5 5l10 -10'],
  warning: [
    'M12 9v4',
    'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214'
    + 'a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z',
    'M12 16h.01',
  ],
  // The icon of the drop area: Tabler's `upload` (a tray with an arrow up), with a thin stroke of 1.5.
  drop: ['M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2', 'M7 9l5 -5l5 5', 'M12 4l0 12'],
} as const satisfies Record<IconName, readonly string[]>;

const SVG = 'http://www.w3.org/2000/svg';

// The size is only a fallback: the CSS sizes the icons in `em`, relative to the font size.
function createIcon(name: IconName, size: number, className?: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', name === 'drop' ? '1.5' : '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('data-icon', name);

  if (className !== undefined) {
    svg.setAttribute('class', className);
  }

  for (const d of PATHS[name]) {
    const path = document.createElementNS(SVG, 'path');

    path.setAttribute('d', d);
    svg.append(path);
  }

  return svg;
}
