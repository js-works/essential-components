import type { MiniApp } from '../api';

export { groupsOf, search, subgroupsOf };
export type { Group, Match };

// A group of the navigation: its name (`''` for the apps without a group) and its apps, in the order of the config.
type Group = { name: string; apps: readonly MiniApp[] };

// A search result: the app, and where the query is in its title (for the highlight), if it is there.
type Match = { app: MiniApp; title?: { start: number; end: number } };

// The groups in the order of their first app; the apps without a group come first.
function groupsOf(apps: readonly MiniApp[]): Group[] {
  const groups = new Map<string, MiniApp[]>([['', []]]);

  for (const app of apps) {
    const name = app.group ?? '';
    const list = groups.get(name);

    if (list === undefined) {
      groups.set(name, [app]);
    } else {
      list.push(app);
    }
  }

  return [...groups].map(([name, list]) => ({ name, apps: list })).filter((group) => group.apps.length > 0);
}

// The second level of a group: its apps without a subgroup first (`loose`), then its subgroups, in the order of their
// first app.
function subgroupsOf(apps: readonly MiniApp[]): { loose: readonly MiniApp[]; subgroups: Group[] } {
  const [first, ...rest] = groupsOf(apps.map((app) => ({ ...app, group: app.subgroup ?? '' })));
  const original = (list: readonly MiniApp[]) => list.map((app) => apps.find((other) => other.id === app.id) ?? app);

  if (first === undefined) {
    return { loose: [], subgroups: [] };
  }

  const groups = [first, ...rest].map((group) => ({ name: group.name, apps: original(group.apps) }));

  return first.name === ''
    ? { loose: groups[0]?.apps ?? [], subgroups: groups.slice(1) }
    : { loose: [], subgroups: groups };
}

// The apps that match every word of the query (ignoring the case), best first: the title starts with the query, a
// word of the title starts with it, the title contains it, then a match in the description or the group only.
function search(apps: readonly MiniApp[], query: string): Match[] {
  const needle = query.trim().toLowerCase();

  if (needle === '') {
    return apps.map((app) => ({ app }));
  }

  const words = needle.split(/\s+/);

  return apps
    .flatMap((app) => {
      const title = app.title.toLowerCase();
      const all = [title, app.description ?? '', app.group ?? '', app.subgroup ?? ''].join(' ').toLowerCase();

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

      return [{ app, rank, title: index >= 0 ? { start: index, end: index + needle.length } : undefined }];
    })
    .sort((a, b) => a.rank - b.rank || a.app.title.localeCompare(b.app.title))
    .map(({ app, title }) => (title === undefined ? { app } : { app, title }));
}
