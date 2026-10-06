import React from 'react';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import type { LegacySchemaType } from '@data-driven-forms/react-form-renderer/common-types';
import type { IntlShape } from 'react-intl';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
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
import type { ApplicationOption } from './ApplicationCheckboxSelect';

/**
 * Every step the Add Data Integration wizard will eventually have.
 *
 * Only {@link WizardStepId.SourceTypeSelection} is implemented here. The rest
 * are declared up front so the follow-up auth stories (RHCLOUD-51314 onwards)
 * add steps against fixed ids rather than renaming as they go — `crossroads`
 * and `nextStep` resolvers both address steps by id.
 */
export enum WizardStepId {
  SourceTypeSelection = 'source-type-selection',
  NameIntegration = 'name-integration',
  Configuration = 'configuration',
  AuthTypeSelection = 'auth-type-selection',
  AuthCredentials = 'auth-credentials',
  EndpointConfiguration = 'endpoint-configuration',
  ApplicationSelection = 'application-selection',
  Review = 'review',
  SubmissionResult = 'submission-result',
}

/**
 * Field name for the chosen provider. Matches `sources-ui`'s wizard so the
 * auth schemas that stories 2-4 port over keep working unchanged.
 */
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

/**
 * AWS's two credentials. `access_key_secret_key` is the superkey one Red Hat
 * manages on the user's behalf; `arn` is the role the manual path assumes.
 * Both land in the API's generic `username`/`password` slots.
 */
export const ACCESS_KEY_AUTH_TYPE = 'access_key_secret_key';
export const ARN_AUTH_TYPE = 'arn';

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

/**
 * Authentication types each provider offers, in card order.
 *
 * AWS has exactly one, which is why the wizard routes straight past the
 * authentication step for it — see {@link createIntegrationWizardSchema}. The
 * other three are empty until RHCLOUD-51317 implements them; an empty list is
 * what makes that step a dead end they cannot advance past, rather than a
 * broken one.
 */
const AUTH_TYPES_BY_PROVIDER: Record<SourceTypeName, string[]> = {
  amazon: [ACCESS_KEY_AUTH_TYPE],
  openshift: [],
  google: [],
  azure: [],
};

const AUTH_TYPE_LABELS: Record<
  string,
  (typeof messages)[keyof typeof messages]
> = {
  [ACCESS_KEY_AUTH_TYPE]: messages.wizardAuthTypeAccessKey,
  [ARN_AUTH_TYPE]: messages.wizardArnLabel,
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

/** Custom component key for the application checkbox select. */
export const APPLICATION_SELECT_COMPONENT = 'application-checkbox-select';

/** Field name for the selected application type ids. */
export const APPLICATIONS_FIELD = 'applications';

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
  '/insights/platform/cost-management': ['amazon', 'google', 'azure'],
  '/insights/platform/cloud-meter': ['openshift'],
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
        crossroads: [SOURCE_TYPE_FIELD, APP_CREATION_WORKFLOW_FIELD],
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
          authTypeSelectionStep(intl),
          authCredentialsStep(intl),
          applicationSelectionStep(applicationTypes, intl),
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
 * configured; that step then collects the credential itself. Everything else
 * keeps the older routing: exactly one authentication type skips the selection
 * step, because asking someone to pick from a list of one is a click that
 * answers nothing, and none at all lands on it and is held by the required
 * validator — see {@link authTypeSelectionStep}.
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
      AUTH_TYPES_BY_PROVIDER[provider].length === 1
        ? WizardStepId.AuthCredentials
        : WizardStepId.AuthTypeSelection;
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
 * Account authorization carries the superkey credential straight to the
 * applications step. Manual configuration still needs a role to assume, which
 * is the credentials step.
 */
function configurationStep(intl: IntlShape) {
  return {
    name: WizardStepId.Configuration,
    title: intl.formatMessage(messages.wizardConfigurationStepTitle),
    nextStep: {
      when: APP_CREATION_WORKFLOW_FIELD,
      stepMapper: {
        [ACCOUNT_AUTHORIZATION]: WizardStepId.ApplicationSelection,
        [MANUAL_CONFIGURATION]: WizardStepId.AuthCredentials,
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
      supportedSourceTypes: OFFERED_APPLICATIONS[appType.name],
    }));
}

/**
 * Custom validator that checks that an array field has at least one entry.
 * The built-in REQUIRED validator only checks for truthy — an empty array
 * `[]` passes it.
 */
const ARRAY_NOT_EMPTY_VALIDATOR = 'array-not-empty';

/** Builds a validator config that `data-driven-forms` resolves via the validator mapper. */
export function arrayNotEmptyValidator(message: string): {
  type: typeof ARRAY_NOT_EMPTY_VALIDATOR;
  message: string;
} {
  return { type: ARRAY_NOT_EMPTY_VALIDATOR, message };
}

/**
 * Validator function registered with data-driven-forms. Returns the error
 * message when the value is not an array with at least one element.
 */
export const validateArrayNotEmpty: (
  value: unknown,
  allValues?: Record<string, unknown>,
  meta?: { message?: string },
) => string | undefined = (value, _allValues, meta) => {
  if (Array.isArray(value) && value.length > 0) {
    return undefined;
  }
  return meta?.message ?? 'Select at least one item.';
};

/** The application selection step, filtered to apps compatible with the chosen provider. */
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
        isRequired: true,
        options: buildApplicationOptions(applicationTypes),
        validate: [
          arrayNotEmptyValidator(
            intl.formatMessage(messages.wizardApplicationRequired),
          ),
        ],
      },
    ],
  };
}

