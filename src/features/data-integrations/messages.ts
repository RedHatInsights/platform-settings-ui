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
  amazonShortLabel: {
    id: 'dataIntegrations.provider.amazonShort',
    description: 'Short Amazon Web Services provider name for wizard titles',
    defaultMessage: 'AWS',
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

  // Permission state shared by the About and My data integrations views.
  permissionsAlertTitle: {
    id: 'dataIntegrations.permissionsAlert.title',
    description: 'Title of the integration permissions alert',
    defaultMessage: 'Need to create an integration?',
  },
  permissionsAlertDescription: {
    id: 'dataIntegrations.permissionsAlert.description',
    description: 'Description of the integration permissions alert',
    defaultMessage:
      'You do not have the permissions for integration management. Contact your organization admin if you need these permissions updated.',
  },
  permissionsAlertLink: {
    id: 'dataIntegrations.permissionsAlert.link',
    description: 'Link to request integration access',
    defaultMessage: 'Request access via the Virtual Assistant',
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
  wizardProviderTitle: {
    id: 'dataIntegrations.wizard.provider.title',
    description: 'Provider-specific add integration wizard title',
    defaultMessage: 'Add {provider} integration',
  },
  wizardProviderDescription: {
    id: 'dataIntegrations.wizard.provider.description',
    description: 'Provider-specific add integration wizard subtitle',
    defaultMessage:
      'Configure an integration to connect to your Red Hat applications.',
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
  wizardAdd: {
    id: 'dataIntegrations.wizard.add',
    description: 'Wizard submit button, shown on the review step',
    defaultMessage: 'Add',
  },
  // Source type selection step
  wizardSourceTypeStepTitle: {
    id: 'dataIntegrations.wizard.sourceType.stepTitle',
    description: 'Title of the source type selection wizard step',
    defaultMessage: 'Select integration type',
  },
  wizardBundleLabel: {
    id: 'dataIntegrations.wizard.bundleLabel',
    defaultMessage: 'Bundle',
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
  wizardNameTaken: {
    id: 'dataIntegrations.wizard.name.taken',
    description: 'Validation message when an integration name already exists',
    defaultMessage: 'That name is taken. Try another.',
  },

  // Application selection step
  wizardApplicationStepTitle: {
    id: 'dataIntegrations.wizard.application.stepTitle',
    description: 'Title of the application selection wizard step',
    defaultMessage: 'Select applications',
  },
  wizardApplicationStepDescription: {
    id: 'dataIntegrations.wizard.application.stepDescription',
    description: 'Introductory text above the application switches',
    defaultMessage:
      'Configuring your cloud integrations provides additional capabilities included with your subscription. You can turn these features on or off at any time after integration creation.',
  },
  wizardApplicationLabel: {
    id: 'dataIntegrations.wizard.application.label',
    description:
      'Label for the application switch group, read as the group name',
    defaultMessage: 'Available applications',
  },
  wizardBundle: {
    id: 'dataIntegrations.wizard.application.bundle',
    description:
      'Chip marking an application that bundles several capabilities',
    defaultMessage: 'Bundle',
  },
  costManagementDescription: {
    id: 'dataIntegrations.application.costManagement.description',
    description: 'What the Cost Management application does',
    defaultMessage:
      'Analyze, forecast, and optimize your Red Hat OpenShift cluster costs in hybrid cloud environments.',
  },
  provisioningDescription: {
    id: 'dataIntegrations.application.provisioning.description',
    defaultMessage:
      'Build and launch images with custom content as Virtual Machines in hybrid cloud environments.',
  },

  // What the RHEL management bundle includes
  rhelBundleGoldImagesTitle: {
    id: 'dataIntegrations.rhelBundle.goldImages.title',
    description: 'Title of the gold images capability',
    defaultMessage: 'Red Hat gold images',
  },
  rhelBundleGoldImagesAws: {
    id: 'dataIntegrations.rhelBundle.goldImages.aws',
    description: 'What gold images gives an AWS integration',
    defaultMessage:
      'Unlock cloud images in AWS and bring your own subscription instead of paying hourly.',
  },
  rhelBundleGoldImagesAzure: {
    id: 'dataIntegrations.rhelBundle.goldImages.azure',
    description: 'What gold images gives an Azure integration',
    defaultMessage:
      'Unlock cloud images in Microsoft Azure and bring your own subscription instead of paying hourly.',
  },
  rhelBundleGoldImagesGoogle: {
    id: 'dataIntegrations.rhelBundle.goldImages.google',
    description: 'What gold images gives a Google Cloud integration',
    defaultMessage:
      'Unlock cloud images in Google Cloud and bring your own subscription instead of paying hourly.',
  },
  rhelBundleSubWatchTitle: {
    id: 'dataIntegrations.rhelBundle.subWatch.title',
    description: 'Title of the subscription watch capability',
    defaultMessage: 'High precision subscription watch data',
  },
  rhelBundleSubWatchDescription: {
    id: 'dataIntegrations.rhelBundle.subWatch.description',
    description: 'What high precision subscription watch data gives',
    defaultMessage:
      'View precise public cloud usage data in subscription watch.',
  },
  rhelBundleAutoregistrationTitle: {
    id: 'dataIntegrations.rhelBundle.autoregistration.title',
    description: 'Title of the autoregistration capability',
    defaultMessage: 'Autoregistration',
  },
  rhelBundleAutoregistrationDescription: {
    id: 'dataIntegrations.rhelBundle.autoregistration.description',
    description: 'What autoregistration gives',
    defaultMessage:
      'Cloud instances automatically connect to console.redhat.com when provisioned.',
  },

  // Authentication type step
  wizardAuthTypeStepTitle: {
    id: 'dataIntegrations.wizard.authType.stepTitle',
    description: 'Title of the authentication type wizard step',
    defaultMessage: 'Select authentication type',
  },
  wizardAuthTypeStepDescription: {
    id: 'dataIntegrations.wizard.authType.stepDescription',
    description: 'Introductory text above the authentication type cards',
    defaultMessage:
      'Select how you want to authenticate with your provider. The credentials you enter next depend on this choice.',
  },
  wizardAuthTypeLabel: {
    id: 'dataIntegrations.wizard.authType.label',
    description:
      'Label for the authentication type card group, read as the radio group name',
    defaultMessage: 'Authentication type',
  },
  wizardAuthTypeRequired: {
    id: 'dataIntegrations.wizard.authType.required',
    description: 'Validation message when no authentication type is selected',
    defaultMessage: 'Select an authentication type to continue.',
  },
  wizardAuthTypeUnavailable: {
    id: 'dataIntegrations.wizard.authType.unavailable',
    description:
      'Shown on the authentication step for providers with no supported authentication yet',
    defaultMessage:
      'Adding this integration type is not supported yet. Go back and select a different integration type.',
  },
  wizardAuthTypeAccessKey: {
    id: 'dataIntegrations.wizard.authType.accessKey',
    description: 'Label for the AWS access key authentication type',
    defaultMessage: 'Access key',
  },

  // Credentials step
  wizardCredentialsStepTitle: {
    id: 'dataIntegrations.wizard.credentials.stepTitle',
    description: 'Title of the credentials wizard step',
    defaultMessage: 'Enter credentials',
  },
  wizardCredentialsStepDescription: {
    id: 'dataIntegrations.wizard.credentials.stepDescription',
    description: 'Introductory text above the AWS access key fields',
    defaultMessage:
      'Create an access key in your AWS user account and enter the details below.',
  },

  // Select configuration step
  wizardConfigurationStepTitle: {
    id: 'dataIntegrations.wizard.configuration.stepTitle',
    description: 'Title of the configuration mode wizard step',
    defaultMessage: 'Select configuration',
  },
  wizardConfigurationStepDescription: {
    id: 'dataIntegrations.wizard.configuration.stepDescription',
    description: 'Introductory text above the configuration mode options',
    defaultMessage:
      'Configure your integration manually or let us manage all necessary credentials by selecting account authorization configuration.',
  },
  wizardConfigurationModeLabel: {
    id: 'dataIntegrations.wizard.configuration.modeLabel',
    description:
      'Label for the configuration mode radio group, read as the group name',
    defaultMessage: 'Select a configuration mode',
  },
  wizardConfigurationModeRequired: {
    id: 'dataIntegrations.wizard.configuration.modeRequired',
    description: 'Validation message when no configuration mode is selected',
    defaultMessage: 'Select a configuration mode to continue.',
  },
  wizardAccountAuthorization: {
    id: 'dataIntegrations.wizard.configuration.accountAuthorization',
    description: 'Label of the account authorization configuration mode',
    defaultMessage: 'Account authorization',
  },
  wizardRecommended: {
    id: 'dataIntegrations.wizard.configuration.recommended',
    description:
      'Chip marking account authorization as the recommended configuration mode',
    defaultMessage: 'Recommended',
  },
  wizardAccountAuthorizationDescription: {
    id: 'dataIntegrations.wizard.configuration.accountAuthorizationDescription',
    description: 'Description of the account authorization configuration mode',
    defaultMessage:
      'A new automated integration configuration method. Provide your AWS account credentials and let Red Hat configure and manage your integration for you.',
  },
  wizardManualConfiguration: {
    id: 'dataIntegrations.wizard.configuration.manual',
    description: 'Label of the manual configuration mode',
    defaultMessage: 'Manual configuration',
  },
  wizardManualConfigurationDescription: {
    id: 'dataIntegrations.wizard.configuration.manualDescription',
    description: 'Description of the manual configuration mode',
    defaultMessage:
      'Configure and manage your integration manually if you do not wish to provide account authorization credentials. You will set up integrations the same way you do today.',
  },
  wizardManualApplicationTitle: {
    id: 'dataIntegrations.wizard.manual.applicationTitle',
    defaultMessage: 'Select application',
  },
  wizardManualApplicationDescription: {
    id: 'dataIntegrations.wizard.manual.applicationDescription',
    defaultMessage:
      'Select an application to connect to your integration. You can connect additional applications after integration creation.',
  },
  wizardManualApplicationLabel: {
    id: 'dataIntegrations.wizard.manual.applicationLabel',
    defaultMessage: 'Select an application',
  },
  wizardManualAwsConfigurationTitle: {
    id: 'dataIntegrations.wizard.manual.awsConfigurationTitle',
    defaultMessage: 'Configure AWS access',
  },
  wizardAwsAccountNumberTitle: {
    id: 'dataIntegrations.wizard.manual.awsAccountNumberTitle',
    defaultMessage: 'AWS Account Number',
  },
  wizardAwsCostStorageTitle: {
    id: 'dataIntegrations.wizard.manual.awsCostStorageTitle',
    defaultMessage: 'Create storage',
  },
  wizardAwsAccountAccessTitle: {
    id: 'dataIntegrations.wizard.manual.awsAccountAccessTitle',
    defaultMessage: 'Enable account access',
  },
  wizardAwsCostUsageTitle: {
    id: 'dataIntegrations.wizard.manual.awsCostUsageTitle',
    defaultMessage: 'Create cost and usage report',
  },
  wizardAwsHcsName: {
    id: 'dataIntegrations.wizard.manual.awsHcsName',
    defaultMessage: 'Hybrid Committed Spend',
  },
  wizardAwsCostManagementName: {
    id: 'dataIntegrations.wizard.manual.awsCostManagementName',
    defaultMessage: 'Cost Management',
  },
  wizardAwsCostStorageInstructions: {
    id: 'dataIntegrations.wizard.manual.awsCostStorageInstructions',
    defaultMessage:
      'To store the data export (previously called a cost and usage report) for cost management, create an Amazon S3 bucket.',
  },
  wizardAwsCostStorageBucketInstructions: {
    id: 'dataIntegrations.wizard.manual.awsCostStorageBucketInstructions',
    defaultMessage:
      'On AWS, specify or create an Amazon S3 bucket for your account and enter its name below.',
  },
  wizardAwsCostTagsTitle: {
    id: 'dataIntegrations.wizard.manual.awsCostTagsTitle',
    defaultMessage: 'Tags, aliases and organizational units',
  },
  wizardAwsCostUsageInstructions: {
    id: 'dataIntegrations.wizard.manual.awsCostUsageInstructions',
    defaultMessage:
      "The information {application} would need is your AWS account's data export. If there is a need to further customize the data export you want to send to {application}, select the manually customize option and follow the special instructions on how to.",
  },
  wizardAwsCostExportDefault: {
    id: 'dataIntegrations.wizard.manual.awsCostExportDefault',
    defaultMessage:
      'In AWS, create a Legacy CUR export named koku. Include resource IDs, enable automatic refresh, select hourly data, enable Redshift and QuickSight, disable Athena, use GZIP compression, and set the report path prefix to cost.',
  },
  wizardAwsCostExportCreate: {
    id: 'dataIntegrations.wizard.manual.awsCostExportCreate',
    defaultMessage: 'Create a data export using the following values:',
  },
  wizardAwsCostExportType: {
    id: 'dataIntegrations.wizard.manual.awsCostExportType',
    defaultMessage: 'Export type: Legacy CUR export',
  },
  wizardAwsCostExportName: {
    id: 'dataIntegrations.wizard.manual.awsCostExportName',
    defaultMessage: 'Export name: koku',
  },
  wizardAwsCostExportResourceIds: {
    id: 'dataIntegrations.wizard.manual.awsCostExportResourceIds',
    defaultMessage: 'Include: Resource IDs',
  },
  wizardAwsCostExportRefresh: {
    id: 'dataIntegrations.wizard.manual.awsCostExportRefresh',
    defaultMessage: 'Enable: Refresh automatically',
  },
  wizardAwsCostExportHourly: {
    id: 'dataIntegrations.wizard.manual.awsCostExportHourly',
    defaultMessage: 'Time unit: hourly',
  },
  wizardAwsCostExportServices: {
    id: 'dataIntegrations.wizard.manual.awsCostExportServices',
    defaultMessage:
      'Enable support for: RedShift, QuickSight and disable support for Athena',
  },
  wizardAwsCostExportCompression: {
    id: 'dataIntegrations.wizard.manual.awsCostExportCompression',
    defaultMessage: 'Compression type: GZIP',
  },
  wizardAwsCostExportPrefix: {
    id: 'dataIntegrations.wizard.manual.awsCostExportPrefix',
    defaultMessage: 'Report path prefix: cost',
  },
  wizardAwsCostExportCustom: {
    id: 'dataIntegrations.wizard.manual.awsCostExportCustom',
    defaultMessage:
      'Skip creating the default data export. Follow the additional configuration steps for a customized export.',
  },
  wizardAwsSkipStep: {
    id: 'dataIntegrations.wizard.manual.awsSkipStep',
    defaultMessage: 'Skip this step and proceed to next step',
  },
  wizardAwsCustomExportEmptyState: {
    id: 'dataIntegrations.wizard.manual.awsCustomExportEmptyState',
    defaultMessage:
      'Because you have chosen to manually customize the data set you want to send to cost management, you do not need to create a data export (previously called a cost and usage report).',
  },
  wizardAwsAdditionalConfigurationSteps: {
    id: 'dataIntegrations.wizard.manual.awsAdditionalConfigurationSteps',
    defaultMessage: 'Additional configuration steps',
  },
  wizardAwsCostTagsInstructions: {
    id: 'dataIntegrations.wizard.manual.awsCostTagsInstructions',
    defaultMessage:
      'To use tags to organize your AWS resources in the {application} application, activate your tags in AWS to allow them to be imported automatically.',
  },
  wizardAwsTagsOpenAllocation: {
    id: 'dataIntegrations.wizard.manual.awsTagsOpenAllocation',
    defaultMessage:
      'In the AWS Billing and Cost Management console, open the Cost Allocation Tags section.',
  },
  wizardAwsTagsActivate: {
    id: 'dataIntegrations.wizard.manual.awsTagsActivate',
    defaultMessage:
      'Select the tags you want to use in the {application} application, and click Activate.',
  },
  wizardAwsCostTagsAccountInstructions: {
    id: 'dataIntegrations.wizard.manual.awsCostTagsAccountInstructions',
    defaultMessage:
      'To use account aliases and organizational units in the display and filter of AWS resources, select the following.',
  },
  wizardAwsPolicyTitle: {
    id: 'dataIntegrations.wizard.manual.awsPolicyTitle',
    defaultMessage: 'Create IAM policy',
  },
  wizardAwsRoleTitle: {
    id: 'dataIntegrations.wizard.manual.awsRoleTitle',
    defaultMessage: 'Create IAM role',
  },
  wizardAwsArnTitle: {
    id: 'dataIntegrations.wizard.manual.awsArnTitle',
    defaultMessage: 'Enter ARN',
  },
  wizardAwsBucket: {
    id: 'dataIntegrations.wizard.manual.awsBucket',
    defaultMessage: 'S3 bucket name',
  },
  wizardAwsBucketPattern: {
    id: 'dataIntegrations.wizard.manual.awsBucketPattern',
    defaultMessage:
      'S3 bucket names must use lowercase letters, numbers, dots, and hyphens.',
  },
  wizardAwsRegion: {
    id: 'dataIntegrations.wizard.manual.awsRegion',
    defaultMessage: 'AWS region',
  },
  wizardAwsSelectRegion: {
    id: 'dataIntegrations.wizard.manual.awsSelectRegion',
    defaultMessage: 'Select a region',
  },
  wizardAwsExportMode: {
    id: 'dataIntegrations.wizard.manual.awsExportMode',
    defaultMessage: 'Cost and usage report',
  },
  wizardAwsDefaultExport: {
    id: 'dataIntegrations.wizard.manual.awsDefaultExport',
    defaultMessage:
      'I am OK with sending the default data export to Cost Management',
  },
  wizardAwsCustomExport: {
    id: 'dataIntegrations.wizard.manual.awsCustomExport',
    defaultMessage:
      'I wish to manually customize the data export sent to Cost Management',
  },
  wizardAwsCustomExportHelp: {
    id: 'dataIntegrations.wizard.manual.awsCustomExportHelp',
    defaultMessage:
      'There will be a set of instructions at the end of this wizard that will guide you through completing the customized configuration in the AWS console.',
  },
  wizardAwsCustomExportHelpLabel: {
    id: 'dataIntegrations.wizard.manual.awsCustomExportHelpLabel',
    defaultMessage: 'Help for manual data export configuration',
  },
  wizardGoogleDefaultExport: {
    id: 'dataIntegrations.wizard.google.defaultExport',
    defaultMessage:
      'I am OK with sending the default dataset to Cost Management',
  },
  wizardGoogleCustomExport: {
    id: 'dataIntegrations.wizard.google.customExport',
    defaultMessage:
      'I wish to manually customize the dataset sent to Cost Management',
  },
  wizardAwsMetered: {
    id: 'dataIntegrations.wizard.manual.awsMetered',
    defaultMessage: 'Include RHEL usage',
  },
  wizardAwsRegionsError: {
    id: 'dataIntegrations.wizard.manual.awsRegionsError',
    defaultMessage:
      'AWS regions could not be loaded. Try closing and reopening the wizard.',
  },
  wizardAwsRoleArn: {
    id: 'dataIntegrations.wizard.manual.awsRoleArn',
    defaultMessage: 'ARN',
  },
  wizardAwsAccountNumber: {
    id: 'dataIntegrations.wizard.manual.awsAccountNumber',
    defaultMessage: 'Account number',
  },
  wizardAwsAccountInstructions: {
    id: 'dataIntegrations.wizard.manual.awsAccountInstructions',
    defaultMessage: 'Log in to your AWS account and copy your account number.',
  },
  wizardAwsPolicyInstructions: {
    id: 'dataIntegrations.wizard.manual.awsPolicyInstructions',
    defaultMessage:
      'To grant permissions to the cost management report you just configured, create an AWS Identity and Access Management (IAM) policy.',
  },
  wizardAwsIamSignIn: {
    id: 'dataIntegrations.wizard.manual.awsIamSignIn',
    defaultMessage:
      'Sign in to the AWS Identity and Access Management (IAM) console.',
  },
  wizardAwsIamCreatePolicy: {
    id: 'dataIntegrations.wizard.manual.awsIamCreatePolicy',
    defaultMessage:
      'Create a new policy, pasting the following content into the JSON text box.',
  },
  wizardAwsIamCompletePolicy: {
    id: 'dataIntegrations.wizard.manual.awsIamCompletePolicy',
    defaultMessage: 'Complete the process to create your new policy.',
  },
  wizardAwsIamKeepBrowserOpen: {
    id: 'dataIntegrations.wizard.manual.awsIamKeepBrowserOpen',
    defaultMessage:
      '<doNotClose>Do not close your browser.</doNotClose> You will need to be logged in to the IAM console to complete the next step.',
  },
  wizardAwsCreateRoleInstructions: {
    id: 'dataIntegrations.wizard.manual.awsCreateRoleInstructions',
    defaultMessage:
      'To delegate account access, create an IAM role to associate with your IAM policy.',
  },
  wizardAwsCreateNewRole: {
    id: 'dataIntegrations.wizard.manual.awsCreateNewRole',
    defaultMessage:
      'From the AWS Identity and Access Management console, create a new role.',
  },
  wizardAwsArnInstructions: {
    id: 'dataIntegrations.wizard.manual.awsArnInstructions',
    defaultMessage:
      'To enable account access, capture the ARN associated with the role you just created.',
  },
  wizardAwsRoleSelect: {
    id: 'dataIntegrations.wizard.manual.awsRoleSelect',
    defaultMessage: 'From the Roles tab, select the role you just created.',
  },
  wizardAwsRoleCopyArn: {
    id: 'dataIntegrations.wizard.manual.awsRoleCopyArn',
    defaultMessage:
      'From the Summary screen, copy the role ARN and paste it in the ARN field below:',
  },
  wizardAwsAliases: {
    id: 'dataIntegrations.wizard.manual.awsAliases',
    defaultMessage: 'Include AWS account aliases',
  },
  wizardAwsOrgUnits: {
    id: 'dataIntegrations.wizard.manual.awsOrgUnits',
    defaultMessage: 'Include AWS organizational units',
  },
  wizardAwsAliasesHelp: {
    id: 'dataIntegrations.wizard.manual.awsAliasesHelp',
    defaultMessage:
      'If there are account aliases, they will appear and be used for filtering when reporting on AWS accounts. This will include "iam:ListAccountAliases" in the IAM policy actions.',
  },
  wizardAwsAliasesHelpLabel: {
    id: 'dataIntegrations.wizard.manual.awsAliasesHelpLabel',
    defaultMessage: 'Help for AWS account aliases',
  },
  wizardAwsOrgUnitsHelp: {
    id: 'dataIntegrations.wizard.manual.awsOrgUnitsHelp',
    defaultMessage:
      'If there are organizational units, they will be used for filtering when reporting on AWS resources. This will include "organizations:List*" and "organizations:Describe*" in the IAM policy actions.',
  },
  wizardAwsOrgUnitsHelpLabel: {
    id: 'dataIntegrations.wizard.manual.awsOrgUnitsHelpLabel',
    defaultMessage: 'Help for AWS organizational units',
  },
  wizardAwsMeteredAlert: {
    id: 'dataIntegrations.wizard.manual.awsMeteredAlert',
    defaultMessage:
      'If your organization is converting systems from CentOS 7 to RHEL and using hourly billing, activate the com_redhat_rhel tag for your systems in the Cost Allocation Tags section of the AWS console. After activating the tag in AWS, select Include RHEL usage.',
  },
  wizardAwsProvisioningInstructions: {
    id: 'dataIntegrations.wizard.manual.awsProvisioningInstructions',
    defaultMessage:
      'To integrate your AWS account with our service, you need to create an IAM role.',
  },
  wizardAwsProvisioningError: {
    id: 'dataIntegrations.wizard.manual.awsProvisioningError',
    defaultMessage:
      'There was an error while loading the commands. Please go back and return to this step to try again.',
  },
  wizardAwsProvisioningLoading: {
    id: 'dataIntegrations.wizard.manual.awsProvisioningLoading',
    defaultMessage: 'Loading configuration...',
  },
  wizardAwsProvisioningSteps: {
    id: 'dataIntegrations.wizard.manual.awsProvisioningSteps',
    defaultMessage: 'Follow these steps to create the role:',
  },
  wizardAwsProvisioningStepOne: {
    id: 'dataIntegrations.wizard.manual.awsProvisioningStepOne',
    defaultMessage:
      "Click on 'Connect AWS' to open AWS CloudFormation in a new tab with the IAM role template.",
  },
  wizardAwsProvisioningStepTwo: {
    id: 'dataIntegrations.wizard.manual.awsProvisioningStepTwo',
    defaultMessage:
      "In AWS CloudFormation, click 'Create Stack' to initiate the creation of the IAM role. Wait until the status shows CREATE_COMPLETE.",
  },
  wizardAwsProvisioningStepThree: {
    id: 'dataIntegrations.wizard.manual.awsProvisioningStepThree',
    defaultMessage:
      "Return to this window and click 'Next' to retrieve the new role's ARN.",
  },
  wizardAwsConnectCloudFormation: {
    id: 'dataIntegrations.wizard.manual.awsConnectCloudFormation',
    defaultMessage: 'Connect AWS with CloudFormation',
  },
  wizardAwsRolePermissions: {
    id: 'dataIntegrations.wizard.manual.awsRolePermissions',
    defaultMessage: 'See role permissions',
  },
  wizardAwsCostInstructions: {
    id: 'dataIntegrations.wizard.manual.awsCostInstructions',
    defaultMessage:
      'Create an S3 bucket for {application}, then follow the data export, IAM policy, and role steps.',
  },
  wizardAwsSetupInstructions: {
    id: 'dataIntegrations.wizard.manual.awsSetupInstructions',
    defaultMessage: 'AWS setup instructions',
  },
  wizardAwsRhelInstructions: {
    id: 'dataIntegrations.wizard.manual.awsRhelInstructions',
    defaultMessage:
      'Create an IAM policy granting sts:GetCallerIdentity, then create an IAM role for RHEL management.',
  },
  wizardAwsTrustAccount: {
    id: 'dataIntegrations.wizard.manual.awsTrustAccount',
    defaultMessage:
      'Select another AWS account from the list of trusted entities and paste the following value into the Account ID field:',
  },
  wizardAwsExternalId: {
    id: 'dataIntegrations.wizard.manual.awsExternalId',
    defaultMessage: 'Paste the following value in the External ID field:',
  },
  wizardAwsExternalIdLabel: {
    id: 'dataIntegrations.wizard.manual.awsExternalIdLabel',
    defaultMessage: 'External ID',
  },
  wizardAwsAttachPolicy: {
    id: 'dataIntegrations.wizard.manual.awsAttachPolicy',
    defaultMessage: 'Attach the permissions policy that you just created.',
  },
  wizardAwsFinishRole: {
    id: 'dataIntegrations.wizard.manual.awsFinishRole',
    defaultMessage: 'Complete the process to create your new role.',
  },
  wizardAwsRoleArnPattern: {
    id: 'dataIntegrations.wizard.manual.awsRoleArnPattern',
    defaultMessage: 'ARN must start with arn:aws:',
  },
  wizardAwsArnAuth: {
    id: 'dataIntegrations.wizard.manual.awsArnAuth',
    defaultMessage: 'AWS IAM role',
  },
  wizardRhelArnAuth: {
    id: 'dataIntegrations.wizard.manual.rhelArnAuth',
    defaultMessage: 'RHEL management IAM role',
  },
  wizardProvisioningArnAuth: {
    id: 'dataIntegrations.wizard.manual.provisioningArnAuth',
    defaultMessage: 'Launch images IAM role',
  },
  wizardConfigurationModeReviewLabel: {
    id: 'dataIntegrations.wizard.review.configurationMode',
    description: 'Review row label for the chosen configuration mode',
    defaultMessage: 'Configuration mode',
  },

  wizardAccessKeyIdLabel: {
    id: 'dataIntegrations.wizard.credentials.accessKeyId',
    description: 'Label for the AWS access key ID field',
    defaultMessage: 'Access key ID',
  },
  wizardAccessKeyIdRequired: {
    id: 'dataIntegrations.wizard.credentials.accessKeyIdRequired',
    description: 'Validation message when the AWS access key ID is empty',
    defaultMessage: 'Enter your AWS access key ID.',
  },
  wizardSecretAccessKeyLabel: {
    id: 'dataIntegrations.wizard.credentials.secretAccessKey',
    description: 'Label for the AWS secret access key field',
    defaultMessage: 'Secret access key',
  },
  wizardSecretAccessKeyRequired: {
    id: 'dataIntegrations.wizard.credentials.secretAccessKeyRequired',
    description: 'Validation message when the AWS secret access key is empty',
    defaultMessage: 'Enter your AWS secret access key.',
  },

  // Review step
  wizardReviewStepTitle: {
    id: 'dataIntegrations.wizard.review.stepTitle',
    description: 'Title of the review wizard step',
    defaultMessage: 'Review details',
  },
  wizardReviewStepDescription: {
    id: 'dataIntegrations.wizard.review.stepDescription',
    description: 'Introductory text above the review summary',
    defaultMessage:
      'Review the information below and click Add to add your integration. To edit details in previous steps, click Back.',
  },
  wizardReviewType: {
    id: 'dataIntegrations.wizard.review.type',
    description: 'Review row label for the integration type',
    defaultMessage: 'Integration type',
  },
  wizardReviewAuthType: {
    id: 'dataIntegrations.wizard.review.authType',
    description: 'Review row label for the authentication type',
    defaultMessage: 'Authentication type',
  },
  wizardReviewName: {
    id: 'dataIntegrations.wizard.review.name',
    description: 'Review row label for the integration name',
    defaultMessage: 'Name',
  },
  wizardReviewPermissionsTitle: {
    id: 'dataIntegrations.wizard.review.permissions.title',
    description: 'OpenShift review permissions alert title',
    defaultMessage: 'Manage permissions in User Access',
  },
  wizardReviewPermissionsDescription: {
    id: 'dataIntegrations.wizard.review.permissions.description',
    description: 'OpenShift review permissions alert description',
    defaultMessage:
      'Make sure to manage permissions for this integration in custom roles that contain permissions for Cost Management.',
  },
  wizardReviewSecretMasked: {
    id: 'dataIntegrations.wizard.review.secretMasked',
    description:
      'Stands in for the secret access key on the review step, which is never displayed',
    defaultMessage: 'Hidden',
  },

  // Submission result
  wizardResultStepTitle: {
    id: 'dataIntegrations.wizard.result.stepTitle',
    description: 'Title of the wizard step shown after submitting',
    defaultMessage: 'Add integration',
  },
  wizardResultSubmitting: {
    id: 'dataIntegrations.wizard.result.submitting',
    description: 'Shown while integration credentials are being validated',
    defaultMessage: 'Validating credentials',
  },
  wizardResultSubmittingDescription: {
    id: 'dataIntegrations.wizard.result.submittingDescription',
    description:
      'Explanation shown while integration validation is in progress',
    defaultMessage:
      "This might take some time. You'll receive a notification if you are still in the Integrations application when the process completes. Otherwise, you can check the status in the main integrations table at any time.",
  },
  wizardResultSubmittingContinue: {
    id: 'dataIntegrations.wizard.result.submittingContinue',
    description:
      'Instruction shown while integration validation is in progress',
    defaultMessage:
      'In the meantime, you can close this window while the validation process continues.',
  },
  wizardResultClose: {
    id: 'dataIntegrations.wizard.result.close',
    description: 'Action that closes the validation state',
    defaultMessage: 'Close',
  },
  wizardResultSuccessTitle: {
    id: 'dataIntegrations.wizard.result.successTitle',
    description: 'Title shown when the integration was created',
    defaultMessage: 'Integration added',
  },
  wizardResultSuccessBody: {
    id: 'dataIntegrations.wizard.result.successBody',
    description: 'Body shown when the integration was created',
    defaultMessage:
      '{name} was created. It may take a few minutes before data starts arriving.',
  },
  wizardResultViewIntegration: {
    id: 'dataIntegrations.wizard.result.viewIntegration',
    description: 'Button that opens the newly created integration',
    defaultMessage: 'View integration',
  },
  wizardResultAddAnother: {
    id: 'dataIntegrations.wizard.result.addAnother',
    description: 'Button that restarts the wizard to add another integration',
    defaultMessage: 'Add another integration',
  },
  wizardResultErrorTitle: {
    id: 'dataIntegrations.wizard.result.errorTitle',
    description: 'Title shown when the integration could not be created',
    defaultMessage: 'Unable to add integration',
  },
  wizardResultErrorBody: {
    id: 'dataIntegrations.wizard.result.errorBody',
    description:
      'Body shown when the failure gave no reason, such as a network error',
    defaultMessage:
      'Your integration was not created. Check your connection and try again.',
  },
  wizardResultValidationErrorTitle: {
    id: 'dataIntegrations.wizard.result.validationErrorTitle',
    description:
      'Title shown when an integration fails availability validation',
    defaultMessage: 'Configuration unsuccessful',
  },
  wizardResultValidationErrorBody: {
    id: 'dataIntegrations.wizard.result.validationErrorBody',
    description: 'Fallback text when validation returns no failure reason',
    defaultMessage: 'Unknown error',
  },
  wizardResultRetry: {
    id: 'dataIntegrations.wizard.result.retry',
    description: 'Button that submits the integration again after a failure',
    defaultMessage: 'Retry',
  },
  wizardResultEdit: {
    id: 'dataIntegrations.wizard.result.edit',
    description: 'Button that returns to the review step after a failure',
    defaultMessage: 'Edit details',
  },
  wizardResultEditIntegration: {
    id: 'dataIntegrations.wizard.result.editIntegration',
    description: 'Button that opens an integration after validation fails',
    defaultMessage: 'Edit integration',
  },
  wizardResultRemoveIntegration: {
    id: 'dataIntegrations.wizard.result.removeIntegration',
    description: 'Button that removes an integration after validation fails',
    defaultMessage: 'Remove integration',
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

  wizardReviewApplicationsLabel: {
    id: 'dataIntegrations.wizard.review.applications',
    description: 'Label for the applications field in the review step',
    defaultMessage: 'Applications',
  },
  wizardReviewApplicationLabel: {
    id: 'dataIntegrations.wizard.review.application',
    description: 'Label for the application field in the review step',
    defaultMessage: 'Application',
  },

  // Submission notifications
  wizardSuccessBody: {
    id: 'dataIntegrations.wizard.success.body',
    description: 'Toast body when integration creation succeeds',
    defaultMessage: '{name} was successfully created.',
  },
  wizardCreateFailureTitle: {
    id: 'dataIntegrations.wizard.createFailure.title',
    description: 'Toast title when integration creation fails entirely',
    defaultMessage: 'Failed to create integration',
  },
  wizardCreateFailureBody: {
    id: 'dataIntegrations.wizard.createFailure.body',
    description: 'Toast body when integration creation fails entirely',
    defaultMessage: 'Try again or close the wizard.',
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
});
