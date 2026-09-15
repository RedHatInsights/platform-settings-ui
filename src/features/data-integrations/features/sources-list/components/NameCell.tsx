import React from 'react';
import { AppLink } from '../../../../../Components/AppLink';

interface NameCellProps {
  id: string;
  name: string;
}

/**
 * Displays the source name as a clickable link to the detail view.
 * Uses AppLink for Chrome-aware navigation within the application.
 */
const NameCell: React.FC<NameCellProps> = ({ id, name }) => {
  return <AppLink to={`/data-integrations/${id}`}>{name}</AppLink>;
};

export default NameCell;
