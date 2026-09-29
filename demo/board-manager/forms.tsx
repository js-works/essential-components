import { NativeSelect, Stack, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { isEmail, isInRange, isNotEmpty, useForm } from '@mantine/form';
import type { UseFormReturnType } from '@mantine/form';
import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { ROLES } from './db';
import type { AgendaItem, Board, Meeting, Person, Role } from './db';
import type { FormCheck } from './flows';

export { AgendaItemForm, BoardForm, fromPicker, MeetingForm, MemberForm, MinutesForm, PersonForm };

// The contents of the form dialogs: Mantine inputs with a `name`, so the dialog's form collects them (`attempt.data`).
// Mantine validates them (`useForm`, uncontrolled, with its rules), not the browser (the dialogs have
// `nativeValidation: false`): the errors are shown on the inputs, and the dialog asks the form before "OK"
// (`useCheck`). Selects are native (a Mantine select would open outside the modal dialog). The date and time is
// Mantine's `DateTimePicker`, no native picker: its popup stays in the dialog (no portal, see the theme), and a fixed
// position keeps the dialog's scrolling body from clipping it.

const REQUIRED = 'Required';

// The value of a `DateTimePicker` (`2026-09-15 10:00:00`, also in the form's data) as a `start` of the fake server
// (`2026-09-15T10:00`).
function fromPicker(value: string): string {
  return value.replace(' ', 'T').slice(0, 16);
}

// Registers the form's validation as the check of the dialog.
function useCheck(check: FormCheck, form: UseFormReturnType<any>): void {
  useEffect(() => check.set(() => !form.validate().hasErrors), [check, form]);
}

function BoardForm({ check, board }: { check: FormCheck; board?: Board }): ReactElement {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: board?.name ?? '', description: board?.description ?? '' },
    validate: { name: isNotEmpty(REQUIRED) },
  });

  useCheck(check, form);

  return (
    <Stack gap="sm">
      <TextInput
        label="Name"
        withAsterisk
        autoComplete="off"
        key={form.key('name')}
        {...form.getInputProps('name')}
        name="name"
      />
      <Textarea
        label="Description"
        autosize
        minRows={3}
        key={form.key('description')}
        {...form.getInputProps('description')}
        name="description"
      />
    </Stack>
  );
}

// Without a fixed board (a new meeting on the meetings page), the board is chosen first.
function MeetingForm(
  { check, meeting, boards }: { check: FormCheck; meeting?: Meeting; boards?: readonly Board[] },
): ReactElement {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      boardId: boards?.[0]?.id ?? '',
      title: meeting?.title ?? '',
      start: meeting !== undefined ? `${meeting.start.replace('T', ' ')}:00` : null,
      location: meeting?.location ?? 'Board room, headquarters',
    },
    validate: {
      boardId: boards !== undefined ? isNotEmpty(REQUIRED) : undefined,
      title: isNotEmpty(REQUIRED),
      start: isNotEmpty(REQUIRED),
    },
  });

  useCheck(check, form);

  return (
    <Stack gap="sm">
      {boards !== undefined && (
        <NativeSelect
          label="Board"
          withAsterisk
          data={boards.map((board) => ({ value: board.id, label: board.name }))}
          key={form.key('boardId')}
          {...form.getInputProps('boardId')}
          name="boardId"
        />
      )}
      <TextInput
        label="Title"
        withAsterisk
        autoComplete="off"
        key={form.key('title')}
        {...form.getInputProps('title')}
        name="title"
      />
      <DateTimePicker
        label="Date and time"
        withAsterisk
        valueFormat="DD.MM.YYYY HH:mm"
        popoverProps={{ floatingStrategy: 'fixed' }}
        key={form.key('start')}
        {...form.getInputProps('start')}
        name="start"
      />
      <TextInput
        label="Location"
        autoComplete="off"
        key={form.key('location')}
        {...form.getInputProps('location')}
        name="location"
      />
    </Stack>
  );
}

