import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Locale = 'en' | 'ms' | 'ar';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => undefined,
});

const translations: Record<'ms' | 'ar', Record<string, string>> = {
  ms: {
    Explore: 'Teroka',
    Wishlist: 'Senarai pilihan',
    Trips: 'Perjalanan',
    Inbox: 'Peti masuk',
    Contact: 'Hubungi',
    Profile: 'Profil',
    Admin: 'Admin',
    WhatsApp: 'WhatsApp',
    Anywhere: 'Di mana sahaja',
    'Any week': 'Bila-bila masa',
    'Add guests': 'Tambah tetamu',
    'Search destinations': 'Cari destinasi',
    Where: 'Lokasi',
    When: 'Tarikh',
    Who: 'Tetamu',
    Destination: 'Destinasi tujuan',
    Search: 'Cari',
    Cancel: 'Batal',
    'Muslim-friendly · Halal-verified · Private tours': 'Mesra Muslim · Disahkan halal · Lawatan peribadi',
    'Halal Travel,': 'Pelancongan Halal,',
    'Made Simple.': 'Dipermudahkan.',
    'Verified halal hotels, private tours and prayer-friendly itineraries — planned for you on WhatsApp.': 'Hotel halal yang disahkan, lawatan peribadi dan jadual mesra solat — dirancang untuk anda melalui WhatsApp.',
    'Halal certified': 'Disahkan halal',
    'View trip →': 'Lihat perjalanan →',
    'Search halal trips': 'Cari perjalanan halal',
    'Popular:': 'Popular:',
    'Free trip plan': 'Pelan perjalanan percuma',
    'Chat on WhatsApp': 'Sembang di WhatsApp',
    travellers: 'pelancong',
    destinations: 'destinasi',
    'active destinations': 'destinasi aktif',
    'quote reply': 'balasan sebut harga',
    'Featured escape': 'Percutian pilihan',
    'Family-safe tours': 'Lawatan mesra keluarga',
    'View →': 'Lihat →',
    'booked this month': 'ditempah bulan ini',
    'Ready to book': 'Sedia untuk ditempah',
    'All halal escapes': 'Semua percutian halal',
    'Clear filters': 'Kosongkan penapis',
    'No packages found': 'Tiada pakej ditemui',
    'Try a different destination or clear the filter.': 'Cuba destinasi lain atau kosongkan penapis.',
    'Show all packages': 'Tunjukkan semua pakej',
    'Free halal trip plan ✈️': 'Pelan perjalanan halal percuma ✈️',
    'Reply within 2 hrs': 'Balasan dalam 2 jam',
    'Plan now →': 'Rancang sekarang →',
    Halal: 'Halal',
    'Why choose EastWest': 'Mengapa pilih EastWest',
    'Make booking feel': 'Jadikan tempahan lebih',
    'personal.': 'peribadi.',
    'We turn browsing into a real trip plan. Share your dates on WhatsApp and get a tailored halal travel quote within hours — no forms, no wait.': 'Kami menukar carian anda menjadi pelan perjalanan sebenar. Kongsi tarikh melalui WhatsApp dan dapatkan sebut harga halal khusus dalam beberapa jam.',
    Bookings: 'Tempahan',
    Destinations: 'Destinasi',
    'Start free trip planner →': 'Mulakan perancang percuma →',
    'Halal food guidance': 'Panduan makanan halal',
    'Prayer-friendly planning': 'Perancangan mesra solat',
    'Private family tours': 'Lawatan keluarga peribadi',
    'WhatsApp-first support': 'Sokongan melalui WhatsApp',
    'Install EastWest': 'Pasang EastWest',
    'Quick access from your home screen': 'Akses pantas dari skrin utama',
    Install: 'Pasang',
    'Guest reviews': 'Ulasan tetamu',
    New: 'Baharu',
    'No verified traveller reviews yet.': 'Belum ada ulasan pelancong yang disahkan.',
    'Back to packages': 'Kembali ke pakej',
    Overview: 'Gambaran keseluruhan',
    Itinerary: 'Jadual perjalanan',
    Includes: 'Termasuk',
    'Trip highlights': 'Sorotan perjalanan',
    'Number of travellers': 'Bilangan pelancong',
    'Book & Pay': 'Tempah & Bayar',
    'Enquire on WhatsApp': 'Tanya melalui WhatsApp',
    // ── Package detail ──────────────────────────────────────────────────────
    'About this trip': 'Tentang perjalanan ini',
    'Day-by-Day Itinerary': 'Jadual Perjalanan Harian',
    'Package not found': 'Pakej tidak ditemui',
    'per person': 'setiap orang',
    '/ person': '/ orang',
    'Service fee': 'Yuran perkhidmatan',
    Total: 'Jumlah',
    Booking: 'Ringkasan tempahan',
    'Booking confirmed!': 'Tempahan disahkan!',
    'Not provided': 'Tidak dinyatakan',
    // ── Trips, wishlist, profile ────────────────────────────────────────────
    'My Trips': 'Perjalanan Saya',
    'Plan your halal trip': 'Rancang perjalanan halal anda',
    'Trip request': 'Permintaan perjalanan',
    'Special requests': 'Permintaan khas',
    'No trip requests yet': 'Belum ada permintaan perjalanan',
    'Your saved trips': 'Perjalanan disimpan anda',
    'No saved trips yet': 'Belum ada perjalanan disimpan',
    'Tip:': 'Petua:',
    'Sign in to EastWest': 'Log masuk ke EastWest',
    'Profile completeness': 'Kelengkapan profil',
    'Your details': 'Butiran anda',
    'Travel preferences': 'Keutamaan perjalanan',
    'Halal requirements & preferences': 'Keperluan & keutamaan halal',
    'Save profile': 'Simpan profil',
    'Changes are stored locally on this device.': 'Perubahan disimpan pada peranti ini.',
    // ── Contact ─────────────────────────────────────────────────────────────
    'Contact us': 'Hubungi kami',
    'Get in touch': 'Berhubung',
    'Business hours': 'Waktu operasi',
    'All times are Gulf Standard Time (GST / UTC+4)': 'Semua waktu adalah Waktu Standard Teluk (GST / UTC+4)',
    'Frequently asked questions': 'Soalan lazim',
    // ── Footer & misc ───────────────────────────────────────────────────────
    'Quick links': 'Pautan pantas',
    Islands: 'Pulau',
    International: 'Antarabangsa',
    'Privacy policy': 'Dasar privasi',
    'Terms of service': 'Terma perkhidmatan',
    'Cookie settings': 'Tetapan kuki',
    'Weekly tips, destination guides and exclusive deals.': 'Petua mingguan, panduan destinasi dan tawaran eksklusif.',
    'No destinations found': 'Tiada destinasi ditemui',
    'This page has moved on': 'Halaman ini tiada lagi',
    // ── Homepage FAQ ────────────────────────────────────────────────────────
    'Good to know': 'Perkara berguna',
    'Halal travel questions, answered': 'Soalan pelancongan halal, dijawab',
    'Are EastWest holiday packages fully halal?': 'Adakah pakej percutian EastWest sepenuhnya halal?',
    'Yes. Every package is checked for halal-certified or Muslim-owned dining, prayer-friendly scheduling, alcohol-free accommodation options and family-appropriate activities before it is listed.': 'Ya. Setiap pakej disemak untuk restoran bersijil halal atau milik Muslim, jadual mesra solat, penginapan tanpa alkohol dan aktiviti sesuai keluarga sebelum disenaraikan.',
    'Do you arrange private and family-only tours?': 'Adakah anda mengaturkan lawatan peribadi dan khusus keluarga?',
    'We do. Private transfers, women-only or family-only excursions and privacy-conscious island resorts can be arranged for any package on request.': 'Ya. Pengangkutan peribadi, lawatan khusus wanita atau keluarga dan resort pulau yang menjaga privasi boleh diatur untuk mana-mana pakej atas permintaan.',
    'How quickly will I get a trip plan?': 'Berapa cepat saya akan menerima pelan perjalanan?',
    'Send your destination, dates and budget and our team replies on WhatsApp with a free Muslim-friendly trip plan, usually within two hours.': 'Hantar destinasi, tarikh dan bajet anda dan pasukan kami akan membalas melalui WhatsApp dengan pelan perjalanan mesra Muslim percuma, biasanya dalam dua jam.',
    'Which destinations do you cover?': 'Destinasi manakah yang anda tawarkan?',
    'The Maldives, Malaysia, Indonesia, Dubai, Turkey and Morocco, with new halal-verified destinations added regularly.': 'Maldives, Malaysia, Indonesia, Dubai, Turki dan Maghribi, dengan destinasi baharu yang disahkan halal ditambah secara berkala.',
    'Can I pay online?': 'Bolehkah saya membayar dalam talian?',
    'Yes. Packages with published pricing can be booked and paid for securely by card on the site, or you can pay after confirming details on WhatsApp.': 'Ya. Pakej dengan harga yang tertera boleh ditempah dan dibayar dengan selamat menggunakan kad di laman ini, atau anda boleh membayar selepas mengesahkan butiran melalui WhatsApp.',
  },
  ar: {
    Explore: 'استكشاف',
    Wishlist: 'المفضلة',
    Trips: 'الرحلات',
    Inbox: 'الرسائل',
    Contact: 'تواصل',
    Profile: 'الملف الشخصي',
    Admin: 'الإدارة',
    WhatsApp: 'واتساب',
    Anywhere: 'أي مكان',
    'Any week': 'أي وقت',
    'Add guests': 'إضافة ضيوف',
    'Search destinations': 'ابحث عن وجهة',
    Where: 'إلى أين',
    When: 'التاريخ',
    Who: 'الضيوف',
    Destination: 'الوجهة',
    Search: 'بحث',
    Cancel: 'إلغاء',
    'Muslim-friendly · Halal-verified · Private tours': 'مناسب للمسلمين · حلال موثّق · جولات خاصة',
    'Halal Travel,': 'سفر حلال،',
    'Made Simple.': 'بكل سهولة.',
    'Verified halal hotels, private tours and prayer-friendly itineraries — planned for you on WhatsApp.': 'فنادق حلال موثّقة وجولات خاصة وبرامج تراعي أوقات الصلاة — نخططها لك عبر واتساب.',
    'Halal certified': 'حلال معتمد',
    'View trip →': 'عرض الرحلة ←',
    'Search halal trips': 'ابحث عن رحلات حلال',
    'Popular:': 'الأكثر طلباً:',
    'Free trip plan': 'خطة رحلة مجانية',
    'Chat on WhatsApp': 'تواصل عبر واتساب',
    travellers: 'مسافرون',
    destinations: 'وجهات',
    'active destinations': 'وجهات نشطة',
    'quote reply': 'وقت الرد',
    'Featured escape': 'الرحلة المميزة',
    'Family-safe tours': 'جولات مناسبة للعائلات',
    'View →': 'عرض ←',
    'booked this month': 'حُجزت هذا الشهر',
    'Ready to book': 'جاهز للحجز',
    'All halal escapes': 'جميع الرحلات الحلال',
    'Clear filters': 'مسح الفلاتر',
    'No packages found': 'لم يتم العثور على باقات',
    'Try a different destination or clear the filter.': 'جرّب وجهة أخرى أو امسح الفلاتر.',
    'Show all packages': 'عرض جميع الباقات',
    'Free halal trip plan ✈️': 'خطة رحلة حلال مجانية ✈️',
    'Reply within 2 hrs': 'نرد خلال ساعتين',
    'Plan now →': 'خطط الآن ←',
    Halal: 'حلال',
    'Why choose EastWest': 'لماذا تختار إيست ويست',
    'Make booking feel': 'اجعل الحجز أكثر',
    'personal.': 'خصوصية.',
    'We turn browsing into a real trip plan. Share your dates on WhatsApp and get a tailored halal travel quote within hours — no forms, no wait.': 'نحوّل بحثك إلى خطة سفر حقيقية. أرسل تواريخك عبر واتساب واحصل على عرض سفر حلال مخصص خلال ساعات.',
    Bookings: 'الحجوزات',
    'Guest reviews': 'آراء الضيوف',
    Destinations: 'الوجهات',
    'Start free trip planner →': 'ابدأ مخطط الرحلة المجاني ←',
    'Halal food guidance': 'دليل الطعام الحلال',
    'Prayer-friendly planning': 'تخطيط يراعي الصلاة',
    'Private family tours': 'جولات عائلية خاصة',
    'WhatsApp-first support': 'دعم مباشر عبر واتساب',
    'Install EastWest': 'ثبّت إيست ويست',
    'Quick access from your home screen': 'وصول سريع من الشاشة الرئيسية',
    Install: 'تثبيت',
    New: 'جديد',
    'No verified traveller reviews yet.': 'لا توجد آراء موثّقة للمسافرين بعد.',
    'Back to packages': 'العودة إلى الباقات',
    Overview: 'نظرة عامة',
    Itinerary: 'برنامج الرحلة',
    Includes: 'يشمل',
    'Trip highlights': 'أبرز مميزات الرحلة',
    'Number of travellers': 'عدد المسافرين',
    'Book & Pay': 'احجز وادفع',
    'Enquire on WhatsApp': 'استفسر عبر واتساب',
    // ── Package detail ──────────────────────────────────────────────────────
    'About this trip': 'عن هذه الرحلة',
    'Day-by-Day Itinerary': 'برنامج الرحلة يوماً بيوم',
    'Package not found': 'الباقة غير موجودة',
    'per person': 'للشخص الواحد',
    '/ person': '/ للشخص',
    'Service fee': 'رسوم الخدمة',
    Total: 'الإجمالي',
    Booking: 'ملخص الحجز',
    'Booking confirmed!': 'تم تأكيد الحجز!',
    'Not provided': 'غير محدد',
    // ── Trips, wishlist, profile ────────────────────────────────────────────
    'My Trips': 'رحلاتي',
    'Plan your halal trip': 'خطط لرحلتك الحلال',
    'Trip request': 'طلب رحلة',
    'Special requests': 'طلبات خاصة',
    'No trip requests yet': 'لا توجد طلبات رحلات بعد',
    'Your saved trips': 'رحلاتك المحفوظة',
    'No saved trips yet': 'لا توجد رحلات محفوظة بعد',
    'Tip:': 'نصيحة:',
    'Sign in to EastWest': 'تسجيل الدخول إلى إيست ويست',
    'Profile completeness': 'اكتمال الملف الشخصي',
    'Your details': 'بياناتك',
    'Travel preferences': 'تفضيلات السفر',
    'Halal requirements & preferences': 'المتطلبات والتفضيلات الحلال',
    'Save profile': 'حفظ الملف الشخصي',
    'Changes are stored locally on this device.': 'يتم حفظ التغييرات على هذا الجهاز.',
    // ── Contact ─────────────────────────────────────────────────────────────
    'Contact us': 'اتصل بنا',
    'Get in touch': 'ابقَ على تواصل',
    'Business hours': 'ساعات العمل',
    'All times are Gulf Standard Time (GST / UTC+4)': 'جميع الأوقات بتوقيت الخليج (GST / UTC+4)',
    'Frequently asked questions': 'الأسئلة الشائعة',
    // ── Footer & misc ───────────────────────────────────────────────────────
    'Quick links': 'روابط سريعة',
    Islands: 'الجزر',
    International: 'دولي',
    'Privacy policy': 'سياسة الخصوصية',
    'Terms of service': 'شروط الخدمة',
    'Cookie settings': 'إعدادات ملفات تعريف الارتباط',
    'Weekly tips, destination guides and exclusive deals.': 'نصائح أسبوعية وأدلة وجهات وعروض حصرية.',
    'No destinations found': 'لم يتم العثور على وجهات',
    'This page has moved on': 'هذه الصفحة لم تعد متاحة',
    // ── Homepage FAQ ────────────────────────────────────────────────────────
    'Good to know': 'معلومات مفيدة',
    'Halal travel questions, answered': 'أسئلة السفر الحلال، مُجابة',
    'Are EastWest holiday packages fully halal?': 'هل باقات إيست ويست حلال بالكامل؟',
    'Yes. Every package is checked for halal-certified or Muslim-owned dining, prayer-friendly scheduling, alcohol-free accommodation options and family-appropriate activities before it is listed.': 'نعم. تخضع كل باقة للفحص من حيث المطاعم الحاصلة على شهادة حلال أو المملوكة لمسلمين، والجدولة التي تراعي أوقات الصلاة، وخيارات الإقامة الخالية من الكحول، والأنشطة المناسبة للعائلات قبل إدراجها.',
    'Do you arrange private and family-only tours?': 'هل تنظمون جولات خاصة وعائلية فقط؟',
    'We do. Private transfers, women-only or family-only excursions and privacy-conscious island resorts can be arranged for any package on request.': 'بالتأكيد. يمكن ترتيب وسائل نقل خاصة، ورحلات للنساء فقط أو للعائلات فقط، ومنتجعات جزرية تراعي الخصوصية لأي باقة عند الطلب.',
    'How quickly will I get a trip plan?': 'كم من الوقت أحتاج للحصول على خطة الرحلة؟',
    'Send your destination, dates and budget and our team replies on WhatsApp with a free Muslim-friendly trip plan, usually within two hours.': 'أرسل وجهتك وتواريخك وميزانيتك وسيرد فريقنا عبر واتساب بخطة رحلة مجانية مناسبة للمسلمين، عادةً خلال ساعتين.',
    'Which destinations do you cover?': 'ما الوجهات التي تغطونها؟',
    'The Maldives, Malaysia, Indonesia, Dubai, Turkey and Morocco, with new halal-verified destinations added regularly.': 'المالديف وماليزيا وإندونيسيا ودبي وتركيا والمغرب، مع إضافة وجهات جديدة موثّقة الحلال بانتظام.',
    'Can I pay online?': 'هل يمكنني الدفع عبر الإنترنت؟',
    'Yes. Packages with published pricing can be booked and paid for securely by card on the site, or you can pay after confirming details on WhatsApp.': 'نعم. يمكن حجز الباقات ذات الأسعار المعلنة ودفع قيمتها بأمان بالبطاقة عبر الموقع، أو يمكنك الدفع بعد تأكيد التفاصيل عبر واتساب.',
  },
};

