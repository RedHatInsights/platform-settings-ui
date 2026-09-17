import type {
  ApplicationType,
  Source,
  SourceType,
} from '../types/sources.types';

/**
 * Application type ids, named so a story reads as intent rather than as a
 * magic string. These are the services that attach to a data source.
 */
export const APPLICATION_TYPE_COST = '1';
export const APPLICATION_TYPE_SUBSCRIPTIONS = '2';
export const APPLICATION_TYPE_RHEL = '3';

/**
 * Red Hat services that can attach to a data source. The table's
 * "Connected applications" column resolves `application_type_id` through this
 * catalogue to display the service name.
 */
export const seedApplicationTypes: ApplicationType[] = [
  {
    id: APPLICATION_TYPE_COST,
    name: '/insights/platform/cost-management',
    display_name: 'Cost Management',
    created_at: '2020-01-15T10:00:00Z',
  },
  {
    id: APPLICATION_TYPE_SUBSCRIPTIONS,
    name: '/insights/platform/subscriptions',
    display_name: 'Subscriptions',
    created_at: '2020-02-20T12:30:00Z',
  },
  {
    id: APPLICATION_TYPE_RHEL,
    name: '/insights/platform/rhel-management',
    display_name: 'RHEL Management',
    created_at: '2020-03-10T14:15:00Z',
  },
];

/**
 * The four providers this island offers. Ids are the stage values, so a story
 * that hardcodes `source_type_id: '1'` reads the same as a real response.
 * `category` splits them exactly as the add-integration dropdown groups them.
 */
/**
 * The four providers this island offers. Ids are the stage values, so a story
 * that hardcodes `source_type_id: '1'` reads the same as a real response.
 * `category` splits them exactly as the add-integration dropdown groups them.
 *
 * icon_url is NOT included - it's a UI concern, not returned by the API.
 * See constants/sourceTypeIcons.ts for the UI-side icon mapping.
 */
export const seedSourceTypes: SourceType[] = [
  {
    id: '1',
    name: 'openshift',
    product_name: 'OpenShift Container Platform',
    vendor: 'Red Hat',
    category: 'Red Hat',
  },
  {
    id: '2',
    name: 'amazon',
    product_name: 'Amazon Web Services',
    vendor: 'Amazon',
    category: 'Cloud',
  },
  {
    id: '3',
    name: 'google',
    product_name: 'Google Cloud',
    vendor: 'Google',
    category: 'Cloud',
  },
  {
    id: '4',
    name: 'azure',
    product_name: 'Microsoft Azure',
    vendor: 'Azure',
    category: 'Cloud',
  },
];

/**
 * Seven sources spread across all four providers and every availability
 * status, including one the checker has not reached yet (no
 * `availability_status`) and one with no applications attached at all.
 * `created_at` values are distinct and deliberately out of id order, so a sort
 * assertion cannot pass by accident — and neither alphabetical name order nor
 * id order matches provider name order, so the `source_type.product_name` sort
 * cannot pass by accident either.
 *
 * `applications` come back inline from the GraphQL list query, which is what
 * the table's "Connected applications" column reads.
 */
export const seedSources: Source[] = [
  {
    id: '101',
    name: 'AWS production account',
    source_type_id: '2',
    created_at: '2026-01-14T09:12:00Z',
    updated_at: '2026-08-30T11:04:00Z',
    availability_status: 'available',
    applications: [
      {
        id: '201',
        application_type_id: APPLICATION_TYPE_COST,
        availability_status: 'available',
      },
      {
        id: '202',
        application_type_id: APPLICATION_TYPE_SUBSCRIPTIONS,
        availability_status: 'available',
      },
    ],
  },
  {
    id: '102',
    name: 'AWS sandbox account',
    source_type_id: '2',
    created_at: '2026-05-02T16:45:00Z',
    updated_at: '2026-09-01T08:20:00Z',
    availability_status: 'unavailable',
    applications: [
      {
        id: '203',
        application_type_id: APPLICATION_TYPE_COST,
        availability_status: 'unavailable',
        availability_status_error: 'Role assumption failed: access denied',
      },
    ],
  },
  {
    id: '103',
    name: 'Azure cost management',
    source_type_id: '4',
    created_at: '2026-03-21T13:30:00Z',
    updated_at: '2026-08-12T10:15:00Z',
    availability_status: 'available',
    applications: [
      {
        id: '204',
        application_type_id: APPLICATION_TYPE_COST,
        availability_status: 'available',
      },
    ],
  },
  {
    id: '104',
    name: 'Google Cloud billing export',
    source_type_id: '3',
    created_at: '2026-07-08T07:55:00Z',
    availability_status: 'in_progress',
    applications: [
      {
        id: '205',
        application_type_id: APPLICATION_TYPE_COST,
        availability_status: 'in_progress',
      },
    ],
  },
  {
    id: '105',
    name: 'OpenShift cluster: east',
    source_type_id: '1',
    created_at: '2026-02-11T18:02:00Z',
    updated_at: '2026-09-03T09:41:00Z',
    availability_status: 'partially_available',
    applications: [
      {
        id: '206',
        application_type_id: APPLICATION_TYPE_COST,
        availability_status: 'available',
      },
      {
        id: '207',
        application_type_id: APPLICATION_TYPE_RHEL,
        availability_status: 'unavailable',
        availability_status_error: 'Cluster unreachable',
      },
    ],
  },
  {
    id: '106',
    name: 'OpenShift cluster: west',
    source_type_id: '1',
    created_at: '2026-06-19T12:00:00Z',
    updated_at: '2026-08-27T14:33:00Z',
    availability_status: 'available',
    applications: [
      {
        id: '208',
        application_type_id: APPLICATION_TYPE_RHEL,
        availability_status: 'available',
      },
    ],
  },
  {
    id: '107',
    name: 'Azure staging subscription',
    source_type_id: '4',
    created_at: '2026-04-05T21:10:00Z',
    applications: [],
  },
  {
    id: '108',
    name: 'AWS development account',
    source_type_id: '2',
    created_at: '2026-09-15T20:00:00Z', // Recent timestamp for testing
    availability_status: 'in_progress',
    applications: [
      {
        id: '209',
        application_type_id: APPLICATION_TYPE_COST,
        availability_status: 'in_progress',
      },
    ],
  },
  {
    id: '109',
    name: 'Google Cloud test project',
    source_type_id: '3',
    created_at: '2026-08-10T14:20:00Z',
    paused_at: '2026-09-01T10:00:00Z',
    availability_status: 'available',
    applications: [
      {
        id: '210',
        application_type_id: APPLICATION_TYPE_COST,
        availability_status: 'available',
        paused_at: '2026-09-01T10:00:00Z',
      },
    ],
  },
];
