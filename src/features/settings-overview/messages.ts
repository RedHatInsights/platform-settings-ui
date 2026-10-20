import { defineMessages } from 'react-intl';

export default defineMessages({
  // Page header
  pageTitle: {
    id: 'settingsOverview.about.page.title',
    description: 'Settings Overview page title',
    defaultMessage: 'Settings overview',
  },
  pageDescription: {
    id: 'settingsOverview.about.page.description',
    description: 'Settings Overview page description',
    defaultMessage:
      'Manage all things related to eventing, alerting, and data sourcing.',
  },
  learnMore: {
    id: 'settingsOverview.about.page.learnMore',
    description: 'Learn more link text',
    defaultMessage: 'Learn more',
  },

  // Section heading
  sectionHeading: {
    id: 'settingsOverview.about.sectionHeading',
    description: 'Get started section heading',
    defaultMessage: 'Get started with Hybrid Cloud Console Settings',
  },

  // Alert Manager card
  alertManagerTitle: {
    id: 'settingsOverview.about.alertManager.title',
    description: 'Alert Manager card title',
    defaultMessage: 'Alert Manager',
  },
  alertManagerDescription: {
    id: 'settingsOverview.about.alertManager.description',
    description: 'Alert Manager card description',
    defaultMessage:
      'Set up, modify, and view how fired events are being surfaced to you and your team. Our native alert notifiers are designed to fit into your existing communication channels and workflows, with easy configuration of email alerts, in-console notification drawer alerts, and third-party tools including Slack, Google Chat, Microsoft Teams, ServiceNow, Splunk, PagerDuty, Event-Driven Ansible, and direct webhooks.',
  },
  alertManagerButton: {
    id: 'settingsOverview.about.alertManager.button',
    description: 'Alert Manager card button text',
    defaultMessage: 'Manage alerts',
  },

  // Data Integrations card
  dataIntegrationsTitle: {
    id: 'settingsOverview.about.dataIntegrations.title',
    description: 'Data Integrations card title',
    defaultMessage: 'Data Integrations',
  },
  dataIntegrationsDescription: {
    id: 'settingsOverview.about.dataIntegrations.description',
    description: 'Data Integrations card description',
    defaultMessage:
      'Connect your cloud provider accounts to establish data sharing between the Red Hat Hybrid Cloud Cloud Console and Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), and OpenShift Container Platform (OCP).',
  },
  dataIntegrationsButton: {
    id: 'settingsOverview.about.dataIntegrations.button',
    description: 'Data Integrations card button text',
    defaultMessage: 'Manage data integrations',
  },

  // Use cases card
  useCasesTitle: {
    id: 'settingsOverview.about.useCases.title',
    description: 'Use cases card title',
    defaultMessage: 'Use cases',
  },

  // Use case items
  useCase1Title: {
    id: 'settingsOverview.about.useCases.useCase1.title',
    description: 'Use case 1 title',
    defaultMessage: 'Customize your own alert notifiers',
  },
  useCase1Description: {
    id: 'settingsOverview.about.useCases.useCase1.description',
    description: 'Use case 1 description',
    defaultMessage:
      'Determine how you, as an individual user, would like to be made aware of events firing in your Organization. The degree at which a user can customize alert notifiers depends on the roles and permissions determined by Organization admins.',
  },
  useCase1Button: {
    id: 'settingsOverview.about.useCases.useCase1.button',
    description: 'Use case 1 button text',
    defaultMessage: 'Manage my notifiers',
  },

  useCase2Title: {
    id: 'settingsOverview.about.useCases.useCase2.title',
    description: 'Use case 2 title',
    defaultMessage: 'Manage the default alert settings for your Organization',
  },
  useCase2Description: {
    id: 'settingsOverview.about.useCases.useCase2.description',
    description: 'Use case 2 description',
    defaultMessage:
      'Configure alert notifications for your entire Organization. Determine which events trigger notifications, how they are delivered, and who receives them across all users.',
  },
  useCase2Button: {
    id: 'settingsOverview.about.useCases.useCase2.button',
    description: 'Use case 2 button text',
    defaultMessage: 'Manage Organization notifiers',
  },

  useCase3Title: {
    id: 'settingsOverview.about.useCases.useCase3.title',
    description: 'Use case 3 title',
    defaultMessage: 'View all fired events in your Organization',
  },
  useCase3Description: {
    id: 'settingsOverview.about.useCases.useCase3.description',
    description: 'Use case 3 description',
    defaultMessage:
      "View a log of all fired events across your Organization, regardless of the alert notifiers you've enabled.",
  },
  useCase3Button: {
    id: 'settingsOverview.about.useCases.useCase3.button',
    description: 'Use case 3 button text',
    defaultMessage: 'View event log',
  },

  useCase4Title: {
    id: 'settingsOverview.about.useCases.useCase4.title',
    description: 'Use case 4 title',
    defaultMessage: 'Integrate data from popular cloud providers',
  },
  useCase4Description: {
    id: 'settingsOverview.about.useCases.useCase4.description',
    description: 'Use case 4 description',
    defaultMessage:
      'Sync up your data sources from other popular cloud providers including OpenShift Container Platform, Microsoft Azure, Amazon Web Services (AWS), Google Cloud Platform (GCP), IBM Cloud, and Oracle Cloud Infrastructure.',
  },
  useCase4Button: {
    id: 'settingsOverview.about.useCases.useCase4.button',
    description: 'Use case 4 button text',
    defaultMessage: 'Manage data integrations',
  },

  // Recommended content card
  recommendedContentTitle: {
    id: 'settingsOverview.about.recommendedContent.title',
    description: 'Recommended content card title',
    defaultMessage: 'Recommended content',
  },

  // Recommended content items
  recommendedItem1: {
    id: 'settingsOverview.about.recommendedContent.item1',
    description: 'Recommended content item 1',
    defaultMessage: 'Getting started with Alert Manager',
  },
  recommendedItem2: {
    id: 'settingsOverview.about.recommendedContent.item2',
    description: 'Recommended content item 2',
    defaultMessage: 'Data Integrations best practices',
  },
  recommendedItem3: {
    id: 'settingsOverview.about.recommendedContent.item3',
    description: 'Recommended content item 3',
    defaultMessage: 'Settings documentation',
  },
});
