import type { AgendaEntry, AgendaItem, AgendaRepository } from '../../domain/index.js';
import { agendaOf, arranged, blockEnd, idOf, newPlace, withSections } from '../../domain/index.js';
import type { Db } from './store.js';
import { db, LOADING_TIME, newId, save, wait } from './store.js';

export { createAgendaRepository };

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

// The agendas of the in-memory store.
function createAgendaRepository(): AgendaRepository {
  return {
    async agenda(meetingId, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();

      return {
        items: state.agendaItems.filter((item) => item.meetingId === meetingId),
        sections: state.agendaSections.filter((section) => section.meetingId === meetingId),
      };
    },

    async createItem(meetingId, values) {
      await save((state) => {
        const agenda = agendaOf(state, meetingId);
        const item: AgendaItem = { id: newId('a'), meetingId, position: 0, ...values, minutes: '', decision: '' };
        const section = agenda.findIndex((entry) => entry.type === 'section' && entry.section.id === values.sectionId);
        const index = section >= 0 ? blockEnd(agenda, section) : newPlace(agenda);

        return withAgenda(state, meetingId, agenda.toSpliced(index, 0, { type: 'item', item }));
      });
    },

    async updateItem(id, values) {
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
    },

    async deleteItems(ids) {
      await save((state) => {
        const meetingId = state.agendaItems.find((item) => ids.includes(item.id))?.meetingId ?? '';

        return withAgenda(state, meetingId, agendaOf(state, meetingId).filter((entry) => !ids.includes(idOf(entry))));
      });
    },

    // In a section, the item is placed among that section's items (at its start when neither neighbor is in it).
    // Saved at once (no spinner to show).
    async move({ meetingId, itemId, group, after, before }) {
      await wait(LOADING_TIME);

      db.setState((state) => {
        const rest = agendaOf(state, meetingId).filter((entry) => idOf(entry) !== itemId);
        const item = state.agendaItems.find((other) => other.id === itemId);

        if (item === undefined) {
          return {};
        }

        const moved: AgendaEntry = { type: 'item', item: { ...item, sectionId: group ?? '' } };
        const indexOf = (neighbor: { id: string } | undefined) =>
          rest.findIndex((entry) => neighbor !== undefined && idOf(entry) === neighbor.id);
        const inSection = (neighbor: { sectionId: string } | undefined) =>
          neighbor !== undefined && neighbor.sectionId === group;
        const header = rest.findIndex((entry) => entry.type === 'section' && entry.section.id === group);
        const index = group !== undefined
          ? inSection(after)
            ? indexOf(after) + 1
            : inSection(before)
            ? indexOf(before)
            : header >= 0
            ? header + 1
            : rest.length
          : after !== undefined
          ? blockEnd(rest, indexOf(after))
          : before !== undefined
          ? indexOf(before)
          : 0;

        return withAgenda(state, meetingId, rest.toSpliced(Math.max(0, index), 0, moved));
      });
    },

    async saveSections(meetingId, draft) {
      await save((state) => withAgenda(state, meetingId, withSections(agendaOf(state, meetingId), meetingId, draft)));
    },
  };
}
