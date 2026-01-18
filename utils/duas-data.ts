export type DuaCategory = 'morning' | 'evening' | 'after-prayer' | 'before-sleep' | 'protection' | 'forgiveness' | 'guidance';

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

// Morning Duas (Adhkar al-Sabah)
export const morningDuas: Dua[] = [
  {
    id: 'morning-fatiha',
    title: 'Surah Al-Fatiha',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
    transliteration: 'Bismillahir Rahmanir Raheem. Alhamdu lillahi Rabbil aalameen. Ar-Rahmanir Raheem. Maliki yawmid deen. Iyyaka nabudu wa iyyaka nastaeen. Ihdinas siratal mustaqeem. Siratal ladheena anamta alayhim ghayril maghdoobi alayhim wa lad daalleen.',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favor, not of those who have earned Your anger or of those who are astray.',
    category: 'morning',
    meaning: 'The Opening - the greatest surah in the Quran, recited in every prayer.',
    reference: 'Quran 1:1-7',
    verseRange: { surah: 1, startVerse: 1, endVerse: 7 },
  },
  {
    id: 'morning-kursi',
    title: 'Ayat al-Kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allahu la ilaha illa Huwal Hayyul Qayyum. La takhudhuhu sinatun wa la nawm. Lahu ma fis samawati wa ma fil ard. Man dhal ladhi yashfau indahu illa bi idhnih. Yalamu ma bayna aydeehim wa ma khalfahum wa la yuheetoona bi shayin min ilmihi illa bi ma shaa. Wasia kursiyyuhus samawati wal ard wa la yaooduhu hifduhuma wa Huwal Aliyyul Adheem.',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    category: 'morning',
    meaning: 'The Verse of the Throne - one of the most powerful verses in the Quran for protection.',
    reference: 'Quran 2:255',
    verseKey: '2:255',
  },
  {
    id: 'morning-baqarah-end',
    title: 'Last Two Verses of Al-Baqarah',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ﴿٢٨٥﴾ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ﴿٢٨٦﴾',
    transliteration: 'Amanar Rasoolu bima unzila ilayhi mir Rabbihi wal muminoon. Kullun amana billahi wa malaikatihi wa kutubihi wa rusulihi la nufarriqu bayna ahadim mir rusulih. Wa qaloo samina wa atana ghufranaka Rabbana wa ilaykal maseer. La yukalliful lahu nafsan illa wusaha. Laha ma kasabat wa alayha maktasabat. Rabbana la tuakhidhna in naseena aw akhtana. Rabbana wa la tahmil alayna isran kama hamaltahu alal ladheena min qablina. Rabbana wa la tuhammilna ma la taqata lana bih. Wafu anna waghfir lana warhamna. Anta mawlana fansurna alal qawmil kafireen.',
    translation: 'The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All of them have believed in Allah and His angels and His books and His messengers, saying "We make no distinction between any of His messengers." And they say, "We hear and we obey. Grant us Your forgiveness, our Lord, and to You is the final destination." Allah does not charge a soul except with that within its capacity. It will have what good it has gained, and it will bear what evil it has earned. "Our Lord, do not impose blame upon us if we forget or err. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us and forgive us and have mercy upon us. You are our protector, so give us victory over the disbelieving people."',
    category: 'morning',
    meaning: 'The Prophet (PBUH) said: "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him."',
    reference: 'Quran 2:285-286',
    verseRange: { surah: 2, startVerse: 285, endVerse: 286 },
  },
];

