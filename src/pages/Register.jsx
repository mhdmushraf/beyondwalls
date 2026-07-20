import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import BrandPanel from "@/components/auth/BrandPanel";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Megaphone,
  Building2,
  Briefcase,
  Users,
  Check,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const ACCOUNT_TYPES = [
  { key: "advertiser", label: "Advertiser", subtitle: "Run ads on screens", icon: Megaphone },
  { key: "venue", label: "Venue owner", subtitle: "Earn from your screens", icon: Building2 },
  { key: "enterprise", label: "Enterprise", subtitle: "Manage many screens", icon: Briefcase },
  { key: "agency", label: "Agency", subtitle: "Manage clients", icon: Users },
];

const STEP2_BRAND = {
  advertiser: { title: "You're joining as an", titleAccent: "Advertiser.", body: "One step and you're in — no approval wait." },
  venue: { title: "You're joining as a", titleAccent: "Venue Owner.", body: "One step and you're in — no approval wait." },
  enterprise: { title: "You're joining as an", titleAccent: "Enterprise.", body: "One step and you're in — no approval wait." },
  agency: { title: "You're joining as an", titleAccent: "Agency.", body: "One step and you're in — no approval wait." },
};

const inputClass =
  "w-full h-[48px] pl-11 pr-4 rounded-xl border bg-[#F7F8FC] border-[#E3E6F1] text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366f1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all duration-150";

export default function Register() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      await base44.auth.loginViaEmailPassword(email, password);
      try {
        await base44.functions.invoke("updateMyProfile", { full_name: fullName });
      } catch (e) {
        console.warn("Could not set profile fields:", e);
      }
      // Provision org + membership in backend (service role). Non-blocking —
      // user still lands in Workspace even if this fails.
      // If provisioning fails, nothing retries here — Workspace.jsx will attempt
      // recovery on the next load using the bw_provision_retry key written below.
      try {
        await base44.functions.invoke("provisionOrg", { account_type: accountType });
      } catch (e) {
        console.warn("Org provisioning failed:", e);
        sessionStorage.setItem("bw_provision_retry", JSON.stringify({ account_type: accountType, ts: Date.now() }));
      }
      navigate("/Workspace");
    } catch (err) {
      const msg = (err.response?.data?.detail || err.message || "").toString();
      if (/already|exists|registered|in use/i.test(msg)) {
        setError("An account with this email already exists — sign in instead.");
      } else if (/weak|short|8 character|password/i.test(msg)) {
        setError("Use at least 8 characters.");
      } else {
        setError("Something went wrong — please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const brandContent =
    step === 1
      ? {
          title: "Join the UAE's",
          titleAccent: "screen advertising marketplace.",
          body: "Advertisers, venue owners, malls and agencies — one platform, built for how you work.",
        }
      : STEP2_BRAND[accountType] || STEP2_BRAND.advertiser;

  const stepTransition = {
    duration: reduceMotion ? 0 : 0.25,
    ease: "easeOut",
  };

  return (
    <div className="bw-auth-shell">
      <BrandPanel title={brandContent.title} titleAccent={brandContent.titleAccent} body={brandContent.body} />
      <motion.div
        className="bw-form-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4 }}
      >
        <div className="bw-grab-handle" />
        <div className="bw-form-inner">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step >= 1 ? "bg-[#6366f1]" : "bg-slate-200"
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step >= 2 ? "bg-[#6366f1]" : "bg-slate-200"
              }`}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={stepTransition}
              >
                <div className="mb-6">
                  <h1
                    className="text-[26px] font-semibold text-slate-900 tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Create your account
                  </h1>
                  <p className="text-sm text-slate-500 mt-1.5">How will you use Beyond Walls?</p>
                </div>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 max-[359px]:grid-cols-1 gap-3 mb-4">
                  {ACCOUNT_TYPES.map(({ key, label, subtitle, icon: Icon }) => {
                    const selected = accountType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAccountType(key)}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all min-h-[110px] ${
                          selected
                            ? "border-[#6366f1] bg-violet-50"
                            : "border-[#E3E6F1] bg-[#F7F8FC] hover:border-slate-300"
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                        <Icon
                          className={`w-6 h-6 mb-3 ${selected ? "text-[#6366f1]" : "text-slate-400"}`}
                        />
                        <p className="font-semibold text-slate-900 text-sm">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  Enterprise &amp; agencies: 0% commission on a per-screen plan. Venue owners join free
                  and keep 100%.
                </p>

                <div className="text-center mb-6">
                  <Link to={createPageUrl("Plans")} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-600 hover:text-violet-700 underline">
                    Not sure which to pick? Compare account types
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!accountType}
                  className="w-full h-[52px] rounded-xl bg-[#6366f1] text-white font-semibold text-[16px] hover:bg-[#4f46e5] active:bg-[#4338ca] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-[18px] h-[18px]" />
                </button>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#6366f1] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={stepTransition}
              >
                <div className="mb-6">
                  <h1
                    className="text-[26px] font-semibold text-slate-900 tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Your details
                  </h1>
                  <p className="text-sm text-slate-500 mt-1.5">Create your login to get started.</p>
                </div>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="reg-name"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                      <input
                        id="reg-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className={inputClass}
                        required
                        disabled={loading}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Work email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                      <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={inputClass}
                        required
                        disabled={loading}
                        inputMode="email"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className={`${inputClass} pr-12`}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                        minLength={8}
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

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: reduceMotion ? 1 : 0.985 }}
                    className="w-full h-[52px] rounded-[11px] bg-gradient-to-b from-[#6D6FF5] to-[#6366F1] text-white font-semibold text-[16px] hover:from-[#5B5EE8] hover:to-[#595BE3] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create account &amp; enter
                        <ArrowRight className="w-[18px] h-[18px]" />
                      </>
                    )}
                  </motion.button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mt-4 h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
                  By continuing you agree to our{" "}
                  <Link to="/Terms" className="text-[#6366f1] hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/Privacy" className="text-[#6366f1] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}