import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createCliServices } from '../../../../shared/AppServices.cli';
import { ServiceProvider } from '../../../../shared/ServiceContext';
import { useAwsRegions } from './useAwsRegions';
import { useHcsEnrollment } from './useHcsEnrollment';
import { useAwsProvisioningAccount } from './useAwsProvisioningAccount';

function setup() {
  const services = createCliServices();
  const get = jest.spyOn(services.axios, 'get');
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <ServiceProvider value={services}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ServiceProvider>
  );
  return { get, wrapper };
}

describe('useAwsRegions', () => {
  it('does not fetch when disabled', () => {
    const { get, wrapper } = setup();
    const { result } = renderHook(() => useAwsRegions(false), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(get).not.toHaveBeenCalled();
  });

  it('returns regions from the API', async () => {
    const { get, wrapper } = setup();
    get.mockResolvedValue({
      data: { meta: { count: 1 }, data: ['us-east-1'] },
    });
    const { result } = renderHook(() => useAwsRegions(true), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(['us-east-1']));
    expect(get).toHaveBeenCalledWith(
      '/api/cost-management/v1/sources/aws-s3-regions/?limit=10000&offset=0',
    );
  });

  it('reports request failure', async () => {
    const { get, wrapper } = setup();
    get.mockRejectedValue(new Error('regions unavailable'));
    const { result } = renderHook(() => useAwsRegions(true), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('regions unavailable'));
  });
});

describe('useHcsEnrollment', () => {
  it('does not fetch when disabled', () => {
    const { get, wrapper } = setup();
    const { result } = renderHook(() => useHcsEnrollment(false), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(get).not.toHaveBeenCalled();
  });

  it.each([true, false])('returns enrollment %s', async (enrolled) => {
    const { get, wrapper } = setup();
    get.mockResolvedValue({ status: 200, data: { hcsDeal: enrolled } });
    const { result } = renderHook(() => useHcsEnrollment(true), { wrapper });
    await waitFor(() => expect(result.current.data).toBe(enrolled));
    expect(get).toHaveBeenCalledWith(
      'https://console.stage.redhat.com/api/billing/v1/authorization/hcsEnrollment',
    );
  });

  it('treats request failure as not enrolled without retrying', async () => {
    const { get, wrapper } = setup();
    get.mockRejectedValue(new Error('enrollment unavailable'));
    const { result } = renderHook(() => useHcsEnrollment(true), { wrapper });
    await waitFor(() => expect(result.current.data).toBe(false));
    expect(result.current.isError).toBe(false);
    expect(get).toHaveBeenCalledTimes(1);
  });
});

describe('useAwsProvisioningAccount', () => {
  it('fetches only when enabled and uses the application type', async () => {
    const { get, wrapper } = setup();
    get.mockResolvedValue({ data: { data: [{ payload: '012345678901' }] } });
    const { result, rerender } = renderHook(
      ({ enabled }) => useAwsProvisioningAccount('3', enabled),
      { initialProps: { enabled: false }, wrapper },
    );
    expect(get).not.toHaveBeenCalled();
    rerender({ enabled: true });
    await waitFor(() => expect(result.current.data).toBe('012345678901'));
    expect(get).toHaveBeenCalledWith(
      '/api/sources/v3.1/app_meta_data?filter[name]=aws_wizard_account_number&application_type_id=3',
    );
  });
});
