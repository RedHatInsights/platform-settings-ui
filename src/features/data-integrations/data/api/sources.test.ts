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

const fakeAxios = {} as AxiosInstance;

describe('createSourcesApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createSource', () => {
    it('sends the input wrapped in a source key and returns the response data', async () => {
      const created = {
        id: 'src-1',
        name: 'my-source',
        source_type_id: '2',
        created_at: '2026-01-01T00:00:00Z',
      };
      mockApi.createSource = jest.fn().mockResolvedValue({ data: created });

      const api = createSourcesApi(fakeAxios);
      const result = await api.createSource({
        name: 'my-source',
        source_type_id: '2',
      });

      expect(mockApi.createSource).toHaveBeenCalledWith({
        source: { name: 'my-source', source_type_id: '2' },
      });
      expect(result).toEqual(created);
    });
  });

  describe('createApplication', () => {
    it('sends the input wrapped in an application key and returns the response data', async () => {
      const created = {
        id: 'app-1',
        source_id: 'src-1',
        application_type_id: '3',
        created_at: '2026-01-01T00:00:00Z',
      };
      mockApi.createApplication = jest
        .fn()
        .mockResolvedValue({ data: created });

      const api = createSourcesApi(fakeAxios);
      const result = await api.createApplication({
        source_id: 'src-1',
        application_type_id: '3',
      });

      expect(mockApi.createApplication).toHaveBeenCalledWith({
        application: { source_id: 'src-1', application_type_id: '3' },
      });
      expect(result).toEqual(created);
    });
  });
});
