import { eventResourceV3GetEvents } from '@redhat-cloud-services/notifications-client/v3';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared/utils';
import type { AxiosInstance } from 'axios';

const NOTIFICATIONS_API_BASE = '/api/notifications/v3';

const endpoints = { eventResourceV3GetEvents };

export function createEventsApi(axios: AxiosInstance) {
  return APIFactory(NOTIFICATIONS_API_BASE, endpoints, { axios });
}
