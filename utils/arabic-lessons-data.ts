export type LessonCategory = 'vocabulary' | 'phrases' | 'sentences' | 'quran';
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LessonContent {
  arabic: string;
  transliteration: string;
  translation: string;
  wordBreakdown?: {
    arabic: string;
    transliteration: string;
    meaning: string;
  }[];
}

export interface ArabicLesson {
  id: string;
  title: string;
  titleArabic?: string;
  description: string;
  level: LessonLevel;
  category: LessonCategory;
  order: number;
  content: LessonContent[];
}

// Vocabulary Lessons - Common Quranic Words
const vocabularyLessons: ArabicLesson[] = [
  {
    id: 'vocab-1',
    title: 'Names of Allah',
    titleArabic: 'أَسْمَاء الله',
    description: 'Learn the most common names of Allah found in the Quran',
    level: 'beginner',
    category: 'vocabulary',
    order: 1,
    content: [
      { arabic: 'الله', transliteration: 'Allāh', translation: 'God (The One True God)' },
      { arabic: 'الرَّحْمَن', transliteration: 'ar-Raḥmān', translation: 'The Most Merciful' },
      { arabic: 'الرَّحِيم', transliteration: 'ar-Raḥīm', translation: 'The Especially Merciful' },
      { arabic: 'المَلِك', transliteration: 'al-Malik', translation: 'The King' },
      { arabic: 'القُدُّوس', transliteration: 'al-Quddūs', translation: 'The Holy' },
      { arabic: 'السَّلَام', transliteration: 'as-Salām', translation: 'The Source of Peace' },
      { arabic: 'العَزِيز', transliteration: 'al-ʿAzīz', translation: 'The Mighty' },
      { arabic: 'الحَكِيم', transliteration: 'al-Ḥakīm', translation: 'The Wise' },
    ],
  },
  {
    id: 'vocab-2',
    title: 'Prayer Words',
    titleArabic: 'كَلِمَات الصَّلَاة',
    description: 'Essential words used in daily prayers',
    level: 'beginner',
    category: 'vocabulary',
    order: 2,
    content: [
      { arabic: 'صَلَاة', transliteration: 'ṣalāh', translation: 'prayer' },
      { arabic: 'رُكُوع', transliteration: 'rukūʿ', translation: 'bowing' },
      { arabic: 'سُجُود', transliteration: 'sujūd', translation: 'prostration' },
      { arabic: 'قِيَام', transliteration: 'qiyām', translation: 'standing' },
      { arabic: 'تَشَهُّد', transliteration: 'tashahhud', translation: 'testimony (sitting position)' },
      { arabic: 'سَلَام', transliteration: 'salām', translation: 'peace (greeting)' },
      { arabic: 'تَكْبِير', transliteration: 'takbīr', translation: 'saying "Allahu Akbar"' },
      { arabic: 'وُضُوء', transliteration: 'wuḍūʾ', translation: 'ablution' },
    ],
  },
  {
    id: 'vocab-3',
    title: 'Family Words',
    titleArabic: 'كَلِمَات العَائِلَة',
    description: 'Family-related vocabulary from the Quran',
    level: 'beginner',
    category: 'vocabulary',
    order: 3,
    content: [
      { arabic: 'أَب', transliteration: 'ab', translation: 'father' },
      { arabic: 'أُم', transliteration: 'umm', translation: 'mother' },
      { arabic: 'اِبْن', transliteration: 'ibn', translation: 'son' },
      { arabic: 'بِنْت', transliteration: 'bint', translation: 'daughter' },
      { arabic: 'أَخ', transliteration: 'akh', translation: 'brother' },
      { arabic: 'أُخْت', transliteration: 'ukht', translation: 'sister' },
      { arabic: 'زَوْج', transliteration: 'zawj', translation: 'husband/spouse' },
      { arabic: 'زَوْجَة', transliteration: 'zawjah', translation: 'wife' },
    ],
  },
  {
    id: 'vocab-4',
    title: 'Nature Words',
    titleArabic: 'كَلِمَات الطَّبِيعَة',
    description: 'Words describing nature mentioned in the Quran',
    level: 'beginner',
    category: 'vocabulary',
    order: 4,
    content: [
      { arabic: 'سَمَاء', transliteration: 'samāʾ', translation: 'sky/heaven' },
      { arabic: 'أَرْض', transliteration: 'arḍ', translation: 'earth' },
      { arabic: 'شَمْس', transliteration: 'shams', translation: 'sun' },
      { arabic: 'قَمَر', transliteration: 'qamar', translation: 'moon' },
      { arabic: 'نَجْم', transliteration: 'najm', translation: 'star' },
      { arabic: 'مَاء', transliteration: 'māʾ', translation: 'water' },
      { arabic: 'نَار', transliteration: 'nār', translation: 'fire' },
      { arabic: 'رِيح', transliteration: 'rīḥ', translation: 'wind' },
    ],
  },
  {
    id: 'vocab-5',
    title: 'Time Words',
    titleArabic: 'كَلِمَات الوَقْت',
    description: 'Words related to time in the Quran',
    level: 'beginner',
    category: 'vocabulary',
    order: 5,
    content: [
      { arabic: 'يَوْم', transliteration: 'yawm', translation: 'day' },
      { arabic: 'لَيْل', transliteration: 'layl', translation: 'night' },
      { arabic: 'صُبْح', transliteration: 'ṣubḥ', translation: 'morning' },
      { arabic: 'عَصْر', transliteration: 'ʿaṣr', translation: 'afternoon/time' },
      { arabic: 'فَجْر', transliteration: 'fajr', translation: 'dawn' },
      { arabic: 'سَنَة', transliteration: 'sanah', translation: 'year' },
      { arabic: 'شَهْر', transliteration: 'shahr', translation: 'month' },
      { arabic: 'سَاعَة', transliteration: 'sāʿah', translation: 'hour' },
    ],
  },
  {
    id: 'vocab-6',
    title: 'Action Words',
    titleArabic: 'كَلِمَات الأَفْعَال',
    description: 'Common verbs found in the Quran',
    level: 'intermediate',
    category: 'vocabulary',
    order: 6,
    content: [
      { arabic: 'قَالَ', transliteration: 'qāla', translation: 'he said' },
      { arabic: 'عَمِلَ', transliteration: 'ʿamila', translation: 'he did/worked' },
      { arabic: 'آمَنَ', transliteration: 'āmana', translation: 'he believed' },
      { arabic: 'كَفَرَ', transliteration: 'kafara', translation: 'he disbelieved' },
      { arabic: 'خَلَقَ', transliteration: 'khalaqa', translation: 'he created' },
      { arabic: 'عَلِمَ', transliteration: 'ʿalima', translation: 'he knew' },
      { arabic: 'سَمِعَ', transliteration: 'samiʿa', translation: 'he heard' },
      { arabic: 'رَأَى', transliteration: 'raʾā', translation: 'he saw' },
    ],
  },
  {
    id: 'vocab-7',
    title: 'Spiritual Concepts',
    titleArabic: 'مَفَاهِيم رُوحَانِيَّة',
    description: 'Important spiritual terms in Islamic vocabulary',
    level: 'intermediate',
    category: 'vocabulary',
    order: 7,
    content: [
      { arabic: 'إِيمَان', transliteration: 'īmān', translation: 'faith' },
      { arabic: 'إِسْلَام', transliteration: 'islām', translation: 'submission (to God)' },
      { arabic: 'تَقْوَى', transliteration: 'taqwā', translation: 'God-consciousness' },
      { arabic: 'تَوْبَة', transliteration: 'tawbah', translation: 'repentance' },
      { arabic: 'صَبْر', transliteration: 'ṣabr', translation: 'patience' },
      { arabic: 'شُكْر', transliteration: 'shukr', translation: 'gratitude' },
      { arabic: 'ذِكْر', transliteration: 'dhikr', translation: 'remembrance' },
      { arabic: 'دُعَاء', transliteration: 'duʿāʾ', translation: 'supplication' },
    ],
  },
];

