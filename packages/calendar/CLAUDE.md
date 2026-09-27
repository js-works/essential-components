# calendar

A calendar date/time picker as a vanilla custom element: month, year, decade and century views, selection modes
(single, multiple, range; dates, weeks, months, quarters, years, times) and optional time columns.

A first step: taken over from `~/git/picoui` (`src/main/components/date-picker/`), where a Lit element wrapped the same
core. Not final; the directory may be renamed later.

## Layout

- `src/vanilla/`: the framework-free core, copied unchanged from picoui: `DatePicker` (renders and patches its own DOM
  through its small virtual DOM, `vdom.ts`), the `Calendar` interface with a Gregorian implementation and its i18n, the
  CSS as a string with `--cal-*` tokens, icons.
- `src/date-picker-element.ts`: `DatePickerElement`, the custom element (exported, never registered; replaces
  picoui's Lit wrapper). Shadow DOM, one shared stylesheet (the core's CSS plus the bridge). Attributes (`value`,
  `selection-mode`, `calendar-size`, `minute-step`, `min-date`, `max-date`, and the boolean `accentuate-header`,
  `show-week-numbers`, `highlight-current`, `highlight-weekends`, `disable-weekends`, `enable-century-view`) become the
  core's props; several changes in one task render once. The language and direction come from the closest `lang`/`dir`
  (watched on the element and on `<html>`). A selection updates `value` and fires `change`.
- `src/date-picker-element.styles.ts`: the bridge that sets the core's `--cal-*` tokens to fixed values (picoui's theme
  colors, with `light-dark()`, and the font size `0.875rem`, like the other packages). A real theme config comes later.
- `demo/`: `DatePickerDemo` (a light DOM demo element, see "Demo element" in the other packages): the picker and its
  switches (locale incl. `ar-SA` right to left, selection mode, size, minute step, the boolean attributes, min/max
  date) as `ui-select`s (labels above them, `ui-field--stacked`) and `ui-checkbox`es for the on/off switches, and the
  reported `value`.
  - Min. and max. date (side by side) are read-only text fields with a calendar button and, while there is a date, a
    clear button (X) before it (no hover effect on either). The calendar button, a click on the field and its focus open
    a second date picker in a native popover (`popover="auto"`: closes on a click outside and on Escape), placed above
    the field by script (8px apart, the popup flush with the outer edge of the field's focus ring on the left, 4px left
    of the field). A click on a day takes it and closes the popover; a click on the selected day empties the field.
  - `index.html` + `main.ts`: the page (color scheme switch). `demo/ui/`: the design language, the same files as
    everywhere.

- `types/index.d.ts`: the public API as a hand-written declaration, which `exports` gives other packages for their
  type checking (the core is not written for their stricter compiler options, e.g. `noUncheckedIndexedAccess`). Keep
  it in sync with `src/index.ts` and `src/date-picker-element.ts`.
- Used by `data-navigator`'s `dateRangeColumnFilter()` (a dependency of that package): keep `DatePickerElement`'s
  `value` (a range is `from,to`), `selection-mode`, `lang` and `change` stable.

## Known gaps (from picoui)

- Not form-associated. The core's `setValue` is best-effort (splits on commas, no validation).
- No theme config, no i18n adapter, no tests yet.
