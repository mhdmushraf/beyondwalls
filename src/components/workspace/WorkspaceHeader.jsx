import React, { useState, useEffect } from 'react';
import { Plus, Building2, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE_ACTION_LABELS = {
  advertiser: 'New campaign',
  venue: 'Add screen',
  enterprise: 'Add screen',
  agency: 'New campaign',
};

const TYPE_LABELS = {
  advertiser: 'Advertiser',
  venue: 'Venue',
  enterprise: 'Enterprise',
  agency: 'Agency',
};

export default function WorkspaceHeader({ org, user }) {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [switching, setSwitching] = useState(false);

  const planLabel =
    org.commercial_plan === 'saas'
      ? 'SaaS · 0% commission'
      : 'Revenue-share · 30%';

  const isScreenOrg = org.type === 'venue' || org.type === 'enterprise';

  // Fetch every org the user is a member of
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const memberships = await base44.entities.Membership.filter(
          { user_id: user.id },
          null,
          100,
          0
        );
        const orgIds = memberships.map((m) => m.org_id).filter(Boolean);
        if (orgIds.length === 0 || cancelled) return;
        const orgList = await base44.entities.Organization.filter(
          { id: { $in: orgIds } },
          null,
          100,
          0
        );
        if (!cancelled) setOrgs(orgList);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const hasMultipleOrgs = orgs.length > 1;

  const handleSwitchOrg = async (orgId) => {
    if (orgId === org.id || switching) return;
    setSwitching(true);
    try {
      await base44.functions.invoke('switchOrg', { org_id: orgId });
      // Reload so Layout and all pages pick up the new org
      window.location.reload();
    } catch (e) {
      const msg =
        e?.response?.data?.error || e?.data?.error || e?.message || 'Failed to switch organization';
      toast.error(msg);
      setSwitching(false);
    }
  };

  const handleAdd = () => {
    if (isScreenOrg) {
      navigate('/add-screen');
    } else {
      toast('Coming soon', {
        description: `${ROLE_ACTION_LABELS[org.type] || 'New'} will be available shortly.`,
      });
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg shadow-primary/20">
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="min-w-0">
          {hasMultipleOrgs ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={switching}
                  className="flex items-center gap-1.5 -ml-1 px-1 py-0.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  <h1 className="font-heading font-bold text-lg sm:text-xl text-slate-900 truncate">
                    {org.name}
                  </h1>
                  {switching ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-slate-400">
                  Switch organization
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {orgs.map((o) => (
                  <DropdownMenuItem
                    key={o.id}
                    onClick={() => handleSwitchOrg(o.id)}
                    disabled={switching || o.id === org.id}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{o.name}</p>
                      <p className="text-xs text-slate-400">
                        {TYPE_LABELS[o.type] || o.type}
                      </p>
                    </div>
                    {o.id === org.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <h1 className="font-heading font-bold text-lg sm:text-xl text-slate-900 truncate">
              {org.name}
            </h1>
          )}
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