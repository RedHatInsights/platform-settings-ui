import type { IntegrationCounts } from '../types';

export const mockIntegrationCounts: IntegrationCounts = {
  aws: 3,
  azure: 3,
  google_cloud: 3,
  openshift: 1,
};

export const mockEmptyIntegrationCounts: IntegrationCounts = {
  aws: 0,
  azure: 0,
  google_cloud: 0,
  openshift: 0,
};
