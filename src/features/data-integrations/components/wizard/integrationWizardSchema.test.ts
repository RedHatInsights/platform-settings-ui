import type { IntlShape, MessageDescriptor } from 'react-intl';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  ACCESS_KEY_AUTH_TYPE,
  APPLICATIONS_FIELD,
  APPLICATION_SELECT_COMPONENT,
  AUTH_PASSWORD_FIELD,
  AUTH_TYPE_FIELD,
  AUTH_USERNAME_FIELD,
  CARD_SELECT_COMPONENT,
  REVIEW_SUMMARY_COMPONENT,
  SOURCE_NAME_FIELD,
  SOURCE_TYPE_FIELD,
  WizardStepId,
  buildApplicationOptions,
  buildSourceTypeOptions,
  createIntegrationWizardSchema,
  createWizardInitialValues,
  resolveSelectedType,
  toCreateSourceInput,
  validateArrayNotEmpty,
} from './integrationWizardSchema';
import type {
  ApplicationType,
  SourceType,
} from '../../data/types/sources.types';
import type { SourceTypeName } from '../../types';

/**
 * A stub rather than a real `createIntl`: react-intl and its @formatjs
 * dependencies are ESM-only and this repo has no Babel config for Jest to
 * transpile them with. The factory only ever calls `formatMessage`, and these
 * assertions are about schema shape, so resolving each descriptor to its
 * `defaultMessage` is enough — and keeps the expected strings readable.
 */
const intl = {
  formatMessage: (
    descriptor: MessageDescriptor,
    values: Record<string, string> = {},
  ) =>
    String(descriptor.defaultMessage).replace(
      /\{(\w+)\}/g,
      (placeholder, key: string) => values[key] ?? placeholder,
    ),
} as unknown as IntlShape;

const sourceTypes: SourceType[] = [
  { id: '1', name: 'openshift', product_name: 'OpenShift Container Platform' },
  { id: '2', name: 'amazon', product_name: 'Amazon Web Services' },
  { id: '3', name: 'google', product_name: 'Google Cloud Platform' },
  { id: '4', name: 'azure', product_name: 'Microsoft Azure' },
];

const applicationTypes: ApplicationType[] = [
  {
    id: '1',
    name: '/insights/platform/cost-management',
    display_name: 'Cost Management',
    supported_source_types: ['amazon', 'google', 'azure'],
  },
  {
    id: '2',
    name: '/insights/platform/cloud-meter',
    display_name: 'RHEL management',
    supported_source_types: ['openshift'],
  },
];

/** Pulls the wizard field out of the schema. */
const wizardField = (
  types: SourceType[] = sourceTypes,
  selectedType?: SourceTypeName,
) =>
  createIntegrationWizardSchema({
    sourceTypes: types,
    applicationTypes,
    intl,
    selectedType,
  }).fields[0];

/** Pulls the source type step out of the schema. */
const firstStep = (types: SourceType[] = sourceTypes) =>
  wizardField(types).fields[0];

/** Pulls the naming step out of the schema. */
const nameStep = (types: SourceType[] = sourceTypes) =>
  wizardField(types).fields[1];

const authTypeStep = () => wizardField().fields[2];
const credentialsStep = () => wizardField().fields[3];
const appStep = () => wizardField().fields[4];
const reviewStep = () => wizardField().fields[5];
const resultStep = () => wizardField().fields[6];

const stepNames = (): string[] =>
  wizardField().fields.map((step: { name: string }) => step.name);

describe('buildSourceTypeOptions', () => {
  it('lists the offered providers in dropdown order', () => {
    expect(
      buildSourceTypeOptions(sourceTypes, intl).map(({ value }) => value),
    ).toEqual(['openshift', 'amazon', 'google', 'azure']);
  });

  it('labels each provider with its translated name, not the API product name', () => {
    const [openshift] = buildSourceTypeOptions(sourceTypes, intl);

    expect(openshift.label).toBe('OpenShift Container Platform');
    expect(openshift.iconUrl).toBe(
      '/apps/frontend-assets/technology-icons/openshift.svg',
    );
  });

  it('drops catalogue entries this island does not onboard', () => {
    const withExtras = [
      ...sourceTypes,
      { id: '5', name: 'satellite', product_name: 'Red Hat Satellite' },
    ];

    expect(
      buildSourceTypeOptions(withExtras, intl).map(({ value }) => value),
    ).not.toContain('satellite');
  });

  it('omits a provider the API did not return', () => {
    const withoutAzure = sourceTypes.filter(({ name }) => name !== 'azure');

    expect(
      buildSourceTypeOptions(withoutAzure, intl).map(({ value }) => value),
    ).toEqual(['openshift', 'amazon', 'google']);
  });
});

