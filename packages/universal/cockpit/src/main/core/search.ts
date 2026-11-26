import type { NavItem } from '../index.js';

export type { Match };
export { search };

// A search result: the item, and where the query is in its title (for the highlight), if it is there.
type Match = { item: NavItem; title?: { start: number; end: number } };

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
