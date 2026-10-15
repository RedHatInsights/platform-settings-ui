import { renderHook } from '@testing-library/react';
import { FlagContext } from '@unleash/proxy-client-react';
import type { ReactNode } from 'react';
import { useNewHccmStgAccount } from './useNewHccmStgAccount';

it('defaults to disabled when the host does not provide feature flags', () => {
  expect(renderHook(useNewHccmStgAccount).result.current).toBe(false);
});

it('reads the staging-account flag when the host provides feature flags', () => {
  const flags = {
    isEnabled: jest.fn().mockReturnValue(true),
    on: jest.fn(),
    off: jest.fn(),
  };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <FlagContext.Provider value={flags as never}>
      {children}
    </FlagContext.Provider>
  );

  expect(renderHook(useNewHccmStgAccount, { wrapper }).result.current).toBe(
    true,
  );
  expect(flags.isEnabled).toHaveBeenCalledWith(
    'platform.sources.integrations.new-hccm-stg-account',
  );
});
