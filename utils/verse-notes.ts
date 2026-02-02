import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Verse key format: "surah:ayah" e.g. "1:2" */
export type VerseKey = string;

export interface VerseNote {
  verseKey: VerseKey;
  text: string;
}

interface VerseNotesState {
  /** Map verse_key -> note text */
  notes: Record<VerseKey, string>;
  getNote: (verseKey: VerseKey) => string;
  setNote: (verseKey: VerseKey, text: string) => void;
  removeNote: (verseKey: VerseKey) => void;
  hasNote: (verseKey: VerseKey) => boolean;
}

const STORAGE_KEY = 'verse-notes';

export const useVerseNotes = create<VerseNotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      getNote: (verseKey) => get().notes[verseKey] ?? '',
      setNote: (verseKey, text) =>
        set((state) => ({
          notes: {
            ...state.notes,
            [verseKey]: text,
          },
        })),
      removeNote: (verseKey) =>
        set((state) => {
          const { [verseKey]: _, ...rest } = state.notes;
          return { notes: rest };
        }),
      hasNote: (verseKey) => (get().notes[verseKey] ?? '').trim().length > 0,
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
