import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import type { LegacySchemaType } from '@data-driven-forms/react-form-renderer/common-types';
import type { IntlShape } from 'react-intl';
import messages from '../../messages';
import { getSourceTypeIcon } from '../../constants/sourceTypeIcons';
import type { SourceTypeName } from '../../types';
import type {
  AppCreationWorkflow,
  ApplicationType,
  AuthenticationType,
  CreateSourceInput,
  SourceType,
} from '../../data/types/sources.types';
import type { ApplicationOption } from './ApplicationSwitchGroup';
import { providerWizardSteps } from './providerWizardSteps';

/** Step ids referenced by the wizard's route and crossroads mappings. */
export enum WizardStepId {
  SourceTypeSelection = 'source-type-selection',
  NameIntegration = 'name-integration',
  Configuration = 'configuration',
  AuthCredentials = 'auth-credentials',
  EndpointConfiguration = 'endpoint-configuration',
  ApplicationSelection = 'application-selection',
  AzureApplication = 'azure-application',
  GoogleApplication = 'google-application',
  ManualApplicationSelection = 'manual-application-selection',
  ManualAwsConfiguration = 'manual-aws-configuration',
  ManualAwsCostUsage = 'manual-aws-cost-usage',
  ManualAwsCostTags = 'manual-aws-cost-tags',
  ManualAwsPolicy = 'manual-aws-policy',
  ManualAwsRole = 'manual-aws-role',
  ManualAwsArn = 'manual-aws-arn',
  Review = 'review',
  SubmissionResult = 'submission-result',
}

/** Field name for the chosen provider, matching sources-ui. */
export const SOURCE_TYPE_FIELD = 'source_type';

/** Field name for the integration's display name. */
export const SOURCE_NAME_FIELD = 'source.name';

/**
 * Credential field names, all from `sources-ui`.
 *
 * `username` and `password` are the Sources API's generic credential slots, not
 * literal user credentials — for AWS they hold the access key id and the secret
 * access key. Keeping the names identical is what lets the auth schemas port
 * over unchanged.
 */
export const AUTH_TYPE_FIELD = 'authentication.authtype';
export const AUTH_USERNAME_FIELD = 'authentication.username';
export const AUTH_PASSWORD_FIELD = 'authentication.password';

/** AWS's superkey credential for account authorization. */
export const ACCESS_KEY_AUTH_TYPE = 'access_key_secret_key';

/** Field name and values for the configuration mode, both from `sources-ui`. */
export const APP_CREATION_WORKFLOW_FIELD = 'source.app_creation_workflow';
export const ACCOUNT_AUTHORIZATION = 'account_authorization';
export const MANUAL_CONFIGURATION = 'manual_configuration';

/**
 * Whether a provider offers to have Red Hat manage its credentials.
 *
 * Read off the catalogue rather than a provider list here: `is_superkey` is
 * backend data, so a provider that gains the capability gets the step without
 * a frontend change — and one that loses it stops offering a mode the API
 * would reject. `sources-ui` gates the same step the same way.
 */
export function hasSuperKeyAuth(sourceType?: SourceType): boolean {
  return Boolean(
    sourceType?.schema?.authentication?.some(({ is_superkey }) => is_superkey),
  );
}

/** Custom component keys registered in `IntegrationsFormRenderer`'s mapper. */
export const CARD_SELECT_COMPONENT = 'card-select';
export const REVIEW_SUMMARY_COMPONENT = 'review-summary';
export const SUBMISSION_RESULT_COMPONENT = 'submission-result';
export const AWS_MANUAL_INSTRUCTIONS_COMPONENT = 'aws-manual-instructions';
export const AWS_REGION_SELECT_COMPONENT = 'aws-region-select';
export const MANUAL_AWS_APPLICATION_SELECT_COMPONENT =
  'manual-aws-application-select';
export const AWS_EXTERNAL_ID_COMPONENT = 'aws-external-id';

/** Translated AWS authentication labels shown in review. */
const AUTH_TYPE_LABELS: Record<
  string,
  (typeof messages)[keyof typeof messages]
> = {
  [ACCESS_KEY_AUTH_TYPE]: messages.wizardAuthTypeAccessKey,
  arn: messages.wizardAwsArnAuth,
  'cloud-meter-arn': messages.wizardRhelArnAuth,
  'provisioning-arn': messages.wizardProvisioningArnAuth,
};

/** Translated label for a configuration mode, for the review summary. */
export function configurationModeLabel(
  workflow: AppCreationWorkflow,
  intl: IntlShape,
): string {
  return intl.formatMessage(
    workflow === ACCOUNT_AUTHORIZATION
      ? messages.wizardAccountAuthorization
      : messages.wizardManualConfiguration,
  );
}

/** Translated label for an authentication type, for the cards and the review. */
export function authTypeLabel(authType: string, intl: IntlShape): string {
  const message = AUTH_TYPE_LABELS[authType];

  return message ? intl.formatMessage(message) : authType;
}

/** Custom component key for the application switch group. */
export const APPLICATION_SELECT_COMPONENT = 'application-switch-group';

