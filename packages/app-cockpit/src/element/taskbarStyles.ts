import type * as Spec from '../api';
import { themeValues } from './styles';

export { taskbarStyles };

// The CSS of `<app-taskbar>`, in its shadow root, built from its theme (2026-10-10; the cockpit's `--app-cockpit-*`
// custom properties, inherited, before): inside a cockpit the cockpit's theme, else the defaults (the design language's
// values; never its `--ui-*` tokens: those are for demos only). No `rem` (like the cockpit: a page's root font size must
// not change it).
function taskbarStyles(theme: Spec.Theme): string {
  const v = themeValues(theme);

  return /* css */ `
:host {
  display: block;
  min-width: 0;
  color: ${v.text};
  font-family: ${v.fontFamily};
  font-size: calc(${v.fontSize} * 13 / 14);
}

:host([hidden]) {
  display: none;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

/* A row of tasks, scrolling sideways when they do not fit (each shrinks to its minimum first). */
.bar {
  position: relative;
  display: flex;
  gap: 2px;
  /* As high as the cockpit's sidebar footer, so their edges line up. */
  height: 44px;
  padding-inline: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  /* No bounce at its ends (Firefox's elastic overscroll), and no back or forward swipe of the browser (2026-10-08). */
  overscroll-behavior-x: none;
  scrollbar-width: none;
  border-top: 1px solid ${v.divider};
  background: ${v.subtle};
  -webkit-user-select: none;
  user-select: none;
}

/* A task; the active one like a tab hanging from the open app: its background, an accent line on top, over the bar's
   line. */
.task {
  position: relative;
  display: flex;
  flex: 0 1 200px;
  align-items: center;
  min-width: 96px;
  border-radius: 0 0 ${v.radius} ${v.radius};
  color: ${v.muted};

  /* The text color at 7% (the hover token is about as light as the bar: invisible). */
  &:hover {
    background: color-mix(in srgb, currentColor 7%, transparent);
    color: inherit;
  }

  &[data-active] {
    margin-top: -1px;
    background: ${v.background};
    box-shadow: inset 0 2px 0 ${v.accent};
    color: inherit;
  }
}

/* A thin line between two tasks (2026-10-07, the user's wish): half as high as the bar, in the divider color; not next
   to the active or a hovered task (their background separates them), nor while dragging. */
.task + .task::before {
  content: '';
  position: absolute;
  top: 25%;
  bottom: 25%;
  left: -2px;
  width: 1px;
  background: ${v.divider};
  pointer-events: none;
}

.task:is([data-active], :hover)::before,
.task:is([data-active], :hover) + .task::before,
.bar[data-dragging] .task::before {
  opacity: 0;
}

/* Dragging (2026-10-07): the touch moves the task, it does not scroll the bar. While a task is dragged, the others
   slide aside; it is on top of them, lifted by a shadow. */
.task {
  touch-action: none;
}

.bar[data-dragging] {
  cursor: grabbing;

  & .task {
    transition: translate 150ms ease;
  }

  & .task-button,
  & .task-close {
    cursor: inherit;
  }

  & .task[data-dragged] {
    z-index: 1;
    background: ${v.background};
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.2);
    color: inherit;
    transition: none;
  }

  & .task[data-dragged][data-active] {
    box-shadow:
      inset 0 2px 0 ${v.accent},
      0 1px 4px rgb(0 0 0 / 0.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bar[data-dragging] .task {
    transition: none;
  }
}

.task-button {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
  height: 100%;
  padding: 0 4px 0 10px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.task-icon {
  display: inline-flex;
  flex: none;
  color: ${v.accent};
  font-size: calc(${v.fontSize} * 16 / 14);

  & svg {
    width: 1em;
    height: 1em;
  }
}

/* A task without an icon: the first letters of its title in a rounded square (initialsIcon()). The letters are filled,
   not stroked; their size is in the SVG's units (24 = the icon's size). */
.icon--initials text {
  fill: currentColor;
  stroke: none;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: -0.3px;
  font-weight: 700;
}

.task-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  .task[data-active] & {
    font-weight: 500;
  }
}

/* The close button: shown on the active task, on hover and when focused. */
.task-close {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-inline-end: 6px;
  padding: 0;
  border: 0;
  border-radius: ${v.radius};
  background: none;
  color: inherit;
  font-size: ${v.fontSize};
  cursor: pointer;
  opacity: 0;

  .task:is(:hover, [data-active]) &,
  &:focus-visible {
    opacity: 1;
  }

  &:hover {
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
}

.icon {
  width: 1em;
  height: 1em;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

:focus-visible {
  outline: 2px solid ${v.accent};
  outline-offset: -2px;
}
`;
}
