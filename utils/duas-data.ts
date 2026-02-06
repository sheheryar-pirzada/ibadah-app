import { quranAPI } from './quran-api';

export type DuaCategory =
  | 'morning'
  | 'evening'
  | 'after-prayer'
  | 'before-sleep'
  | 'protection'
  | 'forgiveness'
  | 'guidance'
  | 'mood-sad'
  | 'mood-anxious'
  | 'mood-depressed'
  | 'mood-happy'
  | 'mood-lost'
  | 'mood-guilty';


export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: DuaCategory;
  meaning?: string;
  reference?: string;
  verseKey?: string; // Single verse key (e.g., "2:255")
  verseRange?: { surah: number; startVerse: number; endVerse: number }; // For multi-verse duas
}

// Helper to create dua entries (arabic/translation/transliteration fetched from API)
const createDua = (
  id: string,
  title: string,
  category: DuaCategory,
  reference: string,
  verseKey?: string,
  verseRange?: { surah: number; startVerse: number; endVerse: number },
  meaning?: string
): Dua => ({
  id,
  title,
  arabic: '',
  transliteration: '',
  translation: '',
  category,
  reference,
  verseKey,
  verseRange,
  meaning,
});

// Morning Duas (Adhkar al-Sabah)
export const morningDuas: Dua[] = [
  createDua('morning-fatiha', 'Surah Al-Fatiha', 'morning', 'Quran 1:1-7', undefined, { surah: 1, startVerse: 1, endVerse: 7 }, 'The Opening - the greatest surah in the Quran, recited in every prayer.'),
  createDua('morning-kursi', 'Ayat al-Kursi', 'morning', 'Quran 2:255', '2:255', undefined, 'The Verse of the Throne - one of the most powerful verses in the Quran for protection.'),
  createDua('morning-baqarah-end', 'Last Two Verses of Al-Baqarah', 'morning', 'Quran 2:285-286', undefined, { surah: 2, startVerse: 285, endVerse: 286 }, 'The Prophet (PBUH) said: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him."'),
];

// Evening Duas (Adhkar al-Masa)
export const eveningDuas: Dua[] = [
  createDua('evening-ikhlas', 'Surah Al-Ikhlas', 'evening', 'Quran 112:1-4', undefined, { surah: 112, startVerse: 1, endVerse: 4 }, 'Surah Al-Ikhlas is equivalent to one-third of the Quran in reward.'),
  createDua('evening-falaq', 'Surah Al-Falaq', 'evening', 'Quran 113:1-5', undefined, { surah: 113, startVerse: 1, endVerse: 5 }, 'One of the two surahs of protection (Al-Muawwidhatain).'),
  createDua('evening-nas', 'Surah An-Nas', 'evening', 'Quran 114:1-6', undefined, { surah: 114, startVerse: 1, endVerse: 6 }, 'The last surah of the Quran, seeking protection from evil whispers.'),
];

