import { HttpResponse, delay, http } from 'msw';
import { createResettableCollection } from '../../../../shared/mockCollections';
import type {
  BulkCreatePayload,
  PageApplicationType,
  PageSourceType,
  Source,
} from '../types/sources.types';
import { seedApplicationTypes, seedSourceTypes, seedSources } from './seed';

const SOURCES_API_BASE = '/api/sources/v3.1';

/** The API's own defaults, so an unparameterised query behaves the same here. */
const DEFAULT_LIMIT = 100;

/** Monotonic counter so IDs stay unique even when POSTs fire in the same ms. */
let nextId = 0;

/** In-memory source collection backing the MSW handlers. Reset between stories. */
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

/** Returns handlers that serve an empty source list with the full catalogues. */
export function createEmptySourcesHandler(baseUrl = SOURCES_API_BASE) {
  return [
    http.post(`${baseUrl}/graphql`, () => graphQLData([], 0)),
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

/**
 * GraphQL reports a failed query as 200 with an `errors` array, not as an HTTP
 * error status — which is the case `unwrap()` in the api layer exists for.
 */
export function createErrorSourcesHandler(baseUrl = SOURCES_API_BASE) {
  return [
    http.post(`${baseUrl}/graphql`, () =>
      HttpResponse.json({ errors: [{ message: 'Internal Server Error' }] }),
    ),
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

/**
 * Never answers the provider catalogue, pinning a consumer in its loading
 * state. Nothing here resolves, so a story using this must not wait for
 * content that depends on it.
 */
export function createPendingSourceTypesHandler(baseUrl = SOURCES_API_BASE) {
  return [
    http.get(`${baseUrl}/source_types`, async () => {
      await delay('infinite');

      return HttpResponse.json({} as PageSourceType);
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

/**
 * Fails the provider catalogue outright. Unlike the GraphQL collection, this
 * is a plain REST endpoint, so a failure really is an HTTP error status.
 */
export function createFailingSourceTypesHandler(baseUrl = SOURCES_API_BASE) {
  return [
    http.get(
      `${baseUrl}/source_types`,
      () => new HttpResponse(null, { status: 500 }),
    ),
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

/**
 * Serves only the named providers. Covers the catalogues that are narrower
 * than the caller expects: one missing the provider a consumer was opened
 * with, or — passed `[]` — one offering nothing we have a card for.
 */
export function createSourceTypesSubsetHandler(
  names: string[],
  baseUrl = SOURCES_API_BASE,
) {
  const data = seedSourceTypes.filter(({ name }) => names.includes(name));

  return [
    http.get(`${baseUrl}/source_types`, () => {
      const response: PageSourceType = {
        data,
        links: {},
        meta: { count: data.length },
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

/**
 * Builds the source a bulk create would have persisted.
 *
 * The API resolves `source_type_name` to the catalogue row, so the handler does
 * too — a created source carries a real `source_type_id`, which is what lets
 * the list and detail views render it like any other. `availability_status` is
 * left unset on purpose: the availability checker runs asynchronously after
 * creation, so a freshly created source genuinely has no status yet.
 */
function buildCreatedSource(payload: BulkCreatePayload): Source {
  const [requested] = payload.sources;
  const sourceType = seedSourceTypes.find(
    (type) => type.name === requested.source_type_name,
  );

  return {
    id: `src-${Date.now()}-${nextId++}`,
    name: requested.name,
    source_type_id: sourceType?.id ?? '0',
    created_at: new Date().toISOString(),
    applications: payload.applications.map(({ application_type_id }) => ({
      id: `app-${Date.now()}-${nextId++}`,
      application_type_id,
    })),
  };
}

/** Accepts a bulk create and persists it, so a later list read shows it. */
export function createBulkCreateHandler(baseUrl = SOURCES_API_BASE) {
  return [
    http.post(`${baseUrl}/bulk_create`, async ({ request }) => {
      const payload = (await request.json()) as BulkCreatePayload;
      const created = sourcesDb.create(buildCreatedSource(payload));

      return HttpResponse.json({ sources: [created] }, { status: 201 });
    }),
  ];
}

/**
 * Rejects a bulk create with the error envelope `sources-api-go` uses. The
 * status is a parameter because 400 (the name is taken, a credential is
 * malformed) and 500 differ only in the text the UI shows.
 */
export function createFailingBulkCreateHandler(
  status = 500,
  detail = 'Internal Server Error',
  baseUrl = SOURCES_API_BASE,
) {
  return [
    http.post(`${baseUrl}/bulk_create`, () =>
      HttpResponse.json(
        { errors: [{ detail, status: String(status) }] },
        { status },
      ),
    ),
  ];
}

/**
 * Fails the request before it reaches the API. There is no response body to
 * read a reason out of, which is the case the result view's generic copy and
 * `extractSourcesErrorDetail`'s `undefined` return exist for.
 */
export function createNetworkErrorBulkCreateHandler(
  baseUrl = SOURCES_API_BASE,
) {
  return [http.post(`${baseUrl}/bulk_create`, () => HttpResponse.error())];
}

/**
 * Fails the given number of times, then succeeds. Covers retry: the first
 * attempt shows the error view, the next one goes through.
 */
export function createFlakyBulkCreateHandler(
  failures = 1,
  baseUrl = SOURCES_API_BASE,
) {
  let attempts = 0;

  return [
    http.post(`${baseUrl}/bulk_create`, async ({ request }) => {
      attempts += 1;

      if (attempts <= failures) {
        return HttpResponse.json(
          { errors: [{ detail: 'Internal Server Error', status: '500' }] },
          { status: 500 },
        );
      }

      const payload = (await request.json()) as BulkCreatePayload;
      const created = sourcesDb.create(buildCreatedSource(payload));

      return HttpResponse.json({ sources: [created] }, { status: 201 });
    }),
  ];
}

/** Full happy-path handler set: bulk create, GraphQL list, REST detail, catalogues. */
export function createSourcesHandlers(baseUrl = SOURCES_API_BASE) {
  return [
    ...createBulkCreateHandler(baseUrl),

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