/** Field name for the selected application type ids. */
export const APPLICATIONS_FIELD = 'applications';
export const MANUAL_APPLICATION_FIELD = 'application.application_type_id';
export const AWS_BUCKET_FIELD = 'application.extra.bucket';
export const AWS_REGION_FIELD = 'application.extra.bucket_region';
export const AWS_ARN_FIELD = AUTH_USERNAME_FIELD;

/**
 * Id of the wizard's heading, and the name of the wizard field.
 *
 * The two have to match: the mapper labels its modal with
 * `aria-labelledby={field.name}` and offers no way to override that, so the
 * heading it renders has to carry the field's name as its id or the dialog
 * ends up with a dangling reference and no accessible name.
 */
const WIZARD_TITLE_ID = 'add-data-integration-wizard';

/**
 * The providers this island offers, in the order the "Add data integration"
 * dropdown lists them — Red Hat first, then the cloud three. The Sources API
 * catalogue is larger than this; anything not named here has no Phase 1
 * onboarding flow, so it gets no card.
 */
const OFFERED_PROVIDERS: SourceTypeName[] = [
  'openshift',
  'amazon',
  'google',
  'azure',
];

/**
 * The application types this island offers and the providers each one applies
 * to. The Sources API catalogue is broader — Image Builder, Remediations,
 * etc. — and its `supported_source_types` is absent from the real API
 * response, so we maintain our own allowlist keyed by the application's
 * stable API `name`.
 */
const OFFERED_APPLICATIONS: Record<string, SourceTypeName[]> = {
  '/insights/platform/cost-management': [
    'openshift',
    'amazon',
    'google',
    'azure',
  ],
  // RHEL management is about RHEL instances running in someone else's cloud,
  // so it is offered to the three cloud providers and not to OpenShift. Both
  // lists are sources-ui's `supported_source_types` fixtures.
  '/insights/platform/cloud-meter': ['amazon', 'google', 'azure'],
  '/insights/platform/provisioning': ['amazon'],
};

const PROVIDER_LABELS = {
  openshift: messages.openshiftLabel,
  amazon: messages.amazonLabel,
  google: messages.googleLabel,
  azure: messages.azureLabel,
} as const;

/** Translated provider name, for the cards and the review summary. */
export function providerLabel(
  provider: SourceTypeName,
  intl: IntlShape,
): string {
  return intl.formatMessage(PROVIDER_LABELS[provider]);
}

/** One selectable card in the source type step. */
export interface SourceTypeOption {
  value: SourceTypeName;
  label: string;
  /** Absolute path to the provider logomark, or `undefined` if unmapped. */
  iconUrl?: string;
}

/**
 * Narrows the API catalogue to the offered providers and attaches the
 * translated name and icon.
 *
 * The label comes from our own messages rather than the API's `product_name`
 * so the cards read identically to the dropdown that opened the wizard, and so
 * the names are translatable.
 */
function buildSourceTypeValues(sourceTypes: SourceType[]): SourceTypeName[] {
  const availableNames = new Set(sourceTypes.map((t) => t.name));
  return OFFERED_PROVIDERS.filter((provider) => availableNames.has(provider));
}

/** Builds the card options for the source type step from the API catalogue. */
export function buildSourceTypeOptions(
  sourceTypes: SourceType[],
  intl: IntlShape,
): SourceTypeOption[] {
  return buildSourceTypeValues(sourceTypes).map((provider) => ({
    value: provider,
    label: providerLabel(provider, intl),
    iconUrl: getSourceTypeIcon(provider),
  }));
}

export interface IntegrationWizardSchemaOptions {
  /** The provider catalogue, as returned by `useSourceTypes()`. */
  sourceTypes: SourceType[];
  /** The application catalogue, as returned by `useApplicationTypes()`. */
  applicationTypes: ApplicationType[];
  awsRegions?: string[];
  isAwsRegionsError?: boolean;
  hcsEnrolled?: boolean;
  enableLighthouse?: boolean;
  intl: IntlShape;
  /**
   * Provider the wizard was opened with, if any. Its only effect on the schema
   * is where the wizard starts — see {@link createIntegrationWizardSchema}.
   */
  selectedType?: SourceTypeName | null;
}

/**
 * Narrows a requested pre-selection to one the catalogue actually offers.
 *
 * The provider can arrive from a caller that has not seen the catalogue — a
 * deep link, or a dropdown rendered from a stale one. Seeding the field with a
 * provider that has no card would satisfy the REQUIRED validator while leaving
 * step one showing nothing selected, so the wizard would skip past a step the
 * user never answered and submit a provider it cannot offer.
 */
export function resolveSelectedType(
  sourceTypes: SourceType[],
  selectedType?: SourceTypeName | null,
): SourceTypeName | undefined {
  if (!selectedType) {
    return undefined;
  }

  const isOffered = buildSourceTypeValues(sourceTypes).includes(selectedType);

  return isOffered ? selectedType : undefined;
}

