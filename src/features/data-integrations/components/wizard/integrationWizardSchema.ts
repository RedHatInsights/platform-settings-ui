import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import type { LegacySchemaType } from '@data-driven-forms/react-form-renderer/common-types';
import type { IntlShape } from 'react-intl';
import messages from '../../messages';
import { getSourceTypeIcon } from '../../constants/sourceTypeIcons';
import type { SourceTypeName } from '../../types';
import type { SourceType } from '../../data/types/sources.types';

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
  AuthTypeSelection = 'auth-type-selection',
  AuthCredentials = 'auth-credentials',
  EndpointConfiguration = 'endpoint-configuration',
  ApplicationSelection = 'application-selection',
  Review = 'review',
}

/**
 * Field name for the chosen provider. Matches `sources-ui`'s wizard so the
 * auth schemas that stories 2-4 port over keep working unchanged.
 */
export const SOURCE_TYPE_FIELD = 'source_type';

/** Field name for the integration's display name, likewise from `sources-ui`. */
export const SOURCE_NAME_FIELD = 'source.name';

/** Custom component key registered in `IntegrationsFormRenderer`'s mapper. */
export const CARD_SELECT_COMPONENT = 'card-select';

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

const PROVIDER_LABELS = {
  openshift: messages.openshiftLabel,
  amazon: messages.amazonLabel,
  google: messages.googleLabel,
  azure: messages.azureLabel,
} as const;

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

export function buildSourceTypeOptions(
  sourceTypes: SourceType[],
  intl: IntlShape,
): SourceTypeOption[] {
  return buildSourceTypeValues(sourceTypes).map((provider) => ({
    value: provider,
    label: intl.formatMessage(PROVIDER_LABELS[provider]),
    iconUrl: getSourceTypeIcon(provider),
  }));
}

export interface IntegrationWizardSchemaOptions {
  /** The provider catalogue, as returned by `useSourceTypes()`. */
  sourceTypes: SourceType[];
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
          // Labelled "Next" rather than "Add": naming is the last step that
          // exists today, so data-driven-forms renders the submit button as
          // its primary action. The application and review steps turn this
          // into a genuine submit, at which point it reverts to "Add".
          submit: intl.formatMessage(messages.wizardNext),
          next: intl.formatMessage(messages.wizardNext),
          back: intl.formatMessage(messages.wizardBack),
          cancel: intl.formatMessage(messages.wizardCancel),
        },
        /**
         * Changing the provider invalidates everything chosen after it. Wired
         * now so the auth and application steps reset correctly the moment
         * stories 2-4 add them, instead of shipping stale answers.
         */
        crossroads: [SOURCE_TYPE_FIELD],
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
    // No `nextStep`: naming is the last step until the application and review
    // steps land, which is what makes the primary button the submit button.
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
