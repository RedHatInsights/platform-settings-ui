import { useEffect, useMemo, useState } from 'react';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { IntlMessagesProvider, useChromeLocale } from './shared/i18n';

import ErrorBoundary from './Components/ErrorBoundary';
import Routing from './Routing';
import { QueryClientSetup } from './shared/QueryClientSetup';
import { ServiceProvider } from './shared/ServiceContext';
import { createBrowserServices } from './shared/AppServices.browser';
import './App.scss';

const AppWithServices = () => {
  const chrome = useChrome();
  const addNotification = useAddNotification();
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    chrome.auth
      .getUser()
      .then((user) => {
        setIsOrgAdmin(user?.identity?.user?.is_org_admin ?? false);
      })
      .catch(() => {
        setIsOrgAdmin(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing pattern
  }, []);

  const services = useMemo(
    () =>
      isOrgAdmin !== undefined
        ? createBrowserServices(chrome, addNotification, isOrgAdmin)
        : undefined,
    [chrome, addNotification, isOrgAdmin],
  );

  if (!services) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <ServiceProvider value={services}>
      <QueryClientSetup>
        <ErrorBoundary>
          <Routing />
        </ErrorBoundary>
      </QueryClientSetup>
    </ServiceProvider>
  );
};

const App = () => {
  const { updateDocumentTitle } = useChrome();
  const locale = useChromeLocale();

  useEffect(() => {
    updateDocumentTitle('Platform Settings');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing pattern
  }, []);

  return (
    <IntlMessagesProvider locale={locale}>
      <NotificationsProvider>
        <AppWithServices />
      </NotificationsProvider>
    </IntlMessagesProvider>
  );
};

export default App;
