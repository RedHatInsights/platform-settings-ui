import { renderHook } from '@testing-library/react';
import { useAzureLighthouse } from './useAzureLighthouse';

it('defaults to disabled when the host does not provide feature flags', () => {
  expect(renderHook(useAzureLighthouse).result.current).toBe(false);
});
