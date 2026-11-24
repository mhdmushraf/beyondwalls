import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Tv } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { useI18n } from '@/lib/i18n';
import { SCREEN_MODES, PLAYER_TYPES } from '@/lib/portalData';

const fieldClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export default function AddScreenDialog({ open, onOpenChange, venue }) {
  const { t } = useI18n();
  const { reload } = usePortal();
  const [tab, setTab] = useState('tv');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [orientation, setOrientation] = useState('landscape');
  const [mode, setMode] = useState('signage_ads');
  const [playerType, setPlayerType] = useState('browser');
  const [createdCode, setCreatedCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setCode('');
    setName('');
    setCreatedCode('');
    setError('');
    setCopied(false);
  };

  const close = (next) => {
    reset();
    onOpenChange(next);
  };

  const pairWithCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('claimPlayerCode', {
        code: code.trim().toUpperCase(),
        venue_id: venue.id,
        name: name.trim(),
        orientation,
        mode,
        player_type: playerType,
      });
      if (res.data?.screen) {
        reload();
        close(false);
      } else {
        setError(res.data?.error || 'That code could not be paired.');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'That code could not be paired.');
    } finally {
      setBusy(false);
    }
  };

  const generate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('createScreenCode', {
        venue_id: venue.id,
        name: name.trim(),
        orientation,
        mode,
        player_type: playerType,
      });
      if (res.data?.code) {
        setCreatedCode(res.data.code);
        reload();
      } else {
        setError(res.data?.error || 'We could not create the screen.');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'We could not create the screen.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('screens.addTitle')}</DialogTitle>
        </DialogHeader>

        {createdCode ? (
          <div className="text-center py-2">
            <div className="mx-auto h-11 w-11 rounded-2xl bg-bw-cream flex items-center justify-center">
              <Tv className="h-5 w-5 text-bw-coral" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-bw-navy">{t('screens.codeTitle')}</h3>
            <div className="mt-4 flex items-center justify-center gap-2">
              {createdCode.split('').map((char, index) => (
                <span
                  key={index}
                  className="h-12 w-10 rounded-xl bg-bw-navy text-white text-xl font-semibold flex items-center justify-center"
                >
                  {char}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-bw-muted leading-relaxed">{t('screens.codeHelp')}</p>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-2 rounded-xl border border-bw-line px-4 py-2.5 text-sm font-semibold text-bw-navy"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-xl bg-bw-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-bw-coral/90"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-bw-cream p-1">
              <button
                type="button"
                onClick={() => { setTab('tv'); setError(''); }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === 'tv' ? 'bg-white text-bw-navy shadow-sm' : 'text-bw-muted'}`}
              >
                {t('screens.tabTvCode')}
              </button>
              <button
                type="button"
                onClick={() => { setTab('generate'); setError(''); }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === 'generate' ? 'bg-white text-bw-navy shadow-sm' : 'text-bw-muted'}`}
              >
                {t('screens.tabGenerate')}
              </button>
            </div>

            <form onSubmit={tab === 'tv' ? pairWithCode : generate} className="space-y-4">
              {tab === 'tv' && (
                <div className="space-y-1.5">
                  <Label htmlFor="pair-code">{t('screens.enterCode')}</Label>
                  <Input
                    id="pair-code"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    className="text-center text-xl tracking-[0.4em] font-semibold uppercase"
                    placeholder="ABC123"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="screen-name">{t('screens.rename')}</Label>
                <Input
                  id="screen-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`${venue?.name || ''} screen`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="screen-orientation">{t('screens.orientation')}</Label>
                  <select id="screen-orientation" className={fieldClass} value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                    <option value="landscape">{t('screens.orientationLandscape')}</option>
                    <option value="portrait">{t('screens.orientationPortrait')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="screen-mode">{t('screens.mode')}</Label>
                  <select id="screen-mode" className={fieldClass} value={mode} onChange={(e) => setMode(e.target.value)}>
                    {SCREEN_MODES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="screen-player">{t('screens.player')}</Label>
                <select id="screen-player" className={fieldClass} value={playerType} onChange={(e) => setPlayerType(e.target.value)}>
                  {PLAYER_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => close(false)} className="rounded-xl border border-bw-line px-4 py-2.5 text-sm font-semibold text-bw-muted">
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-bw-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-bw-coral/90 disabled:opacity-60"
                >
                  {busy ? t('common.loading') : tab === 'tv' ? t('screens.pair') : t('screens.generate')}
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}