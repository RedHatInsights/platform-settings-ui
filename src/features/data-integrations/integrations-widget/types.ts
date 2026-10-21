/**
 * Integration count by provider ID.
 */
export interface IntegrationCounts {
  aws: number;
  azure: number;
  google_cloud: number;
  openshift: number;
}

/**
 * A single data integration provider card.
 */
export interface DataIntegrationProvider {
  id: keyof IntegrationCounts;
  name: string;
  iconSrc: string;
  /** Filter parameter to use when navigating to "My data integrations" */
  filterValue: string;
}
