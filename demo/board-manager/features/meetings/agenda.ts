import type { GroupTotal, RowPage } from '@local/data-table/react';

import type { AgendaEntry, AgendaItem, Person } from '../../domain/index.js';
import { agendaNumbers } from '../../domain/index.js';

export type { AgendaRow };
export { agendaPage, numbered };

// An item of the agenda table. `number`: `2` for an item without a section, `2.1` for an item in a section.
type AgendaRow = AgendaItem & { number: string; presenter: string; recorded: boolean };

// The number and the title of an agenda entry: `2. Finance`, `2.1 Annual accounts`.
function numbered(number: string, title: string): string {
  return number.includes('.') ? `${number} ${title}` : `${number}. ${title}`;
}

// The agenda (arranged) as the table's one page: the items as rows, in the order of the agenda, and the sections as
// groups (the key is the section's id) with their totals, then "Other" (`''`, only with items). An empty section is a
// group with `total: 0`, so the table shows it. A search looks in the title, the description, the presenter and the
// decision (not the minutes: they are a JSON document), and then only the sections with a match are shown.
function agendaPage(agenda: readonly AgendaEntry[], people: readonly Person[], search: string): RowPage<AgendaRow> {
  const numbers = agendaNumbers(agenda);
  const rows = agenda.flatMap((entry): AgendaRow[] =>
    entry.type === 'section' ? [] : [{
      ...entry.item,
      number: numbers.get(entry.item.id) ?? '',
      presenter: people.find((person) => person.id === entry.item.presenterId)?.name ?? '',
      recorded: entry.item.minutes !== '' || entry.item.decision !== '',
    }]
  );
  const totalOf = (key: string) => rows.filter((row) => row.sectionId === key).length;
  const groups = [...agenda.flatMap((entry) => (entry.type === 'section' ? [entry.section.id] : [])), '']
    .map((key): GroupTotal => ({ key, total: totalOf(key) }))
    // "Other" only with items.
    .filter((group) => group.total > 0 || group.key !== '');
  const needle = search.trim().toLowerCase();
  const found = rows.filter((row) =>
    needle === ''
    || [row.title, row.description, row.presenter, row.decision].some((text) => text.toLowerCase().includes(needle))
  );
  const matching = new Set(found.map((row) => row.sectionId));

  return {
    rows: found,
    total: found.length,
    groups: needle === '' ? groups : groups.filter((group) => matching.has(group.key)),
  };
}
