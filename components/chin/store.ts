import { useCallback } from 'react';
import { type SharedValue, makeMutable } from 'react-native-reanimated';
import { create } from 'zustand';
import { audioManager } from '@/utils/audio-service';

export interface ChinState {
  displayChin: SharedValue<boolean>;
  content: React.ReactNode | null;
  isVisible: boolean;
}

export const useChinStore = create<ChinState>(() => ({
  displayChin: makeMutable(false),
  content: null,
  isVisible: false,
}));

export function useChin() {
  const store = useChinStore();

  const show = useCallback(
    (content: React.ReactNode) => {
      useChinStore.setState((state) => ({
        ...state,
        content,
        isVisible: true,
      }));
      store.displayChin.value = true;
    },
    [store.displayChin]
  );

  const hide = useCallback(() => {
    audioManager.stopAll();
    useChinStore.setState((state) => ({
      ...state,
      isVisible: false,
    }));
    store.displayChin.value = false;
  }, [store.displayChin]);

  const toggle = useCallback(
    (content: React.ReactNode) => {
      if (store.isVisible) {
        hide();
      } else {
        show(content);
      }
    },
    [store.isVisible, show, hide]
  );

  return {
    show,
    hide,
    toggle,
    displayChin: store.displayChin,
    isVisible: store.isVisible,
    content: store.content,
  };
}