/**
 * Pre-selects the card for the provider the wizard was opened with.
 *
 * Handed to `FormRenderer`'s `initialValues` so final-form seeds the field —
 * the card component never reads the prop, which is what keeps the selection
 * in one place once the user starts clicking.
 *
 * Pass a provider already narrowed by {@link resolveSelectedType}; this only
 * shapes the value it is given.
 */
export function createWizardInitialValues(
  selectedType?: SourceTypeName | null,
): Record<string, SourceTypeName> {
  return selectedType ? { [SOURCE_TYPE_FIELD]: selectedType } : {};
}

/**
 * Builds the Add Data Integration wizard as a data-driven-forms schema.
 *
 * Pure: everything it needs is an argument, so the shape can be asserted in a
 * unit test and rendered in Storybook from fixtures.
 *
 * Opening with a provider already chosen skips straight to naming. The user
 * answered step one in the dropdown, so showing it again just to have them
 * press Next would be asking twice; step one stays in the nav and Back returns
 * to it, which is what makes the choice reviewable rather than hidden.
 */
export function createIntegrationWizardSchema({
  sourceTypes,
  applicationTypes,
  awsRegions = [],
  isAwsRegionsError = false,
  hcsEnrolled = false,
  enableLighthouse = false,
  intl,
  selectedType,
}: IntegrationWizardSchemaOptions): LegacySchemaType {
  // A provider with no card cannot start the wizard on step two: there would
  // be nothing selected to go Back to.
  const startingType = resolveSelectedType(sourceTypes, selectedType);

  return {
    fields: [
      {
        component: componentTypes.WIZARD,
        name: WIZARD_TITLE_ID,
        inModal: true,
        showTitles: true,
        title: intl.formatMessage(messages.wizardTitle),
        titleId: WIZARD_TITLE_ID,
        description: intl.formatMessage(messages.wizardDescription),
        closeButtonAriaLabel: intl.formatMessage(messages.wizardClose),
        // The mapper nests a second `role="dialog"` inside the modal and
        // spreads unknown schema keys onto it, so this is the only way to give
        // that inner node the same accessible name as the modal around it.
        'aria-labelledby': WIZARD_TITLE_ID,
        buttonLabels: {
          // Review is the last step the user fills in, and the result step
          // after it is flagged `isProgressAfterSubmissionStep`, which is what
          // makes the mapper render this label and call `handleSubmit` there.
          submit: intl.formatMessage(messages.wizardAdd),
          next: intl.formatMessage(messages.wizardNext),
          back: intl.formatMessage(messages.wizardBack),
          cancel: intl.formatMessage(messages.wizardCancel),
        },
        /**
         * Changing the provider invalidates everything chosen after it. Wired
         * now so the auth and application steps reset correctly the moment
         * stories 2-4 add them, instead of shipping stale answers.
         */
        crossroads: [
          SOURCE_TYPE_FIELD,
          APP_CREATION_WORKFLOW_FIELD,
          MANUAL_APPLICATION_FIELD,
        ],
        initialState: startingType
          ? {
              activeStep: WizardStepId.NameIntegration,
              activeStepIndex: 1,
              maxStepIndex: 1,
              // Listing step one as already visited is what leaves Back and
              // its nav link enabled; without it the user would be stranded
              // on step two with no way to change provider.
              prevSteps: [WizardStepId.SourceTypeSelection],
            }
          : undefined,
        fields: [
          sourceTypeStep(sourceTypes, intl),
          nameIntegrationStep(sourceTypes, intl),
          configurationStep(intl),
          authCredentialsStep(intl),
          applicationSelectionStep(applicationTypes, intl),
          manualApplicationSelectionStep(applicationTypes, hcsEnrolled, intl),
          manualAwsConfigurationStep(
            applicationTypes,
            awsRegions,
            isAwsRegionsError,
            intl,
          ),
          manualAwsCostUsageStep(intl),
          manualAwsCostTagsStep(intl),
          manualAwsPolicyStep(applicationTypes, intl),
          manualAwsRoleStep(applicationTypes, intl),
          manualAwsArnStep(applicationTypes, intl),
          ...providerWizardSteps(applicationTypes, intl, enableLighthouse),
          reviewStep(intl),
          submissionResultStep(intl),
        ],
      },
    ],
  };
}

function sourceTypeStep(sourceTypes: SourceType[], intl: IntlShape) {
  return {
    name: WizardStepId.SourceTypeSelection,
    title: intl.formatMessage(messages.wizardSourceTypeStepTitle),
    // A plain string for now. The auth stories replace it with a resolver that
    // branches on `source_type`, which is why `crossroads` is already wired.
    nextStep: WizardStepId.NameIntegration,
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'source-type-step-description',
        label: intl.formatMessage(messages.wizardSourceTypeStepDescription),
      },
      {
        component: CARD_SELECT_COMPONENT,
        name: SOURCE_TYPE_FIELD,
        label: intl.formatMessage(messages.wizardSourceTypeLabel),
        isRequired: true,
        options: buildSourceTypeOptions(sourceTypes, intl),
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: intl.formatMessage(messages.wizardSourceTypeRequired),
          },
        ],
      },
    ],
  };
}

