import { defineMessages } from 'react-intl';

export default defineMessages({
  // Page header
  pageTitle: {
    id: 'alertManager.page.title',
    description: 'Alert Manager page title',
    defaultMessage: 'Alert Manager',
  },
  pageDescription: {
    id: 'alertManager.page.description',
    description: 'Alert Manager page description',
    defaultMessage:
      'Manage your alert default settings for your Organization and configure how fired events should alert users and groups through various communication channels.',
  },
  learnMore: {
    id: 'alertManager.page.learnMore',
    description: 'Learn more link text',
    defaultMessage: 'Learn more',
  },

  // Table columns
  eventTypeColumn: {
    id: 'alertManager.table.eventTypeColumn',
    description: 'Event type column header',
    defaultMessage: 'Event type',
  },
  serviceColumn: {
    id: 'alertManager.table.serviceColumn',
    description: 'Service column header',
    defaultMessage: 'Service',
  },

  // Filters
  filterByEventType: {
    id: 'alertManager.filters.eventType',
    description: 'Filter by event type placeholder',
    defaultMessage: 'Filter by event type',
  },
  clearFilters: {
    id: 'alertManager.filters.clear',
    description: 'Clear all filters button text',
    defaultMessage: 'Clear filters',
  },

  // Empty states
  noEventTypes: {
    id: 'alertManager.emptyState.noEventTypes.title',
    description: 'No event types available title',
    defaultMessage: 'No event types',
  },
  noEventTypesDescription: {
    id: 'alertManager.emptyState.noEventTypes.description',
    description: 'No event types available description',
    defaultMessage: 'No event types are currently available.',
  },
  noMatchingEventTypes: {
    id: 'alertManager.emptyState.noMatches.title',
    description: 'No matching event types title',
    defaultMessage: 'No matching event types',
  },
  noMatchingEventTypesDescription: {
    id: 'alertManager.emptyState.noMatches.description',
    description: 'No matching event types description',
    defaultMessage:
      'No event types match the current search criteria. Try adjusting your filters.',
  },

  // Loading state
  loadingEventTypes: {
    id: 'alertManager.loading',
    description: 'Loading event types message',
    defaultMessage: 'Loading event types...',
  },

  // Error state
  errorLoadingEventTypes: {
    id: 'alertManager.error.title',
    description: 'Error loading event types title',
    defaultMessage: 'Unable to load event types',
  },
  errorLoadingEventTypesDescription: {
    id: 'alertManager.error.description',
    description: 'Error loading event types description',
    defaultMessage:
      'There was a problem loading event types. Please try again later.',
  },

  // Pagination
  itemsPerPage: {
    id: 'alertManager.pagination.itemsPerPage',
    description: 'Items per page label',
    defaultMessage: '{count} per page',
  },
  paginationTitle: {
    id: 'alertManager.pagination.title',
    description: 'Pagination navigation aria label',
    defaultMessage: 'Event types pagination',
  },

  // My notifiers column
  myNotifiersColumn: {
    id: 'alertManager.table.myNotifiersColumn',
    description: 'My notifiers column header',
    defaultMessage: 'My notifiers',
  },
  myNotifiersTooltip: {
    id: 'alertManager.table.myNotifiersTooltip',
    description: 'Tooltip explaining what notifiers are',
    defaultMessage:
      'Notifiers are the communication channels configured to alert you when events fire, such as email, Slack, or webhooks.',
  },
  noNotifiers: {
    id: 'alertManager.table.noNotifiers',
    description: 'Label shown when no notifiers are configured',
    defaultMessage: 'No notifiers',
  },
  notifiersError: {
    id: 'alertManager.table.notifiersError',
    description: 'Label shown when notifiers failed to load',
    defaultMessage: 'Unable to load notifiers',
  },

  // Notifier type labels
  notifierEmail: {
    id: 'alertManager.notifier.email',
    description: 'Email notifier label',
    defaultMessage: 'Email',
  },
  notifierDrawer: {
    id: 'alertManager.notifier.drawer',
    description: 'Drawer notifier label',
    defaultMessage: 'Drawer',
  },
  notifierWebhook: {
    id: 'alertManager.notifier.webhook',
    description: 'Webhook notifier label',
    defaultMessage: 'Webhook',
  },
  notifierAnsible: {
    id: 'alertManager.notifier.ansible',
    description: 'Ansible notifier label',
    defaultMessage: 'Ansible',
  },
  notifierPagerDuty: {
    id: 'alertManager.notifier.pagerduty',
    description: 'PagerDuty notifier label',
    defaultMessage: 'PagerDuty',
  },
  notifierIntegration: {
    id: 'alertManager.notifier.integration',
    description: 'Generic camel integration notifier label',
    defaultMessage: 'Integration',
  },
  notifierSlack: {
    id: 'alertManager.notifier.slack',
    description: 'Slack notifier label',
    defaultMessage: 'Slack',
  },
  notifierGoogleChat: {
    id: 'alertManager.notifier.googleChat',
    description: 'Google Chat notifier label',
    defaultMessage: 'Google Chat',
  },
  notifierTeams: {
    id: 'alertManager.notifier.teams',
    description: 'Microsoft Teams notifier label',
    defaultMessage: 'Teams',
  },
  notifierServiceNow: {
    id: 'alertManager.notifier.servicenow',
    description: 'ServiceNow notifier label',
    defaultMessage: 'ServiceNow',
  },
  notifierSplunk: {
    id: 'alertManager.notifier.splunk',
    description: 'Splunk notifier label',
    defaultMessage: 'Splunk',
  },

  // Table aria labels
  tableAriaLabel: {
    id: 'alertManager.table.ariaLabel',
    description: 'Table aria label',
    defaultMessage: 'Alert Manager event types table',
  },
});
