import type { ReactElement, ReactNode } from 'react';
import type { DataTable } from '../api';
import { createDataTableController, subscribeToSelection } from '../core/controller';
import { DataTableView } from '../core/view/DataTableView';
import type { DataTableComponent as Spec } from '../react/api';
import type { ContentRenderer } from './content';
import { editorOf } from './editors';
import { reactFilterOf } from './filters';

export { bindController, controllerFactoryOf, releaseController, renderController };
export type { ElementSettings };

// What the element adds to the controller's options: the settings that do not depend on the row type.
type ElementSettings = {
  density: DataTable.Density;
  layout: DataTable.Layout | undefined;
  footer: DataTable.FooterMode;
  striped: boolean;
  searchable: boolean;
  reloadable: boolean;
  showTotal: boolean;
  selectableGroups: boolean;
  rowActionLook: DataTable.RowActionLook;
  selectionAppearance: DataTable.SelectionAppearance;
  pageSize: number;
  pageSizeOptions: readonly number[];
};

// The inner state of every controller, by controller (not part of the object the app sees).
type Internals = {
  // The setup that created the controller: only its element class takes it.
  readonly setup: object;
  // The React view with the controller's options, rendered by the element (the row type is kept in this closure).
  readonly render: (settings: ElementSettings, content: ContentRenderer) => ReactElement;
  // The element the controller is set on (one at a time).
  element: HTMLElement | undefined;
};

const internals = new WeakMap<object, Internals>();

// The controller factory of one setup (`setupDataTable`): typed with the setup's content type `C`, and for each
// controller with the row type of its options.
function controllerFactoryOf<C>(setup: object): DataTable.CreateTableController<C> {
  return <Row,>(options: DataTable.ControllerOptions<Row, C>): DataTable.TableController<Row, C> => {
    const core = createDataTableController<Row>();

    const controller = {
      reload: () => core.reload(),
      clearRowSelection: () => core.clearRowSelection(),
      getSelectedRows: () => core.getSelectedRows(),
      editRow: (row: Row) => core.editRow(row),
      addRow: (template: Row) => core.addRow(template),
      // The core also reports connecting and disconnecting: a listener only hears about a new selection (the table hands
      // out the same array until the selection changes).
      onSelectionChange: (listener: (rows: readonly Row[]) => void) => {
        let last = core.getSelectedRows();

        return subscribeToSelection(core, () => {
          const rows = core.getSelectedRows();

          if (rows !== last) {
            last = rows;
            listener(rows);
          }
        });
      },
    };

    internals.set(controller, {
      setup,
      element: undefined,
      render: (settings, content) => (
        <DataTableView<Row> {...propsOf(options, content)} {...settings} controller={core} />
      ),
    });

    // The content type brand exists only for the compiler.
    return controller as DataTable.TableController<Row, C>;
  };
}

function internalsOf(controller: object): Internals {
  const found = internals.get(controller);

  if (found === undefined) {
    throw new TypeError(
      'This is not a data table controller. Create one with the factory of setupDataTable().',
    );
  }

  return found;
}

// A controller belongs to one element at a time, and only to an element of its own setup.
function bindController(controller: object, element: HTMLElement, setup: object): void {
  const found = internalsOf(controller);

  if (found.setup !== setup) {
    throw new TypeError('This controller comes from another setupDataTable() than this element.');
  }

  if (found.element !== undefined && found.element !== element) {
    throw new Error('This controller is already set on another data table. Use one controller per element.');
  }

  found.element = element;
}

function releaseController(controller: object, element: HTMLElement): void {
  const found = internalsOf(controller);

  if (found.element === element) {
    found.element = undefined;
  }
}

function renderController(controller: object, settings: ElementSettings, content: ContentRenderer): ReactElement {
  return internalsOf(controller).render(settings, content);
}

