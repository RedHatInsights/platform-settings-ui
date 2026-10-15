import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm as PatternFlyDescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import messages from '../../messages';
import { useApplicationTypes } from '../../data/queries/useApplicationTypes';
import { useHcsEnrollment } from '../../data/queries/useHcsEnrollment';
import {
  authTypeLabel,
  buildApplicationOptions,
  configurationModeLabel,
  manualAwsAuthType,
  providerLabel,
} from './integrationWizardSchema';
import type { IntegrationWizardValues } from './integrationWizardSchema';

const providerReview = defineMessages({
  clusterId: {
    id: 'dataIntegrations.review.clusterId',
    defaultMessage: 'Cluster identifier',
  },
  clusterUrl: {
    id: 'dataIntegrations.review.clusterUrl',
    defaultMessage: 'Cluster URL',
  },
  verifyTls: {
    id: 'dataIntegrations.review.verifyTls',
    defaultMessage: 'Verify TLS',
  },
  ca: { id: 'dataIntegrations.review.ca', defaultMessage: 'TLS certificate' },
  tenantId: {
    id: 'dataIntegrations.review.tenantId',
    defaultMessage: 'Tenant ID',
  },
  credential: {
    id: 'dataIntegrations.review.credential',
    defaultMessage: 'Credential',
  },
  provided: {
    id: 'dataIntegrations.review.provided',
    defaultMessage: 'Provided',
  },
  none: { id: 'dataIntegrations.review.none', defaultMessage: 'Not provided' },
  enabled: { id: 'dataIntegrations.review.enabled', defaultMessage: 'Enabled' },
  disabled: {
    id: 'dataIntegrations.review.disabled',
    defaultMessage: 'Disabled',
  },
  projectId: {
    id: 'dataIntegrations.review.projectId',
    defaultMessage: 'Project ID',
  },
  subscriptionId: {
    id: 'dataIntegrations.review.subscriptionId',
    defaultMessage: 'Subscription ID',
  },
  clientId: {
    id: 'dataIntegrations.review.clientId',
    defaultMessage: 'Client ID',
  },
  resourceGroup: {
    id: 'dataIntegrations.review.resourceGroup',
    defaultMessage: 'Resource group',
  },
  storageAccount: {
    id: 'dataIntegrations.review.storageAccount',
    defaultMessage: 'Storage account',
  },
  subscription: {
    id: 'dataIntegrations.review.subscription',
    defaultMessage: 'Subscription ID',
  },
  scope: {
    id: 'dataIntegrations.review.scope',
    defaultMessage: 'Cost export scope',
  },
  exportName: {
    id: 'dataIntegrations.review.exportName',
    defaultMessage: 'Cost export name',
  },
  bucket: {
    id: 'dataIntegrations.review.bucket',
    defaultMessage: 'Cloud storage bucket',
  },
  dataset: {
    id: 'dataIntegrations.review.dataset',
    defaultMessage: 'Dataset ID',
  },
  awsRegion: {
    id: 'dataIntegrations.review.awsRegion',
    defaultMessage: 'AWS region',
  },
  accountNumber: {
    id: 'dataIntegrations.review.accountNumber',
    defaultMessage: 'Account number',
  },
  includeRhel: {
    id: 'dataIntegrations.review.includeRhel',
    defaultMessage: 'Include RHEL usage',
  },
  aliases: {
    id: 'dataIntegrations.review.aliases',
    defaultMessage: 'Include AWS account aliases',
  },
  orgUnits: {
    id: 'dataIntegrations.review.orgUnits',
    defaultMessage: 'Include AWS organizational units',
  },
  customCostTitle: {
    id: 'dataIntegrations.review.customCost.title',
    defaultMessage: "Don't forget additional configuration steps!",
  },
  customCostDescription: {
    id: 'dataIntegrations.review.customCost.description',
    defaultMessage:
      'You will need to perform more configuration steps after creating the source. To find more information, click on the link below.',
  },
  customCostLink: {
    id: 'dataIntegrations.review.customCost.link',
    defaultMessage: 'Customizing your {application} cost and usage report',
  },
});

const DescriptionListTerm: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <PatternFlyDescriptionListTerm className="pf-v6-u-text-nowrap">
    {children}
  </PatternFlyDescriptionListTerm>
);

