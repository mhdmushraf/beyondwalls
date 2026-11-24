import React from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '@/components/portal/LanguageToggle';

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-bw-cream md:grid md:grid-cols-2">
      <div className="relative overflow-hidden bg-bw-navy text-white px-6 py-8 md:px-12 md:py-14 flex flex-col justify-between md:min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-bw-navy via-bw-navy to-bw-coral/60" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-bw-coral/20 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <span className="h-3.5 w-3.5 rounded-sm bg-bw-coral" />
            </span>
            <span className="font-semibold tracking-tight">Beyond Walls</span>
          </Link>
          <LanguageToggle tone="dark" />
        </div>

        <div className="relative z-10 mt-8 md:mt-0 max-w-md">
          <h1 className="text-2xl md:text-4xl font-semibold leading-tight tracking-tight">
            Every screen in your venue, working for you.
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
            Manage signage, host advertising and see what is playing right now.
          </p>
        </div>

        <p className="relative z-10 hidden md:block text-xs text-white/40">
          Beyond Walls · Dubai
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-10 md:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}