describe('createIntegrationWizardSchema', () => {
  it('declares a single wizard field rendered in a modal', () => {
    const { fields } = createIntegrationWizardSchema({
      sourceTypes,
      applicationTypes,
      intl,
    });

    expect(fields).toHaveLength(1);
    expect(fields[0].component).toBe(componentTypes.WIZARD);
    expect(fields[0].inModal).toBe(true);
  });

  it('points both dialog nodes at the heading the mapper renders', () => {
    const [wizard] = createIntegrationWizardSchema({
      sourceTypes,
      applicationTypes,
      intl,
    }).fields;

    // The mapper hardcodes the modal's aria-labelledby to the field name, so
    // the heading id has to be that same name for the reference to resolve.
    expect(wizard.titleId).toBe(wizard.name);
    expect(wizard['aria-labelledby']).toBe(wizard.name);
  });

  it('invalidates downstream steps when the provider changes', () => {
    const [wizard] = createIntegrationWizardSchema({
      sourceTypes,
      applicationTypes,
      intl,
    }).fields;

    expect(wizard.crossroads).toEqual([SOURCE_TYPE_FIELD]);
  });

  it('translates every button label', () => {
    const [wizard] = createIntegrationWizardSchema({
      sourceTypes,
      applicationTypes,
      intl,
    }).fields;

    expect(wizard.buttonLabels).toEqual({
      submit: 'Add',
      next: 'Next',
      back: 'Back',
      cancel: 'Cancel',
    });
  });

  it('declares the steps in order', () => {
    expect(stepNames()).toEqual([
      WizardStepId.SourceTypeSelection,
      WizardStepId.NameIntegration,
      WizardStepId.AuthTypeSelection,
      WizardStepId.AuthCredentials,
      WizardStepId.ApplicationSelection,
      WizardStepId.Review,
      WizardStepId.SubmissionResult,
    ]);
  });

  it('chains steps: source type -> naming -> credentials -> apps -> review', () => {
    expect(firstStep().nextStep).toBe(WizardStepId.NameIntegration);
    expect(credentialsStep().nextStep).toBe(WizardStepId.ApplicationSelection);
    expect(appStep().nextStep).toBe(WizardStepId.Review);
  });

  /**
   * The crash this guards against: `selectNext` returns `undefined` for a
   * value the mapper has no key for, but `nextStep` itself is still truthy, so
   * the footer still offers Next and navigates to a step that does not exist.
   * Asserting it over the whole schema catches it for providers added later
   * too, which is the only reason this is worth a test of its own.
   */
  it('routes every step to one that exists', () => {
    const names = stepNames();

    for (const step of wizardField().fields) {
      const { nextStep } = step;

      if (typeof nextStep === 'string') {
        expect(names).toContain(nextStep);
      } else if (nextStep) {
        for (const target of Object.values(nextStep.stepMapper)) {
          expect(names).toContain(target);
        }
      }
    }
  });

  it('routes every provider somewhere after naming', () => {
    const { when, stepMapper } = nameStep().nextStep;

    expect(when).toBe(SOURCE_TYPE_FIELD);
    expect(Object.keys(stepMapper).sort()).toEqual(
      sourceTypes.map(({ name }) => name).sort(),
    );
  });

  it('skips the authentication step for AWS, which has only one', () => {
    // One option is not a choice, so AWS goes straight to its credentials.
    expect(nameStep().nextStep.stepMapper.amazon).toBe(
      WizardStepId.AuthCredentials,
    );
    expect(nameStep().nextStep.stepMapper.google).toBe(
      WizardStepId.AuthTypeSelection,
    );
  });

  it('holds unsupported providers on the authentication step', () => {
    // No options plus a required validator is what keeps the primary button
    // disabled, which is what makes the unmapped `nextStep` above unreachable.
    const authField = authTypeStep().fields[1];

    expect(authField.name).toBe(AUTH_TYPE_FIELD);
    expect(authField.options).toEqual([]);
    expect(authField.validate).toEqual([
      {
        type: validatorTypes.REQUIRED,
        message: 'Select an authentication type to continue.',
      },
    ]);
  });

  it('asks for an access key and nothing else', () => {
    const [, authType, accessKeyId, secret] = credentialsStep().fields;

    expect(authType.name).toBe(AUTH_TYPE_FIELD);
    expect(authType.hideField).toBe(true);
    expect(authType.initialValue).toBe(ACCESS_KEY_AUTH_TYPE);
    expect(authType.initializeOnMount).toBe(true);

    expect(accessKeyId.name).toBe(AUTH_USERNAME_FIELD);
    expect(secret.name).toBe(AUTH_PASSWORD_FIELD);
    expect(secret.type).toBe('password');

    // REQUIRED only: a format check that rejects a key AWS accepts is worse
    // than letting the API answer. sources-ui has none either.
    for (const field of [accessKeyId, secret]) {
      expect(field.validate).toHaveLength(1);
      expect(field.validate[0].type).toBe(validatorTypes.REQUIRED);
    }

    // No endpoint or SSL configuration: `amazon.endpoint` is empty in
    // sources-ui, so AWS has nothing to configure there.
    expect(stepNames()).not.toContain(WizardStepId.EndpointConfiguration);
  });

  it('submits from review, into the result step', () => {
    expect(reviewStep().nextStep).toBe(WizardStepId.SubmissionResult);
    // This flag is what turns review's primary button into the submit button.
    expect(resultStep().isProgressAfterSubmissionStep).toBe(true);
    expect(resultStep().nextStep).toBeUndefined();
  });

  it('starts on naming when the provider is already chosen', () => {
    expect(wizardField(sourceTypes, 'amazon').initialState).toEqual({
      activeStep: WizardStepId.NameIntegration,
      activeStepIndex: 1,
      maxStepIndex: 1,
      prevSteps: [WizardStepId.SourceTypeSelection],
    });
  });

  it('starts on the source type step when no provider was chosen', () => {
    expect(wizardField().initialState).toBeUndefined();
  });

  it('starts on the source type step when the chosen provider has no card', () => {
    const withoutAzure = sourceTypes.filter(({ name }) => name !== 'azure');

    // Skipping to naming would strand the user: Back would return to a step
    // with nothing selected, and there is no card to change the answer with.
    expect(wizardField(withoutAzure, 'azure').initialState).toBeUndefined();
  });

  it('requires a name, and describes the provider it is for', () => {
    const [firstDescription] = nameStep().fields;

    expect(firstDescription.condition).toEqual({
      when: SOURCE_TYPE_FIELD,
      is: 'openshift',
    });
    expect(firstDescription.label).toBe(
      'Enter a name for your OpenShift Container Platform integration.',
    );

    const nameField = nameStep().fields[sourceTypes.length];

    expect(nameField.name).toBe(SOURCE_NAME_FIELD);
    expect(nameField.isRequired).toBe(true);
    expect(nameField.validate).toEqual([
      {
        type: validatorTypes.REQUIRED,
        message: 'Enter a name for your integration.',
      },
    ]);
  });

  it('renders the provider choice as a required card select', () => {
    const cardSelect = firstStep().fields[1];

    expect(cardSelect.component).toBe(CARD_SELECT_COMPONENT);
    expect(cardSelect.name).toBe(SOURCE_TYPE_FIELD);
    expect(cardSelect.isRequired).toBe(true);
    expect(cardSelect.validate).toEqual([
      {
        type: validatorTypes.REQUIRED,
        message: 'Select an integration type to continue.',
      },
    ]);
  });

  it('offers a card per provider in the catalogue', () => {
    expect(firstStep().fields[1].options).toHaveLength(sourceTypes.length);
  });
});

