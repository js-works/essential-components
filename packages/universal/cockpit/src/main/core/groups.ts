import type { NavItem } from '../index.js';

export type { Group, Groupable };
export { groupsOf, subgroupsOf };

// What can be grouped: the cockpit's items (`NavItem`), the nav tree's (`NavTreeItem`).
type Groupable = { id: string; group?: string; subgroup?: string };

// A group of the navigation: its name (`''` for the items without a group) and its items, in the order of the config.
type Group<T extends Groupable = NavItem> = { name: string; items: readonly T[] };

// The groups in the order of their first item; the items without a group come first.
function groupsOf<T extends Groupable>(items: readonly T[]): Group<T>[] {
  const groups = new Map<string, T[]>([['', []]]);

  for (const item of items) {
    const name = item.group ?? '';
    const list = groups.get(name);

    if (list === undefined) {
      groups.set(name, [item]);
    } else {
      list.push(item);
    }
  }

  return [...groups].map(([name, list]) => ({ name, items: list })).filter((group) => group.items.length > 0);
}

// The second level of a group: its items without a subgroup first (`loose`), then its subgroups, in the order of their
// first item.
function subgroupsOf<T extends Groupable>(items: readonly T[]): { loose: readonly T[]; subgroups: Group<T>[] } {
  const groups = groupsOf(items.map((item) => ({ item, id: item.id, group: item.subgroup ?? '' })))
    .map((group) => ({ name: group.name, items: group.items.map((each) => each.item) }));
  const [first] = groups;

  if (first === undefined) {
    return { loose: [], subgroups: [] };
  }

  return first.name === '' ? { loose: first.items, subgroups: groups.slice(1) } : { loose: [], subgroups: groups };
}
