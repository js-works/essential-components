import { useState } from 'react';
import type { ReactElement } from 'react';
import { createDataTableComponent, useDataTableController } from '../src/react';
import type { DataTableComponent } from '../src/react';
import { defaultTheme } from '../src/themes';
import { deleteSection, fetchAgenda, moveAgendaItem } from './agenda';
import type { AgendaItem } from './agenda';
import { fixedHeight, selectedLine } from './Demo.module.css';
import { i18n } from './i18n';
import { icons } from './icons';
import { useToasts } from './Toasts';

export { GroupedReorderDemo };

const DataTable = createDataTableComponent({ i18n, theme: defaultTheme });

const columns: readonly DataTableComponent.Column<AgendaItem>[] = [
  { key: 'title', header: 'Item', width: 5 },
  // A fixed width (a CSS length); the item takes the rest.
  { key: 'duration', header: 'Duration', width: '7rem', align: 'end', render: (item) => `${item.duration} min` },
];

// The "Grouped reordering" tab: an agenda whose items are in sections (`groupBy`). Items are moved with their handle,
// within a section or into another one (right below a section's header, its start; Alt+ArrowUp/ArrowDown pass the
// headers too). The trash icon on a section header (a group action, also in its context menu) deletes the section, its
// items go to the blank group ("(Blank)").
function GroupedReorderDemo(): ReactElement {
  const nav = useDataTableController<AgendaItem>();
  const { show, toasts } = useToasts();
  const [lastMove, setLastMove] = useState('none');

  const reorder = async (move: DataTableComponent.Move<AgendaItem>) => {
    setLastMove(`"${move.row.title}" into "${move.group ?? ''}"`);
    await moveAgendaItem(move);
  };

  const actions: readonly DataTableComponent.Action<AgendaItem>[] = [
    {
      type: 'group',
      key: 'delete',
      icon: icons.remove,
      tip: 'Delete section',
      onClick: (group) => {
        void deleteSection(group.key).then(() => {
          nav.reload();
          show(`"${group.key}" deleted, its items are in "(Blank)"`);
        });
      },
    },
  ];

  return (
    <div className="ui-stack">
      <div className={fixedHeight}>
        <DataTable
          controller={nav}
          title="Agenda"
          subtitle="Drag an item by its handle, also into another section"
          source={fetchAgenda}
          reorder={reorder}
          groupBy="section"
          rowKey="id"
          columns={columns}
          actions={actions}
          pageSize={50}
          pageSizeOptions={[50]}
        />
      </div>
      <div className="ui-toolbar">
        <span className={`ui-note ${selectedLine}`}>Last move: {lastMove}</span>
      </div>
      {toasts}
    </div>
  );
}
