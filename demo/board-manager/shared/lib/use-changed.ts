import { useQueryClient } from '@tanstack/react-query';

export { useChanged };

// After a change: every read of the app is loaded again (a change of one feature's data may show in another's, e.g. a
// deleted board takes its meetings with it).
function useChanged(): () => Promise<void> {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries();
}
