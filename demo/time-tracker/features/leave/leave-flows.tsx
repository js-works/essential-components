import { useDialogs, useToast } from '@local/overlays/react';

import type { Decision, Employee, LeaveRequest, TimeData } from '../../domain/index.js';
import { addDays, todayDate, vacationBalance, weekStart } from '../../domain/index.js';
import { errorText } from '../../shared/lib/error-text.js';
import { formatDateRange } from '../../shared/lib/format.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { DecisionForm } from '../../shared/ui/decision-form.js';
import { useChanged, useTimeService } from '../tracker/index.js';
import { useViewer } from '../viewer/index.js';
import { LeaveForm } from './components/leave-form.js';

export { useCancelLeaveFlow, useDecideLeaveFlow, useRequestLeaveFlow };

// The flows of leave requests, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// A new request of the employee; the dates preset (`from`, `to`), else the next week's Monday to Friday.
function useRequestLeaveFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (data: TimeData, employee: Employee, range?: { from: string; to: string }) => {
    const today = todayDate();
    const balance = vacationBalance(employee, data.leave, Number(today.slice(0, 4)), today, data.holidays);
    const monday = addDays(weekStart(today), 7);
    const result = await dialogs.form({
      title: t('leave.requestTitle'),
      content: (
        <LeaveForm
          balance={balance}
          holidays={data.holidays}
          initial={range ?? { from: monday, to: addDays(monday, 4) }}
          save={async (values) => void (await service.requestLeave({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: t('leave.send') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('leave.sent'));
  };
}

// "Cancel" of the employee's own requests: a confirmation, then a toast.
function useCancelLeaveFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (requests: readonly LeaveRequest[]) => {
    using scope = dialogs.open();
    const result = await scope.confirm({
      title: t('leave.cancelTitle', { count: requests.length }),
      content: requests.map((request) => formatDateRange(request.from, request.to)).join('\n'),
      buttons: { confirm: t('leave.cancelConfirm'), cancel: t('common.keep') },
    });

    if (result.canceled) {
      return;
    }

    try {
      for (const request of requests) {
        await service.cancelLeave(request.id);
      }
    } catch (error) {
      toasts.error(errorText(error));
      return;
    } finally {
      await changed();
    }

    toasts.success(t('leave.cancelled', { count: requests.length }));
  };
}

// One or more pending requests: one dialog, one comment for all.
function useDecideLeaveFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const viewer = useViewer();

  return async (requests: readonly LeaveRequest[], decision: Decision, nameOf: (id: string) => string) => {
    const summary = requests
      .map((request) => `${nameOf(request.employeeId)}: ${formatDateRange(request.from, request.to)}`)
      .join('\n');
    const result = await dialogs.form({
      title: t(decision === 'approved' ? 'decision.approveTitle' : 'decision.rejectTitle', {
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
      buttons: { confirm: t(decision === 'approved' ? 'decision.approve' : 'decision.reject') },
    });

    if (result.canceled) {
      return false;
    }

    await changed();
    toasts.success(t(`decision.done.${decision}`, { count: requests.length }));

    return true;
  };
}
