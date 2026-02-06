# Ibadah

An Islamic companion app built with React Native and Expo. Ibadah provides prayer times, Quran reading, hadith collections, duas, prayer tracking, and Arabic learning tools in one place.

## Features

### Prayer Times
- Real-time prayer time calculations based on GPS location (powered by Adhan.js)
- Supports multiple calculation methods (Muslim World League, Umm Al-Qura, Egyptian, Karachi, and more)
- Next prayer countdown timer with Islamic (Hijri) date display
- Per-prayer notification scheduling
- Madhab selection (Shafi, Hanafi)

### Prayer Tracking
- Mark daily prayers as completed or missed
- Daily, weekly, and monthly analytics dashboard
- Current streak and longest streak counters
- Completion rate visualization

### Quran
- Full Quran search across all verses
- Browse all 114 surahs with verse-by-verse reading
- Page-by-page Mushaf view
- Audio recitation with multiple reciter support
- Tafsir (interpretation) from multiple sources
- Personal verse notes and annotations
- Word-by-word translation and transliteration

### Duas (Supplications)
- Curated collection of Islamic duas organized by category: morning, evening, after prayer, before sleep, protection, forgiveness, guidance
- Arabic text with transliteration and English translation
- Audio recitation for Quranic duas
- Favorites bookmarking and search

### Hadith
- Browse hadith books (Al-Bukhari, Muslim, and others)
- Full-text hadith search
- Daily hadith on the home screen
- Bookmark and save hadiths

### Tasbeeh Counter
- Digital prayer bead counter with targets (33, 99, 100, 1000)
- Lifetime count tracking with session history
- Haptic feedback support
- Canvas-rendered bead visualization (Skia)

### Arabic Learning
- Arabic alphabet lessons with detailed letter information
- Structured lesson categories with progress tracking
- Interactive learning interface

