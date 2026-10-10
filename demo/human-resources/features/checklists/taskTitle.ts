import type { ChecklistTask } from '../../domain';
import { translateKey } from '../../shared/lib/i18n';
import type { Translate } from '../../shared/lib/i18n';

export { taskTitle };

// The title of a task: a text of the app for a task of the template (`task.<key>`, in the page's language), else its
// own. `t` only makes the caller render again with the language.
function taskTitle(_t: Translate, task: ChecklistTask): string {
  return task.template === null ? task.title : translateKey(`task.${task.template}`);
}
