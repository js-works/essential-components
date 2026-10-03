import type { DataNavigatorComponent } from '../../../../packages/data-navigator/src/react';
import { agendaNumbers, agendaOf, arranged, blockEnd, idOf, newPlace } from '../../domain';
import type { AgendaEntry, AgendaItem } from '../../domain';
import { getPerson } from './lookups';
import { runQuery } from './query';
import { db, LOADING_TIME, newId, save, wait } from './store';
import type { Db } from './store';

export {
  createAgendaItem,
  deleteAgendaItems,
  fetchAgenda,
  newSectionId,
  reorderAgenda,
  saveSectionDraft,
  updateAgendaItem,
  withSectionDraft,
};
export type { AgendaRow, SectionDraft };

// `number`: `2` for an item without a section, `2.1` for an item in a section.
type AgendaRow = AgendaItem & { number: string; presenter: string; recorded: 'Yes' | 'No' };

// The sections of a meeting as the "Sections" drawer changes them, until "Apply": their order and names. A section of
// the meeting that is missing is deleted; one with a new id (`newSectionId()`) is added.
type SectionDraft = readonly { id: string; title: string }[];

// The items as rows, in the order of the agenda, and the sections as groups (the key is the section's id) with their
// totals, then "Other" (`''`, only with items). One page holds the whole agenda (no search, no filters). An empty
// section is a group with `total: 0`, so the table shows it.
function fetchAgenda(meetingId: string): DataNavigatorComponent.Source<AgendaRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const state = db.getState();
    const agenda = agendaOf(state, meetingId);
    const numbers = agendaNumbers(agenda);
    const rows = agenda.flatMap((entry): AgendaRow[] =>
      entry.type === 'section' ? [] : [{
        ...entry.item,
        number: numbers.get(entry.item.id) ?? '',
        presenter: getPerson(state, entry.item.presenterId)?.name ?? '',
        recorded: entry.item.minutes === '' && entry.item.decision === '' ? 'No' : 'Yes',
      }]
    );
    const totalOf = (key: string) => rows.filter((row) => row.sectionId === key).length;
    const groups = [
      ...agenda.flatMap((entry) => (entry.type === 'section' ? [entry.section.id] : [])),
      '',
    ]
      .map((key): DataNavigatorComponent.ResultGroup => ({ key, total: totalOf(key) }))
      // "Other" only with items.
      .filter((group) => group.total > 0 || group.key !== '');

    return { ...runQuery(rows, query, { search: [] }), groups };
  };
}

type AgendaValues = Pick<AgendaItem, 'sectionId' | 'title' | 'presenterId' | 'duration' | 'description'>;

// The new state of a meeting's agenda: arranged, and the positions numbered again (1, 2, 3, ...).
function withAgenda(state: Db, meetingId: string, entries: readonly AgendaEntry[]): Partial<Db> {
  const order = arranged(entries);
  const position = (id: string) => order.findIndex((entry) => idOf(entry) === id) + 1;

  return {
    agendaItems: [
      ...state.agendaItems.filter((item) => item.meetingId !== meetingId),
      ...order.flatMap((
        entry,
      ) => (entry.type === 'item' ? [{ ...entry.item, position: position(entry.item.id) }] : [])),
    ],
    agendaSections: [
      ...state.agendaSections.filter((section) => section.meetingId !== meetingId),
      ...order.flatMap((entry) =>
        entry.type === 'section' ? [{ ...entry.section, position: position(entry.section.id) }] : []
      ),
    ],
  };
}

// An item in a section goes to the end of it; one without a section before "Any other business".
async function createAgendaItem(meetingId: string, values: AgendaValues): Promise<void> {
  await save((state) => {
    const agenda = agendaOf(state, meetingId);
    const item: AgendaItem = { id: newId('a'), meetingId, position: 0, ...values, minutes: '', decision: '' };
    const section = agenda.findIndex((entry) => entry.type === 'section' && entry.section.id === values.sectionId);
    const index = section >= 0 ? blockEnd(agenda, section) : newPlace(agenda);

    return withAgenda(state, meetingId, agenda.toSpliced(index, 0, { type: 'item', item }));
  });
}

