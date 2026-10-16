import React from 'react';
import { useIntl } from 'react-intl';
import type { IntlShape } from 'react-intl';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import type {
  UseFieldApiConfig,
  UseFieldApiProps,
} from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import { Radio } from '@patternfly/react-core/dist/dynamic/components/Radio';
import { Switch } from '@patternfly/react-core/dist/dynamic/components/Switch';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import {
  Stack,
  StackItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import messages from '../../messages';
import {
  ACCOUNT_AUTHORIZATION,
  APPLICATIONS_FIELD,
  SOURCE_TYPE_FIELD,
} from './integrationWizardSchema';
import type { SourceTypeName } from '../../types';

export interface ApplicationOption {
  /** Application type id. */
  value: string;
  label: string;
  /** Stable API name, which is what the copy below is keyed by. */
  name: string;
  /** Source type ids this application supports. */
  supportedSourceTypes?: string[];
}

interface SwitchGroupProps extends UseFieldApiProps<
  string[] | string | undefined
> {
  label: string;
  options: ApplicationOption[];
  selectionMode?: 'multiple' | 'single';
  isRequired?: boolean;
}

const COST_MANAGEMENT = '/insights/platform/cost-management';
const CLOUD_METER = '/insights/platform/cloud-meter';

/** One capability inside the RHEL management bundle. */
interface BundlePoint {
  title: string;
  description: string;
}

/**
 * What RHEL management includes, per provider.
 *
 * Only subscription watch differs: AWS reports precise usage data, the other
 * two do not, so their bundle is two points rather than three. Copy is
 * `sources-ui`'s `SubWatchDescription`, which branches the same way — a
 * provider seeing another provider's cloud named in the gold-images line is
 * the mistake this table exists to avoid.
 */
export function bundlePoints(
  provider: SourceTypeName | undefined,
  intl: IntlShape,
): BundlePoint[] {
  if (!provider) {
    return [];
  }

  const goldImages: Record<string, { id: string; defaultMessage: string }> = {
    amazon: messages.rhelBundleGoldImagesAws,
    azure: messages.rhelBundleGoldImagesAzure,
    google: messages.rhelBundleGoldImagesGoogle,
  };

  if (!goldImages[provider]) {
    return [];
  }

  return [
    {
      title: intl.formatMessage(messages.rhelBundleGoldImagesTitle),
      description: intl.formatMessage(goldImages[provider]),
    },
    ...(provider === 'amazon'
      ? [
          {
            title: intl.formatMessage(messages.rhelBundleSubWatchTitle),
            description: intl.formatMessage(
              messages.rhelBundleSubWatchDescription,
            ),
          },
        ]
      : []),
    {
      title: intl.formatMessage(messages.rhelBundleAutoregistrationTitle),
      description: intl.formatMessage(
        messages.rhelBundleAutoregistrationDescription,
      ),
    },
  ];
}

/**
 * The application selector shared by AWS switches and Azure/Google radios.
 *
 * AWS uses optional switches because it can connect several applications;
 * Azure and Google use one required radio choice.
 *
 * Which ones start on depends on the configuration mode: account
 * authorization hands Red Hat the credentials to set everything up, so
 * everything is on, while manual configuration starts from nothing because
 * the user has said they will wire it up themselves.
 */
const ApplicationSwitchGroup: React.FC<UseFieldApiConfig> = (props) => {
  const intl = useIntl();
  const {
    input,
    label,
    options,
    selectionMode = 'multiple',
    isRequired,
  } = useFieldApi(props) as SwitchGroupProps;

  const formApi = useFormApi();
  const values = formApi.getState().values;
  const provider = values[SOURCE_TYPE_FIELD] as SourceTypeName | undefined;
  const isAccountAuthorization =
    values.source?.app_creation_workflow === ACCOUNT_AUTHORIZATION;

  const compatibleOptions = provider
    ? options.filter(
        (option) =>
          !option.supportedSourceTypes ||
          option.supportedSourceTypes.includes(provider),
      )
    : options;

  const selectedValues: string[] = Array.isArray(input.value)
    ? input.value
    : [];
  const selectedValue =
    typeof input.value === 'string'
      ? input.value
      : (values.application?.application_type_id as string | undefined);

  const compatibleIds = React.useMemo(
    () => compatibleOptions.map(({ value }) => value),
    [compatibleOptions],
  );

  /*
   * Mount-only, like `sources-ui`'s switch group. Returning to this step
   * keeps whatever the user set; changing the configuration mode is what
   * resets it, and that happens through the wizard's `crossroads` rather than
   * here — re-defaulting on every render would fight the user every time they
   * switched something off.
   *
   * Checked against `values` (read straight off `formApi.getState()`) rather
   * than `input.value`: remounting this step after a visit — e.g. Back from
   * review — leaves final-form's own field subscription torn down, so
   * `input.value` reads as `undefined` for this first render even though the
   * form still holds the real array. Defaulting off that stale read would
   * stomp the user's choices every time they stepped away and back.
   */
  const didDefault = React.useRef(false);
  React.useEffect(() => {
    if (selectionMode === 'single') {
      if (didDefault.current || values.application?.application_type_id) {
        return;
      }
      didDefault.current = true;
      input.onChange(
        compatibleOptions.find(({ name }) => name === COST_MANAGEMENT)?.value ??
          compatibleIds[0],
      );
      return;
    }
    if (didDefault.current || Array.isArray(values[APPLICATIONS_FIELD])) {
      return;
    }
    didDefault.current = true;
    input.onChange(isAccountAuthorization ? compatibleIds : []);
  }, []);

  // A provider swapped after the fact can leave an application behind that it
  // does not support, which would be submitted invisibly.
  React.useEffect(() => {
    if (selectionMode === 'single') {
      if (selectedValue && !compatibleIds.includes(selectedValue)) {
        input.onChange(compatibleIds[0]);
      }
      return;
    }
    const pruned = selectedValues.filter((id) => compatibleIds.includes(id));

    if (pruned.length !== selectedValues.length) {
      input.onChange(pruned);
    }
  }, [compatibleIds]);

  const toggle = (value: string, checked: boolean) => {
    input.onChange(
      checked
        ? [...selectedValues, value]
        : selectedValues.filter((selected) => selected !== value),
    );
    input.onBlur();
  };
  const select = (value: string) => {
    input.onChange(value);
    input.onBlur();
  };

  return (
    <FormGroup
      label={label}
      fieldId={input.name}
      isRequired={isRequired}
      isStack
    >
      <Stack hasGutter>
        {compatibleOptions.map((option) => {
          const isChecked =
            selectionMode === 'single'
              ? selectedValue === option.value
              : selectedValues.includes(option.value);
          const optionLabel =
            option.name === CLOUD_METER ? (
              <>
                {option.label}{' '}
                <Label color="purple">
                  {intl.formatMessage(messages.wizardBundle)}
                </Label>
              </>
            ) : (
              option.label
            );

          return (
            <StackItem key={option.value}>
              {selectionMode === 'single' ? (
                <Radio
                  id={`application-${option.value}`}
                  name={input.name}
                  value={option.value}
                  label={optionLabel}
                  isChecked={isChecked}
                  onChange={() => select(option.value)}
                />
              ) : (
                <Switch
                  id={`application-${option.value}`}
                  name={input.name}
                  label={optionLabel}
                  isChecked={isChecked}
                  onChange={(_event, checked) => toggle(option.value, checked)}
                />
              )}
              {option.name === COST_MANAGEMENT && (
                <Content
                  component="p"
                  className={
                    selectionMode === 'single' ? 'pf-v6-u-ml-lg' : undefined
                  }
                >
                  {intl.formatMessage(messages.costManagementDescription)}
                </Content>
              )}
              {option.name === CLOUD_METER && (
                <Stack className="pf-v6-u-mt-sm pf-v6-u-ml-lg">
                  {bundlePoints(provider, intl).map((point) => (
                    <StackItem key={point.title} className="pf-v6-u-mb-sm">
                      <Flex>
                        <FlexItem spacer={{ default: 'spacerSm' }}>
                          {/*
                            Decorative: the switch above it already says
                            whether the bundle is on, so announcing a state
                            per point would say the same thing three times.
                          */}
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
              {option.name === '/insights/platform/provisioning' &&
                selectionMode === 'single' && (
                  <Content component="p" className="pf-v6-u-ml-lg">
                    {intl.formatMessage(messages.provisioningDescription)}
                  </Content>
                )}
            </StackItem>
          );
        })}
      </Stack>
    </FormGroup>
  );
};

export default ApplicationSwitchGroup;
