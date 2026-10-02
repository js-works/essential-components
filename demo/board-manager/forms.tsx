import { Group, Input, NativeSelect, Stack, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useRef } from 'react';
import type { FocusEvent, ReactElement } from 'react';
import { z } from 'zod';
import { defineUseForm } from '../../packages/form-validation/src';
import { countryOptions } from './countries';
import { db, getOrganization, normalizeWebsite, ROLES } from './db';
import type { AgendaItem, AgendaSection, Board, Meeting, MeetingDocument, Organization, Person, Role } from './db';
import { useDialogValidator } from './flows';
import { i18nAdapter } from './i18n';
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
// They are validated by form-validation (`useForm`, a Zod schema per form), not the browser (the dialogs have
// `nativeValidation: false`): the schema gives the rules and the required marks, the errors are shown on the inputs,
// and the dialog asks the form before "OK" (every form registers its validation with its dialog, `useDialogValidator`).
// The labels come from the app's i18next (`labels: '<form>'`, `i18n.ts`; a hook, not a factory: in a dialog the form
// gets its `<form>` only on the first "OK"), the messages from form-validation's catalogs. Mantine's `error` gets the
// message, or `true` (red, without a text) for a field that turned invalid while being edited.
// Selects are native (a Mantine select would open outside the modal dialog). The date and time is Mantine's
// `DateTimePicker`, no native picker: its popup stays in the dialog (no portal, see the theme), and a fixed position
// keeps the dialog's scrolling body from clipping it. A field only some dialogs show (the board of a new meeting, the
// person of a new member) gets a second schema, so it is required only there.
const useForm = defineUseForm({
  i18n: { type: 'hook', useAdapter: () => i18nAdapter },
  useValidator: useDialogValidator,
  props: { label: 'label', error: 'error', invalid: 'error' },
});

// The value of a `DateTimePicker` (`2026-09-15 10:00:00`, also in the form's data) as a `start` of the fake server
// (`2026-09-15T10:00`).
function fromPicker(value: string): string {
  return value.replace(' ', 'T').slice(0, 16);
}

const boardSchema = z.object({ name: z.string().trim().min(1), description: z.string().optional() });

function BoardForm({ board }: { board?: Board }): ReactElement {
  const { field } = useForm(boardSchema, { labels: 'board', initial: board });

  return (
    <Stack gap="sm">
      <TextInput autoComplete="off" {...field.name()} />
      <Textarea autosize minRows={3} {...field.description()} />
    </Stack>
  );
}

// Without a fixed board (a new meeting on the meetings page), the board is chosen first: then the board is a field
// too (a second schema, so it is required only there). The date and time is a `DateTimePicker` (`2026-09-15 10:00:00`).
const meetingSchema = z.object({
  boardId: z.string().optional(),
  title: z.string().trim().min(1),
  start: z.string(),
  location: z.string().optional(),
});
const meetingWithBoardSchema = meetingSchema.extend({ boardId: z.string() });

function MeetingForm({ meeting, boards }: { meeting?: Meeting; boards?: readonly Board[] }): ReactElement {
  const { field } = useForm(boards !== undefined ? meetingWithBoardSchema : meetingSchema, {
    labels: 'meeting',
    initial: meeting !== undefined
      ? { ...meeting, start: `${meeting.start.replace('T', ' ')}:00` }
      : { boardId: boards?.[0]?.id, location: 'Board room, headquarters' },
  });

  return (
    <Stack gap="sm">
      {boards !== undefined && (
        <NativeSelect data={boards.map((board) => ({ value: board.id, label: board.name }))} {...field.boardId()} />
      )}
      <TextInput autoComplete="off" {...field.title()} />
      <DateTimePicker valueFormat="DD.MM.YYYY HH:mm" popoverProps={{ floatingStrategy: 'fixed' }} {...field.start()} />
      <TextInput autoComplete="off" {...field.location()} />
    </Stack>
  );
}

// The presenter is one of the board's members. The section is one of the agenda's, or none: another section moves the
// item to its end (the table moves it by dragging too). Without sections in the agenda, there is no select.
const agendaItemSchema = z.object({
  title: z.string().trim().min(1),
  sectionId: z.string().optional(),
  presenterId: z.string().optional(),
  duration: z.number().min(5).max(240),
  description: z.string().optional(),
});

function AgendaItemForm(
  { item, members, sections }: { item?: AgendaItem; members: readonly Person[]; sections: readonly AgendaSection[] },
): ReactElement {
  const { field } = useForm(agendaItemSchema, {
    labels: 'agendaItem',
    initial: item ?? { presenterId: members[0]?.id, duration: 15 },
  });

  return (
    <Stack gap="sm">
      <TextInput autoComplete="off" {...field.title()} />
      {sections.length > 0 && (
        <NativeSelect
          data={[
            { value: '', label: '(none)' },
            ...sections.map((section) => ({ value: section.id, label: section.title })),
          ]}
          {...field.sectionId()}
        />
      )}
      <NativeSelect
        data={members.map((person) => ({ value: person.id, label: person.name }))}
        {...field.presenterId()}
      />
      <TextInput type="number" step={5} {...field.duration()} />
      <Textarea autosize minRows={3} {...field.description()} />
    </Stack>
  );
}

