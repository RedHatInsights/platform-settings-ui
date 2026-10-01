import React, { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useQueryClient } from '@tanstack/react-query';
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
  APPLICATIONS_FIELD,
  SOURCE_NAME_FIELD,
  SOURCE_TYPE_FIELD,
  buildSourceTypeOptions,
  createIntegrationWizardSchema,
  createWizardInitialValues,
  resolveSelectedType,
} from './wizard/integrationWizardSchema';
import { createSourcesApi } from '../data/api/sources';
import { useApplicationTypes } from '../data/queries/useApplicationTypes';
import { sourcesKeys } from '../data/queries/useSources';
import { useSourceTypes } from '../data/queries/useSourceTypes';
import { useAppServices } from '../../../shared/ServiceContext';
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
  const { axios, notify } = useAppServices();
  const queryClient = useQueryClient();
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

  /**
   * Multi-step submission: create the source, then associate each selected
   * application. On success the sources list cache is invalidated so the table
   * picks up the new entry.
   */
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const api = createSourcesApi(axios);

      // The wizard's `prepareValues` only includes fields that were registered
      // (rendered) during visited steps. When the wizard starts on step two
      // because a provider was pre-selected, step one is never rendered and the
      // source_type field is missing from `values`. Fall back to `initialValues`
      // so the pre-selection is honoured.
      const sourceTypeName = (values[SOURCE_TYPE_FIELD] ??
        initialValues[SOURCE_TYPE_FIELD]) as string | undefined;
      const sourceName = values[SOURCE_NAME_FIELD] as string;
      const applicationIds = (values[APPLICATIONS_FIELD] ?? []) as string[];

      const matchedSourceType = sourceTypes?.find(
        (st) => st.name === sourceTypeName,
      );
      if (!matchedSourceType) {
        notify(
          'danger',
          intl.formatMessage(messages.wizardCreateFailureTitle),
          intl.formatMessage(messages.wizardCreateFailureBody),
        );
        return;
      }

      try {
        const source = await api.createSource({
          name: sourceName,
          source_type_id: matchedSourceType.id,
        });

        try {
          await Promise.all(
            applicationIds.map((appTypeId) =>
              api.createApplication({
                source_id: source.id,
                application_type_id: appTypeId,
              }),
            ),
          );

          notify(
            'success',
            intl.formatMessage(messages.wizardTitle),
            intl.formatMessage(messages.wizardSuccessBody, {
              name: sourceName,
            }),
          );
        } catch {
          notify(
            'warning',
            intl.formatMessage(messages.wizardPartialFailureTitle, {
              name: sourceName,
            }),
            intl.formatMessage(messages.wizardPartialFailureBody),
          );
        }

        queryClient.invalidateQueries({ queryKey: sourcesKeys.lists() });
        onClose();
      } catch {
        notify(
          'danger',
          intl.formatMessage(messages.wizardCreateFailureTitle),
          intl.formatMessage(messages.wizardCreateFailureBody),
        );
      }
    },
    [axios, initialValues, sourceTypes, queryClient, intl, notify, onClose],
  );

  if (!isOpen) {
    return null;
  }

  const exit = () => {
    setIsConfirmingCancel(false);
    onClose();
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
      <IntegrationsFormRenderer
        schema={schema}
        initialValues={initialValues}
        onCancel={() => setIsConfirmingCancel(true)}
        onSubmit={handleSubmit}
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
