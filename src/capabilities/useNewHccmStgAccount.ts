import { useFlag } from '@unleash/proxy-client-react';

export function useNewHccmStgAccount() {
  return useFlag('platform.sources.integrations.new-hccm-stg-account');
}
