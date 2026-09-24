import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Outlet, useMatch, useSearchParams } from 'react-router-dom';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import {
  Tab,
  TabTitleIcon,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core/dist/dynamic/components/Tabs';
import InfoCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/info-circle-icon';
import ListIcon from '@patternfly/react-icons/dist/dynamic/icons/list-icon';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
// eslint-disable-next-line no-restricted-imports -- Page component needs chrome for document title
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import AddDataIntegrationDropdown from './components/AddDataIntegrationDropdown';
import AboutTab from './features/about/AboutTab';
import messages from './messages';
import { DOCS_URL } from './constants/docs';
import type { SourceTypeName } from './types';

const INTEGRATIONS_ICON =
  '/apps/frontend-assets/technology-icons/integrations.svg';

// The technology-icon SVGs declare width/height 100% with only a viewBox, so
// they have no intrinsic size and must be sized by the consumer. 48px is
// PageHeader's own icon slot width (`iconMinWidth`), and matches Event Log.
const ICON_SIZE = 48;

type TabKey = 'my-integrations' | 'about';

const DataIntegrationsPage: React.FC = () => {
  const intl = useIntl();
  const { updateDocumentTitle } = useChrome();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    updateDocumentTitle?.(intl.formatMessage(messages.pageTitle));
  }, [updateDocumentTitle, intl]);

  // Consume query parameters emitted by widgets and other entry points.
  // - add=<provider>: Open the Add Data Integration wizard with the specified provider
  // - provider=<provider>: Filter the My data integrations table by provider (RHCLOUD-50925)
  const addParam = searchParams.get('add') as SourceTypeName | null;
  const providerParam = searchParams.get('provider');

  // Clear query params after reading them to prevent re-triggering on navigation
  useEffect(() => {
    if (addParam || providerParam) {
      setSearchParams({}, { replace: true });
    }
  }, [addParam, providerParam, setSearchParams]);

  // TODO: Pass providerParam to MyDataIntegrationsTab when RHCLOUD-50925 lands
  // to pre-filter the table by the selected provider.

  // Use React Router's useMatch for reliable route detection
  const detailMatch = useMatch('/settings/data-integrations/:sourceId');

  // Read active tab from query params (?tab=about)
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = tabParam === 'about' ? 'about' : 'my-integrations';

  // Check if we're on a detail page using route matching
  const isDetailPage = !!detailMatch;

  const handleTabSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    tabKey: string | number,
  ) => {
    // Update query params to switch tabs
    if (tabKey === 'about') {
      setSearchParams({ tab: 'about' });
    } else {
      // Remove tab param for default (my-integrations)
      setSearchParams({});
    }
  };

  // Detail pages render standalone without the parent header/tabs
  if (isDetailPage) {
    return <Outlet />;
  }

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
        actionMenu={<AddDataIntegrationDropdown initialSourceType={addParam} />}
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
            <>
              <TabTitleIcon>
                <ListIcon />
              </TabTitleIcon>
              <TabTitleText>
                {intl.formatMessage(messages.myDataIntegrationsTab)}
              </TabTitleText>
            </>
          }
        />
        <Tab
          eventKey="about"
          title={
            <>
              <TabTitleIcon>
                <InfoCircleIcon />
              </TabTitleIcon>
              <TabTitleText>
                {intl.formatMessage(messages.aboutTab)}
              </TabTitleText>
            </>
          }
        />
      </Tabs>
      <Divider />
      <Main>{activeTab === 'about' ? <AboutTab /> : <Outlet />}</Main>
    </>
  );
};

export default DataIntegrationsPage;
