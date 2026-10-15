import {
  type ListApplicationTypesReturnType,
  type ListSourceTypesReturnType,
  listApplicationTypes,
  listSourceTypes,
  postGraphQL,
  showSource,
} from '@redhat-cloud-services/sources-client';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared/utils';
import type { AxiosInstance } from 'axios';
import type {
  ApplicationType,
  BulkCreatePayload,
  BulkCreateResponse,
  CreateSourceInput,
  PageSource,
  Source,
  SourceType,
  SourcesParams,
} from '../types/sources.types';
import { SourceNotFoundError } from '../errors';

/**
 * Sources has no v2 line — v3.1 is current. The repo-wide "use v2" convention
 * comes from notifications and does not apply here.
 */
const SOURCES_API_BASE = '/api/sources/v3.1';

/**
 * `/source_types` and `/application_types` are small, fixed catalogues (a few
 * dozen rows each), so they are fetched in one page rather than paginated.
 */
const SOURCE_TYPES_LIMIT = 100;
const APPLICATION_TYPES_LIMIT = 100;
const AVAILABILITY_WAIT_MS = 10_000;
const AVAILABILITY_POLL_MS = 1_000;

async function checkApplicationAvailability(
  axios: AxiosInstance,
  id: string,
  wait: boolean,
): Promise<void> {
  const deadline = Date.now() + (wait ? AVAILABILITY_WAIT_MS : 0);

  try {
    while (true) {
      const { data } = await axios.get<{ availability_status?: string }>(
        `${SOURCES_API_BASE}/applications/${id}`,
      );
      if (
        !wait ||
        data.availability_status === 'available' ||
        data.availability_status === 'unavailable' ||
        Date.now() >= deadline
      ) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, AVAILABILITY_POLL_MS));
    }
  } catch {
    // Creation succeeded; a failed status read must not invite a duplicate retry.
  }
}

const endpoints = {
  listApplicationTypes,
  listSourceTypes,
  postGraphQL,
  showSource,
};

/**
 * The list goes over GraphQL; everything else is REST.
 *
 * That split is not a preference, it is what the two transports can express.
 * `GET /sources` returns the source columns and nothing else, so the table's
 * "Connected applications" column would need a second call — and, more
 * decisively, REST cannot sort or filter on a joined association at all.
 * `middleware/filtering.go` never sets a subresource on the sort filter, and
 * `applySortBy` rejects a dotted column name, so `source_type.product_name` —
 * the "Type" column's sort — is unreachable over query params. The GraphQL
 * argument parser handles the `source_type.` and `applications.` prefixes
 * explicitly (`graph/arguments.go`), which is why sources-ui reads through it
 * too.
 *
 * Detail reads and the source-type catalogue have no associations to pull in,
 * so they stay on the typed REST endpoints.
 */

/** Matches the `Filter` input in `graph/schema.graphqls`. */
interface GraphQLFilter {
  name: string;
  operation?: string;
  value: string[];
}

/** Matches the `SortBy` input in `graph/schema.graphqls`. */
interface GraphQLSortBy {
  name: string;
  direction: 'asc' | 'desc';
}

interface SourcesQueryVariables {
  limit?: number;
  offset?: number;
  sortBy?: GraphQLSortBy[];
  filter?: GraphQLFilter[];
}

interface SourcesQueryData {
  sources: Source[];
  meta: { count: number };
}

interface SourceQueryData {
  sources: Source[];
}

interface SourceNameQueryData {
  sources: Array<Pick<Source, 'id' | 'name'>>;
}

/**
 * `availability_status_error`, `uid`, and `version` are deliberately absent —
 * the schema does not expose them on Source. Error text for a failing source
 * comes from its applications.
 */
const SOURCE_FIELDS = `
    id
    name
    source_type_id
    created_at
    updated_at
    availability_status
    paused_at
    last_checked_at
    last_available_at
    app_creation_workflow
    imported
    source_ref
    applications {
      id
      application_type_id
      availability_status
      availability_status_error
      paused_at
    }
`;

