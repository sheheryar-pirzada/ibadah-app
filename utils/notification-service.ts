// utils/notification-service.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { createPrayerTimes } from './prayer-times';
import { getNotificationSettings, type PrayerKey } from './notification-settings';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PRAYER_NAMES: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

type NotificationCopy = { title: string; body: string };

const UNIVERSAL_MESSAGES: NotificationCopy[] = [
  { title: '🕌 A moment with Allah', body: "It's time for your prayer. Pause, breathe, and reconnect." },
  { title: '🕌 Your prayer awaits', body: 'A few moments now can bring peace for the rest of your day.' },
  { title: '🕌 Time to return', body: 'Step away from the world and stand before Allah.' },
  { title: '🕌 A sacred pause', body: "It's prayer time. Let your heart be still." },
];

const PRAYER_COPY: Record<PrayerKey, NotificationCopy[]> = {
  fajr: [
    { title: '🌅 Fajr time', body: 'Start your day with light, gratitude, and prayer.' },
    { title: '🌅 Rise for Fajr', body: 'The day begins best with remembrance of Allah.' },
    { title: '🌅 A blessed start', body: 'Fajr prayer is calling. Begin with barakah.' },
  ],
  dhuhr: [
    { title: '☀️ Dhuhr time', body: 'Take a pause. Recenter your heart with prayer.' },
    { title: '☀️ Midday reminder', body: 'Step away from the rush and turn to Allah.' },
    { title: '☀️ Time to refocus', body: 'Dhuhr prayer brings balance to your day.' },
  ],
  asr: [
    { title: '🌤️ Asr time', body: 'Stay steady. Prayer strengthens the heart.' },
    { title: '🌤️ Hold firm', body: 'Guard your Asr prayer and find peace.' },
    { title: '🌤️ A moment of patience', body: 'Asr prayer reminds us to stay grounded.' },
  ],
  maghrib: [
    { title: '🌙 Maghrib time', body: 'Thank Allah for the day that has passed.' },
    { title: '🌙 As the sun sets', body: 'Turn to prayer and reflect with gratitude.' },
    { title: '🌙 Evening prayer', body: 'Maghrib brings calm after a long day.' },
  ],
  isha: [
    { title: '🌌 Isha time', body: 'End your day with prayer and trust.' },
    { title: '🌌 Night prayer', body: 'Leave your worries with Allah and rest.' },
    { title: '🌌 A peaceful close', body: 'Isha prayer. Let your heart be at ease.' },
  ],
};

