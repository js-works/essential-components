import type { ReactElement } from 'react';
import { PeopleTable } from '../components/PeopleTable';

export { MembersPage };

// The "Members" module: all people.
function MembersPage(): ReactElement {
  return (
    <PeopleTable
      title="Members"
      subtitle="Everyone who can be on a board. Add them to a board, or remove them from one, on the page of the board."
    />
  );
}
