import type { Employee, EmploymentType } from './employee';

export { CANDIDATE_SOURCES, isInProcess, OPENING_STATUSES, PIPELINE, STAGES };
export type {
  Candidate,
  CandidateRepository,
  CandidateSource,
  CandidateValues,
  HireValues,
  Opening,
  OpeningRepository,
  OpeningStatus,
  OpeningValues,
  Stage,
};

// A job opening: a position (or a few of the same) to fill, in a department, with its hiring manager.
type OpeningStatus = 'open' | 'onHold' | 'closed';

const OPENING_STATUSES: readonly OpeningStatus[] = ['open', 'onHold', 'closed'];

type Opening = {
  id: string;
  title: string;
  departmentId: string;
  hiringManagerId: string | null;
  location: string;
  employmentType: EmploymentType;
  positions: number;
  status: OpeningStatus;
  // Since when (yyyy-mm-dd).
  opened: string;
  description: string;
};

type OpeningValues = Omit<Opening, 'id' | 'opened'>;

interface OpeningRepository {
  all(signal?: AbortSignal): Promise<readonly Opening[]>;
  create(values: OpeningValues): Promise<Opening>;
  update(id: string, values: OpeningValues): Promise<Opening>;
}

// The stages of an application: through the pipeline to `hired`, or `rejected` at any point.
type Stage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

// The columns of the board, in order.
const PIPELINE: readonly Stage[] = ['applied', 'screening', 'interview', 'offer', 'hired'];

const STAGES: readonly Stage[] = [...PIPELINE, 'rejected'];

type CandidateSource = 'website' | 'referral' | 'linkedin' | 'agency';

const CANDIDATE_SOURCES: readonly CandidateSource[] = ['website', 'referral', 'linkedin', 'agency'];

type Candidate = {
  id: string;
  openingId: string;
  name: string;
  email: string;
  source: CandidateSource;
  // Since when (yyyy-mm-dd).
  applied: string;
  stage: Stage;
  // 0 (not rated yet) to 5.
  rating: number;
  note: string;
  // The employee a hired candidate became.
  employeeId: string | null;
};

type CandidateValues = Pick<Candidate, 'openingId' | 'name' | 'email' | 'source' | 'rating' | 'note'>;

// What a hire needs besides the candidate: the job (from the opening, changeable) and the first salary.
type HireValues =
  & Pick<
    Employee,
    'title' | 'departmentId' | 'managerId' | 'location' | 'employmentType' | 'weeklyHours' | 'startDate'
  >
  & { salary: number; onboarding: boolean };

interface CandidateRepository {
  all(signal?: AbortSignal): Promise<readonly Candidate[]>;
  create(values: CandidateValues): Promise<Candidate>;
  update(id: string, values: CandidateValues): Promise<Candidate>;
  // Refused for a hired candidate (and to `hired`: that is `hire`).
  move(ids: readonly string[], stage: Exclude<Stage, 'hired'>): Promise<void>;
  // The candidate becomes an employee (with the onboarding checklist, if asked); the opening is closed when all its
  // positions are filled.
  hire(id: string, values: HireValues): Promise<Employee>;
}

function isInProcess(candidate: Candidate): boolean {
  return candidate.stage !== 'hired' && candidate.stage !== 'rejected';
}
