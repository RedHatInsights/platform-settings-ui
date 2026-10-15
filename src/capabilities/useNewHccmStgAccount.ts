import { createContext, useContext, useEffect, useState } from 'react';
import type { Context } from 'react';
import { FlagContext, useFlag } from '@unleash/proxy-client-react';

type FlagApi = {
  isEnabled: (name: string) => boolean;
  on: (event: string, listener: () => void) => unknown;
  off: (event: string, listener: () => void) => unknown;
};

const FLAG_NAME = 'platform.sources.integrations.new-hccm-stg-account';
const NO_FLAG_CONTEXT = createContext<FlagApi | null>(null);
const flagContext = FlagContext as unknown as
  | Context<FlagApi | null>
  | undefined;

function useConfiguredFlag(flagName: string) {
  const flags = useContext(flagContext ?? NO_FLAG_CONTEXT);
  const [enabled, setEnabled] = useState(
    () => flags?.isEnabled(flagName) ?? false,
  );

  useEffect(() => {
    if (!flags) {
      setEnabled(false);
      return;
    }

    const update = () => setEnabled(flags.isEnabled(flagName));
    update();
    flags.on('update', update);
    flags.on('ready', update);

    return () => {
      flags.off('update', update);
      flags.off('ready', update);
    };
  }, [flags, flagName]);

  return enabled;
}

// Storybook's Unleash mock exposes useFlag but not FlagContext.
const useFlagValue = flagContext ? useConfiguredFlag : useFlag;

export function useNewHccmStgAccount() {
  return useFlagValue(FLAG_NAME);
}
