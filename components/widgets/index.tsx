'use no memo';

import React from 'react';
import {
  updateWidget,
  scheduleWidget,
} from 'voltra/client';
import { Appearance } from 'react-native';
import {
  getWidgetData,
  getWidgetDataSync,
  getWidgetLocation,
  saveWidgetLocation,
  type WidgetData,
  type WidgetLocation,
} from './widget-utils';
import { SmallPrayerWidget, MediumPrayerWidget, LargePrayerWidget } from './PrayerWidget';
import { MediumDuaWidget, LargeDuaWidget } from './DuaWidget';
import { SmallAllahNamesWidget, MediumAllahNamesWidget } from './AllahNamesWidget';
import { quranicDuas, type QuranicDua } from './dua-data';
import { getDailyAllahName } from './allah-names-data';
import { getPrayerSettings, type CalculationMethodKey, type MadhabKey } from '@/utils/prayer-settings';

export { SmallPrayerWidget, MediumPrayerWidget, LargePrayerWidget } from './PrayerWidget';
export { MediumDuaWidget, LargeDuaWidget } from './DuaWidget';
export { SmallAllahNamesWidget, MediumAllahNamesWidget } from './AllahNamesWidget';
export { quranicDuas, type QuranicDua } from './dua-data';
export { getDailyAllahName, allahNames, type AllahName } from './allah-names-data';
export { getWidgetData, saveWidgetLocation, widgetColors } from './widget-utils';

const PRAYER_WIDGET_ID = 'prayer_times';

type ColorScheme = 'light' | 'dark';

function getColorScheme(): ColorScheme {
  const scheme = Appearance.getColorScheme();
  return scheme === 'light' ? 'light' : 'dark';
}

/**
 * Update all prayer time widgets with current data
 */
export async function updatePrayerWidgets(): Promise<void> {
  try {
    const data = await getWidgetData();
    const colorScheme = getColorScheme();

    await updateWidget(
      PRAYER_WIDGET_ID,
      {
        systemSmall: <SmallPrayerWidget data={data} colorScheme={colorScheme} />,
        systemMedium: <MediumPrayerWidget data={data} colorScheme={colorScheme} />,
        systemLarge: <LargePrayerWidget data={data} colorScheme={colorScheme} />,
      },
      { deepLinkUrl: 'ibadah://' }
    );

    // If we have location, schedule updates at prayer times
    if (data.hasLocation && data.allPrayers.length > 0) {
      const location = await getWidgetLocation();
      if (location) {
        const settings = await getPrayerSettings();
        await schedulePrayerWidgetUpdates(
          data,
          location,
          settings.calculationMethod,
          settings.madhab
        );
      }
    }
  } catch (error) {
    console.error('Error updating prayer widgets:', error);
  }
}

/**
 * Update widgets with provided location (used when location updates)
 */
export async function updatePrayerWidgetsWithLocation(
  latitude: number,
  longitude: number
): Promise<void> {
  try {
    // Save location for future use
    await saveWidgetLocation(latitude, longitude);

    const settings = await getPrayerSettings();
    const data = getWidgetDataSync(latitude, longitude, settings.calculationMethod, settings.madhab);
    const colorScheme = getColorScheme();

    await updateWidget(
      PRAYER_WIDGET_ID,
      {
        systemSmall: <SmallPrayerWidget data={data} colorScheme={colorScheme} />,
        systemMedium: <MediumPrayerWidget data={data} colorScheme={colorScheme} />,
        systemLarge: <LargePrayerWidget data={data} colorScheme={colorScheme} />,
      },
      { deepLinkUrl: 'ibadah://' }
    );

    // Schedule updates at prayer times
    if (data.allPrayers.length > 0) {
      await schedulePrayerWidgetUpdates(
        data,
        { latitude, longitude },
        settings.calculationMethod,
        settings.madhab
      );
    }
  } catch (error) {
    console.error('Error updating prayer widgets with location:', error);
  }
}

/**
 * Schedule widget updates at each prayer time
 * This ensures the "next prayer" updates correctly throughout the day
 */
