import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';

export default function RejectDialog({ open, onOpenChange, onConfirm, title, busy }) {
  const { t } = useI18n();
  const [reason, setReason] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason('');
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t('admin.rejectTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <p className="text-xs text-bw-muted">{t('admin.rejectBody')}</p>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">{t('common.reason')}</Label>
            <textarea
              id="reject-reason"
              required
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-bw-line px-4 py-2.5 text-sm font-semibold text-bw-muted"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {busy ? t('common.loading') : t('common.reject')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}