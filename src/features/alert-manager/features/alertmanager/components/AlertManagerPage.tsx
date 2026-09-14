import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
// eslint-disable-next-line no-restricted-imports -- Page component needs chrome for document title
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import AlertManagerTable from './AlertManagerTable';
import messages from '../messages';

const NOTIFICATIONS_ICON =
  '/apps/frontend-assets/technology-icons/notifications.svg';

// The technology-icon SVGs declare width/height 100% with only a viewBox, so
// they have no intrinsic size and must be sized by the consumer. 48px is
// PageHeader's own icon slot width (its `iconMinWidth` rule).
const ICON_SIZE = 48;

const AlertManagerPage: React.FC = () => {
  const intl = useIntl();
  const { updateDocumentTitle, helpTopics } = useChrome();

  useEffect(() => {
    updateDocumentTitle?.(intl.formatMessage(messages.pageTitle));
  }, [updateDocumentTitle, intl]);

  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    helpTopics?.setActiveTopic?.('learn');
  };

  return (
    <>
      <PageHeader
        title={intl.formatMessage(messages.pageTitle)}
        subtitle={intl.formatMessage(messages.pageDescription)}
        icon={
          <img
            src={NOTIFICATIONS_ICON}
            alt=""
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
        }
        linkProps={{
          label: intl.formatMessage(messages.learnMore),
          isExternal: true,
          component: 'a',
          href: '#',
          onClick: handleLearnMore,
        }}
      />
      <Divider />
      <Main>
        <AlertManagerTable />
      </Main>
    </>
  );
};

export default AlertManagerPage;
