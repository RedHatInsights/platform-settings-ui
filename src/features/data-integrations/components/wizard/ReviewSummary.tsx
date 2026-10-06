import React from 'react';
import { useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import messages from '../../messages';
import { useApplicationTypes } from '../../data/queries/useApplicationTypes';
import {
  authTypeLabel,
  buildApplicationOptions,
  configurationModeLabel,
  providerLabel,
} from './integrationWizardSchema';
import type { IntegrationWizardValues } from './integrationWizardSchema';

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

  /*
   * Only account authorization hands over a credential, so the rows that
   * describe one are absent for manual configuration rather than empty — a
   * blank "Access key ID" reads like something went missing.
   */
  const accessKeyId = values.authentication?.username;

  /*
   * Already fetched and cached by the wizard host, so this resolves from cache
   * rather than firing a second request. Ids are what the form carries; the
   * review needs the display names behind them.
   */
  const { data: applicationTypes } = useApplicationTypes();
  const selectedApplications = buildApplicationOptions(applicationTypes ?? [])
    .filter(({ value }) => values.applications?.includes(value))
    .map(({ label }) => label);

  return (
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
      {accessKeyId && (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(messages.wizardReviewAuthType)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {values.authentication?.authtype
                ? authTypeLabel(values.authentication.authtype, intl)
                : ''}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(messages.wizardAccessKeyIdLabel)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {maskAccessKeyId(accessKeyId)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(messages.wizardSecretAccessKeyLabel)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {intl.formatMessage(messages.wizardReviewSecretMasked)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      )}
    </DescriptionList>
  );
};

export default ReviewSummary;
