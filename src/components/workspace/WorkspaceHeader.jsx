import React from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ROLE_ACTION_LABELS = {
  advertiser: 'New campaign',
  venue: 'Add screen',
  enterprise: 'Add screen',
  agency: 'New campaign',
};

export default function WorkspaceHeader({ org, user }) {
  const planLabel =
    org.commercial_plan === 'saas'
      ? 'SaaS · 0% commission'
      : 'Revenue-share · 30%';

  const handleAdd = () => {
    toast('Coming soon', {
      description: `${ROLE_ACTION_LABELS[org.type] || 'New'} will be available shortly.`,
    });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#6366f1] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg shadow-indigo-500/20">
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-heading font-bold text-lg sm:text-xl text-slate-900 truncate">{org.name}</h1>
          <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {planLabel}
          </span>
        </div>
      </div>
      <Button onClick={handleAdd} className="rounded-xl flex-shrink-0">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">{ROLE_ACTION_LABELS[org.type] || 'New'}</span>
      </Button>
    </div>
  );
}