describe('toCreateSourceInput', () => {
  it('flattens the form values onto the create payload', () => {
    expect(
      toCreateSourceInput({
        source_type: 'amazon',
        source: { name: 'My AWS integration' },
        authentication: {
          authtype: ACCESS_KEY_AUTH_TYPE,
          username: 'AKIAIOSFODNN7EXAMPLE',
          password: 'secret',
        },
        applications: ['1'],
      }),
    ).toEqual({
      name: 'My AWS integration',
      sourceTypeName: 'amazon',
      authentication: {
        authtype: ACCESS_KEY_AUTH_TYPE,
        username: 'AKIAIOSFODNN7EXAMPLE',
        password: 'secret',
      },
      applicationTypeIds: ['1'],
    });
  });

  it('sends no applications when none were selected', () => {
    expect(
      toCreateSourceInput({
        source_type: 'amazon',
        source: { name: 'My AWS integration' },
      }).applicationTypeIds,
    ).toEqual([]);
  });
});

describe('resolveSelectedType', () => {
  it('keeps a provider the catalogue offers', () => {
    expect(resolveSelectedType(sourceTypes, 'azure')).toBe('azure');
  });

  it('drops a provider the catalogue does not offer', () => {
    const withoutAzure = sourceTypes.filter(({ name }) => name !== 'azure');

    expect(resolveSelectedType(withoutAzure, 'azure')).toBeUndefined();
  });

  it('drops a provider we do not offer cards for at all', () => {
    const withExtra = [
      ...sourceTypes,
      { id: '5', name: 'ansible-tower', product_name: 'Ansible Tower' },
    ] as SourceType[];

    expect(
      resolveSelectedType(withExtra, 'ansible-tower' as SourceTypeName),
    ).toBeUndefined();
  });

  it('resolves to nothing when no provider was given', () => {
    expect(resolveSelectedType(sourceTypes, null)).toBeUndefined();
    expect(resolveSelectedType(sourceTypes)).toBeUndefined();
  });
});

