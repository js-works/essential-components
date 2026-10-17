// The entity types of the board manager (the shared kernel) and what can be done with them (the repositories'
// interfaces): used by the features and the server; imports nothing.

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
export { agendaNumbers, agendaOf, arranged, blockEnd, idOf, newPlace, withSections } from './agenda.js';
export type { Board, BoardCriteria, BoardRepository, BoardSortKey, BoardSummary, BoardValues } from './board.js';
export { BOARD_SORT_KEYS } from './board.js';
export { localDate, localDateTime } from './dates.js';
export type {
  DocumentCriteria,
  DocumentRepository,
  DocumentSortKey,
  MeetingDocument,
  UploadDocument,
} from './document.js';
export { DOCUMENT_SORT_KEYS } from './document.js';
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
export { MEETING_SORT_KEYS, MEETING_STATUSES } from './meeting.js';
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
export { BOARD_MEMBER_SORT_KEYS, PERSON_MEMBERSHIP_SORT_KEYS, ROLES } from './membership.js';
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
export { normalizeWebsite, ORGANIZATION_SORT_KEYS } from './organization.js';
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
export { PERSON_SORT_KEYS } from './person.js';
export type { Page, Paging, Range, Sort, TextMatch } from './query.js';
export type { SavedFilterRepository, SavedTableFilter } from './saved-filter.js';
