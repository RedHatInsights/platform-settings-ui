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
import { useIntl } from 'react-intl';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import messages from '../messages';
import SourceStatusLabel from '../../../components/SourceStatusLabel';
import { getSourceTypeIcon } from '../../../constants/sourceTypeIcons';
import type { Source, SourceType } from '../../../data/types/sources.types';

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

  // Build title with source name and status badge inline
  const titleWithBadge = (
    <Split hasGutter>
      <SplitItem>{source.name}</SplitItem>
      <SplitItem>
        <SourceStatusLabel
          status={source.availability_status}
          pausedAt={source.paused_at}
        />
      </SplitItem>
    </Split>
  );

  // Build subtitle with metadata (bold labels)
  const subtitle = (
    <Stack>
      <StackItem>
        <div>
          <strong>{intl.formatMessage(messages.lastModified)}:</strong>{' '}
          {/*
            A source that has never been edited has no `updated_at`, so fall
            back to its creation time rather than claiming "Just now".
          */}
          <DateFormat date={source.updated_at ?? source.created_at} />
        </div>
      </StackItem>
      <StackItem>
        <div>
          <strong>{intl.formatMessage(messages.lastAvailabilityCheck)}:</strong>{' '}
          {source.last_checked_at ? (
            intl.formatMessage(messages.checkedAgo, {
              time: <DateFormat date={source.last_checked_at} />,
            })
          ) : (
            <Flex
              spaceItems={{ default: 'spaceItemsSm' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Spinner
                  size="md"
                  aria-label={intl.formatMessage(
                    messages.checkingAvailabilityAriaLabel,
                  )}
                />
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
          // Dropdown does not push its open state into a render-prop toggle,
          // and MenuToggle defaults isExpanded to false, so without this the
          // control reports aria-expanded="false" while the menu is open.
          isExpanded={isActionsOpen}
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
              ? intl.formatMessage(messages.pauseDisabledDescription)
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
              alt={
                sourceType?.product_name ||
                intl.formatMessage(messages.fallbackIconAlt, {
                  id: source.source_type_id,
                })
              }
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
          title={intl.formatMessage(
            isPaused ? messages.resumeModalTitle : messages.pauseModalTitle,
          )}
          labelId="pause-modal-title"
        />
        <ModalBody>
          <p>{intl.formatMessage(messages.pauseComingSoon)}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsPauseModalOpen(false)}>
            {intl.formatMessage(messages.okButton)}
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
            {intl.formatMessage(messages.okButton)}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
