import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../shared/ServiceContext';
import { createEventsApi } from '../api/events';
import type { EventLogParams, PageEventLogEntry } from '../types/events.types';

export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (params: EventLogParams) => [...eventsKeys.lists(), params] as const,
};

export function useEvents(params: EventLogParams = {}) {
  const { axios } = useAppServices();
  const api = createEventsApi(axios);

  return useQuery<PageEventLogEntry>({
    queryKey: eventsKeys.list(params),
    queryFn: async () => {
      const response = await api.eventResourceV3GetEvents({
        limit: params.limit,
        offset: params.offset,
        startDateTime: params.startDate,
        endDateTime: params.endDate,
        bundleIds: params.bundleIds,
        appIds: params.appIds,
        endpointTypes: params.endpointTypes,
        eventTypeDisplayName: params.eventTypeDisplayName,
        invocationResults: params.invocationResults,
        status: params.status,
        severities: params.severities,
        sortBy: params.sortBy,
        includeActions: params.includeActions ?? true,
        includeDetails: params.includeDetails,
        includePayload: params.includePayload,
      });
      return response.data as unknown as PageEventLogEntry;
    },
    placeholderData: keepPreviousData,
  });
}
