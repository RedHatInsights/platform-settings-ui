import React from 'react';
import { useIntl } from 'react-intl';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type { UseFieldApiConfig } from '@data-driven-forms/react-form-renderer/use-field-api';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import {
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core/dist/dynamic/components/FormSelect';
import messages from '../../messages';

const AwsRegionSelect: React.FC<UseFieldApiConfig> = (props) => {
  const intl = useIntl();
  const { input, meta, label, options } = useFieldApi(props) as ReturnType<
    typeof useFieldApi
  > & {
    label: string;
    options: Array<{ value: string; label: string }>;
  };

  return (
    <FormGroup label={label} fieldId={input.name} isRequired>
      <FormSelect
        id={input.name}
        aria-label={label}
        value={input.value ?? ''}
        onChange={(_event, value) => input.onChange(value)}
        onBlur={() => input.onBlur()}
        validated={meta.touched && meta.error ? 'error' : 'default'}
      >
        <FormSelectOption
          value=""
          label={intl.formatMessage(messages.wizardAwsSelectRegion)}
          isDisabled
        />
        {options.map(({ value, label: optionLabel }) => (
          <FormSelectOption key={value} value={value} label={optionLabel} />
        ))}
      </FormSelect>
      {meta.touched && meta.error && <p role="alert">{meta.error}</p>}
    </FormGroup>
  );
};

export default AwsRegionSelect;
