export interface QuranicDua {
  id: string;
  widgetId: string; // Widget ID used in app.json
  category: string;
  arabic: string;
  translation: string;
  surah: string;
  reference: string; // e.g., "13:28"
}

/**
 * Quranic duas organized by emotional/spiritual category
 * Each dua is a separate widget that users can add to their home screen
 */
export const quranicDuas: QuranicDua[] = [
  // Medium-friendly (short and powerful)
  {
    id: 'calm-1',
    widgetId: 'dua_calm',
    category: 'Calm & Ease',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Surely in the remembrance of Allah do hearts find rest.',
    surah: 'Ar-Ra\'d',
    reference: '13:28',
  },
  {
    id: 'anxiety-1',
    widgetId: 'dua_anxiety',
    category: 'Anxiety & Fear',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    translation: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
    surah: 'Aal-e-Imran',
    reference: '3:173',
  },
  {
    id: 'sadness-1',
    widgetId: 'dua_sadness',
    category: 'Sadness',
    arabic: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
    translation: 'Do not grieve. Indeed Allah is with us.',
    surah: 'At-Tawbah',
    reference: '9:40',
  },
  {
    id: 'gratitude-1',
    widgetId: 'dua_gratitude',
    category: 'Gratitude',
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    translation: 'If you are grateful, I will surely increase you.',
    surah: 'Ibrahim',
    reference: '14:7',
  },
  {
    id: 'hope-1',
    widgetId: 'dua_hope',
    category: 'Hope & Mercy',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship comes ease.',
    surah: 'Ash-Sharh',
    reference: '94:6',
  },

  // Large-friendly (reflection and depth)
  {
    id: 'despair-1',
    widgetId: 'dua_despair',
    category: 'Despair',
    arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    translation: 'Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.',
    surah: 'Az-Zumar',
    reference: '39:53',
  },
  {
    id: 'trials-1',
    widgetId: 'dua_strength',
    category: 'Strength',
    arabic: 'اللَّهُ لَا يُكَلِّفُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond what it can bear.',
    surah: 'Al-Baqarah',
    reference: '2:286',
  },
  {
    id: 'guidance-1',
    widgetId: 'dua_guidance',
    category: 'Guidance',
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    translation: 'Guide us to the straight path.',
    surah: 'Al-Fatihah',
    reference: '1:6',
  },
  {
    id: 'trust-1',
    widgetId: 'dua_trust',
    category: 'Trust in Allah',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'Whoever relies upon Allah, He is sufficient for him.',
    surah: 'At-Talaq',
    reference: '65:3',
  },
  {
    id: 'peace-1',
    widgetId: 'dua_peace',
    category: 'Peace',
    arabic: 'وَهُوَ الَّذِي يُنَزِّلُ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ',
    translation: 'He is the One who sends tranquility into the hearts of believers.',
    surah: 'Al-Fath',
    reference: '48:4',
  },
  {
    id: 'reflection-1',
    widgetId: 'dua_reflection',
    category: 'Reflection',
    arabic: 'فَأَيْنَ تَذْهَبُونَ',
    translation: 'So where are you going?',
    surah: 'At-Takwir',
    reference: '81:26',
  },
];

/**
 * Get dua by widget ID
 */
export function getDuaByWidgetId(widgetId: string): QuranicDua | undefined {
  return quranicDuas.find((d) => d.widgetId === widgetId);
}

/**
 * Get a dua based on the current day (rotates through all duas)
 */
export function getDailyDua(date: Date = new Date()): QuranicDua {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % quranicDuas.length;
  return quranicDuas[index];
}

/**
 * Get a random dua
 */
export function getRandomDua(): QuranicDua {
  const index = Math.floor(Math.random() * quranicDuas.length);
  return quranicDuas[index];
}

/**
 * Get dua by category
 */
export function getDuaByCategory(category: string): QuranicDua | undefined {
  return quranicDuas.find((d) => d.category.toLowerCase().includes(category.toLowerCase()));
}