function getRandomPrayerMessage(prayer: PrayerKey): NotificationCopy {
  // 70% chance for prayer-specific, 30% chance for universal
  const useUniversal = Math.random() < 0.3;
  const messages = useUniversal ? UNIVERSAL_MESSAGES : PRAYER_COPY[prayer];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Reminder notifications - sent before prayer time ends
const REMINDER_COPY: Record<PrayerKey, NotificationCopy[]> = {
  fajr: [
    { title: '⏰ Fajr time ending soon', body: 'Only 15 minutes left to pray Fajr before sunrise.' },
    { title: '🌅 Fajr reminder', body: 'Sunrise is approaching. Complete your Fajr prayer.' },
  ],
  dhuhr: [
    { title: '⏰ Dhuhr time ending soon', body: 'Only 15 minutes left to pray Dhuhr before Asr.' },
    { title: '☀️ Dhuhr reminder', body: 'Asr is approaching. Complete your Dhuhr prayer.' },
  ],
  asr: [
    { title: '⏰ Asr time ending soon', body: 'Only 15 minutes left to pray Asr before Maghrib.' },
    { title: '🌤️ Asr reminder', body: 'Maghrib is approaching. Complete your Asr prayer.' },
  ],
  maghrib: [
    { title: '⏰ Maghrib time ending soon', body: 'Only 15 minutes left to pray Maghrib before Isha.' },
    { title: '🌙 Maghrib reminder', body: 'Isha is approaching. Complete your Maghrib prayer.' },
  ],
  isha: [
    { title: '⏰ Isha time ending soon', body: 'Only 15 minutes left to pray Isha before midnight.' },
    { title: '🌌 Isha reminder', body: 'Midnight is approaching. Complete your Isha prayer.' },
  ],
};

function getRandomReminderMessage(prayer: PrayerKey): NotificationCopy {
  const messages = REMINDER_COPY[prayer];
  return messages[Math.floor(Math.random() * messages.length)];
}

class NotificationService {
  private static instance: NotificationService;
  private lastScheduledDate: Date | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Setup Android notification channel (required before requesting permissions)
   */
  async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-notifications', {
        name: 'Prayer Times',
        description: 'Notifications for prayer times and duas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#d4af37',
        sound: 'default',
      });
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Setup Android channel first
      await this.setupAndroidChannel();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.lastScheduledDate = null;
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  /**
   * Schedule prayer notifications for the next 7 days
   */
  async schedulePrayerNotifications(
    lat: number,
    lng: number,
    enabledPrayers: PrayerKey[]
  ): Promise<void> {
    try {
      const today = new Date();
      const scheduledIds: string[] = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        targetDate.setHours(0, 0, 0, 0);

        const prayerTimes = await createPrayerTimes(lat, lng, undefined, undefined, targetDate);

        for (const prayer of enabledPrayers) {
          let prayerDate: Date | null = null;

          switch (prayer) {
            case 'fajr':
              prayerDate = prayerTimes.fajr;
              break;
            case 'dhuhr':
              prayerDate = prayerTimes.dhuhr;
              break;
            case 'asr':
              prayerDate = prayerTimes.asr;
              break;
            case 'maghrib':
              prayerDate = prayerTimes.maghrib;
              break;
            case 'isha':
              prayerDate = prayerTimes.isha;
              break;
          }

          if (prayerDate && prayerDate > new Date()) {
            // Only schedule if the time hasn't passed
            const message = getRandomPrayerMessage(prayer);
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: message.title,
                body: message.body,
                sound: true,
                data: { type: 'prayer', prayer },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: prayerDate,
              },
            });

            scheduledIds.push(notificationId);
          }
        }
      }

      this.lastScheduledDate = today;
      // console.log(`Scheduled ${scheduledIds.length} prayer notifications`);
    } catch (error) {
      console.error('Error scheduling prayer notifications:', error);
      throw error;
    }
  }

  /**
   * Schedule dua notifications for the next 7 days
   */
  async scheduleDuaNotifications(
    lat: number,
    lng: number,
    offsetMinutes: number
  ): Promise<void> {
    try {
      const today = new Date();
      const scheduledIds: string[] = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        targetDate.setHours(0, 0, 0, 0);

        const prayerTimes = await createPrayerTimes(lat, lng, undefined, undefined, targetDate);

        // Morning dua: Fajr + offset
        const morningDuaTime = new Date(prayerTimes.fajr);
        morningDuaTime.setMinutes(morningDuaTime.getMinutes() + offsetMinutes);

        if (morningDuaTime > new Date()) {
          const morningId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '🌅 Morning Dua Reminder',
              body: 'Take a moment for your morning duas',
              sound: true,
              data: { type: 'dua', time: 'morning', href: '/duas?category=morning' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: morningDuaTime,
            },
          });
          scheduledIds.push(morningId);
        }

        // Evening dua: Maghrib + offset
        const eveningDuaTime = new Date(prayerTimes.maghrib);
        eveningDuaTime.setMinutes(eveningDuaTime.getMinutes() + offsetMinutes);

        if (eveningDuaTime > new Date()) {
          const eveningId = await Notifications.scheduleNotificationAsync({
            content: {
              title: '🌆 Evening Dua Reminder',
              body: 'Take a moment for your evening duas',
              sound: true,
              data: { type: 'dua', time: 'evening', href: '/duas?category=evening' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: eveningDuaTime,
            },
          });
          scheduledIds.push(eveningId);
        }
      }

      // console.log(`Scheduled ${scheduledIds.length} dua notifications`);
    } catch (error) {
      console.error('Error scheduling dua notifications:', error);
      throw error;
    }
  }

  /**
   * Schedule reminder notifications for the next 7 days
   * Reminders are sent X minutes before each prayer time ends
   * Prayer end times: Fajr->Sunrise, Dhuhr->Asr, Asr->Maghrib, Maghrib->Isha, Isha->Midnight
   */
  async scheduleReminderNotifications(
    lat: number,
    lng: number,
    enabledPrayers: PrayerKey[],
    minutesBefore: number = 15
  ): Promise<void> {
    try {
      const today = new Date();
      const scheduledIds: string[] = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        targetDate.setHours(0, 0, 0, 0);

        const prayerTimes = await createPrayerTimes(lat, lng, undefined, undefined, targetDate);

        for (const prayer of enabledPrayers) {
          let prayerEndTime: Date | null = null;

          // Calculate when each prayer time ends (start of next prayer)
          switch (prayer) {
            case 'fajr':
              // Fajr ends at sunrise
              prayerEndTime = new Date(prayerTimes.sunrise);
              break;
            case 'dhuhr':
              // Dhuhr ends at Asr
              prayerEndTime = new Date(prayerTimes.asr);
              break;
            case 'asr':
              // Asr ends at Maghrib
              prayerEndTime = new Date(prayerTimes.maghrib);
              break;
            case 'maghrib':
              // Maghrib ends at Isha
              prayerEndTime = new Date(prayerTimes.isha);
              break;
            case 'isha':
              // Isha ends at midnight (Islamic midnight = halfway between sunset and Fajr)
              // For simplicity, we use 11:45 PM as a reasonable cutoff
              prayerEndTime = new Date(targetDate);
              prayerEndTime.setHours(23, 59, 59, 999);
              break;
          }

          if (prayerEndTime) {
            // Calculate reminder time (X minutes before prayer ends)
            const reminderTime = new Date(prayerEndTime);
            reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

            // Only schedule if the reminder time hasn't passed
            if (reminderTime > new Date()) {
              const message = getRandomReminderMessage(prayer);
              const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                  title: message.title,
                  body: message.body,
                  sound: true,
                  data: { type: 'reminder', prayer },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: reminderTime,
                },
              });

              scheduledIds.push(notificationId);
            }
          }
        }
      }

      // console.log(`Scheduled ${scheduledIds.length} reminder notifications`);
    } catch (error) {
      console.error('Error scheduling reminder notifications:', error);
      throw error;
    }
  }

  /**
   * Reschedule all notifications based on current settings
   */
  async rescheduleAll(lat: number, lng: number): Promise<void> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted, skipping reschedule');
        return;
      }

      const settings = await getNotificationSettings();
      if (!settings.enabled) {
        await this.cancelAllNotifications();
        return;
      }

      // Cancel existing notifications
      await this.cancelAllNotifications();

      // Get enabled prayers
      const enabledPrayers: PrayerKey[] = [];
      if (settings.prayers.fajr) enabledPrayers.push('fajr');
      if (settings.prayers.dhuhr) enabledPrayers.push('dhuhr');
      if (settings.prayers.asr) enabledPrayers.push('asr');
      if (settings.prayers.maghrib) enabledPrayers.push('maghrib');
      if (settings.prayers.isha) enabledPrayers.push('isha');

      // Schedule prayer notifications
      if (enabledPrayers.length > 0) {
        await this.schedulePrayerNotifications(lat, lng, enabledPrayers);
      }

      // Schedule reminder notifications (15 min before prayer time ends)
      // Only remind for prayers that have notifications enabled
      if (settings.reminders?.enabled && enabledPrayers.length > 0) {
        await this.scheduleReminderNotifications(
          lat,
          lng,
          enabledPrayers,
          settings.reminderMinutesBefore || 15
        );
      }

      // Schedule dua notifications
      if (settings.duas) {
        await this.scheduleDuaNotifications(lat, lng, settings.duaOffsetMinutes);
      }
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  }

  /**
   * Check if notifications need rescheduling (if last schedule was >6 days ago)
   */
  needsRescheduling(): boolean {
    if (!this.lastScheduledDate) return true;
    const daysSinceLastSchedule =
      (new Date().getTime() - this.lastScheduledDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastSchedule > 6;
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Schedule a single test prayer notification after a short delay (for debugging)
   */
  async scheduleTestPrayerNotification(delaySeconds: number = 10): Promise<void> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          console.log('Notification permissions not granted for debug notification');
          return;
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🕌 Test Prayer Notification',
          body: `This is a test prayer notification scheduled to fire in ${delaySeconds} seconds.`,
          sound: true,
          data: { type: 'debug', category: 'test_prayer' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
          repeats: false,
        },
      });

      console.log(`Scheduled debug prayer notification in ${delaySeconds} seconds`);
    } catch (error) {
      console.error('Error scheduling debug prayer notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();

