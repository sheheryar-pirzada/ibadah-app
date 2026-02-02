import {
    createPrayerTimes,
    getNextPrayer,
    getTimeForPrayer,
    prayerToKey
} from '@/utils/prayer-times';
import { prayerTracker } from '@/utils/prayer-tracking';
import {
    formatTimeDiff,
    PrayerKey
} from '@/utils/prayer-ui';
import { PrayerTimes } from 'adhan';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

interface Location {
    coords: {
        latitude: number;
        longitude: number;
    };
}

export function usePrayerTimes(location: Location | null) {
    const [prayerTimes, setPrayerTimes] = useState<Record<PrayerKey, Date> | null>(null);
    const [prayerTimesObj, setPrayerTimesObj] = useState<PrayerTimes | null>(null);
    const [nextPrayer, setNextPrayer] = useState<PrayerKey>('fajr');
    const [timeUntilNext, setTimeUntilNext] = useState<string>('');

    const calculatePrayerTimes = useCallback(async () => {
        if (!location) return;
        const { latitude: lat, longitude: lng } = location.coords;
        const today = new Date();

        try {
            const timesObj = await createPrayerTimes(lat, lng, undefined, undefined, today);
            setPrayerTimesObj(timesObj);

            const parsed: Record<PrayerKey, Date> = {
                fajr: timesObj.fajr,
                sunrise: timesObj.sunrise,
                dhuhr: timesObj.dhuhr,
                asr: timesObj.asr,
                maghrib: timesObj.maghrib,
                isha: timesObj.isha,
            };

            await prayerTracker.initialize();
            await prayerTracker.createPrayerRecords(today, parsed);
            setPrayerTimes(parsed);
        } catch (error) {
            console.error('Error calculating prayer times:', error);
        }
    }, [location]);

    const updateNextPrayer = useCallback(async () => {
        if (!prayerTimesObj || !location) return;

        const now = new Date();
        const nextPrayerEnum = getNextPrayer(prayerTimesObj, now);
        const nextPrayerKey = prayerToKey(nextPrayerEnum);

        if (nextPrayerKey) {
            const nextPrayerTime = getTimeForPrayer(prayerTimesObj, nextPrayerEnum);
            if (nextPrayerTime) {
                setNextPrayer(nextPrayerKey);
                const diff = nextPrayerTime.getTime() - now.getTime();
                setTimeUntilNext(formatTimeDiff(diff > 0 ? diff : 0));
            }
        } else {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            try {
                const tomorrowTimes = await createPrayerTimes(
                    location.coords.latitude,
                    location.coords.longitude,
                    undefined,
                    undefined,
                    tomorrow
                );
                const tomorrowFajr = tomorrowTimes.fajr;
                setNextPrayer('fajr');
                const diff = tomorrowFajr.getTime() - now.getTime();
                setTimeUntilNext(formatTimeDiff(diff > 0 ? diff : 0));
            } catch (error) {
                console.error('Error calculating tomorrow prayer times:', error);
            }
        }
    }, [prayerTimesObj, location]);

    useEffect(() => {
        if (location) calculatePrayerTimes();
    }, [location, calculatePrayerTimes]);

    useFocusEffect(
        useCallback(() => {
            if (location) {
                calculatePrayerTimes();
            }
        }, [location, calculatePrayerTimes])
    );

    useEffect(() => {
        const interval = setInterval(() => {
            if (prayerTimesObj) {
                updateNextPrayer().catch(console.error);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [prayerTimesObj, updateNextPrayer]);

    return {
        prayerTimes,
        prayerTimesObj,
        nextPrayer,
        timeUntilNext,
        calculatePrayerTimes
    };
}