/**
 * Arguments are passed as GraphQL variables rather than interpolated into the
 * query string. sources-ui builds its query by hand
 * (`value: "${filterValue.name}"`, `entities.js:124`), which breaks the moment
 * a search term or source name contains a quote.
 */
const SOURCES_QUERY = `query Sources($limit: Int, $offset: Int, $sortBy: [SortBy], $filter: [Filter]) {
  sources(limit: $limit, offset: $offset, sort_by: $sortBy, filter: $filter) {${SOURCE_FIELDS}  }
  meta {
    count
  }
}`;

/**
 * An empty operation means `eq`, and `eq` with more than one value becomes a
 * SQL `IN` (`dao/filtering.go`). `contains_i` is the case-insensitive LIKE.
 */
function buildFilter({
  nameContains,
  sourceTypeIds,
  availabilityStatus,
  applicationTypeIds,
}: SourcesParams): GraphQLFilter[] | undefined {
  const filter: GraphQLFilter[] = [];

  if (nameContains) {
    filter.push({
      name: 'name',
      operation: 'contains_i',
      value: [nameContains],
    });
  }
  if (sourceTypeIds?.length) {
    filter.push({
      name: 'source_type_id',
      operation: 'eq',
      value: sourceTypeIds,
    });
  }
  if (availabilityStatus?.length) {
    filter.push({
      name: 'availability_status',
      operation: 'eq',
      value: availabilityStatus,
    });
  }
  if (applicationTypeIds?.length) {
    filter.push({
      name: 'applications.application_type_id',
      operation: 'eq',
      value: applicationTypeIds,
    });
  }

  return filter.length > 0 ? filter : undefined;
}

/** Omitted, the API sorts by `id ASC`. */
function buildSortBy({
  sortBy,
  sortDirection,
}: SourcesParams): GraphQLSortBy[] | undefined {
  return sortBy
    ? [{ name: sortBy, direction: sortDirection ?? 'asc' }]
    : undefined;
}

/**
 * GraphQL answers with 200 and an `errors` array rather than an HTTP error
 * status, so a failed query has to be turned into a rejection by hand —
 * otherwise TanStack Query treats it as a successful empty result.
 */
function unwrap<T>(response: { data?: object; errors?: Array<object> }): T {
  if (response.errors && response.errors.length > 0) {
    const [first] = response.errors as Array<{ message?: string }>;
    throw new Error(first.message ?? 'Sources GraphQL query failed');
  }
  if (!response.data) {
    throw new Error('Sources GraphQL query returned no data');
  }

  return response.data as T;
}

