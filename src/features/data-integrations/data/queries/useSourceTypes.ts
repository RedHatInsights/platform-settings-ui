import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';
import type { SourceType } from '../types/sources.types';

export const sourceTypesKeys = {
  all: ['source-types'] as const,
  lists: () => [...sourceTypesKeys.all, 'list'] as const,
};

/**
 * A new provider is a backend release, not something that changes during a
 * session, so the catalogue is held for an hour. Both the list (for resolving
 * `source_type_id` to a name and icon) and the creation wizard read it, and
 * neither should trigger a refetch.
 */
const SOURCE_TYPES_STALE_TIME = 60 * 60 * 1000;

export function useSourceTypes() {
  const { axios } = useAppServices();
  const api = createSourcesApi(axios);

  return useQuery<SourceType[]>({
    queryKey: sourceTypesKeys.lists(),
    queryFn: () => api.getSourceTypes(),
    staleTime: SOURCE_TYPES_STALE_TIME,
  });
}
