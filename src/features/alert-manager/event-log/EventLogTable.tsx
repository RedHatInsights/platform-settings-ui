import React from 'react';
import type { IntlShape, MessageDescriptor } from 'react-intl';
import { useIntl } from 'react-intl';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core/dist/dynamic/components/Dropdown';
import {
  Label,
  LabelGroup,
} from '@patternfly/react-core/dist/dynamic/components/Label';
import { MenuToggle } from '@patternfly/react-core/dist/dynamic/components/MenuToggle';
import { Popover } from '@patternfly/react-core/dist/dynamic/components/Popover';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import EllipsisVIcon from '@patternfly/react-icons/dist/js/icons/ellipsis-v-icon';
import EnvelopeIcon from '@patternfly/react-icons/dist/js/icons/envelope-icon';
import LinkIcon from '@patternfly/react-icons/dist/js/icons/link-icon';
import OpenDrawerRightIcon from '@patternfly/react-icons/dist/js/icons/open-drawer-right-icon';
import SeverityCriticalIcon from '@patternfly/react-icons/dist/js/icons/severity-critical-icon';
import SeverityImportantIcon from '@patternfly/react-icons/dist/js/icons/severity-important-icon';
import SeverityMinorIcon from '@patternfly/react-icons/dist/js/icons/severity-minor-icon';
import SeverityModerateIcon from '@patternfly/react-icons/dist/js/icons/severity-moderate-icon';
import SeverityNoneIcon from '@patternfly/react-icons/dist/js/icons/severity-none-icon';
import SeverityUndefinedIcon from '@patternfly/react-icons/dist/js/icons/severity-undefined-icon';
import {
  TableView,
  useTableState,
} from '@redhat-cloud-services/frontend-components/TableView';
import { DefaultEmptyStateNoResults } from '@redhat-cloud-services/frontend-components/TableView/components/TableViewEmptyState';
import type {
  CellRendererMap,
  ColumnConfigMap,
  FilterConfig,
} from '@redhat-cloud-services/frontend-components/TableView';
import { useBundleFacets } from '../data/queries/bundles';
import { useEvents } from '../data/queries/events';
import type {
  EndpointType,
  EventLogEntry,
  EventLogEntryAction,
  Severity,
} from '../data/types/events.types';
import messages from './messages';

const COLUMNS = [
  'event_type',
  'service',
  'severity',
  'created',
  'notifiers',
] as const;

const SORTABLE_COLUMNS = ['created'] as const;

function buildColumnConfig(intl: IntlShape): ColumnConfigMap<typeof COLUMNS> {
  return {
    event_type: {
      label: intl.formatMessage(messages.columnEventType),
    },
    service: { label: intl.formatMessage(messages.columnService) },
    severity: { label: intl.formatMessage(messages.columnSeverity) },
    created: {
      label: intl.formatMessage(messages.columnDateTimeFired),
      sortable: true,
      format: 'date',
    },
    notifiers: { label: intl.formatMessage(messages.columnNotifiers) },
  };
}

function severityFilterLabel(icon: React.ReactNode, text: string): string {
  // DataViewFilterOption.label accepts ReactNode at runtime;
  // TableView types narrow it to string — cast is safe.
  return (
    <span>
      {icon} {text}
    </span>
  ) as unknown as string;
}

