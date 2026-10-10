import { createContext, useContext } from 'react';
import type { ReactElement, ReactNode } from 'react';

export { useViewerId, ViewerProvider };

// Who uses the app: the signed-in employee, an HR manager (the app is a tool of HR: no roles to switch). A real app
// would take them from the sign-in.
const ViewerContext = createContext<string | null>(null);

function ViewerProvider({ employeeId, children }: { employeeId: string; children: ReactNode }): ReactElement {
  return <ViewerContext.Provider value={employeeId}>{children}</ViewerContext.Provider>;
}

function useViewerId(): string {
  const employeeId = useContext(ViewerContext);

  if (employeeId === null) {
    throw new Error('useViewerId: no ViewerProvider around it.');
  }

  return employeeId;
}
