import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SourcesTable from '../features/sources-list/SourcesTable';

export interface MyDataIntegrationsTabProps {
  canWrite?: boolean;
}

/**
 * "My data integrations" tab showing the user's configured data source
 * integrations with filtering, search, sorting, and pagination.
 */
const MyDataIntegrationsTab: React.FC<MyDataIntegrationsTabProps> = ({
  canWrite,
}) => {
  const outletContext = useOutletContext<MyDataIntegrationsTabProps>();
  return (
    <SourcesTable canWrite={canWrite ?? outletContext?.canWrite ?? true} />
  );
};

export default MyDataIntegrationsTab;
