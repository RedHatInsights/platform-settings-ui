import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
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
      'Your Azure account must have at least the Owner role for the selected subscription.',
  },
  azureDocs: {
    id: 'dataIntegrations.azureLighthouse.azureDocs',
    defaultMessage: 'Azure documentation',
  },
  instructions: {
    id: 'dataIntegrations.azureLighthouse.instructions',
    defaultMessage:
      'In Azure Lighthouse, deploy the Azure Resource Manager custom template that connects your Red Hat and Azure accounts. Click Go to Lighthouse and follow these instructions:',
  },
  select: {
    id: 'dataIntegrations.azureLighthouse.select',
    defaultMessage:
      'Select the Azure subscription that you want to use with RHEL management.',
  },
  review: {
    id: 'dataIntegrations.azureLighthouse.review',
    defaultMessage:
      'Edit any other instance details and click Review + create.',
  },
  create: {
    id: 'dataIntegrations.azureLighthouse.create',
    defaultMessage:
      'Click Create to run the deployment. This creates two roles in your Azure account:',
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
      'When deployment is complete, click Go to subscription and copy the Subscription ID.',
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
      'The Azure Lighthouse link could not be loaded. Please return to this step and try again.',
  },
  and: {
    id: 'dataIntegrations.azureLighthouse.and',
    defaultMessage: 'and',
  },
});

const AzureLighthouseInstructions: React.FC<{
  stage?: 'intro' | 'subscription';
}> = ({ stage = 'intro' }) => {
  const intl = useIntl();
  const form = useFormApi();
  const { data: link, isError } = useAzureLighthouseLink();

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
        {intl.formatMessage(messages.roleRequirement)}{' '}
        <a href={AZURE_DOCS} target="_blank" rel="noopener noreferrer">
          {intl.formatMessage(messages.azureDocs)}
        </a>
      </Alert>
      <p>{intl.formatMessage(messages.instructions)}</p>
      <ol>
        <li>{intl.formatMessage(messages.select)}</li>
        <li>{intl.formatMessage(messages.review)}</li>
        <li>
          {intl.formatMessage(messages.create)}{' '}
          <a href={READER_DOCS} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages.reader)}
          </a>{' '}
          {intl.formatMessage(messages.and)}{' '}
          <a href={ROLE_DOCS} target="_blank" rel="noopener noreferrer">
            {intl.formatMessage(messages.assignmentRole)}
          </a>
        </li>
        <li>{intl.formatMessage(messages.copyId)}</li>
      </ol>
      {link && (
        <Button
          component="a"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => form.change(LIGHTHOUSE_CLICKED_FIELD, true)}
        >
          {intl.formatMessage(messages.link)}
        </Button>
      )}
      {isError && (
        <p role="alert">{intl.formatMessage(messages.unavailable)}</p>
      )}
    </Content>
  );
};

export default AzureLighthouseInstructions;
