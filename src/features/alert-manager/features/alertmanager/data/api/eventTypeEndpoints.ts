import { endpointResourceV3GetEndpoints } from '@redhat-cloud-services/integrations-client/v3';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared/utils';
import type { AxiosInstance } from 'axios';
import type { EndpointInfo, NotifierSummary } from '../../types';

const API_BASE = '/api/integrations/v3.0';
const ENDPOINT_PAGE_SIZE = 200;
const endpoints = { endpointResourceV3GetEndpoints };

export const fetchEndpoints = async (
  axios: AxiosInstance,
): Promise<EndpointInfo[]> => {
  const api = APIFactory(API_BASE, endpoints, { axios });
  const allEndpoints: EndpointInfo[] = [];
  let offset = 0;

  while (true) {
    const response = await api.endpointResourceV3GetEndpoints({
      limit: ENDPOINT_PAGE_SIZE,
      offset,
      active: true,
    });
    const pageEndpoints = response.data.data as EndpointInfo[];
    allEndpoints.push(...pageEndpoints);

    if (
      pageEndpoints.length === 0 ||
      allEndpoints.length >= response.data.meta.count
    ) {
      return allEndpoints;
    }

    offset += pageEndpoints.length;
  }
};

export function extractNotifiersByEventType(
  endpoints: EndpointInfo[],
): Map<string, NotifierSummary[]> {
  const notifiersByEventType = new Map<string, NotifierSummary[]>();

  for (const endpoint of endpoints) {
    if (!endpoint.enabled) continue;

    const notifier = { type: endpoint.type, subType: endpoint.sub_type };
    const eventTypeIds =
      endpoint.event_types_group_by_bundles_and_applications?.flatMap(
        (bundle) =>
          bundle.applications?.flatMap(
            (application) => application.event_types?.map(({ id }) => id) ?? [],
          ) ?? [],
      ) ?? [];

    for (const eventTypeId of eventTypeIds) {
      const notifiers = notifiersByEventType.get(eventTypeId) ?? [];
      const key = notifier.subType
        ? `${notifier.type}:${notifier.subType}`
        : notifier.type;

      if (
        !notifiers.some((item) => {
          const itemKey = item.subType
            ? `${item.type}:${item.subType}`
            : item.type;
          return itemKey === key;
        })
      ) {
        notifiers.push(notifier);
      }

      notifiersByEventType.set(eventTypeId, notifiers);
    }
  }

  return notifiersByEventType;
}
