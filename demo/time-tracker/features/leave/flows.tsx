import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import { addDays, todayDate, vacationBalance, weekStart } from '../../domain';
import type { Decision, Employee, LeaveRequest, TimeData } from '../../domain';
import { errorText } from '../../shared/lib/errorText';
import { formatDateRange } from '../../shared/lib/format';
import { translate } from '../../shared/lib/i18n';
import { DecisionForm } from '../../shared/ui/DecisionForm';
import { useChanged, useTimeService } from '../tracker';
import { useViewer } from '../viewer';
import { LeaveForm } from './components/LeaveForm';

export { useLeaveFlows };

// The changes of leave requests: request (the viewer), cancel (the viewer, their own), decide (a team lead).
function useLeaveFlows() {
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const viewer = useViewer();

  // A new request of the employee; the dates preset (`from`, `to`), else the next week's Monday to Friday.
  const request = async (data: TimeData, employee: Employee, range?: { from: string; to: string }) => {
    const today = todayDate();
    const balance = vacationBalance(employee, data.leave, Number(today.slice(0, 4)), today, data.holidays);
    const monday = addDays(weekStart(today), 7);
    const result = await dialogs.form({
      title: translate('leave.requestTitle'),
      content: (
        <LeaveForm
          balance={balance}
          holidays={data.holidays}
          initial={range ?? { from: monday, to: addDays(monday, 4) }}
          save={async (values) => void (await service.requestLeave({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: translate('leave.send') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('leave.sent'));
    }
  };

  const cancel = async (requests: readonly LeaveRequest[]) => {
    const scope = dialogs.open();

    try {
      const result = await scope.confirm({
        title: translate('leave.cancelTitle', { count: requests.length }),
        content: requests.map((request) => formatDateRange(request.from, request.to)).join('\n'),
        buttons: { confirm: translate('leave.cancelConfirm'), cancel: translate('common.keep') },
      });

      if (result.canceled) {
        return;
      }

      for (const request of requests) {
        await service.cancelLeave(request.id);
      }
    } catch (error) {
      toasts.error(errorText(error));
      return;
    } finally {
      scope.dispose();
      await changed();
    }

    toasts.success(translate('leave.cancelled', { count: requests.length }));
  };

  // One or more pending requests: one dialog, one comment for all.
  const decide = async (requests: readonly LeaveRequest[], decision: Decision, nameOf: (id: string) => string) => {
    const summary = requests
      .map((request) => `${nameOf(request.employeeId)}: ${formatDateRange(request.from, request.to)}`)
      .join('\n');
    const result = await dialogs.form({
      title: translate(decision === 'approved' ? 'decision.approveTitle' : 'decision.rejectTitle', {
        count: requests.length,
      }),
      content: (
        <DecisionForm
          decision={decision}
          summary={summary}
          save={async ({ comment }) => {
            for (const request of requests) {
              await service.decideLeave(request.id, decision, comment, viewer.employeeId);
            }
          }}
        />
      ),
      buttons: { confirm: translate(decision === 'approved' ? 'decision.approve' : 'decision.reject') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate(`decision.done.${decision}`, { count: requests.length }));
    }

    return !result.canceled;
  };

  return { request, cancel, decide };
}
