import React, { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BrandPanel from "@/components/auth/BrandPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const inputFocusClass =
  "text-[16px] min-h-[46px] focus-visible:ring-0 focus-visible:border-[#6366f1] focus-visible:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all duration-150";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bw-auth-shell">
      <SEOHead noIndex title="ForgotPassword | Beyond Walls" />
      <BrandPanel
        title="Reset your"
        titleAccent="password."
        body="Enter your email and we'll send you a secure link to get back into your account."
      />
      <motion.div
        className="bw-form-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4 }}
      >
        <div className="bw-grab-handle" />
        <div className="bw-form-inner">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h1
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Check your email
              </h1>
              <p className="text-sm text-slate-500 mb-6">
                We've sent a password reset link to <span className="font-medium text-slate-700">{email}</span>.
                Click the link in the email to set a new password.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full h-12">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1
                  className="text-2xl font-bold text-slate-900"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Reset your password
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`pl-10 ${inputFocusClass}`}
                      inputMode="email"
                      required
                    />
                  </div>
                </div>

                <motion.div whileTap={{ scale: reduceMotion ? 1 : 0.985 }} className="w-full">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-[11px] bg-gradient-to-b from-[#6D6FF5] to-[#6366F1] hover:from-[#5B5EE8] hover:to-[#595BE3]"
                  >
                    {loading ? "Sending…" : "Send reset link"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </motion.div>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Remembered your password?{" "}
                <Link to="/login" className="text-[#6366f1] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}