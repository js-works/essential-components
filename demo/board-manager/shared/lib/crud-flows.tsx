import type { ReactElement } from 'react';

import { useFlowKit } from './flows.js';
import { translateKey } from './i18n/index.js';

export type { CrudFlows };
export { useCrudFlows };

type CrudFlowConfig<R extends { id: string }, V, C> = {
  // The prefix of the record's texts: `<texts>.new`, `.created`, `.editTitle`, `.saved` (`{{name}}`), `.deleteTitle`
  // (`{{count}}`), `.deleted` (`{{count}}`, `{{name}}`).
  texts: string;
  // The record's form (`record` to edit, none for a new one); it saves itself before the dialog closes.
  form: (props: { record?: R; save: (values: V) => Promise<void> }) => ReactElement;
  create: (values: V) => Promise<C>;
  update: (id: string, values: V) => Promise<unknown>;
  remove: (ids: readonly string[]) => Promise<unknown>;
  // The question of the delete confirmation, with what goes with the records.
  deleteContent: (records: readonly R[]) => string;
  // After "New", with what `create` gave: e.g. the new record's page.
  created?: (result: C) => void;
} & (R extends { name: string } ? { nameOf?: (record: R) => string } : { nameOf: (record: R) => string });

type CrudFlows<R> = {
  create: () => Promise<void>;
  edit: (record: R) => Promise<boolean>;
  remove: (records: readonly R[]) => Promise<boolean>;
};

// The three flows of a record: "New" and "Edit" (its form in a dialog, saved before it closes, then a toast) and
// "Delete" (a critical confirmation, then a toast). `edit` and `remove` resolve `true` when done. A record's name (in
// the toasts) is its `name`, else `nameOf`'s.
function useCrudFlows<R extends { id: string }, V, C = unknown>(config: CrudFlowConfig<R, V, C>): CrudFlows<R> {
  const { formFlow, confirmFlow, t } = useFlowKit();
  const { texts, form } = config;
  const text = (key: string, params?: object) => translateKey(`${texts}.${key}`, params);
  const nameOf = (record: R) => config.nameOf?.(record) ?? String((record as { name?: unknown }).name ?? '');

  return {
    create: async () => {
      let result: { value: C } | undefined;
      const done = await formFlow({
        title: text('new'),
        content: form({ save: async (values) => void (result = { value: await config.create(values) }) }),
        buttons: { confirm: t('common.create') },
        success: text('created'),
      });

      if (done && result !== undefined) {
        config.created?.(result.value);
      }
    },
    edit: (record) => {
      let saved = record;

      return formFlow({
        title: text('editTitle'),
        content: form({
          record,
          save: async (values) => {
            await config.update(record.id, values);
            saved = { ...record, ...values };
          },
        }),
        buttons: { confirm: t('common.save') },
        success: () => text('saved', { name: nameOf(saved).trim() }),
      });
    },
    remove: (records) => {
      const count = records.length;
      const name = records[0] === undefined ? '' : nameOf(records[0]);

      return confirmFlow({
        critical: true,
        title: text('deleteTitle', { count }),
        content: config.deleteContent(records),
        buttons: { confirm: t('common.delete') },
        run: () => config.remove(records.map((record) => record.id)),
        success: text('deleted', { count, name }),
      });
    },
  };
}
