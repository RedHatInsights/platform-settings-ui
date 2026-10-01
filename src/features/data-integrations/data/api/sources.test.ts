import type { AxiosInstance } from 'axios';
import { createSourcesApi } from './sources';

/**
 * Mock the APIFactory so each test controls what the generated client returns.
 * The factory is called once per `createSourcesApi` invocation and the returned
 * object is used for every API call within that instance.
 */
const mockApi: Record<string, jest.Mock> = {};
jest.mock('@redhat-cloud-services/javascript-clients-shared/utils', () => ({
  APIFactory: () => mockApi,
}));

describe('createSourcesApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createSource', () => {
    const input = {
      name: 'my-source',
      sourceTypeName: 'amazon',
      authentication: {
        authtype: 'access_key_secret_key' as const,
        username: 'AKIA',
        password: 'secret',
      },
      applicationTypeIds: ['3', '4'],
    };

    it('posts one bulk create binding the authentication and applications to the source', async () => {
      const created = { id: 'src-1', name: 'my-source', source_type_id: '2' };
      const post = jest.fn().mockResolvedValue({ data: { sources: [created] } });

      const api = createSourcesApi({ post } as unknown as AxiosInstance);
      const result = await api.createSource(input);

      expect(post).toHaveBeenCalledWith('/api/sources/v3.1/bulk_create', {
        sources: [{ name: 'my-source', source_type_name: 'amazon' }],
        endpoints: [],
        authentications: [
          {
            authtype: 'access_key_secret_key',
            username: 'AKIA',
            password: 'secret',
            resource_type: 'source',
            resource_name: 'my-source',
          },
        ],
        applications: [
          { application_type_id: '3', source_name: 'my-source' },
          { application_type_id: '4', source_name: 'my-source' },
        ],
      });
      expect(result).toEqual(created);
    });

    it('sends an empty applications array when none were selected', async () => {
      const post = jest
        .fn()
        .mockResolvedValue({ data: { sources: [{ id: 'src-1' }] } });

      const api = createSourcesApi({ post } as unknown as AxiosInstance);
      await api.createSource({ ...input, applicationTypeIds: undefined });

      expect(post.mock.calls[0][1].applications).toEqual([]);
    });

    it('throws when the response carries no source', async () => {
      const post = jest.fn().mockResolvedValue({ data: { sources: [] } });

      const api = createSourcesApi({ post } as unknown as AxiosInstance);

      await expect(api.createSource(input)).rejects.toThrow(
        'Sources bulk create returned no source',
      );
    });

    it('propagates a rejection from axios', async () => {
      const error = new Error('Source creation failed');
      const post = jest.fn().mockRejectedValue(error);

      const api = createSourcesApi({ post } as unknown as AxiosInstance);

      await expect(api.createSource(input)).rejects.toThrow(error);
    });
  });
});
