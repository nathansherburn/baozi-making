'use client';

import { useState, useRef, useEffect } from 'react';
import { db, getSettings, type JournalEntry, type PhotoItem, generateId, createThumbnail } from '@/lib/db';
import { useLanguage, t } from '@/lib/i18n';
import { polishJournalEntry } from '@/lib/ai';

interface JournalModalProps {
  date: string;
  existingEntry?: JournalEntry;
  onClose: () => void;
  onSaved: () => void;
}

export default function JournalModal({ date, existingEntry, onClose, onSaved }: JournalModalProps) {
  const { lang } = useLanguage();
  const [content, setContent] = useState(existingEntry?.rawContent || existingEntry?.content || '');
  const [photos, setPhotos] = useState<PhotoItem[]>(existingEntry?.photos || []);
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [saved, setSaved] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 300);
  }, []);

  // Generate object URLs for existing photo blobs
  useEffect(() => {
    const urls = new Map<string, string>();
    photos.forEach((photo) => {
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
  }, [photos]);

  // Speech-to-text
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'zh' ? '您的浏览器不支持语音输入' : 'Your browser does not support speech recognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang === 'zh' ? 'zh-CN' : 'en-US';

    let finalTranscript = content;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setContent(finalTranscript);
        } else {
          interimTranscript += transcript;
          setContent(finalTranscript + interimTranscript);
        }
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // Handle photo upload as Blob
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoItem[] = [];
    for (const file of Array.from(files)) {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const thumbnailBlob = await createThumbnail(blob);
      newPhotos.push({
        id: generateId(),
        blob,
        filename: file.name,
        mimeType: file.type,
        thumbnailBlob,
      });
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (!content.trim() && photos.length === 0) return;

    setSaving(true);
    const rawContent = content.trim();
    let polishedContent = rawContent;

    // Try AI polishing
    const settings = await getSettings();
    if (settings.aiApiKey) {
      setSavingAi(true);
      polishedContent = await polishJournalEntry(rawContent, settings.aiApiKey, lang, settings.aiModel);
      setSavingAi(false);
    }

    const entry: JournalEntry = {
      date,
      rawContent,
      content: polishedContent,
      photos,
      createdAt: existingEntry?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await db.journalEntries.put(entry);
    setSaving(false);
    setSaved(true);
    setTimeout(() => onSaved(), 800);
  };

  const dateObj = new Date(date + 'T00:00:00');
  const dateDisplay = lang === 'zh'
    ? `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`
    : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />

      <div className="fixed inset-x-3 top-1/2 -translate-y-1/2 z-[60] max-w-lg mx-auto">
        <div className="bg-gradient-to-b from-yellow-50 to-orange-50 rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-5 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-700">{dateDisplay}</h2>
              <p className="text-xs text-gray-400">{t('howAreYou', lang)}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-5 pb-5 flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('typeFeelings', lang)}
              className="w-full h-40 bg-white/70 rounded-2xl p-4 text-sm text-gray-700 placeholder-gray-300
                         border-none outline-none resize-none focus:ring-2 focus:ring-orange-200 transition-all"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            />

            {/* Voice input */}
            <button
              onClick={toggleSpeechRecognition}
              className={`w-full mt-3 py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                isRecording
                  ? 'bg-red-400 text-white animate-pulse shadow-lg shadow-red-200'
                  : 'bg-white/70 text-gray-500 hover:bg-white hover:text-orange-500'
              }`}
            >
              {isRecording ? (
                <>
                  <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                  {t('stopSpeaking', lang)}
                </>
              ) : (
                t('startSpeaking', lang)
              )}
            </button>

            {/* Photos */}
            <div className="mt-4">
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {photos.map((photo) => {
                    const url = photoUrls.get(photo.id);
                    return (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        {url && (
                          <img src={url} alt={photo.filename} className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs
                                     opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-2xl bg-white/70 text-gray-500 text-sm
                           hover:bg-white hover:text-orange-500 transition-colors"
              >
                {t('addPhotos', lang)}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || saved || (!content.trim() && photos.length === 0)}
              className={`w-full mt-4 py-3 rounded-2xl font-medium text-white transition-all shadow-sm ${
                saved
                  ? 'bg-green-400'
                  : saving
                    ? 'bg-orange-300 cursor-wait'
                    : 'bg-orange-400 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {saved ? t('saved', lang) : savingAi ? t('savingWithAi', lang) : t('save', lang)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
