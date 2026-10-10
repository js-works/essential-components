import { SimpleGrid, Stack, TextInput } from '@mantine/core';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { departmentPath, descendantIds, statusOf, todayDate } from '../../../domain';
import type { Department, HrData } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';
import { FormSelect } from '../../../shared/ui/FormSelect';

export { DepartmentForm, departmentSchema };

// A department: its name (required), the one above it (or none: a top one; not itself or one below it, the server says
// so too), its head (or none yet), its cost center.
const departmentSchema = z.object({
  name: z.string().trim().min(1),
  parentId: z.string().optional().transform((value) => value ?? null),
  headId: z.string().optional().transform((value) => value ?? null),
  costCenter: z.string().trim().default(''),
});

function DepartmentForm({ data, department, parentId, save }: {
  data: HrData;
  department?: Department;
  parentId?: string;
  save: (values: z.output<typeof departmentSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const excluded = department === undefined ? [] : descendantIds(data.departments, department.id);
  const parents = data.departments
    .filter((candidate) => !excluded.includes(candidate.id))
    .map((candidate) => ({ value: candidate.id, label: departmentPath(data.departments, candidate.id).join(' › ') }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const heads = data.employees
    .filter((employee) => statusOf(employee, today) !== 'former')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((employee) => ({ value: employee.id, label: `${employee.name} (${employee.title})` }));
  const { DialogForm, field } = useForm(departmentSchema, {
    labels: 'departmentForm',
    initial: department === undefined
      ? { parentId }
      : { ...department, parentId: department.parentId ?? undefined, headId: department.headId ?? undefined },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput autoComplete="off" data-autofocus {...field.name()} />
        <FormSelect data={parents} clearable placeholder={t('departments.topLevel')} {...field.parentId()} />
        <SimpleGrid cols={2} spacing="sm">
          <FormSelect data={heads} clearable placeholder={t('common.none')} {...field.headId()} />
          <TextInput autoComplete="off" {...field.costCenter()} />
        </SimpleGrid>
      </Stack>
    </DialogForm>
  );
}
