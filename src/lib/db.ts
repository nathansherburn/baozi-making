import Dexie, { type EntityTable } from 'dexie';

export interface JournalEntry {
  date: string; // YYYY-MM-DD, primary key
  rawContent: string; // original user input
  content: string; // AI-polished version (or same as raw if no AI)
  photos: PhotoItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoItem {
  id: string; // unique id
  blob: Blob;
  filename: string;
  mimeType: string;
  thumbnailBlob?: Blob;
}

export interface AppSettings {
  id: string;
  lmpDate: string; // Last Menstrual Period date (YYYY-MM-DD)
  language: 'zh' | 'en';
  notificationsEnabled: boolean;
  aiApiKey: string; // Claude/Anthropic API key
  aiModel: string;
}

const db = new Dexie('BaoziJournal') as Dexie & {
  journalEntries: EntityTable<JournalEntry, 'date'>;
  appSettings: EntityTable<AppSettings, 'id'>;
};

db.version(2).stores({
  journalEntries: 'date',
  appSettings: 'id',
});

export { db };

// Helper: get or initialize settings
export async function getSettings(): Promise<AppSettings> {
  let settings = await db.appSettings.get('main');
  if (!settings) {
    settings = {
      id: 'main',
      lmpDate: '2026-01-15',
      language: 'zh',
      notificationsEnabled: false,
      aiApiKey: '',
      aiModel: 'claude-sonnet-4-5-20250929',
    };
    await db.appSettings.put(settings);
  }
  // Migrate older settings missing new fields
  if (settings.aiApiKey === undefined) {
    settings.aiApiKey = '';
    settings.aiModel = 'claude-sonnet-4-5-20250929';
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
  dueDate.setDate(dueDate.getDate() + 280);
  const daysUntilDue = Math.floor((dueDate.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  return { week, day, diffDays, dueDate, daysUntilDue };
}

// Helper: generate a simple unique id
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Helper: create thumbnail from image blob
export async function createThumbnail(blob: Blob, maxSize: number = 300): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      } else {
        if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((thumb) => {
        URL.revokeObjectURL(url);
        resolve(thumb || blob);
      }, 'image/jpeg', 0.7);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    img.src = url;
  });
}
