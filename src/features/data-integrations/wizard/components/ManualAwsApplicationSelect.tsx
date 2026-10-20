import React from 'react';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type {
  UseFieldApiConfig,
  UseFieldApiProps,
} from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import {
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { Radio } from '@patternfly/react-core/dist/dynamic/components/Radio';
import {
  AUTH_PASSWORD_FIELD,
  AUTH_TYPE_FIELD,
  AUTH_USERNAME_FIELD,
} from '../integrationWizardSchema';

interface ManualApplicationProps extends UseFieldApiProps<string | undefined> {
  label: string;
  options: Array<{ value: string; label: string }>;
}

const ManualAwsApplicationSelect: React.FC<UseFieldApiConfig> = (props) => {
  const { input, meta, label, options } = useFieldApi(
    props,
  ) as ManualApplicationProps;
  const form = useFormApi();
  const showError = Boolean(meta.touched && meta.error);

  const select = (value: string) => {
    if (value !== input.value) {
      for (const field of [
        AUTH_TYPE_FIELD,
        AUTH_USERNAME_FIELD,
        AUTH_PASSWORD_FIELD,
        'authentication.extra.external_id',
        'application.extra',
        'meta.account',
      ]) {
        form.change(field, undefined);
      }
    }
    input.onChange(value);
    input.onBlur();
  };

  return (
    <FormGroup label={label} fieldId={input.name} isRequired isStack>
      <div
        role="radiogroup"
        aria-label={label}
        aria-required="true"
        aria-invalid={showError}
      >
        {options.map(({ value, label: optionLabel }) => (
          <Radio
            key={value}
            id={`manual-application-${value}`}
            name={input.name}
            label={optionLabel}
            isChecked={input.value === value}
            onChange={() => select(value)}
          />
        ))}
      </div>
      {showError && (
        <HelperText>
          <HelperTextItem variant="error">{meta.error}</HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default ManualAwsApplicationSelect;
