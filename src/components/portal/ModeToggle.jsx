import React from 'react';
import { useI18n } from '@/lib/i18n';

export default function ModeToggle({ org, mode, onMode, onRequest }) {
  const { t } = useI18n();
  const advertiserStatus = org?.advertiser_status || 'none';

  if (advertiserStatus !== 'approved') {
    const requested = advertiserStatus === 'requested';
    return (
      <button
        type="button"
        onClick={onRequest}
        disabled={requested}
        className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
          requested
            ? 'bg-bw-cream text-bw-muted border border-bw-line cursor-default'
            : 'bg-bw-coral text-white hover:bg-bw-coral/90'
        }`}
      >
        {requested ? t('mode.requested') : t('mode.startAdvertising')}
      </button>
    );
  }

  return (
    <div className="inline-flex rounded-xl border border-bw-line bg-white p-0.5">
      {[
        { key: 'screens', label: t('mode.myScreens') },
        { key: 'advertise', label: t('mode.advertise') },
      ].map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onMode(option.key)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === option.key ? 'bg-bw-navy text-white' : 'text-bw-muted hover:text-bw-navy'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}