const CUSTOM_COST_GUIDES: Partial<Record<string, string>> = {
  amazon:
    'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-adding_filtered_aws_int',
  azure:
    'https://docs.redhat.com/en/documentation/cost_management_service/1-latest/integrate-azure_integration',
  google:
    'https://access.redhat.com/documentation/en-us/hybrid_committed_spend/1-latest/html/integrating_google_cloud_data_into_cost_management/assembly-adding-filtered-gcp-int#configuring-function-post-reports-gcp-hcs_adding-filtered-gcp-int',
};

/**
 * Masks an access key id down to its first four characters.
 *
 * Enough for the user to tell which of their keys this is, not enough to be
 * worth shoulder-surfing. The secret is never shown at all — not even
 * partially — so it has no equivalent here.
 */
function maskAccessKeyId(accessKeyId: string): string {
  return `${accessKeyId.slice(0, 4)}${'•'.repeat(Math.max(accessKeyId.length - 4, 0))}`;
}

/**
 * The `review-summary` data-driven-forms component.
 *
 * A custom component rather than plain text because plain text cannot
 * subscribe to form state. The step has no inputs of its own, so reading
 * values once from `getState()` is safe — nothing can change them while this
 * is mounted.
 *
 * No per-row Edit buttons: during creation the only way back is the wizard's
 * own Back button, and once the integration exists it is edited from the row
 * kebab on the table, not from here.
 */
