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

  it('reads HCS enrollment from billing', async () => {
    const get = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { hcsDeal: true } });
    const api = createSourcesApi({ get } as unknown as AxiosInstance);

    await expect(api.getHcsEnrollment()).resolves.toBe(true);
    expect(get).toHaveBeenCalledWith(
      'https://console.stage.redhat.com/api/billing/v1/authorization/hcsEnrollment',
    );
  });

  it('uses the production console for HCS enrollment', async () => {
    const get = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { hcsDeal: false } });
    const api = createSourcesApi({ get } as unknown as AxiosInstance);

    await expect(api.getHcsEnrollment(true)).resolves.toBe(false);
    expect(get).toHaveBeenCalledWith(
      'https://console.redhat.com/api/billing/v1/authorization/hcsEnrollment',
    );
  });

  it('treats an unavailable enrollment response as not enrolled', async () => {
    const get = jest.fn().mockResolvedValue({ status: 503 });
    const api = createSourcesApi({ get } as unknown as AxiosInstance);

    await expect(api.getHcsEnrollment()).resolves.toBe(false);
  });

  it('treats an enrollment request failure as not enrolled', async () => {
    const get = jest.fn().mockRejectedValue(new Error('billing unavailable'));
    const api = createSourcesApi({ get } as unknown as AxiosInstance);

    await expect(api.getHcsEnrollment()).resolves.toBe(false);
  });

  it('checks whether an exact source name is already taken', async () => {
    mockApi.postGraphQL = jest.fn().mockResolvedValue({
      data: { data: { sources: [{ id: 'src-1', name: 'existing' }] } },
    });
    const api = createSourcesApi({} as AxiosInstance);

    await expect(api.isSourceNameTaken('existing')).resolves.toBe(true);
    expect(mockApi.postGraphQL).toHaveBeenCalledWith({
      graphQLRequest: {
        query: `{ sources(filter: {name: "name", value: "existing"})
        { id, name }
    }`,
      },
    });
  });

  it('reports an available source name when the exact lookup is empty', async () => {
    mockApi.postGraphQL = jest.fn().mockResolvedValue({
      data: { data: { sources: [] } },
    });
    const api = createSourcesApi({} as AxiosInstance);

    await expect(api.isSourceNameTaken('new')).resolves.toBe(false);
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
      const post = jest
        .fn()
        .mockResolvedValue({ data: { sources: [created] } });

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
      expect(post).toHaveBeenCalledWith(
        '/api/sources/v3.1/sources/src-1/check_availability',
      );
      expect(result).toEqual(created);
    });

    it('keeps a created source successful if the availability check fails', async () => {
      const created = { id: 'src-1', name: 'my-source' };
      const post = jest
        .fn()
        .mockResolvedValueOnce({ data: { sources: [created] } })
        .mockRejectedValueOnce(new Error('availability failed'));

      await expect(
        createSourcesApi({ post } as unknown as AxiosInstance).createSource(
          input,
        ),
      ).resolves.toEqual(created);
    });

    it('waits for cost application availability after creation', async () => {
      jest.useFakeTimers();
      try {
        const created = { id: 'src-1', name: 'my-source' };
        const post = jest
          .fn()
          .mockResolvedValueOnce({
            data: {
              sources: [created],
              applications: [{ id: 'app-1', application_type_id: '3' }],
            },
          })
          .mockResolvedValueOnce({ data: {} });
        const get = jest
          .fn()
          .mockResolvedValueOnce({
            data: { availability_status: 'in_progress' },
          })
          .mockResolvedValueOnce({
            data: { availability_status: 'available' },
          });
        const api = createSourcesApi({ post, get } as unknown as AxiosInstance);

        const result = api.createSource({
          ...input,
          availabilityWaitApplicationTypeIds: ['3'],
        });
        await jest.advanceTimersByTimeAsync(1000);

        await expect(result).resolves.toEqual(created);
        expect(get).toHaveBeenCalledTimes(2);
        expect(get).toHaveBeenCalledWith(
          '/api/sources/v3.1/applications/app-1',
        );
      } finally {
        jest.useRealTimers();
      }
    });

    it('checks other applications once without waiting', async () => {
      const created = { id: 'src-1', name: 'my-source' };
      const post = jest.fn().mockResolvedValue({
        data: {
          sources: [created],
          applications: [{ id: 'app-2', application_type_id: '4' }],
        },
      });
      const get = jest.fn().mockResolvedValue({
        data: { availability_status: 'in_progress' },
      });

      await expect(
        createSourcesApi({
          post,
          get,
        } as unknown as AxiosInstance).createSource({
          ...input,
          availabilityWaitApplicationTypeIds: ['3'],
        }),
      ).resolves.toEqual(created);
      expect(get).toHaveBeenCalledTimes(1);
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

    it('binds a manual AWS role to exactly one application', async () => {
      const post = jest
        .fn()
        .mockResolvedValue({ data: { sources: [{ id: 'src-1' }] } });

      const api = createSourcesApi({ post } as unknown as AxiosInstance);
      await api.createSource({
        ...input,
        appCreationWorkflow: 'manual_configuration',
        authentication: {
          authtype: 'arn',
          username: 'arn:aws:iam::123:role/CostManagement',
          extra: { external_id: 'uuid' },
        },
        manualApplication: {
          id: '1',
          name: '/insights/platform/cost-management',
          extra: { bucket: 'cost-bucket', bucket_region: 'us-east-1' },
        },
      });

      expect(post.mock.calls[0][1]).toEqual({
        sources: [
          {
            name: 'my-source',
            source_type_name: 'amazon',
            app_creation_workflow: 'manual_configuration',
          },
        ],
        endpoints: [],
        authentications: [
          {
            authtype: 'arn',
            username: 'arn:aws:iam::123:role/CostManagement',
            extra: { external_id: 'uuid' },
            resource_type: 'application',
            resource_name: '/insights/platform/cost-management',
          },
        ],
        applications: [
          {
            application_type_id: '1',
            source_name: 'my-source',
            extra: { bucket: 'cost-bucket', bucket_region: 'us-east-1' },
          },
        ],
      });
    });

    it('binds an OpenShift token to the parsed cluster endpoint', async () => {
      const post = jest
        .fn()
        .mockResolvedValue({ data: { sources: [{ id: 'src-1' }] } });
      await createSourcesApi({ post } as unknown as AxiosInstance).createSource(
        {
          name: 'cluster',
          sourceTypeName: 'openshift',
          authentication: { authtype: 'token', password: 'secret-token' },
          endpoint: {
            role: 'kubernetes',
            url: 'https://api.example.com:6443/path',
            verify_ssl: true,
          },
        },
      );

      const payload = post.mock.calls[0][1];
      expect(payload.endpoints).toEqual([
        expect.objectContaining({
          source_name: 'cluster',
          role: 'kubernetes',
          scheme: 'https',
          host: 'api.example.com',
          port: 6443,
          path: '/path',
          verify_ssl: true,
        }),
      ]);
      expect(payload.authentications).toEqual([
        expect.objectContaining({
          resource_type: 'endpoint',
          resource_name: 'api.example.com',
        }),
      ]);
    });

    it('links endpoint authentication to the selected application', async () => {
      const created = { id: 'src-1', name: 'azure-cost' };
      const post = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            sources: [created],
            applications: [{ id: 'app-1', application_type_id: '1' }],
            authentications: [{ id: 'auth-1' }],
          },
        })
        .mockResolvedValue({ data: {} });

      await createSourcesApi({ post } as unknown as AxiosInstance).createSource(
        {
          name: 'azure-cost',
          sourceTypeName: 'azure',
          endpoint: { url: 'https://management.azure.com' },
          selectedApplication: {
            id: '1',
            name: '/insights/platform/cost-management',
          },
          authentication: {
            authtype: 'tenant_id_client_id_client_secret',
            username: 'client',
            password: 'secret',
          },
        },
      );

      expect(post).toHaveBeenNthCalledWith(
        2,
        '/api/sources/v3.1/application_authentications',
        { application_id: 'app-1', authentication_id: 'auth-1' },
      );
    });

    it('creates OpenShift Cost Management without an endpoint', async () => {
      const post = jest
        .fn()
        .mockResolvedValue({ data: { sources: [{ id: 'src-1' }] } });
      await createSourcesApi({ post } as unknown as AxiosInstance).createSource(
        {
          name: 'cluster-cost',
          sourceTypeName: 'openshift',
          sourceRef: 'cluster_id',
          selectedApplication: {
            id: '1',
            name: '/insights/platform/cost-management',
          },
          authentication: { authtype: 'token' },
        },
      );

      const payload = post.mock.calls[0][1];
      expect(payload.sources[0].source_ref).toBe('cluster_id');
      expect(payload.endpoints).toEqual([]);
      expect(payload.authentications[0]).toEqual(
        expect.objectContaining({
          resource_type: 'application',
          resource_name: '/insights/platform/cost-management',
        }),
      );
    });

    it('sends Azure tenant ID in authentication.extra and skips empty Google RHEL auth', async () => {
      const post = jest
        .fn()
        .mockResolvedValue({ data: { sources: [{ id: 'src-1' }] } });
      const api = createSourcesApi({ post } as unknown as AxiosInstance);
      await api.createSource({
        name: 'azure-cost',
        sourceTypeName: 'azure',
        selectedApplication: {
          id: '1',
          name: '/insights/platform/cost-management',
          extra: { subscription_id: 'sub' },
        },
        authentication: {
          authtype: 'tenant_id_client_id_client_secret',
          username: 'client',
          password: 'secret',
          extra: { azure: { tenant_id: 'tenant' } },
        },
      });
      expect(post.mock.calls[0][1].authentications[0]).toEqual(
        expect.objectContaining({
          resource_type: 'application',
          extra: { azure: { tenant_id: 'tenant' } },
        }),
      );

      await api.createSource({
        name: 'google-rhel',
        sourceTypeName: 'google',
        selectedApplication: {
          id: '2',
          name: '/insights/platform/cloud-meter',
        },
        authentication: { authtype: 'empty' },
      });
      expect(post.mock.calls[2][1].authentications).toEqual([]);
    });

    it('selects the billing-export Google service account metadata', async () => {
      const get = jest.fn().mockResolvedValue({
        data: {
          data: [
            { payload: 'provisioning@example.iam.gserviceaccount.com' },
            { payload: 'billing-export@example.iam.gserviceaccount.com' },
          ],
        },
      });

      await expect(
        createSourcesApi({
          get,
        } as unknown as AxiosInstance).getGoogleBillingAccount(),
      ).resolves.toBe('billing-export@example.iam.gserviceaccount.com');
    });

    it('rejects an incomplete manual payload before posting', async () => {
      const post = jest.fn();
      const api = createSourcesApi({ post } as unknown as AxiosInstance);

      await expect(
        api.createSource({
          ...input,
          appCreationWorkflow: 'manual_configuration',
        }),
      ).rejects.toThrow(
        'Manual configuration requires an application and role ARN',
      );
      expect(post).not.toHaveBeenCalled();
    });

    it('propagates a rejection from axios', async () => {
      const error = new Error('Source creation failed');
      const post = jest.fn().mockRejectedValue(error);

      const api = createSourcesApi({ post } as unknown as AxiosInstance);

      await expect(api.createSource(input)).rejects.toThrow(error);
    });
  });
});
