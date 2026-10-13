import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';
import { sourcesKeys } from './useSources';
import type { CreateSourceInput, Source } from '../types/sources.types';

/**
 * Creates a data integration and its credentials.
 *
 * Invalidates `sourcesKeys.all` rather than just the lists: a new integration
 * also moves the dashboard widget's counts, and `all` covers every read without
 * having to enumerate them. The source type catalogue is unaffected, so it is
 * deliberately left alone.
 *
 * Nothing is reported through `notify()`. The wizard's result step shows both
 * the success detail and the failure reason, and it is modal — a toast behind
 * it would be saying the same thing where the user cannot see it. Mutations
 * that complete somewhere without their own result UI should still notify.
 */
export function useCreateSource() {
  const { axios } = useAppServices();
  const api = createSourcesApi(axios);
  const queryClient = useQueryClient();

  return useMutation<Source, unknown, CreateSourceInput>({
    mutationFn: (input) => api.createSource(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sourcesKeys.all }),
  });
}
