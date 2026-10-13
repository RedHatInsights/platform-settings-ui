import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';

export function useGoogleBillingAccount() {
  const { axios } = useAppServices();

  return useQuery({
    queryKey: ['google-billing-account'],
    queryFn: () => createSourcesApi(axios).getGoogleBillingAccount(),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
