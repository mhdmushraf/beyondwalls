import React from 'react';
import { useI18n } from '@/lib/i18n';

export default function LanguageToggle({ tone = 'light' }) {
  const { lang, setLang } = useI18n();

  const base = 'px-2.5 py-1 text-xs font-semibold rounded-md transition-colors';
  const idle = tone === 'dark'
    ? 'text-white/60 hover:text-white'
    : 'text-bw-muted hover:text-bw-navy';
  const active = tone === 'dark'
    ? 'bg-white/15 text-white'
    : 'bg-bw-navy text-white';

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg p-0.5 ${
        tone === 'dark' ? 'bg-white/10' : 'bg-bw-cream border border-bw-line'
      }`}
    >
      <button type="button" onClick={() => setLang('en')} className={`${base} ${lang === 'en' ? active : idle}`}>
        EN
      </button>
      <button type="button" onClick={() => setLang('ar')} className={`${base} ${lang === 'ar' ? active : idle}`}>
        ع
      </button>
    </div>
  );
}