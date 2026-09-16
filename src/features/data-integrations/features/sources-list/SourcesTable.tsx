import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  type CellRendererMap,
  type ColumnConfigMap,
  DefaultEmptyStateError,
  DefaultEmptyStateNoData,
  DefaultEmptyStateNoResults,
  type FilterConfig,
  TableView,
  useTableState,
} from '@redhat-cloud-services/frontend-components/TableView';
import { useSources } from '../../data/queries/useSources';
import { useSourceTypes } from '../../data/queries/useSourceTypes';
import { useApplicationTypes } from '../../data/queries/useApplicationTypes';
import type { Source } from '../../data/types/sources.types';
import type { SourceTypeName } from '../../types';
import { AppLink } from '../../../../Components/AppLink';
import ConnectedApplicationsCell from './components/ConnectedApplicationsCell';
import DateAddedCell from './components/DateAddedCell';
import StatusCell from './components/StatusCell';
import messages from './messages';
import pageMessages from '../../messages';

const columns = [
  'name',
  'type',
  'connectedApplications',
  'dateAdded',
  'status',
] as const;
type ColumnKey = (typeof columns)[number];

const SourcesTable: React.FC = () => {
  const intl = useIntl();

  // Table state with URL sync
  const tableState = useTableState<typeof columns, Source, ColumnKey>({
    columns,
    sortableColumns: ['dateAdded', 'type'],
    initialSort: {
      column: 'dateAdded',
      direction: 'desc',
    },
    initialPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
    getRowId: (row) => row.id,
    syncWithUrl: true,
  });

  // Fetch catalogues
  const { data: sourceTypes, error: sourceTypesError } = useSourceTypes();
  const { data: applicationTypes, error: applicationTypesError } =
    useApplicationTypes();

  // Build API params from table state
  const apiParams = useMemo(() => {
    const params: {
      limit: number;
      offset: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
      nameContains?: string;
      sourceTypeIds?: string[];
    } = {
      limit: tableState.perPage,
      offset: (tableState.page - 1) * tableState.perPage,
    };

    // Add sorting
    if (tableState.sort) {
      if (tableState.sort.column === 'dateAdded') {
        params.sortBy = 'created_at';
      } else if (tableState.sort.column === 'type') {
        params.sortBy = 'source_type.product_name';
      }
      params.sortDirection = tableState.sort.direction;
    }

    // Add name search filter
    if (tableState.filters.name) {
      params.nameContains = tableState.filters.name as string;
    }

    // Add integration type filter
    if (tableState.filters.integrationType) {
      const typeFilter = tableState.filters.integrationType;
      params.sourceTypeIds = Array.isArray(typeFilter)
        ? (typeFilter as string[])
        : [typeFilter as string];
    }

    return params;
  }, [
    tableState.perPage,
    tableState.page,
    tableState.sort,
    tableState.filters,
  ]);

  // Fetch data
  const { data, isLoading, error } = useSources(apiParams);

  // Column configuration
  const columnConfig: ColumnConfigMap<typeof columns> = {
    name: {
      label: intl.formatMessage(messages.nameColumn),
      sortable: false,
    },
    type: {
      label: intl.formatMessage(messages.typeColumn),
      sortable: true,
    },
    connectedApplications: {
      label: intl.formatMessage(messages.connectedApplicationsColumn),
      sortable: false,
    },
    dateAdded: {
      label: intl.formatMessage(messages.dateAddedColumn),
      sortable: true,
    },
    status: {
      label: intl.formatMessage(messages.statusColumn),
      sortable: false,
    },
  };

  // Cell renderers
  const cellRenderers: CellRendererMap<typeof columns, Source> = {
    name: (row) => (
      <AppLink to={`/data-integrations/${row.id}`}>{row.name}</AppLink>
    ),
    type: (row) => {
      const sourceType = sourceTypes?.find(
        (type) => type.id === row.source_type_id,
      );
      return <span>{sourceType?.product_name ?? row.source_type_id}</span>;
    },
    connectedApplications: (row) => (
      <ConnectedApplicationsCell
        applications={row.applications}
        applicationTypes={applicationTypes}
      />
    ),
    dateAdded: (row) => <DateAddedCell createdAt={row.created_at} />,
    status: (row) => (
      <StatusCell status={row.availability_status} pausedAt={row.paused_at} />
    ),
  };

  // Filter configuration
  const supportedTypes: SourceTypeName[] = [
    'amazon',
    'azure',
    'google',
    'openshift',
  ];

  const filterConfig: FilterConfig[] = [
    {
      type: 'text',
      id: 'name',
      label: intl.formatMessage(messages.findByNamePlaceholder),
      placeholder: intl.formatMessage(messages.findByNamePlaceholder),
    },
    {
      type: 'checkbox',
      id: 'integrationType',
      label: intl.formatMessage(messages.integrationTypeFilterLabel),
      options:
        sourceTypes
          ?.filter((sourceType) =>
            supportedTypes.includes(sourceType.name as SourceTypeName),
          )
          .map((sourceType) => ({
            id: sourceType.id,
            label: sourceType.product_name ?? sourceType.name,
          })) ?? [],
    },
  ];

  // Empty states
  const emptyStateNoData = (
    <DefaultEmptyStateNoData
      title={intl.formatMessage(messages.emptyStateTitle)}
      body={intl.formatMessage(messages.emptyStateBody)}
    />
  );

  const emptyStateNoResults = (
    <DefaultEmptyStateNoResults
      title={intl.formatMessage(messages.filteredEmptyStateTitle)}
      body={intl.formatMessage(messages.filteredEmptyStateBody)}
      onClearFilters={tableState.clearAllFilters}
      clearFiltersText={intl.formatMessage(messages.clearAllFilters)}
    />
  );

  const emptyStateError = <DefaultEmptyStateError />;

  // Combine errors from all queries
  const combinedError =
    error || sourceTypesError || applicationTypesError || null;

  return (
    <TableView
      ariaLabel={intl.formatMessage(pageMessages.myDataIntegrationsTab)}
      columns={columns}
      columnConfig={columnConfig}
      sortableColumns={['dateAdded', 'type']}
      data={isLoading ? undefined : data?.data}
      totalCount={data?.meta.count}
      getRowId={(row) => row.id}
      cellRenderers={cellRenderers}
      sort={tableState.sort}
      onSortChange={tableState.onSortChange}
      page={tableState.page}
      perPage={tableState.perPage}
      perPageOptions={tableState.perPageOptions}
      onPageChange={tableState.onPageChange}
      onPerPageChange={tableState.onPerPageChange}
      filterConfig={filterConfig}
      filters={tableState.filters}
      onFiltersChange={tableState.onFiltersChange}
      clearAllFilters={tableState.clearAllFilters}
      error={combinedError as Error | null}
      emptyStateNoData={emptyStateNoData}
      emptyStateNoResults={emptyStateNoResults}
      emptyStateError={emptyStateError}
    />
  );
};

export default SourcesTable;
