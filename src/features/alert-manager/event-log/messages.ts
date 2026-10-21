import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'eventLog.pageTitle',
    defaultMessage: 'Event log',
  },
  pageSubtitle: {
    id: 'eventLog.pageSubtitle',
    defaultMessage: 'View events firing in your organization.',
  },
  breadcrumbSettings: {
    id: 'eventLog.breadcrumb.settings',
    defaultMessage: 'Settings',
  },
  breadcrumbEventLog: {
    id: 'eventLog.breadcrumb.eventLog',
    defaultMessage: 'Event Log',
  },
  dateToday: {
    id: 'eventLog.date.today',
    defaultMessage: 'Today',
  },
  dateYesterday: {
    id: 'eventLog.date.yesterday',
    defaultMessage: 'Yesterday',
  },
  dateLast7: {
    id: 'eventLog.date.last7',
    defaultMessage: 'Last 7 days',
  },
  dateLast14: {
    id: 'eventLog.date.last14',
    defaultMessage: 'Last 14 days',
  },
  columnEventType: {
    id: 'eventLog.column.eventType',
    defaultMessage: 'Event type',
  },
  columnService: {
    id: 'eventLog.column.service',
    defaultMessage: 'Service',
  },
  columnSeverity: {
    id: 'eventLog.column.severity',
    defaultMessage: 'Severity',
  },
  columnDateTimeFired: {
    id: 'eventLog.column.dateTimeFired',
    defaultMessage: 'Date and time fired',
  },
  columnNotifiers: {
    id: 'eventLog.column.notifiers',
    defaultMessage: 'Notifiers triggered',
  },
  filterEvent: {
    id: 'eventLog.filter.event',
    defaultMessage: 'Event',
  },
  filterEventPlaceholder: {
    id: 'eventLog.filter.event.placeholder',
    defaultMessage: 'Filter by event name',
  },
  filterService: {
    id: 'eventLog.filter.service',
    defaultMessage: 'Service',
  },
  filterServicePlaceholder: {
    id: 'eventLog.filter.service.placeholder',
    defaultMessage: 'Filter by service',
  },
  filterSeverity: {
    id: 'eventLog.filter.severity',
    defaultMessage: 'Severity',
  },
  noNotifiers: {
    id: 'eventLog.noNotifiers',
    defaultMessage: 'No notifiers',
  },
  severityCritical: {
    id: 'eventLog.severity.critical',
    defaultMessage: 'Critical',
  },
  severityImportant: {
    id: 'eventLog.severity.important',
    defaultMessage: 'Important',
  },
  severityModerate: {
    id: 'eventLog.severity.moderate',
    defaultMessage: 'Moderate',
  },
  severityLow: {
    id: 'eventLog.severity.low',
    defaultMessage: 'Low',
  },
  severityNone: {
    id: 'eventLog.severity.none',
    defaultMessage: 'None',
  },
  severityUndefined: {
    id: 'eventLog.severity.undefined',
    defaultMessage: 'Undefined',
  },
  endpointEmail: {
    id: 'eventLog.endpoint.email',
    defaultMessage: 'Email',
  },
  endpointDrawer: {
    id: 'eventLog.endpoint.drawer',
    defaultMessage: 'Drawer',
  },
  endpointWebhook: {
    id: 'eventLog.endpoint.webhook',
    defaultMessage: 'Webhook',
  },
  endpointAnsible: {
    id: 'eventLog.endpoint.ansible',
    defaultMessage: 'Ansible',
  },
  endpointPagerDuty: {
    id: 'eventLog.endpoint.pagerduty',
    defaultMessage: 'PagerDuty',
  },
  endpointIntegration: {
    id: 'eventLog.endpoint.integration',
    defaultMessage: 'Integration',
  },
  statusSuccess: {
    id: 'eventLog.status.success',
    defaultMessage: 'Success',
  },
  statusSent: {
    id: 'eventLog.status.sent',
    defaultMessage: 'Sent',
  },
  statusProcessing: {
    id: 'eventLog.status.processing',
    defaultMessage: 'Processing',
  },
  statusFailed: {
    id: 'eventLog.status.failed',
    defaultMessage: 'Failed',
  },
  rowActionPreferences: {
    id: 'eventLog.rowAction.preferences',
    defaultMessage: 'Manage my own alert preferences',
  },
  rowActionOrgSettings: {
    id: 'eventLog.rowAction.orgSettings',
    defaultMessage: 'Manage organization default settings',
  },
  rowActionsLabel: {
    id: 'eventLog.rowActions.label',
    defaultMessage: 'Row actions',
  },
  orgAdminRequired: {
    id: 'eventLog.orgAdminRequired',
    defaultMessage: 'Org admin access required to view all organization events',
  },
  emptyStateNoResultsTitle: {
    id: 'eventLog.emptyState.noResults.title',
    defaultMessage: 'No events found',
  },
  emptyStateNoResultsBody: {
    id: 'eventLog.emptyState.noResults.body',
    defaultMessage:
      'No events match your current filters. Try adjusting your filters or date range.',
  },
  tableAriaLabel: {
    id: 'eventLog.table.ariaLabel',
    defaultMessage: 'Event log',
  },
});
