import type * as Spec from '../../api/react/index.js';
import { variantOf } from '../actions.js';
import type { ActionItem } from '../actions.js';
import { ActionButton, ActionMenu } from './widgets.js';
import type { ButtonPlacement, MenuEntry } from './widgets.js';

export { ActionList };

type ActionListProps<Row> = {
  items: readonly ActionItem<Row>[];
  placement: ButtonPlacement;
  // What the action column (the placement `row`) shows of an action. Other places show the look as it is.
  rowActionLook?: Spec.RowActionLook;
  invoke: (action: Spec.TableAction<Row>) => void;
};

// The look of an action (or a menu) in this place. In the action column, `rowActionLook` decides: `'icon'` shows only
// the icon, with the label as the tooltip and the accessible name (or the tip, when there is one); `'label'` only the
// label; `'iconAndLabel'` both. An action without a label keeps its look; `'icon'` keeps the label when there is no
// icon, or no text for the name (a label that is not a string, and no tip).
function lookIn(look: Spec.ActionLook, placement: ButtonPlacement, rowActionLook: Spec.RowActionLook): Spec.ActionLook {
  if (placement !== 'row' || look.label === undefined || rowActionLook === 'iconAndLabel') {
    return look;
  }

  if (rowActionLook === 'label') {
    return { label: look.label, tip: look.tip };
  }

  const tip = look.tip ?? (typeof look.label === 'string' ? look.label : undefined);

  return look.icon === undefined || tip === undefined ? look : { icon: look.icon, tip };
}

// Renders the visible actions and menus. Which ones are visible is decided in `actions.ts`. The row of a menu entry is
// bound here, so the widgets never see a row.
function ActionList<Row>(props: ActionListProps<Row>) {
  const { items, placement, rowActionLook = 'icon', invoke } = props;

  return (
    <>
      {items.map((item) => {
        const variant = variantOf(item);
        const look = lookIn(item, placement, rowActionLook);

        if (item.type !== 'menu') {
          return (
            <ActionButton
              key={item.key}
              look={look}
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

        // The chevron (2026-10-11, the user's wish): always with a label; an icon-only menu has it in the toolbar (the bar
        // and the selection bar), not in the action column; `chevron` decides instead (e.g. `false` for a "⋯" menu).
        const chevron = item.chevron ?? (look.label !== undefined || placement === 'toolbar');

        return (
          <ActionMenu
            key={item.key}
            look={look}
            variant={variant}
            placement={placement}
            chevron={chevron}
            entries={entries}
          />
        );
      })}
    </>
  );
}
