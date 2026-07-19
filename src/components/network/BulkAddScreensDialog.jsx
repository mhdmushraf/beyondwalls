import React, { useState } from 'react';
import Papa from 'papaparse';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ScreenCredentialsTable from './ScreenCredentialsTable';
import { Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_ROW = { name: '', price_per_week: '', public_ad_slots: '', location_description: '' };

export default function BulkAddScreensDialog({ open, onOpenChange, org, site, onCreated }) {
  const [mode, setMode] = useState('csv');
  const [csvText, setCsvText] = useState('');
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const parseCsv = () => {
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const cleaned = (parsed.data || [])
      .filter(r => r.name)
      .map(r => ({
        name: String(r.name || '').trim(),
        price_per_week: Number(r.price_per_week) || 0,
        public_ad_slots: Number(r.public_ad_slots) || 7,
        location_description: String(r.location_description || '').trim() || null,
      }));
    setPreview(cleaned);
    if (cleaned.length === 0) toast.error('No valid rows found');
  };

  const getRowData = () => {
    if (mode === 'csv') return preview || [];
    return rows
      .filter(r => r.name.trim())
      .map(r => ({
        name: r.name.trim(),
        price_per_week: Number(r.price_per_week) || 0,
        public_ad_slots: Number(r.public_ad_slots) || 7,
        location_description: r.location_description.trim() || null,
      }));
  };

  const handleSubmit = async () => {
    const screens = getRowData();
    if (screens.length === 0) { toast.error('No screens to create'); return; }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke('bulkCreateScreens', {
        org_id: org.id,
        site_id: site.id,
        screens,
      });
      setResult(res.data);
      if (res.data?.failed?.length > 0) {
        toast.warning(`${res.data.created.length} created, ${res.data.failed.length} failed`);
      } else {
        toast.success(`${res.data.created.length} screens created`);
      }
      onCreated?.();
    } catch (e) {
      toast.error(e.message || 'Failed to create screens');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCsvText(''); setRows([{ ...EMPTY_ROW }]); setPreview(null); setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Bulk add screens — {site?.name}</DialogTitle></DialogHeader>
        {result ? (
          <ScreenCredentialsTable created={result.created} failed={result.failed} onClose={handleClose} />
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMode('csv')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'csv' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>Paste CSV</button>
              <button onClick={() => setMode('rows')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === 'rows' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>Row editor</button>
            </div>

            {mode === 'csv' ? (
              <div className="space-y-3">
                <Label>CSV (columns: name, price_per_week, public_ad_slots, location_description)</Label>
                <Textarea
                  rows={8}
                  placeholder={'name,price_per_week,public_ad_slots,location_description\nLobby TV,150,7,Near entrance\nCafe Display,100,5,Coffee bar'}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="sm" onClick={parseCsv}><Upload className="w-4 h-4 mr-1" />Preview</Button>
                {preview && <p className="text-xs text-slate-500">{preview.length} screen(s) ready to create</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {rows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Input placeholder="Name" value={row.name} onChange={(e) => setRows(r => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} className="flex-1" />
                    <Input placeholder="Price/wk" type="number" value={row.price_per_week} onChange={(e) => setRows(r => r.map((x, j) => j === i ? { ...x, price_per_week: e.target.value } : x))} className="w-24" />
                    <Input placeholder="Slots" type="number" value={row.public_ad_slots} onChange={(e) => setRows(r => r.map((x, j) => j === i ? { ...x, public_ad_slots: e.target.value } : x))} className="w-20" />
                    <Input placeholder="Location" value={row.location_description} onChange={(e) => setRows(r => r.map((x, j) => j === i ? { ...x, location_description: e.target.value } : x))} className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => setRows(r => r.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setRows(r => [...r, { ...EMPTY_ROW }])}><Plus className="w-4 h-4 mr-1" />Add row</Button>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || getRowData().length === 0}>
                {submitting ? 'Creating…' : `Create ${getRowData().length} screen(s)`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}