/**
 * The authentication type step.
 *
 * Only providers with something other than exactly one authentication type
 * reach it — see {@link stepAfterNaming} — which today means the three with
 * none at all. So it renders the "not supported yet" line and an option-less
 * required radio group, and the failing validator is what holds the primary
 * button disabled. That matters beyond tidiness: `selectNext` returns
 * `undefined` for a value the `stepMapper` below has no key for, which would
 * navigate the wizard to a step that does not exist.
 *
 * RHCLOUD-51317 fills `AUTH_TYPES_BY_PROVIDER` in and gives this step real
 * per-provider options.
 */
function authTypeSelectionStep(intl: IntlShape) {
  return {
    name: WizardStepId.AuthTypeSelection,
    title: intl.formatMessage(messages.wizardAuthTypeStepTitle),
    nextStep: {
      when: AUTH_TYPE_FIELD,
      stepMapper: { [ACCESS_KEY_AUTH_TYPE]: WizardStepId.AuthCredentials },
    },
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'auth-type-step-description',
        label: intl.formatMessage(messages.wizardAuthTypeUnavailable),
      },
      {
        component: componentTypes.RADIO,
        name: AUTH_TYPE_FIELD,
        label: intl.formatMessage(messages.wizardAuthTypeLabel),
        isRequired: true,
        options: [],
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: intl.formatMessage(messages.wizardAuthTypeRequired),
          },
        ],
      },
    ],
  };
}

/**
 * The credentials step — the manual configuration path.
 *
 * Account authorization collects its credential inside the configuration step,
 * so the only thing that reaches this one is a user who declined it. That
 * means AWS's role ARN: `sources-ui` pairs `manual_configuration` with the
 * `arn` authentication type, never with the access key.
 *
 * The ARN validators come from `sources-ui`'s `arnField` — required, the
 * `arn:aws:` prefix, and a minimum length. Unlike the access key, the format
 * is fixed and checkable, so checking it here beats a round trip.
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
        label: intl.formatMessage(messages.wizardArnStepDescription),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: AUTH_TYPE_FIELD,
        hideField: true,
        initialValue: ARN_AUTH_TYPE,
        initializeOnMount: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: AUTH_USERNAME_FIELD,
        label: intl.formatMessage(messages.wizardArnLabel),
        placeholder: 'arn:aws:iam:123456789:role/CostManagement',
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: intl.formatMessage(messages.wizardArnRequired),
          },
          {
            type: validatorTypes.PATTERN,
            pattern: /^arn:aws:.*/,
            message: intl.formatMessage(messages.wizardArnPattern),
          },
          {
            type: validatorTypes.MIN_LENGTH,
            threshold: 10,
            message: intl.formatMessage(messages.wizardArnLength),
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
  source?: { name?: string; app_creation_workflow?: AppCreationWorkflow };
  authentication?: {
    authtype?: AuthenticationType;
    username?: string;
    password?: string;
  };
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
): CreateSourceInput {
  return {
    name: values.source?.name ?? '',
    sourceTypeName: values[SOURCE_TYPE_FIELD] ?? '',
    appCreationWorkflow: values.source?.app_creation_workflow,
    authentication: {
      authtype: values.authentication?.authtype ?? ACCESS_KEY_AUTH_TYPE,
      username: values.authentication?.username,
      password: values.authentication?.password,
    },
    applicationTypeIds: values[APPLICATIONS_FIELD] ?? [],
  };
}