// Phrase Lessons - Common Quranic Phrases
const phraseLessons: ArabicLesson[] = [
  {
    id: 'phrase-1',
    title: 'Daily Islamic Phrases',
    titleArabic: 'عِبَارَات إِسْلَامِيَّة يَوْمِيَّة',
    description: 'Phrases Muslims use daily',
    level: 'beginner',
    category: 'phrases',
    order: 8,
    content: [
      {
        arabic: 'بِسْمِ اللهِ',
        transliteration: 'bismillāh',
        translation: 'In the name of Allah',
        wordBreakdown: [
          { arabic: 'بِسْمِ', transliteration: 'bismi', meaning: 'in the name of' },
          { arabic: 'الله', transliteration: 'Allāh', meaning: 'God' },
        ],
      },
      {
        arabic: 'الحَمْدُ لِلَّه',
        transliteration: 'al-ḥamdu lillāh',
        translation: 'All praise is due to Allah',
        wordBreakdown: [
          { arabic: 'الحَمْدُ', transliteration: 'al-ḥamdu', meaning: 'the praise' },
          { arabic: 'لِلَّه', transliteration: 'lillāh', meaning: 'to/for Allah' },
        ],
      },
      {
        arabic: 'سُبْحَانَ الله',
        transliteration: 'subḥān Allāh',
        translation: 'Glory be to Allah',
        wordBreakdown: [
          { arabic: 'سُبْحَانَ', transliteration: 'subḥān', meaning: 'glory/exalted' },
          { arabic: 'الله', transliteration: 'Allāh', meaning: 'God' },
        ],
      },
      {
        arabic: 'الله أَكْبَر',
        transliteration: 'Allāhu akbar',
        translation: 'Allah is the Greatest',
        wordBreakdown: [
          { arabic: 'الله', transliteration: 'Allāh', meaning: 'God' },
          { arabic: 'أَكْبَر', transliteration: 'akbar', meaning: 'greatest' },
        ],
      },
      {
        arabic: 'إِنْ شَاءَ الله',
        transliteration: 'in shāʾ Allāh',
        translation: 'If Allah wills',
        wordBreakdown: [
          { arabic: 'إِنْ', transliteration: 'in', meaning: 'if' },
          { arabic: 'شَاءَ', transliteration: 'shāʾa', meaning: 'wills' },
          { arabic: 'الله', transliteration: 'Allāh', meaning: 'God' },
        ],
      },
      {
        arabic: 'مَا شَاءَ الله',
        transliteration: 'mā shāʾ Allāh',
        translation: 'What Allah has willed',
        wordBreakdown: [
          { arabic: 'مَا', transliteration: 'mā', meaning: 'what' },
          { arabic: 'شَاءَ', transliteration: 'shāʾa', meaning: 'willed' },
          { arabic: 'الله', transliteration: 'Allāh', meaning: 'God' },
        ],
      },
    ],
  },
  {
    id: 'phrase-2',
    title: 'Greetings & Responses',
    titleArabic: 'التَّحِيَّات وَالرُّدُود',
    description: 'Islamic greetings and their responses',
    level: 'beginner',
    category: 'phrases',
    order: 9,
    content: [
      {
        arabic: 'السَّلَامُ عَلَيْكُم',
        transliteration: 'as-salāmu ʿalaykum',
        translation: 'Peace be upon you',
        wordBreakdown: [
          { arabic: 'السَّلَامُ', transliteration: 'as-salāmu', meaning: 'the peace' },
          { arabic: 'عَلَيْكُم', transliteration: 'ʿalaykum', meaning: 'upon you (plural)' },
        ],
      },
      {
        arabic: 'وَعَلَيْكُمُ السَّلَام',
        transliteration: 'wa ʿalaykum as-salām',
        translation: 'And upon you be peace',
        wordBreakdown: [
          { arabic: 'وَ', transliteration: 'wa', meaning: 'and' },
          { arabic: 'عَلَيْكُمُ', transliteration: 'ʿalaykumu', meaning: 'upon you' },
          { arabic: 'السَّلَام', transliteration: 'as-salām', meaning: 'the peace' },
        ],
      },
      {
        arabic: 'جَزَاكَ اللهُ خَيْرًا',
        transliteration: 'jazāk Allāhu khayran',
        translation: 'May Allah reward you with good',
        wordBreakdown: [
          { arabic: 'جَزَاكَ', transliteration: 'jazāka', meaning: 'may He reward you' },
          { arabic: 'اللهُ', transliteration: 'Allāhu', meaning: 'God' },
          { arabic: 'خَيْرًا', transliteration: 'khayran', meaning: 'good' },
        ],
      },
      {
        arabic: 'بَارَكَ اللهُ فِيك',
        transliteration: 'bārak Allāhu fīk',
        translation: 'May Allah bless you',
        wordBreakdown: [
          { arabic: 'بَارَكَ', transliteration: 'bāraka', meaning: 'blessed' },
          { arabic: 'اللهُ', transliteration: 'Allāhu', meaning: 'God' },
          { arabic: 'فِيك', transliteration: 'fīka', meaning: 'in you' },
        ],
      },
    ],
  },
  {
    id: 'phrase-3',
    title: 'Seeking Forgiveness',
    titleArabic: 'طَلَب المَغْفِرَة',
    description: 'Phrases for seeking forgiveness',
    level: 'intermediate',
    category: 'phrases',
    order: 10,
    content: [
      {
        arabic: 'أَسْتَغْفِرُ الله',
        transliteration: 'astaghfiru Allāh',
        translation: 'I seek forgiveness from Allah',
        wordBreakdown: [
          { arabic: 'أَسْتَغْفِرُ', transliteration: 'astaghfiru', meaning: 'I seek forgiveness' },
          { arabic: 'الله', transliteration: 'Allāh', meaning: 'God' },
        ],
      },
      {
        arabic: 'رَبِّ اغْفِرْ لِي',
        transliteration: 'rabbi-ghfir lī',
        translation: 'My Lord, forgive me',
        wordBreakdown: [
          { arabic: 'رَبِّ', transliteration: 'rabbi', meaning: 'my Lord' },
          { arabic: 'اغْفِرْ', transliteration: 'ighfir', meaning: 'forgive' },
          { arabic: 'لِي', transliteration: 'lī', meaning: 'for me' },
        ],
      },
      {
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ',
        transliteration: 'Allāhumma innī asʾaluka al-ʿafwa',
        translation: 'O Allah, I ask You for pardon',
        wordBreakdown: [
          { arabic: 'اللَّهُمَّ', transliteration: 'Allāhumma', meaning: 'O Allah' },
          { arabic: 'إِنِّي', transliteration: 'innī', meaning: 'indeed I' },
          { arabic: 'أَسْأَلُكَ', transliteration: 'asʾaluka', meaning: 'I ask You' },
          { arabic: 'العَفْوَ', transliteration: 'al-ʿafwa', meaning: 'the pardon' },
        ],
      },
    ],
  },
];