export function createSourcesApi(axios: AxiosInstance) {
  const api = APIFactory(SOURCES_API_BASE, endpoints, { axios });

  return {
    async getSources(params: SourcesParams = {}): Promise<PageSource> {
      const variables: SourcesQueryVariables = {
        limit: params.limit,
        offset: params.offset,
        sortBy: buildSortBy(params),
        filter: buildFilter(params),
      };

      const response = await api.postGraphQL({
        graphQLRequest: { query: SOURCES_QUERY, variables },
      });

      const { sources, meta } = unwrap<SourcesQueryData>(response.data);

      return {
        data: sources,
        links: {},
        meta: { count: meta.count, limit: params.limit, offset: params.offset },
      };
    },

    async getSource(id: string): Promise<Source> {
      // Use GraphQL to get applications inline (REST showSource doesn't include them)
      // The GraphQL schema has 'sources' (plural) with filters, not a single 'source' query
      const query = `query GetSource($filter: [Filter]) {
        sources(filter: $filter) {${SOURCE_FIELDS}  }
      }`;

      const response = await api.postGraphQL({
        graphQLRequest: {
          query,
          variables: {
            filter: [{ name: 'id', operation: 'eq', value: [id] }],
          },
        },
      });

      const { sources } = unwrap<SourceQueryData>(response.data);

      if (!sources || sources.length === 0) {
        throw new SourceNotFoundError(id);
      }

      return sources[0];
    },

    /** Matches the exact-name check used by sources-ui before source creation. */
    async isSourceNameTaken(name: string): Promise<boolean> {
      const response = await api.postGraphQL({
        graphQLRequest: {
          query:
            'query SourceName($filter: [Filter]) { sources(filter: $filter) { id, name } }',
          variables: {
            filter: [{ name: 'name', operation: 'eq', value: [name] }],
          },
        },
      });

      const { sources } = unwrap<SourceNameQueryData>(response.data);

      return sources.length > 0;
    },

    /**
     * Creates a source, its authentication and its applications in one bulk
     * request, then links endpoint authentication to the application when
     * both resources are present.
     *
     * Goes over raw axios rather than `api`: the generated client ships
     * `CreateSource`, `CreateAuthentication` and friends but no `BulkCreate`,
     * and doing it as two calls can leave a credential-less source behind when
     * the second fails — which is why sources-ui posts `/bulk_create` too.
     *
     * The provider goes in as `source_type_name`; the API resolves it, so the
     * caller does not need the catalogue loaded to submit.
     */
    async createSource(input: CreateSourceInput): Promise<Source> {
      const manual = input.appCreationWorkflow === 'manual_configuration';
      const manualApplication = input.manualApplication;
      const selectedApplication = manual
        ? manualApplication
        : input.selectedApplication;
      const parsedEndpoint = input.endpoint?.url
        ? new URL(input.endpoint.url)
        : undefined;

      if (manual && (!manualApplication || !input.authentication?.username)) {
        throw new Error(
          'Manual configuration requires an application and role ARN',
        );
      }

      const payload: BulkCreatePayload = {
        sources: [
          {
            name: input.name,
            source_type_name: input.sourceTypeName,
            app_creation_workflow: input.appCreationWorkflow,
            ...(input.sourceRef ? { source_ref: input.sourceRef } : {}),
          },
        ],
        endpoints: input.endpoint
          ? [
              {
                role: input.endpoint.role,
                verify_ssl: input.endpoint.verify_ssl,
                certificate_authority: input.endpoint.certificate_authority,
                source_name: input.name,
                default: true,
                scheme: parsedEndpoint?.protocol.replace(/:$/, ''),
                host: parsedEndpoint?.hostname,
                port: parsedEndpoint?.port
                  ? Number(parsedEndpoint.port)
                  : undefined,
                path: parsedEndpoint?.pathname,
              },
            ]
          : [],
        authentications:
          input.authentication && input.authentication.authtype !== 'empty'
            ? [
                {
                  ...input.authentication,
                  resource_type: input.endpoint
                    ? 'endpoint'
                    : selectedApplication
                      ? 'application'
                      : 'source',
                  resource_name: input.endpoint
                    ? parsedEndpoint?.hostname
                    : (selectedApplication?.name ?? input.name),
                },
              ]
            : [],
        applications: selectedApplication
          ? [
              {
                application_type_id: selectedApplication.id,
                source_name: input.name,
                extra: selectedApplication.extra,
              },
            ]
          : (input.applicationTypeIds ?? []).map((application_type_id) => ({
              application_type_id,
              source_name: input.name,
            })),
      };

      const response = await axios.post<BulkCreateResponse>(
        `${SOURCES_API_BASE}/bulk_create`,
        payload,
      );

      const created = response.data?.sources?.[0];

      if (!created) {
        throw new Error('Sources bulk create returned no source');
      }

      const createdApplication = response.data?.applications?.[0];
      const createdAuthentication = response.data?.authentications?.[0];
      if (
        input.endpoint &&
        selectedApplication &&
        createdApplication &&
        createdAuthentication
      ) {
        await axios.post(`${SOURCES_API_BASE}/application_authentications`, {
          application_id: createdApplication.id,
          authentication_id: createdAuthentication.id,
        });
      }

      try {
        await axios.post(
          `${SOURCES_API_BASE}/sources/${created.id}/check_availability`,
        );
      } catch {
        // Creation succeeded; a failed status check must not invite a duplicate retry.
      }

      await Promise.all(
        (response.data?.applications ?? []).map((application) =>
          checkApplicationAvailability(
            axios,
            application.id,
            input.availabilityWaitApplicationTypeIds?.includes(
              application.application_type_id,
            ) ?? false,
          ),
        ),
      );

      return created;
    },

    async getSourceTypes(): Promise<SourceType[]> {
      const response = await api.listSourceTypes({ limit: SOURCE_TYPES_LIMIT });
      const collection: ListSourceTypesReturnType = response.data;

      return (collection.data ?? []) as SourceType[];
    },

    async getApplicationTypes(): Promise<ApplicationType[]> {
      const response = await api.listApplicationTypes({
        limit: APPLICATION_TYPES_LIMIT,
      });
      const collection: ListApplicationTypesReturnType = response.data;

      return (collection.data ?? []) as ApplicationType[];
    },

    async getAwsRegions(): Promise<string[]> {
      const response = await axios.get<{ data: string[] }>(
        '/api/cost-management/v1/sources/aws-s3-regions/?limit=10000&offset=0',
      );
      if (!Array.isArray(response.data?.data)) {
        throw new Error('AWS regions response is invalid');
      }
      return response.data.data;
    },

    async getHcsEnrollment(isProd = false): Promise<boolean> {
      const consoleUrl = `https://console.${isProd ? '' : 'stage.'}redhat.com`;
      try {
        const response = await axios.get<{ hcsDeal: boolean }>(
          `${consoleUrl}/api/billing/v1/authorization/hcsEnrollment`,
        );
        return response.status === 200 ? response.data.hcsDeal : false;
      } catch {
        return false;
      }
    },

    async getAwsProvisioningAccount(
      applicationTypeId: string,
    ): Promise<string> {
      const response = await axios.get<{ data: Array<{ payload: string }> }>(
        `${SOURCES_API_BASE}/app_meta_data?filter[name]=aws_wizard_account_number&application_type_id=${encodeURIComponent(applicationTypeId)}`,
      );
      const account = response.data.data?.[0]?.payload;
      if (!account) throw new Error('AWS provisioning account is unavailable');
      return account;
    },

    async getAzureLighthouseLink(): Promise<string> {
      const response = await axios.get<{ data: Array<{ payload: string }> }>(
        `${SOURCES_API_BASE}/app_meta_data?filter[name]=azure_lighthouse_template`,
      );
      const link = response.data.data?.[0]?.payload;
      if (!link) throw new Error('Azure Lighthouse link is unavailable');
      return link;
    },

    async getGoogleBillingAccount(): Promise<string> {
      const response = await axios.get<{
        data: Array<{ payload: string }>;
      }>(`${SOURCES_API_BASE}/app_meta_data?filter[name]=gcp_service_account`);
      const account = response.data.data?.find(({ payload }) =>
        payload.includes('billing-export'),
      )?.payload;
      if (!account) throw new Error('Google billing account is unavailable');
      return account;
    },

    async getGoogleProvisioningAccount(
      applicationTypeId: string,
    ): Promise<string> {
      const response = await axios.get<{ data: Array<{ payload: string }> }>(
        `${SOURCES_API_BASE}/app_meta_data?filter[name]=gcp_service_account&application_type_id=${encodeURIComponent(applicationTypeId)}`,
      );
      const account = response.data.data?.[0]?.payload;
      if (!account)
        throw new Error('Google provisioning account is unavailable');
      return account;
    },
  };
}