// Another section: the item goes to the end of it. Out of its section (`sectionId: ''`): to "Other", before "Any other
// business" (else at the end).
async function updateAgendaItem(id: string, values: Partial<Omit<AgendaItem, 'id' | 'meetingId'>>): Promise<void> {
  await save((state) => {
    const current = state.agendaItems.find((item) => item.id === id);

    if (current === undefined) {
      return {};
    }

    const changed = { ...current, ...values };

    if (changed.sectionId === current.sectionId) {
      return { agendaItems: state.agendaItems.map((item) => (item.id === id ? changed : item)) };
    }

    const rest = agendaOf(state, current.meetingId).filter((entry) => idOf(entry) !== id);
    const anchor = rest.findIndex((entry) => entry.type === 'section' && entry.section.id === changed.sectionId);
    const index = changed.sectionId !== '' && anchor >= 0 ? blockEnd(rest, anchor) : newPlace(rest);

    return withAgenda(state, current.meetingId, rest.toSpliced(index, 0, { type: 'item', item: changed }));
  });
}

async function deleteAgendaItems(ids: readonly string[]): Promise<void> {
  await save((state) => {
    const meetingId = state.agendaItems.find((item) => ids.includes(item.id))?.meetingId ?? '';

    return withAgenda(state, meetingId, agendaOf(state, meetingId).filter((entry) => !ids.includes(idOf(entry))));
  });
}

// A move of the agenda table (`reorder`): the item joins `move.group` (a section, or none) and goes after `move.after`
// (a row on the page), or before `move.before`. In a section, it is placed among that section's items (at its start
// when neither neighbor is in it). Saved at once (no spinner to show).
async function reorderAgenda(move: DataNavigatorComponent.Move<AgendaRow>): Promise<void> {
  await wait(LOADING_TIME);

  const { meetingId } = move.row;

  db.setState((state) => {
    const rest = agendaOf(state, meetingId).filter((entry) => idOf(entry) !== move.row.id);
    const item = state.agendaItems.find((other) => other.id === move.row.id);

    if (item === undefined) {
      return {};
    }

    const moved: AgendaEntry = { type: 'item', item: { ...item, sectionId: move.group ?? '' } };
    const indexOf = (row: AgendaRow | undefined) =>
      rest.findIndex((entry) => row !== undefined && idOf(entry) === row.id);
    const inSection = (row: AgendaRow | undefined) => row !== undefined && row.sectionId === move.group;
    const header = rest.findIndex((entry) => entry.type === 'section' && entry.section.id === move.group);
    const index = move.group !== undefined
      ? inSection(move.after)
        ? indexOf(move.after) + 1
        : inSection(move.before)
        ? indexOf(move.before)
        : header >= 0
        ? header + 1
        : rest.length
      : move.after !== undefined
      ? blockEnd(rest, indexOf(move.after))
      : move.before !== undefined
      ? indexOf(move.before)
      : 0;

    return withAgenda(state, meetingId, rest.toSpliced(Math.max(0, index), 0, moved));
  });
}

const newSectionId = () => newId('s');

// A draft of the sections (the "Sections" drawer) applied to a meeting's agenda: the sections of the draft, in its order
// and with its names, each with its items. A section that is missing from the draft is deleted; its items go to
// "Other", at its start (before the items that were there already).
function withSectionDraft(state: Db, meetingId: string, draft: SectionDraft): Partial<Db> {
  const items = agendaOf(state, meetingId).filter((entry) => entry.type === 'item');
  const sections = draft.map((section): AgendaEntry => ({
    type: 'section',
    section: { id: section.id, meetingId, position: 0, title: section.title },
  }));

  return withAgenda(state, meetingId, [...sections, ...items]);
}

// "Apply" of the "Sections" drawer: the whole draft at once.
async function saveSectionDraft(meetingId: string, draft: SectionDraft): Promise<void> {
  await save((state) => withSectionDraft(state, meetingId, draft));
}
