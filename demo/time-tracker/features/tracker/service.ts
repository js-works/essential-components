import { holidaysAround, todayDate } from '../../domain';
import type {
  CorrectionRepository,
  EmployeeRepository,
  EntryRepository,
  LeaveRepository,
  SickRepository,
  TeamRepository,
  TimeData,
} from '../../domain';

export { createTimeService };
export type { TimeService };

// The app's service: what the UI calls. The repositories' own methods, and `data()`: everything in one read (the lists
// are small, and most pages combine several of them), with the public holidays around today.
function createTimeService(repositories: {
  employees: EmployeeRepository;
  teams: TeamRepository;
  entries: EntryRepository;
  corrections: CorrectionRepository;
  leave: LeaveRepository;
  sick: SickRepository;
}) {
  const { employees, teams, entries, corrections, leave, sick } = repositories;

  return {
    async data(signal?: AbortSignal): Promise<TimeData> {
      const [employeeList, teamList, entryList, correctionList, leaveList, sickList] = await Promise.all([
        employees.all(signal),
        teams.all(signal),
        entries.all(signal),
        corrections.all(signal),
        leave.all(signal),
        sick.all(signal),
      ]);

      return {
        employees: employeeList,
        teams: teamList,
        entries: entryList,
        corrections: correctionList,
        leave: leaveList,
        sick: sickList,
        holidays: holidaysAround(todayDate()),
      };
    },
    createEmployee: employees.create,
    updateEmployee: employees.update,
    clock: entries.clock,
    requestCorrection: corrections.create,
    decideCorrection: corrections.decide,
    requestLeave: leave.create,
    cancelLeave: leave.cancel,
    decideLeave: leave.decide,
    reportSick: sick.report,
    updateSick: sick.update,
    attachCertificate: sick.attachCertificate,
    uploadFile: sick.upload,
  };
}

type TimeService = ReturnType<typeof createTimeService>;
