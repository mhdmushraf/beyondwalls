import React from "react";
import { Link } from "react-router-dom";
import { MonitorPlay } from "lucide-react";

export default function AuthCardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
          <MonitorPlay className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-2xl text-white">BeyondWalls</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-white/70">
        © Linkzone Global FZCO ·{" "}
        <Link to="/privacy" className="hover:text-white underline">Privacy</Link> ·{" "}
        <Link to="/terms" className="hover:text-white underline">Terms</Link>
      </p>
    </div>
  );
}