import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import type { IntlShape } from 'react-intl';
import { defineMessages } from 'react-intl';
import type { ApplicationType } from '../../data/types/sources.types';
import messages from '../../messages';

const COST = '/insights/platform/cost-management';
const RHEL = '/insights/platform/cloud-meter';
const PROVISIONING = '/insights/platform/provisioning';
const APP = 'application.application_type_id';
const AUTH = 'authentication.authtype';

const copy = defineMessages({
  application: {
    id: 'dataIntegrations.provider.application',
    defaultMessage: 'Select application',
  },
  applicationField: {
    id: 'dataIntegrations.provider.applicationField',
    defaultMessage: 'Select an application',
  },
  applicationIntro: {
    id: 'dataIntegrations.provider.applicationIntro',
    defaultMessage:
      'Select an application to connect to your integration. You can connect additional applications after integration creation.',
  },
  learnMore: {
    id: 'dataIntegrations.provider.learnMore',
    defaultMessage: 'Learn more',
  },
  credentials: {
    id: 'dataIntegrations.provider.credentials',
    defaultMessage: 'Credentials',
  },
  token: { id: 'dataIntegrations.provider.token', defaultMessage: 'Token' },
  clusterUrl: {
    id: 'dataIntegrations.provider.clusterUrl',
    defaultMessage: 'OpenShift cluster URL',
  },
  verifyTls: {
    id: 'dataIntegrations.provider.verifyTls',
    defaultMessage: 'Verify TLS certificates',
  },
  ca: {
    id: 'dataIntegrations.provider.ca',
    defaultMessage: 'TLS certificate (PEM)',
  },
  clusterId: {
    id: 'dataIntegrations.provider.clusterId',
    defaultMessage: 'Cluster Identifier',
  },
  operator: {
    id: 'dataIntegrations.provider.operator',
    defaultMessage: 'Install and configure operator',
  },
  operatorGuide: {
    id: 'dataIntegrations.provider.operatorGuide',
    defaultMessage:
      'Install the cost management operator in your cluster, then enter its cluster identifier.',
  },
  tenantId: {
    id: 'dataIntegrations.provider.tenantId',
    defaultMessage: 'Tenant (Directory) ID',
  },
  clientId: {
    id: 'dataIntegrations.provider.clientId',
    defaultMessage: 'Client (Application) ID',
  },
  clientSecret: {
    id: 'dataIntegrations.provider.clientSecret',
    defaultMessage: 'Client secret',
  },
  subscriptionId: {
    id: 'dataIntegrations.provider.subscriptionId',
    defaultMessage: 'Subscription ID',
  },
  setSubscriptionId: {
    id: 'dataIntegrations.provider.setSubscriptionId',
    defaultMessage: 'Set subscription ID',
  },
  lighthouse: {
    id: 'dataIntegrations.provider.lighthouse',
    defaultMessage: 'Configure Azure Lighthouse',
  },
  scope: {
    id: 'dataIntegrations.provider.scope',
    defaultMessage: 'Specify cost export scope',
  },
  scopeGuide: {
    id: 'dataIntegrations.provider.scopeGuide',
    defaultMessage:
      'Choose the billing export scope and whether to include RHEL usage.',
  },
  storageOnly: {
    id: 'dataIntegrations.provider.storageOnly',
    defaultMessage: 'Customize the data sent to Cost Management',
  },
  defaultCostExport: {
    id: 'dataIntegrations.provider.defaultCostExport',
    defaultMessage:
      'I am OK with sending the default data set to Cost Management',
  },
  customCostExport: {
    id: 'dataIntegrations.provider.customCostExport',
    defaultMessage:
      'I wish to manually customize the data set sent to Cost Management',
  },
  metered: {
    id: 'dataIntegrations.provider.metered',
    defaultMessage: 'Include RHEL usage',
  },
  scopeName: {
    id: 'dataIntegrations.provider.scopeName',
    defaultMessage: 'Cost export scope',
  },
  resourceGroup: {
    id: 'dataIntegrations.provider.resourceGroup',
    defaultMessage: 'Resource group name',
  },
  storageAccount: {
    id: 'dataIntegrations.provider.storageAccount',
    defaultMessage: 'Storage account name',
  },
  storageStep: {
    id: 'dataIntegrations.provider.storageStep',
    defaultMessage: 'Resource group and storage account',
  },
  storageGuide: {
    id: 'dataIntegrations.provider.storageGuide',
    defaultMessage:
      'Create a resource group and storage account for the daily cost export.',
  },
  export: {
    id: 'dataIntegrations.provider.export',
    defaultMessage: 'Daily export',
  },
  exportName: {
    id: 'dataIntegrations.provider.exportName',
    defaultMessage: 'Cost export name',
  },
  exportGuide: {
    id: 'dataIntegrations.provider.exportGuide',
    defaultMessage:
      'Configure a daily export of Azure cost data to the storage account.',
  },
  roles: { id: 'dataIntegrations.provider.roles', defaultMessage: 'Roles' },
  rolesGuide: {
    id: 'dataIntegrations.provider.rolesGuide',
    defaultMessage:
      'Assign the service principal access to the export, then enter its tenant ID, client ID, and secret.',
  },
  project: {
    id: 'dataIntegrations.provider.project',
    defaultMessage: 'Project',
  },
  projectGuide: {
    id: 'dataIntegrations.provider.projectGuide',
    defaultMessage:
      'Enter the Google billing project and service account credentials.',
  },
  projectId: {
    id: 'dataIntegrations.provider.projectId',
    defaultMessage: 'Project ID',
  },
  projectIdStep: {
    id: 'dataIntegrations.provider.projectIdStep',
    defaultMessage: 'Enter Project ID',
  },
  serviceJson: {
    id: 'dataIntegrations.provider.serviceJson',
    defaultMessage: 'Service Account JSON',
  },
  bucket: {
    id: 'dataIntegrations.provider.bucket',
    defaultMessage: 'Cloud storage bucket name',
  },
  bucketStep: {
    id: 'dataIntegrations.provider.bucketStep',
    defaultMessage: 'Create cloud storage bucket',
  },
  bucketGuide: {
    id: 'dataIntegrations.provider.bucketGuide',
    defaultMessage:
      'Create the cloud storage bucket that will hold the customized billing export.',
  },
  iam: {
    id: 'dataIntegrations.provider.iam',
    defaultMessage: 'Create IAM role',
  },
  iamGuide: {
    id: 'dataIntegrations.provider.iamGuide',
    defaultMessage:
      'Create the IAM role that grants Cost Management access to billing data.',
  },
  access: {
    id: 'dataIntegrations.provider.access',
    defaultMessage: 'Assign access',
  },
  accountAccess: {
    id: 'dataIntegrations.provider.accountAccess',
    defaultMessage: 'Enable account access',
  },
  accessGuide: {
    id: 'dataIntegrations.provider.accessGuide',
    defaultMessage:
      'Assign the IAM role to the service account used by this integration.',
  },
  datasetStep: {
    id: 'dataIntegrations.provider.datasetStep',
    defaultMessage: 'Create dataset',
  },
  dataset: {
    id: 'dataIntegrations.provider.dataset',
    defaultMessage: 'Dataset ID',
  },
  datasetGuide: {
    id: 'dataIntegrations.provider.datasetGuide',
    defaultMessage:
      'Create the billing dataset and enter its ID when using the default export.',
  },
  billing: {
    id: 'dataIntegrations.provider.billing',
    defaultMessage: 'Billing export',
  },
  billingGuide: {
    id: 'dataIntegrations.provider.billingGuide',
    defaultMessage:
      'Enable billing export to the dataset before finishing this integration.',
  },
  offlineToken: {
    id: 'dataIntegrations.provider.offlineToken',
    defaultMessage: 'Obtain offline token',
  },
  playbook: {
    id: 'dataIntegrations.provider.playbook',
    defaultMessage: 'Run Ansible playbook',
  },
  projectRole: {
    id: 'dataIntegrations.provider.projectRole',
    defaultMessage: 'Create custom role',
  },
});

