import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

export { useViewer, ViewerProvider };
export type { Role, Viewer };

// Who uses the app: the signed-in employee, and the role they look at it with. As an employee they see their own time,
// requests and sick calls; as a team lead also their team's, the approvals, and the changes of employees. A switch of
// the demo (in the app header's user menu): a real app would take the role from the user's permissions.
type Role = 'employee' | 'lead';

type Viewer = {
  employeeId: string;
  role: Role;
  isLead: boolean;
  setRole: (role: Role) => void;
};

const ViewerContext = createContext<Viewer | null>(null);

const STORAGE_KEY = 'time-tracker:role';

function storedRole(): Role {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'employee' ? 'employee' : 'lead';
  } catch {
    return 'lead';
  }
}

// The role is remembered per browser; a team lead by default (the demo shows more that way).
function ViewerProvider({ employeeId, children }: { employeeId: string; children: ReactNode }): ReactElement {
  const [role, setRoleState] = useState<Role>(storedRole);
  const viewer = useMemo((): Viewer => ({
    employeeId,
    role,
    isLead: role === 'lead',
    setRole: (next) => {
      setRoleState(next);

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Not remembered: the role still changes.
      }
    },
  }), [employeeId, role]);

  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

function useViewer(): Viewer {
  const viewer = useContext(ViewerContext);

  if (viewer === null) {
    throw new Error('useViewer: no ViewerProvider around it.');
  }

  return viewer;
}
