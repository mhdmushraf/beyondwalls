import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BrandPanel from "@/components/auth/BrandPanel";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const inputClass =
  "w-full h-[48px] pl-11 pr-4 rounded-xl border bg-[#F7F8FC] border-[#E3E6F1] text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all duration-150";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get("next") || "/Workspace";
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      navigate(nextUrl);
    } catch (err) {
      const msg = (err.response?.data?.detail || err.message || "").toString();
      if (/invalid|incorrect|unauthorized|wrong|not found|401|credential/i.test(msg)) {
        setError("Incorrect email or password.");
      } else {
        setError("Something went wrong — please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bw-auth-shell">
      <BrandPanel
        title="The operating system for"
        titleAccent="Digital Out-of-Home."
        body="Manage your screens, launch campaigns, and track performance — all in one place."
      />
      <motion.div
        className="bw-form-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4 }}
      >
        <div className="bw-grab-handle" />
        <div className="bw-form-inner">
          <div className="mb-8">
            <h1
              className="text-[26px] font-semibold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in to manage your screens and campaigns.
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                  disabled={loading}
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E3E6F1] text-[#6366f1] focus:ring-[#6366f1]"
                />
                <span className="text-sm text-slate-600">Keep me signed in</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#6366f1] hover:text-[#4f46e5] font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: reduceMotion ? 1 : 0.985 }}
              className="w-full h-[52px] rounded-[11px] bg-gradient-to-b from-[#6D6FF5] to-[#6366F1] text-white font-semibold text-[16px] hover:from-[#5B5EE8] hover:to-[#595BE3] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-[18px] h-[18px]" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            New to Beyond Walls?{" "}
            <Link to="/Register" className="text-[#6366f1] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}