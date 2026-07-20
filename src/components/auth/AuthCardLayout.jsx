import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

export default function AuthCardLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-6">
      {/* Logo */}
      <Link to="/" className="mb-8">
        <BrandLogo size="lg" onDark />
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