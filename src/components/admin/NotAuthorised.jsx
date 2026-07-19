import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function NotAuthorised() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-7 h-7 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Not authorised</h1>
        <p className="text-sm text-slate-500">You need admin access to view this page.</p>
      </div>
    </div>
  );
}