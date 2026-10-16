import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';

const TEMPLATE =
  'https://provisioning-public-assets.s3.amazonaws.com/AzureLighthouse/offering_template.json';
const LIGHTHOUSE_LINK = `https://portal.azure.com/#create/Microsoft.Template/uri/${encodeURIComponent(TEMPLATE)}`;
const LIGHTHOUSE_CLICKED_FIELD = 'lighthouse-clicked';

const copy = defineMessages({
  lighthouse: {
    id: 'dataIntegrations.azureProvisioning.lighthouse',
    defaultMessage:
      "Complete configuration steps in Azure Lighthouse according to Microsoft instructions. When you're finished, return to this wizard to finish creating this Azure source.",
  },
  link: {
    id: 'dataIntegrations.azureProvisioning.link',
    defaultMessage: 'Take me to Lighthouse',
  },
  subscription: {
    id: 'dataIntegrations.azureProvisioning.subscription',
    defaultMessage:
      'Log in to your Azure account and navigate to your subscriptions. Copy the subscription ID you have connected through Lighthouse.',
  },
});

const AzureProvisioningInstructions: React.FC<{
  stage: 'lighthouse' | 'subscription';
}> = ({ stage }) => {
  const intl = useIntl();
  const form = useFormApi();

  if (stage === 'subscription') {
    return (
      <Content>
        <p>{intl.formatMessage(copy.subscription)}</p>
      </Content>
    );
  }

  return (
    <Content>
      <p>{intl.formatMessage(copy.lighthouse)}</p>
      <Button
        component="a"
        href={LIGHTHOUSE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        isBlock
        onClick={() => form.change(LIGHTHOUSE_CLICKED_FIELD, true)}
      >
        {intl.formatMessage(copy.link)}
      </Button>
    </Content>
  );
};

export default AzureProvisioningInstructions;
