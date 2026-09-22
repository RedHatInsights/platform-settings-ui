import Axios from 'axios';
import type { AppServices } from './AppServices.types';

export function createCliServices(): AppServices {
  return {
    appAction: () => undefined,
    addNotification: () => undefined,
    getToken: async () => 'cli-stub-token',
    environment: 'stage',
    isOrgAdmin: true,
    axios: Axios.create(),
    notify: () => undefined,
    updateDocumentTitle: () => undefined,
    fetchCVEs: async () => [],
  };
}
