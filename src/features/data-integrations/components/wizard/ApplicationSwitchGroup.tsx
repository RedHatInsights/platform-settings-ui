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

interface SwitchGroupProps extends UseFieldApiProps<string[] | undefined> {
  label: string;
  options: ApplicationOption[];
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
function bundlePoints(
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
 * The `application-switch-group` data-driven-forms component: one switch per
 * application the chosen provider supports.
 *
 * Switches rather than checkboxes because these are capabilities being turned
 * on, not a set being picked from — and nothing is required, so the step can
 * be passed with everything off.
 *
 * Which ones start on depends on the configuration mode: account
 * authorization hands Red Hat the credentials to set everything up, so
 * everything is on, while manual configuration starts from nothing because
 * the user has said they will wire it up themselves.
 */
const ApplicationSwitchGroup: React.FC<UseFieldApiConfig> = (props) => {
  const intl = useIntl();
  const { input, label, options } = useFieldApi(props) as SwitchGroupProps;

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
   */
  const didDefault = React.useRef(false);
  React.useEffect(() => {
    if (didDefault.current || Array.isArray(input.value)) {
      return;
    }
    didDefault.current = true;
    input.onChange(isAccountAuthorization ? compatibleIds : []);
  }, []);

  // A provider swapped after the fact can leave an application behind that it
  // does not support, which would be submitted invisibly.
  React.useEffect(() => {
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

  return (
    <FormGroup label={label} fieldId={input.name} isStack>
      <Stack hasGutter>
        {compatibleOptions.map((option) => {
          const isChecked = selectedValues.includes(option.value);

          return (
            <StackItem key={option.value}>
              <Switch
                id={`application-${option.value}`}
                name={input.name}
                label={
                  option.name === CLOUD_METER ? (
                    <>
                      {option.label}{' '}
                      <Label color="purple">
                        {intl.formatMessage(messages.wizardBundle)}
                      </Label>
                    </>
                  ) : (
                    option.label
                  )
                }
                isChecked={isChecked}
                onChange={(_event, checked) => toggle(option.value, checked)}
              />
              {option.name === COST_MANAGEMENT && (
                <Content component="p">
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
                          <Content component="p">{point.title}</Content>
                          <Content component="p">{point.description}</Content>
                        </FlexItem>
                      </Flex>
                    </StackItem>
                  ))}
                </Stack>
              )}
            </StackItem>
          );
        })}
      </Stack>
    </FormGroup>
  );
};

export default ApplicationSwitchGroup;
