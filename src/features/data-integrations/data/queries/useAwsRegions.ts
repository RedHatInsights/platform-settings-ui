import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';

export function useAwsRegions(enabled: boolean) {
  const { axios } = useAppServices();

  return useQuery({
    queryKey: ['aws-s3-regions'],
    queryFn: () => createSourcesApi(axios).getAwsRegions(),
    enabled,
    staleTime: 60 * 60 * 1000,
  });
}
