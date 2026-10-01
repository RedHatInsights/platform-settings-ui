import React from 'react';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type {
  UseFieldApiConfig,
  UseFieldApiProps,
} from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Checkbox } from '@patternfly/react-core/dist/dynamic/components/Checkbox';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import {
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core/dist/dynamic/components/HelperText';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import { SOURCE_TYPE_FIELD } from './integrationWizardSchema';

export interface ApplicationOption {
  /** Application type id. */
  value: string;
  label: string;
  /** Source type ids this application supports. */
  supportedSourceTypes?: string[];
}

interface CheckboxSelectProps extends UseFieldApiProps<string[] | undefined> {
  label: string;
  isRequired?: boolean;
  options: ApplicationOption[];
}

/**
 * The `application-checkbox-select` data-driven-forms component: a list of
 * checkboxes for selecting which applications to associate with a new
 * integration.
 *
 * The list is filtered by source type compatibility — only applications that
 * work with the chosen provider are shown. The selected source type is read
 * from the form state via `useFormApi`, which is how data-driven-forms
 * components subscribe to other fields without prop-drilling.
 */
const ApplicationCheckboxSelect: React.FC<UseFieldApiConfig> = (props) => {
  const { input, meta, label, isRequired, options } = useFieldApi(
    props,
  ) as CheckboxSelectProps;

  const formApi = useFormApi();
  const sourceTypeName = formApi.getState().values[SOURCE_TYPE_FIELD] as
    | string
    | undefined;

  const compatibleOptions = sourceTypeName
    ? options.filter(
        (opt) =>
          !opt.supportedSourceTypes ||
          opt.supportedSourceTypes.includes(sourceTypeName),
      )
    : options;

  const selectedValues: string[] = input.value ?? [];

  const showError = Boolean(meta.touched && meta.error);
  const errorId = `${input.name}-error`;

  const toggle = (value: string, checked: boolean) => {
    const next = checked
      ? [...selectedValues, value]
      : selectedValues.filter((v) => v !== value);
    input.onChange(next);
    input.onBlur();
  };

  return (
    <FormGroup
      isRequired={isRequired}
      label={label}
      fieldId={input.name}
      isStack
    >
      <div
        role="group"
        aria-label={label}
        aria-required={isRequired || undefined}
        aria-invalid={showError || undefined}
        aria-errormessage={showError ? errorId : undefined}
      >
        <Stack hasGutter>
          {compatibleOptions.map(({ value, label: optionLabel }) => (
            <StackItem key={value}>
              <Checkbox
                id={`application-${value}`}
                label={optionLabel}
                isChecked={selectedValues.includes(value)}
                onChange={(_event, checked) => toggle(value, checked)}
                name={input.name}
              />
            </StackItem>
          ))}
        </Stack>
      </div>
      {showError && (
        <HelperText id={errorId} aria-live="polite">
          <HelperTextItem variant="error">{meta.error}</HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default ApplicationCheckboxSelect;
