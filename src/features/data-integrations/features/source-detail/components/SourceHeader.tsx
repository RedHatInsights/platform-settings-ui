import React, { useState } from 'react';
import { PageHeader } from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core/dist/dynamic/components/Dropdown';
import { MenuToggle } from '@patternfly/react-core/dist/dynamic/components/MenuToggle';
import {
  Modal,
  ModalVariant,
} from '@patternfly/react-core/dist/dynamic/components/Modal';
import { ModalBody } from '@patternfly/react-core/dist/dynamic/components/Modal';
import { ModalFooter } from '@patternfly/react-core/dist/dynamic/components/Modal';
import { ModalHeader } from '@patternfly/react-core/dist/dynamic/components/Modal';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import {
  Split,
  SplitItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Split';
import PauseIcon from '@patternfly/react-icons/dist/dynamic/icons/pause-icon';
import TrashIcon from '@patternfly/react-icons/dist/dynamic/icons/trash-icon';
import { FormattedRelativeTime, useIntl } from 'react-intl';
import messages from '../messages';
import { StatusBadge } from './StatusBadge';
import { getSourceTypeIcon } from '../../../constants/sourceTypeIcons';
import type { Source, SourceType } from '../../../data/types/sources.types';

/**
 * Calculates the relative time units for FormattedRelativeTime.
 */
function getRelativeTime(dateString?: string): {
  value: number;
  unit: 'second' | 'minute' | 'hour' | 'day';
} {
  if (!dateString) {
    return { value: 0, unit: 'second' };
  }

  const diff = new Date(dateString).getTime() - Date.now();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(days) >= 1) {
    return { value: days, unit: 'day' };
  }
  if (Math.abs(hours) >= 1) {
    return { value: hours, unit: 'hour' };
  }
  if (Math.abs(minutes) >= 1) {
    return { value: minutes, unit: 'minute' };
  }

  return { value: seconds, unit: 'second' };
}

interface SourceHeaderProps {
  source: Source;
  sourceType?: SourceType;
  isOrgAdmin: boolean;
  onPause?: () => void;
  onDelete?: () => void;
}

/**
 * Page header for the source detail page.
 *
 * Displays:
 * - Provider icon (AWS, Azure, GCP, OpenShift)
 * - Source name as title
 * - Status badge as subtitle
 * - Actions dropdown (Pause, Delete) - only visible to org admins
 *
 * Actions are deferred to future stories and show "coming soon" modals.
 */
export const SourceHeader: React.FC<SourceHeaderProps> = ({
  source,
  sourceType,
  isOrgAdmin,
  onPause,
  onDelete,
}) => {
  const intl = useIntl();

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isPaused = !!source.paused_at;
  const isInProgress = source.availability_status === 'in_progress';

  // Calculate relative times for metadata
  const lastModified = source.updated_at
    ? getRelativeTime(source.updated_at)
    : null;

  const lastChecked = source.last_checked_at
    ? getRelativeTime(source.last_checked_at)
    : null;

  // Build title with source name and status badge inline
  const titleWithBadge = (
    <Split hasGutter>
      <SplitItem>{source.name}</SplitItem>
      <SplitItem>
        <StatusBadge status={source.availability_status} isPaused={isPaused} />
      </SplitItem>
    </Split>
  );

  // Build subtitle with metadata (bold labels)
  const subtitle = (
    <Stack>
      <StackItem>
        <div>
          <strong>{intl.formatMessage(messages.lastModified)}:</strong>{' '}
          {lastModified ? (
            <FormattedRelativeTime
              value={lastModified.value}
              numeric="auto"
              updateIntervalInSeconds={
                lastModified.unit !== 'day' ? 60 : undefined
              }
              unit={lastModified.unit}
            />
          ) : (
            intl.formatMessage(messages.justNow)
          )}
        </div>
      </StackItem>
      <StackItem>
        <div>
          <strong>{intl.formatMessage(messages.lastAvailabilityCheck)}:</strong>{' '}
          {lastChecked ? (
            intl.formatMessage(messages.checkedAgo, {
              time: (
                <FormattedRelativeTime
                  value={lastChecked.value}
                  numeric="auto"
                  updateIntervalInSeconds={
                    lastChecked.unit !== 'day' ? 60 : undefined
                  }
                  unit={lastChecked.unit}
                />
              ),
            })
          ) : (
            <Flex
              spaceItems={{ default: 'spaceItemsSm' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Spinner size="md" aria-label="Checking availability" />
              </FlexItem>
              <FlexItem>
                {intl.formatMessage(messages.waitingForUpdate)}
              </FlexItem>
            </Flex>
          )}
        </div>
      </StackItem>
    </Stack>
  );

  const handlePauseClick = () => {
    setIsActionsOpen(false);
    if (onPause) {
      onPause();
    } else {
      setIsPauseModalOpen(true);
    }
  };

  const handleDeleteClick = () => {
    setIsActionsOpen(false);
    if (onDelete) {
      onDelete();
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const actionsDropdown = isOrgAdmin ? (
    <Dropdown
      isOpen={isActionsOpen}
      onSelect={() => setIsActionsOpen(false)}
      onOpenChange={(isOpen) => setIsActionsOpen(isOpen)}
      popperProps={{ position: 'right' }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          variant="secondary"
          aria-label={intl.formatMessage(messages.actionsLabel)}
        >
          {intl.formatMessage(messages.actionsLabel)}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          onClick={handlePauseClick}
          isDisabled={isInProgress}
          icon={<PauseIcon />}
          description={
            isInProgress
              ? 'Cannot pause while availability check is in progress'
              : intl.formatMessage(messages.pauseActionDescription)
          }
        >
          {isPaused
            ? intl.formatMessage(messages.resumeAction)
            : intl.formatMessage(messages.pauseAction)}
        </DropdownItem>
        <DropdownItem
          onClick={handleDeleteClick}
          icon={<TrashIcon />}
          isDanger
          description={intl.formatMessage(messages.deleteActionDescription)}
        >
          {intl.formatMessage(messages.deleteAction)}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  ) : undefined;

  const iconUrl = getSourceTypeIcon(sourceType?.name);

  // AWS icon needs extra top padding to center properly
  const iconStyle =
    sourceType?.name === 'amazon'
      ? { paddingTop: 'var(--pf-v6-global--spacer--sm)' }
      : undefined;

  return (
    <>
      <PageHeader
        title={titleWithBadge}
        subtitle={subtitle}
        icon={
          iconUrl && (
            <img
              src={iconUrl}
              alt={sourceType?.product_name || ''}
              width={48}
              height={48}
              style={iconStyle}
            />
          )
        }
        actionMenu={actionsDropdown}
      />

      {/* Pause/Resume coming soon modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        aria-labelledby="pause-modal-title"
      >
        <ModalHeader
          title={
            isPaused ? 'Resume data integration' : 'Pause data integration'
          }
          labelId="pause-modal-title"
        />
        <ModalBody>
          <p>{intl.formatMessage(messages.pauseComingSoon)}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsPauseModalOpen(false)}>
            OK
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete coming soon modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        aria-labelledby="delete-modal-title"
      >
        <ModalHeader
          title={intl.formatMessage(messages.deleteConfirmTitle)}
          labelId="delete-modal-title"
        />
        <ModalBody>
          <p>{intl.formatMessage(messages.deleteComingSoon)}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsDeleteModalOpen(false)}>
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
