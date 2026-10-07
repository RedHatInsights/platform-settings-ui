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
import { Popover } from '@patternfly/react-core/dist/dynamic/components/Popover';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { EventType } from '../types';
import { useEventTypes } from '../data/queries/useEventTypes';
import { useEventTypeNotifiers } from '../data/queries/useEventTypeEndpoints';
import NotifierBadges from './NotifierBadges';
import messages from '../messages';
import './AlertManagerTable.scss';

const columns = ['eventType', 'service', 'myNotifiers'] as const;
type ColumnKey = (typeof columns)[number];

const AlertManagerTable: React.FC = () => {
  const intl = useIntl();

  // Table state with URL sync
  const tableState = useTableState<typeof columns, EventType, ColumnKey>({
    columns,
    sortableColumns: ['eventType', 'service'],
    initialSort: {
      column: 'eventType',
      direction: 'asc',
    },
    initialPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
    getRowId: (row) => row.id,
    syncWithUrl: true,
  });

  // Build API params from table state
  const apiParams = useMemo(() => {
    const params: {
      limit: number;
      offset: number;
      sortBy?: string;
      eventTypeName?: string;
      applicationIds?: string[];
    } = {
      limit: tableState.perPage,
      offset: (tableState.page - 1) * tableState.perPage,
    };

    // Add sorting
    if (tableState.sort) {
      const direction = tableState.sort.direction === 'asc' ? 'ASC' : 'DESC';
      const column =
        tableState.sort.column === 'eventType' ? 'display_name' : 'application';
      params.sortBy = `${column}:${direction}`;
    }

    // Add filters
    if (tableState.filters.eventType) {
      params.eventTypeName = tableState.filters.eventType as string;
    }

    return params;
  }, [
    tableState.perPage,
    tableState.page,
    tableState.sort,
    tableState.filters,
  ]);

  // Fetch data
  const { data, isLoading, error } = useEventTypes(apiParams);

  // Extract event type IDs for notifier fetching
  const eventTypeIds = useMemo(
    () => (data?.data ?? []).map((et) => et.id),
    [data?.data],
  );

  // Fetch notifiers for visible event types
  const { notifiersMap } = useEventTypeNotifiers(eventTypeIds);

  // Column configuration
  const columnConfig: ColumnConfigMap<typeof columns> = {
    eventType: {
      label: intl.formatMessage(messages.eventTypeColumn),
      sortable: true,
    },
    service: {
      label: intl.formatMessage(messages.serviceColumn),
      sortable: true,
    },
    myNotifiers: {
      label: (
        <>
          {intl.formatMessage(messages.myNotifiersColumn)}{' '}
          <Popover
            bodyContent={intl.formatMessage(messages.myNotifiersTooltip)}
          >
            <Button
              variant="plain"
              aria-label={intl.formatMessage(messages.myNotifiersTooltip)}
              style={{ padding: 0 }}
            >
              <OutlinedQuestionCircleIcon />
            </Button>
          </Popover>
        </>
      ) as unknown as string,
    },
  };

  // Cell renderers
  const cellRenderers: CellRendererMap<typeof columns, EventType> = {
    eventType: (row) => row.display_name,
    service: (row) => row.application.display_name,
    myNotifiers: (row) => (
      <NotifierBadges notifiers={notifiersMap.get(row.id) ?? []} />
    ),
  };

  // Filter configuration
  const filterConfig: FilterConfig[] = [
    {
      type: 'text',
      id: 'eventType',
      label: intl.formatMessage(messages.filterByEventType),
      placeholder: intl.formatMessage(messages.filterByEventType),
    },
  ];

  // Empty states
  const emptyStateNoData = (
    <DefaultEmptyStateNoData
      title={intl.formatMessage(messages.noEventTypes)}
      body={intl.formatMessage(messages.noEventTypesDescription)}
    />
  );

  const emptyStateNoResults = (
    <DefaultEmptyStateNoResults
      title={intl.formatMessage(messages.noMatchingEventTypes)}
      body={intl.formatMessage(messages.noMatchingEventTypesDescription)}
      onClearFilters={tableState.clearAllFilters}
      clearFiltersText={intl.formatMessage(messages.clearFilters)}
    />
  );

  const emptyStateError = (
    <DefaultEmptyStateError
      title={intl.formatMessage(messages.errorLoadingEventTypes)}
      body={intl.formatMessage(messages.errorLoadingEventTypesDescription)}
    />
  );

  return (
    <TableView
      columns={columns}
      columnConfig={columnConfig}
      sortableColumns={['eventType', 'service']}
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
      error={error as Error | null}
      emptyStateNoData={emptyStateNoData}
      emptyStateNoResults={emptyStateNoResults}
      emptyStateError={emptyStateError}
      ariaLabel={intl.formatMessage(messages.tableAriaLabel)}
      variant="compact"
      ouiaId="alert-manager-table"
    />
  );
};

export default AlertManagerTable;
