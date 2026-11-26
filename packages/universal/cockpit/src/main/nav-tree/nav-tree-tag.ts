import type { NavTreeClassConfig } from '../index.js';
import { createNavTreeClass } from './create-nav-tree-class.js';

export { navTreeTagFor };

const navTreeTags = new WeakMap<object, string>();

// The tag of the nav tree of a cockpit class (a package never takes a tag name of its own): registered on first use as
// `internal-cockpit-nav-tree-<n>`, `n` the first number not registered yet, with a class of its own (its config: the
// cockpit's texts and storage key). The same tag for every cockpit of that class.
function navTreeTagFor(owner: object, config: NavTreeClassConfig): string {
  let tag = navTreeTags.get(owner);

  if (tag === undefined) {
    let n = 1;

    while (customElements.get(`internal-cockpit-nav-tree-${n}`) !== undefined) {
      n += 1;
    }

    tag = `internal-cockpit-nav-tree-${n}`;
    customElements.define(tag, createNavTreeClass(config));
    navTreeTags.set(owner, tag);
  }

  return tag;
}