/**
 * Where naming leads, per provider.
 *
 * A provider Red Hat can manage credentials for is asked how it wants to be
 * configured; that step then collects the credential itself. Other providers
 * select an application first, as they do in sources-ui. AWS without the
 * superkey catalogue flag falls back to its generic credential step.
 *
 * Every provider that can reach this resolver must be a key. `selectNext`
 * returns `undefined` for an unmapped value while `nextStep` itself stays
 * truthy, so the footer would offer a Next that navigates the wizard to a step
 * that does not exist. The schema test asserts the mapping is total.
 */
function stepAfterNaming(sourceTypes: SourceType[]) {
  const stepMapper: Record<string, string> = {};
  const byName = new Map(sourceTypes.map((type) => [type.name, type]));

  for (const provider of buildSourceTypeValues(sourceTypes)) {
    if (hasSuperKeyAuth(byName.get(provider))) {
      stepMapper[provider] = WizardStepId.Configuration;
      continue;
    }

    stepMapper[provider] =
      provider === 'openshift'
        ? 'openshift-application'
        : provider === 'azure'
          ? WizardStepId.AzureApplication
          : provider === 'google'
            ? WizardStepId.GoogleApplication
            : WizardStepId.AuthCredentials;
  }

  return { when: SOURCE_TYPE_FIELD, stepMapper };
}

/**
 * The "Select configuration" step.
 *
 * Two radios sharing one field name rather than one radio with two options,
 * because the account-authorization half owns the credential fields that sit
 * between them — exactly how `sources-ui` builds it. Those fields are a
 * `condition`-gated sub-form, so they register (and validate) only while that
 * mode is selected; picking manual configuration unregisters them rather than
 * leaving a required access key blocking Next invisibly.
 *
 * Manual configuration uses an application-bound role instead of an account
 * access key.
 */
function configurationStep(intl: IntlShape) {
  return {
    name: WizardStepId.Configuration,
    title: intl.formatMessage(messages.wizardConfigurationStepTitle),
    nextStep: {
      when: APP_CREATION_WORKFLOW_FIELD,
      stepMapper: {
        [ACCOUNT_AUTHORIZATION]: WizardStepId.ApplicationSelection,
        [MANUAL_CONFIGURATION]: WizardStepId.ManualApplicationSelection,
      },
    },
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'configuration-step-description',
        label: intl.formatMessage(messages.wizardConfigurationStepDescription),
      },
      {
        component: componentTypes.RADIO,
        name: APP_CREATION_WORKFLOW_FIELD,
        label: intl.formatMessage(messages.wizardConfigurationModeLabel),
        isRequired: true,
        options: [
          {
            value: ACCOUNT_AUTHORIZATION,
            label: (
              <>
                {intl.formatMessage(messages.wizardAccountAuthorization)}{' '}
                <Label color="purple">
                  {intl.formatMessage(messages.wizardRecommended)}
                </Label>
              </>
            ),
            description: intl.formatMessage(
              messages.wizardAccountAuthorizationDescription,
            ),
          },
        ],
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: intl.formatMessage(
              messages.wizardConfigurationModeRequired,
            ),
          },
        ],
      },
      {
        component: componentTypes.SUB_FORM,
        name: 'account-authorization-credentials',
        condition: {
          when: APP_CREATION_WORKFLOW_FIELD,
          is: ACCOUNT_AUTHORIZATION,
          // Switching to manual configuration hides these fields but would
          // otherwise leave their values sitting in form state — still shown
          // on the review step and still sent in the create payload if the
          // user switches back and forth or retries a failed submission.
          else: {
            set: {
              [AUTH_TYPE_FIELD]: undefined,
              [AUTH_USERNAME_FIELD]: undefined,
              [AUTH_PASSWORD_FIELD]: undefined,
            },
          },
        },
        fields: [
          {
            component: componentTypes.TEXT_FIELD,
            name: AUTH_TYPE_FIELD,
            hideField: true,
            initialValue: ACCESS_KEY_AUTH_TYPE,
            initializeOnMount: true,
          },
          {
            component: componentTypes.TEXT_FIELD,
            name: AUTH_USERNAME_FIELD,
            label: intl.formatMessage(messages.wizardAccessKeyIdLabel),
            placeholder: 'AKIAIOSFODNN7EXAMPLE',
            isRequired: true,
            validate: [
              {
                type: validatorTypes.REQUIRED,
                message: intl.formatMessage(messages.wizardAccessKeyIdRequired),
              },
            ],
          },
          {
            component: componentTypes.TEXT_FIELD,
            name: AUTH_PASSWORD_FIELD,
            label: intl.formatMessage(messages.wizardSecretAccessKeyLabel),
            type: 'password',
            isRequired: true,
            validate: [
              {
                type: validatorTypes.REQUIRED,
                message: intl.formatMessage(
                  messages.wizardSecretAccessKeyRequired,
                ),
              },
            ],
          },
        ],
      },
      {
        component: componentTypes.RADIO,
        name: APP_CREATION_WORKFLOW_FIELD,
        options: [
          {
            value: MANUAL_CONFIGURATION,
            label: intl.formatMessage(messages.wizardManualConfiguration),
            description: intl.formatMessage(
              messages.wizardManualConfigurationDescription,
            ),
          },
        ],
      },
    ],
  };
}

