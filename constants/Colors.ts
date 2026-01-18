/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const accentGold = '#d4af37';
const darkGreen = '#0f3d2c';
const darkGreenLighter = '#1a5f3f';
const darkGreenCard = '#134832';

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
};
