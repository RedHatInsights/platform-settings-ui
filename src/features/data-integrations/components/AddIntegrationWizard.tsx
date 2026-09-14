import React from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Modal,
  ModalVariant,
} from '@patternfly/react-core/dist/dynamic/components/Modal';
import { ModalBody } from '@patternfly/react-core/dist/dynamic/components/Modal';
import { ModalFooter } from '@patternfly/react-core/dist/dynamic/components/Modal';
import { ModalHeader } from '@patternfly/react-core/dist/dynamic/components/Modal';
import messages from '../messages';
import type { SourceTypeName } from '../types';

export interface AddIntegrationWizardProps {
  isOpen: boolean;
  sourceType: SourceTypeName;
  onClose: () => void;
}

const providerLabels = {
  amazon: messages.amazonLabel,
  google: messages.googleLabel,
  azure: messages.azureLabel,
  openshift: messages.openshiftLabel,
} as const;

/**
 * PLACEHOLDER.
 *
 * The real creation wizard is not built yet. `sources-ui` is being retired
 * rather than federated from, so its `addSourceWizard` will be rebuilt here in
 * a follow-up story.
 *
 * Keep the `{ isOpen, sourceType, onClose }` contract stable — the real wizard
 * drops in behind it and `AddDataIntegrationDropdown` needs no changes.
 */
const AddIntegrationWizard: React.FC<AddIntegrationWizardProps> = ({
  isOpen,
  sourceType,
  onClose,
}) => {
  const intl = useIntl();
  const provider = intl.formatMessage(providerLabels[sourceType]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      aria-labelledby="add-data-integration-title"
    >
      <ModalHeader
        title={intl.formatMessage(messages.wizardPlaceholderTitle)}
        labelId="add-data-integration-title"
      />
      <ModalBody>
        {intl.formatMessage(messages.wizardPlaceholderBody, { provider })}
      </ModalBody>
      <ModalFooter>
        <Button variant="link" onClick={onClose}>
          {intl.formatMessage(messages.wizardPlaceholderClose)}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddIntegrationWizard;
