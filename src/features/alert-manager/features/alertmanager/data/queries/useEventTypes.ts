import { useQuery } from '@tanstack/react-query';
import { useAppServices } from '../../../../../../shared/ServiceContext';
import { EventTypesParams } from '../../types';
import { fetchEventTypes } from '../api/eventTypes';

export const eventTypesQueryKey = (params: EventTypesParams) => [
  'alertManager',
  'eventTypes',
  params,
];

export const useEventTypes = (params: EventTypesParams) => {
  const { axios } = useAppServices();

  return useQuery({
    queryKey: eventTypesQueryKey(params),
    queryFn: () => fetchEventTypes(axios, params),
  });
};
