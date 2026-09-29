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
  // Drawn by us in the style of Tabler's `deselect` (not its exact paths): a dashed square with a diagonal line.
  deselect: [
    'M4 7v-2a1 1 0 0 1 1 -1h2',
    'M11 4h2',
    'M17 4h2a1 1 0 0 1 1 1v2',
    'M20 11v2',
    'M20 17v2a1 1 0 0 1 -1 1h-2',
    'M13 20h-2',
    'M7 20h-2a1 1 0 0 1 -1 -1v-2',
    'M4 13v-2',
    'M3 3l18 18',
  ],
  filter: [
    'M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z',
  ],
  refresh: ['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'],
  // `grip-vertical`: the drag handle of a row.
  gripVertical: [
    'M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  calendar: [
    'M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
  ],
} as const;

// The paths of the Bootstrap icons (MIT), filled with the current text color on a 16×16 grid: the sort arrows
// (`BsArrowUp`, `BsArrowDown`, and a double arrow of our own from their heads) and the columns (`BsLayoutThreeColumns`).
const filledPaths = {
  // One arrow with a head at both ends: a sortable column that is not sorted (it was `BsArrowDownUp`, two arrows side
  // by side). Our own: the heads of `BsArrowUp` and `BsArrowDown` on one line, so all three have the same heads
  // (Bootstrap's `BsArrowsVertical` has smaller ones).
  arrowsVertical: [
    'M8.5 2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707v10.586l-3.146-3.147a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L8.5 13.293z',
  ],
  arrowUp: [
    'M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5',
  ],
  arrowDown: [
    'M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1',
  ],
  // `BsLayoutThreeColumns`: the button of the column toggle menu.
  layoutThreeColumns: [
    'M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5zM1.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5H5V1zM10 15V1H6v14zm1 0h3.5a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5H11z',
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
  ArrowsVertical: filledIcon(filledPaths.arrowsVertical, 16, 'evenodd'),
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
  Refresh: icon('refresh'),
  Filter: icon('filter'),
  Deselect: icon('deselect'),
  Grip: icon('gripVertical'),
  Columns: filledIcon(filledPaths.layoutThreeColumns, 16, 'nonzero'),
} as const;
