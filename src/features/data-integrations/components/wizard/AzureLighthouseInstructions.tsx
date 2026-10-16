import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import { useAzureLighthouseLink } from '../../data/queries/useAzureLighthouseLink';

const AZURE_DOCS =
  'https://learn.microsoft.com/en-us/azure/lighthouse/how-to/onboard-customer#deploy-the-azure-resource-manager-template';
const READER_DOCS =
  'https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/general#reader';
const ROLE_DOCS =
  'https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/management-and-governance#managed-services-registration-assignment-delete-role';
const LIGHTHOUSE_CLICKED_FIELD = 'lighthouse-clicked';

const messages = defineMessages({
  roleTitle: {
    id: 'dataIntegrations.azureLighthouse.roleTitle',
    defaultMessage: 'Azure role requirements',
  },
  roleRequirement: {
    id: 'dataIntegrations.azureLighthouse.roleRequirement',
    defaultMessage:
      'To complete this step, your Azure account must have the Owner role, at a minimum, for the selected subscription. View the {link} for more information.',
  },
  azureDocs: {
    id: 'dataIntegrations.azureLighthouse.azureDocs',
    defaultMessage: 'Azure documentation',
  },
  instructions: {
    id: 'dataIntegrations.azureLighthouse.instructions',
    defaultMessage:
      'In Azure Lighthouse, deploy the Azure Resource Manager custom template that connects your Red Hat and Azure accounts. When ready, click <b>Go to Lighthouse</b> and follow these instructions:',
  },
  select: {
    id: 'dataIntegrations.azureLighthouse.select',
    defaultMessage:
      'Select the Azure subscription that you want to use with RHEL management.',
  },
  review: {
    id: 'dataIntegrations.azureLighthouse.review',
    defaultMessage:
      'Edit any other instance details and click <b>Review + create</b>.',
  },
  create: {
    id: 'dataIntegrations.azureLighthouse.create',
    defaultMessage:
      'Click <b>Create</b> to run the deployment. This action creates two roles in your Azure account: {readerLink} and {roleLink}.',
  },
  reader: {
    id: 'dataIntegrations.azureLighthouse.reader',
    defaultMessage: 'Reader',
  },
  assignmentRole: {
    id: 'dataIntegrations.azureLighthouse.assignmentRole',
    defaultMessage: 'Managed Services Registration assignment Delete Role',
  },
  copyId: {
    id: 'dataIntegrations.azureLighthouse.copyId',
    defaultMessage:
      'When the deployment is complete, click <b>Go to subscription</b> and copy the <b>Subscription ID</b>.',
  },
  subscription: {
    id: 'dataIntegrations.azureLighthouse.subscription',
    defaultMessage:
      'Paste your Azure subscription ID from the previous step into the field below.',
  },
  link: {
    id: 'dataIntegrations.azureLighthouse.link',
    defaultMessage: 'Go to Lighthouse',
  },
  unavailable: {
    id: 'dataIntegrations.azureLighthouse.unavailable',
    defaultMessage:
      'There is an error with loading of the configuration. Please go back and return to this step.',
  },
});

const AzureLighthouseInstructions: React.FC<{
  stage?: 'intro' | 'subscription';
}> = ({ stage = 'intro' }) => {
  const intl = useIntl();
  const form = useFormApi();
  const { data: link, isError } = useAzureLighthouseLink(
    stage !== 'subscription',
  );

  if (stage === 'subscription') {
    return (
      <Content>
        <p>{intl.formatMessage(messages.subscription)}</p>
      </Content>
    );
  }

  return (
    <Content>
      <Alert
        isInline
        variant="info"
        title={intl.formatMessage(messages.roleTitle)}
      >
        <FormattedMessage
          {...messages.roleRequirement}
          values={{
            link: (
              <a href={AZURE_DOCS} target="_blank" rel="noopener noreferrer">
                {intl.formatMessage(messages.azureDocs)}
              </a>
            ),
          }}
        />
      </Alert>
      <p>
        <FormattedMessage
          {...messages.instructions}
          values={{ b: (chunks) => <strong>{chunks}</strong> }}
        />
      </p>
      <ol>
        <li>{intl.formatMessage(messages.select)}</li>
        <li>
          <FormattedMessage
            {...messages.review}
            values={{ b: (chunks) => <strong>{chunks}</strong> }}
          />
        </li>
        <li>
          <FormattedMessage
            {...messages.create}
            values={{
              b: (chunks) => <strong>{chunks}</strong>,
              readerLink: (
                <a href={READER_DOCS} target="_blank" rel="noopener noreferrer">
                  {intl.formatMessage(messages.reader)}
                </a>
              ),
              roleLink: (
                <a href={ROLE_DOCS} target="_blank" rel="noopener noreferrer">
                  {intl.formatMessage(messages.assignmentRole)}
                </a>
              ),
            }}
          />
        </li>
        <li>
          <FormattedMessage
            {...messages.copyId}
            values={{ b: (chunks) => <strong>{chunks}</strong> }}
          />
        </li>
      </ol>
      <Button
        component="a"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        icon={<ExternalLinkAltIcon />}
        iconPosition="end"
        isLoading={!link && !isError}
        isDisabled={!link}
        onClick={() => form.change(LIGHTHOUSE_CLICKED_FIELD, true)}
      >
        {intl.formatMessage(messages.link)}
      </Button>
      {isError && (
        <p role="alert">{intl.formatMessage(messages.unavailable)}</p>
      )}
    </Content>
  );
};

export default AzureLighthouseInstructions;
