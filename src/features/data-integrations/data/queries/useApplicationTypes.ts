import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';
import type { ApplicationType } from '../types/sources.types';

export const applicationTypesKeys = {
  all: ['application-types'] as const,
  lists: () => [...applicationTypesKeys.all, 'list'] as const,
};

/**
 * Catalogue of Red Hat services that can attach to a data source — Cost
 * Management, RHEL Management, Subscriptions, and so on. The table's
 * "Connected applications" column resolves `application_type_id` through this
 * list to display the service name.
 *
 * A new application type is a backend release, not something that changes
 * during a session, so the catalogue is held for an hour.
 */
const APPLICATION_TYPES_STALE_TIME = 60 * 60 * 1000;

export function useApplicationTypes() {
  const { axios } = useAppServices();
  const api = createSourcesApi(axios);

  return useQuery<ApplicationType[]>({
    queryKey: applicationTypesKeys.lists(),
    queryFn: () => api.getApplicationTypes(),
    staleTime: APPLICATION_TYPES_STALE_TIME,
  });
}