// Evening Duas (Adhkar al-Masa)
export const eveningDuas: Dua[] = [
  {
    id: 'evening-ikhlas',
    title: 'Surah Al-Ikhlas',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾',
    transliteration: 'Qul Huwal lahu Ahad. Allahus Samad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan ahad.',
    translation: 'Say, "He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent."',
    category: 'evening',
    meaning: 'Surah Al-Ikhlas is equivalent to one-third of the Quran in reward.',
    reference: 'Quran 112:1-4',
    verseRange: { surah: 112, startVerse: 1, endVerse: 4 },
  },
  {
    id: 'evening-falaq',
    title: 'Surah Al-Falaq',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾',
    transliteration: 'Qul aoodhu bi Rabbil falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin naffathati fil uqad. Wa min sharri hasidin idha hasad.',
    translation: 'Say, "I seek refuge in the Lord of daybreak. From the evil of that which He created. And from the evil of darkness when it settles. And from the evil of the blowers in knots. And from the evil of an envier when he envies."',
    category: 'evening',
    meaning: 'One of the two surahs of protection (Al-Muawwidhatain).',
    reference: 'Quran 113:1-5',
    verseRange: { surah: 113, startVerse: 1, endVerse: 5 },
  },
  {
    id: 'evening-nas',
    title: 'Surah An-Nas',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾',
    transliteration: 'Qul aoodhu bi Rabbin nas. Malikin nas. Ilahin nas. Min sharril waswasil khannas. Alladhi yuwaswisu fee sudoorin nas. Minal jinnati wan nas.',
    translation: 'Say, "I seek refuge in the Lord of mankind. The Sovereign of mankind. The God of mankind. From the evil of the retreating whisperer. Who whispers evil into the breasts of mankind. From among the jinn and mankind."',
    category: 'evening',
    meaning: 'The last surah of the Quran, seeking protection from evil whispers.',
    reference: 'Quran 114:1-6',
    verseRange: { surah: 114, startVerse: 1, endVerse: 6 },
  },
];

// After Prayer Duas
export const afterPrayerDuas: Dua[] = [
  {
    id: 'after-prayer-kursi',
    title: 'Ayat al-Kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allahu la ilaha illa Huwal Hayyul Qayyum. La takhudhuhu sinatun wa la nawm. Lahu ma fis samawati wa ma fil ard. Man dhal ladhi yashfau indahu illa bi idhnih. Yalamu ma bayna aydeehim wa ma khalfahum wa la yuheetoona bi shayin min ilmihi illa bi ma shaa. Wasia kursiyyuhus samawati wal ard wa la yaooduhu hifduhuma wa Huwal Aliyyul Adheem.',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    category: 'after-prayer',
    meaning: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.',
    reference: 'Quran 2:255',
    verseKey: '2:255',
  },
  {
    id: 'after-prayer-hashr',
    title: 'Last Three Verses of Al-Hashr',
    arabic: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ ۖ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ ۖ هُوَ الرَّحْمَٰنُ الرَّحِيمُ ﴿٢٢﴾ هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ ۚ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ ﴿٢٣﴾ هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ ۖ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ ۚ يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ ﴿٢٤﴾',
    transliteration: 'Huwal lahul ladhi la ilaha illa Hu. Alimul ghaybi wash shahadah. Huwar Rahmanur Raheem. Huwal lahul ladhi la ilaha illa Huwal Malikul Quddoosus Salamul Muminul Muhayminul Azeezul Jabbarul Mutakabbir. Subhanal lahi amma yushrikoon. Huwal lahul Khaliqul Bari ul Musawwir. Lahul asma ul husna. Yusabbihu lahu ma fis samawati wal ard. Wa Huwal Azeezul Hakeem.',
    translation: 'He is Allah, other than whom there is no deity, Knower of the unseen and the witnessed. He is the Most Gracious, the Most Merciful. He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection, the Grantor of Security, the Overseer, the Exalted in Might, the Compeller, the Superior. Exalted is Allah above whatever they associate with Him. He is Allah, the Creator, the Inventor, the Fashioner; to Him belong the best names. Whatever is in the heavens and earth glorifies Him. And He is the Exalted in Might, the Wise.',
    category: 'after-prayer',
    meaning: 'These verses contain many of Allah\'s beautiful names and attributes.',
    reference: 'Quran 59:22-24',
    verseRange: { surah: 59, startVerse: 22, endVerse: 24 },
  },
];

