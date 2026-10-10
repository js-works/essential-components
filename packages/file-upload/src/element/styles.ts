import type * as Spec from '../api';

export { createStyleSheet, DEFAULT_THEME, DENSITY_PADDING };

type ResolvedTheme = Required<Spec.Theme>;

// The vertical padding (in em) of the rows of the list and of the drop line, per density. Only these change. The rows
// match the data table's (4px, 8px, 16px at 14px).
const DENSITY_PADDING = {
  compact: { row: 0.286, drop: 0.571 },
  normal: { row: 0.571, drop: 0.857 },
  comfortable: { row: 1.143, drop: 1.429 },
} as const satisfies Record<Spec.Density, { row: number; drop: number }>;

const DEFAULT_THEME = {
  accentColor: { light: '#228be6', dark: '#1c7ed6' },
  accentTextColor: '#fff',
  textColor: 'inherit',
  mutedColor: { light: '#868e96', dark: '#909296' },
  borderColor: { light: '#dee2e6', dark: '#424242' },
  surfaceColor: { light: '#f1f3f5', dark: '#2e2e2e' },
  successColor: { light: '#2f9e44', dark: '#51cf66' },
  dangerColor: { light: '#e03131', dark: '#ff6b6b' },
  borderRadius: '4px',
  buttonBorderRadius: '5px',
  fontFamily: 'inherit',
  fontSize: '0.875rem',
} as const satisfies ResolvedTheme;

// The stylesheet of one element class: our CSS with the values of the theme put in, followed by the extra `styles`.
// With `adoptedStyleSheets` it is shared by all elements of the class; where that is missing, each element gets a copy
// in a `<style>`.
function createStyleSheet(config: Spec.Config): CSSStyleSheet | string {
  const css = `${createCss({ ...DEFAULT_THEME, ...config.theme })}\n${config.styles ?? ''}`;

  if (typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype) {
    try {
      const sheet = new CSSStyleSheet();

      sheet.replaceSync(css);

      return sheet;
    } catch {
      return css;
    }
  }

  return css;
}

function color(value: Spec.ThemeColor): string {
  return typeof value === 'string' ? value : `light-dark(${value.light}, ${value.dark})`;
}

