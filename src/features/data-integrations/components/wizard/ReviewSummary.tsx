import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
});

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
  const costFields: Array<[string, MessageDescriptor]> =
    manualAppName === '/insights/platform/cost-management'
      ? provider === 'azure'
        ? [
            ['resource_group', providerReview.resourceGroup],
            ['storage_account', providerReview.storageAccount],
            ['subscription_id', providerReview.subscription],
            ['scope', providerReview.scope],
            ['export_name', providerReview.exportName],
          ]
        : provider === 'google'
          ? [
              ['bucket', providerReview.bucket],
              ['dataset', providerReview.dataset],
            ]
          : []
      : [];

  const summary = (
    /*
      `tabIndex` because this is the only step with no inputs, and PatternFly's
      wizard body is a scrollable region: with nothing focusable inside it, a
      keyboard user has no way to scroll it (axe `scrollable-region-focusable`).
    */
    <DescriptionList isHorizontal tabIndex={0}>
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
          {intl.formatMessage(messages.wizardReviewApplicationsLabel)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {selectedApplications.join(', ')}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {costFields.map(([key, label]) =>
        typeof extra?.[key] === 'string' && extra[key] ? (
          <DescriptionListGroup key={key}>
            <DescriptionListTerm>
              {intl.formatMessage(label)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {String(extra[key])}
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