// Before Sleep Duas
export const beforeSleepDuas: Dua[] = [
  {
    id: 'sleep-mulk',
    title: 'Surah Al-Mulk (First 5 Verses)',
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿١﴾ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ ﴿٢﴾ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ ﴿٣﴾',
    transliteration: 'Tabarakal ladhi biyadihil mulku wa Huwa ala kulli shayin Qadeer. Alladhi khalaqal mawta wal hayata liyabluwakum ayyukum ahsanu amala. Wa Huwal Azeezul Ghafoor. Alladhi khalaqa saba samawatin tibaqan. Ma tara fee khalqir Rahmani min tafawut. Farjiil basara hal tara min futoor.',
    translation: 'Blessed is He in whose hand is dominion, and He is over all things competent. He who created death and life to test you as to which of you is best in deed - and He is the Exalted in Might, the Forgiving. He who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return your vision to the sky; do you see any breaks?',
    category: 'before-sleep',
    meaning: 'Surah Al-Mulk protects from the punishment of the grave when recited before sleep.',
    reference: 'Quran 67:1-3',
    verseRange: { surah: 67, startVerse: 1, endVerse: 3 },
  },
  {
    id: 'sleep-kursi',
    title: 'Ayat al-Kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allahu la ilaha illa Huwal Hayyul Qayyum. La takhudhuhu sinatun wa la nawm. Lahu ma fis samawati wa ma fil ard. Man dhal ladhi yashfau indahu illa bi idhnih. Yalamu ma bayna aydeehim wa ma khalfahum wa la yuheetoona bi shayin min ilmihi illa bi ma shaa. Wasia kursiyyuhus samawati wal ard wa la yaooduhu hifduhuma wa Huwal Aliyyul Adheem.',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    category: 'before-sleep',
    meaning: 'When going to bed, reciting Ayat al-Kursi provides protection throughout the night.',
    reference: 'Quran 2:255',
    verseKey: '2:255',
  },
  {
    id: 'sleep-kafirun',
    title: 'Surah Al-Kafirun',
    arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ ﴿١﴾ لَا أَعْبُدُ مَا تَعْبُدُونَ ﴿٢﴾ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ﴿٣﴾ وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ ﴿٤﴾ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ﴿٥﴾ لَكُمْ دِينُكُمْ وَلِيَ دِينِ ﴿٦﴾',
    transliteration: 'Qul ya ayyuhal kafirun. La abudu ma tabudun. Wa la antum abiduna ma abud. Wa la ana abidum ma abadtum. Wa la antum abiduna ma abud. Lakum deenukum wa liya deen.',
    translation: 'Say, "O disbelievers, I do not worship what you worship. Nor are you worshippers of what I worship. Nor will I be a worshipper of what you worship. Nor will you be worshippers of what I worship. For you is your religion, and for me is my religion."',
    category: 'before-sleep',
    meaning: 'The Prophet (PBUH) used to recite this surah before sleeping as a declaration of faith.',
    reference: 'Quran 109:1-6',
    verseRange: { surah: 109, startVerse: 1, endVerse: 6 },
  },
];

// Protection Duas
export const protectionDuas: Dua[] = [
  {
    id: 'protection-yunus',
    title: 'Dua of Prophet Yunus',
    arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa Anta Subhanaka inni kuntu minaz zalimeen.',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    category: 'protection',
    meaning: 'The dua of Prophet Yunus (Jonah) from inside the whale. Allah said no Muslim makes this dua for anything except that Allah answers him.',
    reference: 'Quran 21:87',
    verseKey: '21:87',
  },
  {
    id: 'protection-imran',
    title: 'Dua for Protection',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
    transliteration: 'Rabbana la tuzigh quloobana bada idh hadaytana wa hab lana min ladunka rahmah. Innaka Antal Wahhab.',
    translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
    category: 'protection',
    meaning: 'A powerful dua to keep steadfast on guidance.',
    reference: 'Quran 3:8',
    verseKey: '3:8',
  },
  {
    id: 'protection-tawbah',
    title: 'Trust in Allah',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: 'Hasbiyal lahu la ilaha illa Hu. Alayhi tawakkaltu wa Huwa Rabbul Arshil Azeem.',
    translation: 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.',
    category: 'protection',
    meaning: 'Whoever says this seven times in the morning and evening, Allah will suffice him in all matters.',
    reference: 'Quran 9:129',
    verseKey: '9:129',
  },
];