/**
 * The naming step.
 *
 * Its description names the provider, so there is one `condition`-gated line
 * per option rather than a single line built from the current value: plain
 * text is not a field, so it cannot subscribe to `source_type` and re-render
 * when the user goes back and picks something else. `condition` is evaluated
 * by the renderer against live form state, which gets the same result without
 * a custom component.
 */
function nameIntegrationStep(sourceTypes: SourceType[], intl: IntlShape) {
  return {
    name: WizardStepId.NameIntegration,
    title: intl.formatMessage(messages.wizardNameStepTitle),
    nextStep: stepAfterNaming(sourceTypes),
    fields: [
      ...buildSourceTypeOptions(sourceTypes, intl).map(({ value, label }) => ({
        component: componentTypes.PLAIN_TEXT,
        name: `name-step-description-${value}`,
        condition: { when: SOURCE_TYPE_FIELD, is: value },
        label: intl.formatMessage(messages.wizardNameStepDescription, {
          provider: label,
        }),
      })),
      {
        component: componentTypes.TEXT_FIELD,
        name: SOURCE_NAME_FIELD,
        label: intl.formatMessage(messages.wizardNameLabel),
        placeholder: intl.formatMessage(messages.wizardNamePlaceholder),
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: intl.formatMessage(messages.wizardNameRequired),
          },
        ],
      },
    ],
  };
}

/**
 * Narrows the API catalogue to the offered applications and attaches the
 * provider compatibility list from {@link OFFERED_APPLICATIONS} rather than
 * the API's own `supported_source_types`, which may include providers this
 * wizard does not onboard.
 */
export function buildApplicationOptions(
  applicationTypes: ApplicationType[],
): ApplicationOption[] {
  return applicationTypes
    .filter((appType) => appType.name in OFFERED_APPLICATIONS)
    .map((appType) => ({
      value: appType.id,
      label: appType.display_name,
      name: appType.name,
      supportedSourceTypes: OFFERED_APPLICATIONS[appType.name],
    }));
}

/**
 * The application selection step.
 *
 * Nothing is required: an integration with no applications is a valid thing
 * to create, and the step says as much — these can be turned on and off after
 * creation. Which ones start on is the switch group's business, because it
 * depends on the configuration mode.
 */
function applicationSelectionStep(
  applicationTypes: ApplicationType[],
  intl: IntlShape,
) {
  return {
    name: WizardStepId.ApplicationSelection,
    title: intl.formatMessage(messages.wizardApplicationStepTitle),
    nextStep: WizardStepId.Review,
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'application-step-description',
        label: intl.formatMessage(messages.wizardApplicationStepDescription),
      },
      {
        component: APPLICATION_SELECT_COMPONENT,
        name: APPLICATIONS_FIELD,
        label: intl.formatMessage(messages.wizardApplicationLabel),
        options: buildApplicationOptions(applicationTypes),
      },
    ],
  };
}

const COST_APP = '/insights/platform/cost-management';
const RHEL_APP = '/insights/platform/cloud-meter';
const PROVISIONING_APP = '/insights/platform/provisioning';

export function manualAwsAuthType(
  appName?: string,
): AuthenticationType | undefined {
  if (appName === COST_APP) return 'arn';
  if (appName === RHEL_APP) return 'cloud-meter-arn';
  if (appName === PROVISIONING_APP) return 'provisioning-arn';
  return undefined;
}

function manualApplicationSelectionStep(
  applicationTypes: ApplicationType[],
  hcsEnrolled: boolean,
  intl: IntlShape,
) {
  return {
    name: WizardStepId.ManualApplicationSelection,
    title: intl.formatMessage(messages.wizardManualApplicationTitle),
    nextStep: WizardStepId.ManualAwsConfiguration,
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'manual-application-description',
        label: intl.formatMessage(messages.wizardManualApplicationDescription),
      },
      {
        component: MANUAL_AWS_APPLICATION_SELECT_COMPONENT,
        name: MANUAL_APPLICATION_FIELD,
        label: intl.formatMessage(messages.wizardManualApplicationLabel),
        isRequired: true,
        options: applicationTypes
          .filter(({ name }) =>
            [COST_APP, RHEL_APP, PROVISIONING_APP].includes(name),
          )
          .map(({ id, name, display_name }) => ({
            value: id,
            label:
              hcsEnrolled && name === COST_APP
                ? intl.formatMessage(messages.wizardAwsHcsName)
                : display_name,
          })),
        validate: [{ type: validatorTypes.REQUIRED }],
      },
    ],
  };
}

