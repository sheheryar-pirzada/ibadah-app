import React, { createContext, useContext, useEffect, useState } from 'react';

import type { TranslationResource } from '@/utils/quran-api';
import { getTranslationSettings, updateTranslation } from '@/utils/translation-settings';

interface TranslationContextValue {
  translationId: number;
  translationName: string;
  languageName?: string;
  setTranslation: (t: Pick<TranslationResource, 'id' | 'name' | 'language_name'>) => Promise<void>;
  reloadTranslationSettings: () => Promise<void>;
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [translationId, setTranslationId] = useState<number>(85);
  const [translationName, setTranslationName] = useState<string>('M.A.S. Abdel Haleem');
  const [languageName, setLanguageName] = useState<string | undefined>('English');

  const reloadTranslationSettings = async () => {
    try {
      const settings = await getTranslationSettings();
      setTranslationId(settings.translationId);
      setTranslationName(settings.translationName);
      setLanguageName(settings.languageName);
    } catch (error) {
      console.error('Error loading translation settings:', error);
    }
  };

  useEffect(() => {
    reloadTranslationSettings();
  }, []);

  const setTranslation = async (t: Pick<TranslationResource, 'id' | 'name' | 'language_name'>) => {
    await updateTranslation({
      translationId: t.id,
      translationName: t.name,
      languageName: t.language_name,
    });
    // update local state immediately so app reacts
    setTranslationId(t.id);
    setTranslationName(t.name);
    setLanguageName(t.language_name);
  };

  return (
    <TranslationContext.Provider
      value={{
        translationId,
        translationName,
        languageName,
        setTranslation,
        reloadTranslationSettings,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return ctx;
}

