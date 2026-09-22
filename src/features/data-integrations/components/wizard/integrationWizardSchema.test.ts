import type { IntlShape, MessageDescriptor } from 'react-intl';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  CARD_SELECT_COMPONENT,
  SOURCE_TYPE_FIELD,
  WizardStepId,
  buildSourceTypeOptions,
  createIntegrationWizardSchema,
  createWizardInitialValues,
} from './integrationWizardSchema';
import type { SourceType } from '../../data/types/sources.types';

/**
 * A stub rather than a real `createIntl`: react-intl and its @formatjs
 * dependencies are ESM-only and this repo has no Babel config for Jest to
 * transpile them with. The factory only ever calls `formatMessage`, and these
 * assertions are about schema shape, so resolving each descriptor to its
 * `defaultMessage` is enough — and keeps the expected strings readable.
 */
const intl = {
  formatMessage: (descriptor: MessageDescriptor) =>
    String(descriptor.defaultMessage),
} as unknown as IntlShape;

const sourceTypes: SourceType[] = [
  { id: '1', name: 'openshift', product_name: 'OpenShift Container Platform' },
  { id: '2', name: 'amazon', product_name: 'Amazon Web Services' },
  { id: '3', name: 'google', product_name: 'Google Cloud Platform' },
  { id: '4', name: 'azure', product_name: 'Microsoft Azure' },
];

/** Pulls the wizard's single step out of the schema. */
const firstStep = (types: SourceType[] = sourceTypes) => {
  const [wizard] = createIntegrationWizardSchema({
    sourceTypes: types,
    intl,
  }).fields;

  return wizard.fields[0];
};

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
    const { fields } = createIntegrationWizardSchema({ sourceTypes, intl });

    expect(fields).toHaveLength(1);
    expect(fields[0].component).toBe(componentTypes.WIZARD);
    expect(fields[0].inModal).toBe(true);
  });

  it('points both dialog nodes at the heading the mapper renders', () => {
    const [wizard] = createIntegrationWizardSchema({
      sourceTypes,
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
      intl,
    }).fields;

    expect(wizard.crossroads).toEqual([SOURCE_TYPE_FIELD]);
  });

  it('translates every button label', () => {
    const [wizard] = createIntegrationWizardSchema({
      sourceTypes,
      intl,
    }).fields;

    expect(wizard.buttonLabels).toEqual({
      submit: 'Next',
      next: 'Next',
      back: 'Back',
      cancel: 'Cancel',
    });
  });

  it('implements only the source type step', () => {
    const [wizard] = createIntegrationWizardSchema({
      sourceTypes,
      intl,
    }).fields;

    expect(wizard.fields).toHaveLength(1);
    expect(wizard.fields[0].name).toBe(WizardStepId.SourceTypeSelection);
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