// Sentence Lessons - Quranic Verses
const sentenceLessons: ArabicLesson[] = [
  {
    id: 'sentence-1',
    title: 'Surah Al-Fatiha',
    titleArabic: 'سُورَة الفَاتِحَة',
    description: 'The Opening Chapter - most recited surah',
    level: 'beginner',
    category: 'quran',
    order: 11,
    content: [
      {
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'bismillāhi r-raḥmāni r-raḥīm',
        translation: 'In the name of Allah, the Most Merciful, the Especially Merciful',
        wordBreakdown: [
          { arabic: 'بِسْمِ', transliteration: 'bismi', meaning: 'in the name of' },
          { arabic: 'اللَّهِ', transliteration: 'Allāhi', meaning: 'God' },
          { arabic: 'الرَّحْمَٰنِ', transliteration: 'ar-raḥmāni', meaning: 'the Most Merciful' },
          { arabic: 'الرَّحِيمِ', transliteration: 'ar-raḥīmi', meaning: 'the Especially Merciful' },
        ],
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        transliteration: 'al-ḥamdu lillāhi rabbi l-ʿālamīn',
        translation: 'All praise is due to Allah, Lord of the worlds',
        wordBreakdown: [
          { arabic: 'الْحَمْدُ', transliteration: 'al-ḥamdu', meaning: 'the praise' },
          { arabic: 'لِلَّهِ', transliteration: 'lillāhi', meaning: 'to/for Allah' },
          { arabic: 'رَبِّ', transliteration: 'rabbi', meaning: 'Lord of' },
          { arabic: 'الْعَالَمِينَ', transliteration: 'al-ʿālamīna', meaning: 'the worlds' },
        ],
      },
      {
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'ar-raḥmāni r-raḥīm',
        translation: 'The Most Merciful, the Especially Merciful',
        wordBreakdown: [
          { arabic: 'الرَّحْمَٰنِ', transliteration: 'ar-raḥmāni', meaning: 'the Most Merciful' },
          { arabic: 'الرَّحِيمِ', transliteration: 'ar-raḥīmi', meaning: 'the Especially Merciful' },
        ],
      },
      {
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        transliteration: 'māliki yawmi d-dīn',
        translation: 'Master of the Day of Judgment',
        wordBreakdown: [
          { arabic: 'مَالِكِ', transliteration: 'māliki', meaning: 'Master/Owner of' },
          { arabic: 'يَوْمِ', transliteration: 'yawmi', meaning: 'day of' },
          { arabic: 'الدِّينِ', transliteration: 'ad-dīni', meaning: 'the Judgment/Religion' },
        ],
      },
      {
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        transliteration: 'iyyāka naʿbudu wa iyyāka nastaʿīn',
        translation: 'You alone we worship, and You alone we ask for help',
        wordBreakdown: [
          { arabic: 'إِيَّاكَ', transliteration: 'iyyāka', meaning: 'You alone' },
          { arabic: 'نَعْبُدُ', transliteration: 'naʿbudu', meaning: 'we worship' },
          { arabic: 'وَ', transliteration: 'wa', meaning: 'and' },
          { arabic: 'إِيَّاكَ', transliteration: 'iyyāka', meaning: 'You alone' },
          { arabic: 'نَسْتَعِينُ', transliteration: 'nastaʿīnu', meaning: 'we ask for help' },
        ],
      },
      {
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        transliteration: 'ihdinā ṣ-ṣirāṭa l-mustaqīm',
        translation: 'Guide us to the straight path',
        wordBreakdown: [
          { arabic: 'اهْدِنَا', transliteration: 'ihdinā', meaning: 'guide us' },
          { arabic: 'الصِّرَاطَ', transliteration: 'aṣ-ṣirāṭa', meaning: 'the path' },
          { arabic: 'الْمُسْتَقِيمَ', transliteration: 'al-mustaqīma', meaning: 'the straight' },
        ],
      },
      {
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        transliteration: 'ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa lā ḍ-ḍāllīn',
        translation: 'The path of those upon whom You have bestowed favor, not of those who have earned anger or of those who are astray',
        wordBreakdown: [
          { arabic: 'صِرَاطَ', transliteration: 'ṣirāṭa', meaning: 'path of' },
          { arabic: 'الَّذِينَ', transliteration: 'alladhīna', meaning: 'those who' },
          { arabic: 'أَنْعَمْتَ', transliteration: 'anʿamta', meaning: 'You bestowed favor' },
          { arabic: 'عَلَيْهِمْ', transliteration: 'ʿalayhim', meaning: 'upon them' },
          { arabic: 'غَيْرِ', transliteration: 'ghayri', meaning: 'not' },
          { arabic: 'الْمَغْضُوبِ', transliteration: 'al-maghḍūbi', meaning: 'those who earned anger' },
          { arabic: 'وَلَا', transliteration: 'wa lā', meaning: 'and not' },
          { arabic: 'الضَّالِّينَ', transliteration: 'aḍ-ḍāllīna', meaning: 'those astray' },
        ],
      },
    ],
  },
  {
    id: 'sentence-2',
    title: 'Surah Al-Ikhlas',
    titleArabic: 'سُورَة الإِخْلَاص',
    description: 'The Chapter of Sincerity - equals one-third of the Quran',
    level: 'beginner',
    category: 'quran',
    order: 12,
    content: [
      {
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'qul huwa Allāhu aḥad',
        translation: 'Say: He is Allah, the One',
        wordBreakdown: [
          { arabic: 'قُلْ', transliteration: 'qul', meaning: 'say' },
          { arabic: 'هُوَ', transliteration: 'huwa', meaning: 'He is' },
          { arabic: 'اللَّهُ', transliteration: 'Allāhu', meaning: 'God' },
          { arabic: 'أَحَدٌ', transliteration: 'aḥadun', meaning: 'One' },
        ],
      },
      {
        arabic: 'اللَّهُ الصَّمَدُ',
        transliteration: 'Allāhu ṣ-ṣamad',
        translation: 'Allah, the Eternal Refuge',
        wordBreakdown: [
          { arabic: 'اللَّهُ', transliteration: 'Allāhu', meaning: 'God' },
          { arabic: 'الصَّمَدُ', transliteration: 'aṣ-ṣamadu', meaning: 'the Eternal Refuge' },
        ],
      },
      {
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        transliteration: 'lam yalid wa lam yūlad',
        translation: 'He neither begets nor is born',
        wordBreakdown: [
          { arabic: 'لَمْ', transliteration: 'lam', meaning: 'not' },
          { arabic: 'يَلِدْ', transliteration: 'yalid', meaning: 'He begets' },
          { arabic: 'وَ', transliteration: 'wa', meaning: 'and' },
          { arabic: 'لَمْ', transliteration: 'lam', meaning: 'not' },
          { arabic: 'يُولَدْ', transliteration: 'yūlad', meaning: 'He is born' },
        ],
      },
      {
        arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        transliteration: 'wa lam yakun lahu kufuwan aḥad',
        translation: 'Nor is there to Him any equivalent',
        wordBreakdown: [
          { arabic: 'وَ', transliteration: 'wa', meaning: 'and' },
          { arabic: 'لَمْ', transliteration: 'lam', meaning: 'not' },
          { arabic: 'يَكُن', transliteration: 'yakun', meaning: 'there is' },
          { arabic: 'لَّهُ', transliteration: 'lahu', meaning: 'to Him' },
          { arabic: 'كُفُوًا', transliteration: 'kufuwan', meaning: 'equivalent' },
          { arabic: 'أَحَدٌ', transliteration: 'aḥadun', meaning: 'anyone' },
        ],
      },
    ],
  },
  {
    id: 'sentence-3',
    title: 'Ayat al-Kursi',
    titleArabic: 'آيَة الكُرْسِي',
    description: 'The Verse of the Throne - greatest verse in the Quran',
    level: 'advanced',
    category: 'quran',
    order: 13,
    content: [
      {
        arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
        transliteration: 'Allāhu lā ilāha illā huwa l-ḥayyu l-qayyūm',
        translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence',
        wordBreakdown: [
          { arabic: 'اللَّهُ', transliteration: 'Allāhu', meaning: 'God' },
          { arabic: 'لَا', transliteration: 'lā', meaning: 'no/not' },
          { arabic: 'إِلَٰهَ', transliteration: 'ilāha', meaning: 'deity' },
          { arabic: 'إِلَّا', transliteration: 'illā', meaning: 'except' },
          { arabic: 'هُوَ', transliteration: 'huwa', meaning: 'He' },
          { arabic: 'الْحَيُّ', transliteration: 'al-ḥayyu', meaning: 'the Ever-Living' },
          { arabic: 'الْقَيُّومُ', transliteration: 'al-qayyūmu', meaning: 'the Sustainer' },
        ],
      },
      {
        arabic: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
        transliteration: 'lā taʾkhudhuhu sinatun wa lā nawm',
        translation: 'Neither drowsiness overtakes Him nor sleep',
        wordBreakdown: [
          { arabic: 'لَا', transliteration: 'lā', meaning: 'not' },
          { arabic: 'تَأْخُذُهُ', transliteration: 'taʾkhudhuhu', meaning: 'overtakes Him' },
          { arabic: 'سِنَةٌ', transliteration: 'sinatun', meaning: 'drowsiness' },
          { arabic: 'وَلَا', transliteration: 'wa lā', meaning: 'and not' },
          { arabic: 'نَوْمٌ', transliteration: 'nawmun', meaning: 'sleep' },
        ],
      },
      {
        arabic: 'لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
        transliteration: 'lahu mā fī s-samāwāti wa mā fī l-arḍ',
        translation: 'To Him belongs whatever is in the heavens and whatever is on the earth',
        wordBreakdown: [
          { arabic: 'لَّهُ', transliteration: 'lahu', meaning: 'to Him belongs' },
          { arabic: 'مَا', transliteration: 'mā', meaning: 'whatever' },
          { arabic: 'فِي', transliteration: 'fī', meaning: 'in' },
          { arabic: 'السَّمَاوَاتِ', transliteration: 'as-samāwāti', meaning: 'the heavens' },
          { arabic: 'وَمَا', transliteration: 'wa mā', meaning: 'and whatever' },
          { arabic: 'فِي', transliteration: 'fī', meaning: 'in' },
          { arabic: 'الْأَرْضِ', transliteration: 'al-arḍi', meaning: 'the earth' },
        ],
      },
    ],
  },
  {
    id: 'sentence-4',
    title: 'Surah An-Nas',
    titleArabic: 'سُورَة النَّاس',
    description: 'The Chapter of Mankind - seeking refuge from evil',
    level: 'beginner',
    category: 'quran',
    order: 14,
    content: [
      {
        arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        transliteration: 'qul aʿūdhu bi rabbi n-nās',
        translation: 'Say: I seek refuge in the Lord of mankind',
        wordBreakdown: [
          { arabic: 'قُلْ', transliteration: 'qul', meaning: 'say' },
          { arabic: 'أَعُوذُ', transliteration: 'aʿūdhu', meaning: 'I seek refuge' },
          { arabic: 'بِرَبِّ', transliteration: 'bi rabbi', meaning: 'in the Lord of' },
          { arabic: 'النَّاسِ', transliteration: 'an-nāsi', meaning: 'mankind' },
        ],
      },
      {
        arabic: 'مَلِكِ النَّاسِ',
        transliteration: 'maliki n-nās',
        translation: 'The Sovereign of mankind',
        wordBreakdown: [
          { arabic: 'مَلِكِ', transliteration: 'maliki', meaning: 'the Sovereign of' },
          { arabic: 'النَّاسِ', transliteration: 'an-nāsi', meaning: 'mankind' },
        ],
      },
      {
        arabic: 'إِلَٰهِ النَّاسِ',
        transliteration: 'ilāhi n-nās',
        translation: 'The God of mankind',
        wordBreakdown: [
          { arabic: 'إِلَٰهِ', transliteration: 'ilāhi', meaning: 'the God of' },
          { arabic: 'النَّاسِ', transliteration: 'an-nāsi', meaning: 'mankind' },
        ],
      },
      {
        arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        transliteration: 'min sharri l-waswāsi l-khannās',
        translation: 'From the evil of the retreating whisperer',
        wordBreakdown: [
          { arabic: 'مِن', transliteration: 'min', meaning: 'from' },
          { arabic: 'شَرِّ', transliteration: 'sharri', meaning: 'evil of' },
          { arabic: 'الْوَسْوَاسِ', transliteration: 'al-waswāsi', meaning: 'the whisperer' },
          { arabic: 'الْخَنَّاسِ', transliteration: 'al-khannāsi', meaning: 'the retreating' },
        ],
      },
      {
        arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        transliteration: 'alladhī yuwaswisu fī ṣudūri n-nās',
        translation: 'Who whispers in the breasts of mankind',
        wordBreakdown: [
          { arabic: 'الَّذِي', transliteration: 'alladhī', meaning: 'who' },
          { arabic: 'يُوَسْوِسُ', transliteration: 'yuwaswisu', meaning: 'whispers' },
          { arabic: 'فِي', transliteration: 'fī', meaning: 'in' },
          { arabic: 'صُدُورِ', transliteration: 'ṣudūri', meaning: 'breasts of' },
          { arabic: 'النَّاسِ', transliteration: 'an-nāsi', meaning: 'mankind' },
        ],
      },
      {
        arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        transliteration: 'mina l-jinnati wa n-nās',
        translation: 'From among the jinn and mankind',
        wordBreakdown: [
          { arabic: 'مِنَ', transliteration: 'mina', meaning: 'from' },
          { arabic: 'الْجِنَّةِ', transliteration: 'al-jinnati', meaning: 'the jinn' },
          { arabic: 'وَ', transliteration: 'wa', meaning: 'and' },
          { arabic: 'النَّاسِ', transliteration: 'an-nāsi', meaning: 'mankind' },
        ],
      },
    ],
  },
  {
    id: 'sentence-5',
    title: 'Surah Al-Falaq',
    titleArabic: 'سُورَة الفَلَق',
    description: 'The Chapter of Daybreak - protection from harm',
    level: 'beginner',
    category: 'quran',
    order: 15,
    content: [
      {
        arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        transliteration: 'qul aʿūdhu bi rabbi l-falaq',
        translation: 'Say: I seek refuge in the Lord of daybreak',
        wordBreakdown: [
          { arabic: 'قُلْ', transliteration: 'qul', meaning: 'say' },
          { arabic: 'أَعُوذُ', transliteration: 'aʿūdhu', meaning: 'I seek refuge' },
          { arabic: 'بِرَبِّ', transliteration: 'bi rabbi', meaning: 'in the Lord of' },
          { arabic: 'الْفَلَقِ', transliteration: 'al-falaqi', meaning: 'the daybreak' },
        ],
      },
      {
        arabic: 'مِن شَرِّ مَا خَلَقَ',
        transliteration: 'min sharri mā khalaq',
        translation: 'From the evil of that which He created',
        wordBreakdown: [
          { arabic: 'مِن', transliteration: 'min', meaning: 'from' },
          { arabic: 'شَرِّ', transliteration: 'sharri', meaning: 'evil of' },
          { arabic: 'مَا', transliteration: 'mā', meaning: 'that which' },
          { arabic: 'خَلَقَ', transliteration: 'khalaqa', meaning: 'He created' },
        ],
      },
      {
        arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        transliteration: 'wa min sharri ghāsiqin idhā waqab',
        translation: 'And from the evil of darkness when it settles',
        wordBreakdown: [
          { arabic: 'وَمِن', transliteration: 'wa min', meaning: 'and from' },
          { arabic: 'شَرِّ', transliteration: 'sharri', meaning: 'evil of' },
          { arabic: 'غَاسِقٍ', transliteration: 'ghāsiqin', meaning: 'darkness' },
          { arabic: 'إِذَا', transliteration: 'idhā', meaning: 'when' },
          { arabic: 'وَقَبَ', transliteration: 'waqaba', meaning: 'it settles' },
        ],
      },
      {
        arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        transliteration: 'wa min sharri n-naffāthāti fī l-ʿuqad',
        translation: 'And from the evil of the blowers in knots',
        wordBreakdown: [
          { arabic: 'وَمِن', transliteration: 'wa min', meaning: 'and from' },
          { arabic: 'شَرِّ', transliteration: 'sharri', meaning: 'evil of' },
          { arabic: 'النَّفَّاثَاتِ', transliteration: 'an-naffāthāti', meaning: 'the blowers' },
          { arabic: 'فِي', transliteration: 'fī', meaning: 'in' },
          { arabic: 'الْعُقَدِ', transliteration: 'al-ʿuqadi', meaning: 'the knots' },
        ],
      },
      {
        arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        transliteration: 'wa min sharri ḥāsidin idhā ḥasad',
        translation: 'And from the evil of an envier when he envies',
        wordBreakdown: [
          { arabic: 'وَمِن', transliteration: 'wa min', meaning: 'and from' },
          { arabic: 'شَرِّ', transliteration: 'sharri', meaning: 'evil of' },
          { arabic: 'حَاسِدٍ', transliteration: 'ḥāsidin', meaning: 'an envier' },
          { arabic: 'إِذَا', transliteration: 'idhā', meaning: 'when' },
          { arabic: 'حَسَدَ', transliteration: 'ḥasada', meaning: 'he envies' },
        ],
      },
    ],
  },
];

// Export all lessons combined
export const allLessons: ArabicLesson[] = [
  ...vocabularyLessons,
  ...phraseLessons,
  ...sentenceLessons,
].sort((a, b) => a.order - b.order);

// Helper functions
export const getLessonById = (id: string): ArabicLesson | undefined => {
  return allLessons.find((lesson) => lesson.id === id);
};

export const getLessonsByCategory = (category: LessonCategory): ArabicLesson[] => {
  return allLessons.filter((lesson) => lesson.category === category);
};

export const getLessonsByLevel = (level: LessonLevel): ArabicLesson[] => {
  return allLessons.filter((lesson) => lesson.level === level);
};

export const getTotalLessons = (): number => {
  return allLessons.length;
};

export const getCategories = (): { id: LessonCategory; label: string; count: number }[] => {
  return [
    { id: 'vocabulary', label: 'Vocabulary', count: getLessonsByCategory('vocabulary').length },
    { id: 'phrases', label: 'Phrases', count: getLessonsByCategory('phrases').length },
    { id: 'quran', label: 'Quran', count: getLessonsByCategory('quran').length },
  ];
};