const ReviewSummary: React.FC = () => {
  const intl = useIntl();
  const { getState } = useFormApi();

  const values = getState().values as IntegrationWizardValues;
  const provider = values.source_type;
  const workflow = values.source?.app_creation_workflow;

  const isAccountAuthorization = workflow === 'account_authorization';
  const { data: hcsEnrolled = false } = useHcsEnrollment(Boolean(provider));

  /*
   * Already fetched and cached by the wizard host, so this resolves from cache
   * rather than firing a second request. Ids are what the form carries; the
   * review needs the display names behind them.
   */
  const { data: applicationTypes } = useApplicationTypes();
  const selectedApplications = buildApplicationOptions(applicationTypes ?? [])
    .filter(({ value }) =>
      isAccountAuthorization
        ? values.applications?.includes(value)
        : value === values.application?.application_type_id,
    )
    .map(({ label, name }) =>
      (hcsEnrolled || provider === 'openshift') &&
      name === '/insights/platform/cost-management'
        ? intl.formatMessage(messages.wizardAwsHcsName)
        : label,
    );
  const manualAppName = applicationTypes?.find(
    ({ id }) => id === values.application?.application_type_id,
  )?.name;
  const authType =
    provider === 'amazon'
      ? isAccountAuthorization
        ? values.authentication?.authtype
        : manualAwsAuthType(manualAppName)
      : values.authentication?.authtype;
  const credential =
    authType === 'empty' ? undefined : values.authentication?.username;
  const extra = values.application?.extra;
  const reviewFields: Array<{
    label: MessageDescriptor;
    value: unknown;
  }> = [];
  const addReviewField = (value: unknown, label: MessageDescriptor) => {
    if (value !== undefined && value !== '') {
      reviewFields.push({ label, value });
    }
  };

  if (manualAppName === '/insights/platform/cost-management') {
    if (provider === 'amazon') {
      addReviewField(extra?.bucket, providerReview.bucket);
      addReviewField(extra?.bucket_region, providerReview.awsRegion);
      addReviewField(extra?.metered, providerReview.includeRhel);
      addReviewField(values.aws?.aliases?.enabled, providerReview.aliases);
      addReviewField(values.aws?.org_units?.enabled, providerReview.orgUnits);
    } else if (provider === 'azure') {
      addReviewField(extra?.resource_group, providerReview.resourceGroup);
      addReviewField(extra?.storage_account, providerReview.storageAccount);
      addReviewField(extra?.subscription_id, providerReview.subscription);
      addReviewField(extra?.scope, providerReview.scope);
      addReviewField(extra?.export_name, providerReview.exportName);
      addReviewField(extra?.metered, providerReview.includeRhel);
    } else if (provider === 'google') {
      addReviewField(extra?.bucket, providerReview.bucket);
      addReviewField(extra?.dataset, providerReview.dataset);
    }
  } else if (manualAppName === '/insights/platform/provisioning') {
    addReviewField(values.meta?.account, providerReview.accountNumber);
  }

  const customCostGuide = CUSTOM_COST_GUIDES[provider ?? ''];
  const showCustomCostAlert = Boolean(
    customCostGuide &&
    manualAppName === '/insights/platform/cost-management' &&
    extra?.storage_only &&
    !hcsEnrolled,
  );

  const formatReviewValue = (value: unknown): React.ReactNode => {
    if (typeof value === 'boolean') {
      return (
        <Label color={value ? 'green' : 'grey'}>
          {intl.formatMessage(
            value ? providerReview.enabled : providerReview.disabled,
          )}
        </Label>
      );
    }

    return String(value);
  };

  const summary = (
    /*
      `tabIndex` because this is the only step with no inputs, and PatternFly's
      wizard body is a scrollable region: with nothing focusable inside it, a
      keyboard user has no way to scroll it (axe `scrollable-region-focusable`).
    */
    <DescriptionList
      isHorizontal
      tabIndex={0}
      horizontalTermWidthModifier={{ default: '200px' }}
    >
      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.wizardReviewType)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {provider ? providerLabel(provider, intl) : ''}
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.wizardReviewName)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {values.source?.name}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {workflow && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            {intl.formatMessage(messages.wizardConfigurationModeReviewLabel)}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {configurationModeLabel(workflow, intl)}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(
            isAccountAuthorization
              ? messages.wizardReviewApplicationsLabel
              : messages.wizardReviewApplicationLabel,
          )}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {selectedApplications.join(', ')}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {reviewFields.map(({ label, value }) =>
        value !== undefined && value !== '' ? (
          <DescriptionListGroup key={`${label.id}-${String(value)}`}>
            <DescriptionListTerm>
              {intl.formatMessage(label)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {formatReviewValue(value)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        ) : null,
      )}
      {provider === 'openshift' &&
        manualAppName === '/insights/platform/cost-management' &&
        values.source?.source_ref && (
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(providerReview.clusterId)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {values.source.source_ref}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      {provider === 'openshift' && !manualAppName && values.url && (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(providerReview.clusterUrl)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {values.url}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(providerReview.verifyTls)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {intl.formatMessage(
                values.endpoint?.verify_ssl
                  ? providerReview.enabled
                  : providerReview.disabled,
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(providerReview.ca)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {intl.formatMessage(
                values.endpoint?.certificate_authority
                  ? providerReview.provided
                  : providerReview.none,
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      )}
      {provider === 'azure' &&
        values.authentication?.extra?.azure?.tenant_id && (
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(providerReview.tenantId)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {values.authentication.extra.azure.tenant_id}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      {provider !== 'amazon' && credential && (
        <DescriptionListGroup>
          <DescriptionListTerm>
            {intl.formatMessage(
              provider === 'google'
                ? providerReview.projectId
                : authType === 'lighthouse_subscription_id'
                  ? providerReview.subscriptionId
                  : providerReview.clientId,
            )}
          </DescriptionListTerm>
          <DescriptionListDescription>{credential}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {provider !== 'amazon' &&
        authType !== 'empty' &&
        values.authentication?.password && (
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(providerReview.credential)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {intl.formatMessage(messages.wizardReviewSecretMasked)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      {provider === 'amazon' && credential && (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(messages.wizardReviewAuthType)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {authType ? authTypeLabel(authType, intl) : ''}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(
                isAccountAuthorization
                  ? messages.wizardAccessKeyIdLabel
                  : messages.wizardAwsRoleArn,
              )}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {isAccountAuthorization
                ? maskAccessKeyId(credential)
                : credential}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {isAccountAuthorization && (
            <DescriptionListGroup>
              <DescriptionListTerm>
                {intl.formatMessage(messages.wizardSecretAccessKeyLabel)}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {intl.formatMessage(messages.wizardReviewSecretMasked)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      )}
    </DescriptionList>
  );

  return (
    <>
      {summary}
      {showCustomCostAlert && (
        <Alert
          variant="info"
          isInline
          className="pf-v6-u-mt-md pf-v6-u-w-100"
          title={intl.formatMessage(providerReview.customCostTitle)}
          actionLinks={
            <a href={customCostGuide} target="_blank" rel="noopener noreferrer">
              {intl.formatMessage(providerReview.customCostLink, {
                application: intl.formatMessage(
                  messages.wizardAwsCostManagementName,
                ),
              })}
            </a>
          }
        >
          {intl.formatMessage(providerReview.customCostDescription)}
        </Alert>
      )}
      {provider === 'openshift' && (
        <Alert
          isInline
          className="pf-v6-u-mt-md pf-v6-u-w-100"
          title={intl.formatMessage(messages.wizardReviewPermissionsTitle)}
        >
          {intl.formatMessage(messages.wizardReviewPermissionsDescription)}
        </Alert>
      )}
    </>
  );
};

export default ReviewSummary;
