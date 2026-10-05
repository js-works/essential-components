import { html, svg } from 'lit';
import type { TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { MiniApp } from '../api';

export {
  appIcon,
  appsIcon,
  checkIcon,
  chevronIcon,
  closeIcon,
  gridIcon,
  groupIcon,
  initialsOf,
  kebabIcon,
  panelIcon,
  searchIcon,
  selectorIcon,
};

// Line icons, 24 × 24, drawn in `currentColor`.
const line = (className: string, paths: TemplateResult<2>) =>
  html`<svg class="icon ${className}" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">${paths}</svg>`;

// The search (and app switcher) button: a bolt, "go to an app, fast" (Tabler's `bolt`, MIT; a magnifier before, 2026-10-04).
const searchIcon = () => line('icon--bolt', svg`<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" />`);
const chevronIcon = () => line('icon--chevron', svg`<path d="m9 6 6 6-6 6" />`);
const panelIcon = () =>
  line(
    'icon--panel',
    svg`<rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15" /><path d="m15.5 10-2 2 2 2" />`,
  );
const selectorIcon = () => line('icon--selector', svg`<path d="m8 9 4-4 4 4" /><path d="m16 15-4 4-4-4" />`);
const checkIcon = () => line('icon--check', svg`<path d="m5 12 5 5L20 7" />`);
const closeIcon = () => line('icon--close', svg`<path d="M18 6 6 18" /><path d="m6 6 12 12" />`);
// The bottom bar's "Apps" (the whole navigation): four rounded squares (Tabler's `layout-grid`, MIT).
const appsIcon = () =>
  line(
    'icon--apps',
    svg`<rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" />`,
  );
const kebabIcon = () =>
  line(
    'icon--kebab',
    svg`<circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />`,
  );

// The default logo: four filled squares, two of them lighter.
const gridIcon = () =>
  html`<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" opacity="0.6" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" opacity="0.6" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </svg>`;

// "Board Manager" is "BM", "Payroll" is "Pa".
function initialsOf(title: string): string {
  const words = title.split(/[\s\-_/+&]+/).filter((word) => /\p{L}|\p{N}/u.test(word));
  const [first = '', second] = words;

  return second === undefined ? first.slice(0, 2) : `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

// The icon of an app: its SVG markup from the config. Without one, none (made-up icons for hundreds of apps help
// nobody), except where the icon is all there is (the rail): the first letters of its title.
function appIcon(app: MiniApp, initials = false): TemplateResult | '' {
  if (app.icon !== undefined) {
    return html`<span class="tile" aria-hidden="true">${unsafeHTML(app.icon)}</span>`;
  }

  return initials ? html`<span class="tile" aria-hidden="true">${initialsOf(app.title)}</span>` : '';
}

// The icon of a group or a subgroup (from the config's `groups`); an empty space of the same size without one, so the
// names stay aligned.
function groupIcon(icon: string | undefined): TemplateResult {
  return html`<span class="group-icon" aria-hidden="true">${icon === undefined ? '' : unsafeHTML(icon)}</span>`;
}
