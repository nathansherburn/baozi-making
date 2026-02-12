'use client';

import { useState, useEffect } from 'react';
import { LanguageContext, type Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { getSettings, db } from '@/lib/db';
import Calendar from '@/components/Calendar';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationButton from '@/components/NotificationButton';

export default function Home() {
  const [lang, setLang] = useState<Language>('zh');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((settings) => {
      setLang(settings.language);
      setLoading(false);
    });
  }, []);

  const handleSetLang = async (newLang: Language) => {
    setLang(newLang);
    await db.appSettings.update('main', { language: newLang });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🥟</div>
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        {/* App header */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/40 border-b border-white/50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              {t('appTitle', lang)}
            </h1>
            <div className="flex items-center gap-2">
              <NotificationButton />
              <LanguageToggle />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-lg mx-auto px-4 py-6">
          <Calendar />
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-300">
          Made with 💕 for 包子
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}
