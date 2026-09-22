import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
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
 * Reads the sources table's query string back out of router history state.
 *
 * `SourcesTable` stashes it under `from` when it renders a source link, so
 * returning to the list can restore the page, page size, sort, and filters the
 * user had set. History state is user-writable, so it is narrowed rather than
 * asserted; anything unexpected falls back to the default list view, which is
 * also what a deep link into this page gets.
 */
const listSearchFrom = (state: unknown): string => {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return '';
  }

  const { from } = state as { from: unknown };
  return typeof from === 'string' ? from : '';
};

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
  const { state } = useLocation();
  const { isOrgAdmin, notify, updateDocumentTitle } = useAppServices();

  /**
   * `useAppNavigate` prefixes the basename, so a bare query string resolves to
   * the list route — `/settings/data-integrations/?page=2&perPage=100`. An
   * empty string is the plain list, which is the pre-existing behaviour.
   */
  const backToList = () => navigate(listSearchFrom(state));

  /**
   * Both failure modes — source types unavailable and the source itself
   * missing — render the same empty state, so they share one renderer.
   *
   * `status` and `icon` let PatternFly own the icon's size, colour, and
   * spacing; styling them here would pin us to the current PF theme tokens.
   */
  const renderError = (title: string, body: string) => (
    <Main>
      <Bullseye>
        <EmptyState
          status="danger"
          icon={ExclamationCircleIcon}
          titleText={title}
          headingLevel="h1"
        >
          <EmptyStateBody>{body}</EmptyStateBody>
          <EmptyStateFooter>
            <Button variant="primary" onClick={backToList}>
              {intl.formatMessage(messages.backToListLink)}
            </Button>
          </EmptyStateFooter>
        </EmptyState>
      </Bullseye>
    </Main>
  );

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
    return renderError(
      intl.formatMessage(messages.loadFailedTitle),
      intl.formatMessage(messages.loadFailedMessage),
    );
  }

  // Error state - source not found or failed to load
  if (isError) {
    const is404 = error instanceof SourceNotFoundError;

    return is404
      ? renderError(
          intl.formatMessage(messages.sourceNotFoundTitle),
          intl.formatMessage(messages.sourceNotFoundMessage),
        )
      : renderError(
          intl.formatMessage(messages.loadFailedTitle),
          intl.formatMessage(messages.loadFailedMessage),
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
              <Button variant="secondary" onClick={backToList}>
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
