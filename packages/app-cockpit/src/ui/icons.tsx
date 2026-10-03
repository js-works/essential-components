import type { ReactElement } from 'react';

export { CheckIcon, ChevronIcon, KebabIcon, PanelIcon, SearchIcon, SelectorIcon };

// Line icons, 24 × 24, drawn in `currentColor`.
function SearchIcon(): ReactElement {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function ChevronIcon(): ReactElement {
  return (
    <svg className="icon icon--chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function PanelIcon(): ReactElement {
  return (
    <svg className="icon icon--panel" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9.5 4.5v15" />
      <path d="m15.5 10-2 2 2 2" />
    </svg>
  );
}

function SelectorIcon(): ReactElement {
  return (
    <svg className="icon icon--selector" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 9 4-4 4 4" />
      <path d="m16 15-4 4-4-4" />
    </svg>
  );
}

function CheckIcon(): ReactElement {
  return (
    <svg className="icon icon--check" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function KebabIcon(): ReactElement {
  return (
    <svg className="icon icon--kebab" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