describe('createWizardInitialValues', () => {
  it('pre-selects the provider the wizard was opened with', () => {
    expect(createWizardInitialValues('azure')).toEqual({
      [SOURCE_TYPE_FIELD]: 'azure',
    });
  });

  it('selects nothing when no provider was given', () => {
    expect(createWizardInitialValues(null)).toEqual({});
    expect(createWizardInitialValues()).toEqual({});
  });
});

describe('application selection step', () => {
  it('renders as a required application-checkbox-select', () => {
    const checkboxField = appStep().fields[1];

    expect(checkboxField.component).toBe(APPLICATION_SELECT_COMPONENT);
    expect(checkboxField.name).toBe(APPLICATIONS_FIELD);
    expect(checkboxField.isRequired).toBe(true);
  });

  it('provides an option per application type', () => {
    const checkboxField = appStep().fields[1];

    expect(checkboxField.options).toHaveLength(applicationTypes.length);
    expect(checkboxField.options[0]).toEqual({
      value: '1',
      label: 'Cost Management',
      supportedSourceTypes: ['amazon', 'google', 'azure'],
    });
  });
});

describe('buildApplicationOptions', () => {
  it('maps application types to checkbox options', () => {
    const options = buildApplicationOptions(applicationTypes);

    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({
      value: '1',
      label: 'Cost Management',
      supportedSourceTypes: ['amazon', 'google', 'azure'],
    });
  });

  it('filters out application types not in the offered allowlist', () => {
    const withImageBuilder: ApplicationType[] = [
      ...applicationTypes,
      {
        id: '99',
        name: '/insights/platform/image-builder',
        display_name: 'Image Builder',
        supported_source_types: ['amazon'],
      },
    ];

    const options = buildApplicationOptions(withImageBuilder);

    expect(options).toHaveLength(2);
    expect(options.find((o) => o.label === 'Image Builder')).toBeUndefined();
  });
});

describe('validateArrayNotEmpty', () => {
  it('passes for a non-empty array', () => {
    expect(
      validateArrayNotEmpty(['a'], {}, { message: 'Required' }),
    ).toBeUndefined();
  });

  it('fails for an empty array', () => {
    expect(validateArrayNotEmpty([], {}, { message: 'Required' })).toBe(
      'Required',
    );
  });

  it('fails for undefined', () => {
    expect(validateArrayNotEmpty(undefined, {}, { message: 'Required' })).toBe(
      'Required',
    );
  });

  it('uses a default message when none is provided', () => {
    expect(validateArrayNotEmpty([], {}, {})).toBe('Select at least one item.');
  });
});

describe('review step', () => {
  it('renders the review summary component', () => {
    const [description, summary] = reviewStep().fields;

    expect(description.label).toMatch(/Review the details below/);
    expect(summary.component).toBe(REVIEW_SUMMARY_COMPONENT);
    expect(summary.name).toBe('review-summary');
  });
});
