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
  buildSourceTypeOptions,
  createIntegrationWizardSchema,
  createWizardInitialValues,
  resolveSelectedType,
  toCreateSourceInput,
} from './wizard/integrationWizardSchema';
import type { IntegrationWizardValues } from './wizard/integrationWizardSchema';
import { WizardSubmissionContext } from './wizard/SubmissionResult';
import { useApplicationTypes } from '../data/queries/useApplicationTypes';
import { useSourceTypes } from '../data/queries/useSourceTypes';
import { useCreateSource } from '../data/queries/useCreateSource';
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
  const {
    data: sourceTypes,
    isLoading: isLoadingSourceTypes,
    isError: isSourceTypesError,
  } = useSourceTypes();
  const {
    data: applicationTypes,
    isLoading: isLoadingAppTypes,
    isError: isAppTypesError,
  } = useApplicationTypes();

  const isLoading = isLoadingSourceTypes || isLoadingAppTypes;
  const isError = isSourceTypesError || isAppTypesError;

  /**
   * Whether the "are you sure?" confirmation is up. This is the one piece of
   * component state the wizard keeps: it is neither a step nor a field value,
   * both of which belong to final-form. `sources-ui` holds the equivalent in a
   * reducer outside its renderer for the same reason.
   */
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const createSource = useCreateSource();

  /**
   * Bumped by "Add another integration" to remount the renderer.
   *
   * Remounting is the only way back to a blank wizard: final-form keeps the
   * values and the wizard keeps its step history, and `initialState` would put
   * a reset form back on whichever step it names rather than step one.
   */
  const [formKey, setFormKey] = useState(0);

  /**
   * A catalogue that offers none of the providers we support is as unusable as
   * a failed fetch: the wizard would open on a step with no cards and a Next
   * that can never enable, since the card field is required.
   */
  const hasProviders = useMemo(
    () =>
      sourceTypes
        ? buildSourceTypeOptions(sourceTypes, intl).length > 0
        : false,
    [sourceTypes],
  );

  const schema = useMemo(
    () =>
      sourceTypes && applicationTypes && hasProviders
        ? createIntegrationWizardSchema({
            sourceTypes,
            applicationTypes,
            intl,
            selectedType: sourceType,
          })
        : undefined,
    [sourceTypes, applicationTypes, hasProviders, intl, sourceType],
  );

  const initialValues = useMemo(
    () =>
      createWizardInitialValues(
        sourceTypes ? resolveSelectedType(sourceTypes, sourceType) : undefined,
      ),
    [sourceTypes, sourceType],
  );

  if (!isOpen) {
    return null;
  }

  /**
   * Leaves the wizard and wipes it.
   *
   * `isOpen: false` renders null without unmounting, so without the reset and
   * the remount the next open would come back on the step the last one ended
   * on, still showing its result.
   */
  const exit = () => {
    setIsConfirmingCancel(false);
    createSource.reset();
    setFormKey((key) => key + 1);
    onClose();
  };

  const restart = () => {
    createSource.reset();
    setFormKey((key) => key + 1);
  };

  const isUnavailable = isError || (!isLoading && !schema);

  // `!schema` is redundant with `isUnavailable` but narrows it for the render
  // below, which cannot take `undefined`.
  if (isLoading || isUnavailable || !schema) {
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
            isUnavailable ? messages.wizardErrorTitle : messages.wizardTitle,
          )}
          labelId="add-data-integration-status-title"
        />
        <ModalBody>
          {isUnavailable ? (
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
      <WizardSubmissionContext.Provider
        value={{
          isPending: createSource.isPending,
          isError: createSource.isError,
          error: createSource.error,
          createdSource: createSource.data,
          onAddAnother: restart,
          onClose: exit,
        }}
      >
        <IntegrationsFormRenderer
          key={formKey}
          schema={schema}
          initialValues={initialValues}
          onCancel={() => setIsConfirmingCancel(true)}
          /**
           * Fires from the review step's Add button, and again from Retry on
           * the result step. The renderer advances to the result step without
           * waiting, so the mutation's own state is what that step renders —
           * which is also why nothing here needs to be awaited.
           *
           * `prepareValues` only includes fields registered by steps that
           * actually rendered. When a provider is pre-selected the wizard opens
           * on step two, so `source_type` never appears in `values` — hence the
           * initial values underneath.
           */
          onSubmit={(values) =>
            createSource.mutate(
              toCreateSourceInput({
                ...initialValues,
                ...values,
              } as IntegrationWizardValues),
            )
          }
        />
      </WizardSubmissionContext.Provider>
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