function createCss(theme: ResolvedTheme): string {
  const accent = color(theme.accentColor);
  const accentText = color(theme.accentTextColor);
  const muted = color(theme.mutedColor);
  const border = color(theme.borderColor);
  const surface = color(theme.surfaceColor);
  const radius = theme.borderRadius;

  return `
:host {
  /* A column: our label (if any) and the frame. With a height limit on the element (e.g. \`max-height\`), the frame
     shrinks and its list scrolls, so the line below the list stays visible. Without one, it is as high as its content. */
  display: flex;
  flex-direction: column;
  color: ${color(theme.textColor)};
  font-family: ${theme.fontFamily};
  /* The base size. All sizes and spacings are relative to it (\`em\`), so it scales the whole element. The small texts
     are 6/7 of it: their spacings are relative to their own size. */
  font-size: ${theme.fontSize};
  /* Nothing is selectable except the file names (see \`.name\`). Safari still needs the prefix. */
  -webkit-user-select: none;
  user-select: none;
}

:host([hidden]) {
  display: none;
}

/* A table with one line per file, and below it one line with the prompt, "Browse", the hints and "Upload all". The
   whole element is the drop target. The columns of all rows line up (subgrid). */
/* Our own label, above the element (only when it has one). */
.label {
  margin-block-end: 0.429em;
  font-weight: 500;
}

/* The error text below the frame (only when there is one): the app's, or our own message of an invalid element. The
   frame turns to the danger color with it. */
.error {
  margin-block-start: 0.5em;
  color: ${color(theme.dangerColor)};
  font-size: 0.857em;
  font-weight: 500;
}

.root {
  display: grid;
  /* The list grows with its files, up to the space the element leaves it (see \`:host\`). */
  grid-template-rows: minmax(0, auto) auto;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'list list' 'drop action';
  min-height: 0;
  /* For the narrow layout (see \`@container\` below). The element takes its width from outside. */
  container: file-upload / inline-size;
  border: 1px solid ${border};
  border-radius: ${radius};

  &[data-invalid] {
    border-color: ${color(theme.dangerColor)};
  }

  &[inert] {
    opacity: 0.6;
  }

  &[data-dragging] {
    border-color: ${accent};
    background-color: color-mix(in srgb, ${accent} 10%, transparent);
  }
}

.drop-area {
  display: flex;
  flex-wrap: wrap;
  grid-area: drop;
  align-items: center;
  gap: 0.571em;
  padding: ${DENSITY_PADDING.normal.drop}em 0.857em;

  :where(.root[data-density='compact']) & {
    padding-block: ${DENSITY_PADDING.compact.drop}em;
  }

  :where(.root[data-density='comfortable']) & {
    padding-block: ${DENSITY_PADDING.comfortable.drop}em;
  }
}

.prompt {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.571em;
}

/* In the text color, like the prompt next to it. */
.drop-icon {
  width: 1.143em;
  height: 1.143em;
}

.limits {
  margin-inline-start: auto;
  color: ${muted};
  font-size: 0.857em;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  border: 1px solid transparent;
  border-radius: ${theme.buttonBorderRadius};
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${accent};
    outline-offset: 2px;
  }
}

.text-button {
  gap: 0.5em;
  padding: 0.333em 1em;
  /* Darker than the other borders, so the button stands out as a control. All text buttons look the same, none in the
     accent color: as harmless as possible, because they rarely match the buttons of the app exactly. */
  border-color: color-mix(in srgb, ${border}, ${muted});
  /* The size of the prompt next to it (it was 0.857em, too small). */
  font-size: 1em;
  font-weight: 600;

  &:hover {
    background-color: ${surface};
  }

  & svg {
    width: 1.167em;
    height: 1.167em;
  }
}

.list-header {
  display: flex;
  grid-area: action;
  gap: 0.571em;
  align-items: center;
  padding-inline-end: 0.857em;
}

.list {
  display: grid;
  grid-area: list;
  grid-template-columns: auto minmax(0, 1fr) auto auto auto auto;
  /* The rows keep their own height when the list has less space than it needs: it scrolls. */
  grid-auto-rows: max-content;
  align-content: start;
  column-gap: 0.857em;
  min-height: 0;
  overflow: auto;
  /* No bounce at its ends (Firefox's elastic overscroll), and the page does not scroll on (2026-10-08). */
  overscroll-behavior: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid ${border};
  list-style: none;
}

.row {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  align-items: center;
  padding: ${DENSITY_PADDING.normal.row}em 0.857em;

  :where(.root[data-density='compact']) & {
    padding-block: ${DENSITY_PADDING.compact.row}em;
  }

  :where(.root[data-density='comfortable']) & {
    padding-block: ${DENSITY_PADDING.comfortable.row}em;
  }

  & + & {
    border-top: 1px solid ${border};
  }
}

.info,
.name-line,
.progress-line {
  display: contents;
}

.thumbnail {
  display: flex;
  position: relative;
  grid-column: 1;
  align-items: center;
  justify-content: center;
  width: 1.714em;
  height: 1.714em;
  border-radius: calc(${radius} / 2);
  background-color: ${surface};
  color: ${muted};

  & img {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }

  /* A preview opens large in a dialog. The thumbnail does not clip, so the focus outline stays visible. */
  & .preview-button {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    border-radius: inherit;
    cursor: zoom-in;
  }

  & svg {
    width: 1.143em;
    height: 1.143em;
  }

  /* The icon of the status (without a preview). */
  .row[data-status='done'] & {
    color: ${color(theme.successColor)};
  }

  .row:is([data-status='error'], [data-status='rejected']) & {
    color: ${color(theme.dangerColor)};
  }

  & [data-icon='spinner'] {
    animation: spin 1s linear infinite;
  }

  /* The status on a preview, in its corner. */
  & .badge {
    display: flex;
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    align-items: center;
    justify-content: center;
    width: 0.75em;
    height: 0.75em;
    border-radius: 50%;
    background-color: ${color(theme.successColor)};
    color: ${accentText};
    pointer-events: none;

    .row:is([data-status='error'], [data-status='rejected']) & {
      background-color: ${color(theme.dangerColor)};
    }

    /* While uploading: a dot with a ring that grows and fades. */
    &[data-badge='pulse'] {
      background-color: ${accent};
      animation: pulse 1.2s ease-out infinite;
    }

    & svg {
      width: 0.5em;
      height: 0.5em;
      stroke-width: 3;
    }
  }
}

@keyframes spin {
  to {
    rotate: 1turn;
  }
}

@keyframes pulse {
  from {
    box-shadow: 0 0 0 0 color-mix(in srgb, ${accent} 60%, transparent);
  }

  to {
    box-shadow: 0 0 0 0.3em transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thumbnail :is([data-icon='spinner'], [data-badge='pulse']) {
    animation: none;
  }
}

.name {
  grid-column: 2;
  overflow: hidden;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size {
  grid-column: 3;
  color: ${muted};
  font-size: 0.857em;
}

.progress {
  grid-column: 4;
  width: 4.571em;
  height: 0.286em;
  overflow: hidden;
  border: none;
  border-radius: 999px;
  appearance: none;
  background-color: ${surface};
  color: ${accent};

  &::-webkit-progress-bar {
    background-color: ${surface};
  }

  &::-webkit-progress-value {
    background-color: ${accent};
  }

  &::-moz-progress-bar {
    background-color: ${accent};
  }
}

.status {
  grid-column: 5;
  color: ${muted};
  font-size: 0.857em;
  font-weight: 500;

  .row[data-status='done'] & {
    color: ${color(theme.successColor)};
  }

  .row:is([data-status='error'], [data-status='rejected']) & {
    color: ${color(theme.dangerColor)};
  }
}

.actions {
  display: flex;
  grid-column: 6;
  /* Right-aligned, so "Remove" (always the last one) lines up in every row. */
  justify-content: flex-end;
  gap: 0.286em;
}

/* Narrow: two lines per file. The first one with the thumbnail, the name, the size and the buttons, the second one with
   the progress bar (filling the line) and the status. */
@container file-upload (width < 60em) {
  .list {
    grid-template-columns: auto minmax(0, 1fr) auto auto;
  }

  .row {
    row-gap: 0.143em;
  }

  .thumbnail,
  .name,
  .size,
  .actions {
    grid-row: 1;
  }

  .actions {
    grid-column: 4;
  }

  .progress-line {
    display: flex;
    grid-row: 2;
    grid-column: 2 / -1;
    align-items: center;
    gap: 0.857em;
  }

  .progress {
    flex: 1;
    width: auto;
    min-width: 0;
  }
}

.icon-button {
  width: 2em;
  height: 2em;
  padding: 0;
  color: ${muted};

  & svg {
    width: 1.143em;
    height: 1.143em;
  }

  &:hover {
    background-color: ${surface};
    color: inherit;
  }
}

/* The button whose tooltip is shown (an icon button or a preview). */
[data-tooltip-anchor] {
  anchor-name: --tooltip-anchor;
}

.tooltip {
  position-anchor: --tooltip-anchor;
  position-area: top;
  position-try-fallbacks: flip-block;
  inset: auto;
  margin: 0.5em;
  padding: 0.333em 0.667em;
  border: none;
  border-radius: calc(${radius} / 2);
  background-color: light-dark(#212529, #f1f3f5);
  color: light-dark(#fff, #212529);
  font-size: 0.857em;
  pointer-events: none;
}

/* A preview, large, in a modal dialog. */
.preview-dialog {
  max-width: 90vw;
  max-height: 90vh;
  padding: 0;
  overflow: hidden;
  border: 1px solid ${border};
  /* Half of the radius, like the thumbnail it enlarges. */
  border-radius: calc(${radius} / 2);
  background-color: ${surface};
  color: ${color(theme.textColor)};
  /* Fades in and grows a little when it opens (\`@starting-style\` below). When it closes, \`data-closing\` plays the
     same the other way round, and the dialog is closed when that has ended. */
  transition:
    opacity 0.3s ease-out,
    scale 0.3s ease-out;

  &[data-closing] {
    opacity: 0;
    scale: 0.95;
  }

  &::backdrop {
    background-color: rgb(0 0 0 / 60%);
    transition: background-color 0.3s ease-out;
  }

  &[data-closing]::backdrop {
    background-color: transparent;
  }

  & img {
    display: block;
    max-width: calc(90vw - 2px);
    max-height: calc(90vh - 2px);
    object-fit: contain;
  }

  /* Flush in the top corner, without a gap: the dialog clips the outer corner, only the inner one is rounded. The focus
     ring goes inside, where the dialog does not clip it. */
  & .dialog-close {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    border-radius: 0;
    border-end-start-radius: calc(${radius} / 2);
    background-color: ${surface};
    color: inherit;

    &:focus-visible {
      outline-offset: -2px;
    }
  }
}

@starting-style {
  .preview-dialog[open] {
    opacity: 0;
    scale: 0.95;
  }

  .preview-dialog[open]::backdrop {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-dialog,
  .preview-dialog::backdrop {
    transition: none;
  }
}

/* Without anchor positioning the tooltip could not be placed next to its button. The buttons keep their accessible
   names. */
@supports not (anchor-name: --tooltip-anchor) {
  .tooltip {
    display: none;
  }
}

/* The rules above set \`display\`, which would win over the \`hidden\` attribute. */
.root [hidden] {
  display: none;
}
`;
}
