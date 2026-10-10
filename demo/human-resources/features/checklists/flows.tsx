import { useNavigate } from 'react-router';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import { todayDate } from '../../domain';
import type { Checklist, ChecklistKind, ChecklistTask, Employee, HrData } from '../../domain';
import { errorText } from '../../shared/lib/errorText';
import { translate } from '../../shared/lib/i18n';
import { employeeOf, useChanged, useHrService } from '../hr';
import { ChecklistForm, TaskForm } from './components/forms';

export { useChecklistFlows };

// The changes of checklists: a new one (chosen, or started from an employee's page; then its page), delete, tick off
// tasks, add and remove a task.
function useChecklistFlows() {
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  const created = async (checklist: Checklist, name: string) => {
    await changed();
    toasts.success(translate('checklists.created', { kind: translate(`checklistKind.${checklist.kind}`), name }));
    void navigate(`/onboarding/${checklist.id}`);
  };

  const create = async (data: HrData) => {
    let checklist: Checklist | undefined;
    const result = await dialogs.form({
      title: translate('checklists.newTitle'),
      content: (
        <ChecklistForm
          data={data}
          save={async ({ employeeId, kind }) => void (checklist = await service.createChecklist(employeeId, kind))}
        />
      ),
      buttons: { confirm: translate('common.create') },
    });

    if (!result.canceled && checklist !== undefined) {
      await created(checklist, employeeOf(data, checklist.employeeId)?.name ?? '');
    }
  };

  // From an employee's page: at once, from the template.
  const start = async (employee: Employee, kind: ChecklistKind) => {
    try {
      await created(await service.createChecklist(employee.id, kind), employee.name);
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };

  const remove = async (checklists: readonly Checklist[], data: HrData) => {
    const [first] = checklists;
    const result = await dialogs.confirmCritical({
      title: translate('checklists.deleteTitle'),
      content: checklists.length === 1 && first !== undefined
        ? translate('checklists.deleteOne', {
          kind: translate(`checklistKind.${first.kind}`),
          name: employeeOf(data, first.employeeId)?.name ?? '',
        })
        : translate('checklists.deleteMany', { count: checklists.length }),
      buttons: { confirm: translate('common.delete') },
    });

    if (result.canceled) {
      return false;
    }

    await service.removeChecklists(checklists.map((checklist) => checklist.id));
    await changed();
    toasts.success(translate('checklists.deleted', { count: checklists.length }));

    return true;
  };

  const setDone = async (checklist: Checklist, tasks: readonly ChecklistTask[], done: boolean) => {
    try {
      await service.setTasksDone(checklist.id, tasks.map((task) => task.id), done);
      await changed();
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };

  const addTask = async (checklist: Checklist) => {
    const result = await dialogs.form({
      title: translate('checklists.addTaskTitle'),
      content: <TaskForm due={todayDate()} save={(values) => service.addTask(checklist.id, values)} />,
      buttons: { confirm: translate('common.add') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('checklists.taskAdded'));
    }
  };

  const removeTask = async (checklist: Checklist, task: ChecklistTask, title: string) => {
    const result = await dialogs.confirmCritical({
      title: translate('checklists.removeTaskTitle'),
      content: translate('checklists.removeTaskText', { title }),
      buttons: { confirm: translate('common.delete') },
    });

    if (!result.canceled) {
      await service.removeTask(checklist.id, task.id);
      await changed();
    }
  };

  return { create, start, remove, setDone, addTask, removeTask };
}
