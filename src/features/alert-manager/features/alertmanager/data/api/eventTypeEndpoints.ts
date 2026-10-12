import type { AxiosInstance } from 'axios';
import type { EndpointInfo, NotifierSummary } from '../../types';

const API_BASE = '/api/notifications/v3';

export const fetchEventTypeEndpoints = async (
  axios: AxiosInstance,
  eventTypeId: string,
): Promise<EndpointInfo[]> => {
  const response = await axios.get<EndpointInfo[]>(
    `${API_BASE}/notifications/eventTypes/${eventTypeId}/endpoints`,
  );
  return response.data;
};

/**
 * Extract unique notifier summaries from endpoints.
 * Groups by endpoint type + sub_type to produce distinct notifier labels.
 */
export function extractNotifiers(endpoints: EndpointInfo[]): NotifierSummary[] {
  const seen = new Map<string, NotifierSummary>();

  for (const endpoint of endpoints) {
    const { type, sub_type, enabled } = endpoint;
    if (!enabled) continue;

    const key = type === 'camel' && sub_type ? `${type}:${sub_type}` : type;

    if (!seen.has(key)) {
      seen.set(key, { type, subType: sub_type });
    }
  }

  return Array.from(seen.values());
}
