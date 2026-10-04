import type { ReactElement } from 'react';

export { icons };

// The paths of the Tabler icons (MIT), drawn in the current text color.
const paths = {
  // Drawn by us in the style of Tabler: two bars (the edges of a column) with a double arrow between them. "Optimize
  // column widths". `arrow-back-up`: "Reset column widths".
  fitWidth: ['M4 5v14', 'M20 5v14', 'M8 12h8', 'M10 10l-2 2l2 2', 'M14 10l2 2l-2 2'],
  arrowBackUp: ['M9 14l-4 -4l4 -4', 'M5 10h11a4 4 0 1 1 0 8h-1'],
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
} as const;

// The paths of the Bootstrap icons (MIT), filled with the current text color on a 16×16 grid: the sort arrows
// (`BsArrowUp`, `BsArrowDown`, and a double arrow of our own from their heads), the columns (`BsLayoutThreeColumns`) and
// the calendar (`BsCalendar4`).
const filledPaths = {
  // Tabler's `caret-right-filled` (MIT, 24×24): the toggle of a group header.
  caretRight: [
    'M9 6c0 -.852 .986 -1.297 1.623 -.783l.084 .076l6 6a1 1 0 0 1 .083 1.32l-.083 .094l-6 6l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002l-.059 -.002l-.058 -.005l-.06 -.009l-.052 -.01l-.108 -.032l-.067 -.027l-.132 -.07l-.09 -.065l-.081 -.073l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057l-.002 -12.059z',
  ],
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
  // `BsCalendar4`: the trigger of the date range filter and of the date editor (Tabler's `calendar` until 2026-10-01).
  calendar: [
    'M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1zm13 3H1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z',
  ],
  // `VscFilter` (react-icons, Codicons, CC BY 4.0; Tabler's `filter` until 2026-10-04): the filter button.
  filter: [
    'M9.5 14H6.5C6.224 14 6 13.776 6 13.5V9.329C6 8.928 5.844 8.552 5.561 8.268L1.561 4.268C1.205 3.911 1 3.418 1 2.914C1 1.858 1.858 1 2.914 1H13.086C14.142 1 15 1.858 15 2.914C15 3.417 14.796 3.911 14.439 4.267L10.439 8.267C10.156 8.551 10 8.927 10 9.328V13.499C10 13.775 9.776 13.999 9.5 13.999V14ZM7 13H9V9.329C9 8.661 9.26 8.033 9.732 7.561L13.732 3.561C13.902 3.391 14 3.155 14 2.915C14 2.411 13.59 2.001 13.086 2.001H2.914C2.41 2.001 2 2.411 2 2.915C2 3.155 2.098 3.391 2.268 3.562L6.268 7.562C6.741 8.034 7 8.662 7 9.33V13.001V13Z',
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
  Calendar: filledIcon(filledPaths.calendar, 16, 'nonzero'),
  Refresh: icon('refresh'),
  FitWidth: icon('fitWidth'),
  ArrowBackUp: icon('arrowBackUp'),
  Filter: filledIcon(filledPaths.filter, 16, 'nonzero'),
  Deselect: icon('deselect'),
  Grip: icon('gripVertical'),
  Columns: filledIcon(filledPaths.layoutThreeColumns, 16, 'nonzero'),
  CaretRight: filledIcon(filledPaths.caretRight, 24, 'nonzero'),
} as const;
