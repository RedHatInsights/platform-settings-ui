import React from 'react';
import { type MessageDescriptor, useIntl } from 'react-intl';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import type { SourceAvailabilityStatus } from '../data/types/sources.types';
import messages from '../messages';

/**
 * PatternFly `Label` status variants, plus `undefined` for a status the
 * availability checker has not reported yet.
 */
type LabelStatus = 'success' | 'warning' | 'danger' | 'info' | 'custom';

/**
 * Maps a source or application availability status to its PatternFly variant.
 *
 * Exported because the table's application badges need the colour without this
 * component's label — they show the application's own name instead.
 */
export function getSourceStatusVariant(
  status?: SourceAvailabilityStatus,
  pausedAt?: string,
): LabelStatus | undefined {
  // Paused takes precedence over availability status.
  if (pausedAt) {
    return 'info';
  }

  switch (status) {
    case 'available':
      return 'success';
    case 'in_progress':
      return 'custom';
    case 'partially_available':
      return 'warning';
    case 'unavailable':
      return 'danger';
    default:
      return undefined;
  }
}

const STATUS_LABELS: Record<SourceAvailabilityStatus, MessageDescriptor> = {
  available: messages.statusAvailable,
  in_progress: messages.statusInProgress,
  partially_available: messages.statusPartiallyAvailable,
  unavailable: messages.statusUnavailable,
};

interface SourceStatusLabelProps {
  status?: SourceAvailabilityStatus;
  /** Set while the source is paused; `undefined` means active. */
  pausedAt?: string;
}

/**
 * Filled status badge for a source's availability.
 *
 * Shared by the table's Status column and the detail page header. These were
 * two separate components (`StatusCell` and `StatusBadge`) that had already
 * diverged: `available` rendered as "Available" in the table and "Active" on
 * the detail page, so clicking a row changed the wording for an unchanged
 * source. "Available" is the agreed wording.
 */
const SourceStatusLabel: React.FC<SourceStatusLabelProps> = ({
  status,
  pausedAt,
}) => {
  const intl = useIntl();

  const variant = getSourceStatusVariant(status, pausedAt);

  const label = pausedAt
    ? messages.statusPaused
    : status
      ? STATUS_LABELS[status]
      : messages.statusUnknown;

  return <Label status={variant}>{intl.formatMessage(label)}</Label>;
};

export default SourceStatusLabel;