/**
 * Reverse index from every known rendering of a string (English key, Malay
 * value, Arabic value) back to its English key.
 *
 * Built once instead of scanning ~120 keys per text node: the observer calls
 * this for every text node in every mutation batch, so the previous linear
 * `find` was O(nodes × dictionary) on each render.
 */
const SOURCE_BY_TEXT: Record<string, string> = (() => {
  const index: Record<string, string> = {};
  for (const key of Object.keys(translations.ms)) {
    // First writer wins, so a value shared by two keys resolves consistently
    // rather than depending on iteration order at lookup time.
    index[key] ??= key;
    const ms = translations.ms[key];
    const ar = translations.ar[key];
    if (ms) index[ms] ??= key;
    if (ar) index[ar] ??= key;
  }
  return index;
})();

function translateExact(text: string, locale: Locale) {
  const source = SOURCE_BY_TEXT[text];
  if (!source) return text;
  if (locale === 'en') return source;

  // A key present in one dictionary but not the other used to yield `undefined`,
  // which was then written into the DOM as the literal text "undefined".
  // Falling back to English is the correct degradation for a missing string.
  return translations[locale][source] ?? source;
}

function translateNode(node: Text, locale: Locale) {
  const original = node.nodeValue ?? '';
  const trimmed = original.trim();
  if (!trimmed) return;
  const translated = translateExact(trimmed, locale);
  if (translated !== trimmed) {
    node.nodeValue = original.replace(trimmed, translated);
  }
}

