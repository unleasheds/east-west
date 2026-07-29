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
    Destination: 'Destinasi',
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
  },
  ar: {
    Explore: 'استكشاف',
    Wishlist: 'المفضلة',
    Trips: 'الرحلات',
    Inbox: 'الرسائل',
    Profile: 'الملف الشخصي',
    Admin: 'الإدارة',
    WhatsApp: 'واتساب',
    Anywhere: 'أي مكان',
    'Any week': 'أي وقت',
    'Add guests': 'إضافة ضيوف',
    'Search destinations': 'ابحث عن وجهة',
    Where: 'الوجهة',
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
  },
};

function translateExact(text: string, locale: Locale) {
  const source = Object.keys(translations.ms).find(
    (key) =>
      key === text ||
      translations.ms[key] === text ||
      translations.ar[key] === text,
  );
  if (!source) return text;
  return locale === 'en' ? source : translations[locale][source];
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
