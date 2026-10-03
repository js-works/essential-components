import { Tooltip } from '@base-ui/react/tooltip';
import type { ReactElement } from 'react';

export { WithTooltip };

// A tooltip next to a button (to its right by default), e.g. where only its icon shows (the rail, the footer). Without
// `enabled`, the button alone.
function WithTooltip({ label, enabled = true, side = 'right', portal, children }: {
  label: string;
  enabled?: boolean;
  side?: 'right' | 'top' | 'bottom';
  portal: HTMLElement;
  children: ReactElement;
}): ReactElement {
  if (!enabled) {
    return children;
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal container={portal}>
        <Tooltip.Positioner side={side} sideOffset={side === 'right' ? 10 : 8}>
          <Tooltip.Popup className="tooltip" data-side={side}>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
