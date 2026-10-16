import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';

export function useAzureLighthouseLink(enabled = true) {
  const { axios } = useAppServices();

  return useQuery({
    queryKey: ['azure-lighthouse-link'],
    queryFn: () => createSourcesApi(axios).getAzureLighthouseLink(),
    enabled,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
