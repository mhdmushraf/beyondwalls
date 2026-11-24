import React from 'react';
import { Check, Circle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function SetupChecklist({ org, venues, screens }) {
  const { t } = useI18n();

  const items = [
    { label: t('dashboard.checkBusiness'), done: org?.status === 'approved' },
    { label: t('dashboard.checkVenue'), done: venues.length > 0 },
    { label: t('dashboard.checkScreen'), done: screens.length > 0 },
    { label: t('dashboard.checkPair'), done: screens.some((screen) => screen.paired_device_id) },
  ];

  const completed = items.filter((item) => item.done).length;

  return (
    <div className="rounded-2xl border border-bw-line bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-bw-navy">{t('dashboard.checklist')}</h2>
        <span className="text-xs text-bw-muted">{completed}/{items.length}</span>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-bw-cream overflow-hidden">
        <div className="h-full rounded-full bg-bw-coral transition-all" style={{ width: `${(completed / items.length) * 100}%` }} />
      </div>

      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5">
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                item.done ? 'bg-emerald-500 text-white' : 'bg-bw-cream text-bw-muted'
              }`}
            >
              {item.done ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
            </span>
            <span className={`text-xs ${item.done ? 'text-bw-muted line-through' : 'text-bw-navy font-medium'}`}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}