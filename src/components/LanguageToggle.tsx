'use client';

import { useLanguage } from '@/lib/i18n';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      className="px-3 py-1.5 rounded-full bg-white/60 text-xs font-medium text-gray-500
                 hover:bg-white hover:text-purple-500 transition-all backdrop-blur-sm"
    >
      {lang === 'zh' ? 'EN' : '中文'}
    </button>
  );
}