// After Prayer Duas
export const afterPrayerDuas: Dua[] = [
  createDua('after-prayer-kursi', 'Ayat al-Kursi', 'after-prayer', 'Quran 2:255', '2:255', undefined, 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.'),
  createDua('after-prayer-hashr', 'Last Three Verses of Al-Hashr', 'after-prayer', 'Quran 59:22-24', undefined, { surah: 59, startVerse: 22, endVerse: 24 }, 'These verses contain many of Allah\'s beautiful names and attributes.'),
];

// Before Sleep Duas
export const beforeSleepDuas: Dua[] = [
  createDua('sleep-mulk', 'Surah Al-Mulk (First 5 Verses)', 'before-sleep', 'Quran 67:1-3', undefined, { surah: 67, startVerse: 1, endVerse: 3 }, 'Surah Al-Mulk protects from the punishment of the grave when recited before sleep.'),
  createDua('sleep-kursi', 'Ayat al-Kursi', 'before-sleep', 'Quran 2:255', '2:255', undefined, 'When going to bed, reciting Ayat al-Kursi provides protection throughout the night.'),
  createDua('sleep-kafirun', 'Surah Al-Kafirun', 'before-sleep', 'Quran 109:1-6', undefined, { surah: 109, startVerse: 1, endVerse: 6 }, 'The Prophet (PBUH) used to recite this surah before sleeping as a declaration of faith.'),
];

// Protection Duas
export const protectionDuas: Dua[] = [
  createDua('protection-yunus', 'Dua of Prophet Yunus', 'protection', 'Quran 21:87', '21:87', undefined, 'The dua of Prophet Yunus (Jonah) from inside the whale. Allah said no Muslim makes this dua for anything except that Allah answers him.'),
  createDua('protection-imran', 'Dua for Protection', 'protection', 'Quran 3:8', '3:8', undefined, 'A powerful dua to keep steadfast on guidance.'),
  createDua('protection-tawbah', 'Trust in Allah', 'protection', 'Quran 9:129', '9:129', undefined, 'Whoever says this seven times in the morning and evening, Allah will suffice him in all matters.'),
];

// Forgiveness Duas
export const forgivenessDuas: Dua[] = [
  createDua('forgiveness-baqarah', 'Dua for Forgiveness', 'forgiveness', 'Quran 3:147', '3:147', undefined, 'A comprehensive dua seeking forgiveness, steadfastness, and victory.'),
  createDua('forgiveness-nuh', 'Dua of Prophet Nuh', 'forgiveness', 'Quran 71:28', '71:28', undefined, 'A beautiful dua of Prophet Nuh asking forgiveness for himself, his parents, and all believers.'),
  createDua('forgiveness-tahrim', 'Complete Repentance', 'forgiveness', 'Quran 2:201', '2:201', undefined, 'One of the most frequently made duas by the Prophet (PBUH).'),
];

// Guidance Duas
export const guidanceDuas: Dua[] = [
  createDua('guidance-knowledge', 'Dua for Knowledge', 'guidance', 'Quran 20:114', '20:114', undefined, 'Allah commanded the Prophet (PBUH) to make this dua.'),
  createDua('guidance-musa', 'Dua of Prophet Musa', 'guidance', 'Quran 28:24', '28:24', undefined, 'Prophet Musa made this dua when he arrived at Madyan with nothing, and Allah provided for him.'),
  createDua('guidance-parents', 'Dua for Parents', 'guidance', 'Quran 17:24', '17:24', undefined, 'A beautiful dua to make for one\'s parents.'),
  createDua('guidance-ibrahim', 'Dua of Prophet Ibrahim', 'guidance', 'Quran 14:40', '14:40', undefined, 'Prophet Ibrahim\'s dua for himself and his descendants to be steadfast in prayer.'),
  createDua('guidance-ease', 'With Hardship Comes Ease', 'guidance', 'Quran 94:5-6', undefined, { surah: 94, startVerse: 5, endVerse: 6 }, 'A powerful reminder that Allah will provide ease after every difficulty.'),
];

// Mood-based Qur'anic verses
export const moodDuasSad: Dua[] = [
  createDua('mood-sad-3-139', 'Do not weaken or grieve', 'mood-sad', 'Qur\'an 3:139', '3:139', undefined, 'Good when sadness comes with self-doubt or feeling behind in life.'),
  createDua('mood-sad-94-6', 'Indeed, with hardship comes ease', 'mood-sad', 'Qur\'an 94:6', '94:6', undefined, 'Repeat it slowly. It is not "after" hardship, it is with it.'),
  createDua('mood-sad-7-156', 'My mercy encompasses all things', 'mood-sad', 'Qur\'an 7:156', '7:156', undefined, 'A reminder when sadness feels like punishment.'),
];

export const moodDuasAnxious: Dua[] = [
  createDua('mood-anxious-13-28', 'By the remembrance of Allah hearts find rest', 'mood-anxious', 'Qur\'an 13:28', '13:28', undefined, 'Recite when your thoughts won\'t slow down.'),
  createDua('mood-anxious-2-286', 'Allah does not burden a soul beyond what it can bear', 'mood-anxious', 'Qur\'an 2:286', '2:286', undefined, 'Hits especially when life feels unfair.'),
  createDua('mood-anxious-65-3', 'Whoever relies upon Allah, then He is sufficient for him', 'mood-anxious', 'Qur\'an 65:3', '65:3', undefined, 'Good for moments of uncertainty and fear of the future.'),
];

export const moodDuasDepressed: Dua[] = [
  createDua('mood-depressed-39-53', 'Do not despair of the mercy of Allah', 'mood-depressed', 'Qur\'an 39:53', '39:53', undefined, 'Revealed for those who felt too far gone.'),
  createDua('mood-depressed-4-147', 'Why should Allah punish you if you are grateful and believe?', 'mood-depressed', 'Qur\'an 4:147', '4:147', undefined, 'A gentle reminder that Allah is not waiting to harm you.'),
  createDua('mood-depressed-93-3', 'Your Lord has not forsaken you, nor has He detested you', 'mood-depressed', 'Qur\'an 93:3', '93:3', undefined, 'Recite when you feel abandoned or unseen.'),
];

export const moodDuasHappy: Dua[] = [
  createDua('mood-happy-14-7', 'If you are grateful, I will surely increase you', 'mood-happy', 'Qur\'an 14:7', '14:7', undefined, 'Say it to protect your happiness from fading.'),
  createDua('mood-happy-10-58', 'In the bounty of Allah and His mercy—in that let them rejoice', 'mood-happy', 'Qur\'an 10:58', '10:58', undefined, 'Islam encourages joy. This ayah validates it.'),
  createDua('mood-happy-35-34', 'All praise is for Allah who removed from us all sorrow', 'mood-happy', 'Qur\'an 35:34', '35:34', undefined, 'Recite in moments of relief.'),
];

export const moodDuasLost: Dua[] = [
  createDua('mood-lost-20-114', 'My Lord, increase me in knowledge', 'mood-lost', 'Qur\'an 20:114', '20:114', undefined, 'Not just academic knowledge, but clarity.'),
  createDua('mood-lost-93-7', 'He found you lost and guided you', 'mood-lost', 'Qur\'an 93:7', '93:7', undefined, 'A reminder that confusion is often part of guidance.'),
];

export const moodDuasGuilty: Dua[] = [
  createDua('mood-guilty-25-70', 'Those who repent, believe, and do righteous deeds—Allah will replace their sins with good', 'mood-guilty', 'Qur\'an 25:70', '25:70', undefined, 'Not just forgiveness. It is transformation.'),
  createDua('mood-guilty-4-27', 'Allah wants to accept your repentance', 'mood-guilty', 'Qur\'an 4:27', '4:27', undefined, 'Allah wants you to come back.'),
];

// Combine all duas (mood verses will be enriched async)
export const allDuas: Dua[] = [
  ...morningDuas,
  ...eveningDuas,
  ...afterPrayerDuas,
  ...beforeSleepDuas,
  ...protectionDuas,
  ...forgivenessDuas,
  ...guidanceDuas,
  ...moodDuasSad,
  ...moodDuasAnxious,
  ...moodDuasDepressed,
  ...moodDuasHappy,
  ...moodDuasLost,
  ...moodDuasGuilty,
];

// Enrich all duas with API data (arabic, translation, transliteration)
export async function enrichAllDuas(translationResourceId: number): Promise<void> {
  function buildArabicFromWords(words: any[] | undefined): string {
    if (!words?.length) return '';
    return words
      .filter((w) => w?.char_type_name !== 'end')
      .map((w) => w?.text_uthmani ?? w?.text_imlaei ?? w?.text ?? '')
      .filter((t) => typeof t === 'string' && t.trim().length > 0)
      .join(' ');
  }

  function stripHtml(input: string | undefined | null): string {
    return String(input ?? '').replace(/<[^>]*>/g, '');
  }

  for (const dua of allDuas) {
    // Skip if already enriched
    if (dua.arabic?.trim()) continue;

    try {
      if (dua.verseKey) {
        // Single verse
        const verse = await quranAPI.getVerse(dua.verseKey, {
          translations: [translationResourceId],
          words: true,
          textType: 'uthmani',
        });

        if (verse) {
          dua.arabic =
            (verse.text_uthmani ?? verse.text_imlaei ?? '').trim() ||
            buildArabicFromWords(verse.words as any[]);
          dua.translation = stripHtml(verse.translations?.[0]?.text);
          if (verse.words && verse.words.length > 0) {
            const transliterationParts = verse.words
              .map((word) => word.transliteration?.text)
              .filter((text): text is string => !!text);
            dua.transliteration = transliterationParts.join(' ');
          }
        }
      } else if (dua.verseRange) {
        // Verse range - fetch all verses and combine
        const { surah, startVerse, endVerse } = dua.verseRange;
        const arabicParts: string[] = [];
        const translationParts: string[] = [];
        const transliterationParts: string[] = [];

        for (let verseNum = startVerse; verseNum <= endVerse; verseNum++) {
          const verseKey = `${surah}:${verseNum}`;
          const verse = await quranAPI.getVerse(verseKey, {
            translations: [translationResourceId],
            words: true,
            textType: 'uthmani',
          });

          if (verse) {
            const arabic =
              (verse.text_uthmani ?? verse.text_imlaei ?? '').trim() ||
              buildArabicFromWords(verse.words as any[]);
            if (arabic) arabicParts.push(arabic);

            const translation = stripHtml(verse.translations?.[0]?.text);
            if (translation) translationParts.push(translation);

            if (verse.words && verse.words.length > 0) {
              const verseTransliteration = verse.words
                .map((word) => word.transliteration?.text)
                .filter((text): text is string => !!text)
                .join(' ');
              if (verseTransliteration) transliterationParts.push(verseTransliteration);
            }
          }
        }

        dua.arabic = arabicParts.join(' ');
        dua.translation = translationParts.join(' ');
        dua.transliteration = transliterationParts.join(' ');
      }
    } catch (error) {
      console.error(`Error enriching dua ${dua.id}:`, error);
    }
  }
}
