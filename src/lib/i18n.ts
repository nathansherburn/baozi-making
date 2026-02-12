'use client';

import { createContext, useContext } from 'react';

export type Language = 'zh' | 'en';

export const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
}>({
  lang: 'zh',
  setLang: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// Translation dictionary
const translations: Record<string, Record<Language, string>> = {
  appTitle: { zh: '包子成长记 🥟', en: 'Baozi Growing Diary 🥟' },
  today: { zh: '今天', en: 'Today' },
  week: { zh: '周', en: 'Week' },
  day: { zh: '天', en: 'Day' },
  pregnancyWeek: { zh: '孕期第', en: 'Pregnancy Week ' },
  weekUnit: { zh: '周', en: '' },
  dayUnit: { zh: '天', en: ' days' },
  babySize: { zh: '宝宝大小', en: 'Baby Size' },
  thingsToNote: { zh: '注意事项', en: 'Things to Note' },
  babyDevelopment: { zh: '宝宝发育', en: 'Baby Development' },
  momChanges: { zh: '妈妈变化', en: 'Mom\'s Changes' },
  recordFeeling: { zh: '记录今天的心情 ✨', en: 'Record Today\'s Feelings ✨' },
  viewJournal: { zh: '查看今天的记录 📖', en: 'View Today\'s Entry 📖' },
  howAreYou: { zh: '今天感觉怎么样？', en: 'How are you feeling today?' },
  startSpeaking: { zh: '点击开始语音输入 🎤', en: 'Tap to start voice input 🎤' },
  stopSpeaking: { zh: '点击停止语音输入 🛑', en: 'Tap to stop voice input 🛑' },
  listening: { zh: '正在聆听...', en: 'Listening...' },
  save: { zh: '保存', en: 'Save' },
  cancel: { zh: '取消', en: 'Cancel' },
  close: { zh: '关闭', en: 'Close' },
  saved: { zh: '已保存 ✅', en: 'Saved ✅' },
  selectPhotos: { zh: '从Google相册选择照片 📸', en: 'Select from Google Photos 📸' },
  addPhotosLocal: { zh: '添加本地照片 📸', en: 'Add Local Photos 📸' },
  photos: { zh: '照片', en: 'Photos' },
  myFeeling: { zh: '我的心情', en: 'My Feelings' },
  dueDate: { zh: '预产期', en: 'Due Date' },
  daysUntilDue: { zh: '距离预产期还有', en: 'Days until due: ' },
  daysUnit: { zh: '天', en: '' },
  noEntry: { zh: '这天还没有记录哦～', en: 'No entry for this day yet~' },
  typeFeelings: { zh: '写下你的心情...', en: 'Write your feelings...' },
  editEntry: { zh: '编辑记录 ✏️', en: 'Edit Entry ✏️' },
  deleteEntry: { zh: '删除记录', en: 'Delete Entry' },
  confirmDelete: { zh: '确定要删除这条记录吗？', en: 'Are you sure you want to delete this entry?' },
  mon: { zh: '一', en: 'Mon' },
  tue: { zh: '二', en: 'Tue' },
  wed: { zh: '三', en: 'Wed' },
  thu: { zh: '四', en: 'Thu' },
  fri: { zh: '五', en: 'Fri' },
  sat: { zh: '六', en: 'Sat' },
  sun: { zh: '日', en: 'Sun' },
  enableNotifications: { zh: '开启提醒通知 🔔', en: 'Enable Notifications 🔔' },
  notificationsEnabled: { zh: '提醒已开启 ✅', en: 'Notifications Enabled ✅' },
  settings: { zh: '设置', en: 'Settings' },
  trimester1: { zh: '孕早期', en: '1st Trimester' },
  trimester2: { zh: '孕中期', en: '2nd Trimester' },
  trimester3: { zh: '孕晚期', en: '3rd Trimester' },
  beforePregnancy: { zh: '孕期还未开始', en: 'Before pregnancy start' },
  afterDueDate: { zh: '已过预产期', en: 'Past due date' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}
