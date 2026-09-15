import React from 'react';
import type { SourceType } from '../../../data/types/sources.types';

interface TypeCellProps {
  sourceTypeId: string;
  sourceTypes?: SourceType[];
}

/**
 * Displays the provider's product name (e.g., "Red Hat OpenShift Container
 * Platform", "Amazon Web Services") by resolving the source's `source_type_id`
 * through the source types catalogue.
 */
const TypeCell: React.FC<TypeCellProps> = ({ sourceTypeId, sourceTypes }) => {
  const sourceType = sourceTypes?.find((type) => type.id === sourceTypeId);

  return <span>{sourceType?.product_name ?? sourceTypeId}</span>;
};

export default TypeCell;
