'use client';

import { useState, useEffect } from 'react';
import { db, getSettings, getPregnancyInfo, type AppSettings } from '@/lib/db';
import { useLanguage, t } from '@/lib/i18n';
import { requestNotificationPermission, registerServiceWorker, scheduleNotification } from '@/lib/notifications';

interface SettingsPageProps {
  onClose: () => void;
  onSettingsChanged: () => void;
}

export default function SettingsPage({ onClose, onSettingsChanged }: SettingsPageProps) {
  const { lang, setLang } = useLanguage();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [lmpDate, setLmpDate] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [aiModel, setAiModel] = useState('claude-sonnet-4-5-20250929');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLmpDate(s.lmpDate);
      setApiKey(s.aiApiKey);
      setAiModel(s.aiModel || 'claude-sonnet-4-5-20250929');
      setNotificationsEnabled(s.notificationsEnabled);
    });
    if (typeof window !== 'undefined' && !('Notification' in window)) {
      setNotificationSupported(false);
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        await registerServiceWorker();
        scheduleNotification(
          lang === 'zh' ? '包子成长记' : 'Baozi Growing Diary',
          lang === 'zh' ? '提醒已开启！每天别忘了记录心情哦～' : 'Notifications enabled! Don\'t forget to journal daily~',
        );
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleSave = async () => {
    await db.appSettings.put({
      id: 'main',
      lmpDate,
      language: lang,
      notificationsEnabled,
      aiApiKey: apiKey,
      aiModel,
    });
    setSaved(true);
    onSettingsChanged();
    setTimeout(() => setSaved(false), 1500);
  };

  // Calculate info to display (guard against empty lmpDate before settings load)
  const today = new Date().toISOString().split('T')[0];
  const info = lmpDate ? getPregnancyInfo(lmpDate, today) : null;
  const dueDateStr = info?.dueDate ? info.dueDate.toISOString().split('T')[0] : '-';

  if (!settings) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-full bg-white/60 text-sm text-gray-500 hover:bg-white transition-colors"
          >
            ← {t('back', lang)}
          </button>
          <h1 className="text-lg font-bold text-gray-700">{t('settingsTitle', lang)}</h1>
          <div className="w-16" />
        </div>

        {/* Pregnancy Start Date */}
        <section className="bg-white/70 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-600 mb-1">
            📅 {t('pregnancyStartDate', lang)}
          </h2>
          <p className="text-xs text-gray-400 mb-3">{t('pregnancyStartDateHint', lang)}</p>
          <input
            type="date"
            value={lmpDate}
            onChange={(e) => setLmpDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-pink-50 border border-pink-200 text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          {/* Show calculated info */}
          <div className="mt-3 flex gap-4 text-xs text-gray-400">
            <span>
              {t('currentWeek', lang)}: <strong className="text-purple-600">
                {info && info.week >= 1 && info.week <= 42 ? `${info.week}${lang === 'zh' ? '周' : 'w'}+${info.day}${lang === 'zh' ? '天' : 'd'}` : '-'}
              </strong>
            </span>
            <span>
              {t('calculatedDueDate', lang)}: <strong className="text-purple-600">{dueDateStr}</strong>
            </span>
          </div>
        </section>

        {/* AI Settings */}
        <section className="bg-white/70 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-600 mb-1">
            🤖 {t('aiSettings', lang)}
          </h2>
          <p className="text-xs text-gray-400 mb-3">{t('aiApiKeyHint', lang)}</p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('aiApiKeyPlaceholder', lang)}
            className="w-full px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-gray-700 text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-300"
          />
          <div className="mt-3">
            <label className="text-xs text-gray-400 block mb-1">{t('aiModel', lang)}</label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 text-gray-700 text-sm
                         focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
            </select>
          </div>
        </section>

        {/* Notification Settings */}
        {notificationSupported && (
          <section className="bg-white/70 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-bold text-gray-600 mb-3">
              🔔 {t('notificationSettings', lang)}
            </h2>
            <button
              onClick={handleNotificationToggle}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                notificationsEnabled
                  ? 'bg-green-100 text-green-600 border border-green-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600'
              }`}
            >
              {notificationsEnabled ? t('notificationsEnabled', lang) : t('enableNotifications', lang)}
            </button>
          </section>
        )}

        {/* Language */}
        <section className="bg-white/70 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-600 mb-3">
            🌐 {t('language', lang)}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setLang('zh')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                lang === 'zh'
                  ? 'bg-purple-100 text-purple-600 border border-purple-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-purple-50'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                lang === 'en'
                  ? 'bg-purple-100 text-purple-600 border border-purple-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-purple-50'
              }`}
            >
              English
            </button>
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-2xl font-medium text-white transition-all shadow-sm ${
            saved
              ? 'bg-green-400'
              : 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500'
          }`}
        >
          {saved ? t('saved', lang) : t('save', lang)}
        </button>
      </div>
    </div>
  );
}
