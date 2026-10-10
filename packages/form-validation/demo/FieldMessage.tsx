import { useLayoutEffect, useRef } from 'react';
import type { ReactElement } from 'react';

export { FieldMessage };

// The message of an invalid field as a popover (the same as the Board Manager's `FieldError` of the root page): in the
// browser's top layer, so no scrolling container cuts it off and nothing covers it. Shown while the field (its
// `.fv-field`) has the focus, placed below the control, aligned at its start, above it when there is no room below (the
// arrow then points down), kept inside the window, following scrolling and resizing. The plain text stays in the field
// (hidden), where `aria-describedby` of the control finds it.
// The room between the control and the popover, in px (2026-10-07: 2, the user's wish; 4 before).
const GAP = 2;
const MARGIN = 8;

function FieldMessage({ id, message }: { id: string; message: string }): ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  const placeRef = useRef<() => void>(undefined);

  useLayoutEffect(() => {
    const popover = ref.current;
    const root = popover?.closest<HTMLElement>('.fv-field');
    const anchor = root?.querySelector<HTMLElement>('input, select');

    if (
      popover === null || popover === undefined || root === null || root === undefined || anchor === null
      || anchor === undefined
    ) {
      return;
    }

    const place = () => {
      if (!popover.matches(':popover-open')) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const { offsetWidth: width, offsetHeight: height } = popover;
      const below = rect.bottom + GAP;
      const above = rect.top - GAP - height;
      const flip = below + height > innerHeight - MARGIN && above >= MARGIN;

      popover.style.top = `${flip ? above : below}px`;
      popover.style.left = `${Math.max(MARGIN, Math.min(rect.left, innerWidth - width - MARGIN))}px`;
      popover.dataset['side'] = flip ? 'top' : 'bottom';
    };

    placeRef.current = place;

    const update = () => {
      const shown = popover.isConnected && root.matches(':focus-within');

      if (shown !== popover.matches(':popover-open')) {
        if (shown) {
          popover.showPopover();
        } else {
          popover.hidePopover();
        }
      }

      place();
    };

    // The focus has moved on only after `focusout`: checked a frame later.
    const later = () => requestAnimationFrame(update);

    update();
    root.addEventListener('focusin', update);
    root.addEventListener('focusout', later);
    addEventListener('scroll', place, { capture: true, passive: true });
    addEventListener('resize', place);

    return () => {
      root.removeEventListener('focusin', update);
      root.removeEventListener('focusout', later);
      removeEventListener('scroll', place, { capture: true });
      removeEventListener('resize', place);

      if (popover.matches(':popover-open')) {
        popover.hidePopover();
      }
    };
  }, []);

  // A new message may have another size.
  useLayoutEffect(() => placeRef.current?.(), [message]);

  return (
    <>
      <span className="fv-error-text" id={id}>{message}</span>
      <span ref={ref} popover="manual" className="fv-error-popover" aria-hidden="true">{message}</span>
    </>
  );
}
