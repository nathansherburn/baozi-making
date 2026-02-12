'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LanguageContext, type Language } from '@/lib/i18n';
import { t } from '@/lib/i18n';
import { getSettings, db } from '@/lib/db';
import Calendar from '@/components/Calendar';
import LanguageToggle from '@/components/LanguageToggle';
import SettingsPage from '@/components/SettingsPage';

export default function Home() {
  const [lang, setLang] = useState<Language>('zh');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsKey, setSettingsKey] = useState(0);

  useEffect(() => {
    getSettings().then((settings) => {
      setLang(settings.language);
      setLoading(false);
    });

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const handleSetLang = async (newLang: Language) => {
    setLang(newLang);
    await db.appSettings.update('main', { language: newLang });
  };

  const handleSettingsChanged = () => {
    // Force calendar to reload with new settings
    setSettingsKey((k) => k + 1);
    getSettings().then((s) => setLang(s.language));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-bounce">
            <Image src="/bao.svg" alt="Baozi" width={64} height={64} />
          </div>
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      {showSettings ? (
        <SettingsPage
          onClose={() => setShowSettings(false)}
          onSettingsChanged={handleSettingsChanged}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
          {/* App header */}
          <header className="sticky top-0 z-30 backdrop-blur-md bg-white/40 border-b border-white/50">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/bao.svg" alt="Baozi" width={28} height={28} />
                <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {t('appTitle', lang)}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-3 py-1.5 rounded-full bg-white/60 text-xs font-medium text-gray-500
                             hover:bg-white hover:text-purple-500 transition-all backdrop-blur-sm"
                >
                  {t('settings', lang)}
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="max-w-lg mx-auto px-4 py-6">
            <Calendar key={settingsKey} />
          </main>

          {/* Footer */}
          <footer className="text-center py-6 text-xs text-gray-300">
            Made with 💕 for 包子
          </footer>
        </div>
      )}
    </LanguageContext.Provider>
  );
}
