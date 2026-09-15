import React from 'react';
import { FormattedRelativeTime } from 'react-intl';

interface DateAddedCellProps {
  createdAt: string;
}

/**
 * Relative time display for the "Date added" column. Shows "12 days ago",
 * "1 month ago", etc. matching the sources-ui pattern.
 */
const DateAddedCell: React.FC<DateAddedCellProps> = ({ createdAt }) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = (now.getTime() - createdDate.getTime()) / 1000;

  let value: number;
  let unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

  if (diffInSeconds < 60) {
    value = -Math.floor(diffInSeconds);
    unit = 'second';
  } else if (diffInSeconds < 3600) {
    value = -Math.floor(diffInSeconds / 60);
    unit = 'minute';
  } else if (diffInSeconds < 86400) {
    value = -Math.floor(diffInSeconds / 3600);
    unit = 'hour';
  } else if (diffInSeconds < 2592000) {
    // Less than 30 days
    value = -Math.floor(diffInSeconds / 86400);
    unit = 'day';
  } else if (diffInSeconds < 31536000) {
    // Less than 365 days
    value = -Math.floor(diffInSeconds / 2592000);
    unit = 'month';
  } else {
    value = -Math.floor(diffInSeconds / 31536000);
    unit = 'year';
  }

  // Don't use updateIntervalInSeconds to avoid React scheduling errors
  return <FormattedRelativeTime value={value} unit={unit} numeric="auto" />;
};

export default DateAddedCell;
