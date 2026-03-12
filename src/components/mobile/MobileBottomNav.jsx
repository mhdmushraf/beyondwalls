import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Wallet, Settings } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function MobileBottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/MyBookings', icon: ShoppingCart, label: 'Bookings' },
    { path: '/Wallet', icon: Wallet, label: 'Wallet' },
    { path: '/Settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-40 safe-area-inset-bottom">
      <nav className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`select-none flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                active 
                  ? 'text-violet-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}