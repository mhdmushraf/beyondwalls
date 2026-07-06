import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Maximize, Tag, Users } from 'lucide-react';

export default function MarketplaceCard({ screen, venue }) {
  const audience = [venue?.audience_age_group, venue?.audience_gender]
    .filter(Boolean).map(s => s.replace(/_/g, ' '));

  return (
    <Link to={`/screen-detail?screen_id=${screen.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-video bg-slate-100 relative">
          {screen.screen_image_url ? (
            <img src={screen.screen_image_url} alt={screen.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <Maximize className="w-8 h-8 text-slate-300" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-white/90 text-slate-700">
            {screen.width_px || '?'}×{screen.height_px || '?'}px
          </Badge>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-slate-900 text-sm truncate">{screen.name}</h3>
            <span className="text-sm font-bold text-violet-600 flex-shrink-0">
              AED {Math.round(screen.price_per_week || 0)}<span className="text-xs font-normal text-slate-400">/wk</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {screen.location_description || venue?.name || venue?.city || 'Location TBD'}
          </p>
          {audience.length > 0 && (
            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
              <Users className="w-3 h-3 flex-shrink-0" />
              {audience.join(' · ')}
              {venue?.daily_footfall ? ` · ${venue.daily_footfall.toLocaleString()}/day` : ''}
            </p>
          )}
          {screen.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {screen.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs py-0">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}