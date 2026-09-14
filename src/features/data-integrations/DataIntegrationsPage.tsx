import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Outlet, useLocation } from 'react-router-dom';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import {
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core/dist/dynamic/components/Tabs';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
// eslint-disable-next-line no-restricted-imports -- Page component needs chrome for document title
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useAppNavigate } from '../../hooks/useAppNavigate';
import AddDataIntegrationDropdown from './components/AddDataIntegrationDropdown';
import messages from './messages';

const DOCS_URL =
  'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html-single/configuring_cloud_integrations_for_red_hat_services/index';

const INTEGRATIONS_ICON =
  '/apps/frontend-assets/technology-icons/integrations.svg';

// The technology-icon SVGs declare width/height 100% with only a viewBox, so
// they have no intrinsic size and must be sized by the consumer. 48px is
// PageHeader's own icon slot width (`iconMinWidth`), and matches Event Log.
const ICON_SIZE = 48;

type TabKey = 'my-integrations' | 'about';

const DataIntegrationsPage: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const appNavigate = useAppNavigate();
  const { updateDocumentTitle } = useChrome();

  useEffect(() => {
    updateDocumentTitle?.(intl.formatMessage(messages.pageTitle));
  }, [updateDocumentTitle, intl]);

  // Derived from the URL rather than held in state, so the active tab survives
  // a reload and can be deep-linked.
  const activeTab: TabKey = location.pathname.endsWith('/about')
    ? 'about'
    : 'my-integrations';

  const handleTabSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    tabKey: string | number,
  ) => {
    // useAppNavigate prefixes the Chrome basename, which resolves to
    // /settings/data-integrations on both of these routes.
    appNavigate(tabKey === 'about' ? 'about' : '');
  };

  return (
    <>
      <PageHeader
        ouiaId="data-integrations-header"
        title={intl.formatMessage(messages.pageTitle)}
        subtitle={intl.formatMessage(messages.pageDescription)}
        icon={
          <img
            src={INTEGRATIONS_ICON}
            alt=""
            width={ICON_SIZE}
            height={ICON_SIZE}
          />
        }
        linkProps={{
          label: intl.formatMessage(messages.learnMore),
          isExternal: true,
          component: 'a',
          href: DOCS_URL,
          target: '_blank',
          rel: 'noopener noreferrer',
        }}
        actionMenu={<AddDataIntegrationDropdown />}
      />
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabSelect}
        aria-label={intl.formatMessage(messages.tabsAriaLabel)}
        role="region"
        inset={{
          default: 'insetNone',
          md: 'insetSm',
          xl: 'insetLg',
          '2xl': 'inset2xl',
        }}
      >
        <Tab
          eventKey="my-integrations"
          title={
            <TabTitleText>
              {intl.formatMessage(messages.myDataIntegrationsTab)}
            </TabTitleText>
          }
        />
        <Tab
          eventKey="about"
          title={
            <TabTitleText>{intl.formatMessage(messages.aboutTab)}</TabTitleText>
          }
        />
      </Tabs>
      <Divider />
      <Main>
        <Outlet />
      </Main>
    </>
  );
};

export default DataIntegrationsPage;
