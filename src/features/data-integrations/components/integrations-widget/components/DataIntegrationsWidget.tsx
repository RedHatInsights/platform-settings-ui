import React from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Card,
  CardBody,
} from '@patternfly/react-core/dist/dynamic/components/Card';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { Gallery } from '@patternfly/react-core/dist/dynamic/layouts/Gallery';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Icon } from '@patternfly/react-core/dist/dynamic/components/Icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/plus-circle-icon';
import IntegrationsIcon from '@patternfly/react-icons/dist/dynamic/icons/integration-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/exclamation-circle-icon';
import { AppLink } from '../../../../../Components/AppLink';
import { useAppNavigate } from '../../../../../hooks/useAppNavigate';
import { useIntegrationCounts } from '../hooks/useIntegrationCounts';
import type { DataIntegrationProvider, IntegrationCounts } from '../types';
import messages from '../messages';
import './DataIntegrationsWidget.scss';

/**
 * Data integration providers shown in the widget.
 */
const PROVIDERS: DataIntegrationProvider[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    iconSrc: '/apps/frontend-assets/partners-icons/aws-logomark.svg',
    filterValue: 'amazon',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    iconSrc:
      '/apps/frontend-assets/partners-icons/microsoft-azure-logomark.svg',
    filterValue: 'azure',
  },
  {
    id: 'google_cloud',
    name: 'Google Cloud Platform',
    iconSrc: '/apps/frontend-assets/partners-icons/google-cloud-logomark.svg',
    filterValue: 'google',
  },
  {
    id: 'openshift',
    name: 'OpenShift Container Platform',
    iconSrc: '/apps/frontend-assets/technology-icons/openshift.svg',
    filterValue: 'openshift',
  },
];

interface DataIntegrationsWidgetProps {
  /** Override counts for testing */
  integrationCounts?: IntegrationCounts;
  /** Override loading state for testing */
  isLoading?: boolean;
}

/**
 * Data Integrations widget showing counts and quick actions for the 4
 * supported data integration providers: AWS, Azure, Google Cloud, and OpenShift.
 */
const DataIntegrationsWidget: React.FC<DataIntegrationsWidgetProps> = ({
  integrationCounts: propCounts,
  isLoading: propIsLoading = false,
}) => {
  const intl = useIntl();
  const appNavigate = useAppNavigate();

  // Use the hook to fetch counts, or use prop overrides for testing
  const {
    counts: fetchedCounts,
    isLoading: fetchedIsLoading,
    error,
  } = useIntegrationCounts();

  const counts = propCounts ?? fetchedCounts;
  // When count overrides are provided, ignore fetchedIsLoading
  const isLoading = propCounts
    ? propIsLoading
    : propIsLoading || fetchedIsLoading;

  const handleAddClick = (filterValue: string) => {
    // Navigate to data integrations page and open the wizard
    // This will be connected to the Add Data Integration wizard
    appNavigate(`/data-integrations?add=${filterValue}`);
  };

  const handleCountClick = (filterValue: string) => {
    // Navigate to "My data integrations" tab with the provider filter
    appNavigate(`/data-integrations?provider=${filterValue}`);
  };

  if (isLoading) {
    return (
      <Card
        className="data-integrations-widget"
        ouiaId="data-integrations-widget"
      >
        <CardBody>
          <Bullseye>
            <Spinner
              size="lg"
              aria-label={intl.formatMessage(messages.loadingIntegrations)}
            />
          </Bullseye>
        </CardBody>
      </Card>
    );
  }

  // Show error state if loading failed
  if (error && !propCounts) {
    return (
      <Card
        className="data-integrations-widget"
        ouiaId="data-integrations-widget"
      >
        <CardBody>
          <Bullseye>
            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <Icon status="danger" size="lg">
                <ExclamationCircleIcon />
              </Icon>
              <span>
                {intl.formatMessage(messages.errorLoadingIntegrations)}
              </span>
            </Flex>
          </Bullseye>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      className="data-integrations-widget"
      ouiaId="data-integrations-widget"
    >
      <CardBody>
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <Flex
                spaceItems={{ default: 'spaceItemsSm' }}
                alignItems={{ default: 'alignItemsCenter' }}
              >
                <Icon size="md">
                  <IntegrationsIcon />
                </Icon>
                <span className="pf-v6-u-font-weight-bold">
                  {intl.formatMessage(messages.widgetTitle)}
                </span>
              </Flex>
            </FlexItem>
            <FlexItem>
              <AppLink to="/data-integrations">
                {intl.formatMessage(messages.manageIntegrations)}
              </AppLink>
            </FlexItem>
          </Flex>

          <Gallery
            hasGutter
            minWidths={{
              default: '100%',
              md: 'calc(50% - var(--pf-v6-global--spacer--sm) / 2)',
            }}
          >
            {PROVIDERS.map((provider) => (
              <Card key={provider.id} isCompact>
                <CardBody>
                  <Flex
                    direction={{ default: 'column' }}
                    spaceItems={{ default: 'spaceItemsSm' }}
                  >
                    <Flex
                      justifyContent={{ default: 'justifyContentSpaceBetween' }}
                      alignItems={{ default: 'alignItemsFlexStart' }}
                    >
                      <FlexItem className="data-integrations-widget__provider-icon">
                        <img
                          src={provider.iconSrc}
                          alt=""
                          width={48}
                          height={48}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Button
                          variant="link"
                          icon={<PlusCircleIcon />}
                          onClick={() => handleAddClick(provider.filterValue)}
                          aria-label={`${intl.formatMessage(messages.addButton)} ${provider.name}`}
                        >
                          {intl.formatMessage(messages.addButton)}
                        </Button>
                      </FlexItem>
                    </Flex>

                    <FlexItem className="pf-v6-u-font-weight-bold">
                      {provider.name}
                    </FlexItem>

                    <FlexItem>
                      <Button
                        variant="link"
                        isInline
                        onClick={() => handleCountClick(provider.filterValue)}
                        className="pf-v6-u-p-0"
                      >
                        {intl.formatMessage(messages.integrationCount, {
                          count: counts[provider.id],
                        })}
                      </Button>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Gallery>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default DataIntegrationsWidget;
