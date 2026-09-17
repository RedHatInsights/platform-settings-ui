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
  };
}
