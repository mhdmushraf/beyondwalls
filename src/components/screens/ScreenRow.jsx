import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Wifi, WifiOff, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import moment from 'moment';

export default function ScreenRow({ screen, onEdit, onToggleMonetization }) {
  const isLive = screen.is_online && screen.last_heartbeat &&
    (Date.now() - new Date(screen.last_heartbeat).getTime()) < 30000;
  const mode = screen.monetization_mode || 'marketplace';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-slate-900 truncate">{screen.name}</p>
          {isLive ? (
            <Badge className="bg-green-100 text-green-700"><Wifi className="w-3 h-3 mr-1" />Live</Badge>
          ) : (
            <Badge className="bg-slate-100 text-slate-500"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">
          {screen.location_description || 'No location set'}
          {screen.last_heartbeat && ` · ${moment(screen.last_heartbeat).fromNow()}`}
        </p>
        <p className="text-xs text-slate-300 font-mono mt-0.5">{screen.setup_code}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleMonetization}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${mode === 'marketplace' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {mode === 'marketplace' ? 'Marketplace' : 'Private'}
        </button>
        <Link to={`/screen-pairing?screen_id=${screen.id}`}>
          <Button variant="ghost" size="icon"><QrCode className="w-4 h-4" /></Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}