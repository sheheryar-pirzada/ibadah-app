import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_DHIKR_ID, TasbeehTarget, TASBEEH_TARGETS } from '@/constants/tasbeeh';

export interface TasbeehSession {
  id: string;
  count: number;
  target: TasbeehTarget;
  dhikr: string;
  completedAt: string;
}

export interface TasbeehState {
  // Current session state
  currentCount: number;
  currentTarget: TasbeehTarget;
  currentDhikr: string;

  // Historical data
  sessions: TasbeehSession[];
  totalLifetimeCount: number;

  // Settings
  hapticEnabled: boolean;

  // Actions
  increment: () => boolean; // Returns true if target was reached
  reset: () => void;
  setTarget: (target: TasbeehTarget) => void;
  setDhikr: (dhikr: string) => void;
  toggleHaptic: () => void;
}

export const useTasbeehStore = create<TasbeehState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCount: 0,
      currentTarget: 33,
      currentDhikr: DEFAULT_DHIKR_ID,
      sessions: [],
      totalLifetimeCount: 0,
      hapticEnabled: true,

      // Increment counter, returns true if target reached
      increment: () => {
        const { currentCount, currentTarget, currentDhikr, sessions, totalLifetimeCount } = get();
        const newCount = currentCount + 1;
        const targetReached = newCount >= currentTarget;

        if (targetReached) {
          // Save completed session
          const newSession: TasbeehSession = {
            id: Date.now().toString(),
            count: newCount,
            target: currentTarget,
            dhikr: currentDhikr,
            completedAt: new Date().toISOString(),
          };

          set({
            currentCount: 0, // Reset for next round
            sessions: [newSession, ...sessions].slice(0, 50), // Keep last 50 sessions
            totalLifetimeCount: totalLifetimeCount + 1,
          });
        } else {
          set({
            currentCount: newCount,
            totalLifetimeCount: totalLifetimeCount + 1,
          });
        }

        return targetReached;
      },

      // Reset current count to 0
      reset: () => set({ currentCount: 0 }),

      // Set new target (also resets count)
      setTarget: (target: TasbeehTarget) => {
        if (TASBEEH_TARGETS.includes(target)) {
          set({ currentTarget: target, currentCount: 0 });
        }
      },

      // Set current dhikr phrase (resets count when switching to a different dhikr)
      setDhikr: (dhikr: string) => {
        const { currentDhikr } = get();
        if (currentDhikr === dhikr) {
          set({ currentDhikr: dhikr });
        } else {
          set({ currentDhikr: dhikr, currentCount: 0 });
        }
      },

      // Toggle haptic feedback
      toggleHaptic: () => set({ hapticEnabled: !get().hapticEnabled }),
    }),
    {
      name: 'tasbeeh-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentTarget: state.currentTarget,
        currentDhikr: state.currentDhikr,
        sessions: state.sessions,
        totalLifetimeCount: state.totalLifetimeCount,
        hapticEnabled: state.hapticEnabled,
        // Note: currentCount is intentionally NOT persisted
        // so each app open starts fresh
      }),
    }
  )
);
