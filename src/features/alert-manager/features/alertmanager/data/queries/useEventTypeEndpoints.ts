import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../../../shared/ServiceContext';
import type { NotifierSummary } from '../../types';
import {
  extractNotifiersByEventType,
  fetchEndpoints,
} from '../api/eventTypeEndpoints';

const STALE_TIME = 5 * 60 * 1000;

export const eventTypeEndpointsQueryKey = [
  'alertManager',
  'eventTypeEndpoints',
] as const;

export interface EventTypeNotifierState {
  status: 'pending' | 'error' | 'success';
  notifiers: NotifierSummary[];
}

/**
 * Fetches enabled endpoints once and extracts a
 * `Map<eventTypeId, EventTypeNotifierState>` of configured notifiers.
 */
export const useEventTypeNotifiers = (eventTypeIds: string[]) => {
  const { axios } = useAppServices();

  const query = useQuery({
    queryKey: eventTypeEndpointsQueryKey,
    queryFn: () => fetchEndpoints(axios),
    staleTime: STALE_TIME,
    enabled: eventTypeIds.length > 0,
  });

  const notifiersByEventType = extractNotifiersByEventType(query.data ?? []);
  const notifiersMap = new Map<string, EventTypeNotifierState>();
  eventTypeIds.forEach((eventTypeId) => {
    notifiersMap.set(eventTypeId, {
      status: query.isError ? 'error' : query.isPending ? 'pending' : 'success',
      notifiers: notifiersByEventType.get(eventTypeId) ?? [],
    });
  });

  return { notifiersMap, isLoading: query.isLoading };
};
