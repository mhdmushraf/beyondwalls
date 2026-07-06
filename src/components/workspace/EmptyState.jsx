import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
      <p className="font-medium text-slate-900 mb-1">{title}</p>
      <p className="text-sm text-slate-500 mb-4">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}