import type { DataNavigatorComponent } from '../src/react';

export { fetchTasks, reorderTasks, statuses };
export type { Task };

// The data of the "Row reordering" tab: a backlog, in the order of its priority. The order is kept in memory for as
// long as the page is open.
type Task = {
  id: number;
  title: string;
  status: 'Open' | 'In progress' | 'Done';
  // The row details: only some tasks have them.
  details?: string;
};

const LOADING_TIME = 500;
const SAVING_TIME = 300;

const statuses = ['Open', 'In progress', 'Done'] as const;

const titles = [
  'Fix the login timeout',
  'Update the privacy policy',
  'Add the dark mode to the settings',
  'Migrate the reports to the new API',
  'Write the release notes',
  'Review the invoice layout',
  'Translate the onboarding into German',
  'Speed up the search',
  'Remove the old export format',
  'Add a CSV import',
  'Check the accessibility of the forms',
  'Archive the projects of 2024',
  'Replace the date picker',
  'Add two-factor authentication',
  'Clean up the user roles',
  'Test the backup restore',
  'Document the public API',
  'Show the storage quota',
  'Send reminder emails',
  'Upgrade the database',
  'Add keyboard shortcuts',
  'Redesign the dashboard',
  'Limit the upload size',
  'Log the admin actions',
];

// The details of some tasks, by id.
const details: Readonly<Record<number, string>> = {
  1: 'Users are logged out after 5 minutes instead of 30. Reported by support, 12 tickets so far.',
  3: 'Follow the color scheme of the system by default, with a switch for light and dark.',
  4: 'The old API is switched off at the end of the year. Monthly and yearly reports first.',
  7: 'Texts are ready in the translation tool; the screenshots still need to be replaced.',
  8: 'A search for a customer takes up to 4 seconds. Add an index on the name and the email.',
  11: 'Labels, focus order and error messages. Screen reader test with NVDA and VoiceOver.',
  14: 'With an authenticator app first; SMS later, if at all.',
  16: 'Restore last night\'s backup on the staging server and compare the row counts.',
  20: 'Needs a maintenance window of about one hour, on a weekend.',
  22: 'Draft from the design team is in review, see the latest mockups.',
};

let tasks: readonly Task[] = titles.map((title, index) => ({
  id: index + 1,
  title,
  status: statuses[index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0] ?? 'Open',
  details: details[index + 1],
}));

function wait(time: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, time);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

// The source: the tasks in their order (the table has no column sorting), with search and filters.
async function fetchTasks(
  query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<Task>> {
  await wait(LOADING_TIME, signal);

  const { page, pageSize } = query;
  const text = query.search.toLowerCase();
  const { status } = query.filters;
  const found = tasks
    .filter((task) => (typeof status !== 'string' || task.status === status))
    .filter((task) => text === '' || task.title.toLowerCase().includes(text));

  return { rows: found.slice((page - 1) * pageSize, page * pageSize), total: found.length };
}

// Saves a move: the task goes right after `after` (or right before `before`, at the top of a page). With `fail`, the
// save is refused, and the table loads the page again.
async function reorderTasks(move: DataNavigatorComponent.Move<Task>, fail: boolean): Promise<void> {
  await wait(SAVING_TIME);

  if (fail) {
    throw new Error('The demo refused to save the move ("Saving fails" is on).');
  }

  const rest = tasks.filter((task) => task.id !== move.row.id);
  const index = move.after !== undefined
    ? rest.findIndex((task) => task.id === move.after?.id) + 1
    : rest.findIndex((task) => task.id === move.before?.id);

  tasks = [...rest.slice(0, index), move.row, ...rest.slice(index)];
}
