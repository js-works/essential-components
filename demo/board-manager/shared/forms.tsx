import { Group, NativeSelect, Stack, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useRef } from 'react';
import type { FocusEvent, ReactElement } from 'react';
import { z } from 'zod';
import { normalizeWebsite, ROLES } from '../domain';
import type { AgendaItem, AgendaSection, Board, Meeting, MeetingDocument, Organization, Person, Role } from '../domain';
import { MinutesEditor } from '../features/meetings/components/minutes';
import { db, suggestPeople } from '../infra/in-memory';
import { countryOptions } from './lib/countries';
import { useForm } from './lib/useForm';
import { AsyncSelect } from './ui/AsyncSelect';

export { AgendaItemForm, BoardForm, DocumentForm, MeetingForm, MemberForm, MinutesForm, OrganizationForm, PersonForm };

// The contents of the form dialogs (`dialogs.form`), validated by form-validation (`useForm`, a Zod schema per form),
// not by the browser. Each form is the dialog's form (`DialogForm` of `useForm.tsx`: the overlays' `<Form>`): "OK" runs
// `requestSubmit`, which validates, shows the errors on the inputs and calls `save` (a prop) with the schema's typed
// output; the dialog closes when it is saved, and shows a failed save as its note (the server's message,
// `errorMessage`). The schema gives the rules and the required marks; optional strings default to `''`, so the output
// fits the fake server's values.
// The labels come from the app's i18next (`labels: '<form>'`, `i18n.ts`; a hook: in a dialog there is no `<form>` of
// the form's own for a factory), the messages from form-validation's catalogs. Mantine's `error` gets the message, or
// `true` (red, without a text) for a field that turned invalid while being edited.
// Selects are native (a Mantine select would open outside the modal dialog), except the person of a new member: an
// `AsyncSelect` (`AsyncSelect.tsx`), its popup in the dialog like the date picker's. The date and time is Mantine's
// `DateTimePicker`, no native picker: its popup stays in the dialog (no portal, see the theme), and a fixed position
// keeps the dialog's scrolling body from clipping it. A field only some dialogs show (the board of a new meeting, the
// person of a new member) gets a second schema, so it is required only there.

type Save<S extends z.ZodType> = (values: z.output<S>) => Promise<void>;

const boardSchema = z.object({ name: z.string().trim().min(1), description: z.string().default('') });

function BoardForm({ board, save }: { board?: Board; save: Save<typeof boardSchema> }): ReactElement {
  const { DialogForm, field } = useForm(boardSchema, { labels: 'board', initial: board, submit: save });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput autoComplete="off" {...field.name()} />
        <Textarea autosize minRows={3} {...field.description()} />
      </Stack>
    </DialogForm>
  );
}

// Without a fixed board (a new meeting on the meetings page), the board is chosen first: then the board is a field
// too (a second schema, so it is required only there). The date and time is a `DateTimePicker` (`2026-09-15 10:00:00`),
// the output the fake server's `start` (`2026-09-15T10:00`).
const meetingSchema = z.object({
  boardId: z.string().optional(),
  title: z.string().trim().min(1),
  start: z.string().transform((value) => value.replace(' ', 'T').slice(0, 16)),
  location: z.string().default(''),
});
const meetingWithBoardSchema = meetingSchema.extend({ boardId: z.string() });

