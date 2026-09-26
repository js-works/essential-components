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
  inbox: ['M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z', 'M4 13h3l3 3h4l3 -3h3'],
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

type IconName = keyof typeof paths;

type FilledIconName = keyof typeof filledPaths;

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

function filledIcon(name: FilledIconName) {
  return function Icon({ size = 16, className }: IconProps): ReactElement {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden
        focusable="false"
      >
        {filledPaths[name].map((path) => <path key={path} d={path} fillRule="evenodd" />)}
      </svg>
    );
  };
}

const icons = {
  ArrowDownUp: filledIcon('arrowDownUp'),
  ArrowUp: filledIcon('arrowUp'),
  ArrowDown: filledIcon('arrowDown'),
  ChevronLeft: icon('chevronLeft'),
  ChevronLeftPipe: icon('chevronLeftPipe'),
  ChevronRightPipe: icon('chevronRightPipe'),
  ChevronRight: icon('chevronRight'),
  ChevronDown: icon('chevronDown'),
  Search: icon('search'),
  Close: icon('close'),
  Check: icon('check'),
  Calendar: icon('calendar'),
  Inbox: icon('inbox'),
} as const;
