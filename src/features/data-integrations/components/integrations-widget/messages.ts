import { defineMessages } from 'react-intl';

export default defineMessages({
  widgetTitle: {
    id: 'dataIntegrationsWidget.title',
    description: 'Data Integrations widget title',
    defaultMessage: 'Data integrations',
  },
  manageIntegrations: {
    id: 'dataIntegrationsWidget.manageIntegrations',
    description: 'Manage integrations link text',
    defaultMessage: 'Manage integrations',
  },
  addButton: {
    id: 'dataIntegrationsWidget.addButton',
    description: 'Add button label',
    defaultMessage: 'Add',
  },
  integrationCount: {
    id: 'dataIntegrationsWidget.integrationCount',
    description: 'Number of integrations for a provider',
    defaultMessage:
      '{count, plural, =0 {0 integrations} one {1 integration} other {{count} integrations}}',
  },
  amazonWebServices: {
    id: 'dataIntegrationsWidget.provider.aws',
    description: 'Amazon Web Services provider name',
    defaultMessage: 'Amazon Web Services',
  },
  microsoftAzure: {
    id: 'dataIntegrationsWidget.provider.azure',
    description: 'Microsoft Azure provider name',
    defaultMessage: 'Microsoft Azure',
  },
  googleCloudPlatform: {
    id: 'dataIntegrationsWidget.provider.googleCloud',
    description: 'Google Cloud Platform provider name',
    defaultMessage: 'Google Cloud Platform',
  },
  openshiftContainerPlatform: {
    id: 'dataIntegrationsWidget.provider.openshift',
    description: 'OpenShift Container Platform provider name',
    defaultMessage: 'OpenShift Container Platform',
  },
  loadingIntegrations: {
    id: 'dataIntegrationsWidget.loading',
    description: 'Loading state message',
    defaultMessage: 'Loading integrations...',
  },
});
