import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';

export function useGoogleProvisioningAccount(applicationTypeId?: string) {
  const { axios } = useAppServices();

  return useQuery({
    queryKey: ['google-provisioning-account', applicationTypeId],
    queryFn: () =>
      createSourcesApi(axios).getGoogleProvisioningAccount(applicationTypeId!),
    enabled: Boolean(applicationTypeId),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
