import React from 'react';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import { useIntl } from 'react-intl';
import messages from '../messages';
import type { SourceAvailabilityStatus } from '../../../data/types/sources.types';

interface StatusBadgeProps {
  status?: SourceAvailabilityStatus;
  isPaused?: boolean;
}

/**
 * Displays the availability status of a data source as a filled status label.
 *
 * Uses PatternFly's semantic status variants for consistent styling with the
 * table StatusCell:
 * - Paused → info (blue)
 * - Available → success (green)
 * - In progress → custom (teal)
 * - Partially available → warning (orange)
 * - Unavailable → danger (red)
 *
 * This component is reused by both the detail page header and the table's
 * StatusCell (RHCLOUD-50925).
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isPaused,
}) => {
  const intl = useIntl();

  // Paused takes precedence over availability status
  if (isPaused) {
    return (
      <Label status="info">{intl.formatMessage(messages.statusPaused)}</Label>
    );
  }

  const config: Record<
    SourceAvailabilityStatus,
    {
      status: 'success' | 'warning' | 'danger' | 'custom';
      message: typeof messages.statusActive;
    }
  > = {
    available: { status: 'success', message: messages.statusActive },
    in_progress: { status: 'custom', message: messages.statusInProgress },
    partially_available: {
      status: 'warning',
      message: messages.statusPartiallyAvailable,
    },
    unavailable: { status: 'danger', message: messages.statusUnavailable },
  };

  const { status: labelStatus, message } = config[status ?? 'unavailable'];

  return <Label status={labelStatus}>{intl.formatMessage(message)}</Label>;
};