async function schedulePrayerWidgetUpdates(
  currentData: WidgetData,
  location: WidgetLocation,
  method: CalculationMethodKey,
  madhab: MadhabKey
): Promise<void> {
  if (!currentData.hasLocation) return;

  const now = Date.now();
  const nextPrayerMs = currentData.nextPrayer?.timeMs;
  const currentEntryMs = getCurrentEntryMs(now, nextPrayerMs);
  const entries: Array<{
    date: Date;
    variants: {
      systemSmall: React.ReactElement;
      systemMedium: React.ReactElement;
      systemLarge: React.ReactElement;
    };
    deepLinkUrl: string;
  }> = [];

  const colorScheme = getColorScheme();

  // Include the current state as the first timeline entry so that
  // scheduleWidget does not discard the immediate updateWidget state.
  const currentEntryData = getWidgetDataSync(
    location.latitude,
    location.longitude,
    method,
    madhab,
    new Date(currentEntryMs)
  );
  entries.push({
    date: new Date(currentEntryMs),
    variants: {
      systemSmall: <SmallPrayerWidget data={currentEntryData} colorScheme={colorScheme} />,
      systemMedium: <MediumPrayerWidget data={currentEntryData} colorScheme={colorScheme} />,
      systemLarge: <LargePrayerWidget data={currentEntryData} colorScheme={colorScheme} />,
    },
    deepLinkUrl: 'ibadah://',
  });

  // Schedule updates at each upcoming prayer time
  for (const prayer of currentData.allPrayers) {
    if (prayer.timeMs > now) {
      const entryDate = new Date(prayer.timeMs + 1000);
      const futureData = getWidgetDataSync(
        location.latitude,
        location.longitude,
        method,
        madhab,
        entryDate
      );

      entries.push({
        date: entryDate,
        variants: {
          systemSmall: <SmallPrayerWidget data={futureData} colorScheme={colorScheme} />,
          systemMedium: <MediumPrayerWidget data={futureData} colorScheme={colorScheme} />,
          systemLarge: <LargePrayerWidget data={futureData} colorScheme={colorScheme} />,
        },
        deepLinkUrl: 'ibadah://',
      });
    }
  }

  try {
    await scheduleWidget(PRAYER_WIDGET_ID, entries);
  } catch (error) {
    console.error('Error scheduling widget updates:', error);
  }
}

function getCurrentEntryMs(nowMs: number, nextPrayerMs?: number): number {
  const minLeadMs = 1000;
  const maxLeadMs = 15000;
  const candidateMs = nextPrayerMs
    ? Math.min(nowMs + maxLeadMs, nextPrayerMs - minLeadMs)
    : nowMs + maxLeadMs;
  return Math.max(nowMs + minLeadMs, candidateMs);
}

// ============================================================================
// DUA WIDGETS
// ============================================================================

/**
 * Update all Quranic dua widgets
 * Each dua is a separate widget that users can add to their home screen
 */
export async function updateDuaWidgets(): Promise<void> {
  const colorScheme = getColorScheme();

  // Update all dua widgets in parallel
  const updatePromises = quranicDuas.map(async (dua) => {
    try {
      await updateWidget(
        dua.widgetId,
        {
          systemMedium: <MediumDuaWidget dua={dua} colorScheme={colorScheme} />,
          systemLarge: <LargeDuaWidget dua={dua} colorScheme={colorScheme} />,
        },
        { deepLinkUrl: 'ibadah://duas' }
      );
    } catch (error) {
      console.error(`Error updating dua widget ${dua.widgetId}:`, error);
    }
  });

  await Promise.all(updatePromises);
}

// ============================================================================
// ALLAH NAMES WIDGET
// ============================================================================

const ALLAH_NAMES_WIDGET_ID = 'allah_names';

/**
 * Update the 99 Names of Allah widget with today's name
 */
export async function updateAllahNamesWidget(): Promise<void> {
  try {
    const colorScheme = getColorScheme();
    const dailyName = getDailyAllahName();

    await updateWidget(
      ALLAH_NAMES_WIDGET_ID,
      {
        systemSmall: <SmallAllahNamesWidget name={dailyName} colorScheme={colorScheme} />,
        systemMedium: <MediumAllahNamesWidget name={dailyName} colorScheme={colorScheme} />,
      },
      { deepLinkUrl: 'ibadah://' }
    );
  } catch (error) {
    console.error('Error updating Allah names widget:', error);
  }
}

/**
 * Update all widgets (prayer times + duas + Allah names)
 */
export async function updateAllWidgets(): Promise<void> {
  await Promise.all([
    updatePrayerWidgets(),
    updateDuaWidgets(),
    updateAllahNamesWidget(),
  ]);
}

