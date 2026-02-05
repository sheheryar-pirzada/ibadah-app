# CLAUDE.md

Project guidance for AI assistants working on the Ibadah app.

## About

Ibadah is an Islamic companion mobile app built with React Native, Expo 55, and TypeScript. It provides prayer times, Quran reading, hadith collections, duas, prayer tracking, tasbeeh, and Arabic learning.

## Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
```

## Project Structure

```
app/                              # Expo Router file-based routing
├── _layout.tsx                   # Root layout (providers, fonts, ads)
├── +not-found.tsx                # 404 screen
├── (tabs)/                       # Bottom tab navigation (5 tabs)
│   ├── _layout.tsx               # Tab bar configuration
│   ├── index.tsx                 # Prayer Times (home tab)
│   ├── track/
│   │   ├── index.tsx             # Prayer tracking dashboard
│   │   ├── analytics.tsx         # Prayer analytics & charts
│   │   └── tasbeeh.tsx           # Tasbeeh counter
│   ├── duas.tsx                  # Duas/supplications
│   ├── quran-search.tsx          # Quran search & browse
│   └── learn/
│       ├── index.tsx             # Arabic learning dashboard
│       ├── alphabet.tsx          # Arabic alphabet
│       └── lesson/[id].tsx       # Individual lesson (dynamic route)
├── settings/
│   ├── index.tsx                 # Settings home
│   ├── prayer-notifications.tsx  # Per-prayer notification config
│   ├── calculation-method.tsx    # Prayer calculation method
│   ├── madhab.tsx               # Islamic school selection
│   ├── hadith-book.tsx          # Hadith book preference
│   └── reciter.tsx              # Quran reciter selection
├── surah/[id]/
│   ├── index.tsx                 # Surah verses view
│   ├── page.tsx                  # Page-by-page Mushaf view
│   ├── tafsir.tsx               # Tafsir (interpretation)
│   └── note.tsx                 # Verse notes
├── hadith-search.tsx            # Hadith search
├── bookmarked-hadiths.tsx       # Saved hadiths
├── share.tsx                    # Share modal
└── letter-detail.tsx            # Arabic letter detail modal

components/
├── chin/                        # Sliding audio player overlay
│   ├── Chin.tsx                 # Overlay container
│   ├── ChinAudioPlayer.tsx      # Audio player UI
│   ├── ChinProvider.tsx         # Provider wrapper
│   └── store.ts                 # Zustand store
├── tasbeeh/                     # Tasbeeh counter
│   ├── TasbeehBead.tsx          # Individual bead rendering
│   ├── TasbeehCanvas.tsx        # Skia canvas renderer
│   ├── TasbeehControls.tsx      # Counter controls
│   ├── TasbeehCounter.tsx       # Main counter component
│   ├── TasbeehString.tsx        # Bead string visual
│   └── store.ts                 # Zustand store (persisted to AsyncStorage)
├── immersive-overlay/           # Full-screen overlay system
│   ├── index.tsx
│   ├── store.tsx
│   └── components/
├── ui/                          # Base UI primitives
│   ├── IconSymbol.tsx
│   └── TabBarBackground.tsx
├── PrayerCard.tsx               # Prayer time display card
├── PrayerTrackingScreen.tsx     # Tracking UI
├── PrayerAnalyticsScreen.tsx    # Analytics & charts
├── DailyVerseCard.tsx           # Ayah of the day
├── DailyHadithCard.tsx          # Hadith of the day
├── DuaCard.tsx                  # Dua display card
├── AudioPlayer.tsx              # Inline audio player
├── AudioWaveform.tsx            # Audio waveform visualizer
├── ThemedText.tsx               # Theme-aware text
├── ThemedView.tsx               # Theme-aware view
├── ThemedBlurView.tsx           # Glassmorphism blur view
├── ThemedStatusBar.tsx          # Platform status bar
├── ParallaxScrollView.tsx       # Parallax scroll effect
├── Collapsible.tsx              # Expandable/collapsible section
└── HapticTab.tsx                # Tab with haptic feedback

contexts/
└── ThemeContext.tsx              # Theme provider (light/dark/system)

hooks/
├── usePrayerTimes.ts            # Prayer time calculation hook
├── useLocation.tsx              # GPS location provider hook
├── useDailyContent.ts           # Daily verse & hadith hook
├── useQuranChapters.ts          # Quran chapter list hook
├── useQuranSearch.ts            # Quran search hook
├── useHadithSearch.ts           # Hadith search hook
├── useTheme.ts                  # Theme access hook
├── useThemeColor.ts             # Themed color getter hook
└── useColorScheme.ts            # Platform color scheme hook

