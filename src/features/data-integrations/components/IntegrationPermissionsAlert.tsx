import React from 'react';
import { useIntl } from 'react-intl';
import {
  Alert,
  AlertActionLink,
} from '@patternfly/react-core/dist/dynamic/components/Alert';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/dynamic/components/Content';
import LockIcon from '@patternfly/react-icons/dist/dynamic/icons/lock-icon';
import messages from '../messages';

const VIRTUAL_ASSISTANT_DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/get_started-ai_powered_support#virtual-assistant';

interface IntegrationPermissionsAlertProps {
  canWrite: boolean;
}

/** The shared non-admin state shown on both the About and list views. */
const IntegrationPermissionsAlert: React.FC<
  IntegrationPermissionsAlertProps
> = ({ canWrite }) => {
  const intl = useIntl();

  if (canWrite) {
    return null;
  }

  return (
    <Alert
      customIcon={<LockIcon />}
      variant="info"
      isInline
      isExpandable
      title={intl.formatMessage(messages.permissionsAlertTitle)}
      actionLinks={
        <AlertActionLink
          component="a"
          href={VIRTUAL_ASSISTANT_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {intl.formatMessage(messages.permissionsAlertLink)}
        </AlertActionLink>
      }
    >
      <Content>
        <Content component={ContentVariants.p}>
          {intl.formatMessage(messages.permissionsAlertDescription)}
        </Content>
      </Content>
    </Alert>
  );
};

export default IntegrationPermissionsAlert;
