export { agendaNumbers, agendaOf, arranged, blockEnd, idOf, newPlace };
export type { AgendaEntry, AgendaItem, AgendaSection };

// `presenterId` is a person; `minutes` and `decision` are empty until they are recorded. `sectionId`: the section the
// item is in, or `''`.
type AgendaItem = {
  id: string;
  meetingId: string;
  position: number;
  sectionId: string;
  title: string;
  presenterId: string;
  duration: number;
  description: string;
  minutes: string;
  decision: string;
};

// A section of an agenda: it groups items (one level). Sections and items share one order (`position`) per meeting, and
// the items of a section always follow it (`arranged()`).
type AgendaSection = { id: string; meetingId: string; position: number; title: string };

// An agenda in its order: sections and items.
type AgendaEntry = { type: 'section'; section: AgendaSection } | { type: 'item'; item: AgendaItem };

const idOf = (entry: AgendaEntry) => (entry.type === 'section' ? entry.section.id : entry.item.id);

// The group of an entry: a section is its own, an item is in its section's (or in none, `''`).
const groupOf = (entry: AgendaEntry | undefined) =>
  entry === undefined ? '' : entry.type === 'section' ? entry.section.id : entry.item.sectionId;

// The agenda of a meeting, arranged.
function agendaOf(
  state: { agendaItems: readonly AgendaItem[]; agendaSections: readonly AgendaSection[] },
  meetingId: string,
): AgendaEntry[] {
  return arranged([
    ...state.agendaSections
      .filter((section) => section.meetingId === meetingId)
      .map((section): AgendaEntry => ({ type: 'section', section })),
    ...state.agendaItems.filter((item) => item.meetingId === meetingId).map((item): AgendaEntry => ({
      type: 'item',
      item,
    })),
  ].sort((a, b) =>
    (a.type === 'section' ? a.section : a.item).position - (b.type === 'section' ? b.section : b.item).position
  ));
}

// The sections, each followed by its items, then the items without a section ("Other" in the table); an item whose
// section is gone has none. Without sections, only the items (a flat agenda).
function arranged(entries: readonly AgendaEntry[]): AgendaEntry[] {
  const sections = new Set(entries.flatMap((entry) => (entry.type === 'section' ? [entry.section.id] : [])));
  const fixed = entries.map((entry): AgendaEntry =>
    entry.type === 'item' && entry.item.sectionId !== '' && !sections.has(entry.item.sectionId)
      ? { type: 'item', item: { ...entry.item, sectionId: '' } }
      : entry
  );
  const itemsOf = (sectionId: string) =>
    fixed.filter((entry) => entry.type === 'item' && entry.item.sectionId === sectionId);

  return [
    ...fixed.flatMap((entry) => (entry.type === 'section' ? [entry, ...itemsOf(entry.section.id)] : [])),
    ...itemsOf(''),
  ];
}

// The numbers of an agenda (arranged), by id. A flat agenda: `1`, `2`, ... With sections: `2` for a section (also an
// empty one) and `2.1` for its items; the items without a section are the last one, "Other" (its number under the key
// `''`).
function agendaNumbers(agenda: readonly AgendaEntry[]): Map<string, string> {
  const numbers = new Map<string, string>();
  const flat = !agenda.some((entry) => entry.type === 'section');
  let top = 0;
  let sub = 0;

  for (const entry of agenda) {
    if (entry.type === 'section') {
      top += 1;
      sub = 0;
      numbers.set(entry.section.id, String(top));
    } else if (flat) {
      numbers.set(entry.item.id, String(++top));
    } else {
      if (entry.item.sectionId === '' && !numbers.has('')) {
        top += 1;
        sub = 0;
        numbers.set('', String(top));
      }

      numbers.set(entry.item.id, `${top}.${++sub}`);
    }
  }

  return numbers;
}

// The index after the block of the entry at `index`: a section with its items, or an item without a section.
function blockEnd(agenda: readonly AgendaEntry[], index: number): number {
  const group = groupOf(agenda[index]);

  return group === '' ? index + 1 : agenda.findLastIndex((entry) => groupOf(entry) === group) + 1;
}

// Where something new without a section goes: before "Any other business" (if the agenda ends with it), else at the end.
function newPlace(agenda: readonly AgendaEntry[]): number {
  const last = agenda.at(-1);

  return last?.type === 'item' && last.item.sectionId === '' && last.item.title === 'Any other business'
    ? agenda.length - 1
    : agenda.length;
}
