import { useDialogs, useToast } from '@local/overlays/react';
import type { Correction, Decision, Employee } from '../../domain/index.js';
import { formatDate, formatTime } from '../../shared/lib/format.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { DecisionForm } from '../../shared/ui/decision-form.js';
import { useChanged, useTimeService } from '../tracker/index.js';
import { useViewer } from '../viewer/index.js';
import { CorrectionForm } from './components/correction-form.js';

export { useDecideCorrectionsFlow, useRequestCorrectionFlow };

// The flows of corrections of the timesheet, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "Request correction": a forgotten stretch of work of a past day, in a form dialog, then a toast.
function useRequestCorrectionFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (employee: Employee, date: string) => {
    const result = await dialogs.form({
      title: t('correction.requestTitle'),
      content: (
        <CorrectionForm
          date={date}
          save={async (values) => void (await service.requestCorrection({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: t('correction.send') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('correction.sent'));
  };
}

// One or more pending corrections: one dialog, one comment for all.
function useDecideCorrectionsFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const viewer = useViewer();

  return async (corrections: readonly Correction[], decision: Decision, nameOf: (id: string) => string) => {
    const summary = corrections
      .map((correction) =>
        `${nameOf(correction.employeeId)}: ${formatDate(correction.date)}, ${formatTime(correction.start)} – ${
          formatTime(correction.end)
        }`
      )
      .join('\n');
    const result = await dialogs.form({
      title: t(decision === 'approved' ? 'decision.approveTitle' : 'decision.rejectTitle', {
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
      buttons: { confirm: t(decision === 'approved' ? 'decision.approve' : 'decision.reject') },
    });

    if (result.canceled) {
      return false;
    }

    await changed();
    toasts.success(t(`decision.done.${decision}`, { count: corrections.length }));

    return true;
  };
}
