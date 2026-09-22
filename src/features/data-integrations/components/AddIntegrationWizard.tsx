import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core/dist/dynamic/components/Modal';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import IntegrationsFormRenderer from './wizard/IntegrationsFormRenderer';
import {
  createIntegrationWizardSchema,
  createWizardInitialValues,
} from './wizard/integrationWizardSchema';
import { useSourceTypes } from '../data/queries/useSourceTypes';
import messages from '../messages';
import type { SourceTypeName } from '../types';

export interface AddIntegrationWizardProps {
  isOpen: boolean;
  /**
   * Provider the wizard was opened for; pre-selects its card. Optional so the
   * wizard can also be opened with nothing chosen — the dropdown always passes
   * one, but that is the dropdown's behaviour, not a requirement of the wizard.
   */
  sourceType?: SourceTypeName | null;
  onClose: () => void;
}

/**
 * Host for the Add Data Integration wizard.
 *
 * The wizard itself is a data-driven-forms schema — see
 * `wizard/integrationWizardSchema.ts`. This component only decides whether the
 * schema can be built yet: it needs the provider catalogue, so while that is in
 * flight or failed there is nothing to render a wizard from.
 *
 * The `{ isOpen, sourceType, onClose }` contract predates the real wizard and
 * is kept as-is so `AddDataIntegrationDropdown` needs no changes.
 */
const AddIntegrationWizard: React.FC<AddIntegrationWizardProps> = ({
  isOpen,
  sourceType,
  onClose,
}) => {
  const intl = useIntl();
  const { data: sourceTypes, isLoading, isError } = useSourceTypes();

  /**
   * Whether the "are you sure?" confirmation is up. This is the one piece of
   * component state the wizard keeps: it is neither a step nor a field value,
   * both of which belong to final-form. `sources-ui` holds the equivalent in a
   * reducer outside its renderer for the same reason.
   */
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const schema = useMemo(
    () =>
      sourceTypes
        ? createIntegrationWizardSchema({
            sourceTypes,
            intl,
            selectedType: sourceType,
          })
        : undefined,
    [sourceTypes, intl, sourceType],
  );

  const initialValues = useMemo(
    () => createWizardInitialValues(sourceType),
    [sourceType],
  );

  if (!isOpen) {
    return null;
  }

  const exit = () => {
    setIsConfirmingCancel(false);
    onClose();
  };

  if (isLoading || isError || !schema) {
    /*
     * `onEscapePress` rather than `onClose`: PatternFly only renders the
     * header's ✕ when `onClose` is given, and it hardcodes that button's
     * accessible name to "Close" — the same name as the footer action below,
     * which would leave two identically named buttons in one dialog. The
     * footer button is the visible way out; this keeps Escape working too.
     */
    return (
      <Modal
        isOpen
        onEscapePress={() => onClose()}
        variant={ModalVariant.small}
        aria-labelledby="add-data-integration-status-title"
      >
        <ModalHeader
          title={intl.formatMessage(
            isError ? messages.wizardErrorTitle : messages.wizardTitle,
          )}
          labelId="add-data-integration-status-title"
        />
        <ModalBody>
          {isError ? (
            intl.formatMessage(messages.wizardErrorBody)
          ) : (
            <Bullseye>
              <Spinner
                aria-label={intl.formatMessage(messages.wizardLoading)}
              />
            </Bullseye>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="link" onClick={onClose}>
            {intl.formatMessage(messages.wizardErrorClose)}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <>
      <IntegrationsFormRenderer
        schema={schema}
        initialValues={initialValues}
        onCancel={() => setIsConfirmingCancel(true)}
        /**
         * The source type step is currently the last step, so this fires from
         * the primary button. There is nothing to create until the auth and
         * application steps land, so it is deliberately inert — the follow-up
         * stories replace it with the create call.
         */
        onSubmit={() => undefined}
      />
      {isConfirmingCancel && (
        <Modal
          isOpen
          onClose={() => setIsConfirmingCancel(false)}
          variant={ModalVariant.small}
          aria-labelledby="add-data-integration-cancel-title"
        >
          <ModalHeader
            title={intl.formatMessage(messages.wizardCancelTitle)}
            labelId="add-data-integration-cancel-title"
          />
          <ModalBody>{intl.formatMessage(messages.wizardCancelBody)}</ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={exit}>
              {intl.formatMessage(messages.wizardCancelConfirm)}
            </Button>
            <Button variant="link" onClick={() => setIsConfirmingCancel(false)}>
              {intl.formatMessage(messages.wizardCancelDismiss)}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default AddIntegrationWizard;
