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

  // Creation wizard shell
  wizardTitle: {
    id: 'dataIntegrations.wizard.title',
    description: 'Add data integration wizard title',
    defaultMessage: 'Add data integration',
  },
  wizardDescription: {
    id: 'dataIntegrations.wizard.description',
    description: 'Add data integration wizard subtitle',
    defaultMessage:
      'Configure an integration to start importing data from your provider.',
  },
  wizardClose: {
    id: 'dataIntegrations.wizard.close',
    description: 'Aria label for the wizard header close button',
    defaultMessage: 'Close wizard',
  },
  wizardNext: {
    id: 'dataIntegrations.wizard.next',
    description: 'Wizard Next button',
    defaultMessage: 'Next',
  },
  wizardBack: {
    id: 'dataIntegrations.wizard.back',
    description: 'Wizard Back button',
    defaultMessage: 'Back',
  },
  wizardCancel: {
    id: 'dataIntegrations.wizard.cancel',
    description: 'Wizard Cancel button',
    defaultMessage: 'Cancel',
  },
  // Source type selection step
  wizardSourceTypeStepTitle: {
    id: 'dataIntegrations.wizard.sourceType.stepTitle',
    description: 'Title of the source type selection wizard step',
    defaultMessage: 'Select integration type',
  },
  wizardSourceTypeStepDescription: {
    id: 'dataIntegrations.wizard.sourceType.stepDescription',
    description: 'Introductory text above the source type cards',
    defaultMessage:
      'To import data for an application, you need to configure an integration. Start by selecting the type of integration you want to add.',
  },
  wizardSourceTypeLabel: {
    id: 'dataIntegrations.wizard.sourceType.label',
    description:
      'Label for the source type card group, read as the radio group name',
    defaultMessage: 'Integration type',
  },
  wizardSourceTypeRequired: {
    id: 'dataIntegrations.wizard.sourceType.required',
    description: 'Validation message when no source type card is selected',
    defaultMessage: 'Select an integration type to continue.',
  },

  // Name integration step
  wizardNameStepTitle: {
    id: 'dataIntegrations.wizard.name.stepTitle',
    description: 'Title of the integration naming wizard step',
    defaultMessage: 'Name integration',
  },
  wizardNameStepDescription: {
    id: 'dataIntegrations.wizard.name.stepDescription',
    description: 'Introductory text above the integration name field',
    defaultMessage: 'Enter a name for your {provider} integration.',
  },
  wizardNameLabel: {
    id: 'dataIntegrations.wizard.name.label',
    description: 'Label for the integration name field',
    defaultMessage: 'Integration name',
  },
  wizardNamePlaceholder: {
    id: 'dataIntegrations.wizard.name.placeholder',
    description: 'Placeholder shown in the empty integration name field',
    defaultMessage: 'integration_name',
  },
  wizardNameRequired: {
    id: 'dataIntegrations.wizard.name.required',
    description: 'Validation message when the integration name is empty',
    defaultMessage: 'Enter a name for your integration.',
  },

  // Wizard loading and error states
  wizardLoading: {
    id: 'dataIntegrations.wizard.loading',
    description: 'Accessible label for the spinner shown while providers load',
    defaultMessage: 'Loading integration types',
  },
  wizardErrorTitle: {
    id: 'dataIntegrations.wizard.error.title',
    description: 'Title shown when the provider catalogue fails to load',
    defaultMessage: 'Unable to load integration types',
  },
  wizardErrorBody: {
    id: 'dataIntegrations.wizard.error.body',
    description: 'Body shown when the provider catalogue fails to load',
    defaultMessage:
      'The list of integration types could not be retrieved. Close the wizard and try again.',
  },
  wizardErrorClose: {
    id: 'dataIntegrations.wizard.error.close',
    description: 'Button that dismisses the wizard from its error state',
    defaultMessage: 'Close',
  },

  // Cancel confirmation
  wizardCancelTitle: {
    id: 'dataIntegrations.wizard.cancelConfirm.title',
    description: 'Title of the confirmation shown when cancelling the wizard',
    defaultMessage: 'Exit integration creation?',
  },
  wizardCancelBody: {
    id: 'dataIntegrations.wizard.cancelConfirm.body',
    description: 'Body of the confirmation shown when cancelling the wizard',
    defaultMessage:
      'Are you sure you want to cancel? Your integration will not be created and any progress will be lost.',
  },
  wizardCancelConfirm: {
    id: 'dataIntegrations.wizard.cancelConfirm.confirm',
    description: 'Button that confirms exiting the wizard',
    defaultMessage: 'Exit',
  },
  wizardCancelDismiss: {
    id: 'dataIntegrations.wizard.cancelConfirm.dismiss',
    description: 'Button that returns to the wizard instead of exiting',
    defaultMessage: 'Stay',
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
