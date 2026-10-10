import type {
  CandidateRepository,
  ChecklistRepository,
  DepartmentRepository,
  DocumentRepository,
  EmployeeRepository,
  HrData,
  OpeningRepository,
  SalaryRepository,
} from '../../domain';

export { createHrService };
export type { HrService };

// The app's service: what the UI calls. The repositories' own methods, and `data()`: everything in one read (the lists
// are small, and most pages combine several of them).
function createHrService(repositories: {
  departments: DepartmentRepository;
  employees: EmployeeRepository;
  salaries: SalaryRepository;
  documents: DocumentRepository;
  openings: OpeningRepository;
  candidates: CandidateRepository;
  checklists: ChecklistRepository;
}) {
  const { departments, employees, salaries, documents, openings, candidates, checklists } = repositories;

  return {
    async data(signal?: AbortSignal): Promise<HrData> {
      const [departmentList, employeeList, salaryList, documentList, openingList, candidateList, checklistList] =
        await Promise.all([
          departments.all(signal),
          employees.all(signal),
          salaries.all(signal),
          documents.all(signal),
          openings.all(signal),
          candidates.all(signal),
          checklists.all(signal),
        ]);

      return {
        departments: departmentList,
        employees: employeeList,
        salaries: salaryList,
        documents: documentList,
        openings: openingList,
        candidates: candidateList,
        checklists: checklistList,
      };
    },
    createDepartment: departments.create,
    updateDepartment: departments.update,
    removeDepartment: departments.remove,
    createEmployee: employees.create,
    updateEmployee: employees.update,
    terminateEmployee: employees.terminate,
    addSalary: salaries.add,
    uploadFile: documents.upload,
    attachDocuments: documents.attach,
    removeDocuments: documents.remove,
    createOpening: openings.create,
    updateOpening: openings.update,
    createCandidate: candidates.create,
    updateCandidate: candidates.update,
    moveCandidates: candidates.move,
    hireCandidate: candidates.hire,
    createChecklist: checklists.create,
    removeChecklists: checklists.remove,
    setTasksDone: checklists.setDone,
    addTask: checklists.addTask,
    removeTask: checklists.removeTask,
  };
}

type HrService = ReturnType<typeof createHrService>;
