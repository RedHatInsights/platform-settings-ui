import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createBundlesApi } from '../api/bundles';
import type { BundleFacet } from '../types/bundles.types';

export const bundlesKeys = {
  all: ['bundles'] as const,
  facets: () => [...bundlesKeys.all, 'facets'] as const,
};

export function useBundleFacets() {
  const { axios } = useAppServices();
  const api = createBundlesApi(axios);

  return useQuery<BundleFacet[]>({
    queryKey: bundlesKeys.facets(),
    queryFn: async () => {
      const response = await api.notificationResourceV3GetBundles({
        includeApplications: false,
      });
      const bundles = response.data as unknown as Array<{
        id: string;
        name: string;
        display_name: string;
      }>;

      return bundles.map(({ display_name, ...bundle }) => ({
        ...bundle,
        displayName: display_name,
      })) as BundleFacet[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
