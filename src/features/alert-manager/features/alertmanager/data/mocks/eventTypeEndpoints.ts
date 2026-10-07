import { HttpResponse, http, delay as mswDelay } from 'msw';
import type { BehaviorGroup } from '../../types';

const API_BASE = '/api/notifications/v1.0';

/**
 * Mock behavior groups keyed by event type ID.
 * Each behavior group contains actions with endpoint info.
 */
export const mockBehaviorGroupsByEventType: Record<string, BehaviorGroup[]> = {
  '1': [
    {
      id: 'bg-1',
      display_name: 'Instant notifications',
      actions: [
        {
          endpoint: {
            id: 'ep-email-1',
            type: 'email_subscription',
            name: 'Email alerts',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-slack-1',
            type: 'camel',
            sub_type: 'slack',
            name: 'Slack #alerts',
            enabled: true,
          },
        },
      ],
    },
  ],
  '2': [
    {
      id: 'bg-2',
      display_name: 'Webhook integrations',
      actions: [
        {
          endpoint: {
            id: 'ep-webhook-1',
            type: 'webhook',
            name: 'Splunk HEC',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-email-2',
            type: 'email_subscription',
            name: 'Email alerts',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-teams-1',
            type: 'camel',
            sub_type: 'teams',
            name: 'MS Teams',
            enabled: true,
          },
        },
      ],
    },
  ],
  '3': [
    {
      id: 'bg-3',
      display_name: 'Google Chat alerts',
      actions: [
        {
          endpoint: {
            id: 'ep-gchat-1',
            type: 'camel',
            sub_type: 'google_chat',
            name: 'Google Chat ops',
            enabled: true,
          },
        },
      ],
    },
  ],
  '4': [], // No notifiers configured
  '5': [
    {
      id: 'bg-5',
      display_name: 'All channels',
      actions: [
        {
          endpoint: {
            id: 'ep-email-5',
            type: 'email_subscription',
            name: 'Email',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-drawer-5',
            type: 'drawer',
            name: 'Notification drawer',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-pd-5',
            type: 'pagerduty',
            name: 'PagerDuty',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-slack-5',
            type: 'camel',
            sub_type: 'slack',
            name: 'Slack',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-disabled',
            type: 'webhook',
            name: 'Disabled webhook',
            enabled: false,
          },
        },
      ],
    },
  ],
  '6': [
    {
      id: 'bg-6',
      display_name: 'Email only',
      actions: [
        {
          endpoint: {
            id: 'ep-email-6',
            type: 'email_subscription',
            name: 'Email',
            enabled: true,
          },
        },
      ],
    },
  ],
  '7': [], // No notifiers
  '8': [
    {
      id: 'bg-8',
      display_name: 'Ansible automation',
      actions: [
        {
          endpoint: {
            id: 'ep-ansible-8',
            type: 'ansible',
            name: 'Event-Driven Ansible',
            enabled: true,
          },
        },
      ],
    },
  ],
  '9': [], // No notifiers
  '10': [
    {
      id: 'bg-10',
      display_name: 'Webhook + Slack',
      actions: [
        {
          endpoint: {
            id: 'ep-webhook-10',
            type: 'webhook',
            name: 'Webhook',
            enabled: true,
          },
        },
        {
          endpoint: {
            id: 'ep-slack-10',
            type: 'camel',
            sub_type: 'slack',
            name: 'Slack',
            enabled: true,
          },
        },
      ],
    },
  ],
};

export const eventTypeEndpointsHandlers = {
  /**
   * Returns behavior groups from the mock map for each event type.
   */
  success: () =>
    http.get(
      `${API_BASE}/notifications/eventTypes/:eventTypeId/behaviorGroups`,
      ({ params }) => {
        const { eventTypeId } = params;
        const groups =
          mockBehaviorGroupsByEventType[eventTypeId as string] ?? [];
        return HttpResponse.json(groups);
      },
    ),

  /** All event types return empty (no notifiers configured). */
  empty: () =>
    http.get(
      `${API_BASE}/notifications/eventTypes/:eventTypeId/behaviorGroups`,
      () => HttpResponse.json([]),
    ),

  /** Simulate loading delay. */
  loading: () =>
    http.get(
      `${API_BASE}/notifications/eventTypes/:eventTypeId/behaviorGroups`,
      async () => {
        await mswDelay('infinite');
      },
    ),

  /** Simulate API error. */
  error: () =>
    http.get(
      `${API_BASE}/notifications/eventTypes/:eventTypeId/behaviorGroups`,
      () =>
        HttpResponse.json({ error: 'Internal server error' }, { status: 500 }),
    ),
};