type Validation = { type: string; pattern?: RegExp };
const required: Validation[] = [{ type: validatorTypes.REQUIRED }];
const identifierPattern = {
  type: validatorTypes.PATTERN,
  pattern: /^[A-Za-z0-9]+[A-Za-z0-9_-]*$/,
};
const identifier = [...required, identifierPattern];
const hidden = (name: string, initialValue: string) => ({
  component: componentTypes.TEXT_FIELD,
  name,
  hideField: true,
  initialValue,
  initializeOnMount: true,
});
const input = (
  name: string,
  label: string,
  validate: Validation[] = required,
  component: string = componentTypes.TEXT_FIELD,
) => ({
  component,
  name,
  label,
  isRequired: validate.some(({ type }) => type === validatorTypes.REQUIRED),
  validate,
});

/** Sources-ui chooses one application before asking for provider credentials. */
export function providerWizardSteps(
  apps: ApplicationType[],
  intl: IntlShape,
  enableLighthouse = false,
) {
  const t = (message: (typeof copy)[keyof typeof copy]) =>
    intl.formatMessage(message);
  const appId = (name: string) => apps.find((app) => app.name === name)?.id;
  const appStep = (provider: 'openshift' | 'azure' | 'google') => {
    const providerApps = apps.filter(
      (app) =>
        !app.supported_source_types ||
        app.supported_source_types.includes(provider),
    );
    const providerAppId = (name: string) =>
      providerApps.find((app) => app.name === name)?.id;

    return {
      name: `${provider}-application`,
      title: t(copy.application),
      nextStep: {
        when: APP,
        stepMapper: Object.fromEntries([
          ...(providerAppId(COST)
            ? [[providerAppId(COST), `${provider}-cost`]]
            : []),
          ...(provider !== 'openshift' && providerAppId(RHEL)
            ? [[providerAppId(RHEL), `${provider}-rhel`]]
            : []),
          ...(provider !== 'openshift' && providerAppId(PROVISIONING)
            ? [[providerAppId(PROVISIONING), `${provider}-provisioning`]]
            : []),
        ]),
      },
      fields: [
        ...(provider !== 'openshift'
          ? [
              {
                component: componentTypes.PLAIN_TEXT,
                name: `${provider}-application-intro`,
                label: (
                  <>
                    {t(copy.applicationIntro)}{' '}
                    <a
                      href="https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html/configuring_cloud_integrations_for_red_hat_services/assembly-adding-cloud-integrations_crc-cloud-integrations"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(copy.learnMore)}
                    </a>
                  </>
                ),
              },
            ]
          : []),
        {
          component:
            provider === 'openshift'
              ? componentTypes.RADIO
              : 'application-switch-group',
          name: APP,
          label: t(copy.applicationField),
          isRequired: true,
          ...(provider !== 'openshift' ? { selectionMode: 'single' } : {}),
          ...(provider === 'openshift' && providerAppId(COST)
            ? {
                initialValue: providerAppId(COST),
                initializeOnMount: true,
              }
            : {}),
          options: providerApps
            .filter(
              (app) =>
                app.name === COST ||
                (provider !== 'openshift' &&
                  (app.name === RHEL || app.name === PROVISIONING)),
            )
            .map((app) => ({
              value: app.id,
              name: app.name,
              supportedSourceTypes: app.supported_source_types,
              label:
                provider === 'openshift' && app.name === COST ? (
                  <>
                    {intl.formatMessage(messages.wizardAwsHcsName)}{' '}
                    <Label color="purple">
                      {intl.formatMessage(messages.wizardBundleLabel)}
                    </Label>
                  </>
                ) : (
                  app.display_name
                ),
            })),
          validate: required,
        },
        ...(provider === 'openshift'
          ? [
              {
                component: 'openshift-application-description',
                name: 'openshift-application-description',
              },
            ]
          : []),
      ],
    };
  };
  const azureGuide = (name: string, stage: string) => ({
    component: 'azure-cost-instructions',
    name,
    stage,
  });
  const googleGuide = (name: string, stage: string) => ({
    component: 'google-cost-instructions',
    name,
    stage,
  });

  return [
    appStep('azure'),
    appStep('google'),
    appStep('openshift'),
    {
      name: 'openshift-generic',
      title: t(copy.credentials),
      nextStep: 'openshift-endpoint',
      fields: [
        hidden(AUTH, 'token'),
        input('authentication.password', t(copy.token)),
      ],
    },
    {
      name: 'openshift-endpoint',
      title: t(copy.clusterUrl),
      nextStep: 'review',
      fields: [
        hidden('endpoint.role', 'kubernetes'),
        input('url', t(copy.clusterUrl), [
          ...required,
          { type: validatorTypes.URL },
        ]),
        {
          component: componentTypes.CHECKBOX,
          name: 'endpoint.verify_ssl',
          label: t(copy.verifyTls),
        },
        {
          ...input('endpoint.certificate_authority', t(copy.ca), []),
          component: componentTypes.TEXTAREA,
          condition: { when: 'endpoint.verify_ssl', is: true },
        },
      ],
    },
    {
      name: 'openshift-cost',
      title: t(copy.operator),
      nextStep: 'review',
      fields: [
        {
          component: 'openshift-operator-instructions',
          name: 'operator-guide',
        },
        hidden(AUTH, 'token'),
        input('source.source_ref', t(copy.clusterId), identifier),
      ],
    },
    {
      name: 'azure-provisioning',
      title: t(copy.lighthouse),
      nextStep: 'azure-provisioning-subscription',
      fields: [
        {
          component: 'azure-provisioning-instructions',
          name: 'azure-provisioning-guide',
          stage: 'lighthouse',
        },
        hidden(AUTH, 'provisioning_lighthouse_subscription_id'),
        {
          component: componentTypes.TEXT_FIELD,
          name: 'lighthouse-clicked',
          hideField: true,
          validate: required,
        },
      ],
    },
    {
      name: 'azure-provisioning-subscription',
      title: t(copy.setSubscriptionId),
      nextStep: 'review',
      fields: [
        {
          component: 'azure-provisioning-instructions',
          name: 'azure-provisioning-subscription-guide',
          stage: 'subscription',
        },
        input('authentication.username', t(copy.subscriptionId), [
          ...required,
          {
            type: validatorTypes.PATTERN,
            pattern: /^[A-Za-z0-9-]+$/,
          },
        ]),
      ],
    },
    {
      name: 'azure-generic',
      title: t(copy.credentials),
      nextStep: 'review',
      fields: [
        hidden('endpoint.role', 'azure'),
        hidden(AUTH, 'username_password_tenant_id'),
        {
          ...input('authentication.extra.azure.tenant_id', t(copy.tenantId)),
          type: 'password',
        },
        input('authentication.username', t(copy.clientId)),
        {
          ...input('authentication.password', t(copy.clientSecret)),
          type: 'password',
        },
      ],
    },
    {
      name: 'azure-rhel',
      title: t(enableLighthouse ? copy.lighthouse : copy.offlineToken),
      nextStep: enableLighthouse
        ? 'azure-rhel-subscription'
        : 'azure-rhel-playbook',
      ...(enableLighthouse
        ? {}
        : {
            substepOf: {
              name: 'azure-rhel-access',
              title: t(copy.accountAccess),
            },
          }),
      fields: [
        enableLighthouse
          ? {
              component: 'azure-lighthouse-instructions',
              name: 'azure-rhel-guide',
            }
          : {
              component: 'rhel-management-instructions',
              name: 'azure-rhel-guide',
              provider: 'azure',
              stage: 'token',
            },
        hidden(AUTH, enableLighthouse ? 'lighthouse_subscription_id' : 'empty'),
        ...(enableLighthouse
          ? [
              {
                component: componentTypes.TEXT_FIELD,
                name: 'lighthouse-clicked',
                hideField: true,
                validate: required,
              },
            ]
          : []),
      ],
    },
    {
      name: 'azure-rhel-playbook',
      title: t(copy.playbook),
      nextStep: 'review',
      ...(enableLighthouse ? {} : { substepOf: 'azure-rhel-access' }),
      fields: [
        {
          component: 'rhel-management-instructions',
          name: 'azure-playbook-guide',
          provider: 'azure',
          stage: 'playbook',
        },
      ],
    },
    {
      name: 'azure-rhel-subscription',
      title: t(copy.setSubscriptionId),
      nextStep: 'review',
      fields: [
        {
          component: 'azure-lighthouse-instructions',
          name: 'azure-subscription-guide',
          stage: 'subscription',
        },
        input('authentication.username', t(copy.subscriptionId)),
      ],
    },
    {
      name: 'azure-cost',
      title: t(copy.scope),
      nextStep: 'azure-cost-storage',
      fields: [
        azureGuide('azure-scope-guide', 'scope'),
        {
          component: componentTypes.RADIO,
          name: 'application.extra.storage_only',
          options: [
            { value: false, label: t(copy.defaultCostExport) },
            { value: true, label: t(copy.customCostExport) },
          ],
          initialValue: false,
          hideInReview: true,
        },
        {
          component: componentTypes.CHECKBOX,
          name: 'application.extra.metered',
          label: t(copy.metered),
        },
        {
          ...input('application.extra.scope', t(copy.scopeName), [
            {
              type: validatorTypes.PATTERN,
              pattern: /^[A-Za-z0-9/][A-Za-z0-9._:/-]*$/,
            },
          ]),
          condition: { when: 'application.extra.storage_only', is: false },
        },
      ],
    },
    {
      name: 'azure-cost-storage',
      title: t(copy.storageStep),
      nextStep: {
        when: 'application.extra.storage_only',
        stepMapper: {
          true: 'azure-cost-export-custom',
          false: 'azure-cost-export',
        },
      },
      fields: [
        azureGuide('azure-storage-guide', 'storage'),
        hidden(AUTH, 'tenant_id_client_id_client_secret'),
        input(
          'application.extra.resource_group',
          t(copy.resourceGroup),
          identifier,
        ),
        input(
          'application.extra.storage_account',
          t(copy.storageAccount),
          identifier,
        ),
      ],
    },
    {
      name: 'azure-cost-export',
      title: t(copy.export),
      nextStep: 'azure-cost-subscription',
      fields: [
        azureGuide('azure-export-guide', 'export'),
        {
          ...input('application.extra.export_name', t(copy.exportName), [
            identifierPattern,
          ]),
          condition: { when: 'application.extra.storage_only', is: false },
        },
      ],
    },
    {
      name: 'azure-cost-export-custom',
      title: t(copy.export),
      nextStep: 'azure-cost-subscription',
      fields: [azureGuide('azure-export-custom-guide', 'export')],
    },
    {
      name: 'azure-cost-subscription',
      title: t(copy.subscriptionId),
      nextStep: 'azure-cost-roles',
      fields: [
        azureGuide('azure-subscription-guide', 'subscription'),
        input(
          'application.extra.subscription_id',
          t(copy.subscriptionId),
          identifier,
        ),
      ],
    },
    {
      name: 'azure-cost-roles',
      title: t(copy.roles),
      nextStep: 'review',
      fields: [
        azureGuide('azure-roles-guide', 'roles'),
        input('authentication.extra.azure.tenant_id', t(copy.tenantId)),
        input('authentication.username', t(copy.clientId)),
        {
          ...input('authentication.password', t(copy.clientSecret)),
          type: 'password',
        },
      ],
    },
    {
      name: 'google-provisioning',
      title: t(copy.projectIdStep),
      nextStep: 'google-provisioning-role',
      substepOf: {
        name: 'google-provisioning-access',
        title: t(copy.accountAccess),
      },
      fields: [
        {
          component: 'google-provisioning-instructions',
          name: 'google-provisioning-project-guide',
          stage: 'project',
        },
        hidden(AUTH, 'provisioning_project_id'),
        input('authentication.username', t(copy.projectId)),
      ],
    },
    {
      name: 'google-provisioning-role',
      title: t(copy.projectRole),
      nextStep: 'review',
      substepOf: 'google-provisioning-access',
      fields: [
        {
          component: 'google-provisioning-instructions',
          name: 'google-provisioning-role-guide',
          stage: 'role',
          applicationTypeId: appId(PROVISIONING),
        },
      ],
    },
    {
      name: 'google-generic',
      title: t(copy.credentials),
      nextStep: 'review',
      fields: [
        hidden('endpoint.role', 'google'),
        hidden(AUTH, 'project_id_service_account_json'),
        input('authentication.username', t(copy.projectId)),
        input(
          'authentication.password',
          t(copy.serviceJson),
          required,
          componentTypes.TEXTAREA,
        ),
      ],
    },
    {
      name: 'google-rhel',
      title: t(copy.offlineToken),
      nextStep: 'google-rhel-playbook',
      substepOf: {
        name: 'google-rhel-access',
        title: t(copy.accountAccess),
      },
      fields: [
        {
          component: 'rhel-management-instructions',
          name: 'google-offline-guide',
          provider: 'google',
          stage: 'token',
        },
        hidden(AUTH, 'empty'),
      ],
    },
    {
      name: 'google-rhel-playbook',
      title: t(copy.playbook),
      nextStep: 'review',
      substepOf: 'google-rhel-access',
      fields: [
        {
          component: 'rhel-management-instructions',
          name: 'google-playbook-guide',
          provider: 'google',
          stage: 'playbook',
        },
      ],
    },
    {
      name: 'google-cost',
      title: t(copy.project),
      nextStep: {
        when: 'application.extra.storage_only',
        stepMapper: { true: 'google-cost-bucket', false: 'google-cost-iam' },
      },
      fields: [
        googleGuide('google-project-guide', 'project'),
        hidden(AUTH, 'project_id_service_account_json'),
        input('authentication.username', t(copy.projectId)),
        input(
          'authentication.password',
          t(copy.serviceJson),
          required,
          componentTypes.TEXTAREA,
        ),
        {
          component: componentTypes.RADIO,
          name: 'application.extra.storage_only',
          options: [
            {
              value: false,
              label: intl.formatMessage(messages.wizardGoogleDefaultExport),
            },
            {
              value: true,
              label: intl.formatMessage(messages.wizardGoogleCustomExport),
            },
          ],
          initialValue: false,
          hideInReview: true,
        },
      ],
    },
    {
      name: 'google-cost-bucket',
      title: t(copy.bucketStep),
      nextStep: 'google-cost-iam',
      fields: [
        googleGuide('google-bucket-guide', 'bucket'),
        input('application.extra.bucket', t(copy.bucket)),
      ],
    },
    {
      name: 'google-cost-iam',
      title: t(copy.iam),
      nextStep: 'google-cost-access',
      substepOf: {
        name: 'google-cost-access-group',
        title: t(copy.accountAccess),
      },
      fields: [googleGuide('google-iam-guide', 'iam')],
    },
    {
      name: 'google-cost-access',
      title: t(copy.access),
      nextStep: {
        when: 'application.extra.storage_only',
        stepMapper: {
          true: 'google-cost-dataset-custom',
          false: 'google-cost-dataset',
        },
      },
      substepOf: 'google-cost-access-group',
      fields: [googleGuide('google-access-guide', 'access')],
    },
    {
      name: 'google-cost-dataset',
      title: t(copy.datasetStep),
      nextStep: 'google-cost-billing',
      fields: [
        googleGuide('google-dataset-guide', 'dataset'),
        input('application.extra.dataset', t(copy.dataset)),
      ],
    },
    {
      name: 'google-cost-dataset-custom',
      title: t(copy.datasetStep),
      nextStep: 'google-cost-billing',
      fields: [googleGuide('google-custom-dataset-guide', 'dataset')],
    },
    {
      name: 'google-cost-billing',
      title: t(copy.billing),
      nextStep: 'review',
      fields: [googleGuide('google-billing-guide', 'billing')],
    },
  ];
}
