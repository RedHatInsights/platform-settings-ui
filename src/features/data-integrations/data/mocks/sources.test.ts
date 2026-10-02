/**
 * MSW 2.x requires Fetch API globals (`Request`, `Response`) that are not
 * available in jsdom, so the module is mocked. The mock preserves enough
 * structure for `createSourcesHandlers` to return handler-shaped objects whose
 * routes and resolvers we can assert and invoke.
 */

const jsonSpy = jest.fn(
  (body: unknown, init?: { status?: number }) =>
    ({ body, status: init?.status ?? 200 }) as const,
);

jest.mock('msw', () => ({
  HttpResponse: { json: jsonSpy },
  delay: jest.fn(),
  http: new Proxy(
    {},
    {
      get: (_target, method: string) => (path: string, resolver: unknown) => ({
        info: { method: method.toUpperCase(), path },
        resolver,
      }),
    },
  ),
}));

import { createSourcesHandlers, sourcesDb } from './sources';

/** Creates a minimal fake request whose `json()` resolves with the given body. */
function fakeRequest(body: unknown) {
  return { json: () => Promise.resolve(body) };
}

type HandlerInfo = { method: string; path: string };
type Handler = {
  info: HandlerInfo;
  resolver: (ctx: { request: unknown; params?: unknown }) => Promise<unknown>;
};

/** Finds a handler by HTTP method and path suffix. */
function findHandler(
  handlers: Handler[],
  method: string,
  pathSuffix: string,
): Handler {
  const handler = handlers.find(
    (h) => h.info.method === method && h.info.path.endsWith(pathSuffix),
  );
  if (!handler) {
    throw new Error(`No handler for ${method} …${pathSuffix}`);
  }
  return handler;
}

beforeEach(() => {
  sourcesDb.reset();
  jsonSpy.mockClear();
});

describe('createSourcesHandlers', () => {
  it('returns handlers including source and application POST routes', () => {
    const handlers = createSourcesHandlers();
    const routes = handlers.map(
      (h) =>
        `${(h.info as HandlerInfo).method} ${(h.info as HandlerInfo).path}`,
    );

    expect(routes).toContain('POST /api/sources/v3.1/sources');
    expect(routes).toContain('POST /api/sources/v3.1/applications');
  });

  it('source POST resolver stores the source in sourcesDb and returns 201', async () => {
    const handlers = createSourcesHandlers() as unknown as Handler[];
    const handler = findHandler(handlers, 'POST', '/sources');

    const before = sourcesDb.findAll().length;

    await handler.resolver({
      request: fakeRequest({
        name: 'resolver-test',
        source_type_id: '2',
      }),
    });

    expect(sourcesDb.findAll()).toHaveLength(before + 1);

    const created = sourcesDb.findAll().find((s) => s.name === 'resolver-test');
    expect(created).toBeDefined();
    expect(created?.source_type_id).toBe('2');

    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'resolver-test' }),
      { status: 201 },
    );
  });

  it('application POST resolver appends the association to the source and returns 201', async () => {
    const handlers = createSourcesHandlers() as unknown as Handler[];
    const sourceHandler = findHandler(handlers, 'POST', '/sources');
    const appHandler = findHandler(handlers, 'POST', '/applications');

    // Create a source first
    await sourceHandler.resolver({
      request: fakeRequest({
        name: 'app-test-source',
        source_type_id: '1',
      }),
    });

    const source = sourcesDb
      .findAll()
      .find((s) => s.name === 'app-test-source')!;

    // Associate an application
    await appHandler.resolver({
      request: fakeRequest({
        source_id: source.id,
        application_type_id: '3',
      }),
    });

    const updated = sourcesDb.findById(source.id)!;
    expect(updated.applications).toContainEqual(
      expect.objectContaining({ application_type_id: '3' }),
    );

    expect(jsonSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ application_type_id: '3' }),
      { status: 201 },
    );
  });
});

describe('sourcesDb', () => {
  it('stores a new source and makes it retrievable by id', () => {
    const before = sourcesDb.findAll().length;
    const source = {
      id: 'src-test',
      name: 'test-source',
      source_type_id: '2',
      created_at: new Date().toISOString(),
      availability_status: 'in_progress' as const,
      applications: [],
    };

    sourcesDb.create(source);

    expect(sourcesDb.findAll()).toHaveLength(before + 1);
    expect(sourcesDb.findById('src-test')).toMatchObject({
      name: 'test-source',
      source_type_id: '2',
      availability_status: 'in_progress',
    });
  });

  it('appending an application association to a source is reflected in findById', () => {
    const sourceId = sourcesDb.findAll()[0].id;
    const source = sourcesDb.findById(sourceId)!;
    const appsBefore = source.applications?.length ?? 0;

    source.applications = [
      ...(source.applications ?? []),
      {
        id: 'app-test',
        application_type_id: '1',
        availability_status: 'available',
      },
    ];

    const updated = sourcesDb.findById(sourceId);
    expect(updated?.applications).toHaveLength(appsBefore + 1);
    expect(updated?.applications).toContainEqual(
      expect.objectContaining({
        id: 'app-test',
        application_type_id: '1',
      }),
    );
  });

  it('resets to seed data between tests', () => {
    sourcesDb.create({
      id: 'src-ephemeral',
      name: 'ephemeral',
      source_type_id: '1',
      created_at: new Date().toISOString(),
      applications: [],
    });
    const withExtra = sourcesDb.findAll().length;

    sourcesDb.reset();

    expect(sourcesDb.findAll().length).toBeLessThan(withExtra);
    expect(sourcesDb.findById('src-ephemeral')).toBeUndefined();
  });
});
