import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useIntl } from 'react-intl';
import { useAppNavigate } from '../../../../hooks/useAppNavigate';
import { useAppServices } from '../../../../shared/ServiceContext';
import {
  SourceNotFoundError,
  useApplicationTypes,
  useSource,
  useSourceTypes,
} from '../../index';
import { SourceHeader } from './components/SourceHeader';
import { SourceFormFields } from './components/SourceFormFields';
import { ConnectedApplicationsSection } from './components/ConnectedApplicationsSection';
import messages from './messages';

/**
 * Source detail/edit view page for Data Integrations.
 *
 * Displays and allows viewing (future: editing) of a single data integration.
 * Users navigate here by clicking a source name in the table.
 *
 * Route: `/settings/data-integrations/:sourceId`
 *
 * Phase 1 (current): All fields are read-only. Save, Pause, and Delete actions
 * show "coming soon" messages.
 *
 * Future phases will enable full edit and action functionality.
 */
const SourceDetailPage: React.FC = () => {
  const intl = useIntl();
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useAppNavigate();
  const { isOrgAdmin, notify, updateDocumentTitle } = useAppServices();

  // Data fetching
  const { data: source, isLoading, isError, error } = useSource(sourceId ?? '');
  const {
    data: sourceTypes = [],
    isLoading: isLoadingTypes,
    isError: isSourceTypesError,
  } = useSourceTypes();
  const { data: applicationTypes = [] } = useApplicationTypes();

  // Find the source type for this source
  const sourceType = sourceTypes.find(
    (type) => type.id === source?.source_type_id,
  );

  // Update document title when source loads
  useEffect(() => {
    if (source?.name) {
      updateDocumentTitle(source.name);
    }
  }, [source?.name, updateDocumentTitle]);

  // Loading state - wait for both source and source types
  if (isLoading || isLoadingTypes) {
    return (
      <Main>
        <Bullseye>
          <Spinner size="lg" aria-label="Loading source details" />
        </Bullseye>
      </Main>
    );
  }

  // Error state - source types failed to load
  if (isSourceTypesError) {
    return (
      <Main>
        <Bullseye>
          <EmptyState>
            <ExclamationCircleIcon
              style={{
                fontSize: '4rem',
                color:
                  'var(--pf-t--global--icon--color--status--danger--default)',
                marginBottom: 'var(--pf-t--global--spacer--md)',
              }}
            />
            <Title headingLevel="h1" size="lg">
              {intl.formatMessage(messages.loadFailedTitle)}
            </Title>
            <EmptyStateBody>
              {intl.formatMessage(messages.loadFailedMessage)}
            </EmptyStateBody>
            <EmptyStateFooter>
              <Button variant="primary" onClick={() => navigate('')}>
                {intl.formatMessage(messages.backToListLink)}
              </Button>
            </EmptyStateFooter>
          </EmptyState>
        </Bullseye>
      </Main>
    );
  }

  // Error state - source not found or failed to load
  if (isError) {
    const is404 = error instanceof SourceNotFoundError;

    return (
      <Main>
        <Bullseye>
          <EmptyState>
            <ExclamationCircleIcon
              style={{
                fontSize: '4rem',
                color:
                  'var(--pf-t--global--icon--color--status--danger--default)',
                marginBottom: 'var(--pf-t--global--spacer--md)',
              }}
            />
            <Title headingLevel="h1" size="lg">
              {is404
                ? intl.formatMessage(messages.sourceNotFoundTitle)
                : intl.formatMessage(messages.loadFailedTitle)}
            </Title>
            <EmptyStateBody>
              {is404
                ? intl.formatMessage(messages.sourceNotFoundMessage)
                : intl.formatMessage(messages.loadFailedMessage)}
            </EmptyStateBody>
            <EmptyStateFooter>
              <Button variant="primary" onClick={() => navigate('')}>
                {intl.formatMessage(messages.backToListLink)}
              </Button>
            </EmptyStateFooter>
          </EmptyState>
        </Bullseye>
      </Main>
    );
  }

  // Should not happen (isLoading handles this), but TypeScript guard
  if (!source) {
    return null;
  }

  // Action handlers (deferred functionality)
  const handleSave = () => {
    notify('info', intl.formatMessage(messages.saveComingSoon));
  };

  const handleCancel = () => {
    navigate(''); // Navigate to /settings/data-integrations (useAppNavigate handles basename)
  };

  return (
    <Main>
      <Stack hasGutter>
        <StackItem>
          <SourceHeader
            source={source}
            sourceType={sourceType}
            isOrgAdmin={isOrgAdmin}
          />
        </StackItem>

        <StackItem>
          <Divider />
        </StackItem>

        <StackItem>
          <SourceFormFields source={source} sourceType={sourceType} />
        </StackItem>

        <StackItem>
          <ConnectedApplicationsSection
            source={source}
            applicationTypes={applicationTypes}
          />
        </StackItem>

        <StackItem>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>
              <Button variant="primary" onClick={handleSave}>
                {intl.formatMessage(messages.saveButton)}
              </Button>
            </FlexItem>
            <FlexItem>
              <Button variant="secondary" onClick={handleCancel}>
                {intl.formatMessage(messages.cancelButton)}
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    </Main>
  );
};

export default SourceDetailPage;
