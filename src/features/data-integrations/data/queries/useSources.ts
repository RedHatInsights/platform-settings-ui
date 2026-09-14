import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';
import type { PageSource, Source, SourcesParams } from '../types/sources.types';

export const sourcesKeys = {
  all: ['sources'] as const,
  lists: () => [...sourcesKeys.all, 'list'] as const,
  list: (params: SourcesParams) => [...sourcesKeys.lists(), params] as const,
  details: () => [...sourcesKeys.all, 'detail'] as const,
  detail: (id: string) => [...sourcesKeys.details(), id] as const,
};

/**
 * Paginated, filterable list of data integrations.
 *
 * `keepPreviousData` keeps the previous page on screen while the next one
 * loads, so paging and filtering do not blank the table out.
 */
export function useSources(params: SourcesParams = {}) {
  const { axios } = useAppServices();
  const api = createSourcesApi(axios);

  return useQuery<PageSource>({
    queryKey: sourcesKeys.list(params),
    queryFn: () => api.getSources(params),
    placeholderData: keepPreviousData,
  });
}

export function useSource(id: string) {
  const { axios } = useAppServices();
  const api = createSourcesApi(axios);

  return useQuery<Source>({
    queryKey: sourcesKeys.detail(id),
    queryFn: () => api.getSource(id),
    enabled: Boolean(id),
  });
}
