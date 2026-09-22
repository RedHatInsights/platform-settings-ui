import React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core/dist/dynamic/components/DescriptionList';
import { useIntl } from 'react-intl';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import messages from '../messages';
import { getDateFormatType } from '../../../utils/dateFormatType';
import type { Source, SourceType } from '../../../data/types/sources.types';

interface SourceFormFieldsProps {
  source: Source;
  sourceType?: SourceType;
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
          {/* Mirrors the sources table's format: 'date' column so both
              surfaces print the same string for the same source. */}
          <DateFormat
            date={source.created_at}
            type={getDateFormatType(source.created_at)}
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
