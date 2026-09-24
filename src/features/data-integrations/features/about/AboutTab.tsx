import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Card,
  CardBody,
} from '@patternfly/react-core/dist/dynamic/components/Card';
import {
  Content,
  ContentVariants,
} from '@patternfly/react-core/dist/dynamic/components/Content';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Grid';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import UseCaseCard from './components/UseCaseCard';
import AddIntegrationWizard from '../../components/AddIntegrationWizard';
import messages from './messages';
import { DOCS_URL } from '../../constants/docs';
import type { SourceTypeName } from '../../types';

/**
 * Hero illustration, served by the Chrome shell from frontend-assets.
 *
 * Added by RedHatInsights/frontend-assets#338. It lives under technology-icons
 * and is named like an icon, but it is the 259x171 hero artwork rather than a
 * glyph — do not reuse it at icon sizes.
 *
 * Until that PR ships the request 404s and the hero renders text-only, which is
 * the graceful outcome: the illustration is decorative and carries nothing the
 * copy does not already say.
 */
const HERO_ILLUSTRATION =
  '/apps/frontend-assets/technology-icons/data-integrations-redesign.svg';

// Intrinsic dimensions of the asset. Both are set so the hero does not reflow
// when the image loads.
const HERO_ILLUSTRATION_WIDTH = 259;
const HERO_ILLUSTRATION_HEIGHT = 171;

/**
 * Learning resources is a Chrome-level page outside this app's route table, so
 * it needs a plain href rather than AppLink.
 */
const LEARNING_RESOURCES_URL = '/settings/learning-resources';

interface UseCase {
  sourceType: SourceTypeName;
  title: string;
  description: string;
}

export interface AboutTabProps {
  /**
   * Whether the reader may create integrations. RHCLOUD-50927 replaces this
   * default with the real Kessel permission check.
   */
  canWrite?: boolean;
}

/**
 * Onboarding tab for Data Integrations: what the feature does, which providers
 * it supports, and where to read more.
 */
const AboutTab: React.FC<AboutTabProps> = ({ canWrite = true }) => {
  const intl = useIntl();
  const [wizardSourceType, setWizardSourceType] =
    useState<SourceTypeName | null>(null);

  const useCases: UseCase[] = [
    {
      sourceType: 'amazon',
      title: intl.formatMessage(messages.amazonCardTitle),
      description: intl.formatMessage(messages.useCaseDescription, {
        provider: intl.formatMessage(messages.amazonShortName),
      }),
    },
    {
      sourceType: 'azure',
      title: intl.formatMessage(messages.azureCardTitle),
      description: intl.formatMessage(messages.useCaseDescription, {
        provider: intl.formatMessage(messages.azureShortName),
      }),
    },
    {
      sourceType: 'google',
      title: intl.formatMessage(messages.googleCardTitle),
      description: intl.formatMessage(messages.useCaseDescription, {
        provider: intl.formatMessage(messages.googleShortName),
      }),
    },
    {
      sourceType: 'openshift',
      title: intl.formatMessage(messages.openshiftCardTitle),
      // Its own sentence rather than the shared one: OpenShift is an
      // environment the reader runs, not an account they hold.
      description: intl.formatMessage(messages.useCaseDescriptionOpenshift),
    },
  ];

  return (
    <>
      {wizardSourceType && (
        <AddIntegrationWizard
          isOpen
          sourceType={wizardSourceType}
          onClose={() => setWizardSourceType(null)}
        />
      )}

      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsLg' }}
      >
        <FlexItem>
          <Card>
            <CardBody>
              <Flex
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                alignItems={{ default: 'alignItemsCenter' }}
                flexWrap={{ default: 'wrap' }}
              >
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Flex
                    direction={{ default: 'column' }}
                    spaceItems={{ default: 'spaceItemsMd' }}
                  >
                    <FlexItem>
                      <Content component={ContentVariants.h2}>
                        {intl.formatMessage(messages.heroTitle)}
                      </Content>
                    </FlexItem>
                    <FlexItem>
                      <Content component={ContentVariants.p}>
                        {intl.formatMessage(messages.heroDescription)}
                      </Content>
                    </FlexItem>
                    {/*
                      PLACEHOLDER ACTIONS — the mock never assigned these
                      buttons real copy or click targets. RHCLOUD-51526 supplies
                      both; until then they render inert so the section matches
                      the design without implying behaviour that does not exist.
                    */}
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          <Button
                            variant="primary"
                            ouiaId="hero-primary-action"
                          >
                            {intl.formatMessage(
                              messages.heroPrimaryActionPlaceholder,
                            )}
                          </Button>
                        </FlexItem>
                        <FlexItem>
                          <Button
                            variant="secondary"
                            ouiaId="hero-secondary-action"
                          >
                            {intl.formatMessage(
                              messages.heroSecondaryActionPlaceholder,
                            )}
                          </Button>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <img
                    src={HERO_ILLUSTRATION}
                    alt=""
                    width={HERO_ILLUSTRATION_WIDTH}
                    height={HERO_ILLUSTRATION_HEIGHT}
                  />
                </FlexItem>
              </Flex>
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Card>
            <CardBody>
              <Flex
                direction={{ default: 'column' }}
                spaceItems={{ default: 'spaceItemsMd' }}
              >
                <FlexItem>
                  <Content component={ContentVariants.h2}>
                    {intl.formatMessage(messages.useCasesTitle)}
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Grid hasGutter>
                    {useCases.map(({ sourceType, title, description }) => (
                      <GridItem key={sourceType} span={12} md={6}>
                        <UseCaseCard
                          sourceType={sourceType}
                          title={title}
                          description={description}
                          canWrite={canWrite}
                          onAddIntegration={setWizardSourceType}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                </FlexItem>
              </Flex>
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Card>
            <CardBody>
              <Flex
                direction={{ default: 'column' }}
                spaceItems={{ default: 'spaceItemsMd' }}
              >
                <FlexItem>
                  <Content component={ContentVariants.h2}>
                    {intl.formatMessage(messages.recommendedContentTitle)}
                  </Content>
                  <Content component={ContentVariants.h3}>
                    {intl.formatMessage(messages.recommendedContentSubtitle)}
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Content component={ContentVariants.p}>
                    {intl.formatMessage(messages.recommendedContentBody)}
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="primary"
                    component="a"
                    href={DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="end"
                    ouiaId="read-documentation"
                  >
                    {intl.formatMessage(messages.readDocumentation)}
                  </Button>
                </FlexItem>
              </Flex>
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Button
            variant="link"
            isInline
            component="a"
            href={LEARNING_RESOURCES_URL}
            ouiaId="view-learning-resources"
          >
            {intl.formatMessage(messages.viewLearningResources)}
          </Button>
        </FlexItem>
      </Flex>
    </>
  );
};

export default AboutTab;
