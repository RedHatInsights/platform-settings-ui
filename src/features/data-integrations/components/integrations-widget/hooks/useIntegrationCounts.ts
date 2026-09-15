import { useSources } from '../../../data/queries/useSources';
import type { IntegrationCounts } from '../types';

/**
 * Hook to fetch and aggregate data integration counts by provider.
 *
 * Uses the useSources hook with sourceTypeIds filters to get accurate counts
 * from meta.count for each provider, supporting tenants with >1000 sources.
 */
export function useIntegrationCounts() {
  // Fetch counts for each provider using sourceTypeIds filter
  // The API returns meta.count with the accurate total for each filter
  const awsQuery = useSources({ sourceTypeIds: ['1'], limit: 1 });
  const googleQuery = useSources({ sourceTypeIds: ['2'], limit: 1 });
  const azureQuery = useSources({ sourceTypeIds: ['3'], limit: 1 });
  const openshiftQuery = useSources({ sourceTypeIds: ['4'], limit: 1 });

  const counts: IntegrationCounts = {
    aws: awsQuery.data?.meta.count ?? 0,
    google_cloud: googleQuery.data?.meta.count ?? 0,
    azure: azureQuery.data?.meta.count ?? 0,
    openshift: openshiftQuery.data?.meta.count ?? 0,
  };

  const isLoading =
    awsQuery.isLoading ||
    googleQuery.isLoading ||
    azureQuery.isLoading ||
    openshiftQuery.isLoading;

  const error =
    awsQuery.error ??
    googleQuery.error ??
    azureQuery.error ??
    openshiftQuery.error;

  return {
    counts,
    isLoading,
    error,
  };
}
