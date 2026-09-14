import type { Preview } from '@storybook/react-webpack5';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';
// App.scss is imported by App.tsx, which stories never render, so app-wide
// styles have to be registered here as well.
import '../src/Components/PageHeaderIcon.scss';
import React, { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import {
  StorybookMockProvider,
  hccPreviewDefaults,
} from '@redhat-cloud-services/hcc-storybook-hub';
import Axios from 'axios';
import { ServiceProvider } from '../src/shared/ServiceContext';
import type { AppServices } from '../src/shared/AppServices.types';

const baseMockServices: Omit<AppServices, 'addNotification' | 'notify'> = {
  appAction: () => {},
  getToken: async () => 'mock-token',
  environment: 'stage',
  isOrgAdmin: true,
  fetchCVEs: async () => [],
  axios: Axios.create(),
};

const ServiceProviderWithNotifications: React.FC<{
  overrides?: Partial<AppServices>;
  children: React.ReactNode;
}> = ({ overrides, children }) => {
  const addNotification = useAddNotification();
  const services = useMemo<AppServices>(
    () => ({
      ...baseMockServices,
      addNotification,
      notify: (variant, title, description) =>
        addNotification({ variant, title, description }),
      ...overrides,
    }),
    [addNotification, overrides],
  );
  return <ServiceProvider value={services}>{children}</ServiceProvider>;
};

const preview: Preview = {
  ...hccPreviewDefaults,
  parameters: {
    ...hccPreviewDefaults.parameters,
    a11y: {
      config: {
        rules: [
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region', enabled: false },
        ],
      },
    },
  },
  decorators: [
    (Story, { parameters }) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: Infinity },
        },
      });
      return (
        <StorybookMockProvider
          bundle="settings"
          app="platform-settings"
          environment={
            parameters.environment === 'production' ? 'production' : 'stage'
          }
        >
          <IntlProvider locale="en" defaultLocale="en">
            <NotificationsProvider>
              <ServiceProviderWithNotifications overrides={parameters.services}>
                <QueryClientProvider client={queryClient}>
                  <Story />
                </QueryClientProvider>
              </ServiceProviderWithNotifications>
            </NotificationsProvider>
          </IntlProvider>
        </StorybookMockProvider>
      );
    },
  ],
};

export default preview;
