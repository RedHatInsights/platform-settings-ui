import React from 'react';
import FormSpy from '@data-driven-forms/react-form-renderer/form-spy';
import { useIntl } from 'react-intl';
import messages from '../../messages';
import type { SourceTypeName } from '../../types';

const providerMessages = {
  openshift: messages.openshiftLabel,
  amazon: messages.amazonLabel,
  google: messages.googleLabel,
  azure: messages.azureLabel,
} as const;

const ProviderNameDescription: React.FC = () => {
  const intl = useIntl();

  return (
    <FormSpy subscription={{ values: true }}>
      {({ values }) => {
        const provider = values.source_type as SourceTypeName | undefined;
        const providerMessage = provider
          ? providerMessages[provider]
          : undefined;

        return providerMessage
          ? intl.formatMessage(messages.wizardNameStepDescription, {
              provider: intl.formatMessage(providerMessage),
            })
          : null;
      }}
    </FormSpy>
  );
};

export default ProviderNameDescription;