function buildFilterConfig(
  intl: IntlShape,
  bundleOptions: Array<{ id: string; label: string }>,
): FilterConfig[] {
  return [
    {
      type: 'text',
      id: 'event',
      label: intl.formatMessage(messages.filterEvent),
      placeholder: intl.formatMessage(messages.filterEventPlaceholder),
    },
    {
      type: 'checkbox',
      id: 'service',
      label: intl.formatMessage(messages.filterService),
      placeholder: intl.formatMessage(messages.filterServicePlaceholder),
      options: bundleOptions,
    },
    {
      type: 'checkbox',
      id: 'severities',
      label: intl.formatMessage(messages.filterSeverity),
      options: [
        {
          id: 'CRITICAL',
          label: severityFilterLabel(
            <SeverityCriticalIcon
              style={{
                color: 'var(--pf-t--global--color--severity--critical--100)',
              }}
            />,
            intl.formatMessage(messages.severityCritical),
          ),
        },
        {
          id: 'IMPORTANT',
          label: severityFilterLabel(
            <SeverityImportantIcon
              style={{
                color: 'var(--pf-t--global--color--severity--important--100)',
              }}
            />,
            intl.formatMessage(messages.severityImportant),
          ),
        },
        {
          id: 'MODERATE',
          label: severityFilterLabel(
            <SeverityModerateIcon
              style={{
                color: 'var(--pf-t--global--color--severity--moderate--100)',
              }}
            />,
            intl.formatMessage(messages.severityModerate),
          ),
        },
        {
          id: 'LOW',
          label: severityFilterLabel(
            <SeverityMinorIcon
              style={{
                color: 'var(--pf-t--global--color--severity--minor--100)',
              }}
            />,
            intl.formatMessage(messages.severityLow),
          ),
        },
        {
          id: 'NONE',
          label: severityFilterLabel(
            <SeverityNoneIcon
              style={{
                color: 'var(--pf-t--global--color--severity--none--100)',
              }}
            />,
            intl.formatMessage(messages.severityNone),
          ),
        },
      ],
    },
  ];
}

const severityLabelStyles: Record<string, React.CSSProperties> = {
  CRITICAL: {
    '--pf-v6-c-label--BackgroundColor':
      'var(--pf-t--global--color--severity--critical--100)',
    '--pf-v6-c-label--Color': 'var(--pf-t--color--white)',
    '--pf-v6-c-label__icon--Color': 'var(--pf-t--color--white)',
  } as React.CSSProperties,
  IMPORTANT: {
    '--pf-v6-c-label--BackgroundColor':
      'var(--pf-t--global--color--severity--important--100)',
    '--pf-v6-c-label--Color': 'var(--pf-t--color--white)',
    '--pf-v6-c-label__icon--Color': 'var(--pf-t--color--white)',
  } as React.CSSProperties,
  MODERATE: {
    '--pf-v6-c-label--BackgroundColor':
      'var(--pf-t--global--color--severity--moderate--100)',
    '--pf-v6-c-label--Color': 'var(--pf-t--color--black)',
    '--pf-v6-c-label__icon--Color': 'var(--pf-t--color--black)',
  } as React.CSSProperties,
  LOW: {
    '--pf-v6-c-label--BackgroundColor':
      'var(--pf-t--global--color--severity--minor--100)',
    '--pf-v6-c-label--Color': 'var(--pf-t--color--black)',
    '--pf-v6-c-label__icon--Color': 'var(--pf-t--color--black)',
  } as React.CSSProperties,
  NONE: {
    '--pf-v6-c-label--BackgroundColor':
      'var(--pf-t--global--color--severity--none--100)',
    '--pf-v6-c-label--Color': 'var(--pf-t--color--white)',
    '--pf-v6-c-label__icon--Color': 'var(--pf-t--color--white)',
  } as React.CSSProperties,
};

const severityIcons: Record<string, React.ReactNode> = {
  CRITICAL: <SeverityCriticalIcon />,
  IMPORTANT: <SeverityImportantIcon />,
  MODERATE: <SeverityModerateIcon />,
  LOW: <SeverityMinorIcon />,
  NONE: <SeverityNoneIcon />,
};

function renderSeverityLabel(
  intl: IntlShape,
  severity?: Severity,
): React.ReactNode {
  if (!severity || severity === 'UNDEFINED') {
    return (
      <Label color="grey" variant="outline" icon={<SeverityUndefinedIcon />}>
        {intl.formatMessage(messages.severityUndefined)}
      </Label>
    );
  }

  const displayNames: Record<string, MessageDescriptor> = {
    CRITICAL: messages.severityCritical,
    IMPORTANT: messages.severityImportant,
    MODERATE: messages.severityModerate,
    LOW: messages.severityLow,
    NONE: messages.severityNone,
  };

  return (
    <Label style={severityLabelStyles[severity]} icon={severityIcons[severity]}>
      {intl.formatMessage(displayNames[severity] ?? messages.severityUndefined)}
    </Label>
  );
}

