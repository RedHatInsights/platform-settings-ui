import React from 'react';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type {
  UseFieldApiConfig,
  UseFieldApiProps,
} from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import {
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import { Radio } from '@patternfly/react-core/dist/dynamic/components/Radio';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import CheckCircleIcon from '@patternfly/react-icons/dist/dynamic/icons/check-circle-icon';
import { useIntl } from 'react-intl';
import type { IntlShape } from 'react-intl';
import messages from '../../messages';
import { bundlePoints } from './ApplicationSwitchGroup';
import {
  AUTH_PASSWORD_FIELD,
  AUTH_TYPE_FIELD,
  AUTH_USERNAME_FIELD,
} from './integrationWizardSchema';
import type { ApplicationOption } from './ApplicationSwitchGroup';

interface ManualApplicationProps extends UseFieldApiProps<string | undefined> {
  label: string;
  options: ApplicationOption[];
}

const COST_MANAGEMENT = '/insights/platform/cost-management';
const CLOUD_METER = '/insights/platform/cloud-meter';
const PROVISIONING = '/insights/platform/provisioning';

const applicationLabel = (
  option: ApplicationOption,
  intl: IntlShape,
): React.ReactNode =>
  option.name === CLOUD_METER ? (
    <>
      {option.label}{' '}
      <Label color="purple">{intl.formatMessage(messages.wizardBundle)}</Label>
    </>
  ) : (
    option.label
  );

const ManualAwsApplicationSelect: React.FC<UseFieldApiConfig> = (props) => {
  const intl = useIntl();
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
        {options.map((option) => {
          const isChecked = input.value === option.value;

          return (
            <React.Fragment key={option.value}>
              <Radio
                id={`manual-application-${option.value}`}
                name={input.name}
                label={applicationLabel(option, intl)}
                aria-label={option.label}
                isChecked={isChecked}
                onChange={() => select(option.value)}
              />
              {option.name === COST_MANAGEMENT && (
                <Content component="p" className="pf-v6-u-ml-lg">
                  {intl.formatMessage(messages.costManagementDescription)}
                </Content>
              )}
              {option.name === CLOUD_METER && (
                <Stack className="pf-v6-u-mt-sm pf-v6-u-ml-lg">
                  {bundlePoints('amazon', intl).map((point) => (
                    <StackItem key={point.title} className="pf-v6-u-mb-sm">
                      <Flex>
                        <FlexItem spacer={{ default: 'spacerSm' }}>
                          <CheckCircleIcon
                            aria-hidden
                            color={
                              isChecked
                                ? 'var(--pf-t--global--icon--color--status--success--default)'
                                : 'var(--pf-t--global--icon--color--disabled)'
                            }
                          />
                        </FlexItem>
                        <FlexItem>
                          <Content component="p" className="pf-v6-u-mb-xs">
                            {point.title}
                          </Content>
                          <Content component="p">{point.description}</Content>
                        </FlexItem>
                      </Flex>
                    </StackItem>
                  ))}
                </Stack>
              )}
              {option.name === PROVISIONING && (
                <Content component="p" className="pf-v6-u-ml-lg">
                  {intl.formatMessage(messages.provisioningDescription)}
                </Content>
              )}
            </React.Fragment>
          );
        })}
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