function MeetingForm(
  { meeting, boards, save }: { meeting?: Meeting; boards?: readonly Board[]; save: Save<typeof meetingSchema> },
): ReactElement {
  const { DialogForm, field } = useForm(boards !== undefined ? meetingWithBoardSchema : meetingSchema, {
    labels: 'meeting',
    initial: meeting !== undefined
      ? { ...meeting, start: `${meeting.start.replace('T', ' ')}:00` }
      : { boardId: boards?.[0]?.id, location: 'Board room, headquarters' },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        {boards !== undefined && (
          <NativeSelect data={boards.map((board) => ({ value: board.id, label: board.name }))} {...field.boardId()} />
        )}
        <TextInput autoComplete="off" {...field.title()} />
        <DateTimePicker
          valueFormat="DD.MM.YYYY HH:mm"
          popoverProps={{ floatingStrategy: 'fixed' }}
          {...field.start()}
        />
        <TextInput autoComplete="off" {...field.location()} />
      </Stack>
    </DialogForm>
  );
}

// The presenter is one of the board's members. The section is one of the agenda's, or none: another section moves the
// item to its end (the table moves it by dragging too). Without sections in the agenda, there is no select.
const agendaItemSchema = z.object({
  title: z.string().trim().min(1),
  sectionId: z.string().default(''),
  presenterId: z.string().default(''),
  duration: z.number().min(5).max(240),
  description: z.string().default(''),
});

function AgendaItemForm({ item, members, sections, save }: {
  item?: AgendaItem;
  members: readonly Person[];
  sections: readonly AgendaSection[];
  save: Save<typeof agendaItemSchema>;
}): ReactElement {
  const { DialogForm, field } = useForm(agendaItemSchema, {
    labels: 'agendaItem',
    initial: item ?? { presenterId: members[0]?.id, duration: 15 },
    submit: save,
  });

  return (
    <DialogForm>
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
    </DialogForm>
  );
}

// Nothing to validate: both fields may stay empty. The minutes are a BlockNote document (`minutes.tsx`), with `@` for
// a member of the board (`members`).
const minutesSchema = z.object({ minutes: z.string().default(''), decision: z.string().default('') });

function MinutesForm(
  { item, members, save }: { item: AgendaItem; members: readonly Person[]; save: Save<typeof minutesSchema> },
): ReactElement {
  const { DialogForm, field } = useForm(minutesSchema, { labels: 'minutes', initial: item, submit: save });

  return (
    <DialogForm>
      <Stack gap="sm" className="board-manager__minutes-form">
        <MinutesEditor
          description="What was presented and discussed. Type @ to mention a member."
          people={members}
          {...field.minutes()}
        />
        <Textarea description="Leave it empty if nothing was decided." autosize minRows={3} {...field.decision()} />
      </Stack>
    </DialogForm>
  );
}

// The name of a document. When the field first gets the focus (the dialog focuses it), only the name without the
// extension is selected, like in a file manager: typing replaces the name and keeps the type.
const documentSchema = z.object({ name: z.string().trim().min(1) });

function DocumentForm(
  { document, save }: { document: MeetingDocument; save: Save<typeof documentSchema> },
): ReactElement {
  const { DialogForm, field } = useForm(documentSchema, { labels: 'document', initial: document, submit: save });
  const focusedRef = useRef(false);

  return (
    <DialogForm>
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
    </DialogForm>
  );
}

// A new person may get an organization preset (`organizationId`, on the page of an organization). The name is
// required, the email required and valid.
const personSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  organizationId: z.string().default(''),
});

function PersonForm(
  { person, organizationId, save }: { person?: Person; organizationId?: string; save: Save<typeof personSchema> },
): ReactElement {
  const organizations = [...db.getState().organizations].sort((a, b) => a.name.localeCompare(b.name));
  const { DialogForm, field } = useForm(personSchema, {
    labels: 'person',
    initial: person ?? { organizationId },
    submit: save,
  });

  return (
    <DialogForm>
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
    </DialogForm>
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
    description: z.string().default(''),
    street: z.string().default(''),
    zipCode: z.string().default(''),
    city: z.string().default(''),
    country: z.string().default(''),
    website: z.string().refine((value) => normalizeWebsite(value) !== undefined, 'Not a valid URL').default(''),
  });
}

function OrganizationForm(
  { organization, save }: { organization?: Organization; save: Save<ReturnType<typeof organizationSchema>> },
): ReactElement {
  const { DialogForm, field } = useForm(organizationSchema(organization?.id), {
    labels: 'organization',
    initial: organization,
    submit: save,
  });

  return (
    <DialogForm>
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
    </DialogForm>
  );
}

// A new member (`people`: those who are not on the board yet) or a new role of a member (`role`, no person to choose):
// with people, the person is a field too (a second schema, so it is required only there).
const memberSchema = z.object({ personId: z.string().optional(), role: z.enum(ROLES) });
const memberWithPersonSchema = memberSchema.extend({ personId: z.string() });

function MemberForm(
  { people, role, save }: { people?: readonly Person[]; role?: Role; save: Save<typeof memberSchema> },
): ReactElement {
  const { DialogForm, field } = useForm(people !== undefined ? memberWithPersonSchema : memberSchema, {
    labels: 'member',
    initial: { role: role ?? 'Member' },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        {people !== undefined && (
          // Loaded while typing, like the data navigator's autocomplete filter: all candidates when the list opens.
          <AsyncSelect
            minQueryLength={0}
            placeholder="Search by name or organization"
            load={(query, signal) => suggestPeople(query, signal, people.map((person) => person.id))}
            {...field.personId()}
          />
        )}
        <NativeSelect data={[...ROLES]} {...field.role()} />
      </Stack>
    </DialogForm>
  );
}
