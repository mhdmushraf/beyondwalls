import React from 'react';
import { Card } from '@/components/ui/card';

export default function KpiCard({ icon: Icon, label, value, sublabel, loading }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />}
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className="text-xl sm:text-2xl font-bold font-heading text-slate-900 truncate">{value}</p>
      )}
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </Card>
  );
}