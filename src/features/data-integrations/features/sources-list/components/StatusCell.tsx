import React from 'react';
import { useIntl } from 'react-intl';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import type { SourceAvailabilityStatus } from '../../../data/types/sources.types';
import messages from '../messages';

interface StatusCellProps {
  status?: SourceAvailabilityStatus;
  pausedAt?: string;
}

/**
 * Filled status badge for the "Status" column. Maps availability status to
 * PatternFly status variants with filled styling and icons.
 */
const StatusCell: React.FC<StatusCellProps> = ({ status, pausedAt }) => {
  const intl = useIntl();

  const getStatusConfig = (
    status?: SourceAvailabilityStatus,
    pausedAt?: string,
  ): {
    label: string;
    status: 'success' | 'warning' | 'danger' | 'info' | 'custom' | undefined;
  } => {
    // Paused takes precedence over availability status
    if (pausedAt) {
      return {
        label: intl.formatMessage(messages.statusPaused),
        status: 'info',
      };
    }

    switch (status) {
      case 'available':
        return {
          label: intl.formatMessage(messages.statusAvailable),
          status: 'success',
        };
      case 'in_progress':
        return {
          label: intl.formatMessage(messages.statusInProgress),
          status: 'custom',
        };
      case 'partially_available':
        return {
          label: intl.formatMessage(messages.statusPartiallyAvailable),
          status: 'warning',
        };
      case 'unavailable':
        return {
          label: intl.formatMessage(messages.statusUnavailable),
          status: 'danger',
        };
      default:
        return {
          label: intl.formatMessage(messages.statusUnknown),
          status: undefined,
        };
    }
  };

  const config = getStatusConfig(status, pausedAt);

  return <Label status={config.status}>{config.label}</Label>;
};

export default StatusCell;
