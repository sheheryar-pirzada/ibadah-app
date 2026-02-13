import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
  getBackgroundSettings,
  type BackgroundKey,
} from '@/utils/background-settings';

interface BackgroundContextValue {
  /** Current background preference (solid or grain1/2/3). */
  backgroundKey: BackgroundKey;
  /** Re-fetch preference from storage (e.g. after user changes it in settings). */
  refreshBackgroundPreference: () => Promise<void>;
}

export const BackgroundContext = createContext<BackgroundContextValue | undefined>(undefined);

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  const [backgroundKey, setBackgroundKey] = useState<BackgroundKey>('solid');

  const refreshBackgroundPreference = useCallback(async () => {
    try {
      const settings = await getBackgroundSettings();
      setBackgroundKey(settings.key);
    } catch (error) {
      console.error('Error loading background preference:', error);
    }
  }, []);

  useEffect(() => {
    refreshBackgroundPreference();
  }, [refreshBackgroundPreference]);

  return (
    <BackgroundContext.Provider
      value={{
        backgroundKey,
        refreshBackgroundPreference,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
