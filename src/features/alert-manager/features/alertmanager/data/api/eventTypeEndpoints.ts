import axios from 'axios';
import type { BehaviorGroup, NotifierSummary } from '../../types';

const API_BASE = '/api/notifications/v1.0';

export const fetchEventTypeBehaviorGroups = async (
  eventTypeId: string,
): Promise<BehaviorGroup[]> => {
  const response = await axios.get<BehaviorGroup[]>(
    `${API_BASE}/notifications/eventTypes/${eventTypeId}/behaviorGroups`,
  );
  return response.data;
};

/**
 * Extract unique notifier summaries from behavior groups.
 * Groups by endpoint type + sub_type to produce distinct notifier labels.
 */
export function extractNotifiers(
  behaviorGroups: BehaviorGroup[],
): NotifierSummary[] {
  const seen = new Map<string, NotifierSummary>();

  for (const bg of behaviorGroups) {
    for (const action of bg.actions) {
      const { type, sub_type, enabled } = action.endpoint;
      if (!enabled) continue;

      const key = type === 'camel' && sub_type ? `${type}:${sub_type}` : type;

      if (!seen.has(key)) {
        seen.set(key, {
          type,
          subType: sub_type,
          label: getNotifierLabel(type, sub_type),
        });
      }
    }
  }

  return Array.from(seen.values());
}

function getNotifierLabel(type: string, subType?: string): string {
  if (type === 'camel' && subType) {
    const subTypeNames: Record<string, string> = {
      slack: 'Slack',
      google_chat: 'Google Chat',
      teams: 'Teams',
      servicenow: 'ServiceNow',
      splunk: 'Splunk',
    };
    return subTypeNames[subType] ?? subType;
  }

  const typeNames: Record<string, string> = {
    email_subscription: 'Email',
    drawer: 'Drawer',
    webhook: 'Webhook',
    ansible: 'Ansible',
    pagerduty: 'PagerDuty',
    camel: 'Integration',
  };
  return typeNames[type] ?? type;
}
