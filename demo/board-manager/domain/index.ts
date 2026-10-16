// The entity types of the board manager (the shared kernel) and what can be done with them (the repositories'
// interfaces): used by the features and the server; imports nothing.

export { agendaNumbers, agendaOf, arranged, blockEnd, idOf, newPlace, withSections } from './agenda.js';
export type {
  Agenda,
  AgendaEntry,
  AgendaItem,
  AgendaItemValues,
  AgendaMove,
  AgendaRepository,
  AgendaSection,
  SectionDraft,
} from './agenda.js';

export type { Board, BoardCriteria, BoardRepository, BoardSortKey, BoardSummary, BoardValues } from './board.js';
export { localDate, localDateTime } from './dates.js';
export type {
  DocumentCriteria,
  DocumentRepository,
  DocumentSortKey,
  MeetingDocument,
  UploadDocument,
} from './document.js';

export { MEETING_STATUSES } from './meeting.js';
export type {
  Meeting,
  MeetingCriteria,
  MeetingRepository,
  MeetingSortKey,
  MeetingStatus,
  MeetingSummary,
  MeetingValues,
  MinutesState,
} from './meeting.js';

export { ROLES } from './membership.js';
export type {
  BoardMember,
  BoardMemberCriteria,
  BoardMemberSortKey,
  Membership,
  MembershipRepository,
  PersonMembership,
  PersonMembershipSortKey,
  Role,
} from './membership.js';

export { normalizeWebsite } from './organization.js';
export type {
  Organization,
  OrganizationCriteria,
  OrganizationOption,
  OrganizationRepository,
  OrganizationSortKey,
  OrganizationSummary,
  OrganizationValues,
  SuggestOrganizations,
} from './organization.js';

export type {
  Person,
  PersonCriteria,
  PersonOption,
  PersonRepository,
  PersonSortKey,
  PersonSummary,
  PersonValues,
  SuggestPeople,
} from './person.js';

export type { Page, Paging, Range, Sort, TextMatch } from './query.js';
