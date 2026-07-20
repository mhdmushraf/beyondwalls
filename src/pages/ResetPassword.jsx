import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BrandPanel from "@/components/auth/BrandPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const inputFocusClass =
  "focus-visible:ring-0 focus-visible:border-[#6366f1] focus-visible:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all duration-150";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div className="bw-auth-shell">
        <BrandPanel
          title="Set a new password."
          body="Choose a new password to secure your Beyond Walls account."
        />
        <motion.div
          className="bw-form-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
        >
          <div className="bw-grab-handle" />
          <div className="bw-form-inner">
            <div className="text-center py-4">
              <h1
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Invalid reset link
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                This password reset link is missing a token. Please request a new reset link.
              </p>
              <Link to="/forgot-password">
                <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Request new link
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bw-auth-shell">
        <BrandPanel
          title="Set a new password."
          body="Choose a new password to secure your Beyond Walls account."
        />
        <motion.div
          className="bw-form-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
        >
          <div className="bw-grab-handle" />
          <div className="bw-form-inner">
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h1
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Password updated
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link to="/login">
                <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bw-auth-shell">
      <BrandPanel
        title="Set a new password."
        body="Choose a new password to secure your Beyond Walls account."
      />
      <motion.div
        className="bw-form-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4 }}
      >
        <div className="bw-grab-handle" />
        <div className="bw-form-inner">
          <div className="mb-6">
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Set a new password
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Choose a new password for your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={`pl-10 pr-10 ${inputFocusClass}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`pl-10 ${inputFocusClass}`}
                  required
                />
              </div>
            </div>

            <motion.div whileTap={{ scale: reduceMotion ? 1 : 0.98 }} className="w-full">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {loading ? "Updating…" : "Update password"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}