function translateElement(element: Element, locale: Locale) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    translateNode(current as Text, locale);
    current = walker.nextNode();
  }

  for (const attribute of ['placeholder', 'aria-label', 'title']) {
    const value = element.getAttribute(attribute);
    if (value) element.setAttribute(attribute, translateExact(value, locale));
  }
  element.querySelectorAll('[placeholder], [aria-label], [title]').forEach((child) => {
    for (const attribute of ['placeholder', 'aria-label', 'title']) {
      const value = child.getAttribute(attribute);
      if (value) child.setAttribute(attribute, translateExact(value, locale));
    }
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // `?lang=` wins over the stored preference: those are the URLs published in
    // the hreflang annotations and the sitemap, so a visitor (or crawler)
    // arriving on one must get that language regardless of past choices.
    const requested = new URLSearchParams(window.location.search).get('lang');
    if (requested === 'ms' || requested === 'ar' || requested === 'en') {
      localStorage.setItem('eastwest-language', requested);
      return requested;
    }
    const saved = localStorage.getItem('eastwest-language');
    return saved === 'ms' || saved === 'ar' ? saved : 'en';
  });

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        localStorage.setItem('eastwest-language', next);
        setLocaleState(next);
      },
    }),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    translateElement(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          translateNode(mutation.target as Text, locale);
        }
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) translateNode(node as Text, locale);
          if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element, locale);
        });
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
