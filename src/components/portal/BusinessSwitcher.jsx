import { Building2, ChevronDown, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useI18n } from '@/lib/i18n';

const STATUS_DOT = {
  approved: 'bg-emerald-500',
  pending: 'bg-amber-400',
  rejected: 'bg-rose-500',
  suspended: 'bg-slate-400',
};

export default function BusinessSwitcher({ orgs, org, onSelect }) {
  const { t } = useI18n();
  if (!org) return null;

  if (orgs.length < 2) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-bw-navy/5 border border-bw-line flex items-center justify-center shrink-0">
          <Building2 className="h-4 w-4 text-bw-navy" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-bw-navy truncate leading-tight">{org.name}</p>
          <p className="text-[11px] text-bw-muted capitalize leading-tight">{org.type}</p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-bw-line bg-white px-3 py-1.5 hover:border-bw-navy/30 transition-colors min-w-0"
        >
          <Building2 className="h-4 w-4 text-bw-navy shrink-0" />
          <span className="text-sm font-semibold text-bw-navy truncate max-w-[180px]">{org.name}</span>
          <ChevronDown className="h-4 w-4 text-bw-muted shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <p className="px-2 py-1.5 text-[11px] uppercase tracking-wide text-bw-muted">
          {t('nav.dashboard')}
        </p>
        {orgs.map((item) => (
          <DropdownMenuItem key={item.id} onClick={() => onSelect(item.id)} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[item.status] || 'bg-slate-300'}`} />
            <span className="flex-1 truncate">{item.name}</span>
            {item.id === org.id && <Check className="h-4 w-4 text-bw-coral" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}