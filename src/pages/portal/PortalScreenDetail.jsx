import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, RotateCcw, EyeOff, Eye, RefreshCw, Upload, Check, MonitorPlay, Wifi,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { useI18n } from '@/lib/i18n';
import { useSignedUrl, uploadPublic, formatDateTime, timeAgo, SCREEN_MODES } from '@/lib/portalData';
import { PageSkeleton } from '@/components/portal/Skeletons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fieldClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export default function PortalScreenDetail() {
  const { screenId } = useParams();
  const { t, lang } = useI18n();
  const { screens, venues, loadingData, reload } = usePortal();
  const screen = screens.find((item) => item.id === screenId);
  const venue = venues.find((item) => item.id === screen?.venue_id);
  const snapshot = useSignedUrl(screen?.last_snapshot_url);

  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (screen && !form) {
      setForm({
        name: screen.name || '',
        position_label: screen.position_label || '',
        orientation: screen.orientation || 'landscape',
        mode: screen.mode || 'signage_ads',
        screen_image_url: screen.screen_image_url || '',
      });
    }
  }, [screen, form]);

  if (loadingData && !screen) return <PageSkeleton />;

  if (!screen) {
    return (
      <div className="rounded-2xl border border-bw-line bg-white p-10 text-center">
        <p className="text-sm text-bw-muted">{t('screens.empty')}</p>
        <Link to="/app/screens" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-bw-coral hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t('nav.screens')}
        </Link>
      </div>
    );
  }

  const sendCommand = async (action) => {
    await base44.entities.Screen.update(screen.id, { player_command: `${action}:${Date.now()}` });
    toast.success(t('screens.commandSent'));
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await base44.entities.Screen.update(screen.id, form);
      reload();
      toast.success(t('screens.saved'));
    } finally {
      setBusy(false);
    }
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPublic(file);
      setForm((prev) => ({ ...prev, screen_image_url: url }));
    } finally {
      setUploading(false);
    }
  };

  const commands = [
    { action: 'restart', label: t('screens.restart'), icon: RotateCcw },
    { action: 'blank', label: t('screens.blank'), icon: EyeOff },
    { action: 'unblank', label: t('screens.unblank'), icon: Eye },
    { action: 'refresh', label: t('screens.refresh'), icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/screens" className="inline-flex items-center gap-1.5 text-xs font-semibold text-bw-muted hover:text-bw-navy">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('nav.screens')}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl md:text-2xl font-semibold text-bw-navy">{screen.name}</h1>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            screen.is_online ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${screen.is_online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {screen.is_online ? t('screens.online') : t('screens.offline')}
          </span>
        </div>
        <p className="mt-1 text-sm text-bw-muted">
          {venue?.name || '—'} · {screen.position_label || '—'}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-bw-line bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-bw-line">
            <p className="text-sm font-semibold text-bw-navy">{t('screens.snapshot')}</p>
            <button type="button" onClick={reload} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-bw-muted hover:text-bw-navy">
              <RefreshCw className="h-3.5 w-3.5" />
              {t('common.view')}
            </button>
          </div>
          <div className="aspect-video bg-bw-navy/95">
            {snapshot ? (
              <img src={snapshot} alt={screen.name} className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-white/40">
                <MonitorPlay className="h-8 w-8" />
                <span className="text-xs">{t('screens.noSnapshot')}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 px-5 py-4 border-t border-bw-line">
            <div>
              <p className="text-[11px] text-bw-muted">{t('screens.playing')}</p>
              <p className="text-xs font-medium text-bw-navy truncate">{screen.current_item || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] text-bw-muted">{t('screens.lastHeartbeat')}</p>
              <p className="text-xs font-medium text-bw-navy">
                {screen.last_heartbeat ? `${timeAgo(screen.last_heartbeat, lang)} · ${formatDateTime(screen.last_heartbeat, lang)}` : t('dashboard.never')}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-bw-line bg-white p-5">
            <p className="text-sm font-semibold text-bw-navy">Controls</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {commands.map((command) => {
                const Icon = command.icon;
                return (
                  <button
                    key={command.action}
                    type="button"
                    onClick={() => sendCommand(command.action)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-bw-line px-3 py-2.5 text-[11px] font-semibold text-bw-navy hover:bg-bw-cream"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {command.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-bw-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-bw-navy">{t('screens.tabGenerate')}</p>
              <Wifi className={`h-4 w-4 ${screen.paired_device_id ? 'text-emerald-500' : 'text-amber-400'}`} />
            </div>

            {screen.paired_device_id ? (
              <p className="mt-2 text-[11px] text-bw-muted break-all">
                Device {screen.paired_device_id.slice(0, 8)}… · {screen.paired_at ? formatDateTime(screen.paired_at, lang) : '—'}
              </p>
            ) : (
              <div className="mt-3">
                <p className="text-[11px] text-bw-muted">{t('screens.codeTitle')}</p>
                <div className="mt-2 flex gap-1.5">
                  {(screen.pairing_code || '------').split('').map((char, index) => (
                    <span key={index} className="h-9 w-8 rounded-lg bg-bw-navy text-white text-sm font-semibold flex items-center justify-center">
                      {char}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-bw-muted">{t('screens.codeHelp')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-bw-line bg-white p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('screens.rename')}</Label>
            <Input id="name" value={form?.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position">{t('screens.position')}</Label>
            <Input
              id="position"
              value={form?.position_label || ''}
              onChange={(e) => setForm({ ...form, position_label: e.target.value })}
              placeholder="Front counter"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="orientation">{t('screens.orientation')}</Label>
            <select id="orientation" className={fieldClass} value={form?.orientation || 'landscape'} onChange={(e) => setForm({ ...form, orientation: e.target.value })}>
              <option value="landscape">{t('screens.orientationLandscape')}</option>
              <option value="portrait">{t('screens.orientationPortrait')}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mode">{t('screens.mode')}</Label>
            <select id="mode" className={fieldClass} value={form?.mode || 'signage_ads'} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              {SCREEN_MODES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t('screens.photo')}</Label>
          <div className="flex items-center gap-3">
            {form?.screen_image_url ? (
              <img src={form.screen_image_url} alt="" className="h-14 w-20 rounded-lg object-cover border border-bw-line" />
            ) : (
              <div className="h-14 w-20 rounded-lg bg-bw-cream border border-bw-line flex items-center justify-center">
                <MonitorPlay className="h-5 w-5 text-bw-navy/30" />
              </div>
            )}
            <label className="inline-flex items-center gap-2 rounded-xl border border-bw-line px-3 py-2 text-xs font-semibold text-bw-navy cursor-pointer hover:bg-bw-cream">
              {uploading ? <Check className="h-4 w-4 text-emerald-500" /> : <Upload className="h-4 w-4" />}
              {uploading ? t('common.uploading') : t('common.upload') || 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-bw-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-bw-coral/90 disabled:opacity-60"
          >
            {busy ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}