// The presenter is one of the board's members.
function AgendaItemForm(
  { check, item, members }: { check: FormCheck; item?: AgendaItem; members: readonly Person[] },
): ReactElement {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: item?.title ?? '',
      presenterId: item?.presenterId ?? members[0]?.id ?? '',
      duration: String(item?.duration ?? 15),
      description: item?.description ?? '',
    },
    validate: {
      title: isNotEmpty(REQUIRED),
      duration: (value) =>
        value.trim() === '' ? REQUIRED : isInRange({ min: 5, max: 240 }, 'From 5 to 240 minutes')(Number(value)),
    },
  });

  useCheck(check, form);

  return (
    <Stack gap="sm">
      <TextInput
        label="Title"
        withAsterisk
        autoComplete="off"
        key={form.key('title')}
        {...form.getInputProps('title')}
        name="title"
      />
      <NativeSelect
        label="Presenter"
        data={members.map((person) => ({ value: person.id, label: person.name }))}
        key={form.key('presenterId')}
        {...form.getInputProps('presenterId')}
        name="presenterId"
      />
      <TextInput
        label="Duration (minutes)"
        type="number"
        min={5}
        max={240}
        step={5}
        withAsterisk
        key={form.key('duration')}
        {...form.getInputProps('duration')}
        name="duration"
      />
      <Textarea
        label="Description"
        autosize
        minRows={3}
        key={form.key('description')}
        {...form.getInputProps('description')}
        name="description"
      />
    </Stack>
  );
}

// Nothing to validate: both fields may stay empty.
function MinutesForm({ item }: { check: FormCheck; item: AgendaItem }): ReactElement {
  return (
    <Stack gap="sm">
      <Textarea
        name="minutes"
        label="Minutes"
        description="What was presented and discussed."
        autosize
        minRows={8}
        defaultValue={item.minutes}
      />
      <Textarea
        name="decision"
        label="Decision"
        description="Leave it empty if nothing was decided."
        autosize
        minRows={3}
        defaultValue={item.decision}
      />
    </Stack>
  );
}

function PersonForm({ check, person }: { check: FormCheck; person?: Person }): ReactElement {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: person?.name ?? '',
      email: person?.email ?? '',
      organization: person?.organization ?? '',
    },
    validate: {
      name: isNotEmpty(REQUIRED),
      email: (value) => value.trim() === '' ? REQUIRED : isEmail('Not a valid email address')(value),
    },
  });

  useCheck(check, form);

  return (
    <Stack gap="sm">
      <TextInput
        label="Name"
        withAsterisk
        autoComplete="off"
        key={form.key('name')}
        {...form.getInputProps('name')}
        name="name"
      />
      <TextInput
        label="Email"
        type="email"
        withAsterisk
        autoComplete="off"
        key={form.key('email')}
        {...form.getInputProps('email')}
        name="email"
      />
      <TextInput
        label="Organization"
        autoComplete="off"
        key={form.key('organization')}
        {...form.getInputProps('organization')}
        name="organization"
      />
    </Stack>
  );
}

// A new member (`people`: those who are not on the board yet) or a new role of a member (`role`, no person to choose).
function MemberForm(
  { check, people, role }: { check: FormCheck; people?: readonly Person[]; role?: Role },
): ReactElement {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { personId: people?.[0]?.id ?? '', role: role ?? 'Member' },
    validate: { personId: people !== undefined ? isNotEmpty(REQUIRED) : undefined },
  });

  useCheck(check, form);

  return (
    <Stack gap="sm">
      {people !== undefined && (
        <NativeSelect
          label="Person"
          withAsterisk
          data={people.map((person) => ({ value: person.id, label: `${person.name} (${person.organization})` }))}
          key={form.key('personId')}
          {...form.getInputProps('personId')}
          name="personId"
        />
      )}
      <NativeSelect
        label="Role"
        data={[...ROLES]}
        key={form.key('role')}
        {...form.getInputProps('role')}
        name="role"
      />
    </Stack>
  );
}
