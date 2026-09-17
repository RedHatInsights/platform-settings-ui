import { defineMessages } from 'react-intl';

export default defineMessages({
  // Status labels
  statusActive: {
    id: 'dataIntegrations.sourceDetail.status.active',
    description: 'Status label for available/active sources',
    defaultMessage: 'Active',
  },
  statusInProgress: {
    id: 'dataIntegrations.sourceDetail.status.inProgress',
    description: 'Status label for sources being checked',
    defaultMessage: 'In progress',
  },
  statusPaused: {
    id: 'dataIntegrations.sourceDetail.status.paused',
    description: 'Status label for paused sources',
    defaultMessage: 'Paused',
  },
  statusUnavailable: {
    id: 'dataIntegrations.sourceDetail.status.unavailable',
    description: 'Status label for unavailable sources',
    defaultMessage: 'Unavailable',
  },
  statusPartiallyAvailable: {
    id: 'dataIntegrations.sourceDetail.status.partiallyAvailable',
    description: 'Status label for partially available sources',
    defaultMessage: 'Partially available',
  },

  // Metadata labels
  lastModified: {
    id: 'dataIntegrations.sourceDetail.metadata.lastModified',
    description: 'Label for last modified timestamp',
    defaultMessage: 'Last modified',
  },
  lastAvailabilityCheck: {
    id: 'dataIntegrations.sourceDetail.metadata.lastAvailabilityCheck',
    description: 'Label for last availability check',
    defaultMessage: 'Last availability check',
  },
  waitingForUpdate: {
    id: 'dataIntegrations.sourceDetail.metadata.waitingForUpdate',
    description: 'Status when availability checker has not run yet',
    defaultMessage: 'Waiting for update',
  },
  checkedAgo: {
    id: 'dataIntegrations.sourceDetail.metadata.checkedAgo',
    description: 'Checked timestamp with relative time',
    defaultMessage: 'Checked {time}',
  },
  justNow: {
    id: 'dataIntegrations.sourceDetail.metadata.justNow',
    description: 'Relative time for very recent timestamps',
    defaultMessage: 'Just now',
  },
  checkingAvailabilityAriaLabel: {
    id: 'dataIntegrations.sourceDetail.metadata.checkingAvailabilityAriaLabel',
    description: 'Aria label for spinner when checking availability',
    defaultMessage: 'Checking availability',
  },

  // Form field labels
  nameLabel: {
    id: 'dataIntegrations.sourceDetail.form.name',
    description: 'Label for source name field',
    defaultMessage: 'Name',
  },
  dateAddedLabel: {
    id: 'dataIntegrations.sourceDetail.form.dateAdded',
    description: 'Label for date added field',
    defaultMessage: 'Date added',
  },
  configurationModeLabel: {
    id: 'dataIntegrations.sourceDetail.form.configurationMode',
    description: 'Label for configuration mode field',
    defaultMessage: 'Configuration mode',
  },
  integrationTypeLabel: {
    id: 'dataIntegrations.sourceDetail.form.integrationType',
    description: 'Label for integration type field',
    defaultMessage: 'Integration type',
  },

  // Configuration mode values
  manualConfiguration: {
    id: 'dataIntegrations.sourceDetail.configMode.manual',
    description: 'Manual configuration mode',
    defaultMessage: 'Manual configuration',
  },
  accountAuthorization: {
    id: 'dataIntegrations.sourceDetail.configMode.accountAuth',
    description: 'Account authorization mode',
    defaultMessage: 'Account authorization',
  },
  unknown: {
    id: 'dataIntegrations.sourceDetail.configMode.unknown',
    description: 'Unknown configuration mode',
    defaultMessage: 'Unknown',
  },

  // Actions
  pauseAction: {
    id: 'dataIntegrations.sourceDetail.actions.pause',
    description: 'Pause action in dropdown',
    defaultMessage: 'Pause',
  },
  pauseActionDescription: {
    id: 'dataIntegrations.sourceDetail.actions.pauseDescription',
    description: 'Description for pause action',
    defaultMessage: 'Temporarily disable data connection',
  },
  pauseDisabledDescription: {
    id: 'dataIntegrations.sourceDetail.actions.pauseDisabledDescription',
    description:
      'Description for disabled pause action during availability check',
    defaultMessage: 'Cannot pause while availability check is in progress',
  },
  resumeAction: {
    id: 'dataIntegrations.sourceDetail.actions.resume',
    description: 'Resume action in dropdown',
    defaultMessage: 'Resume',
  },
  deleteAction: {
    id: 'dataIntegrations.sourceDetail.actions.delete',
    description: 'Delete action in dropdown',
    defaultMessage: 'Delete',
  },
  deleteActionDescription: {
    id: 'dataIntegrations.sourceDetail.actions.deleteDescription',
    description: 'Description for delete action',
    defaultMessage:
      'Permanently delete this integration and all collected data',
  },
  saveButton: {
    id: 'dataIntegrations.sourceDetail.actions.save',
    description: 'Save button text',
    defaultMessage: 'Save',
  },
  cancelButton: {
    id: 'dataIntegrations.sourceDetail.actions.cancel',
    description: 'Cancel button text',
    defaultMessage: 'Cancel',
  },
  actionsLabel: {
    id: 'dataIntegrations.sourceDetail.actions.label',
    description: 'Actions dropdown aria label',
    defaultMessage: 'Actions',
  },
  pauseModalTitle: {
    id: 'dataIntegrations.sourceDetail.actions.pauseModalTitle',
    description: 'Title for pause data integration modal',
    defaultMessage: 'Pause data integration',
  },
  resumeModalTitle: {
    id: 'dataIntegrations.sourceDetail.actions.resumeModalTitle',
    description: 'Title for resume data integration modal',
    defaultMessage: 'Resume data integration',
  },
  okButton: {
    id: 'dataIntegrations.sourceDetail.actions.okButton',
    description: 'OK button text for modals',
    defaultMessage: 'OK',
  },
  fallbackIconAlt: {
    id: 'dataIntegrations.sourceDetail.fallbackIconAlt',
    description:
      'Fallback alt text for source type icon when name is unavailable',
    defaultMessage: 'Source type {id}',
  },

  // Toast messages (deferred functionality)
  saveComingSoon: {
    id: 'dataIntegrations.sourceDetail.toast.saveComingSoon',
    description: 'Toast message for save functionality coming soon',
    defaultMessage: 'Save functionality coming soon',
  },
  pauseComingSoon: {
    id: 'dataIntegrations.sourceDetail.toast.pauseComingSoon',
    description: 'Toast message for pause functionality coming soon',
    defaultMessage: 'Pause functionality coming soon',
  },
  deleteComingSoon: {
    id: 'dataIntegrations.sourceDetail.toast.deleteComingSoon',
    description: 'Toast message for delete functionality coming soon',
    defaultMessage: 'Delete functionality coming soon',
  },
  editNameComingSoon: {
    id: 'dataIntegrations.sourceDetail.toast.editNameComingSoon',
    description: 'Tooltip for edit name coming soon',
    defaultMessage: 'Edit name coming soon',
  },

  // Confirmation dialog
  deleteConfirmTitle: {
    id: 'dataIntegrations.sourceDetail.deleteConfirm.title',
    description: 'Delete confirmation dialog title',
    defaultMessage: 'Delete data integration?',
  },
  deleteConfirmMessage: {
    id: 'dataIntegrations.sourceDetail.deleteConfirm.message',
    description: 'Delete confirmation dialog message',
    defaultMessage:
      'This will permanently delete {name} and disconnect all applications. This action cannot be undone.',
  },
  deleteConfirmButton: {
    id: 'dataIntegrations.sourceDetail.deleteConfirm.confirm',
    description: 'Delete confirmation button',
    defaultMessage: 'Delete',
  },
  deleteConfirmCancel: {
    id: 'dataIntegrations.sourceDetail.deleteConfirm.cancel',
    description: 'Delete confirmation cancel button',
    defaultMessage: 'Cancel',
  },

  // Connected applications section
  connectedApplicationsTitle: {
    id: 'dataIntegrations.sourceDetail.connectedApps.title',
    description: 'Connected applications section title',
    defaultMessage: 'Connected applications',
  },
  noApplicationsConnected: {
    id: 'dataIntegrations.sourceDetail.connectedApps.none',
    description: 'Message when no applications are connected',
    defaultMessage: 'No applications connected',
  },
  applicationFieldsReadOnly: {
    id: 'dataIntegrations.sourceDetail.connectedApps.fieldsReadOnly',
    description: 'Helper text for fields set via API',
    defaultMessage:
      'Value cannot be modified since it has been set using the API',
  },
  clusterIdentifierLabel: {
    id: 'dataIntegrations.sourceDetail.connectedApps.clusterIdentifier',
    description: 'Label for cluster identifier field',
    defaultMessage: 'Cluster Identifier',
  },

  // Error states
  sourceNotFoundTitle: {
    id: 'dataIntegrations.sourceDetail.error.notFound.title',
    description: 'Error title when source is not found',
    defaultMessage: 'Source not found',
  },
  sourceNotFoundMessage: {
    id: 'dataIntegrations.sourceDetail.error.notFound.message',
    description: 'Error message when source is not found',
    defaultMessage:
      'The data integration you are looking for does not exist or has been deleted.',
  },
  backToListLink: {
    id: 'dataIntegrations.sourceDetail.error.backToList',
    description: 'Link to go back to data integrations list',
    defaultMessage: 'Back to data integrations',
  },
  loadFailedTitle: {
    id: 'dataIntegrations.sourceDetail.error.loadFailed.title',
    description: 'Error title when source fails to load',
    defaultMessage: 'Failed to load data integration',
  },
  loadFailedMessage: {
    id: 'dataIntegrations.sourceDetail.error.loadFailed.message',
    description: 'Error message when source fails to load',
    defaultMessage:
      'An error occurred while loading the data integration. Please try again.',
  },
  retryButton: {
    id: 'dataIntegrations.sourceDetail.error.retry',
    description: 'Retry button for failed load',
    defaultMessage: 'Retry',
  },
});
