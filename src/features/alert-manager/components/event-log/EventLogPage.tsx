import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { MenuToggle } from '@patternfly/react-core/dist/dynamic/components/MenuToggle';
import { PageSection } from '@patternfly/react-core/dist/dynamic/components/Page';
import {
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core/dist/dynamic/components/Select';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import { NotAuthorized } from '@redhat-cloud-services/frontend-components/NotAuthorized';
import { useAppServices } from '../../../../shared/ServiceContext';
import EventLogTable from './EventLogTable';
import messages from './messages';

type DatePreset = 'today' | 'yesterday' | 'last7' | 'last14';

function getDateRange(preset: DatePreset): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const start = new Date(now);
  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last7':
      start.setDate(start.getDate() - 7);
      break;
    case 'last14':
      start.setDate(start.getDate() - 14);
      break;
  }

  return {
    startDate: start.toISOString().replace(/\.\d{3}Z$/, ''),
    endDate: now.toISOString().replace(/\.\d{3}Z$/, ''),
  };
}

const EventLogPage: React.FC = () => {
  const intl = useIntl();
  const { isOrgAdmin } = useAppServices();
  const [datePreset, setDatePreset] = useState<DatePreset>('last14');
  const [dateSelectOpen, setDateSelectOpen] = useState(false);
  const { startDate, endDate } = useMemo(
    () => getDateRange(datePreset),
    [datePreset],
  );

  if (!isOrgAdmin) {
    return (
      <NotAuthorized
        serviceName="Event Log"
        toLandingPageUrl="/settings/overview"
      />
    );
  }

  const datePresetLabels: Record<DatePreset, string> = {
    today: intl.formatMessage(messages.dateToday),
    yesterday: intl.formatMessage(messages.dateYesterday),
    last7: intl.formatMessage(messages.dateLast7),
    last14: intl.formatMessage(messages.dateLast14),
  };

  const toolbarActions = (
    <Select
      isOpen={dateSelectOpen}
      onOpenChange={setDateSelectOpen}
      onSelect={(_event, value) => {
        setDatePreset(value as DatePreset);
        setDateSelectOpen(false);
      }}
      selected={datePreset}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setDateSelectOpen(!dateSelectOpen)}
          isExpanded={dateSelectOpen}
        >
          {datePresetLabels[datePreset]}
        </MenuToggle>
      )}
    >
      <SelectList>
        {Object.entries(datePresetLabels).map(([value, label]) => (
          <SelectOption key={value} value={value}>
            {label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );

  return (
    <>
      <PageHeader
        title={intl.formatMessage(messages.pageTitle)}
        subtitle={intl.formatMessage(messages.pageSubtitle)}
        icon={
          <img
            src="/apps/frontend-assets/technology-icons/notifications.svg"
            alt=""
            width={48}
            height={48}
          />
        }
      />
      <PageSection>
        <EventLogTable
          startDate={startDate}
          endDate={endDate}
          isOrgAdmin={isOrgAdmin}
          toolbarActions={toolbarActions}
        />
      </PageSection>
    </>
  );
};

export default EventLogPage;
