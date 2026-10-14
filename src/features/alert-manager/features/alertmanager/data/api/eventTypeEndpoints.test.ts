import type { AxiosInstance } from 'axios';
import type { EndpointInfo } from '../../types';
import {
  extractNotifiersByEventType,
  fetchEndpoints,
} from './eventTypeEndpoints';

const mockApi: Record<string, jest.Mock> = {};
jest.mock('@redhat-cloud-services/javascript-clients-shared/utils', () => ({
  APIFactory: () => mockApi,
}));

const fakeAxios = {} as AxiosInstance;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('fetchEndpoints', () => {
  it('fetches endpoints in valid pages', async () => {
    const endpoint = {
      id: 'endpoint-1',
      type: 'email_subscription',
      name: 'Email',
      enabled: true,
    } satisfies EndpointInfo;
    mockApi.endpointResourceV3GetEndpoints = jest
      .fn()
      .mockResolvedValueOnce({ data: { data: [endpoint], meta: { count: 2 } } })
      .mockResolvedValueOnce({
        data: { data: [endpoint], meta: { count: 2 } },
      });

    await expect(fetchEndpoints(fakeAxios)).resolves.toEqual([
      endpoint,
      endpoint,
    ]);
    expect(mockApi.endpointResourceV3GetEndpoints).toHaveBeenNthCalledWith(1, {
      limit: 200,
      offset: 0,
      active: true,
    });
    expect(mockApi.endpointResourceV3GetEndpoints).toHaveBeenNthCalledWith(2, {
      limit: 200,
      offset: 1,
      active: true,
    });
  });
});

describe('extractNotifiersByEventType', () => {
  it('maps enabled endpoint types to linked event types without duplicates', () => {
    const endpoints: EndpointInfo[] = [
      {
        id: 'email-1',
        type: 'email_subscription',
        name: 'Email',
        enabled: true,
        event_types_group_by_bundles_and_applications: [
          {
            applications: [
              { event_types: [{ id: 'event-1' }, { id: 'event-2' }] },
            ],
          },
        ],
      },
      {
        id: 'slack-1',
        type: 'camel',
        sub_type: 'slack',
        name: 'Slack',
        enabled: true,
        event_types_group_by_bundles_and_applications: [
          { applications: [{ event_types: [{ id: 'event-1' }] }] },
        ],
      },
      {
        id: 'slack-2',
        type: 'camel',
        sub_type: 'slack',
        name: 'Slack duplicate',
        enabled: true,
        event_types_group_by_bundles_and_applications: [
          { applications: [{ event_types: [{ id: 'event-1' }] }] },
        ],
      },
      {
        id: 'disabled-1',
        type: 'webhook',
        name: 'Disabled webhook',
        enabled: false,
        event_types_group_by_bundles_and_applications: [
          { applications: [{ event_types: [{ id: 'event-1' }] }] },
        ],
      },
    ];

    expect(Array.from(extractNotifiersByEventType(endpoints))).toEqual([
      [
        'event-1',
        [{ type: 'email_subscription' }, { type: 'camel', subType: 'slack' }],
      ],
      ['event-2', [{ type: 'email_subscription' }]],
    ]);
  });
});