function getNotifierIcon(
  type: EndpointType,
  subType?: string,
): React.ReactNode {
  if (type === 'camel' && subType) {
    const iconMap: Record<string, string> = {
      slack: '/apps/frontend-assets/partners-icons/slack.svg',
      google_chat: '/apps/frontend-assets/partners-icons/google-chat.svg',
      teams: '/apps/frontend-assets/partners-icons/microsoft-office-teams.svg',
    };
    const src = iconMap[subType];
    if (src) {
      return <img src={src} alt={subType} width={14} height={14} />;
    }
  }

  const iconMap: Partial<Record<EndpointType, React.ReactNode>> = {
    email_subscription: <EnvelopeIcon />,
    drawer: <OpenDrawerRightIcon />,
    webhook: <LinkIcon />,
    ansible: <LinkIcon />,
    pagerduty: <LinkIcon />,
    camel: <LinkIcon />,
  };
  return iconMap[type] ?? <LinkIcon />;
}

function getNotifierTooltip(
  intl: IntlShape,
  type: EndpointType,
  subType?: string,
): string {
  if (type === 'camel' && subType) {
    const subTypeNames: Record<string, string> = {
      slack: 'Slack',
      google_chat: 'Google Chat',
      teams: 'Microsoft Teams',
      servicenow: 'ServiceNow',
      splunk: 'Splunk',
    };
    return (
      subTypeNames[subType] ?? intl.formatMessage(messages.endpointIntegration)
    );
  }

  const labelMessages: Record<EndpointType, MessageDescriptor> = {
    email_subscription: messages.endpointEmail,
    drawer: messages.endpointDrawer,
    webhook: messages.endpointWebhook,
    ansible: messages.endpointAnsible,
    pagerduty: messages.endpointPagerDuty,
    camel: messages.endpointIntegration,
  };
  return intl.formatMessage(labelMessages[type]);
}

function titleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface GroupedNotifier {
  type: EndpointType;
  subType?: string;
  count: number;
}

function groupActions(actions: EventLogEntryAction[]): GroupedNotifier[] {
  const map = new Map<string, GroupedNotifier>();
  for (const action of actions) {
    const key =
      action.endpoint_type === 'camel' && action.endpoint_sub_type
        ? `${action.endpoint_type}:${action.endpoint_sub_type}`
        : action.endpoint_type;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        type: action.endpoint_type,
        subType: action.endpoint_sub_type,
        count: 1,
      });
    }
  }
  return Array.from(map.values());
}

function renderNotifiers(
  intl: IntlShape,
  actions: EventLogEntryAction[],
): React.ReactNode {
  if (actions.length === 0) {
    return intl.formatMessage(messages.noNotifiers);
  }

  const groups = groupActions(actions);

  return (
    <LabelGroup>
      {groups.map((g) => {
        const key = g.subType ? `${g.type}:${g.subType}` : g.type;
        return (
          <Tooltip
            key={key}
            content={getNotifierTooltip(intl, g.type, g.subType)}
          >
            <Label color="grey" icon={getNotifierIcon(g.type, g.subType)}>
              {g.count}
            </Label>
          </Tooltip>
        );
      })}
    </LabelGroup>
  );
}

function toSortBy(orderBy: string | undefined): string | undefined {
  if (!orderBy) {
    return undefined;
  }

  if (orderBy.startsWith('-')) {
    return `${orderBy.slice(1)}:desc`;
  }

  return `${orderBy}:asc`;
}

interface EventLogTableProps {
  startDate?: string;
  endDate?: string;
  isOrgAdmin: boolean;
  toolbarActions?: React.ReactNode;
}

