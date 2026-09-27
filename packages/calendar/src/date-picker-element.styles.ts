export { bridgeStyles };

// The bridge from the core's `--cal-*` tokens to concrete values: the colors of picoui's theme (where this picker
// comes from), fixed here, with `light-dark()` for both color schemes. A first step: a real theme (a config per class,
// like the other packages) replaces these later.
const bridgeStyles = `
  :host {
    display: inline-block;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .base {
    --cal-font-family: inherit;
    /* The same base size as the other packages (the file upload's default, the data navigator's 14px). */
    --cal-font-size: 0.875rem;
    --cal-color: light-dark(#000000, #f5f5f5);
    --cal-background-color: transparent;
    --cal-border-color: light-dark(#d4d4d4, #404040);

    --cal-header-background-color: transparent;
    --cal-header-hover-color: light-dark(#000000, #f5f5f5);
    --cal-header-hover-background-color: light-dark(#dbeafe, #1e3a8a);
    --cal-header-active-color: light-dark(#000000, #f5f5f5);
    --cal-header-active-background-color: light-dark(#bfdbfe, #1e40af);
    --cal-header-accentuated-color: #ffffff;
    --cal-header-accentuated-background-color: light-dark(#2563eb, #60a5fa);
    --cal-header-accentuated-hover-color: #ffffff;
    --cal-header-accentuated-hover-background-color: light-dark(#1d4ed8, #93c5fd);
    --cal-header-accentuated-active-color: #ffffff;
    --cal-header-accentuated-active-background-color: light-dark(#1e40af, #bfdbfe);

    --cal-nav-color: light-dark(#525252, #a3a3a3);
    --cal-focus-ring-color: #3b82f6;

    --cal-cell-hover-color: light-dark(#000000, #f5f5f5);
    --cal-cell-hover-background-color: light-dark(#dbeafe, #1e3a8a);
    --cal-cell-disabled-color: light-dark(#a3a3a3, #525252);
    --cal-cell-highlighted-background-color: light-dark(#f5f5f5, #171717);
    --cal-cell-adjacent-color: light-dark(#a3a3a3, #525252);
    --cal-cell-adjacent-disable-color: light-dark(#d4d4d4, #404040);
    --cal-cell-current-highlighted-color: light-dark(#2563eb, #60a5fa);
    --cal-cell-selected-color: #ffffff;
    --cal-cell-selected-background-color: #3b82f6;
    --cal-cell-selected-hover-background-color: light-dark(#2563eb, #60a5fa);
    --cal-cell-selection-range-background-color: light-dark(#dbeafe, #1e3a8a);

    --cal-tab-hover-background-color: light-dark(#f5f5f5, #171717);
    --cal-button-border-radius: 6px;
  }

  /* A little room between the month/year header and the sheet below it. */
  .cal-header {
    margin-block-end: 0.0625em;
  }
`;
