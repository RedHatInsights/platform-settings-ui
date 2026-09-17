import React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import {
  Flex,
  FlexItem,
} from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { FormattedRelativeTime, useIntl } from 'react-intl';
import messages from '../messages';
import type { Source } from '../../../data/types/sources.types';

interface SourceMetadataProps {
  source: Source;
}

/**
 * Calculates the relative time units for FormattedRelativeTime.
 * Returns value and unit (second, minute, hour, day) for the best granularity.
 */
function getRelativeTime(dateString?: string): {
  value: number;
  unit: 'second' | 'minute' | 'hour' | 'day';
} {
  if (!dateString) {
    return { value: 0, unit: 'second' };
  }

  const diff = new Date(dateString).getTime() - Date.now();
  const absDiff = Math.abs(diff);

  // Select unit based on absolute millisecond thresholds before rounding
  if (absDiff >= 86400000) {
    // 24 hours in milliseconds
    return { value: Math.round(diff / 86400000), unit: 'day' };
  }
  if (absDiff >= 3600000) {
    // 1 hour in milliseconds
    return { value: Math.round(diff / 3600000), unit: 'hour' };
  }
  if (absDiff >= 60000) {
    // 1 minute in milliseconds
    return { value: Math.round(diff / 60000), unit: 'minute' };
  }

  return { value: Math.round(diff / 1000), unit: 'second' };
}

/**
 * Displays metadata about the source: last modified time and last availability
 * check status.
 *
 * Uses react-intl's FormattedRelativeTime for consistent relative time display
 * (e.g., "2 days ago", "5 minutes ago").
 */
export const SourceMetadata: React.FC<SourceMetadataProps> = ({ source }) => {
  const intl = useIntl();

  const lastModified = getRelativeTime(source.updated_at || source.created_at);

  const lastChecked = source.last_checked_at
    ? getRelativeTime(source.last_checked_at)
    : null;

  // Determine availability check status
  const availabilityCheckStatus = React.useMemo(() => {
    if (!lastChecked) {
      return (
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Spinner size="md" aria-label="Checking availability" />
          </FlexItem>
          <FlexItem>{intl.formatMessage(messages.waitingForUpdate)}</FlexItem>
        </Flex>
      );
    }

    // Only auto-update for hour or shorter units (day breaks FormattedRelativeTime)
    const shouldAutoUpdate = lastChecked.unit !== 'day';

    return intl.formatMessage(messages.checkedAgo, {
      time: (
        <FormattedRelativeTime
          value={lastChecked.value}
          numeric="auto"
          updateIntervalInSeconds={shouldAutoUpdate ? 60 : undefined}
          unit={lastChecked.unit}
        />
      ),
    });
  }, [intl, lastChecked]);

  return (
    <DescriptionList isHorizontal isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.lastModified)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <FormattedRelativeTime
            value={lastModified.value}
            numeric="auto"
            updateIntervalInSeconds={
              lastModified.unit !== 'day' ? 60 : undefined
            }
            unit={lastModified.unit}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.lastAvailabilityCheck)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {availabilityCheckStatus}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
