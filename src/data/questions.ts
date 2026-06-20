import { Question, Subject, Badge } from '../types';

export const SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'Riyaziyyat',
    description: '6-cı sinif Riyaziyyat dərsliklərinin (1-ci və 2-ci hissələr) mövzuları: ƏBOB, EKOB, Kəsrlər, Nisbət, Faiz, Mənfi ədədlər, Tənliklər, Bucaqlar, Dairə, Həcm.',
    icon: 'Calculator',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    topics: [
      'Bütün Mövzular',
      'ƏBOB və EKOB',
      'Adi və Ondalık Kəsrlər',
      'Nisbət, Mütənasiblik və Faiz',
      'Müsbət və Mənfi Ədədlər',
      'Tənliklər və Məsələlər',
      'Dairənin Sahəsi və Sferalar',
      'Bucaqlar, Koordinat Sistemi'
    ]
  },
  {
    id: 'lang',
    name: 'Azərbaycan Dili',
    description: 'Qrammatika qaydaları, leksika, ismin quruluşca növləri, əvəzliklər, sifətin dərəcələri və sintaktik təhlil əsasları.',
    icon: 'BookOpen',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    topics: [
      'Bütün Mövzular',
      'Leksika: Omonimlər, Sinonimlər',
      'İsim: İsmin quruluşca növləri',
      'Sifət və onun dərəcələri',
      'Əvəzliklər və onların növləri'
    ]
  },
  {
    id: 'science',
    name: 'Həyat Bilgisi',
    description: 'Təbiət hadisələri, hüceyrə quruluşu, ekosistemlər, maddələrin quruluşu və insan sağlamlığı haqqında əsas biliklər.',
    icon: 'Atom',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    topics: [
      'Bütün Mövzular',
      'Hüceyrə və Orqanizmlər',
      'Maddələr və Karışıqlar',
      'Təbii Hadisələr və Ekologiya',
      'İlkin Tibbi Yardım və Sağlamlıq'
    ]
  },
  {
    id: 'history',
    name: 'Azərbaycan Tarixi',
    description: 'Qədim insan məskənləri, ibtidai icma quruluşu, qədim dövlətlərimiz - Atropatena, Albaniya və digər qədim dövrlər.',
    icon: 'Compass',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    topics: [
      'Bütün Mövzular',
      'Qədim İnsan Məskənləri (Ulu icma)',
      'Atropatena Dövləti',
      'Qədim Albaniya Dövləti',
      'Sasanilər Dövründə Azərbaycan'
    ]
  }
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_quiz',
    title: 'İlk Uğur',
    description: 'İlk sual setini müvəffəqiyyətlə başa vurdun!',
    icon: 'Award',
    color: 'text-blue-500 bg-blue-50'
  },
  {
    id: 'math_champion',
    title: 'Riyaziyyat Qəhrəmanı',
    description: 'Riyaziyyat fənni üzrə 10 sualı düzgün cavablandırdın.',
    icon: 'Calculator',
    color: 'text-emerald-500 bg-emerald-50'
  },
  {
    id: 'perfect_score',
    title: 'Mükəmməl Nəticə',
    description: 'Bir sınaqda bütün suallara 100% doğru cavab verdin!',
    icon: 'Sparkles',
    color: 'text-amber-500 bg-amber-50 animate-pulse'
  },
  {
    id: 'explainer_master',
    title: 'Öyrənmə Həvəskarı',
    description: 'AI Köməkçidən 5 dəfə sual izahı tələb etdin və dərindən öyrəndin.',
    icon: 'Lightbulb',
    color: 'text-yellow-500 bg-yellow-50'
  },
  {
    id: 'canvas_artist',
    title: 'Qaralama Ustası',
    description: 'Riyaziyyat məsələlərini həll etmək üçün yazı lövhəsindən istifadə etdin.',
    icon: 'Palette',
    color: 'text-purple-500 bg-purple-50'
  }
];

