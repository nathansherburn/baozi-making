import Dexie, { type EntityTable } from 'dexie';

export interface JournalEntry {
  date: string; // YYYY-MM-DD, primary key
  content: string;
  photos: PhotoItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoItem {
  url: string;
  thumbnailUrl: string;
  filename: string;
}

export interface AppSettings {
  id: string;
  lmpDate: string; // Last Menstrual Period date (YYYY-MM-DD)
  language: 'zh' | 'en';
  notificationsEnabled: boolean;
}

const db = new Dexie('BaoziJournal') as Dexie & {
  journalEntries: EntityTable<JournalEntry, 'date'>;
  appSettings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  journalEntries: 'date',
  appSettings: 'id',
});

export { db };

// Helper: get or initialize settings
export async function getSettings(): Promise<AppSettings> {
  let settings = await db.appSettings.get('main');
  if (!settings) {
    // Default: LMP = Jan 15, 2026 (so week 4 ~ Feb 12, 2026)
    settings = {
      id: 'main',
      lmpDate: '2026-01-15',
      language: 'zh',
      notificationsEnabled: false,
    };
    await db.appSettings.put(settings);
  }
  return settings;
}

// Helper: calculate pregnancy week and day for a given date
export function getPregnancyInfo(lmpDate: string, targetDate: string) {
  const lmp = new Date(lmpDate);
  const target = new Date(targetDate);
  const diffMs = target.getTime() - lmp.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7);
  const day = diffDays % 7;
  const dueDate = new Date(lmp);
  dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
  const daysUntilDue = Math.floor((dueDate.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  return { week, day, diffDays, dueDate, daysUntilDue };
}
