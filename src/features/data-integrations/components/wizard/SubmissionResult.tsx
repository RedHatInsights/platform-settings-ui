import React from 'react';
import { useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import WizardContext from '@data-driven-forms/react-form-renderer/wizard-context';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import CheckCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon';
import { AppLink } from '../../../../Components/AppLink';
import messages from '../../messages';
import { extractSourcesErrorDetail } from '../../data/errors';
import type { Source } from '../../data/types/sources.types';
import { WizardStepId } from './integrationWizardSchema';

/**
 * What the wizard shell tells the result step about the create call.
 *
 * A context rather than props because the step is a schema entry, so the
 * renderer — not us — decides when to mount it, and the component has to stay
 * in the static mapper that `IntegrationsFormRenderer` is built with.
 */
export interface WizardSubmissionState {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  createdSource?: Source;
  /** Clears the mutation and restarts the wizard from step one. */
  onAddAnother: () => void;
  /** Dismisses the wizard without the "are you sure" confirmation. */
  onClose: () => void;
}

export const WizardSubmissionContext =
  React.createContext<WizardSubmissionState | null>(null);

/**
 * The `submission-result` data-driven-forms component.
 *
 * Shown on the step flagged `isProgressAfterSubmissionStep`, which the mapper
 * renders in place of the entire wizard body while leaving the form mounted —
 * that is what lets the error view send the user back to review with
 * everything they typed still there.
 *
 * Retry re-runs the form's own `onSubmit` rather than calling the mutation
 * directly, so the payload is built one way only.
 */
const SubmissionResult: React.FC = () => {
  const intl = useIntl();
  const { submit } = useFormApi();
  const { jumpToStep, prevSteps } = React.useContext(WizardContext);
  const submission = React.useContext(WizardSubmissionContext);

  if (!submission || submission.isPending) {
    return (
      <EmptyState
        titleText={intl.formatMessage(messages.wizardResultSubmitting)}
        headingLevel="h2"
        icon={Spinner}
      />
    );
  }

  if (submission.isError) {
    return (
      <EmptyState
        status="danger"
        titleText={intl.formatMessage(messages.wizardResultErrorTitle)}
        headingLevel="h2"
        icon={ExclamationCircleIcon}
      >
        <EmptyStateBody>
          {/*
            The API's own reason when there is one — "Name has already been
            taken" tells the user what to change, where a generic failure
            message would send them round the loop again.
          */}
          {extractSourcesErrorDetail(submission.error) ??
            intl.formatMessage(messages.wizardResultErrorBody)}
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button variant="primary" onClick={() => submit()}>
              {intl.formatMessage(messages.wizardResultRetry)}
            </Button>
            <Button
              variant="link"
              onClick={() => jumpToStep(prevSteps.indexOf(WizardStepId.Review))}
            >
              {intl.formatMessage(messages.wizardResultEdit)}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  }

  const created = submission.createdSource;

  return (
    <EmptyState
      status="success"
      titleText={intl.formatMessage(messages.wizardResultSuccessTitle)}
      headingLevel="h2"
      icon={CheckCircleIcon}
    >
      <EmptyStateBody>
        {intl.formatMessage(messages.wizardResultSuccessBody, {
          name: created?.name,
        })}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          {created && (
            <Button
              variant="primary"
              component={(props) => (
                // Relative, so it resolves against this app's basename the
                // same way the table's row links do.
                <AppLink
                  {...props}
                  to={created.id}
                  onClick={submission.onClose}
                />
              )}
            >
              {intl.formatMessage(messages.wizardResultViewIntegration)}
            </Button>
          )}
          <Button variant="link" onClick={submission.onAddAnother}>
            {intl.formatMessage(messages.wizardResultAddAnother)}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default SubmissionResult;
