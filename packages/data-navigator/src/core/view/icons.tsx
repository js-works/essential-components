import type { ReactElement } from 'react';

export { icons };

// The paths of the Tabler icons (MIT), drawn in the current text color.
const paths = {
  chevronRight: ['M9 6l6 6l-6 6'],
  chevronLeft: ['M15 6l-6 6l6 6'],
  chevronLeftPipe: ['M7 6v12', 'M18 6l-6 6l6 6'],
  chevronRightPipe: ['M6 6l6 6l-6 6', 'M17 5v13'],
  chevronDown: ['M6 9l6 6l6 -6'],
  search: ['M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
  close: ['M18 6l-12 12', 'M6 6l12 12'],
  check: ['M5 12l5 5l10 -10'],
  calendar: [
    'M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
  ],
} as const;

// The paths of the Bootstrap icons (MIT), filled with the current text color on a 16×16 grid: the sort arrows
// (`BsArrowDownUp`, `BsArrowUp`, `BsArrowDown`).
const filledPaths = {
  arrowDownUp: [
    'M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5',
  ],
  arrowUp: [
    'M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5',
  ],
  arrowDown: [
    'M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1',
  ],
} as const;

// The paths of the Phosphor icons (MIT), filled with the current text color on a 256×256 grid: the icon of the empty
// state (`PiDatabaseThin`, the thin weight).
const phosphorPaths = {
  databaseThin: [
    'M192.14,42.55C174.94,33.17,152.16,28,128,28S81.06,33.17,63.86,42.55C45.89,52.35,36,65.65,36,80v96c0,14.35,9.89,27.65,27.86,37.45,17.2,9.38,40,14.55,64.14,14.55s46.94-5.17,64.14-14.55c18-9.8,27.86-23.1,27.86-37.45V80C220,65.65,210.11,52.35,192.14,42.55ZM212,176c0,11.29-8.41,22.1-23.69,30.43C172.27,215.18,150.85,220,128,220s-44.27-4.82-60.31-13.57C52.41,198.1,44,187.29,44,176V149.48c4.69,5.93,11.37,11.34,19.86,16,17.2,9.38,40,14.55,64.14,14.55s46.94-5.17,64.14-14.55c8.49-4.63,15.17-10,19.86-16Zm0-48c0,11.29-8.41,22.1-23.69,30.43C172.27,167.18,150.85,172,128,172s-44.27-4.82-60.31-13.57C52.41,150.1,44,139.29,44,128V101.48c4.69,5.93,11.37,11.34,19.86,16,17.2,9.38,40,14.55,64.14,14.55s46.94-5.17,64.14-14.55c8.49-4.63,15.17-10,19.86-16Zm-23.69-17.57C172.27,119.18,150.85,124,128,124s-44.27-4.82-60.31-13.57C52.41,102.1,44,91.29,44,80s8.41-22.1,23.69-30.43C83.73,40.82,105.15,36,128,36s44.27,4.82,60.31,13.57C203.59,57.9,212,68.71,212,80S203.59,102.1,188.31,110.43Z',
  ],
} as const;

type IconName = keyof typeof paths;

type IconProps = { size?: number; className?: string };

function icon(name: IconName) {
  return function Icon({ size = 16, className }: IconProps): ReactElement {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        focusable="false"
      >
        {paths[name].map((path) => <path key={path} d={path} />)}
      </svg>
    );
  };
}

// A filled icon: the paths on a square grid of `grid` units, with their fill rule.
function filledIcon(paths: readonly string[], grid: number, fillRule: 'evenodd' | 'nonzero') {
  return function Icon({ size = 16, className }: IconProps): ReactElement {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox={`0 0 ${grid} ${grid}`}
        fill="currentColor"
        aria-hidden
        focusable="false"
      >
        {paths.map((path) => <path key={path} d={path} fillRule={fillRule} />)}
      </svg>
    );
  };
}

const icons = {
  ArrowDownUp: filledIcon(filledPaths.arrowDownUp, 16, 'evenodd'),
  ArrowUp: filledIcon(filledPaths.arrowUp, 16, 'evenodd'),
  ArrowDown: filledIcon(filledPaths.arrowDown, 16, 'evenodd'),
  ChevronLeft: icon('chevronLeft'),
  ChevronLeftPipe: icon('chevronLeftPipe'),
  ChevronRightPipe: icon('chevronRightPipe'),
  ChevronRight: icon('chevronRight'),
  ChevronDown: icon('chevronDown'),
  Search: icon('search'),
  Close: icon('close'),
  Check: icon('check'),
  Calendar: icon('calendar'),
  DatabaseThin: filledIcon(phosphorPaths.databaseThin, 256, 'nonzero'),
} as const;
