import { useRef, useState } from 'react';

import type { RowMove, TableActions, TableColumns } from '../src/react/index.js';
import { createDataTableComponent, defineFilters, selectFilter } from '../src/react/index.js';
import { defaultTheme } from '../src/themes/index.js';
import { badge, fixedHeight, note, selectedLine } from './demo.module.css';
import { i18n } from './i18n.js';
import { icons } from './icons.js';
import type { Task } from './tasks.js';
import { markDone, reorderTasks, statuses, taskSource } from './tasks.js';
import { useToasts } from './toasts.js';

export { ReorderDemo };

const DataTable = createDataTableComponent({ i18n, theme: defaultTheme });

// No column is `sortable`: the order of the rows is the one they are moved to.
const columns: TableColumns<Task> = [
  { key: 'title', header: 'Task', width: 5 },
  {
    key: 'status',
    header: 'Status',
    width: 1.5,
    align: 'center',
    render: (task) => <span className={badge}>{task.status}</span>,
  },
];

const filters = defineFilters({
  status: selectFilter({ options: statuses }),
});

type Saving = 'succeeds' | 'fails';

// The "Row reordering" tab: a backlog in the order of its priority. The rows are moved with the handle at their start
// (drag it, or Alt+ArrowUp/ArrowDown on it), within the page; search and filters hide the handles. Every move is saved
// by `reorder` (the fake server takes 300ms); with "Saving fails", the save is refused and the page is loaded again.
function ReorderDemo() {
  const { show, toasts } = useToasts();
  const [saving, setSaving] = useState<Saving>('succeeds');
  const [lastMove, setLastMove] = useState('none');
  // The latest choice, for a move that is saved after a change of it.
  const savingRef = useRef(saving);

  savingRef.current = saving;

  const reorder = async (move: RowMove<Task>) => {
    const place = move.after !== undefined
      ? `after "${move.after.title}"`
      : move.before !== undefined
      ? `before "${move.before.title}"`
      : 'in place';

    setLastMove(`"${move.row.title}" ${place}`);
    await reorderTasks(move, savingRef.current === 'fails');
  };

  const actions: TableActions<Task> = [
    {
      type: 'multiRow',
      key: 'done',
      label: 'Mark as done',
      icon: icons.done,
      onClick: async (tasks) => {
        await markDone(tasks.map((task) => task.id));
        show(`Done: ${tasks.map((task) => task.title).join(', ')}`);
      },
    },
  ];

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <label className="ui-field">
          Saving
          <select
            className="ui-select"
            value={saving}
            onChange={(event) => setSaving(event.currentTarget.value as Saving)}
          >
            <option value="succeeds">succeeds</option>
            <option value="fails">fails</option>
          </select>
        </label>
      </div>
      <div className={fixedHeight}>
        <DataTable
          title="Backlog"
          subtitle="Drag a task by its handle to change its priority (or Alt+ArrowUp/ArrowDown on the handle)"
          searchable
          reloadable
          source={taskSource}
          reorder={reorder}
          rowKey="id"
          columns={columns}
          filters={filters}
          actions={actions}
          striped
          pageSize={10}
          pageSizeOptions={[10, 25]}
          // Only some tasks have details (a row without them has no chevron); a moved row takes its details along.
          renderDetail={(task) => (task.details === undefined ? null : <span className={note}>{task.details}</span>)}
        />
      </div>
      <div className="ui-toolbar">
        <span className={`ui-note ${selectedLine}`}>Last move: {lastMove}</span>
      </div>
      {toasts}
    </div>
  );
}