### Settings
- Theme selection: light, dark, or system
- Prayer calculation method and madhab
- Hadith book preference
- Quran reciter selection
- Notification preferences per prayer

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.83, Expo 55 |
| Language | TypeScript 5.9 |
| Routing | Expo Router (file-based) |
| Styling | NativeWind 4 + Tailwind CSS 3 |
| State | Zustand, React Context, AsyncStorage |
| Animations | React Native Reanimated 4, Skia |
| Prayer Times | Adhan.js |
| Quran Data | Quran.com API v4 |
| Notifications | Expo Notifications |
| Audio | Expo Audio |
| Ads | Google Mobile Ads (AdMob) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator, or a physical device with [Expo Go](https://expo.dev/go)

### Installation

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd ibadah-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the required Quran API credentials:

   ```
   EXPO_PUBLIC_QURAN_CLIENT_ID=<your-client-id>
   EXPO_PUBLIC_QURAN_CLIENT_SECRET=<your-client-secret>
   EXPO_PUBLIC_QURAN_ENDPOINT=https://prelive-oauth2.quran.foundation
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Run on a specific platform:

   ```bash
   npm run ios       # iOS (requires macOS)
   npm run android   # Android
   npm run web       # Web browser
   ```

### Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds:

```bash
npx eas build --platform ios
npx eas build --platform android
```

## Project Structure

```
ibadah-app/
├── app/                              # Expo Router file-based routing
│   ├── _layout.tsx                   # Root layout (providers, fonts, ads)
│   ├── +not-found.tsx                # 404 screen
│   ├── (tabs)/                       # Bottom tab navigation
│   │   ├── _layout.tsx               # Tab bar config (5 tabs)
│   │   ├── index.tsx                 # Prayer Times (home)
│   │   ├── track/
│   │   │   ├── index.tsx             # Prayer tracking dashboard
│   │   │   ├── analytics.tsx         # Stats and charts
│   │   │   └── tasbeeh.tsx           # Tasbeeh counter
│   │   ├── duas.tsx                  # Duas screen
│   │   ├── quran-search.tsx          # Quran search
│   │   └── learn/
│   │       ├── index.tsx             # Learning dashboard
│   │       ├── alphabet.tsx          # Arabic alphabet
│   │       └── lesson/[id].tsx       # Dynamic lesson page
│   ├── settings/
│   │   ├── index.tsx                 # Settings home
│   │   ├── prayer-notifications.tsx  # Notification prefs
│   │   ├── calculation-method.tsx    # Calculation method picker
│   │   ├── madhab.tsx               # Madhab selection
│   │   ├── hadith-book.tsx          # Hadith book picker
│   │   └── reciter.tsx              # Quran reciter picker
│   ├── surah/[id]/
│   │   ├── index.tsx                 # Surah verses
│   │   ├── page.tsx                  # Mushaf page view
│   │   ├── tafsir.tsx               # Tafsir (interpretation)
│   │   └── note.tsx                 # Verse notes
│   ├── hadith-search.tsx            # Hadith search
│   ├── bookmarked-hadiths.tsx       # Saved hadiths
│   ├── share.tsx                    # Share modal
│   └── letter-detail.tsx            # Arabic letter detail modal
├── components/
│   ├── chin/                        # Sliding audio player overlay
│   │   ├── Chin.tsx                 # Overlay container
│   │   ├── ChinAudioPlayer.tsx      # Audio player UI
│   │   ├── ChinProvider.tsx         # Context provider
│   │   └── store.ts                 # Zustand store
│   ├── tasbeeh/                     # Tasbeeh counter components
│   │   ├── TasbeehBead.tsx          # Individual bead
│   │   ├── TasbeehCanvas.tsx        # Skia canvas renderer
│   │   ├── TasbeehControls.tsx      # Counter controls
│   │   ├── TasbeehCounter.tsx       # Main counter component
│   │   ├── TasbeehString.tsx        # Bead string graphic
│   │   └── store.ts                 # Zustand store (persisted)
│   ├── immersive-overlay/           # Full-screen overlay system
│   │   ├── index.tsx
│   │   ├── store.tsx
│   │   └── components/
│   ├── ui/                          # Base UI primitives
│   │   ├── IconSymbol.tsx
│   │   └── TabBarBackground.tsx
│   ├── PrayerCard.tsx               # Prayer time card
│   ├── PrayerTrackingScreen.tsx     # Tracking UI
│   ├── PrayerAnalyticsScreen.tsx    # Analytics charts
│   ├── DailyVerseCard.tsx           # Ayah of the day
│   ├── DailyHadithCard.tsx          # Hadith of the day
│   ├── DuaCard.tsx                  # Dua display card
│   ├── AudioPlayer.tsx              # Inline audio player
│   ├── AudioWaveform.tsx            # Waveform visualizer
│   ├── ThemedText.tsx               # Theme-aware text
│   ├── ThemedView.tsx               # Theme-aware view
│   ├── ThemedBlurView.tsx           # Glassmorphism blur
│   ├── ThemedStatusBar.tsx          # Status bar
│   ├── ParallaxScrollView.tsx       # Parallax scroll
│   ├── Collapsible.tsx              # Expandable sections
│   └── HapticTab.tsx                # Tab with haptic feedback
├── contexts/
│   └── ThemeContext.tsx              # Theme provider (light/dark/system)
├── hooks/
│   ├── usePrayerTimes.ts            # Prayer time calculation
│   ├── useLocation.tsx              # GPS location provider
│   ├── useDailyContent.ts           # Daily verse & hadith
│   ├── useQuranChapters.ts          # Chapter list fetcher
│   ├── useQuranSearch.ts            # Quran search hook
│   ├── useHadithSearch.ts           # Hadith search hook
│   ├── useTheme.ts                  # Theme hook
│   ├── useThemeColor.ts             # Themed color getter
│   └── useColorScheme.ts            # Platform color scheme
├── utils/
│   ├── quran-api.ts                 # Quran.com API client
│   ├── prayer-times.ts              # Adhan.js integration
│   ├── prayer-tracking.ts           # Completion tracking service
│   ├── prayer-settings.ts           # Prayer config storage
│   ├── prayer-ui.ts                 # Prayer display helpers
│   ├── notification-service.ts      # Local notification scheduling
│   ├── notification-settings.ts     # Notification prefs storage
│   ├── audio-service.ts             # Audio playback manager
│   ├── duas-data.ts                 # Dua content database
│   ├── duas.ts                      # Dua manager service
│   ├── arabic-lessons-data.ts       # Arabic lesson content
│   ├── arabic-alphabet-data.ts      # Alphabet data
│   ├── arabic-progress.ts           # Learning progress tracker
│   ├── hadith-types.ts              # Hadith TypeScript types
│   ├── hadith-settings.ts           # Hadith prefs storage
│   ├── reciter-settings.ts          # Reciter prefs storage
│   ├── verse-notes.ts              # Verse annotations storage
│   ├── quran-search.ts             # Quran search helpers
│   ├── quran-verse.ts              # Verse utility functions
│   ├── sunnah-times.ts             # Sunnah time helpers
│   ├── tasbeeh-path.ts             # Tasbeeh bead path math
│   ├── app-open-ad.ts              # App open ad manager
│   └── interstitial-ad.ts          # Interstitial ad manager
├── constants/
│   ├── Colors.ts                    # Theme color definitions
│   └── tasbeeh.ts                   # Tasbeeh constants
├── assets/
│   ├── images/
│   │   ├── icon.png                 # App icon
│   │   ├── splash-icon.png          # Splash screen icon
│   │   └── prayers/                 # Prayer time icons
│   └── fonts/
│       ├── Tajawal/                 # Arabic UI font (Light, Regular, Medium, Bold)
│       └── Amiri/                   # Islamic calligraphy font
├── ios/                             # iOS native project
├── app.json                         # Expo configuration
├── eas.json                         # EAS Build config
├── tailwind.config.js               # Tailwind/NativeWind theme
├── babel.config.js                  # Babel config
├── metro.config.js                  # Metro bundler config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies and scripts
└── .env                             # Environment variables (not committed)
```

## Navigation Map

```
Root (_layout.tsx)
├── (tabs)                     # Bottom tab navigator
│   ├── index                  # Tab 1: Prayer Times
│   ├── track/index            # Tab 2: Prayer Tracking
│   │   ├── track/analytics    #   Analytics sub-screen
│   │   └── track/tasbeeh      #   Tasbeeh counter
│   ├── duas                   # Tab 3: Duas
│   ├── quran-search           # Tab 4: Quran
│   └── learn/index            # Tab 5: Learn Arabic
│       ├── learn/alphabet     #   Alphabet screen
│       └── learn/lesson/[id]  #   Dynamic lesson
├── settings/*                 # Settings stack
├── surah/[id]/*               # Surah detail stack
├── hadith-search              # Hadith search
├── bookmarked-hadiths         # Saved hadiths
├── share                      # Modal
└── letter-detail              # Modal
```

## Color Theme

The app uses an emerald green and gold color palette defined in `tailwind.config.js`:

| Token | Light | Dark |
|---|---|---|
| Primary | `#046307` Deep Emerald | `#00A86B` Jade Green |
| Accent | `#CFAF58` Antique Gold | `#D4AF37` Metallic Gold |
| Background | `#F5F2E8` Soft Cream | `#0F3D2C` Dark Green |
| Text | `#333333` Charcoal | `#FFFFFF` White |

## License

Private. All rights reserved.
