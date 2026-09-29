import { NativeSelect, Stack, Textarea, TextInput } from '@mantine/core';
import type { ReactElement } from 'react';
import { ROLES } from './db';
import type { AgendaItem, Board, Meeting, Person, Role } from './db';

export { AgendaItemForm, BoardForm, MeetingForm, MemberForm, MinutesForm, PersonForm };

// The contents of the form dialogs: Mantine inputs with a `name`, so the dialog's form collects them (`attempt.data`),
// and native constraints (`required`, `min`), which the dialog checks before "OK". No popups (a Mantine select would
// open outside the modal dialog): selects are native.

function BoardForm({ board }: { board?: Board }): ReactElement {
  return (
    <Stack gap="sm">
      <TextInput name="name" label="Name" required defaultValue={board?.name} autoComplete="off" />
      <Textarea name="description" label="Description" autosize minRows={3} defaultValue={board?.description} />
    </Stack>
  );
}

// Without a fixed board (a new meeting on the meetings page), the board is chosen first.
function MeetingForm({ meeting, boards }: { meeting?: Meeting; boards?: readonly Board[] }): ReactElement {
  return (
    <Stack gap="sm">
      {boards !== undefined && (
        <NativeSelect
          name="boardId"
          label="Board"
          required
          data={boards.map((board) => ({ value: board.id, label: board.name }))}
        />
      )}
      <TextInput name="title" label="Title" required defaultValue={meeting?.title} autoComplete="off" />
      <TextInput name="start" label="Date and time" type="datetime-local" required defaultValue={meeting?.start} />
      <TextInput
        name="location"
        label="Location"
        defaultValue={meeting?.location ?? 'Board room, headquarters'}
        autoComplete="off"
      />
    </Stack>
  );
}

// The presenter is one of the board's members.
function AgendaItemForm({ item, members }: { item?: AgendaItem; members: readonly Person[] }): ReactElement {
  return (
    <Stack gap="sm">
      <TextInput name="title" label="Title" required defaultValue={item?.title} autoComplete="off" />
      <NativeSelect
        name="presenterId"
        label="Presenter"
        defaultValue={item?.presenterId}
        data={members.map((person) => ({ value: person.id, label: person.name }))}
      />
      <TextInput
        name="duration"
        label="Duration (minutes)"
        type="number"
        min={5}
        max={240}
        step={5}
        required
        defaultValue={item?.duration ?? 15}
      />
      <Textarea name="description" label="Description" autosize minRows={3} defaultValue={item?.description} />
    </Stack>
  );
}

function MinutesForm({ item }: { item: AgendaItem }): ReactElement {
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

function PersonForm({ person }: { person?: Person }): ReactElement {
  return (
    <Stack gap="sm">
      <TextInput name="name" label="Name" required defaultValue={person?.name} autoComplete="off" />
      <TextInput name="email" label="Email" type="email" required defaultValue={person?.email} autoComplete="off" />
      <TextInput name="organization" label="Organization" defaultValue={person?.organization} autoComplete="off" />
    </Stack>
  );
}

// A new member (`people`: those who are not on the board yet) or a new role of a member (`role`, no person to choose).
function MemberForm({ people, role }: { people?: readonly Person[]; role?: Role }): ReactElement {
  return (
    <Stack gap="sm">
      {people !== undefined && (
        <NativeSelect
          name="personId"
          label="Person"
          required
          data={people.map((person) => ({ value: person.id, label: `${person.name} (${person.organization})` }))}
        />
      )}
      <NativeSelect name="role" label="Role" defaultValue={role ?? 'Member'} data={[...ROLES]} />
    </Stack>
  );
}
