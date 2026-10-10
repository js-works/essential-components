import type { NavItem } from '../api';

export { groupsOf, search, subgroupsOf };
export type { Group, Match };

// A group of the navigation: its name (`''` for the items without a group) and its items, in the order of the config.
type Group = { name: string; items: readonly NavItem[] };

// A search result: the item, and where the query is in its title (for the highlight), if it is there.
type Match = { item: NavItem; title?: { start: number; end: number } };

// The groups in the order of their first item; the items without a group come first.
function groupsOf(items: readonly NavItem[]): Group[] {
  const groups = new Map<string, NavItem[]>([['', []]]);

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
function subgroupsOf(items: readonly NavItem[]): { loose: readonly NavItem[]; subgroups: Group[] } {
  const [first, ...rest] = groupsOf(items.map((item) => ({ ...item, group: item.subgroup ?? '' })));
  const original = (list: readonly NavItem[]) =>
    list.map((item) => items.find((other) => other.id === item.id) ?? item);

  if (first === undefined) {
    return { loose: [], subgroups: [] };
  }

  const groups = [first, ...rest].map((group) => ({ name: group.name, items: original(group.items) }));

  return first.name === ''
    ? { loose: groups[0]?.items ?? [], subgroups: groups.slice(1) }
    : { loose: [], subgroups: groups };
}

// The items that match every word of the query (ignoring the case), best first: the title starts with the query, a
// word of the title starts with it, the title contains it, then a match in the description or the group only.
function search(items: readonly NavItem[], query: string): Match[] {
  const needle = query.trim().toLowerCase();

  if (needle === '') {
    return items.map((item) => ({ item }));
  }

  const words = needle.split(/\s+/);

  return items
    .flatMap((item) => {
      const title = item.title.toLowerCase();
      const all = [title, item.description ?? '', item.group ?? '', item.subgroup ?? ''].join(' ').toLowerCase();

      if (!words.every((word) => all.includes(word))) {
        return [];
      }

      const index = title.indexOf(needle);
      const rank = title.startsWith(needle)
        ? 0
        : index > 0 && /\s|-/.test(title.charAt(index - 1))
        ? 1
        : index >= 0
        ? 2
        : 3;

      return [{ item, rank, title: index >= 0 ? { start: index, end: index + needle.length } : undefined }];
    })
    .sort((a, b) => a.rank - b.rank || a.item.title.localeCompare(b.item.title))
    .map(({ item, title }) => (title === undefined ? { item } : { item, title }));
}
