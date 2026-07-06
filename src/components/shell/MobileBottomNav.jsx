import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const MAX_ITEMS = 5;

export default function MobileBottomNav({ navItems = [] }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  if (navItems.length === 0) return null;

  const hasMore = navItems.length > MAX_ITEMS;
  const visible = hasMore ? navItems.slice(0, MAX_ITEMS - 1) : navItems;
  const overflow = hasMore ? navItems.slice(MAX_ITEMS - 1) : [];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex items-stretch pb-[env(safe-area-inset-bottom)]"
      >
        {visible.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] min-w-[44px] py-2"
          >
            <item.icon
              className={`w-5 h-5 ${isActive(item.path) ? 'text-primary' : 'text-slate-400'}`}
            />
            <span
              className={`text-[10px] leading-tight truncate max-w-full px-1 ${
                isActive(item.path) ? 'text-primary font-medium' : 'text-slate-400'
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
        {hasMore && (
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] min-w-[44px] py-2"
          >
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] leading-tight text-slate-400">More</span>
          </button>
        )}
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 mt-4 pb-4">
            {overflow.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:bg-slate-50 min-h-[44px]"
              >
                <item.icon
                  className={`w-6 h-6 ${isActive(item.path) ? 'text-primary' : 'text-slate-500'}`}
                />
                <span
                  className={`text-xs ${
                    isActive(item.path) ? 'text-primary font-medium' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}