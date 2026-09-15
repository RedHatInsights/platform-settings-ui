import { useMemo } from 'react';
import { useSources } from '../../../data/queries/useSources';
import type { IntegrationCounts } from '../types';

/**
 * Hook to fetch and aggregate data integration counts by provider.
 *
 * Uses the useSources hook from the data layer to fetch all
 * sources and then aggregates them by source type ID.
 */
export function useIntegrationCounts() {
  // Fetch all sources with a high limit to get all integrations
  const { data, isLoading, error } = useSources({ limit: 1000 });

  const counts = useMemo<IntegrationCounts>(() => {
    if (!data?.data) {
      return {
        aws: 0,
        azure: 0,
        google_cloud: 0,
        openshift: 0,
      };
    }

    const result: IntegrationCounts = {
      aws: 0,
      azure: 0,
      google_cloud: 0,
      openshift: 0,
    };

    // Aggregate counts by source type ID
    // These IDs are based on the Sources API schema
    data.data.forEach((source) => {
      const typeId = source.source_type_id;

      // Cloud sources
      if (typeId === '1') result.aws++;
      else if (typeId === '2') result.google_cloud++;
      else if (typeId === '3') result.azure++;
      // Red Hat sources
      else if (typeId === '4') result.openshift++;
    });

    return result;
  }, [data]);

  return {
    counts,
    isLoading,
    error,
  };
}
