/**
 * Colors used in the app. Defined per theme: light, dark, and per grain background (grain1, grain2, grain3).
 * When the user selects a solid background, light/dark is used. When they select a grain image, the matching grain palette is used.
 */

const accentGold = '#d4af37';
const accentSilver = '#c0c0c0';
const darkGreen = '#0f3d2c';
const darkGreenLighter = '#1a5f3f';
const darkGreenCard = '#134832';

/** Shared color key set for every palette (light, dark, grain1, grain2, grain3). */
export type ColorSchemeKey = 'light' | 'dark' | 'grain1' | 'grain2' | 'grain3';

export const Colors = {
  light: {
    // Text colors
    text: '#046307', // Dark green
    textSecondary: '#2d5016',
    textMuted: '#5a7a4a',
    textInverse: '#ffffff',
    
    // Background colors
    background: '#F5F2E8', // Cream/ivory
    backgroundSecondary: '#FFFFFF', // Pure white for cards
    backgroundTertiary: '#F9F7F0', // Slightly darker cream
    
    // Accent colors
    accent: accentGold,
    accentDark: '#b8951f',
    accentLight: '#e5c859',
    
    // Border and divider colors
    border: 'rgba(4, 99, 7, 0.15)',
    borderLight: 'rgba(4, 99, 7, 0.08)',
    divider: 'rgba(4, 99, 7, 0.1)',
    
    // Card and surface colors
    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(4, 99, 7, 0.15)',
    
    // Tab bar
    tabBarBackground: '#FFFFFF',
    tabBarBorder: 'rgba(4, 99, 7, 0.1)',
    tabIconDefault: '#5a7a4a',
    tabIconSelected: accentGold,
    
    // Legacy compatibility
    tint: accentGold,
    icon: '#5a7a4a',
    backgroundPrimary: darkGreen,
    
    // Blur tint (for BlurView)
    blurTint: 'light' as const,
    
    // StatusBar style
    statusBarStyle: 'dark' as const,
  },
  dark: {
    // Text colors
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    textInverse: '#046307',
    
    // Background colors
    background: darkGreen, // Dark green
    backgroundSecondary: darkGreenLighter, // Slightly lighter dark green
    backgroundTertiary: '#0a2e1f', // Darker variant
    
    // Accent colors
    accent: accentGold,
    accentDark: '#b8951f',
    accentLight: '#e5c859',
    
    // Border and divider colors
    border: 'rgba(255, 255, 255, 0.15)',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    divider: 'rgba(255, 255, 255, 0.1)',
    
    // Card and surface colors
    cardBackground: darkGreenCard,
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    
    // Tab bar
    tabBarBackground: darkGreen,
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
    tabIconDefault: 'rgba(255, 255, 255, 0.7)',
    tabIconSelected: accentGold,
    
    // Legacy compatibility
    tint: '#FFFFFF',
    icon: 'rgba(255, 255, 255, 0.7)',
    backgroundPrimary: darkGreen,
    
    // Blur tint (for BlurView)
    blurTint: 'dark' as const,
    
    // StatusBar style
    statusBarStyle: 'light' as const,
  },

  // Grain backgrounds: palettes tuned for each grain image. Card/surface colors use transparency so the image shows through.
  "grain1": {
    "text": "#1B1412",
    "textSecondary": "rgba(27, 20, 18, 0.85)",
    "textMuted": "rgba(27, 20, 18, 0.6)",
    "textInverse": "#FFFFFF",

    "background": "#EFE6E1",
    "backgroundSecondary": "rgba(255, 250, 248, 0.75)",
    "backgroundTertiary": "rgba(243, 235, 231, 0.85)",
    "backgroundPrimary": "#3A2F33",

    "accent": "#2A1F23",
    "accentDark": "rgba(42, 31, 35, 0.9)",
    "accentLight": "rgba(42, 31, 35, 0.65)",

    "border": "rgba(42, 31, 35, 0.22)",
    "borderLight": "rgba(42, 31, 35, 0.12)",
    "divider": "rgba(42, 31, 35, 0.16)",

    "cardBackground": "transparent",
    "cardBorder": "transparent",

    "tabBarBackground": "rgba(255, 248, 245, 0.92)",
    "tabBarBorder": "rgba(42, 31, 35, 0.12)",
    "tabIconDefault": "rgba(27, 20, 18, 0.6)",
    "tabIconSelected": "#2A1F23",

    "tint": "#2A1F23",
    "icon": "rgba(27, 20, 18, 0.6)",

    "blurTint": "regular",
    "statusBarStyle": "dark"
  },
  // grain1: {
  //   // Black text palette for grain1 background
  //   text: '#000000',
  //   textSecondary: 'rgba(0, 0, 0, 0.85)',
  //   textMuted: 'rgba(0, 0, 0, 0.6)',
  //   textInverse: '#ffffff',
  //   background: '#F5F2E8',
  //   backgroundSecondary: 'rgba(255, 255, 255, 0.75)',
  //   backgroundTertiary: 'rgba(249, 247, 240, 0.85)',
  //   accent: '#000000',
  //   accentDark: 'rgba(0, 0, 0, 0.85)',
  //   accentLight: 'rgba(0, 0, 0, 0.7)',
  //   border: 'rgba(0, 0, 0, 0.2)',
  //   borderLight: 'rgba(0, 0, 0, 0.1)',
  //   divider: 'rgba(0, 0, 0, 0.15)',
  //   cardBackground: 'transparent',
  //   cardBorder: 'transparent',
  //   tabBarBackground: 'rgba(255, 255, 255, 0.9)',
  //   tabBarBorder: 'rgba(0, 0, 0, 0.12)',
  //   tabIconDefault: 'rgba(0, 0, 0, 0.6)',
  //   tabIconSelected: '#000000',
  //   tint: '#000000',
  //   icon: 'rgba(0, 0, 0, 0.6)',
  //   backgroundPrimary: darkGreen,
  //   blurTint: 'regular' as const,
  //   statusBarStyle: 'dark' as const,
  // },
  "grain2": {
    "text": "#2A1E14",
    "textSecondary": "#4A3526",
    "textMuted": "#6B5442",
    "textInverse": "#FFFFFF",

    "background": "#F6EAD9",
    "backgroundSecondary": "rgba(255, 248, 238, 0.72)",
    "backgroundTertiary": "rgba(245, 235, 222, 0.82)",
    "backgroundPrimary": "#8A5A2B",

    "accent": "#7A4A24",
    "accentDark": "#5E3518",
    "accentLight": "#9A6A3D",

    "border": "rgba(90, 50,  20, 0.28)",
    "borderLight": "rgba(90, 50,  Twenty, 0.14)",
    "divider": "rgba(90,  50,  20, 0.18)",

    "cardBackground": "rgba(255, 250, 242, 0.7)",
    "cardBorder": "transparent",

    "tabBarBackground": "rgba(255, 245, 235, 0.9)",
    "tabBarBorder": "rgba(90,  Fifty,  Twenty, 0.14)",
    "tabIconDefault": "#6B5442",
    "tabIconSelected": "#7A4A24",

    "tint": "#7A4A24",
    "icon": "#5E3518",

    "blurTint": "systemThinMaterialLight",
    "statusBarStyle": "dark"
  },
  // grain2: {
  //   // Darker text and light black/gray accent on grain2 background (lighter/warmer image)
  //   text: '#0d1f0d',
  //   textSecondary: '#1a3312',
  //   textMuted: '#2d4a28',
  //   textInverse: '#ffffff',
  //   background: '#E8E6E0',
  //   backgroundSecondary: 'rgba(255, 255, 255, 0.7)',
  //   backgroundTertiary: 'rgba(240, 238, 232, 0.82)',
  //   accent: '#3d3d3d',
  //   accentDark: '#2a2a2a',
  //   accentLight: '#525252',
  //   border: 'rgba(10, 50, 15, 0.28)',
  //   borderLight: 'rgba(10, 50, 15, 0.14)',
  //   divider: 'rgba(10, 50, 15, 0.16)',
  //   cardBackground: 'rgba(255, 255, 255, 0.68)',
  //   cardBorder: 'transparent',
  //   tabBarBackground: 'rgba(255, 255, 255, 0.88)',
  //   tabBarBorder: 'rgba(10, 50, 15, 0.14)',
  //   tabIconDefault: '#2d4a28',
  //   tabIconSelected: '#3d3d3d',
  //   tint: '#3d3d3d',
  //   icon: '#2d4a28',
  //   backgroundPrimary: darkGreen,
  //   blurTint: 'systemThinMaterialLight' as const,
  //   statusBarStyle: 'dark' as const,
  // },
  grain3: {
    // Text colors like solid dark mode
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    textInverse: '#000',
    background: '#E8E6E0',
    backgroundSecondary: 'rgba(255, 255, 255, 0.7)',
    backgroundTertiary: 'rgba(240, 238, 232, 0.82)',
    accent: accentSilver,
    accentDark: '#b8951f',
    accentLight: '#e5c859',
    border: 'rgba(255, 255, 255, 0.15)',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    divider: 'rgba(255, 255, 255, 0.1)',
    cardBackground: 'rgba(255, 255, 255, 0.68)',
    // cardBorder: 'rgba(255, 255, 255, 0.15)',
    cardBorder: 'transparent',
    tabBarBackground: 'rgba(255, 255, 255, 0.88)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
    tabIconDefault: 'rgba(255, 255, 255, 0.7)',
    tabIconSelected: accentSilver,
    tint: '#FFFFFF',
    icon: 'rgba(255, 255, 255, 0.7)',
    backgroundPrimary: darkGreen,
    blurTint: 'dark' as const,
    statusBarStyle: 'light' as const,
  },
};
