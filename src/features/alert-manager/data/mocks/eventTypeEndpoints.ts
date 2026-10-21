import { HttpResponse, http, delay as mswDelay } from 'msw';
import type { EndpointInfo } from '../../types';

const API_BASE = '/api/integrations/v3.0';

/**
 * Mock endpoints keyed by event type ID.
 */
export const mockEndpointsByEventType: Record<string, EndpointInfo[]> = {
  '1': [
    {
      id: 'ep-email-1',
      type: 'email_subscription',
      name: 'Email alerts',
      enabled: true,
    },
    {
      id: 'ep-slack-1',
      type: 'camel',
      sub_type: 'slack',
      name: 'Slack #alerts',
      enabled: true,
    },
  ],
  '2': [
    {
      id: 'ep-webhook-1',
      type: 'webhook',
      name: 'Splunk HEC',
      enabled: true,
    },
    {
      id: 'ep-email-2',
      type: 'email_subscription',
      name: 'Email alerts',
      enabled: true,
    },
    {
      id: 'ep-teams-1',
      type: 'camel',
      sub_type: 'teams',
      name: 'MS Teams',
      enabled: true,
    },
  ],
  '3': [
    {
      id: 'ep-gchat-1',
      type: 'camel',
      sub_type: 'google_chat',
      name: 'Google Chat ops',
      enabled: true,
    },
  ],
  '4': [], // No notifiers configured
  '5': [
    {
      id: 'ep-email-5',
      type: 'email_subscription',
      name: 'Email',
      enabled: true,
    },
    {
      id: 'ep-drawer-5',
      type: 'drawer',
      name: 'Notification drawer',
      enabled: true,
    },
    {
      id: 'ep-pd-5',
      type: 'pagerduty',
      name: 'PagerDuty',
      enabled: true,
    },
    {
      id: 'ep-slack-5',
      type: 'camel',
      sub_type: 'slack',
      name: 'Slack',
      enabled: true,
    },
    {
      id: 'ep-disabled',
      type: 'webhook',
      name: 'Disabled webhook',
      enabled: false,
    },
  ],
  '6': [
    {
      id: 'ep-email-6',
      type: 'email_subscription',
      name: 'Email',
      enabled: true,
    },
  ],
  '7': [], // No notifiers
  '8': [
    {
      id: 'ep-ansible-8',
      type: 'ansible',
      name: 'Event-Driven Ansible',
      enabled: true,
    },
  ],
  '9': [], // No notifiers
  '10': [
    {
      id: 'ep-webhook-10',
      type: 'webhook',
      name: 'Webhook',
      enabled: true,
    },
    {
      id: 'ep-slack-10',
      type: 'camel',
      sub_type: 'slack',
      name: 'Slack',
      enabled: true,
    },
  ],
};

export const eventTypeEndpointsHandlers = {
  /**
   * Returns all enabled endpoints with their linked event types.
   */
  success: () =>
    http.get(`${API_BASE}/endpoints`, () => {
      const endpoints = Object.entries(mockEndpointsByEventType).flatMap(
        ([eventTypeId, eventTypeEndpoints]) =>
          eventTypeEndpoints.map((endpoint) => ({
            ...endpoint,
            event_types_group_by_bundles_and_applications: [
              {
                applications: [{ event_types: [{ id: eventTypeId }] }],
              },
            ],
          })),
      );
      return HttpResponse.json({
        data: endpoints,
        links: {},
        meta: { count: endpoints.length },
      });
    }),

  /** All event types return empty (no notifiers configured). */
  empty: () =>
    http.get(`${API_BASE}/endpoints`, () =>
      HttpResponse.json({ data: [], links: {}, meta: { count: 0 } }),
    ),

  /** Simulate loading delay. */
  loading: () =>
    http.get(`${API_BASE}/endpoints`, async () => {
      await mswDelay('infinite');
    }),

  /** Simulate API error. */
  error: () =>
    http.get(`${API_BASE}/endpoints`, () =>
      HttpResponse.json({ error: 'Internal server error' }, { status: 500 }),
    ),
};
