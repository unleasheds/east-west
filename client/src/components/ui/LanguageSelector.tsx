import { Languages } from 'lucide-react';
import { Locale, useLanguage } from '../../i18n/LanguageProvider';

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage();

  return (
    <label className="relative flex h-9 shrink-0 items-center rounded-full border border-border bg-white text-muted shadow-sm transition hover:border-brand hover:text-brand">
      <Languages className="pointer-events-none absolute left-2.5 h-4 w-4" />
      <span className="sr-only">Translate website</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label="Translate website"
        className="h-full cursor-pointer appearance-none rounded-full bg-transparent py-0 pl-8 pr-2 text-[11px] font-bold outline-none sm:pr-3"
      >
        <option value="en">EN</option>
        <option value="ms">BM</option>
        <option value="ar">العربية</option>
      </select>
    </label>
  );
}