function manualAwsConfigurationStep(
  applicationTypes: ApplicationType[],
  awsRegions: string[],
  isAwsRegionsError: boolean,
  intl: IntlShape,
) {
  const appId = (name: string) =>
    applicationTypes.find((app) => app.name === name)?.id;
  const provisioningId = appId(PROVISIONING_APP);

  return {
    name: WizardStepId.ManualAwsConfiguration,
    title: intl.formatMessage(messages.wizardManualAwsConfigurationTitle),
    nextStep: {
      when: MANUAL_APPLICATION_FIELD,
      stepMapper: Object.fromEntries(
        applicationTypes
          .filter(({ name }) =>
            [COST_APP, RHEL_APP, PROVISIONING_APP].includes(name),
          )
          .map(({ id }) => [
            id,
            id === provisioningId
              ? WizardStepId.ManualAwsRole
              : id === appId(COST_APP)
                ? WizardStepId.ManualAwsCostUsage
                : WizardStepId.ManualAwsPolicy,
          ]),
      ),
    },
    fields: [
      ...([COST_APP, RHEL_APP, PROVISIONING_APP] as const).flatMap(
        (appName) => {
          const id = appId(appName);
          if (!id) return [];
          return [
            {
              component: componentTypes.SUB_FORM,
              name: `manual-aws-${id}`,
              condition: { when: MANUAL_APPLICATION_FIELD, is: id },
              fields: [
                {
                  component: AWS_MANUAL_INSTRUCTIONS_COMPONENT,
                  name: `manual-aws-instructions-${id}`,
                  appName,
                  applicationTypeId: id,
                  stage: 'details',
                },
                ...(appName === COST_APP
                  ? [
                      {
                        component: componentTypes.TEXT_FIELD,
                        name: AWS_BUCKET_FIELD,
                        label: intl.formatMessage(messages.wizardAwsBucket),
                        isRequired: true,
                        validate: [
                          { type: validatorTypes.REQUIRED },
                          {
                            type: validatorTypes.PATTERN,
                            pattern:
                              /(?!(^((2(5[0-5]|[0-4][0-9])|[01]?[0-9]{1,2})\.){3}(2(5[0-5]|[0-4][0-9])|[01]?[0-9]{1,2})$|^xn--|-s3alias$))^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
                            message: intl.formatMessage(
                              messages.wizardAwsBucketPattern,
                            ),
                          },
                        ],
                      },
                      {
                        component: AWS_REGION_SELECT_COMPONENT,
                        name: AWS_REGION_FIELD,
                        label: intl.formatMessage(messages.wizardAwsRegion),
                        isRequired: true,
                        validate: [{ type: validatorTypes.REQUIRED }],
                        options: awsRegions.map((region) => ({
                          value: region,
                          label: region,
                        })),
                      },
                      ...(isAwsRegionsError
                        ? [
                            {
                              component: componentTypes.PLAIN_TEXT,
                              name: 'aws-region-error',
                              label: intl.formatMessage(
                                messages.wizardAwsRegionsError,
                              ),
                            },
                          ]
                        : []),
                    ]
                  : []),
                ...(appName === PROVISIONING_APP
                  ? [
                      {
                        component: componentTypes.TEXT_FIELD,
                        name: 'meta.account',
                        label: intl.formatMessage(
                          messages.wizardAwsAccountNumber,
                        ),
                        placeholder: '123456789012',
                        isRequired: true,
                        validate: [{ type: validatorTypes.REQUIRED }],
                      },
                    ]
                  : []),
              ],
            },
          ];
        },
      ),
    ],
  };
}

function manualAwsCostUsageStep(intl: IntlShape) {
  return {
    name: WizardStepId.ManualAwsCostUsage,
    title: intl.formatMessage(messages.wizardAwsCostUsageTitle),
    nextStep: WizardStepId.ManualAwsCostTags,
    fields: [
      {
        component: AWS_MANUAL_INSTRUCTIONS_COMPONENT,
        name: 'manual-aws-cost-usage-instructions',
        appName: COST_APP,
        applicationTypeId: '',
        stage: 'usage',
      },
      {
        component: componentTypes.RADIO,
        name: 'application.extra.storage_only',
        label: intl.formatMessage(messages.wizardAwsExportMode),
        initialValue: false,
        initializeOnMount: true,
        options: [
          {
            value: false,
            label: intl.formatMessage(messages.wizardAwsDefaultExport),
          },
          {
            value: true,
            label: intl.formatMessage(messages.wizardAwsCustomExport),
          },
        ],
      },
      {
        component: AWS_MANUAL_INSTRUCTIONS_COMPONENT,
        name: 'manual-aws-cost-export-default',
        condition: { when: 'application.extra.storage_only', is: false },
        appName: COST_APP,
        applicationTypeId: '',
        stage: 'export-default',
      },
      {
        component: AWS_MANUAL_INSTRUCTIONS_COMPONENT,
        name: 'manual-aws-cost-export-custom',
        condition: { when: 'application.extra.storage_only', is: true },
        appName: COST_APP,
        applicationTypeId: '',
        stage: 'export-custom',
      },
    ],
  };
}

