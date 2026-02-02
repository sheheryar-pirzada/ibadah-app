import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Available dhikr targets
export const TASBEEH_TARGETS = [33, 99, 100] as const;
export type TasbeehTarget = (typeof TASBEEH_TARGETS)[number];

// Bead configuration
export const BEAD_CONFIG = {
  count: 3, // Number of visible beads on left side
  size: 48, // Bead diameter in pixels
  spacing: 0.07, // Spacing between beads (in t-parameter)
  staticBeadsStartT: 0.12, // Where static beads start (leftmost)
  restingStartT: 0.26, // Where draggable bead rests (3rd position: 0.12 + 2*0.07)
  countingThresholdT: 0.88, // When bead counts as "pulled"
  resetPositionT: 0.22, // Where bead returns after counting (just right of static beads)
};

// String path configuration (quadratic bezier)
// Note: Y coordinates use fixed values since canvas doesn't fill full screen
export const STRING_CONFIG = {
  // Start point: left side
  startX: SCREEN_WIDTH * 0.08,
  startY: 180,

  // End point: right side (same Y for horizontal path)
  endX: SCREEN_WIDTH * 0.92,
  endY: 180,

  // Control point: center, slightly below for gentle downward curve
  controlX: SCREEN_WIDTH * 0.5,
  controlY: 220,

  // String styling
  strokeWidth: 5,
  shadowOffset: 3,
};

// Colors for the tasbeeh
export const TASBEEH_COLORS = {
  string: {
    light: '#8B7355', // Warm brown rope
    dark: '#A0906B', // Lighter brown for dark mode
    shadow: 'rgba(0,0,0,0.25)',
    highlight: 'rgba(255,255,255,0.2)',
  },
  bead: {
    fallback: '#F5F0E6', // Pearl/cream color for fallback circle
    shadow: 'rgba(0,0,0,0.35)',
    highlight: 'rgba(255,255,255,0.6)',
  },
  counter: {
    progress: '#d4af37', // Gold accent
    progressBg: 'rgba(255,255,255,0.15)',
  },
};

// Animation configuration
export const ANIMATION_CONFIG = {
  spring: {
    damping: 14,
    stiffness: 140,
    mass: 1,
  },
  timing: {
    countPulse: 150, // Duration of counter pulse animation
    beadReturn: 300, // Duration of bead return animation
  },
};

// Common dhikr phrases — id used in store, lookup by id or transliteration
export interface DhikrOption {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
}

export const DHIKR_OPTIONS: DhikrOption[] = [
  // Very common after salah (33/33/34)
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', meaning: 'Glory be to Allah' },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', meaning: 'All praise is for Allah' },
  { id: 'allahu-akbar', arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', meaning: 'Allah is the Greatest' },
  // Short, high-reward
  { id: 'subhanallahi-wa-bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'SubhanAllahi wa bihamdihi', meaning: 'Glory and praise be to Allah' },
  { id: 'subhanallahi-al-azeem', arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ', transliteration: 'SubhanAllahi al-Azeem', meaning: 'Glory be to Allah the Almighty' },
  // Core remembrance
  { id: 'la-ilaha-illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', meaning: 'There is no god but Allah' },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', meaning: 'I seek Allah’s forgiveness' },
  { id: 'hasbiallahu', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', transliteration: 'HasbiAllahu la ilaha illa Huwa', meaning: 'Allah is sufficient for me' },
  // Powerful combined
  { id: 'la-ilaha-illallahu-wahdahu', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', transliteration: 'La ilaha illallahu wahdahu la sharika lah…', meaning: 'None has the right to be worshipped but Allah, alone, without partner' },
  // Morning and evening
  { id: 'bismillahilladhi', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ', transliteration: 'Bismillahilladhi la yadurru ma‘asmih…', meaning: 'In the name of Allah with whose name nothing can harm' },
  { id: 'allahumma-bika-asbahna', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ', transliteration: 'Allahumma bika asbahna / amsayna…', meaning: 'O Allah, by You we enter the morning and evening' },
  // Simple everyday
  { id: 'la-hawla-wa-la-quwwata', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: 'La hawla wa la quwwata illa billah', meaning: 'There is no power nor strength except with Allah' },
];

export const DEFAULT_DHIKR_ID = DHIKR_OPTIONS[0].id;
