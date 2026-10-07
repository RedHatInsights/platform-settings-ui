import { useQueries } from '@tanstack/react-query';
import type { NotifierSummary } from '../../types';
import {
  extractNotifiers,
  fetchEventTypeBehaviorGroups,
} from '../api/eventTypeEndpoints';

const STALE_TIME = 5 * 60 * 1000;

export const eventTypeEndpointsQueryKey = (eventTypeId: string) => [
  'alertManager',
  'eventTypeEndpoints',
  eventTypeId,
];

/**
 * Fetches behavior groups for each event type ID and extracts a
 * `Map<eventTypeId, NotifierSummary[]>` of configured notifiers.
 */
export const useEventTypeNotifiers = (eventTypeIds: string[]) => {
  const queries = useQueries({
    queries: eventTypeIds.map((id) => ({
      queryKey: eventTypeEndpointsQueryKey(id),
      queryFn: async (): Promise<NotifierSummary[]> => {
        const behaviorGroups = await fetchEventTypeBehaviorGroups(id);
        return extractNotifiers(behaviorGroups);
      },
      staleTime: STALE_TIME,
      enabled: eventTypeIds.length > 0,
    })),
  });

  const notifiersMap = new Map<string, NotifierSummary[]>();
  queries.forEach((query, index) => {
    if (query.data) {
      notifiersMap.set(eventTypeIds[index], query.data);
    }
  });

  const isLoading = queries.some((q) => q.isLoading);

  return { notifiersMap, isLoading };
};
