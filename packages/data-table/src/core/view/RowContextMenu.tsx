import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { useContext, useEffect, useRef } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import type { DataTableComponent as Spec } from '../../react/api';
import type { ActionItem, ContextMenuItem } from '../actions';
import type { ContextTarget } from '../useDataTable';
import { hasContent } from '../utils';
import * as classes from './classes';
import { icons } from './icons';
import { LayerContext } from './layer';

export { RowContextMenu };

type RowContextMenuProps<Row> = {
  items: readonly ContextMenuItem<Row>[];
  available: (target: ContextTarget) => boolean;
  prepare: (target: ContextTarget) => boolean;
  invoke: (action: Spec.Action<Row>) => void;
  className: string;
  style?: CSSProperties;
  // The role of the trigger: the grid (`table`), or the list of cards in a narrow table (`list`).
  role?: 'table' | 'list';
  children: ReactNode;
};

// Where the browser's own menu is what the user wants: on a link, a field to type in (not on a checkbox or a radio,
// like the row's selection), and on text selected in the row (to copy it).
const BROWSER_MENU_TARGETS = [
  'a[href]',
  'input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"])',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

function keepsBrowserMenu(target: Element, row: Element): boolean {
  if (target.closest(BROWSER_MENU_TARGETS) !== null) {
    return true;
  }

  const selection = row.ownerDocument.getSelection();

  // A selection that is not empty and reaches into the row (the whole row or a part of it).
  return Array.from({ length: selection?.rangeCount ?? 0 }, (_, index) => selection?.getRangeAt(index))
    .some((range) => range !== undefined && !range.collapsed && range.intersectsNode(row));
}

// The data row (or its detail row) or the group header an event happened in, if any.
function rowOf(target: EventTarget | null | undefined): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>('[data-row-key], [data-group-key]') : null;
}

function targetOf(row: HTMLElement): ContextTarget {
  const group = row.dataset['groupKey'];

  return group !== undefined ? { type: 'group', key: group } : { type: 'row', key: row.dataset['rowKey'] ?? '' };
}

// The text of an action or menu in the menu: its label, or the tip of an icon-only one.
function textOf<Row>(item: ActionItem<Row>): ReactNode {
  return item.label ?? item.tip;
}

// Whether a menu (or submenu) shows an icon column: when at least one of its entries has an icon.
function hasIcons<Row>(list: readonly ContextMenuItem<Row>[]): boolean {
  return list.some((item) => item.type !== 'separator' && hasContent(item.icon));
}

// The class of a (sub)menu's popup: with icons, a grid, so the texts line up (see `.menuWithIcons`).
function popupClassOf<Row>(list: readonly ContextMenuItem<Row>[]): string {
  return hasIcons(list) ? `${classes.popup} ${classes.menuWithIcons}` : classes.popup;
}

// The context menu of the rows and of the group headers (Base UI's ContextMenu: right-click, long press, the context
// menu key, Shift+F10): the table element is its trigger. See contextMenuItems for its entries. It is rendered in the layer of the root (so it
// gets the tokens of the theme).
function RowContextMenu<Row>(props: RowContextMenuProps<Row>): ReactElement {
  const { items, available, prepare, invoke, className, style, role = 'table', children } = props;
  const layer = useContext(LayerContext);
  const tableRef = useRef<HTMLDivElement>(null);
  // The latest ones: Base UI keeps the open handler of the first render, and our listener lives across renders.
  const latest = useRef({ available, prepare });

  latest.current = { available, prepare };

  // Where the browser's menu is wanted (outside the data rows, see keepsBrowserMenu, and when there is nothing to show),
  // the event goes no further than the table: neither Base UI's handler nor its listener on the document (which keeps
  // the browser's menu away from everything in the trigger) get it. A long press starts the same way on touch.
  useEffect(() => {
    const table = tableRef.current;

    if (table === null) {
      return;
    }

    const keepBrowserMenu = (event: Event) => {
      const row = rowOf(event.target);

      if (
        row === null || !latest.current.available(targetOf(row)) || !(event.target instanceof Element)
        || keepsBrowserMenu(event.target, row)
      ) {
        event.stopPropagation();
      }
    };

    table.addEventListener('contextmenu', keepBrowserMenu);
    table.addEventListener('touchstart', keepBrowserMenu);

    return () => {
      table.removeEventListener('contextmenu', keepBrowserMenu);
      table.removeEventListener('touchstart', keepBrowserMenu);
    };
  }, []);

  // When it opens (after the right-click or the long press): the row or the group gets ready (see prepare).
  const onOpenChange = (open: boolean, details: { event: Event }) => {
    const row = rowOf(details.event.target);

    if (open && row !== null) {
      latest.current.prepare(targetOf(row));
    }
  };

  // The entries of the menu, or of a submenu (whose children are actions and separators). With icons in the list, every
  // entry gets the icon's place, empty where it has none.
  const entries = (list: readonly ContextMenuItem<Row>[]): ReactNode => {
    const withIcons = hasIcons(list);
    const iconOf = (
      item: ActionItem<Row>,
    ) => (withIcons ? <span className={classes.menuIcon}>{item.icon}</span> : null);

    return list.map((item) => {
      if (item.type === 'separator') {
        return <BaseContextMenu.Separator key={item.key} className={classes.menuSeparator} />;
      }

      if (item.type === 'menu') {
        return (
          <BaseContextMenu.SubmenuRoot key={item.key}>
            <BaseContextMenu.SubmenuTrigger className={classes.menuItem} data-variant={item.variant}>
              {iconOf(item)}
              <span className={classes.menuText}>{textOf(item)}</span>
              <icons.ChevronRight size={14} className={classes.submenuChevron} />
            </BaseContextMenu.SubmenuTrigger>
            <BaseContextMenu.Portal container={layer}>
              <BaseContextMenu.Positioner className={classes.popupPositioner} positionMethod="fixed">
                <BaseContextMenu.Popup className={popupClassOf(item.actions)}>
                  {entries(item.actions)}
                </BaseContextMenu.Popup>
              </BaseContextMenu.Positioner>
            </BaseContextMenu.Portal>
          </BaseContextMenu.SubmenuRoot>
        );
      }

      return (
        <BaseContextMenu.Item
          key={item.key}
          className={classes.menuItem}
          data-variant={item.variant}
          onClick={() => invoke(item)}
        >
          {iconOf(item)}
          <span className={classes.menuText}>{textOf(item)}</span>
        </BaseContextMenu.Item>
      );
    });
  };

  return (
    <BaseContextMenu.Root onOpenChange={onOpenChange}>
      <BaseContextMenu.Trigger ref={tableRef} render={<div role={role} className={className} style={style} />}>
        {children}
      </BaseContextMenu.Trigger>
      <BaseContextMenu.Portal container={layer}>
        <BaseContextMenu.Positioner className={classes.popupPositioner} positionMethod="fixed">
          <BaseContextMenu.Popup className={popupClassOf(items)}>{entries(items)}</BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}
