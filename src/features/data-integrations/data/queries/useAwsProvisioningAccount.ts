import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createSourcesApi } from '../api/sources';

export function useAwsProvisioningAccount(
  applicationTypeId: string,
  enabled: boolean,
) {
  const { axios } = useAppServices();

  return useQuery({
    queryKey: ['aws-provisioning-account', applicationTypeId],
    queryFn: () =>
      createSourcesApi(axios).getAwsProvisioningAccount(applicationTypeId),
    enabled,
    staleTime: 60 * 60 * 1000,
  });
}
