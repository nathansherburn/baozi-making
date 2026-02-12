'use client';

import { useState, useEffect } from 'react';
import { useLanguage, t } from '@/lib/i18n';
import { requestNotificationPermission, scheduleNotification, registerServiceWorker } from '@/lib/notifications';
import { getSettings, db } from '@/lib/db';

export default function NotificationButton() {
  const { lang } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('Notification' in window)) {
      setSupported(false);
      return;
    }
    setEnabled(Notification.permission === 'granted');
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setEnabled(true);
      await registerServiceWorker();
      await db.appSettings.update('main', { notificationsEnabled: true });

      // Show a test notification
      scheduleNotification(
        lang === 'zh' ? '包子成长记 🥟' : 'Baozi Growing Diary 🥟',
        lang === 'zh' ? '提醒已开启！每天别忘了记录心情哦～' : 'Notifications enabled! Don\'t forget to journal daily~',
      );
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={handleEnable}
      disabled={enabled}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all backdrop-blur-sm ${
        enabled
          ? 'bg-green-100 text-green-600 cursor-default'
          : 'bg-white/60 text-gray-500 hover:bg-white hover:text-purple-500'
      }`}
    >
      {enabled ? t('notificationsEnabled', lang) : t('enableNotifications', lang)}
    </button>
  );
}
