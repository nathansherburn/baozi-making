'use client';

import { useState } from 'react';
import { useObservable } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { t, type Language } from '@/lib/i18n';
import type { DXCUserInteraction, UserLogin } from 'dexie-cloud-addon';
import Image from 'next/image';

const cloudAvailable = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_DEXIE_CLOUD_DB_URL;

// Fallback observable that never emits (used when cloud isn't configured)
const noopObservable = { subscribe: () => ({ unsubscribe: () => {} }) } as any;

export default function LoginDialog() {
  const [lang, setLang] = useState<Language>(
    typeof navigator !== 'undefined' && navigator.language?.startsWith('zh') ? 'zh' : 'en'
  );
  const [email, setEmail] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const currentUser = useObservable<UserLogin | undefined>(
    () => cloudAvailable ? db.cloud.currentUser : noopObservable,
    [cloudAvailable]
  );

  const interaction = useObservable<DXCUserInteraction | undefined>(
    () => cloudAvailable ? db.cloud.userInteraction : noopObservable,
    [cloudAvailable]
  );

  // Don't show anything if cloud isn't configured or user is logged in
  if (!cloudAvailable || currentUser?.isLoggedIn) return null;

  // If there's an active userInteraction (e.g. OTP prompt), show that
  if (interaction) {
    return <InteractionDialog interaction={interaction} lang={lang} />;
  }

  // Otherwise show our own email login screen
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoggingIn(true);
    try {
      await db.cloud.login({ email: email.trim(), grant_type: 'otp' });
    } catch (err: any) {
      setError(err?.message || t('loginError', lang));
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 z-[100]" />

      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 mx-auto mb-4">
            <Image src="/bao.svg" alt="Baozi" width={80} height={80} />
          </div>

          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-1">
            {t('appTitle', lang)}
          </h1>
          <p className="text-xs text-gray-400 mb-8">{t('loginSubtitle', lang)}</p>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder', lang)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-purple-200 text-gray-700 text-sm
                         focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-300"
            />

            {error && (
              <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn || !email.trim()}
              className="w-full py-3 rounded-xl font-medium text-white transition-all shadow-sm
                         bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingIn ? t('loggingIn', lang) : t('continue', lang)}
            </button>
          </form>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="mt-6 text-xs text-gray-400 hover:text-purple-400 transition-colors"
          >
            {lang === 'zh' ? 'English' : '中文'}
          </button>
        </div>
      </div>
    </>
  );
}

/** Handles Dexie Cloud userInteraction prompts (OTP, alerts, logout confirmation) */
function InteractionDialog({ interaction, lang }: { interaction: DXCUserInteraction; lang: Language }) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    interaction.onSubmit(fieldValues);
    setFieldValues({});
  };

  const alertMessages = interaction.alerts
    ?.filter((a) => a.type === 'error' || a.type === 'warning')
    .map((a) => a.message) || [];

  const infoMessages = interaction.alerts
    ?.filter((a) => a.type === 'info')
    .map((a) => a.message) || [];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />

      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-pink-50 to-purple-50 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
          <div className="p-6 pb-2 text-center">
            <div className="w-16 h-16 mx-auto mb-3">
              <Image src="/bao.svg" alt="Baozi" width={64} height={64} />
            </div>
            <h2 className="text-lg font-bold text-gray-700">
              {interaction.title || t('loginTitle', lang)}
            </h2>
            {interaction.type === 'otp' && (
              <p className="text-xs text-gray-400 mt-1">{t('otpSubtitle', lang)}</p>
            )}
          </div>

          {alertMessages.length > 0 && (
            <div className="mx-6 mt-2">
              {alertMessages.map((msg, i) => (
                <div key={i} className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs mb-2">
                  {msg}
                </div>
              ))}
            </div>
          )}
          {infoMessages.length > 0 && (
            <div className="mx-6 mt-2">
              {infoMessages.map((msg, i) => (
                <div key={i} className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs mb-2">
                  {msg}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 pt-4">
            {Object.entries(interaction.fields).map(([name, field]) => {
              const f = field as { type: string; label?: string; placeholder?: string };
              return (
                <input
                  key={name}
                  type={f.type === 'otp' ? 'text' : f.type}
                  inputMode={f.type === 'otp' ? 'numeric' : f.type === 'email' ? 'email' : 'text'}
                  autoComplete={f.type === 'otp' ? 'one-time-code' : f.type === 'email' ? 'email' : 'off'}
                  autoFocus
                  value={fieldValues[name] || ''}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [name]: e.target.value }))}
                  placeholder={f.placeholder || f.label || ''}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-purple-200 text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-300 mb-3"
                />
              );
            })}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-medium text-white transition-all shadow-sm
                         bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
            >
              {interaction.submitLabel || t('continue', lang)}
            </button>

            {interaction.cancelLabel && (
              <button
                type="button"
                onClick={() => interaction.onCancel()}
                className="w-full mt-2 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {interaction.cancelLabel}
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
