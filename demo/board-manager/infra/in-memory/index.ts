// The in-memory implementation of the board manager's repositories (the fake server): one store in memory, seeded.
// Only the app imports it, to wire the services.

import { createAgendaRepository } from './agenda-repository.js';
import { createBoardRepository } from './board-repository.js';
import { createDocumentRepository } from './document-repository.js';
import { createMeetingRepository } from './meeting-repository.js';
import { createMembershipRepository } from './membership-repository.js';
import { createOrganizationRepository } from './organization-repository.js';
import { createPersonRepository } from './person-repository.js';

export { createInMemoryRepositories };

function createInMemoryRepositories() {
  return {
    agenda: createAgendaRepository(),
    boards: createBoardRepository(),
    documents: createDocumentRepository(),
    meetings: createMeetingRepository(),
    memberships: createMembershipRepository(),
    organizations: createOrganizationRepository(),
    people: createPersonRepository(),
  };
}
