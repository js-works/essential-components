import { describe, expect, it } from 'vitest';

import { groupsOf, subgroupsOf } from '../../main/core/groups.js';
import type { NavItem } from '../../main/index.js';

const item = (id: string, group?: string, subgroup?: string): NavItem => ({
  id,
  title: id,
  element: 'x-app',
  ...(group === undefined ? {} : { group }),
  ...(subgroup === undefined ? {} : { subgroup }),
});

const names = (groups: readonly { name: string; items: readonly NavItem[] }[]) =>
  groups.map((group) => [group.name, group.items.map((each) => each.id)]);

describe('the groups', () => {
  it('in the order of their first item; the items without a group first', () => {
    const items = [item('a', 'Main'), item('b', 'Internals'), item('c'), item('d', 'Main')];

    expect(names(groupsOf(items))).toEqual([['', ['c']], ['Main', ['a', 'd']], ['Internals', ['b']]]);
  });

  it('no group without items', () => {
    expect(groupsOf([])).toEqual([]);
    expect(names(groupsOf([item('a', 'Main')]))).toEqual([['Main', ['a']]]);
  });

  it('the folders of a group: the items without a folder first, then the folders by their first item', () => {
    const items = [item('a', 'Main', 'Apps'), item('b', 'Main'), item('c', 'Main', 'Admin'), item('d', 'Main', 'Apps')];
    const { loose, subgroups } = subgroupsOf(items);

    expect(loose.map((each) => each.id)).toEqual(['b']);
    expect(names(subgroups)).toEqual([['Apps', ['a', 'd']], ['Admin', ['c']]]);
    // The items as they were given (their `group` kept).
    expect(subgroups[0]?.items[0]).toBe(items[0]);
  });

  it('no folders, or only folders', () => {
    expect(subgroupsOf([])).toEqual({ loose: [], subgroups: [] });
    expect(subgroupsOf([item('a', 'Main', 'Apps')]).loose).toEqual([]);
  });
});
