import React from 'react';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type {
  UseFieldApiConfig,
  UseFieldApiProps,
} from '@data-driven-forms/react-form-renderer/use-field-api';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core/dist/dynamic/components/Card';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import {
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core/dist/dynamic/components/HelperText';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Grid';
import type { SourceTypeName } from '../../types';
import type { SourceTypeOption } from './integrationWizardSchema';
import './SourceTypeCardSelect.scss';

interface CardSelectProps extends UseFieldApiProps<SourceTypeName | undefined> {
  label: string;
  isRequired?: boolean;
  options: SourceTypeOption[];
}

/**
 * The `card-select` data-driven-forms component: a grid of provider cards that
 * behaves as a single required radio group.
 *
 * Ported from `sources-ui`'s `FormComponents/CardSelect.js` in behaviour only.
 * That component renders `Tile`, which PatternFly ships exclusively under
 * `@patternfly/react-core/deprecated` — there is no supported replacement of
 * the same name, so this uses the PF6 selectable card instead. `variant:
 * 'single'` gives every card a real `<input type="radio">`, which is what
 * makes arrow-key navigation and the accessible names work without extra
 * handlers. `sources-ui`'s multi-select and `mutator` support are deliberately
 * not carried over; nothing in this island selects more than one provider.
 */
const SourceTypeCardSelect: React.FC<UseFieldApiConfig> = (props) => {
  const { input, meta, label, isRequired, options } = useFieldApi(
    props,
  ) as CardSelectProps;

  const showError = Boolean(meta.touched && meta.error);
  const errorId = `${input.name}-error`;

  const select = (value: SourceTypeName) => {
    input.onChange(value);
    input.onBlur();
  };

  return (
    <FormGroup
      isRequired={isRequired}
      label={label}
      fieldId={input.name}
      isStack
    >
      {/*
        The cards are radios, so they need a grouping element with a name of
        its own — without it axe reports every input as unlabelled, and screen
        readers announce four unrelated controls instead of one choice.
      */}
      <div
        role="radiogroup"
        aria-label={label}
        aria-required={isRequired}
        aria-invalid={showError}
        aria-errormessage={showError ? errorId : undefined}
      >
        <Grid hasGutter>
          {options.map(({ value, label: optionLabel, iconUrl }) => {
            const cardId = `source-type-${value}`;

            return (
              <GridItem sm={6} md={3} key={value}>
                <Card
                  id={cardId}
                  isSelectable
                  isSelected={input.value === value}
                  isFullHeight
                  className="data-integrations-source-type-card"
                >
                  <CardHeader
                    selectableActions={{
                      variant: 'single',
                      name: input.name,
                      selectableActionId: `${cardId}-input`,
                      selectableActionAriaLabelledby: cardId,
                      onChange: () => select(value),
                    }}
                  >
                    <CardTitle>{optionLabel}</CardTitle>
                  </CardHeader>
                  {iconUrl && (
                    <CardBody>
                      {/*
                        Decorative: the card title already names the provider,
                        and alt text here would be appended to the radio's
                        accessible name.
                      */}
                      <img
                        src={iconUrl}
                        alt=""
                        aria-hidden="true"
                        width={40}
                        height={40}
                        className="data-integrations-source-type-card__icon"
                      />
                    </CardBody>
                  )}
                </Card>
              </GridItem>
            );
          })}
        </Grid>
      </div>
      {showError && (
        <HelperText>
          <HelperTextItem id={errorId} variant="error">
            {meta.error}
          </HelperTextItem>
        </HelperText>
      )}
    </FormGroup>
  );
};

export default SourceTypeCardSelect;