// Nothing to validate: both fields may stay empty. The minutes are a BlockNote document (`minutes.tsx`), with `@` for
// a member of the board (`members`).
function MinutesForm(
  { item, members }: { item: AgendaItem; members: readonly Person[] },
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
const documentSchema = z.object({ name: z.string().trim().min(1) });

function DocumentForm({ document }: { document: MeetingDocument }): ReactElement {
  const { field } = useForm(documentSchema, { labels: 'document', initial: document });
  const focusedRef = useRef(false);

  return (
    <TextInput
      autoComplete="off"
      {...field.name({
        onFocus: (event: FocusEvent<HTMLInputElement>) => {
          if (!focusedRef.current) {
            focusedRef.current = true;
            const input = event.currentTarget;
            const dot = input.value.lastIndexOf('.');

            input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
          }
        },
      })}
    />
  );
}

// A new person may get an organization preset (`organizationId`, on the page of an organization). The name is
// required, the email required and valid.
const personSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  organizationId: z.string().optional(),
});

function PersonForm(
  { person, organizationId }: { person?: Person; organizationId?: string },
): ReactElement {
  const organizations = [...db.getState().organizations].sort((a, b) => a.name.localeCompare(b.name));
  const { field } = useForm(personSchema, {
    labels: 'person',
    initial: person ?? { organizationId },
  });

  return (
    <Stack gap="sm">
      <TextInput autoComplete="off" {...field.name()} />
      <TextInput type="email" autoComplete="off" {...field.email()} />
      <NativeSelect
        data={[
          { value: '', label: '(none)' },
          ...organizations.map((organization) => ({ value: organization.id, label: organization.name })),
        ]}
        {...field.organizationId()}
      />
    </Stack>
  );
}

// The name is required and unique (ignoring the case); the address and the website are optional. The website may be
// given without `https://` (the fake server adds it).
function organizationSchema(id: string | undefined) {
  return z.object({
    name: z.string().trim().min(1).refine(
      (name) =>
        !db.getState().organizations.some((other) =>
          other.id !== id && other.name.toLowerCase() === name.toLowerCase()
        ),
      'There is already an organization with this name',
    ),
    description: z.string().optional(),
    street: z.string().optional(),
    zipCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional().refine((value) => normalizeWebsite(value ?? '') !== undefined, 'Not a valid URL'),
  });
}

function OrganizationForm({ organization }: { organization?: Organization }): ReactElement {
  const { field } = useForm(organizationSchema(organization?.id), {
    labels: 'organization',
    initial: organization,
  });

  return (
    <Stack gap="sm">
      <TextInput autoComplete="off" {...field.name()} />
      <Textarea autosize minRows={2} {...field.description()} />
      <TextInput autoComplete="off" {...field.street()} />
      <Group gap="sm" align="flex-start" wrap="nowrap">
        <TextInput w="8rem" autoComplete="off" {...field.zipCode()} />
        <TextInput flex={1} autoComplete="off" {...field.city()} />
      </Group>
      <NativeSelect data={[{ value: '', label: '(none)' }, ...countryOptions()]} {...field.country()} />
      <TextInput placeholder="https://www.example.com" autoComplete="off" {...field.website()} />
    </Stack>
  );
}

// A new member (`people`: those who are not on the board yet) or a new role of a member (`role`, no person to choose):
// with people, the person is a field too (a second schema, so it is required only there).
const memberSchema = z.object({ personId: z.string().optional(), role: z.string() });
const memberWithPersonSchema = memberSchema.extend({ personId: z.string() });

function MemberForm({ people, role }: { people?: readonly Person[]; role?: Role }): ReactElement {
  const { field } = useForm(people !== undefined ? memberWithPersonSchema : memberSchema, {
    labels: 'member',
    initial: { personId: people?.[0]?.id, role: role ?? 'Member' },
  });

  return (
    <Stack gap="sm">
      {people !== undefined && (
        <NativeSelect
          data={people.map((person) => ({ value: person.id, label: personLabel(person) }))}
          {...field.personId()}
        />
      )}
      <NativeSelect data={[...ROLES]} {...field.role()} />
    </Stack>
  );
}

// A person with their organization, if any: `Helena Brandt (Brandt Holding)`.
function personLabel(person: Person): string {
  const organization = getOrganization(db.getState(), person.organizationId)?.name;

  return organization === undefined ? person.name : `${person.name} (${organization})`;
}
