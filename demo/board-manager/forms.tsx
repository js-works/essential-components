import { Group, Input, NativeSelect, Stack, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { isEmail, isInRange, isNotEmpty, useForm } from '@mantine/form';
import type { UseFormReturnType } from '@mantine/form';
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { countryOptions } from './countries';
import { db, getOrganization, normalizeWebsite, ROLES } from './db';
import type { AgendaItem, AgendaSection, Board, Meeting, MeetingDocument, Organization, Person, Role } from './db';
import type { FormCheck } from './flows';
import { MinutesEditor } from './minutes';

export {
  AgendaItemForm,
  BoardForm,
  DocumentForm,
  fromPicker,
  MeetingForm,
  MemberForm,
  MinutesForm,
  OrganizationForm,
  PersonForm,
};

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

// The presenter is one of the board's members. The section is one of the agenda's, or none: another section moves the
// item to its end (the table moves it by dragging too). Without sections in the agenda, there is no select.
function AgendaItemForm(
  { check, item, members, sections }: {
    check: FormCheck;
    item?: AgendaItem;
    members: readonly Person[];
    sections: readonly AgendaSection[];
  },
): ReactElement {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: item?.title ?? '',
      sectionId: item?.sectionId ?? '',
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
      {sections.length > 0 && (
        <NativeSelect
          label="Section"
          data={[
            { value: '', label: '(none)' },
            ...sections.map((section) => ({ value: section.id, label: section.title })),
          ]}
          key={form.key('sectionId')}
          {...form.getInputProps('sectionId')}
          name="sectionId"
        />
      )}
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

// Nothing to validate: both fields may stay empty. The minutes are a BlockNote document (`minutes.tsx`), with `@` for
// a member of the board (`members`).
function MinutesForm(
  { item, members }: { check: FormCheck; item: AgendaItem; members: readonly Person[] },
): ReactElement {
  return (
    <Stack gap="sm" className="board-manager__minutes-form">
      <Input.Wrapper label="Minutes" description="What was presented and discussed. Type @ to mention a member.">
        <MinutesEditor name="minutes" minutes={item.minutes} people={members} />
      </Input.Wrapper>
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

// The name of a document. When the field first gets the focus (the dialog focuses it), only the name without the
// extension is selected, like in a file manager: typing replaces the name and keeps the type.
function DocumentForm({ check, document }: { check: FormCheck; document: MeetingDocument }): ReactElement {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: document.name },
    validate: { name: isNotEmpty(REQUIRED) },
  });
  const focusedRef = useRef(false);

  useCheck(check, form);

  return (
    <TextInput
      label="Name"
      withAsterisk
      autoComplete="off"
      key={form.key('name')}
      {...form.getInputProps('name')}
      name="name"
      onFocus={(event) => {
        if (!focusedRef.current) {
          focusedRef.current = true;
          const input = event.currentTarget;
          const dot = input.value.lastIndexOf('.');

          input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
        }
      }}
    />
  );
}

// A new person may get an organization preset (`organizationId`, on the page of an organization).
function PersonForm(
  { check, person, organizationId }: { check: FormCheck; person?: Person; organizationId?: string },
): ReactElement {
  const organizations = [...db.getState().organizations].sort((a, b) => a.name.localeCompare(b.name));
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: person?.name ?? '',
      email: person?.email ?? '',
      organizationId: person?.organizationId ?? organizationId ?? '',
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
      <NativeSelect
        label="Organization"
        data={[
          { value: '', label: '(none)' },
          ...organizations.map((organization) => ({ value: organization.id, label: organization.name })),
        ]}
        key={form.key('organizationId')}
        {...form.getInputProps('organizationId')}
        name="organizationId"
      />
    </Stack>
  );
}

// The name is required and unique (ignoring the case); the address and the website are optional. The website may be
// given without `https://` (the fake server adds it).
function OrganizationForm({ check, organization }: { check: FormCheck; organization?: Organization }): ReactElement {
  const others = db.getState().organizations.filter((other) => other.id !== organization?.id);
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: organization?.name ?? '',
      description: organization?.description ?? '',
      street: organization?.street ?? '',
      zipCode: organization?.zipCode ?? '',
      city: organization?.city ?? '',
      country: organization?.country ?? '',
      website: organization?.website ?? '',
    },
    validate: {
      name: (value) =>
        value.trim() === ''
          ? REQUIRED
          : others.some((other) => other.name.toLowerCase() === value.trim().toLowerCase())
          ? 'There is already an organization with this name'
          : null,
      website: (value) => (normalizeWebsite(value) === undefined ? 'Not a valid URL' : null),
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
      <Textarea
        label="Description"
        autosize
        minRows={2}
        key={form.key('description')}
        {...form.getInputProps('description')}
        name="description"
      />
      <TextInput
        label="Street"
        autoComplete="off"
        key={form.key('street')}
        {...form.getInputProps('street')}
        name="street"
      />
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <TextInput
          label="ZIP code"
          w="8rem"
          autoComplete="off"
          key={form.key('zipCode')}
          {...form.getInputProps('zipCode')}
          name="zipCode"
        />
        <TextInput
          label="City"
          flex={1}
          autoComplete="off"
          key={form.key('city')}
          {...form.getInputProps('city')}
          name="city"
        />
      </Group>
      <NativeSelect
        label="Country"
        data={[{ value: '', label: '(none)' }, ...countryOptions()]}
        key={form.key('country')}
        {...form.getInputProps('country')}
        name="country"
      />
      <TextInput
        label="Website"
        placeholder="https://www.example.com"
        autoComplete="off"
        key={form.key('website')}
        {...form.getInputProps('website')}
        name="website"
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
          data={people.map((person) => ({ value: person.id, label: personLabel(person) }))}
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

// A person with their organization, if any: `Helena Brandt (Brandt Holding)`.
function personLabel(person: Person): string {
  const organization = getOrganization(db.getState(), person.organizationId)?.name;

  return organization === undefined ? person.name : `${person.name} (${organization})`;
}
