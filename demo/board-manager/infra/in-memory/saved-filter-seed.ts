import type { SavedTableFilter } from '../../domain/index.js';

export { COLLEAGUES_FILTERS };

type Filters = Readonly<Record<string, unknown>>;

// The colleagues' shared filters (made up, to show sharing), first in each table's list.
const COLLEAGUES_FILTERS: Readonly<Record<string, readonly SavedTableFilter[]>> = {
  boards: [
    sharedBy('Maria Keller', 'Committees', { name: { text: 'Committee', match: 'contains' } }),
    sharedBy('Jonas Weber', 'Meeting in the next 30 days', {
      nextMeeting: { from: daysFromToday(0), to: daysFromToday(30) },
    }),
  ],
  meetings: [
    sharedBy('Maria Keller', 'Minutes to approve', { statuses: ['Held'], minutes: ['draft'] }),
    sharedBy('Jonas Weber', 'Planned, next 90 days', {
      statuses: ['Planned'],
      start: { from: daysFromToday(0), to: daysFromToday(90) },
    }),
    sharedBy('Lena Hoffmann', 'Supervisory Board', { boards: ['Supervisory Board'] }),
  ],
  members: [
    sharedBy('Lena Hoffmann', 'Audit Committee', { boards: ['Audit Committee'] }),
    sharedBy('Jonas Weber', 'Works Council', { organizations: ['Works Council'] }),
  ],
  organizations: [
    sharedBy('Maria Keller', 'Stuttgart', { city: { text: 'Stuttgart', match: 'contains' } }),
    sharedBy('Lena Hoffmann', 'Investors', {
      names: ['Nordic Capital Partners', 'Gulf Invest', 'Stein Family Office'],
    }),
  ],
};

// A made-up colleague's shared filter.
function sharedBy(owner: string, name: string, filters: Filters): SavedTableFilter {
  return { id: `shared:${owner}:${name}`, name, filters, shared: true, owner };
}

// The day `days` from today (before it when negative), `yyyy-mm-dd` in local time.
function daysFromToday(days: number): string {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('-');
}
