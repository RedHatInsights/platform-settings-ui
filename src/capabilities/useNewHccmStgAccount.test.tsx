import { renderHook } from '@testing-library/react';
import { useFlag } from '@unleash/proxy-client-react';
import { useNewHccmStgAccount } from './useNewHccmStgAccount';

jest.mock('@unleash/proxy-client-react', () => ({ useFlag: jest.fn() }));

it.each([true, false])(
  'returns the staging-account flag when it is %s',
  (enabled) => {
    jest.mocked(useFlag).mockReturnValue(enabled);

    expect(renderHook(useNewHccmStgAccount).result.current).toBe(enabled);
    expect(useFlag).toHaveBeenCalledWith(
      'platform.sources.integrations.new-hccm-stg-account',
    );
  },
);
