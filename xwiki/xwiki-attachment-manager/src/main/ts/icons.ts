import { svg } from 'lit';
import type { TemplateResult } from 'lit';

export { icons };

// The icons of the actions: the paths of the Tabler icons (MIT), in the current text color. Functions: every place gets
// its own (a DOM node can be in one place only).
function icon(paths: readonly string[]): () => TemplateResult {
  return () =>
    svg`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
      paths.map((d) => svg`<path d=${d} />`)
    }</svg>`;
}

const icons = {
  upload: icon(['M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2', 'M7 9l5 -5l5 5', 'M12 4l0 12']),
  download: icon(['M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2', 'M7 11l5 5l5 -5', 'M12 4l0 12']),
  info: icon(['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M12 9h.01', 'M11 12h1v4h1']),
  trash: icon([
    'M4 7l16 0',
    'M10 11l0 6',
    'M14 11l0 6',
    'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
    'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
  ]),
} as const;
