import type { DataNavigatorComponent } from '../src/react';

export { deleteSection, fetchAgenda, moveAgendaItem };
export type { AgendaItem };

// The data of the "Grouped reordering" tab: an agenda whose items are in sections (one level), kept in memory for as
// long as the page is open. The agenda is a list of sections, each with its items. The section `''` holds the items of
// deleted sections (the table shows it as "(Blank)").
type AgendaItem = { id: number; title: string; duration: number; section: string };

type Section = { name: string; items: AgendaItem[] };

const LOADING_TIME = 400;
const SAVING_TIME = 300;

let nextId = 1;

const section = (name: string, items: readonly (readonly [string, number])[]): Section => ({
  name,
  items: items.map(([title, duration]) => ({ id: nextId++, title, duration, section: name })),
});

let sections: Section[] = [
  section('Opening', [['Opening and adoption of the agenda', 5], ['Approval of the minutes of the last meeting', 5]]),
  section('Reports', [['Report of the Executive Board', 20], ['Report of the Audit Committee', 15]]),
  section('Proposals for decision', [
    ['Budget for the next year', 30],
    ['Lease of the new office', 20],
    ['Appointment of the auditor', 10],
  ]),
  section('Closing', [['Any other business', 10]]),
];

function wait(time: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, time);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

// The source: the whole agenda on one page (it is short), sorted by section, with the totals of the sections.
async function fetchAgenda(
  _query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<AgendaItem>> {
  await wait(LOADING_TIME, signal);

  const rows: AgendaItem[] = [];
  const groups: DataNavigatorComponent.ResultGroup[] = [];

  for (const { name, items } of sections) {
    if (items.length > 0) {
      groups.push({ key: name, total: items.length });
      rows.push(...items);
    }
  }

  return { rows, total: rows.length, groups };
}

// Saves a move: into its section, after `after` or before `before` when they are in it, else at its start.
async function moveAgendaItem(move: DataNavigatorComponent.Move<AgendaItem>): Promise<void> {
  await wait(SAVING_TIME);

  const moved: AgendaItem = { ...move.row, section: move.group ?? '' };

  sections = sections.map((other) => ({ ...other, items: other.items.filter((item) => item.id !== moved.id) }));

  const target = sections.find((other) => other.name === moved.section);

  if (target !== undefined) {
    const indexOf = (row: AgendaItem | undefined) => target.items.findIndex((item) => item.id === row?.id);
    const index = indexOf(move.after) >= 0
      ? indexOf(move.after) + 1
      : indexOf(move.before) >= 0
      ? indexOf(move.before)
      : 0;

    target.items.splice(index, 0, moved);
  }
}

// Deletes a section; its items go to the section `''` ("(Blank)"), at the end of the agenda.
async function deleteSection(name: string): Promise<void> {
  await wait(SAVING_TIME);

  const deleted = sections.find((other) => other.name === name);
  const rest = sections.filter((other) => other !== deleted);
  const blank = rest.find((other) => other.name === '') ?? { name: '', items: [] };
  const items = [...blank.items, ...(deleted?.items ?? []).map((item) => ({ ...item, section: '' }))];

  sections = [...rest.filter((other) => other !== blank), ...(items.length > 0 ? [{ name: '', items }] : [])];
}
