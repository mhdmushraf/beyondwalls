import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
      <div className="space-y-4">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}