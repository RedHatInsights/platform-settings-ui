import React from 'react';
import { useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import messages from '../../messages';
import { useApplicationTypes } from '../../data/queries/useApplicationTypes';
import {
  WizardStepId,
  authTypeLabel,
  buildApplicationOptions,
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
 * A custom component rather than plain text for two reasons: plain text cannot
 * subscribe to form state, and the rows need Edit buttons that jump back. The
 * step has no inputs of its own, so reading values once from `getState()` is
 * safe — nothing can change them while this is mounted.
 *
 * `jumpToStep` indexes into `prevSteps`, not the schema, and is deliberately
 * called without `valid` — passing `valid: false` truncates the history the
 * user would otherwise walk forward through.
 */
const ReviewSummary: React.FC = () => {
  const intl = useIntl();
  const { getState } = useFormApi();
  const { jumpToStep, prevSteps } = React.useContext(WizardContext);

  const values = getState().values as IntegrationWizardValues;
  const provider = values.source_type;
  const accessKeyId = values.authentication?.username ?? '';

  /*
   * Already fetched and cached by the wizard host, so this resolves from cache
   * rather than firing a second request. Ids are what the form carries; the
   * review needs the display names behind them.
   */
  const { data: applicationTypes } = useApplicationTypes();
  const selectedApplications = buildApplicationOptions(applicationTypes ?? [])
    .filter(({ value }) => values.applications?.includes(value))
    .map(({ label }) => label);

  const editStep = (step: WizardStepId) => () => {
    jumpToStep(prevSteps.indexOf(step));
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList isHorizontal>
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
          <DescriptionListGroup>
            <DescriptionListTerm>
              {intl.formatMessage(messages.wizardReviewApplicationsLabel)}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {selectedApplications.join(', ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
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
        </DescriptionList>
      </StackItem>
      <StackItem>
        {/*
          Two Edit buttons, distinctly named: "Edit" twice would give the step
          two controls with the same accessible name and no way to tell them
          apart out of context.
        */}
        <Button
          variant="link"
          isInline
          onClick={editStep(WizardStepId.NameIntegration)}
        >
          {intl.formatMessage(messages.wizardReviewEditDetails)}
        </Button>{' '}
        <Button
          variant="link"
          isInline
          onClick={editStep(WizardStepId.AuthCredentials)}
        >
          {intl.formatMessage(messages.wizardReviewEditCredentials)}
        </Button>
      </StackItem>
    </Stack>
  );
};

export default ReviewSummary;
