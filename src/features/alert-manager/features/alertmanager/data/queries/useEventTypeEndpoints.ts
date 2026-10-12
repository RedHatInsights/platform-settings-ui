import { useQueries } from '@tanstack/react-query';
import { useAppServices } from '../../../../../../shared/ServiceContext';
import type { NotifierSummary } from '../../types';
import {
  extractNotifiers,
  fetchEventTypeEndpoints,
} from '../api/eventTypeEndpoints';

const STALE_TIME = 5 * 60 * 1000;

export const eventTypeEndpointsQueryKey = (eventTypeId: string) => [
  'alertManager',
  'eventTypeEndpoints',
  eventTypeId,
];

export interface EventTypeNotifierState {
  status: 'pending' | 'error' | 'success';
  notifiers: NotifierSummary[];
}

/**
 * Fetches behavior groups for each event type ID and extracts a
 * `Map<eventTypeId, EventTypeNotifierState>` of configured notifiers,
 * preserving each query's loading/error status.
 */
export const useEventTypeNotifiers = (eventTypeIds: string[]) => {
  const { axios } = useAppServices();

  const queries = useQueries({
    queries: eventTypeIds.map((id) => ({
      queryKey: eventTypeEndpointsQueryKey(id),
      queryFn: async (): Promise<NotifierSummary[]> => {
        const endpoints = await fetchEventTypeEndpoints(axios, id);
        return extractNotifiers(endpoints);
      },
      staleTime: STALE_TIME,
      enabled: eventTypeIds.length > 0,
    })),
  });

  const notifiersMap = new Map<string, EventTypeNotifierState>();
  queries.forEach((query, index) => {
    notifiersMap.set(eventTypeIds[index], {
      status: query.isError ? 'error' : query.isPending ? 'pending' : 'success',
      notifiers: query.data ?? [],
    });
  });

  const isLoading = queries.some((q) => q.isLoading);

  return { notifiersMap, isLoading };
};