utils/
├── quran-api.ts                 # Quran.com API v4 client
├── prayer-times.ts              # Adhan.js prayer time integration
├── prayer-tracking.ts           # Prayer completion tracking service
├── prayer-settings.ts           # Prayer settings storage
├── prayer-ui.ts                 # Prayer display helpers
├── notification-service.ts      # Local notification scheduling
├── notification-settings.ts     # Notification preferences storage
├── audio-service.ts             # Audio playback manager (singleton)
├── duas-data.ts                 # Dua content database
├── duas.ts                      # Dua manager service
├── arabic-lessons-data.ts       # Arabic lesson content
├── arabic-alphabet-data.ts      # Arabic alphabet data
├── arabic-progress.ts           # Learning progress tracker
├── hadith-types.ts              # Hadith TypeScript types
├── hadith-settings.ts           # Hadith preferences storage
├── reciter-settings.ts          # Reciter preferences storage
├── verse-notes.ts               # Verse annotation storage
├── quran-search.ts              # Quran search helpers
├── quran-verse.ts               # Verse utility functions
├── sunnah-times.ts              # Sunnah time helpers
├── tasbeeh-path.ts              # Tasbeeh bead path math
├── app-open-ad.ts               # App-open ad manager
└── interstitial-ad.ts           # Interstitial ad manager

constants/
├── Colors.ts                    # Theme color definitions
└── tasbeeh.ts                   # Tasbeeh counter constants

assets/
├── images/
│   ├── icon.png
│   ├── splash-icon.png
│   └── prayers/                 # Fajr, Dhuhr, Asr, Maghrib, Isha icons
└── fonts/
    ├── Tajawal/                 # Arabic UI font (Light, Regular, Medium, Bold)
    └── Amiri/                   # Islamic calligraphy font (Regular, Bold)
```

## Tech Stack

- **Framework**: React Native 0.83 + Expo 55 + Expo Router (file-based routing)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: NativeWind 4 + Tailwind CSS 3 (dark mode via `class` strategy)
- **State**: Zustand (component stores), React Context (theme), AsyncStorage (persistence)
- **Animations**: React Native Reanimated 4, Shopify React Native Skia
- **APIs**: Quran.com API v4, Adhan.js for prayer times
- **Native**: Expo Audio, Expo Notifications, Expo Location, Expo Haptics

## Coding Rules

### Styling

- **Always use Tailwind classes via NativeWind** for styling. Avoid inline `style` objects unless absolutely necessary (e.g., dynamic animated styles from Reanimated).
- Use the custom color tokens from `tailwind.config.js` (e.g., `bg-emerald-primary`, `text-jade-accent`) rather than raw hex values.
- Use the custom font families: `font-tajawal`, `font-tajawal-medium`, `font-tajawal-bold`, `font-amiri`.
- Dark mode: use `dark:` prefix for dark-mode variants (e.g., `className="bg-emerald-secondary dark:bg-jade-primary"`).

### Border Radius

- **Always use `borderCurve: 'continuous'`** on any element with rounded corners. This produces iOS-native smooth (squircle) corners instead of standard circular arcs. Apply it alongside Tailwind's `rounded-*` classes:
  ```tsx
  <View className="rounded-2xl" style={{ borderCurve: 'continuous' }}>
  ```

### Components

- Use `ThemedText` and `ThemedView` for theme-aware text and containers.
- Use `ThemedBlurView` for glassmorphism effects.
- Reanimated entering/exiting animations: prefer `FadeInUp`, `FadeInDown` from `react-native-reanimated`.
- Haptic feedback: use `expo-haptics` for interactive touches.
- Icons: use `@expo/vector-icons` via `IconSymbol` component.

### State Management

- **Zustand** for component-scoped state (audio player, tasbeeh, overlays). Stores live in a `store.ts` file next to the component.
- **React Context** for app-wide state (theme only, via `ThemeContext`).
- **AsyncStorage** for all persistent data (prayer tracking, settings, bookmarks, progress).
- Custom hooks in `hooks/` for data fetching and computation.
- Singleton service classes in `utils/` for business logic (prayer tracking, notifications, audio, duas).

### Routing

- File-based routing via Expo Router. All screens live in `app/`.
- Dynamic routes use `[param]` syntax (e.g., `surah/[id]/index.tsx`, `lesson/[id].tsx`).
- Tab navigation is in `app/(tabs)/` with layout in `_layout.tsx`.
- Modals: `share.tsx` and `letter-detail.tsx` are presented as modals.

### Data & APIs

- Quran data comes from `utils/quran-api.ts` which wraps the Quran.com API v4.
- Prayer times are calculated locally using `adhan` library in `utils/prayer-times.ts`.
- Dua content is stored locally in `utils/duas-data.ts`.
- Arabic lesson content is in `utils/arabic-lessons-data.ts` and `utils/arabic-alphabet-data.ts`.
- All API responses should be cached where appropriate (reciter list caches for 7 days).

### Environment Variables

- Quran API credentials are in `.env` and accessed via `process.env.EXPO_PUBLIC_*`.
- Never commit `.env` to version control.

### General Conventions

- Keep components focused and single-purpose.
- Place new screens in the appropriate `app/` subdirectory following the existing routing structure.
- Place reusable components in `components/`, hooks in `hooks/`, utilities in `utils/`.
- Use TypeScript strict mode. Define types alongside their usage or in dedicated type files (e.g., `hadith-types.ts`).
- Bundle ID: `com.peersahab.ibadah` (iOS and Android).
