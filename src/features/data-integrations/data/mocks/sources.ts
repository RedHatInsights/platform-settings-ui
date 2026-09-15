import { HttpResponse, http } from 'msw';
import { createResettableCollection } from '../../../../shared/mockCollections';
import type {
  PageApplicationType,
  PageSourceType,
  Source,
} from '../types/sources.types';
import { seedApplicationTypes, seedSourceTypes, seedSources } from './seed';

const SOURCES_API_BASE = '/api/sources/v3.1';

/** The API's own defaults, so an unparameterised query behaves the same here. */
const DEFAULT_LIMIT = 100;

export const sourcesDb = createResettableCollection(seedSources);

/**
 * The api layer sends arguments as GraphQL variables rather than interpolating
 * them into the query, so the handlers read a typed object instead of parsing
 * a query string. These mirror the `Filter` and `SortBy` inputs in
 * `graph/schema.graphqls`.
 */
interface GraphQLFilter {
  name: string;
  operation?: string;
  value: string[];
}

interface GraphQLSortBy {
  name: string;
  direction?: 'asc' | 'desc';
}

interface SourcesRequestBody {
  query: string;
  variables?: {
    limit?: number;
    offset?: number;
    sortBy?: GraphQLSortBy[];
    filter?: GraphQLFilter[];
  };
}

/** Only the columns a story sorts on; the real API allows more. */
function valueFor(source: Source, name: string): string {
  if (name === 'source_type.product_name') {
    return (
      seedSourceTypes.find((type) => type.id === source.source_type_id)
        ?.product_name ?? ''
    );
  }

  const value = source[name as keyof Source];

  return typeof value === 'string' ? value : '';
}

/**
 * A `source_type.` prefixed name sorts on the joined catalogue, matching
 * `parseSortBy` in `graph/arguments.go`. Omitted, the API sorts by `id ASC`.
 */
function sortSources(sources: Source[], sortBy?: GraphQLSortBy[]): Source[] {
  const { name, direction } = sortBy?.[0] ?? { name: 'id', direction: 'asc' };

  const sorted = [...sources].sort((a, b) =>
    valueFor(a, name).localeCompare(valueFor(b, name)),
  );

  return direction === 'desc' ? sorted.reverse() : sorted;
}

function matches(source: Source, filter: GraphQLFilter): boolean {
  const { name, operation, value } = filter;

  if (name === 'name' && operation === 'contains_i') {
    return source.name.toLowerCase().includes(value[0].toLowerCase());
  }
  if (name === 'applications.application_type_id') {
    return (source.applications ?? []).some((application) =>
      value.includes(application.application_type_id),
    );
  }

  // Everything else is an equality match against a plain column — an empty or
  // `eq` operation with several values means "in this set".
  const actual = source[name as keyof Source];

  return typeof actual === 'string' && value.includes(actual);
}

function filterSources(sources: Source[], filter?: GraphQLFilter[]): Source[] {
  return (filter ?? []).reduce(
    (remaining, one) => remaining.filter((source) => matches(source, one)),
    sources,
  );
}

/** Shapes a payload the way the GraphQL endpoint answers. */
function graphQLData(sources: Source[], count: number) {
  return HttpResponse.json({ data: { sources, meta: { count } } });
}

export function createEmptySourcesHandler(baseUrl = SOURCES_API_BASE) {
  return http.post(`${baseUrl}/graphql`, () => graphQLData([], 0));
}

/**
 * GraphQL reports a failed query as 200 with an `errors` array, not as an HTTP
 * error status — which is the case `unwrap()` in the api layer exists for.
 */
export function createErrorSourcesHandler(baseUrl = SOURCES_API_BASE) {
  return http.post(`${baseUrl}/graphql`, () =>
    HttpResponse.json({ errors: [{ message: 'Internal Server Error' }] }),
  );
}

export function createSourcesHandlers(baseUrl = SOURCES_API_BASE) {
  return [
    http.post(`${baseUrl}/graphql`, async ({ request }) => {
      const { variables } = (await request.json()) as SourcesRequestBody;
      const limit = variables?.limit ?? DEFAULT_LIMIT;
      const offset = variables?.offset ?? 0;

      const matched = sortSources(
        filterSources(sourcesDb.findAll(), variables?.filter),
        variables?.sortBy,
      );

      return graphQLData(matched.slice(offset, offset + limit), matched.length);
    }),

    http.get(`${baseUrl}/sources/:id`, ({ params }) => {
      const source = sourcesDb.findById(String(params.id));

      if (!source) {
        return HttpResponse.json(
          { errors: [{ detail: 'Record not found', status: 404 }] },
          { status: 404 },
        );
      }

      return HttpResponse.json(source);
    }),

    http.get(`${baseUrl}/source_types`, () => {
      const response: PageSourceType = {
        data: seedSourceTypes,
        links: {},
        meta: { count: seedSourceTypes.length },
      };

      return HttpResponse.json(response);
    }),

    http.get(`${baseUrl}/application_types`, () => {
      const response: PageApplicationType = {
        data: seedApplicationTypes,
        links: {},
        meta: { count: seedApplicationTypes.length },
      };

      return HttpResponse.json(response);
    }),
  ];
}
