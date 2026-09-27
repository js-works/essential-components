import type { ReactElement } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import { variantOf } from '../actions';
import type { ActionItem } from '../actions';
import { ActionButton, ActionMenu } from './widgets';
import type { ButtonPlacement, MenuEntry } from './widgets';

export { ActionList };

type ActionListProps<Row> = {
  items: readonly ActionItem<Row>[];
  placement: ButtonPlacement;
  invoke: (action: Spec.Action<Row>) => void;
};

// Renders the visible actions and menus. Which ones are visible is decided in `actions.ts`. The row of a menu entry is
// bound here, so the widgets never see a row.
function ActionList<Row>({ items, placement, invoke }: ActionListProps<Row>): ReactElement {
  return (
    <>
      {items.map((item) => {
        const variant = variantOf(item);

        if (item.type !== 'menu') {
          return (
            <ActionButton
              key={item.key}
              look={item}
              variant={variant}
              placement={placement}
              onClick={() => invoke(item)}
            />
          );
        }

        const entries = item.actions.map((action): MenuEntry =>
          action.type === 'separator'
            ? { type: 'separator', key: action.key }
            : {
              type: 'action',
              key: action.key,
              label: action.label ?? action.tip,
              icon: action.icon,
              variant: variantOf(action),
              onClick: () => invoke(action),
            }
        );

        return <ActionMenu key={item.key} look={item} variant={variant} placement={placement} entries={entries} />;
      })}
    </>
  );
}
