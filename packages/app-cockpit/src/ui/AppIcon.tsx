import type { ReactElement } from 'react';
import type { MiniApp } from '../api';

export { AppIcon, GroupIcon, initialsOf };

// The icon of an app: its SVG markup from the config (drawn in `currentColor`, the accent color). Without one, none
// (made-up icons for hundreds of apps help nobody), except where the icon is all there is (the rail): the first
// letters of its title.
function AppIcon({ app, initials = false }: { app: MiniApp; initials?: boolean }): ReactElement | null {
  if (app.icon !== undefined) {
    return <span className="tile" aria-hidden="true" dangerouslySetInnerHTML={{ __html: app.icon }} />;
  }

  return initials ? <span className="tile" aria-hidden="true">{initialsOf(app.title)}</span> : null;
}

// "Board Manager" is "BM", "Payroll" is "Pa".
function initialsOf(title: string): string {
  const words = title.split(/[\s\-_/+&]+/).filter((word) => /\p{L}|\p{N}/u.test(word));
  const [first = '', second] = words;

  return second === undefined ? first.slice(0, 2) : `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

// The icon of a group (from the config's `groups`), drawn in the accent color; an empty space of the same size without
// one, so the names stay aligned.
function GroupIcon({ icon }: { icon: string | undefined }): ReactElement {
  return icon === undefined
    ? <span className="group-icon" aria-hidden="true" />
    : <span className="group-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />;
}