function manualAwsCostTagsStep(intl: IntlShape) {
  return {
    name: WizardStepId.ManualAwsCostTags,
    title: intl.formatMessage(messages.wizardAwsCostTagsTitle),
    nextStep: WizardStepId.ManualAwsPolicy,
    fields: [
      {
        component: AWS_MANUAL_INSTRUCTIONS_COMPONENT,
        name: 'manual-aws-cost-tags-instructions',
        appName: COST_APP,
        applicationTypeId: '',
        stage: 'tags',
      },
      {
        component: componentTypes.CHECKBOX,
        name: 'application.extra.metered',
        label: intl.formatMessage(messages.wizardAwsMetered),
      },
      {
        component: componentTypes.CHECKBOX,
        name: 'aws.aliases.enabled',
        label: intl.formatMessage(messages.wizardAwsAliases),
      },
      {
        component: componentTypes.CHECKBOX,
        name: 'aws.org_units.enabled',
        label: intl.formatMessage(messages.wizardAwsOrgUnits),
      },
    ],
  };
}

function manualInstructionFields(
  applicationTypes: ApplicationType[],
  stage: 'policy' | 'role' | 'arn',
) {
  return applicationTypes
    .filter(({ name }) =>
      (stage === 'policy'
        ? [COST_APP, RHEL_APP]
        : [COST_APP, RHEL_APP, PROVISIONING_APP]
      ).includes(name),
    )
    .map(({ id, name }) => ({
      component: AWS_MANUAL_INSTRUCTIONS_COMPONENT,
      name: `manual-aws-${stage}-${id}`,
      condition: { when: MANUAL_APPLICATION_FIELD, is: id },
      appName: name,
      applicationTypeId: id,
      stage,
    }));
}

function manualAwsPolicyStep(
  applicationTypes: ApplicationType[],
  intl: IntlShape,
) {
  return {
    name: WizardStepId.ManualAwsPolicy,
    title: intl.formatMessage(messages.wizardAwsPolicyTitle),
    nextStep: WizardStepId.ManualAwsRole,
    fields: manualInstructionFields(applicationTypes, 'policy'),
  };
}

function manualAwsRoleStep(
  applicationTypes: ApplicationType[],
  intl: IntlShape,
) {
  return {
    name: WizardStepId.ManualAwsRole,
    title: intl.formatMessage(messages.wizardAwsRoleTitle),
    nextStep: WizardStepId.ManualAwsArn,
    fields: [
      ...manualInstructionFields(applicationTypes, 'role'),
      ...applicationTypes
        .filter(({ name }) => [COST_APP, RHEL_APP].includes(name))
        .map(({ id }) => ({
          component: AWS_EXTERNAL_ID_COMPONENT,
          name: 'authentication.extra.external_id',
          condition: { when: MANUAL_APPLICATION_FIELD, is: id },
        })),
    ],
  };
}

function manualAwsArnStep(
  applicationTypes: ApplicationType[],
  intl: IntlShape,
) {
  return {
    name: WizardStepId.ManualAwsArn,
    title: intl.formatMessage(messages.wizardAwsArnTitle),
    nextStep: WizardStepId.Review,
    fields: [
      ...manualInstructionFields(applicationTypes, 'arn'),
      {
        component: componentTypes.TEXT_FIELD,
        name: AWS_ARN_FIELD,
        label: intl.formatMessage(messages.wizardAwsRoleArn),
        placeholder: 'arn:aws:iam::123456789012:role/CostManagement',
        isRequired: true,
        validate: [
          { type: validatorTypes.REQUIRED },
          {
            type: validatorTypes.PATTERN,
            pattern: /^arn:aws:.*/,
            message: intl.formatMessage(messages.wizardAwsRoleArnPattern),
          },
          { type: validatorTypes.MIN_LENGTH, threshold: 10 },
        ],
      },
    ],
  };
}

/**
 * AWS fallback when the catalogue has no superkey flag. The normal AWS path
 * collects the same fields in the configuration step.
 *
 * `authtype` is not something the user picks, so it is written into the form
 * on mount instead of being asked for. `initializeOnMount` makes that survive
 * a Back-and-forward, which plain `initialValue` would not.
 */
function authCredentialsStep(intl: IntlShape) {
  return {
    name: WizardStepId.AuthCredentials,
    title: intl.formatMessage(messages.wizardCredentialsStepTitle),
    nextStep: WizardStepId.ApplicationSelection,
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'credentials-step-description',
        label: intl.formatMessage(messages.wizardCredentialsStepDescription),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: AUTH_TYPE_FIELD,
        hideField: true,
        initialValue: ACCESS_KEY_AUTH_TYPE,
        initializeOnMount: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: AUTH_USERNAME_FIELD,
        label: intl.formatMessage(messages.wizardAccessKeyIdLabel),
        placeholder: 'AKIAIOSFODNN7EXAMPLE',
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: intl.formatMessage(messages.wizardAccessKeyIdRequired),
          },
        ],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: AUTH_PASSWORD_FIELD,
        label: intl.formatMessage(messages.wizardSecretAccessKeyLabel),
        type: 'password',
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: intl.formatMessage(messages.wizardSecretAccessKeyRequired),
          },
        ],
      },
    ],
  };
}

