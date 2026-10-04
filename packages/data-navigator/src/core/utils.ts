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

// Did this event hit the free space of a cell of the row? Not its text, not anything a custom `render` or
// `renderDetail` drew, and not a control cell. Rows are `display: contents`, so the cells are the direct children of
// the row: the target has to be one of them. That also rules out buttons, links and inputs without listing them, and
// events from portals (an open action menu), which are not children of the row at all. The selection cell is not a
// row target either: its free space is a click on its checkbox or radio (it handles that itself).
function isRowTarget(event: MouseEvent<HTMLElement>): boolean {
  const target = event.target;

  return target instanceof Element
    && target.parentElement === event.currentTarget
    && !target.hasAttribute('data-control')
    && !target.hasAttribute('data-select');
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
