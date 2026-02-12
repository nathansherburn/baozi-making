'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getPregnancyInfo } from '@/lib/db';
import { useLanguage, t } from '@/lib/i18n';
import { getWeekDataLocalized, getTrimester } from '@/lib/pregnancyData';
import JournalModal from './JournalModal';

interface DayModalProps {
  date: string;
  lmpDate: string;
  onClose: () => void;
}

export default function DayModal({ date, lmpDate, onClose }: DayModalProps) {
  const { lang } = useLanguage();
  const [showJournal, setShowJournal] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map());

  const entry = useLiveQuery(
    () => db.journalEntries.get(date),
    [date]
  );

  // Create object URLs for photo blobs
  useEffect(() => {
    if (!entry?.photos?.length) {
      setPhotoUrls(new Map());
      return;
    }
    const urls = new Map<string, string>();
    entry.photos.forEach((photo) => {
      if (photo.thumbnailBlob) {
        urls.set(photo.id, URL.createObjectURL(photo.thumbnailBlob));
      } else if (photo.blob) {
        urls.set(photo.id, URL.createObjectURL(photo.blob));
      }
    });
    setPhotoUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [entry?.photos]);

  const pregnancyInfo = getPregnancyInfo(lmpDate, date);
  const weekData = getWeekDataLocalized(pregnancyInfo.week, lang);

  const trimester = getTrimester(pregnancyInfo.week);
  const trimesterColors = {
    1: { bg: 'from-pink-50 to-rose-50', accent: 'text-pink-600', btn: 'bg-pink-400 hover:bg-pink-500' },
    2: { bg: 'from-purple-50 to-violet-50', accent: 'text-purple-600', btn: 'bg-purple-400 hover:bg-purple-500' },
    3: { bg: 'from-blue-50 to-sky-50', accent: 'text-blue-600', btn: 'bg-blue-400 hover:bg-blue-500' },
  };
  const colors = trimesterColors[trimester];

  const dateObj = new Date(date + 'T00:00:00');
  const dateDisplay = lang === 'zh'
    ? `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`
    : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const handleDelete = async () => {
    if (confirm(t('confirmDelete', lang))) {
      await db.journalEntries.delete(date);
    }
  };

  const hasEntry = !!entry;
  const hasAiPolished = entry && entry.rawContent && entry.content !== entry.rawContent;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto">
        <div className={`bg-gradient-to-b ${colors.bg} rounded-3xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col`}>
          {/* Header */}
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-700">{dateDisplay}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
              >
                ✕
              </button>
            </div>

            {weekData && pregnancyInfo.week >= 1 && pregnancyInfo.week <= 40 ? (
              <div className={`${colors.accent} text-sm font-medium`}>
                {t('pregnancyWeek', lang)}{pregnancyInfo.week}{t('weekUnit', lang)} + {pregnancyInfo.day}{lang === 'zh' ? '天' : 'd'}
              </div>
            ) : pregnancyInfo.week < 1 ? (
              <div className="text-gray-400 text-sm">{t('beforePregnancy', lang)}</div>
            ) : (
              <div className="text-gray-400 text-sm">{t('afterDueDate', lang)}</div>
            )}
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-5 pb-5 flex-1">
            {weekData && (
              <>
                {/* Baby size */}
                <div className="bg-white/70 rounded-2xl p-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{weekData.emoji}</span>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{t('babySize', lang)}</p>
                      <p className="font-bold text-gray-700">{weekData.babySize}</p>
                      <p className="text-xs text-gray-400">
                        {weekData.babyLength} · {weekData.babyWeight}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 rounded-2xl p-4 mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {t('babyDevelopment', lang)} 👶
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{weekData.development}</p>
                </div>

                <div className="bg-white/70 rounded-2xl p-4 mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {t('momChanges', lang)} 🤰
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{weekData.momChanges}</p>
                </div>

                <div className="bg-white/70 rounded-2xl p-4 mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {t('thingsToNote', lang)} 💡
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{weekData.tips}</p>
                </div>
              </>
            )}

            {/* Journal entry */}
            {hasEntry && entry && (
              <div className="bg-white/90 rounded-2xl p-4 mb-3 border border-dashed border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {t('myFeeling', lang)} 💭
                    </p>
                    {hasAiPolished && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-500">
                        {t('aiPolished', lang)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowJournal(true)}
                      className="text-xs text-purple-500 hover:text-purple-700"
                    >
                      {t('editEntry', lang)}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleDelete}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      {t('deleteEntry', lang)}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {showOriginal ? entry.rawContent : entry.content}
                </p>
                {hasAiPolished && (
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-600"
                  >
                    {showOriginal ? t('showPolished', lang) : t('showOriginal', lang)}
                  </button>
                )}

                {/* Photos */}
                {entry.photos && entry.photos.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">{t('photos', lang)} 📸</p>
                    <div className="grid grid-cols-3 gap-2">
                      {entry.photos.map((photo) => {
                        const url = photoUrls.get(photo.id);
                        return (
                          <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                            {url && (
                              <img src={url} alt={photo.filename} className="w-full h-full object-cover" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowJournal(true)}
              className={`w-full py-3 rounded-2xl text-white font-medium ${colors.btn} transition-colors shadow-sm`}
            >
              {hasEntry ? t('editEntry', lang) : t('recordFeeling', lang)}
            </button>
          </div>
        </div>
      </div>

      {showJournal && (
        <JournalModal
          date={date}
          existingEntry={entry || undefined}
          onClose={() => setShowJournal(false)}
          onSaved={() => setShowJournal(false)}
        />
      )}
    </>
  );
}
