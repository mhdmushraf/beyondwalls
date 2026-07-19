import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, CheckCircle2 } from 'lucide-react';

export default function ScreenCredentialsTable({ created, failed, onClose }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="font-medium text-slate-900">{created.length} screen(s) created</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button>
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-200 bg-slate-50">
              <th className="p-3 font-medium">Screen name</th>
              <th className="p-3 font-medium">Setup code</th>
              <th className="p-3 font-medium">PIN</th>
            </tr>
          </thead>
          <tbody>
            {created.map((s, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="p-3 font-medium text-slate-900">{s.name}</td>
                <td className="p-3 font-mono text-slate-700">{s.setup_code}</td>
                <td className="p-3 font-mono text-slate-700">{s.screen_pin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {failed?.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
          {failed.length} screen(s) failed: {failed.map(f => f.name).join(', ')}
        </div>
      )}
      <Button onClick={onClose} className="w-full">Done</Button>
    </div>
  );
}