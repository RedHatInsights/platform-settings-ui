import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import {
  ClipboardCopy,
  ClipboardCopyVariant,
} from '@patternfly/react-core/dist/dynamic/components/ClipboardCopy';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';

const TOKEN_URL = 'https://access.redhat.com/management/api';
const INSTALL_COMMAND =
  'ansible-galaxy collection install redhatinsights.subscriptions';

const messages = defineMessages({
  token: {
    id: 'dataIntegrations.rhelManagement.token',
    defaultMessage:
      'Generate a token to authenticate the calls to APIs for Red Hat services.',
  },
  tokenLink: {
    id: 'dataIntegrations.rhelManagement.tokenLink',
    defaultMessage: 'To obtain an offline token, follow the steps at {link}.',
  },
  azurePlaybook: {
    id: 'dataIntegrations.rhelManagement.azurePlaybook',
    defaultMessage:
      'Download and run the following commands against a running Azure VM.',
  },
  googlePlaybook: {
    id: 'dataIntegrations.rhelManagement.googlePlaybook',
    defaultMessage:
      'Download and run the following commands against a running Google Cloud VM.',
  },
});

const RhelManagementInstructions: React.FC<{
  provider: 'azure' | 'google';
  stage: 'token' | 'playbook';
}> = ({ provider, stage }) => {
  const intl = useIntl();
  const host = provider === 'azure' ? 'AZURE_VM_HOSTNAME' : 'GCE_VM_HOSTNAME';

  return (
    <Content>
      {stage === 'token' ? (
        <>
          <p>{intl.formatMessage(messages.token)}</p>
          <ol>
            <li>
              <FormattedMessage
                {...messages.tokenLink}
                values={{
                  link: (
                    <a
                      href={TOKEN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {TOKEN_URL}
                    </a>
                  ),
                }}
              />
            </li>
          </ol>
        </>
      ) : (
        <>
          <p>
            {intl.formatMessage(
              provider === 'azure'
                ? messages.azurePlaybook
                : messages.googlePlaybook,
            )}
          </p>
          <ClipboardCopy className="pf-v6-u-mb-lg">
            {INSTALL_COMMAND}
          </ClipboardCopy>
          <ClipboardCopy
            variant={
              provider === 'google' ? ClipboardCopyVariant.expansion : undefined
            }
          >
            {`ansible-playbook -i <${host}>, -b ~/.ansible/collections/ansible_collections/redhatinsights/subscriptions/playbooks/verify_account.yml -e rh_api_refresh_token=<OFFLINE_AUTH_TOKEN>`}
          </ClipboardCopy>
        </>
      )}
    </Content>
  );
};

export default RhelManagementInstructions;
