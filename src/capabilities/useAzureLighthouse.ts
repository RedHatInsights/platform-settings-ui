import { useFlag } from '@unleash/proxy-client-react';

export function useAzureLighthouse() {
  return useFlag('sources.wizard.lighthouse');
}