const EventLogTable: React.FC<EventLogTableProps> = ({
  startDate,
  endDate,
  isOrgAdmin,
  toolbarActions,
}) => {
  const intl = useIntl();
  const { data: bundles } = useBundleFacets();

  const bundleOptions = React.useMemo(
    () =>
      (bundles ?? []).map((b) => ({
        id: b.id,
        label: b.displayName,
      })),
    [bundles],
  );

  const columnConfig = React.useMemo(() => buildColumnConfig(intl), [intl]);
  const filterConf = React.useMemo(
    () => buildFilterConfig(intl, bundleOptions),
    [intl, bundleOptions],
  );

  const tableState = useTableState<typeof COLUMNS, EventLogEntry, 'created'>({
    columns: COLUMNS,
    sortableColumns: SORTABLE_COLUMNS,
    initialSort: { column: 'created', direction: 'desc' },
    initialPerPage: 20,
    initialFilters: { service: [] },
    getRowId: (row) => row.id,
    syncWithUrl: true,
  });

  const { apiParams } = tableState;

  const { data, error } = useEvents({
    limit: apiParams.limit,
    offset: apiParams.offset,
    sortBy: toSortBy(apiParams.orderBy),
    eventTypeDisplayName: (apiParams.filters?.event as string) || undefined,
    bundleIds: (apiParams.filters?.service as string[] | undefined)?.length
      ? (apiParams.filters.service as string[])
      : undefined,
    severities: apiParams.filters?.severities as Severity[] | undefined,
    startDate,
    endDate,
    includeActions: true,
  });

  const cellRenderers: CellRendererMap<typeof COLUMNS, EventLogEntry> = {
    event_type: (row) => row.event_type,
    service: (row) =>
      `${titleCase(row.application)} | ${titleCase(row.bundle)}`,
    severity: (row) => renderSeverityLabel(intl, row.severity),
    created: (row) => row.created,
    notifiers: (row) => renderNotifiers(intl, row.actions),
  };

  const renderActions = React.useCallback(
    (row: EventLogEntry) => <RowActions isOrgAdmin={isOrgAdmin} row={row} />,
    [isOrgAdmin],
  );

  return (
    <TableView
      columns={COLUMNS}
      columnConfig={columnConfig}
      sortableColumns={SORTABLE_COLUMNS}
      data={data?.data}
      totalCount={data?.meta.count}
      getRowId={(row) => row.id}
      cellRenderers={cellRenderers}
      sort={tableState.sort}
      onSortChange={tableState.onSortChange}
      page={tableState.page}
      perPage={tableState.perPage}
      onPageChange={tableState.onPageChange}
      onPerPageChange={tableState.onPerPageChange}
      filterConfig={filterConf}
      filters={tableState.filters}
      onFiltersChange={tableState.onFiltersChange}
      clearAllFilters={tableState.clearAllFilters}
      renderActions={renderActions}
      toolbarActions={toolbarActions}
      error={error}
      emptyStateNoResults={
        <DefaultEmptyStateNoResults
          title={intl.formatMessage(messages.emptyStateNoResultsTitle)}
          body={intl.formatMessage(messages.emptyStateNoResultsBody)}
          onClearFilters={tableState.clearAllFilters}
        />
      }
      ariaLabel={intl.formatMessage(messages.tableAriaLabel)}
    />
  );
};

const RowActions: React.FC<{
  isOrgAdmin: boolean;
  row: EventLogEntry;
}> = ({ isOrgAdmin }) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={setIsOpen}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          variant="plain"
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
          aria-label={intl.formatMessage(messages.rowActionsLabel)}
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        {isOrgAdmin ? (
          <DropdownItem key="org-settings">
            {intl.formatMessage(messages.rowActionOrgSettings)}
          </DropdownItem>
        ) : (
          <Popover
            bodyContent={intl.formatMessage(messages.orgAdminRequired)}
            triggerAction="hover"
          >
            <DropdownItem key="org-settings" isDisabled>
              {intl.formatMessage(messages.rowActionOrgSettings)}
            </DropdownItem>
          </Popover>
        )}
        <DropdownItem key="preferences">
          {intl.formatMessage(messages.rowActionPreferences)}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default EventLogTable;
