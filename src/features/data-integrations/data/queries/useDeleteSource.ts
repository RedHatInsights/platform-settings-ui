import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';
import { sourcesKeys } from './useSources';

export function useDeleteSource() {
  const { axios } = useAppServices();
  const api = createSourcesApi(axios);
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id) => api.deleteSource(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sourcesKeys.all }),
  });
}
