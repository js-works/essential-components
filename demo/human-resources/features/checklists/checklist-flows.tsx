import { useNavigate } from 'react-router';

import { useDialogs, useToast } from '@local/overlays/react';

import type { Checklist, ChecklistKind, ChecklistTask, Employee, HrData } from '../../domain/index.js';
import { todayDate } from '../../domain/index.js';
import { errorText } from '../../shared/lib/error-text.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { employeeOf, useChanged, useHrService } from '../hr/index.js';
import { ChecklistForm, TaskForm } from './components/forms.js';

export {
  useAddTaskFlow,
  useCreateChecklistFlow,
  useDeleteChecklistsFlow,
  useRemoveTaskFlow,
  useSetTaskDoneFlow,
  useStartChecklistFlow,
};

// The flows of the checklists, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New checklist": an employee and a kind, in a form dialog; then a toast, and the checklist's page.
function useCreateChecklistFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();
  const created = async (checklist: Checklist, name: string) => {
    await changed();
    toasts.success(t('checklists.created', { kind: t(`checklistKind.${checklist.kind}`), name }));
    void navigate(`/onboarding/${checklist.id}`);
  };

  return async (data: HrData) => {
    let checklist: Checklist | undefined;
    const result = await dialogs.form({
      title: t('checklists.newTitle'),
      content: (
        <ChecklistForm
          data={data}
          save={async ({ employeeId, kind }) => void (checklist = await service.createChecklist(employeeId, kind))}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled || checklist === undefined) {
      return;
    }

    await created(checklist, employeeOf(data, checklist.employeeId)?.name ?? '');
  };
}

// From an employee's page: at once, from the template.
function useStartChecklistFlow() {
  const t = useTranslate();
  const service = useHrService();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();
  const created = async (checklist: Checklist, name: string) => {
    await changed();
    toasts.success(t('checklists.created', { kind: t(`checklistKind.${checklist.kind}`), name }));
    void navigate(`/onboarding/${checklist.id}`);
  };

  return async (employee: Employee, kind: ChecklistKind) => {
    try {
      await created(await service.createChecklist(employee.id, kind), employee.name);
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };
}

// "Delete" of checklists: a critical confirmation, then a toast.
function useDeleteChecklistsFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (checklists: readonly Checklist[], data: HrData) => {
    const [first] = checklists;
    const result = await dialogs.confirmCritical({
      title: t('checklists.deleteTitle'),
      content: checklists.length === 1 && first !== undefined
        ? t('checklists.deleteOne', {
          kind: t(`checklistKind.${first.kind}`),
          name: employeeOf(data, first.employeeId)?.name ?? '',
        })
        : t('checklists.deleteMany', { count: checklists.length }),
      buttons: { confirm: t('common.delete') },
    });

    if (result.canceled) {
      return false;
    }

    await service.removeChecklists(checklists.map((checklist) => checklist.id));
    await changed();
    toasts.success(t('checklists.deleted', { count: checklists.length }));

    return true;
  };
}

// Ticks tasks off, or on again (an error as a toast).
function useSetTaskDoneFlow() {
  const service = useHrService();
  const toasts = useToast();
  const changed = useChanged();

  return async (checklist: Checklist, tasks: readonly ChecklistTask[], done: boolean) => {
    try {
      await service.setTasksDone(checklist.id, tasks.map((task) => task.id), done);
      await changed();
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };
}

// "Add task" to a checklist, in a form dialog, then a toast.
function useAddTaskFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (checklist: Checklist) => {
    const result = await dialogs.form({
      title: t('checklists.addTaskTitle'),
      content: <TaskForm due={todayDate()} save={(values) => service.addTask(checklist.id, values)} />,
      buttons: { confirm: t('common.add') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('checklists.taskAdded'));
  };
}

// "Remove" of a task from a checklist: a critical confirmation.
function useRemoveTaskFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const changed = useChanged();

  return async (checklist: Checklist, task: ChecklistTask, title: string) => {
    const result = await dialogs.confirmCritical({
      title: t('checklists.removeTaskTitle'),
      content: t('checklists.removeTaskText', { title }),
      buttons: { confirm: t('common.delete') },
    });

    if (result.canceled) {
      return;
    }

    await service.removeTask(checklist.id, task.id);
    await changed();
  };
}
