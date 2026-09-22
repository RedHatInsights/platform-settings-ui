import { defineMessages } from 'react-intl';

export default defineMessages({
  // Page header
  pageTitle: {
    id: 'dataIntegrations.page.title',
    description: 'Data Integrations page title',
    defaultMessage: 'Data Integrations',
  },
  pageDescription: {
    id: 'dataIntegrations.page.description',
    description: 'Data Integrations page subtitle',
    defaultMessage:
      'Manage your sourcing and sharing with popular cloud providers.',
  },
  learnMore: {
    id: 'dataIntegrations.page.learnMore',
    description: 'Learn more link text',
    defaultMessage: 'Learn more',
  },

  // Tabs
  myDataIntegrationsTab: {
    id: 'dataIntegrations.tabs.myDataIntegrations',
    description: 'My data integrations tab label',
    defaultMessage: 'My data integrations',
  },
  aboutTab: {
    id: 'dataIntegrations.tabs.about',
    description: 'About tab label',
    defaultMessage: 'About',
  },
  tabsAriaLabel: {
    id: 'dataIntegrations.tabs.ariaLabel',
    description: 'Aria label for the Data Integrations tab navigation',
    defaultMessage: 'Data Integrations tabs',
  },

  // Add data integration dropdown
  addDataIntegration: {
    id: 'dataIntegrations.add.toggle',
    description: 'Add data integration dropdown toggle label',
    defaultMessage: 'Add data integration',
  },
  redHatIntegrationsGroup: {
    id: 'dataIntegrations.add.group.redHat',
    description: 'Red Hat integrations dropdown group heading',
    defaultMessage: 'Red Hat integrations',
  },
  otherCloudProvidersGroup: {
    id: 'dataIntegrations.add.group.otherCloudProviders',
    description: 'Other cloud providers dropdown group heading',
    defaultMessage: 'Other cloud providers',
  },

  // Provider names
  openshiftLabel: {
    id: 'dataIntegrations.provider.openshift',
    description: 'OpenShift Container Platform provider name',
    defaultMessage: 'OpenShift Container Platform',
  },
  amazonLabel: {
    id: 'dataIntegrations.provider.amazon',
    description: 'Amazon Web Services provider name',
    defaultMessage: 'Amazon Web Services',
  },
  googleLabel: {
    id: 'dataIntegrations.provider.google',
    description: 'Google Cloud Platform provider name',
    defaultMessage: 'Google Cloud Platform',
  },
  azureLabel: {
    id: 'dataIntegrations.provider.azure',
    description: 'Microsoft Azure provider name',
    defaultMessage: 'Microsoft Azure',
  },

  // Availability status labels.
  //
  // Island-level rather than per-feature: the table and the detail page both
  // render them, and when they each owned a copy they drifted — the table said
  // "Available" where the detail page said "Active" for the same source.
  statusAvailable: {
    id: 'dataIntegrations.status.available',
    description: 'Status badge label for a healthy source',
    defaultMessage: 'Available',
  },
  statusInProgress: {
    id: 'dataIntegrations.status.inProgress',
    description: 'Status badge label while the availability check runs',
    defaultMessage: 'In progress',
  },
  statusPartiallyAvailable: {
    id: 'dataIntegrations.status.partiallyAvailable',
    description: 'Status badge label when some applications are unhealthy',
    defaultMessage: 'Partially available',
  },
  statusUnavailable: {
    id: 'dataIntegrations.status.unavailable',
    description: 'Status badge label for a failing source',
    defaultMessage: 'Unavailable',
  },
  statusPaused: {
    id: 'dataIntegrations.status.paused',
    description: 'Status badge label for a paused source',
    defaultMessage: 'Paused',
  },
  statusUnknown: {
    id: 'dataIntegrations.status.unknown',
    description:
      'Status badge label when the availability checker has not run yet',
    defaultMessage: 'Unknown',
  },

  // Placeholder wizard (removed once the real wizard lands)
  wizardPlaceholderTitle: {
    id: 'dataIntegrations.wizardPlaceholder.title',
    description: 'Placeholder creation wizard modal title',
    defaultMessage: 'Add data integration',
  },
  wizardPlaceholderBody: {
    id: 'dataIntegrations.wizardPlaceholder.body',
    description: 'Placeholder creation wizard modal body',
    defaultMessage:
      'The creation wizard for {provider} is not available yet. It will be added in a follow-up release.',
  },
  wizardPlaceholderClose: {
    id: 'dataIntegrations.wizardPlaceholder.close',
    description: 'Placeholder creation wizard close button',
    defaultMessage: 'Close',
  },

  // Tab placeholders (removed by RHCLOUD-50925 / RHCLOUD-49534)
  myDataIntegrationsPlaceholder: {
    id: 'dataIntegrations.myDataIntegrations.placeholder',
    description: 'Placeholder text for the not-yet-built integrations table',
    defaultMessage: 'The data integrations table is coming soon.',
  },
  aboutPlaceholder: {
    id: 'dataIntegrations.about.placeholder',
    description: 'Placeholder text for the not-yet-built About tab',
    defaultMessage: 'Data integration onboarding content is coming soon.',
  },
});
