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

const translations: Record<string, Record<Language, string>> = {
  appTitle: { zh: '包子成长记', en: 'Baozi Growing Diary' },
  today: { zh: '今天', en: 'Today' },
  week: { zh: '周', en: 'Week' },
  day: { zh: '天', en: 'Day' },
  pregnancyWeek: { zh: '孕期第', en: 'Pregnancy Week ' },
  weekUnit: { zh: '周', en: '' },
  dayUnit: { zh: '天', en: ' days' },
  babySize: { zh: '宝宝大小', en: 'Baby Size' },
  thingsToNote: { zh: '注意事项', en: 'Things to Note' },
  babyDevelopment: { zh: '宝宝发育', en: 'Baby Development' },
  momChanges: { zh: '妈妈变化', en: "Mom's Changes" },
  recordFeeling: { zh: '记录今天的心情 ✨', en: "Record Today's Feelings ✨" },
  viewJournal: { zh: '查看今天的记录 📖', en: "View Today's Entry 📖" },
  howAreYou: { zh: '今天感觉怎么样？', en: 'How are you feeling today?' },
  startSpeaking: { zh: '点击开始语音输入 🎤', en: 'Tap to start voice input 🎤' },
  stopSpeaking: { zh: '点击停止语音输入 🛑', en: 'Tap to stop voice input 🛑' },
  listening: { zh: '正在聆听...', en: 'Listening...' },
  save: { zh: '保存', en: 'Save' },
  cancel: { zh: '取消', en: 'Cancel' },
  close: { zh: '关闭', en: 'Close' },
  saved: { zh: '已保存 ✅', en: 'Saved ✅' },
  addPhotos: { zh: '添加照片 📸', en: 'Add Photos 📸' },
  photos: { zh: '照片', en: 'Photos' },
  myFeeling: { zh: '我的心情', en: 'My Feelings' },
  originalInput: { zh: '原始记录', en: 'Original Input' },
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
  enableNotifications: { zh: '开启提醒通知', en: 'Enable Notifications' },
  disableNotifications: { zh: '关闭提醒通知', en: 'Disable Notifications' },
  notificationsEnabled: { zh: '提醒已开启 ✅', en: 'Notifications Enabled ✅' },
  notificationsDisabled: { zh: '提醒未开启', en: 'Notifications Disabled' },
  settings: { zh: '设置', en: 'Settings' },
  trimester1: { zh: '孕早期', en: '1st Trimester' },
  trimester2: { zh: '孕中期', en: '2nd Trimester' },
  trimester3: { zh: '孕晚期', en: '3rd Trimester' },
  beforePregnancy: { zh: '孕期还未开始', en: 'Before pregnancy start' },
  afterDueDate: { zh: '已过预产期', en: 'Past due date' },
  // Settings page
  settingsTitle: { zh: '设置', en: 'Settings' },
  pregnancyStartDate: { zh: '孕期开始日期（末次月经）', en: 'Pregnancy Start Date (LMP)' },
  pregnancyStartDateHint: { zh: '当你获得更准确的日期时可以修改', en: 'Update when you have a more accurate date' },
  aiSettings: { zh: 'AI 设置', en: 'AI Settings' },
  aiApiKey: { zh: 'Anthropic API 密钥', en: 'Anthropic API Key' },
  aiApiKeyHint: { zh: '用于润色日记内容，让文字更流畅', en: 'Used to polish journal entries for smoother writing' },
  aiApiKeyPlaceholder: { zh: '输入你的 API 密钥...', en: 'Enter your API key...' },
  aiModel: { zh: 'AI 模型', en: 'AI Model' },
  notificationSettings: { zh: '通知设置', en: 'Notification Settings' },
  language: { zh: '语言', en: 'Language' },
  back: { zh: '返回', en: 'Back' },
  savingWithAi: { zh: 'AI 正在润色你的日记...', en: 'AI is polishing your journal...' },
  aiPolished: { zh: '✨ AI 已润色', en: '✨ AI Polished' },
  showOriginal: { zh: '查看原文', en: 'Show Original' },
  showPolished: { zh: '查看润色版', en: 'Show Polished' },
  calculatedDueDate: { zh: '预计预产期', en: 'Estimated Due Date' },
  currentWeek: { zh: '当前孕周', en: 'Current Week' },
  backupExport: { zh: '数据备份', en: 'Data Backup' },
  backupExportHint: { zh: '下载所有日记和照片的备份文件（ZIP）', en: 'Download a backup of all journal entries and photos (ZIP)' },
  downloadBackup: { zh: '下载备份', en: 'Download Backup' },
  exportingBackup: { zh: '正在打包备份...', en: 'Preparing backup...' },
  backupDone: { zh: '备份已下载 ✅', en: 'Backup downloaded ✅' },
  noEntriesToBackup: { zh: '还没有日记可以备份哦～', en: 'No journal entries to backup yet~' },
  // Cloud sync
  cloudSync: { zh: '云同步', en: 'Cloud Sync' },
  cloudSyncHint: { zh: '登录后可在多设备间同步数据', en: 'Sign in to sync data across devices' },
  loginToSync: { zh: '登录同步', en: 'Sign in to Sync' },
  loggedInAs: { zh: '已登录：', en: 'Signed in as' },
  logout: { zh: '退出登录', en: 'Sign Out' },
  emailPlaceholder: { zh: '输入邮箱地址...', en: 'Enter email address...' },
  checkEmail: { zh: '请查看邮箱中的验证码...', en: 'Check your email for the code...' },
  // Login dialog
  loginTitle: { zh: '登录包子成长记', en: 'Sign in to Baozi Diary' },
  loginSubtitle: { zh: '输入邮箱即可同步数据到所有设备', en: 'Enter your email to sync across devices' },
  otpSubtitle: { zh: '我们已发送验证码到你的邮箱', en: 'We sent a verification code to your email' },
  continue: { zh: '继续', en: 'Continue' },
  loggingIn: { zh: '登录中...', en: 'Signing in...' },
  loginError: { zh: '登录失败，请重试', en: 'Login failed, please try again' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}
