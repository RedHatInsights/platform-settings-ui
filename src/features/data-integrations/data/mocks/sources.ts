import type { HttpHandler } from 'msw';
import { HttpResponse, delay, http } from 'msw';
import { createResettableCollection } from '../../../../shared/mockCollections';
import type {
  Application,
  CreateApplicationInput,
  CreateSourceInput,
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

/** Full happy-path handler set: GraphQL list, REST detail, catalogues, and POST create routes. */
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

    http.post(`${baseUrl}/sources`, async ({ request }) => {
      const body = (await request.json()) as CreateSourceInput;
      const source: Source = {
        id: `src-${Date.now()}-${nextId++}`,
        name: body.name,
        source_type_id: body.source_type_id,
        created_at: new Date().toISOString(),
        availability_status: 'in_progress',
        applications: [],
      };
      sourcesDb.create(source);

      return HttpResponse.json(source, { status: 201 });
    }),

    http.post(`${baseUrl}/applications`, async ({ request }) => {
      const body = (await request.json()) as CreateApplicationInput;
      const application: Application = {
        id: `app-${Date.now()}-${nextId++}`,
        source_id: body.source_id,
        application_type_id: body.application_type_id,
        created_at: new Date().toISOString(),
        availability_status: 'available',
      };

      // Append the association to the source so subsequent list and detail
      // reads reflect the successful submission.
      const source = sourcesDb.findById(body.source_id);
      if (source) {
        source.applications = [
          ...(source.applications ?? []),
          {
            id: application.id,
            application_type_id: application.application_type_id,
            availability_status: 'available',
          },
        ];
      }

      return HttpResponse.json(application, { status: 201 });
    }),
  ];
}

/**
 * Handlers where source creation succeeds but application creation always
 * fails. Used to test the partial-failure path in the wizard.
 */
export function createFailingApplicationHandlers(
  baseUrl = SOURCES_API_BASE,
): HttpHandler[] {
  const base = createSourcesHandlers(baseUrl);

  return [
    // Override the application POST handler with one that always errors.
    http.post(`${baseUrl}/applications`, () =>
      HttpResponse.json(
        { errors: [{ detail: 'Application association failed', status: 500 }] },
        { status: 500 },
      ),
    ),
    ...base,
  ];
}