/**
 * The review step.
 *
 * The summary is a custom component rather than plain text because it has to
 * read live form values and offer buttons that jump back; see
 * {@link ReviewSummary}. `nextStep` names the result step, which is flagged
 * `isProgressAfterSubmissionStep` — that is what turns this step's primary
 * button into the submit button.
 */
function reviewStep(intl: IntlShape) {
  return {
    name: WizardStepId.Review,
    title: intl.formatMessage(messages.wizardReviewStepTitle),
    nextStep: WizardStepId.SubmissionResult,
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'review-step-description',
        label: intl.formatMessage(messages.wizardReviewStepDescription),
        TextContentProps: { className: 'pf-v6-u-mb-md' },
      },
      {
        component: REVIEW_SUMMARY_COMPONENT,
        name: 'review-summary',
      },
    ],
  };
}

/**
 * The step shown after submitting.
 *
 * `isProgressAfterSubmissionStep` makes the mapper render these fields in
 * place of the whole wizard body — nav, titles and footer included — while
 * leaving the form mounted. That is what lets the error view offer a way back
 * to review with everything the user typed still there.
 */
function submissionResultStep(intl: IntlShape) {
  return {
    name: WizardStepId.SubmissionResult,
    title: intl.formatMessage(messages.wizardResultStepTitle),
    isProgressAfterSubmissionStep: true,
    fields: [
      {
        component: SUBMISSION_RESULT_COMPONENT,
        name: 'submission-result',
      },
    ],
  };
}

/** The form's value shape, as final-form nests the dotted field names. */
export interface IntegrationWizardValues {
  [SOURCE_TYPE_FIELD]?: SourceTypeName;
  source?: {
    name?: string;
    app_creation_workflow?: AppCreationWorkflow;
    source_ref?: string;
  };
  authentication?: {
    authtype?: AuthenticationType;
    username?: string;
    password?: string;
    extra?: { external_id?: string; azure?: { tenant_id?: string } };
  };
  application?: {
    application_type_id?: string;
    extra?: Record<string, unknown>;
  };
  endpoint?: {
    role?: string;
    verify_ssl?: boolean;
    certificate_authority?: string;
  };
  url?: string;
  aws?: { aliases?: { enabled?: boolean }; org_units?: { enabled?: boolean } };
  meta?: { account?: string };
  [APPLICATIONS_FIELD]?: string[];
}

/**
 * Maps submitted form values onto the data layer's input.
 *
 * Separate from the mutation so the mapping can be asserted without a form
 * around it, and so the wizard stays the only thing that knows the field
 * names. Values arrive already filtered by the renderer to the fields of
 * visited steps, so a skipped step cannot contribute.
 */
export function toCreateSourceInput(
  values: IntegrationWizardValues,
  applicationTypes: ApplicationType[] = [],
): CreateSourceInput {
  const manual = values.source?.app_creation_workflow === MANUAL_CONFIGURATION;
  const provider = values[SOURCE_TYPE_FIELD];
  const manualApplication = applicationTypes.find(
    ({ id }) => id === values.application?.application_type_id,
  );
  const manualAuthType = manualAwsAuthType(manualApplication?.name);
  if (manual && !manualAuthType) {
    throw new Error('Unknown manual AWS application');
  }
  return {
    name: values.source?.name ?? '',
    sourceTypeName: provider ?? '',
    appCreationWorkflow: values.source?.app_creation_workflow,
    sourceRef:
      provider === 'openshift' && manualApplication?.name === COST_APP
        ? values.source?.source_ref
        : undefined,
    endpoint:
      provider !== 'amazon' &&
      !manualApplication &&
      (values.url || values.endpoint)
        ? { ...values.endpoint, url: values.url }
        : undefined,
    authentication: (
      provider === 'amazon'
        ? Boolean(values.authentication?.username)
        : Boolean(
            values.authentication?.authtype &&
            values.authentication.authtype !== 'empty',
          )
    )
      ? {
          authtype: manual
            ? manualAuthType!
            : (values.authentication?.authtype ?? ACCESS_KEY_AUTH_TYPE),
          username: values.authentication?.username,
          password: values.authentication?.password,
          ...(values.authentication?.extra
            ? { extra: values.authentication.extra }
            : {}),
        }
      : undefined,
    applicationTypeIds: manual ? [] : (values[APPLICATIONS_FIELD] ?? []),
    ...(applicationTypes.length
      ? {
          availabilityWaitApplicationTypeIds: applicationTypes
            .filter(({ name }) => [COST_APP, RHEL_APP].includes(name))
            .map(({ id }) => id),
        }
      : {}),
    manualApplication:
      manualApplication && manual
        ? {
            id: manualApplication.id,
            name: manualApplication.name,
            extra: values.application?.extra,
          }
        : undefined,
    selectedApplication:
      provider !== 'amazon' && manualApplication
        ? {
            id: manualApplication.id,
            name: manualApplication.name,
            extra: values.application?.extra,
          }
        : undefined,
  };
}