export const PRESET_QUESTIONS: Question[] = [
  // MATHEMATICS (Riyaziyyat) - Aligned with trims.edu.az Book Part 1 & Part 2
  {
    id: 'math_1',
    subject: 'math',
    topic: 'ƏBOB və EKOB',
    question: 'Aşağıdakı ədədlərdən hansı cütü qarşılıqlı sadə ədədlərdir?',
    options: [
      '14 və 21',
      '15 və 28',
      '18 və 27',
      '22 və 33'
    ],
    correctIndex: 1, // 15 and 28 (common divisor is only 1. 14,21 share 7; 18,27 share 9; 22,33 share 11)
    explanation: 'Qarşılıqlı sadə ədədlərin ən böyük ümumi böləni 1-dir (ƏBOB(a, b) = 1). \n\n' +
      '- 14 və 21 hər ikisi 7-yə bölünür.\n' +
      '- 15-in vuruqları: 3, 5. 28-in vuruqları: 2, 7. Heç bir ortaq sadə vuruğu yoxdur. Deməli, qarşılıqlı sadədirlər.\n' +
      '- həmçinin 18 və 27 hər ikisi 9-a bölünür.\n' +
      '- 22 və 33 hər ikisi 11-ə bölünür.\n\nDeməli, düzgün cavab 15 və 28-dir.'
  },
  {
    id: 'math_2',
    subject: 'math',
    topic: 'ƏBOB və EKOB',
    question: 'ƏBOB(48, 72) + EKOB(12, 18) ifadəsinin qiymətini tapın.',
    options: [
      '60',
      '72',
      '84',
      '96'
    ],
    correctIndex: 0, // EBOB(48,72)=24, EKOB(12,18)=36. 24+36 = 60
    explanation: 'Gəlin bu ifadəni addım-addım hesablayaq:\n\n' +
      '1) ƏBOB(48, 72) tapılması:\n' +
      '   48 = 2 · 2 · 2 · 2 · 3\n' +
      '   72 = 2 · 2 · 2 · 3 · 3\n' +
      '   Ortaq vuruqlar: hər ikisində üç dənə 2 və bir dənə 3 var. Deməli, ƏBOB(48, 72) = 2 · 2 · 2 · 3 = 24.\n\n' +
      '2) EKOB(12, 18) tapılması:\n' +
      '   12 = 2 · 2 · 3\n' +
      '   18 = 2 · 3 · 3\n' +
      '   EKOB(12, 18) = 18 · 2 = 36 (və ya 12 · 3 = 36).\n\n' +
      '3) Toplama: ƏBOB + EKOB = 24 + 36 = 60.\n\nCavab: 60.'
  },
  {
    id: 'math_3',
    subject: 'math',
    topic: 'Adi və Ondalık Kəsrlər',
    question: 'Dərsliyin 1-ci hissəsində kəsrlərin vurulması mövzusuna aid məsələ: Bir sahədən hər gün 3/8 ton kartof yığılırdı. 12 gündə cəmi neçə ton kartof yığılar?',
    options: [
      '3.5 ton',
      '4 ton',
      '4.5 ton',
      '5 ton'
    ],
    correctIndex: 2, // 12 * 3/8 = 36/8 = 4.5
    explanation: 'Günə yığılan kartof: 3/8 ton.\n' +
      'Günlərin sayı: 12 gün.\n\n' +
      'Ümumi yığılan kartofu tapmaq üçün gün sayını hər güb yığılan miqdara vururuq:\n' +
      '12 * (3/8) = (12 * 3) / 8 = 36 / 8 = 4 tam 4/8 = 4 tam 1/2.\n\n' +
      'Ondalık kəsrlə yazsaq: 4.5 ton.\n' +
      'Düzgün cavab: 4.5 ton.'
  },
  {
    id: 'math_4',
    subject: 'math',
    topic: 'Nisbət, Mütənasiblik və Faiz',
    question: 'Düz mütənasib asılılıq mövzusundan: İki şəhər arasındakı məsafə xəritədə 4 sm-dir. Xəritənin miqyası 1 : 5 000 000 olarsa, real məsafə neçə kilometrdir?',
    options: [
      '20 km',
      '200 km',
      '2000 km',
      '500 km'
    ],
    correctIndex: 1, // 4 * 5,000,000 cm = 20,000,000 cm = 200,000 m = 200 km
    explanation: 'Miqyas 1 : 5 000 000 o deməkdir ki, xəritədəki 1 sm real həyatda 5 000 000 sm-dir.\n\n' +
      '1) Xəritədəki məsafə: 4 sm\n' +
      '2) Həqiqi məsafə: 4 · 5 000 000 sm = 20 000 000 sm\n\n' +
      'İndi santimetri kilometrə çevirək:\n' +
      '- 1 metr = 100 santimetr, yəni 20 000 000 sm / 100 = 200 000 metr.\n' +
      '- 1 kilometr = 1000 metr, yəni 200 000 metr / 1000 = 200 km.\n\n' +
      'Deməli, həqiqi məsafə 200 kilometrdir.'
  },
  {
    id: 'math_5',
    subject: 'math',
    topic: 'Nisbət, Mütənasiblik və Faiz',
    question: 'Malın qiyməti 120 manat idi. Qiymət əvvəlcə 20% azaldı, sonra yeni qiymət yarandıqdan sonra 10% artdı. Malın son qiyməti neçə manat oldu?',
    options: [
      '108 manat',
      '105.6 manat',
      '96 manat',
      '110 manat'
    ],
    correctIndex: 1, // 120 * 0.8 = 96. 96 * 1.1 = 105.6
    explanation: 'Bu məsələni iki addımda həll edək:\n\n' +
      '1) Qiymətin 20% azaldılması:\n' +
      '   120 manatın 20%-i: (120 · 20) / 100 = 24 manat.\n' +
      '   Azalmadan sonra qiymət: 120 - 24 = 96 manat.\n\n' +
      '2) Yeni qiymətin (96 manatın) 10% artırılması:\n' +
      '   96 manatın 10%-i: (96 · 10) / 100 = 9.6 manat.\n' +
      '   Artımdan sonra qiymət: 96 + 9.6 = 105.6 manat.\n\n' +
      'Düzgün cavab: 105.6 manat.'
  },
  {
    id: 'math_6',
    subject: 'math',
    topic: 'Müsbət və Mənfi Ədədlər',
    question: 'İfadənin qiymətini hesablayın: -15 + (-7) - (-12) - (+5)',
    options: [
      '-15',
      '-29',
      '-5',
      '-9'
    ],
    correctIndex: 0, // -15 - 7 + 12 - 5 = -22 + 12 - 5 = -10 - 5 = -15
    explanation: 'Mötərizələri açaq və mənfi/müsbət işarələrə diqqət yetirək:\n' +
      '-15 + (-7) = -15 - 7 = -22\n' +
      '- (-12) = +12 (mənfi mənfiyə dəyəndə müsbət olur)\n' +
      '- (+5) = -5\n\n' +
      'İndi bütöv hesablayaq:\n' +
      '= -22 + 12 - 5\n' +
      '= -10 - 5\n' +
      '= -15.\n\n' +
      'Düzgün cavab: -15.'
  },
  {
    id: 'math_7',
    subject: 'math',
    topic: 'Tənliklər və Məsələlər',
    question: 'Tənliyi həll edin: 5x - 18 = 2x + 12',
    options: [
      'x = 10',
      'x = 6',
      'x = -2',
      'x = 5'
    ],
    correctIndex: 0, // 3x = 30 => x = 10
    explanation: 'Dəyişənləri (x-ləri) tənliyin sol tərəfinə, ədədləri isə sağ tərəfinə keçirək:\n\n' +
      '5x - 2x = 12 + 18\n' +
      '3x = 30\n' +
      'x = 30 / 3\n' +
      'x = 10.\n\nYoxlama:\n' +
      '5 · (10) - 18 = 50 - 18 = 32\n' +
      '2 · (10) + 12 = 20 + 12 = 32\n\nCavab tamamilə doğrudur: x = 10.'
  },
  {
    id: 'math_8',
    subject: 'math',
    topic: 'Dairənin Sahəsi və Sferalar',
    question: 'Radiusu R = 6 sm olan dairənin sahəsini tapın (π ≈ 3 qəbul edin).',
    options: [
      '36 sm²',
      '18 sm²',
      '54 sm²',
      '108 sm²'
    ],
    correctIndex: 3, // S = pi * R^2 = 3 * 36 = 108
    explanation: 'Dairənin sahə düsturu: S = πR² .\n\n' +
      'Burada radius R = 6 sm, π (pi rəqəmi) isə təqribi olaraq 3 verilmişdir.\n' +
      'Düsturda yerinə qoysaq:\n' +
      'S = 3 · 6²\n' +
      'S = 3 · 36\n' +
      'S = 108 sm².\n\nDeməli, sahə 108 kvadrat santimetrdir.'
  },

  // AZERBAIJANI LANGUAGE (Azərbaycan Dili)
  {
    id: 'lang_1',
    subject: 'lang',
    topic: 'Leksika: Omonimlər, Sinonimlər',
    question: 'Aşağıdakılardan hansı həm omonim, həm də çoxmənalı söz kimi işlənə bilər?',
    options: [
      'Alın',
      'Göz',
      'Yol',
      'Üz'
    ],
    correctIndex: 3, // Üz (face, direct/figurative -> coxmənalı; swimming/peel/face -> omonim)
    explanation: 'Azərbaycan dilində bəzi sözlər eyni zamanda həm omonim, həm də çoxmənalı söz ola bilir. Siyahıdakı "Üz" sözü belədir:\n\n' +
      '1) Çoxmənalı kimi: insanın üzü (həqiqi), kitabın üzü, suyun üzü (məcazi).\n' +
      '2) Omonim kimi: üz (insan sifəti), üz (göldə üzmək feli), üz (meyvənin qabığını üzmək feli).\n\n"Göz" çoxmənalıdır amma omonim deyil. "Yol" omonimdir amma çoxmənalı deyil.'
  },
  {
    id: 'lang_2',
    subject: 'lang',
    topic: 'İsim: İsmin quruluşca növləri',
    question: 'Düzəltmə isimlərin cərgəsini müəyyən edin.',
    options: [
      'Yazıçı, qorxu, qələm',
      'Düşüncə, dənizçi, sevgi',
      'Daşlıq, uşaqlar, bağban',
      'Vətənpərvər, yaxşılıq, evimiz'
    ],
    correctIndex: 1, // Düşüncə (-cə), dənizçi (-çi), sevgi (-gi) are all derivative.
    explanation: 'Düzəltmə isimlər leksik şəkilçilər (sözdüzəldici) vasitəsilə yaranır:\n\n' +
      '- "Düşüncə": Düşün (müasir kök düşünmək) + cə (leksik)\n' +
      '- "Dənizçi": Dəniz (kök) + çi (leksik)\n' +
      '- "Sevgi": Sev (kök) + gi (leksik)\n\nDigər variantlarda köməkçi hissələr və ya qrammatik şəkilçilər var (məsələn, "uşaqlar" düzəltmə deyil, "uşaq" sadə kök + "lar" qrammatik şəkilçidir; "qələm" sadədir).'
  },

  // SCIENCE (Həyat Bilgisi)
  {
    id: 'science_1',
    subject: 'science',
    topic: 'Hüceyrə və Orqanizmlər',
    question: 'Hüceyrənin "enerji stansiyası" adlandırılan və hüceyrə tənəffüsündə iştirak edən orqanoid hansıdır?',
    options: [
      'Ribosom',
      'Nüvə',
      'Mitoxondri',
      'Xloroplast'
    ],
    correctIndex: 2, // Mitochondria
    explanation: 'Hüceyrənin orqanoidlərinin öz vəzifələri var:\n\n' +
      '- **Mitoxondri** - Hüceyrənin enerji stansiyasıdır. O, üzvi maddələri parçalayaraq hüceyrə üçün lazım olan enerjini (ATF) istehsal edir.\n' +
      '- **Ribosom** - Zülal sintez edir.\n' +
      '- **Nüvə** - İrsi məlumatı saxlayır və hüceyrəni idarə edir.\n' +
      '- **Xloroplast** - Fotosintez prosesini həyata keçirir (yalnız bitki hüceyrələrində).'
  },

  // HISTORY (Azərbaycan Tarixi)
  {
    id: 'history_1',
    subject: 'history',
    topic: 'Atropatena Dövləti',
    question: 'E.ə. IV əsrdə yaranmış Atropatena dövlətinin ilk paytaxtı harası olmuşdur?',
    options: [
      'Qəbələ',
      'Bərdə',
      'Qazaka',
      'Təbriz'
    ],
    correctIndex: 2, // Ganzak (Qazaka)
    explanation: 'Atropatena dövləti (E.ə. 321-ci ildə yaranmışdır) qədim dövlətlərimizdən biridir. \n' +
      'Onun paytaxtı **Qazaka (Qanzak)** şəhəri idi. Bu şəhər indiki Cənubi Azərbaycan ərazisində (Marağa yaxınlığında) yerləşirdi. Qəbələ isə qonşu Albaniya dövlətinin ilk paytaxtı olmuşdur.'
  }
];
