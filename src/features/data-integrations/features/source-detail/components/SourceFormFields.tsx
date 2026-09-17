import React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import { FormattedRelativeTime, useIntl } from 'react-intl';
import messages from '../messages';
import type { Source, SourceType } from '../../../data/types/sources.types';

interface SourceFormFieldsProps {
  source: Source;
  sourceType?: SourceType;
}

/**
 * Calculates relative time for FormattedRelativeTime (same logic as SourceHeader).
 */
function getRelativeTime(dateString: string): {
  value: number;
  unit: 'second' | 'minute' | 'hour' | 'day' | 'month';
} {
  const diff = new Date(dateString).getTime() - Date.now();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);

  if (Math.abs(months) >= 1) {
    return { value: months, unit: 'month' };
  }
  if (Math.abs(days) >= 1) {
    return { value: days, unit: 'day' };
  }
  if (Math.abs(hours) >= 1) {
    return { value: hours, unit: 'hour' };
  }
  if (Math.abs(minutes) >= 1) {
    return { value: minutes, unit: 'minute' };
  }
  return { value: seconds, unit: 'second' };
}

/**
 * Displays read-only source properties as label: value pairs.
 *
 * Shows Name, Date added, Configuration mode, and Integration type as plain
 * text. Edit functionality will be added in a future story.
 */
export const SourceFormFields: React.FC<SourceFormFieldsProps> = ({
  source,
  sourceType,
}) => {
  const intl = useIntl();

  const configModeText =
    source.app_creation_workflow === 'account_authorization'
      ? intl.formatMessage(messages.accountAuthorization)
      : intl.formatMessage(messages.manualConfiguration);

  const dateAdded = getRelativeTime(source.created_at);

  return (
    <DescriptionList isHorizontal isCompact>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.nameLabel)}
        </DescriptionListTerm>
        <DescriptionListDescription>{source.name}</DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.dateAddedLabel)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <FormattedRelativeTime
            value={dateAdded.value}
            numeric="auto"
            unit={dateAdded.unit}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.configurationModeLabel)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {configModeText}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>
          {intl.formatMessage(messages.integrationTypeLabel)}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {sourceType?.product_name ?? ''}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
