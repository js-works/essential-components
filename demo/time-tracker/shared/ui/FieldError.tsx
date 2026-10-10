import { useLayoutEffect, useRef } from 'react';
import type { ReactElement } from 'react';

export { FieldError };

// The message of an invalid field as a popover (2026-10-06, the user's wish): in the browser's top layer, so no
// scrolling body of a dialog cuts it off and nothing covers it. Rendered as Mantine's `error` of the field (`useForm`
// gives it), inside Mantine's error element, which keeps its id for the input's `aria-describedby` and has no box of its
// own here (`time-tracker.css`). Shown while the field has the focus (at most one on screen) and no date picker's
// calendar of it is open; placed below the field, aligned at its start, above it when there is no room below (the arrow
// then points down), kept inside the window, following scrolling and resizing.
//
// Outside a Mantine field (the doctor's note upload, which shows its error itself, in a slot of its own) there is
// nothing to anchor to: the message is plain text there, and the popover stays closed.

// The room between the field and the popover, in px (2026-10-07: 2, the user's wish; 4 before).
const GAP = 2;
const MARGIN = 8;

function FieldError({ message }: { message: string }): ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  const placeRef = useRef<() => void>(undefined);

  useLayoutEffect(() => {
    const popover = ref.current;
    const root = popover?.closest<HTMLElement>('.mantine-InputWrapper-root');

    if (popover === null || popover === undefined || root === null || root === undefined) {
      return;
    }

    const anchor = root.querySelector<HTMLElement>('.mantine-Input-wrapper') ?? root;

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
      popover.dataset.side = flip ? 'top' : 'bottom';
    };

    placeRef.current = place;

    const update = () => {
      const shown = popover.isConnected && root.matches(':focus-within')
        && root.querySelector('[data-dates-dropdown]') === null;

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
    // A date picker's calendar comes and goes inside the field's wrapper (no portal).
    const observer = new MutationObserver(update);

    update();
    root.addEventListener('focusin', update);
    root.addEventListener('focusout', later);
    observer.observe(root, { childList: true, subtree: true });
    addEventListener('scroll', place, { capture: true, passive: true });
    addEventListener('resize', place);

    return () => {
      root.removeEventListener('focusin', update);
      root.removeEventListener('focusout', later);
      observer.disconnect();
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
      <span className="time-tracker__field-error-text">{message}</span>
      {/* A span: Mantine's error element is a `<p>`, which may hold no `<div>` (the top layer makes it a block). */}
      <span ref={ref} popover="manual" className="time-tracker__field-error">{message}</span>
    </>
  );
}
