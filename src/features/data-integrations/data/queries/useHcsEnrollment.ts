import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';

export function useHcsEnrollment(enabled: boolean) {
  const { axios, environment } = useAppServices();

  return useQuery({
    queryKey: ['hcs-enrollment'],
    queryFn: () =>
      createSourcesApi(axios).getHcsEnrollment(environment === 'production'),
    enabled,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
