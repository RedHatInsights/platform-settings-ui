import { defineMessages } from 'react-intl';

export default defineMessages({
  // Table columns
  nameColumn: {
    id: 'dataIntegrations.sourcesTable.columns.name',
    description: 'Name column header',
    defaultMessage: 'Name',
  },
  typeColumn: {
    id: 'dataIntegrations.sourcesTable.columns.type',
    description: 'Type column header',
    defaultMessage: 'Type',
  },
  connectedApplicationsColumn: {
    id: 'dataIntegrations.sourcesTable.columns.connectedApplications',
    description: 'Connected applications column header',
    defaultMessage: 'Connected applications',
  },
  dateAddedColumn: {
    id: 'dataIntegrations.sourcesTable.columns.dateAdded',
    description: 'Date added column header',
    defaultMessage: 'Date added',
  },
  statusColumn: {
    id: 'dataIntegrations.sourcesTable.columns.status',
    description: 'Status column header',
    defaultMessage: 'Status',
  },

  // Status values live in the island-level messages file, shared with the
  // source detail page via SourceStatusLabel.

  // Empty states
  noApplications: {
    id: 'dataIntegrations.sourcesTable.connectedApplications.none',
    description: 'Text shown when a source has no connected applications',
    defaultMessage: 'None',
  },

  // Toolbar
  findByNamePlaceholder: {
    id: 'dataIntegrations.sourcesTable.toolbar.findByName',
    description: 'Find by name search input placeholder',
    defaultMessage: 'Find by name',
  },
  filterLabel: {
    id: 'dataIntegrations.sourcesTable.toolbar.filter',
    description: 'Filter dropdown label',
    defaultMessage: 'Filter',
  },
  addIntegrationLabel: {
    id: 'dataIntegrations.sourcesTable.toolbar.addIntegration',
    description: 'Add integration button label',
    defaultMessage: 'Add integration',
  },

  // Filter chips
  filterAppliedCount: {
    id: 'dataIntegrations.sourcesTable.filters.appliedCount',
    description:
      'Number of filters applied (shown as "{count} filters applied")',
    defaultMessage:
      '{count, plural, one {# filter applied} other {# filters applied}}',
  },
  clearAllFilters: {
    id: 'dataIntegrations.sourcesTable.filters.clearAll',
    description: 'Clear all filters button label',
    defaultMessage: 'Clear all',
  },
  integrationTypeFilterLabel: {
    id: 'dataIntegrations.sourcesTable.filters.integrationType',
    description: 'Integration type filter chip label prefix',
    defaultMessage: 'Integration type',
  },

  // Empty state
  emptyStateTitle: {
    id: 'dataIntegrations.sourcesTable.emptyState.title',
    description: 'Empty state title when no sources exist',
    defaultMessage: 'No data integrations',
  },
  emptyStateBody: {
    id: 'dataIntegrations.sourcesTable.emptyState.body',
    description: 'Empty state body when no sources exist',
    defaultMessage:
      'Get started by adding your first data integration or learn more on the About tab.',
  },

  // Filtered empty state
  filteredEmptyStateTitle: {
    id: 'dataIntegrations.sourcesTable.filteredEmptyState.title',
    description: 'Empty state title when filters return no results',
    defaultMessage: 'No results found',
  },
  filteredEmptyStateBody: {
    id: 'dataIntegrations.sourcesTable.filteredEmptyState.body',
    description: 'Empty state body when filters return no results',
    defaultMessage:
      'No data integrations match the current filters. Try adjusting your filters.',
  },
});
