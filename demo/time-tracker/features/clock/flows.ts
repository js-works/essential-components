import { useState } from 'react';
import { useToast } from '../../../../packages/overlays/src/main/bindings/react/index.js';
import type { ClockAction } from '../../domain/index.js';
import { errorText } from '../../shared/lib/errorText.js';
import { translate } from '../../shared/lib/i18n/index.js';
import { useChanged, useTimeService } from '../tracker/index.js';
import { useViewer } from '../viewer/index.js';

export { useClock };

// The stamps of the viewer's clock: clock in, a break, back, clock out. Each with a toast; one at a time (`busy`).
function useClock() {
  const service = useTimeService();
  const toasts = useToast();
  const changed = useChanged();
  const { employeeId } = useViewer();
  const [busy, setBusy] = useState<ClockAction>();

  const stamp = async (action: ClockAction) => {
    setBusy(action);

    try {
      await service.clock(employeeId, action);
      await changed();
      toasts.success(translate(`clock.done.${action}`));
    } catch (error) {
      toasts.error(errorText(error));
    } finally {
      setBusy(undefined);
    }
  };

  return { stamp, busy };
}
