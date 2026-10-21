import { notificationResourceV3GetEventTypes } from '@redhat-cloud-services/notifications-client/v3';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared/utils';
import type { AxiosInstance } from 'axios';
import { EventTypesParams, EventTypesResponse } from '../../types';

const API_BASE = '/api/notifications/v3';

const endpoints = { notificationResourceV3GetEventTypes };

export function createEventTypesApi(axios: AxiosInstance) {
  return APIFactory(API_BASE, endpoints, { axios });
}

export const fetchEventTypes = async (
  axios: AxiosInstance,
  params: EventTypesParams,
): Promise<EventTypesResponse> => {
  const api = createEventTypesApi(axios);
  const response = await api.notificationResourceV3GetEventTypes({
    limit: params.limit,
    offset: params.offset,
    sortBy: params.sortBy,
    eventTypeName: params.eventTypeName,
    applicationIds: params.applicationIds,
  });

  return response.data;
};
