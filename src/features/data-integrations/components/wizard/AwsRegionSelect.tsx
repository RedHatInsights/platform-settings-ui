import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type { UseFieldApiConfig } from '@data-driven-forms/react-form-renderer/use-field-api';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import {
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core/dist/dynamic/components/Select';
import { MenuToggle } from '@patternfly/react-core/dist/dynamic/components/MenuToggle';
import messages from '../../messages';

const SELECT_MAX_MENU_HEIGHT = '12rem';

const AwsRegionSelect: React.FC<UseFieldApiConfig> = (props) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const { input, meta, label, options } = useFieldApi(props) as ReturnType<
    typeof useFieldApi
  > & {
    label: string;
    options: Array<{ value: string; label: string }>;
  };
  const selectedOption = options.find(({ value }) => value === input.value);

  return (
    <FormGroup label={label} fieldId={input.name} isRequired>
      <Select
        isOpen={isOpen}
        selected={input.value}
        onOpenChange={setIsOpen}
        onSelect={(_event, value) => {
          if (value !== undefined) {
            input.onChange(value);
            input.onBlur();
          }
          setIsOpen(false);
        }}
        maxMenuHeight={SELECT_MAX_MENU_HEIGHT}
        isScrollable
        popperProps={{
          appendTo: 'inline',
          enableFlip: true,
          preventOverflow: true,
          width: 'trigger',
        }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            aria-label={label}
            isExpanded={isOpen}
            isFullWidth
            isPlaceholder={!selectedOption}
            onClick={() => setIsOpen((open) => !open)}
          >
            {selectedOption?.label ??
              intl.formatMessage(messages.wizardAwsSelectRegion)}
          </MenuToggle>
        )}
      >
        <SelectList>
          {options.map(({ value, label: optionLabel }) => (
            <SelectOption key={value} value={value}>
              {optionLabel}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
      {meta.touched && meta.error && <p role="alert">{meta.error}</p>}
    </FormGroup>
  );
};

export default AwsRegionSelect;
