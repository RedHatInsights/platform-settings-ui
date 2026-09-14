import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/dynamic/components/Content';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import { Flex } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { FlexItem } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import { Card } from '@patternfly/react-core/dist/dynamic/components/Card';
import { CardTitle } from '@patternfly/react-core/dist/dynamic/components/Card';
import { CardBody } from '@patternfly/react-core/dist/dynamic/components/Card';
import { CardFooter } from '@patternfly/react-core/dist/dynamic/components/Card';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Grid } from '@patternfly/react-core/dist/dynamic/layouts/Grid';
import { GridItem } from '@patternfly/react-core/dist/dynamic/layouts/Grid';
import { List } from '@patternfly/react-core/dist/dynamic/components/List';
import { ListItem } from '@patternfly/react-core/dist/dynamic/components/List';
import AngleRightIcon from '@patternfly/react-icons/dist/js/icons/angle-right-icon';
import AngleDownIcon from '@patternfly/react-icons/dist/js/icons/angle-down-icon';
import BellIcon from '@patternfly/react-icons/dist/js/icons/bell-icon';
import DataSourceIcon from '@patternfly/react-icons/dist/js/icons/data-source-icon';
import UserIcon from '@patternfly/react-icons/dist/js/icons/user-icon';
import ColumnsIcon from '@patternfly/react-icons/dist/js/icons/columns-icon';
import PortIcon from '@patternfly/react-icons/dist/js/icons/port-icon';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
// eslint-disable-next-line no-restricted-imports -- Page component needs chrome for document title
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { AppLink } from '../../../../../Components/AppLink';
import messages from '../messages';
import './AboutPage.scss';

const SETTINGS_ICON = '/apps/frontend-assets/technology-icons/settings.svg';

// The technology-icon SVGs declare width/height 100% with only a viewBox, so
// they have no intrinsic size and must be sized by the consumer. 48px is
// PageHeader's own icon slot width (its `iconMinWidth` rule).
const ICON_SIZE = 48;

interface UseCaseRowProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  isLast?: boolean;
}

const UseCaseRow: React.FC<UseCaseRowProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  icon,
  defaultExpanded = false,
  isLast = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <>
      <CardBody
        className={isExpanded ? 'settings-overview-use-case-body-expanded' : ''}
      >
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
        >
          <FlexItem>
            <Button
              variant="plain"
              onClick={() => setIsExpanded(!isExpanded)}
              className="settings-overview-use-case-toggle"
              aria-expanded={isExpanded}
            >
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsSm' }}
              >
                <FlexItem>
                  {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
                </FlexItem>
                <FlexItem>{icon}</FlexItem>
                <FlexItem>
                  <Title headingLevel="h4" size="md">
                    {title}
                  </Title>
                </FlexItem>
              </Flex>
            </Button>
          </FlexItem>
          <FlexItem>
            <AppLink to={buttonLink} className="pf-v6-c-button pf-m-secondary">
              {buttonText}
            </AppLink>
          </FlexItem>
        </Flex>
        {isExpanded && (
          <div className="settings-overview-use-case-description pf-v6-u-p-md pf-v6-u-mt-md">
            <Content component={ContentVariants.p}>{description}</Content>
          </div>
        )}
      </CardBody>
      {!isLast && <Divider />}
    </>
  );
};

const AboutPage: React.FC = () => {
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
            src={SETTINGS_ICON}
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
      <section className="pf-v6-u-p-lg">
        <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
          {intl.formatMessage(messages.sectionHeading)}
        </Title>
        <Grid hasGutter>
          {/* Alert Manager and Data Integrations cards */}
          <GridItem md={12} lg={6}>
            <Card isFullHeight>
              <CardTitle>
                <Flex
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  <FlexItem>
                    <BellIcon />
                  </FlexItem>
                  <FlexItem>
                    {intl.formatMessage(messages.alertManagerTitle)}
                  </FlexItem>
                </Flex>
              </CardTitle>
              <CardBody>
                {intl.formatMessage(messages.alertManagerDescription)}
              </CardBody>
              <CardFooter>
                <AppLink to="../alertmanager">
                  <Button variant="primary">
                    {intl.formatMessage(messages.alertManagerButton)}
                  </Button>
                </AppLink>
              </CardFooter>
            </Card>
          </GridItem>

          <GridItem md={12} lg={6}>
            <Card isFullHeight>
              <CardTitle>
                <Flex
                  spaceItems={{ default: 'spaceItemsSm' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                >
                  <FlexItem>
                    <DataSourceIcon />
                  </FlexItem>
                  <FlexItem>
                    {intl.formatMessage(messages.dataIntegrationsTitle)}
                  </FlexItem>
                </Flex>
              </CardTitle>
              <CardBody>
                {intl.formatMessage(messages.dataIntegrationsDescription)}
              </CardBody>
              <CardFooter>
                <AppLink to="../data-integrations">
                  <Button variant="secondary">
                    {intl.formatMessage(messages.dataIntegrationsButton)}
                  </Button>
                </AppLink>
              </CardFooter>
            </Card>
          </GridItem>

          {/* Use cases card - full width */}
          <GridItem md={12}>
            <Card>
              <CardTitle>
                {intl.formatMessage(messages.useCasesTitle)}
              </CardTitle>
              <Divider />
              <UseCaseRow
                title={intl.formatMessage(messages.useCase1Title)}
                description={intl.formatMessage(messages.useCase1Description)}
                buttonText={intl.formatMessage(messages.useCase1Button)}
                buttonLink="../alertmanager"
                icon={<UserIcon className="settings-overview-use-case-icon" />}
                defaultExpanded
              />
              <UseCaseRow
                title={intl.formatMessage(messages.useCase2Title)}
                description={intl.formatMessage(messages.useCase2Description)}
                buttonText={intl.formatMessage(messages.useCase2Button)}
                buttonLink="../alertmanager"
                icon={
                  <ColumnsIcon className="settings-overview-use-case-icon" />
                }
              />
              <UseCaseRow
                title={intl.formatMessage(messages.useCase3Title)}
                description={intl.formatMessage(messages.useCase3Description)}
                buttonText={intl.formatMessage(messages.useCase3Button)}
                buttonLink="../eventlog"
                icon={<PortIcon className="settings-overview-use-case-icon" />}
              />
              <UseCaseRow
                title={intl.formatMessage(messages.useCase4Title)}
                description={intl.formatMessage(messages.useCase4Description)}
                buttonText={intl.formatMessage(messages.useCase4Button)}
                buttonLink="../data-integrations"
                icon={
                  <DataSourceIcon className="settings-overview-use-case-icon" />
                }
                isLast
              />
            </Card>
          </GridItem>

          {/* Recommended content card - full width */}
          <GridItem md={12}>
            <Card>
              <CardTitle>
                {intl.formatMessage(messages.recommendedContentTitle)}
              </CardTitle>
              <CardBody>
                <List isPlain>
                  <ListItem>
                    <AppLink to="../alertmanager">
                      {intl.formatMessage(messages.recommendedItem1)}
                    </AppLink>
                  </ListItem>
                  <ListItem>
                    <AppLink to="../data-integrations">
                      {intl.formatMessage(messages.recommendedItem2)}
                    </AppLink>
                  </ListItem>
                  <ListItem>
                    <a
                      href="https://access.redhat.com/documentation/en-us/red_hat_hybrid_cloud_console"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {intl.formatMessage(messages.recommendedItem3)}
                    </a>
                  </ListItem>
                </List>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </section>
    </>
  );
};

export default AboutPage;