// Forgiveness Duas
export const forgivenessDuas: Dua[] = [
  {
    id: 'forgiveness-baqarah',
    title: 'Dua for Forgiveness',
    arabic: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Rabbana ighfir lana dhunuubana wa israfana fee amrina wa thabbit aqdamana wansurna alal qawmil kafireen.',
    translation: 'Our Lord, forgive us our sins and the excess committed in our affairs and plant firmly our feet and give us victory over the disbelieving people.',
    category: 'forgiveness',
    meaning: 'A comprehensive dua seeking forgiveness, steadfastness, and victory.',
    reference: 'Quran 3:147',
    verseKey: '3:147',
  },
  {
    id: 'forgiveness-nuh',
    title: 'Dua of Prophet Nuh',
    arabic: 'رَّبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ',
    transliteration: 'Rabbighfir li wa li walidayya wa li man dakhala baytiya muminan wa lil mumineena wal muminat.',
    translation: 'My Lord, forgive me and my parents and whoever enters my house a believer and the believing men and believing women.',
    category: 'forgiveness',
    meaning: 'A beautiful dua of Prophet Nuh asking forgiveness for himself, his parents, and all believers.',
    reference: 'Quran 71:28',
    verseKey: '71:28',
  },
  {
    id: 'forgiveness-tahrim',
    title: 'Complete Repentance',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana atina fid dunya hasanatan wa fil akhirati hasanatan wa qina adhaban nar.',
    translation: 'Our Lord, give us in this world good and in the Hereafter good and protect us from the punishment of the Fire.',
    category: 'forgiveness',
    meaning: 'One of the most frequently made duas by the Prophet (PBUH).',
    reference: 'Quran 2:201',
    verseKey: '2:201',
  },
];

// Guidance Duas
export const guidanceDuas: Dua[] = [
  {
    id: 'guidance-knowledge',
    title: 'Dua for Knowledge',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma.',
    translation: 'My Lord, increase me in knowledge.',
    category: 'guidance',
    meaning: 'Allah commanded the Prophet (PBUH) to make this dua.',
    reference: 'Quran 20:114',
    verseKey: '20:114',
  },
  {
    id: 'guidance-musa',
    title: 'Dua of Prophet Musa',
    arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    transliteration: 'Rabbi inni lima anzalta ilayya min khayrin faqeer.',
    translation: 'My Lord, indeed I am, for whatever good You would send down to me, in need.',
    category: 'guidance',
    meaning: 'Prophet Musa made this dua when he arrived at Madyan with nothing, and Allah provided for him.',
    reference: 'Quran 28:24',
    verseKey: '28:24',
  },
  {
    id: 'guidance-parents',
    title: 'Dua for Parents',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbir hamhuma kama rabbayani sagheera.',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    category: 'guidance',
    meaning: 'A beautiful dua to make for one\'s parents.',
    reference: 'Quran 17:24',
    verseKey: '17:24',
  },
  {
    id: 'guidance-ibrahim',
    title: 'Dua of Prophet Ibrahim',
    arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
    transliteration: 'Rabbij alni muqeemas salati wa min dhurriyyati. Rabbana wa taqabbal dua.',
    translation: 'My Lord, make me an establisher of prayer, and many from my descendants. Our Lord, and accept my supplication.',
    category: 'guidance',
    meaning: 'Prophet Ibrahim\'s dua for himself and his descendants to be steadfast in prayer.',
    reference: 'Quran 14:40',
    verseKey: '14:40',
  },
  {
    id: 'guidance-ease',
    title: 'With Hardship Comes Ease',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٥﴾ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٦﴾',
    transliteration: 'Fa inna ma\'al usri yusra. Inna ma\'al usri yusra.',
    translation: 'For indeed, with hardship will be ease. Indeed, with hardship will be ease.',
    category: 'guidance',
    meaning: 'A powerful reminder that Allah will provide ease after every difficulty.',
    reference: 'Quran 94:5-6',
    verseRange: { surah: 94, startVerse: 5, endVerse: 6 },
  },
];

// Combine all duas
export const allDuas: Dua[] = [
  ...morningDuas,
  ...eveningDuas,
  ...afterPrayerDuas,
  ...beforeSleepDuas,
  ...protectionDuas,
  ...forgivenessDuas,
  ...guidanceDuas,
];
