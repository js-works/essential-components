import type { KeyboardEventHandler, MouseEvent, ReactNode } from 'react';

export {
  flag,
  formatValue,
  hasContent,
  isPlainRowClick,
  isPlainRowDoubleClick,
  isShiftClick,
  isTextEditingTarget,
  MAX_OPTIMAL_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  suppressesTextSelection,
  suppressesWordSelection,
  textFieldKeys,
};

// The narrowest a column can be made by hand or by "Optimize column widths", and the widest the latter makes one (a
// column with long texts would else take the whole table), in pixels.
const MIN_COLUMN_WIDTH = 64;
const MAX_OPTIMAL_COLUMN_WIDTH = 480;

// Value for a boolean `data-*` attribute: present when true, absent when false.
function flag(condition: boolean): '' | undefined {
  return condition ? '' : undefined;
}

function hasContent(node: ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== '';
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  return String(value);
}

// Did this event hit a cell of the row, and not a control in it? Rows are `display: contents`, so the cells are the
// direct children of the row: the target has to be one of them or inside one. That rules out events from portals (an
// open action menu), which are not inside the row at all. Not the action cell (`data-control`), and not the selection
// cell (`data-select`): its free space is a click on its checkbox or radio (it handles that itself).
// - A data cell: all of it counts, its free space, its text and whatever a custom `render` drew (an icon beside a name,
//   a pill), except a control and anything inside one (`CONTROLS`). 2026-10-09, the user's wish: a double click on a
//   name runs the default action, instead of only selecting a word; a drag still selects text (see
//   `isPlainRowClick`). Before, only the free space counted.
// - The detail cell (`data-detail`): its free space and its plain text, and of what `renderDetail` drew only the layout
//   elements (see `isLayoutSpace`): its text stays selectable by a double click.
function isRowTarget(event: MouseEvent<HTMLElement>): boolean {
  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  let cell: Element | null = target;

  while (cell !== null && cell.parentElement !== event.currentTarget) {
    cell = cell.parentElement;
  }

  if (cell === null || cell.hasAttribute('data-control') || cell.hasAttribute('data-select')) {
    return false;
  }

  if (cell.hasAttribute('data-detail')) {
    return target === cell || target.hasAttribute('data-cell-text') && target.parentElement === cell
      || isLayoutSpace(target, cell);
  }

  return !isInside(target, cell, CONTROLS);
}

// Elements that do something of their own: a click on them (or inside them) is theirs.
const CONTROLS = 'a, button, input, select, textarea, label, summary, details, video, audio, iframe, '
  + '[role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="tab"], '
  + '[tabindex], [contenteditable]';

// Is `target`, or an element between it and `cell`, one of `selector`?
function isInside(target: Element, cell: Element, selector: string): boolean {
  for (let element: Element | null = target; element !== null && element !== cell; element = element.parentElement) {
    if (element.matches(selector)) {
      return true;
    }
  }

  return false;
}

// In the detail cell, pictures are its own targets too: a click on them (or inside them) is theirs.
const OWN_TARGETS = `${CONTROLS}, img, svg, canvas`;

// Is this a layout element inside the detail cell: no text of its own and not a control (nor inside one)? Then a click
// on it is a click on the empty space beside the content, not on the content. An element with text of its own (a
// paragraph, a span) stays its own target, so its words can still be selected and copied.
function isLayoutSpace(target: Element, cell: Element): boolean {
  if (isInside(target, cell, OWN_TARGETS)) {
    return false;
  }

  return ![...target.childNodes].some((node) =>
    node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== ''
  );
}

// Is this click a click on the row itself, i.e. one that should select the row?
function isPlainRowClick(event: MouseEvent<HTMLElement>): boolean {
  // The user selected some text with the mouse and released over the row: that is not a click on the row.
  return isRowTarget(event) && !window.getSelection()?.toString();
}

// Is this double click one that should run the default action?
// There is no text selection guard here, unlike the single click: a double click makes the browser select a word, so
// a selection is the consequence of this very gesture, not something that was already there. Guarding on it would
// mean the double click almost never fires. jsdom has no text selection at all, so only a real browser shows this.
function isPlainRowDoubleClick(event: MouseEvent<HTMLElement>): boolean {
  return isRowTarget(event);
}

const TEXT_EDITING_ELEMENTS = 'textarea, select, input:not([type="checkbox"], [type="radio"]), [contenteditable]';

// Is this inside something where the user selects or edits text themselves?
function isTextEditingTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(TEXT_EDITING_ELEMENTS) !== null;
}

// Is the mouse inside something where the user selects or edits text themselves? Then nothing is suppressed there.
function isTextEditing(event: MouseEvent<HTMLElement>): boolean {
  return isTextEditingTarget(event.target);
}

// Shift + mouse down would select text between the last click and this one. Not wanted, except inside text inputs.
function suppressesTextSelection(event: MouseEvent<HTMLElement>): boolean {
  return event.shiftKey && !isTextEditing(event);
}

// Is this the second mouse down of a double click on the free space of a row? The browser counts the clicks itself
// and reports the count in `detail`, so nothing here has to guess how long a double click may take.
function startsDoubleClick(event: MouseEvent<HTMLElement>): boolean {
  return event.detail >= 2 && isRowTarget(event);
}

// That second mouse down would select a word, which stays highlighted behind whatever the default action opened.
// On the text itself nothing is suppressed, so a word can still be double clicked and copied.
function suppressesWordSelection(event: MouseEvent<HTMLElement>): boolean {
  return startsDoubleClick(event) && !isTextEditing(event);
}

// A checkbox reports its change with the native click event, which knows about the shift key.
function isShiftClick(event: Event): boolean {
  return event instanceof MouseEvent && event.shiftKey;
}

// The keys of the search box and of a text filter: Enter applies, Escape clears. While an input method editor is
// composing (e.g. for Japanese), the keys belong to it and mean nothing here.
function textFieldKeys(onSubmit: () => void, onClear: () => void): KeyboardEventHandler {
  return (event) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter') {
      onSubmit();
    } else if (event.key === 'Escape') {
      onClear();
    }
  };
}
