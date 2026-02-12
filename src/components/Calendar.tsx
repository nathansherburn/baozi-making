'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getPregnancyInfo, getSettings, type AppSettings, type JournalEntry } from '@/lib/db';
import { useLanguage, t } from '@/lib/i18n';
import { getWeekData } from '@/lib/pregnancyData';
import DayModal from './DayModal';

const WEEKDAYS_ZH = ['一', '二', '三', '四', '五', '六', '日'];
const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_ZH = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar() {
  const { lang } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Get all journal entries for the current month
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startStr = monthStart.toISOString().split('T')[0];
  const endStr = monthEnd.toISOString().split('T')[0];

  const entries = useLiveQuery(
    () => db.journalEntries.where('date').between(startStr, endStr, true, true).toArray(),
    [startStr, endStr]
  );

  const entriesByDate = new Map<string, JournalEntry>();
  entries?.forEach(e => entriesByDate.set(e.date, e));

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calculate calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0 ... Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const weekdays = lang === 'zh' ? WEEKDAYS_ZH : WEEKDAYS_EN;
  const monthName = lang === 'zh' ? MONTHS_ZH[month] : MONTHS_EN[month];

  // Get pregnancy info for header
  const pregnancyInfo = settings ? getPregnancyInfo(settings.lmpDate, todayStr) : null;
  const weekData = pregnancyInfo ? getWeekData(pregnancyInfo.week) : null;

  // Build cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function getDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getDayPregnancyWeek(day: number) {
    if (!settings) return null;
    const dateStr = getDateStr(day);
    const info = getPregnancyInfo(settings.lmpDate, dateStr);
    if (info.week < 1 || info.week > 42) return null;
    return info.week;
  }

  // Group by week for display
  function getWeekColor(week: number | null): string {
    if (week === null) return '';
    if (week <= 12) return 'bg-pink-50'; // First trimester
    if (week <= 27) return 'bg-purple-50'; // Second trimester
    return 'bg-blue-50'; // Third trimester
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Pregnancy status header */}
      {pregnancyInfo && pregnancyInfo.week >= 1 && pregnancyInfo.week <= 40 && (
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                {t('pregnancyWeek', lang)}{pregnancyInfo.week}{t('weekUnit', lang)} + {pregnancyInfo.day}{lang === 'zh' ? '天' : 'd'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('daysUntilDue', lang)}{pregnancyInfo.daysUntilDue}{t('daysUnit', lang)}
              </p>
            </div>
            {weekData && (
              <div className="text-center">
                <span className="text-3xl">{weekData.emoji}</span>
                <p className="text-xs text-gray-500 mt-1">
                  {weekData.babySize[lang]}
                </p>
              </div>
            )}
          </div>
          {/* Trimester indicator */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t('trimester1', lang)}</span>
              <span>{t('trimester2', lang)}</span>
              <span>{t('trimester3', lang)}</span>
            </div>
            <div className="w-full bg-white rounded-full h-2 overflow-hidden flex">
              <div className="bg-pink-300 h-full" style={{ width: '30%' }} />
              <div className="bg-purple-300 h-full" style={{ width: '37.5%' }} />
              <div className="bg-blue-300 h-full" style={{ width: '32.5%' }} />
            </div>
            <div className="relative h-0">
              <div
                className="absolute -top-2 w-3 h-3 bg-white border-2 border-purple-500 rounded-full transform -translate-x-1/2"
                style={{ left: `${Math.min((pregnancyInfo.week / 40) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={prevMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-lg">
          ←
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-700">
            {monthName} {year}
          </h2>
          <button onClick={goToToday} className="text-xs text-purple-500 hover:text-purple-700">
            {t('today', lang)}
          </button>
        </div>
        <button onClick={nextMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-lg">
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const dateStr = getDateStr(day);
          const isToday = dateStr === todayStr;
          const hasEntry = entriesByDate.has(dateStr);
          const pregWeek = getDayPregnancyWeek(day);
          const isFuture = new Date(dateStr) > today;

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && setSelectedDate(dateStr)}
              disabled={isFuture}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                relative transition-all duration-200
                ${isToday ? 'bg-gradient-to-br from-pink-200 to-purple-200 shadow-md scale-105 font-bold' : ''}
                ${!isToday && !isFuture ? 'hover:bg-pink-50 hover:scale-105' : ''}
                ${isFuture ? 'opacity-40 cursor-default' : 'cursor-pointer'}
                ${!isToday ? getWeekColor(pregWeek) : ''}
              `}
            >
              <span className={`text-sm ${isToday ? 'text-purple-700' : 'text-gray-600'}`}>
                {day}
              </span>
              {hasEntry && (
                <span className="absolute bottom-1 text-[8px]">📝</span>
              )}
              {isToday && !hasEntry && (
                <span className="absolute bottom-1 text-[8px]">✨</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Week legend */}
      {settings && (
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-pink-100 inline-block" />
            {t('trimester1', lang)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-100 inline-block" />
            {t('trimester2', lang)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-100 inline-block" />
            {t('trimester3', lang)}
          </span>
        </div>
      )}

      {/* Day modal */}
      {selectedDate && settings && (
        <DayModal
          date={selectedDate}
          lmpDate={settings.lmpDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
