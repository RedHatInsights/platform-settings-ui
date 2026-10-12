import { notificationResourceV3GetBundles } from '@redhat-cloud-services/notifications-client/v3';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared/utils';
import type { AxiosInstance } from 'axios';

const NOTIFICATIONS_API_BASE = '/api/notifications/v3';

const endpoints = { notificationResourceV3GetBundles };

export function createBundlesApi(axios: AxiosInstance) {
  return APIFactory(NOTIFICATIONS_API_BASE, endpoints, { axios });
}
