import { defineMessages } from 'react-intl';

export default defineMessages({
  // "Get started" hero
  heroTitle: {
    id: 'dataIntegrations.about.hero.title',
    description: 'About tab hero heading',
    defaultMessage: 'Get started with Data Integration',
  },
  heroDescription: {
    id: 'dataIntegrations.about.hero.description',
    description: 'About tab hero body copy',
    defaultMessage:
      'Sync data from cloud providers, including OpenShift Container Platform, Microsoft Azure, Amazon Web Services (AWS), and Google Cloud Platform (GCP).',
  },

  // Hero calls to action.
  //
  // PLACEHOLDER COPY — these are the literal strings from the Figma mock, which
  // never got real labels or click targets. RHCLOUD-51526 replaces both.
  heroPrimaryActionPlaceholder: {
    id: 'dataIntegrations.about.hero.primaryActionPlaceholder',
    description:
      'Placeholder label for the primary hero call to action (RHCLOUD-51526)',
    defaultMessage: 'Main getting started action',
  },
  heroSecondaryActionPlaceholder: {
    id: 'dataIntegrations.about.hero.secondaryActionPlaceholder',
    description:
      'Placeholder label for the secondary hero call to action (RHCLOUD-51526)',
    defaultMessage: 'Optional secondary action',
  },

  // Use cases
  useCasesTitle: {
    id: 'dataIntegrations.about.useCases.title',
    description: 'Use cases section heading',
    defaultMessage: 'Use cases',
  },
  addIntegration: {
    id: 'dataIntegrations.about.useCases.addIntegration',
    description: 'Add integration action on a use-case card',
    defaultMessage: 'Add integration',
  },
  addIntegrationForProvider: {
    id: 'dataIntegrations.about.useCases.addIntegrationForProvider',
    description:
      'Accessible name for a use-case card action, naming the provider',
    defaultMessage: 'Add {provider} integration',
  },
  addIntegrationDisabledTooltip: {
    id: 'dataIntegrations.about.useCases.addIntegrationDisabledTooltip',
    description:
      'Tooltip explaining why the add action is disabled for a non-admin',
    defaultMessage:
      'You do not have permission to add data integrations. Contact your organization administrator.',
  },
  // Body copy for the use-case cards, taken from the Figma mock.
  //
  // Note for anyone adjusting the wrapping here: because these sentences
  // interpolate the provider name, a short name like "GCP" wraps to fewer lines
  // than "OpenShift" at some viewport widths. Cards in a row share a height, so
  // at those widths the shorter card shows more space under its text. That is a
  // property of the copy, not of the card padding -- rewording only shifts which
  // widths are affected. See the note on Card in UseCaseCard.tsx.
  useCaseDescription: {
    id: 'dataIntegrations.about.useCases.description',
    description:
      'Body copy on a use-case card, naming the provider it connects',
    defaultMessage:
      'Connect your {provider} account so that you can use your {provider} data with Hybrid Cloud Console services.',
  },
  // OpenShift is a cluster the reader runs, not an account they hold, so the
  // mock words this one differently. Kept as a whole sentence rather than
  // parameterising the noun, which does not translate.
  useCaseDescriptionOpenshift: {
    id: 'dataIntegrations.about.useCases.descriptionOpenshift',
    description: 'Body copy on the OpenShift use-case card',
    defaultMessage:
      'Connect your OpenShift environment so that you can use your OpenShift data with Hybrid Cloud Console services.',
  },
  useCaseLearnMore: {
    id: 'dataIntegrations.about.useCases.learnMore',
    description: 'Inline documentation link at the end of a use-case card',
    defaultMessage: 'Learn more.',
  },
  useCaseLearnMoreLabel: {
    id: 'dataIntegrations.about.useCases.learnMoreLabel',
    description:
      'Accessible name for a use-case card documentation link, naming the provider',
    defaultMessage: 'Learn more about {provider} integrations',
  },

  // Short provider names used inside card copy, where the full legal name
  // ("Red Hat OpenShift Container Platform") reads badly mid-sentence.
  amazonShortName: {
    id: 'dataIntegrations.about.provider.amazonShort',
    description: 'Short form of Amazon Web Services, used in sentence copy',
    defaultMessage: 'AWS',
  },
  azureShortName: {
    id: 'dataIntegrations.about.provider.azureShort',
    description: 'Short form of Microsoft Azure, used in sentence copy',
    defaultMessage: 'Azure',
  },
  googleShortName: {
    id: 'dataIntegrations.about.provider.googleShort',
    description: 'Short form of Google Cloud Platform, used in sentence copy',
    defaultMessage: 'GCP',
  },

  // Card titles. These differ from the island-level provider labels: the cards
  // spell out the acronym, and OpenShift carries the "Red Hat" prefix.
  amazonCardTitle: {
    id: 'dataIntegrations.about.useCases.amazonTitle',
    description: 'Amazon Web Services use-case card title',
    defaultMessage: 'Amazon Web Services (AWS)',
  },
  azureCardTitle: {
    id: 'dataIntegrations.about.useCases.azureTitle',
    description: 'Microsoft Azure use-case card title',
    defaultMessage: 'Microsoft Azure',
  },
  googleCardTitle: {
    id: 'dataIntegrations.about.useCases.googleTitle',
    description: 'Google Cloud Platform use-case card title',
    defaultMessage: 'Google Cloud Platform (GCP)',
  },
  openshiftCardTitle: {
    id: 'dataIntegrations.about.useCases.openshiftTitle',
    description: 'OpenShift use-case card title',
    defaultMessage: 'Red Hat OpenShift Container Platform',
  },

  // Recommended content
  recommendedContentTitle: {
    id: 'dataIntegrations.about.recommended.title',
    description: 'Recommended content section heading',
    defaultMessage: 'Recommended content',
  },
  recommendedContentSubtitle: {
    id: 'dataIntegrations.about.recommended.subtitle',
    description: 'Title of the recommended documentation guide',
    defaultMessage: 'Configuring cloud integrations for Red Hat services',
  },
  recommendedContentBody: {
    id: 'dataIntegrations.about.recommended.body',
    description: 'Summary of the recommended documentation guide',
    defaultMessage:
      'Cloud integrations provide a way for services to collect data outside of the Red Hat Hybrid Cloud Console through either a direct connection to the integration or indirectly.',
  },
  readDocumentation: {
    id: 'dataIntegrations.about.recommended.readDocumentation',
    description: 'Button opening the recommended documentation guide',
    defaultMessage: 'Read documentation',
  },

  // Footer
  viewLearningResources: {
    id: 'dataIntegrations.about.footer.learningResources',
    description: 'Footer link to the Settings learning resources page',
    defaultMessage: 'View all Settings learning resources',
  },
});
