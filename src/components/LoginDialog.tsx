'use client';

import { useState } from 'react';
import { useObservable } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useLanguage, t } from '@/lib/i18n';
import type { DXCUserInteraction } from 'dexie-cloud-addon';
import Image from 'next/image';

export default function LoginDialog() {
  const { lang } = useLanguage();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const interaction = useObservable<DXCUserInteraction | undefined>(
    () => db.cloud.userInteraction,
    []
  );

  if (!interaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    interaction.onSubmit(fieldValues);
    setFieldValues({});
  };

  const handleCancel = () => {
    interaction.onCancel();
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
          {/* Header */}
          <div className="p-6 pb-2 text-center">
            <div className="w-16 h-16 mx-auto mb-3">
              <Image src="/bao.svg" alt="Baozi" width={64} height={64} />
            </div>
            <h2 className="text-lg font-bold text-gray-700">
              {interaction.title || t('loginTitle', lang)}
            </h2>
            {interaction.type === 'email' && (
              <p className="text-xs text-gray-400 mt-1">{t('loginSubtitle', lang)}</p>
            )}
            {interaction.type === 'otp' && (
              <p className="text-xs text-gray-400 mt-1">{t('otpSubtitle', lang)}</p>
            )}
          </div>

          {/* Alerts */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-4">
            {Object.entries(interaction.fields).map(([name, field]) => {
              const f = field as { type: string; label?: string; placeholder?: string };
              return (
                <input
                  key={name}
                  type={f.type === 'otp' ? 'text' : f.type}
                  inputMode={f.type === 'otp' ? 'numeric' : f.type === 'email' ? 'email' : 'text'}
                  autoComplete={f.type === 'email' ? 'email' : f.type === 'otp' ? 'one-time-code' : 'off'}
                  autoFocus
                  value={fieldValues[name] || ''}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [name]: e.target.value }))}
                  placeholder={f.placeholder || f.label || ''}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-purple-200 text-gray-700 text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-300 mb-3"
                />
              );
            })}

            {/* OAuth / OTP provider options */}
            {'options' in interaction && interaction.options && (interaction.options as any[]).length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {(interaction.options as Array<{ name: string; value: string; displayName: string; iconUrl?: string }>).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => interaction.onSubmit({ [option.name]: option.value })}
                    className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm
                               hover:bg-purple-50 hover:border-purple-200 transition-colors flex items-center justify-center gap-2"
                  >
                    {option.iconUrl && (
                      <img src={option.iconUrl} alt="" className="w-4 h-4" />
                    )}
                    {option.displayName}
                  </button>
                ))}
              </div>
            )}

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
                onClick={handleCancel}
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
