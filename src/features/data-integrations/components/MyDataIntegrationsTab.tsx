import React from 'react';
import SourcesTable from '../features/sources-list/SourcesTable';

/**
 * "My data integrations" tab showing the user's configured data source
 * integrations with filtering, search, sorting, and pagination.
 */
const MyDataIntegrationsTab: React.FC = () => {
  return <SourcesTable />;
};

export default MyDataIntegrationsTab;