// The controller's options as the props of the React view: every piece of content goes through the content renderer.
function propsOf<Row, C>(
  options: DataTable.ControllerOptions<Row, C>,
  content: ContentRenderer,
): Spec.Props<Row> {
  const { renderDetail, renderGroup } = options;

  const columnOf = (column: DataTable.Column<Row, C>): Spec.Column<Row> => {
    const { render } = column;

    return {
      key: column.key,
      header: content(column.header),
      width: column.width,
      sortable: column.sortable,
      resizable: column.resizable,
      align: column.align,
      wrap: column.wrap,
      hideable: column.hideable,
      hidden: column.hidden,
      render: render === undefined ? undefined : (row) => content(render(row)),
      filter: filterOf(column.filter, content),
      edit: editorOf(column.edit, content),
    };
  };

  return {
    source: options.source,
    reorder: options.reorder,
    saveRow: options.saveRow,
    createRow: options.createRow,
    editFields: options.editFields?.flatMap((field) => {
      const edit = editorOf(field.edit, content);

      return edit === undefined ? [] : [{ key: field.key, label: content(field.label), edit }];
    }),
    rowKey: options.rowKey,
    columns: options.columns.map((column) =>
      'columns' in column
        ? { header: content(column.header), columns: column.columns.map(columnOf) }
        : columnOf(column)
    ),
    actions: options.actions?.map((
      action,
    ) => (action.type === 'menu' ? menuOf(action, content) : actionOf(action, content))),
    renderDetail: renderDetail === undefined ? undefined : (row) => content(renderDetail(row)),
    groupBy: options.groupBy,
    renderGroup: renderGroup === undefined ? undefined : (group) => content(renderGroup(group)),
    defaultSort: options.defaultSort,
    defaultFilters: options.defaultFilters,
    title: content(options.title),
    subtitle: content(options.subtitle),
    empty: content(options.empty),
  };
}

// A built-in filter becomes its React filter; an app's own filter function renders its content through the renderer
// (called while rendering, so it follows the language like every other content).
function filterOf<C>(
  filter: DataTable.ColumnFilter<C> | undefined,
  content: ContentRenderer,
): Spec.ColumnFilter | undefined {
  if (filter === undefined) {
    return undefined;
  }

  return reactFilterOf(filter)
    ?? (typeof filter === 'function'
      ? (props: Spec.FilterProps): ReactNode => content(() => filter(props))
      : undefined);
}

// A tip is plain text (the accessible name and the tooltip), read on every render, so a function follows the language.
function lookOf<C>(look: DataTable.ActionLook<C>, content: ContentRenderer): Spec.ActionLook {
  if (look.label === undefined) {
    return { icon: content(look.icon), tip: typeof look.tip === 'function' ? look.tip() : look.tip };
  }

  return {
    label: content(look.label),
    icon: content(look.icon),
    tip: typeof look.tip === 'function' ? look.tip() : look.tip,
  };
}

function actionOf<Row, C>(action: DataTable.Action<Row, C>, content: ContentRenderer): Spec.Action<Row> {
  switch (action.type) {
    case 'general':
      return {
        type: 'general',
        key: action.key,
        variant: action.variant,
        contextMenu: action.contextMenu,
        onClick: action.onClick,
        ...lookOf(action, content),
      };
    case 'singleRow':
      return {
        type: 'singleRow',
        key: action.key,
        variant: action.variant,
        contextMenu: action.contextMenu,
        onClick: action.onClick,
        show: action.show,
        default: action.default,
        ...lookOf(action, content),
      };
    case 'multiRow':
      return {
        type: 'multiRow',
        key: action.key,
        variant: action.variant,
        contextMenu: action.contextMenu,
        onClick: action.onClick,
        ...lookOf(action, content),
      };
    case 'group':
      return {
        type: 'group',
        key: action.key,
        variant: action.variant,
        contextMenu: action.contextMenu,
        onClick: action.onClick,
        ...lookOf(action, content),
      };
  }
}

function menuOf<Row, C>(menu: DataTable.ActionMenu<Row, C>, content: ContentRenderer): Spec.ActionMenu<Row> {
  return {
    type: 'menu',
    key: menu.key,
    variant: menu.variant,
    actions: menu.actions.map((action) => (action.type === 'separator' ? action : actionOf(action, content))),
    ...lookOf(menu, content),
  };
}
