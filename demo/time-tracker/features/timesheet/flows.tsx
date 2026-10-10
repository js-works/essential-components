import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import type { Correction, Decision, Employee } from '../../domain';
import { formatDate, formatTime } from '../../shared/lib/format';
import { translate } from '../../shared/lib/i18n';
import { DecisionForm } from '../../shared/ui/DecisionForm';
import { useChanged, useTimeService } from '../tracker';
import { useViewer } from '../viewer';
import { CorrectionForm } from './components/CorrectionForm';

export { useCorrectionFlows };

// The corrections of the clock: request one (a forgotten stretch of a past day), and decide on them (a team lead).
function useCorrectionFlows() {
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const viewer = useViewer();

  const request = async (employee: Employee, date: string) => {
    const result = await dialogs.form({
      title: translate('correction.requestTitle'),
      content: (
        <CorrectionForm
          date={date}
          save={async (values) => void (await service.requestCorrection({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: translate('correction.send') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('correction.sent'));
    }
  };

  // One or more pending corrections: one dialog, one comment for all.
  const decide = async (corrections: readonly Correction[], decision: Decision, nameOf: (id: string) => string) => {
    const summary = corrections
      .map((correction) =>
        `${nameOf(correction.employeeId)}: ${formatDate(correction.date)}, ${formatTime(correction.start)} – ${
          formatTime(correction.end)
        }`
      )
      .join('\n');
    const result = await dialogs.form({
      title: translate(decision === 'approved' ? 'decision.approveTitle' : 'decision.rejectTitle', {
        count: corrections.length,
      }),
      content: (
        <DecisionForm
          decision={decision}
          summary={summary}
          save={async ({ comment }) => {
            for (const correction of corrections) {
              await service.decideCorrection(correction.id, decision, comment, viewer.employeeId);
            }
          }}
        />
      ),
      buttons: { confirm: translate(decision === 'approved' ? 'decision.approve' : 'decision.reject') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate(`decision.done.${decision}`, { count: corrections.length }));
    }

    return !result.canceled;
  };

  return { request, decide };
}
