import type { ReactElement } from 'react';

export { icons };

// The icons of the demo actions: inline SVGs with the paths of the Tabler icons (MIT), in the current text color.
function icon(paths: readonly string[]) {
  return function Icon(): ReactElement {
    return (
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        focusable="false"
      >
        {paths.map((path) => <path key={path} d={path} />)}
      </svg>
    );
  };
}

const Plus = icon(['M12 5l0 14', 'M5 12l14 0']);
const Pencil = icon(['M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4', 'M13.5 6.5l4 4']);
const Trash = icon([
  'M4 7l16 0',
  'M10 11l0 6',
  'M14 11l0 6',
  'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
  'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
]);

const Info = icon(['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M12 9h.01', 'M11 12h1v4h1']);

const Upload = icon(['M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2', 'M7 9l5 -5l5 5', 'M12 4l0 12']);

const Check = icon(['M5 12l5 5l10 -10']);

const icons = {
  add: <Plus />,
  edit: <Pencil />,
  remove: <Trash />,
  info: <Info />,
  upload: <Upload />,
  done: <Check />,
} as const;
