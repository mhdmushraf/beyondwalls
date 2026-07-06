import React from "react";
import { MonitorPlay } from "lucide-react";

export default function Workspace() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-5">
          <MonitorPlay className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your workspace is being rebuilt</h1>
        <p className="text-slate-500 text-sm">
          Sign-in works — dashboards are coming back shortly.
        </p>
      </div>
    </div>
  );
}