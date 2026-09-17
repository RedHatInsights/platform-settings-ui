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
  const absDiff = Math.abs(diff);

  // Select unit based on absolute duration thresholds before rounding
  if (absDiff >= 30 * 24 * 60 * 60 * 1000) {
    // 30 days in milliseconds
    return {
      value: Math.round(diff / (30 * 24 * 60 * 60 * 1000)),
      unit: 'month',
    };
  }
  if (absDiff >= 24 * 60 * 60 * 1000) {
    // 1 day in milliseconds
    return { value: Math.round(diff / (24 * 60 * 60 * 1000)), unit: 'day' };
  }
  if (absDiff >= 60 * 60 * 1000) {
    // 1 hour in milliseconds
    return { value: Math.round(diff / (60 * 60 * 1000)), unit: 'hour' };
  }
  if (absDiff >= 60 * 1000) {
    // 1 minute in milliseconds
    return { value: Math.round(diff / (60 * 1000)), unit: 'minute' };
  }
  return { value: Math.round(diff / 1000), unit: 'second' };
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
      : source.app_creation_workflow === 'manual_configuration'
        ? intl.formatMessage(messages.manualConfiguration)
        : intl.formatMessage(messages.unknown);

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
