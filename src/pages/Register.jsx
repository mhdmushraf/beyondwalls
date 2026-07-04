import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  Megaphone,
  CheckCircle2,
  MonitorPlay,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import AuthCardLayout from "@/components/auth/AuthCardLayout";

export default function Register() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("individual");
  const [userRole, setUserRole] = useState("advertiser");

  const handleContinue = async () => {
    // Store selections in sessionStorage for after auth
    sessionStorage.setItem("registration_account_type", accountType);
    sessionStorage.setItem("registration_user_role", userRole);

    // Use Base44's built-in auth redirect which handles both login and signup
    base44.auth.redirectToLogin(createPageUrl("CompleteProfile") + "?signup=true");
  };

  return (
    <>
      <SEOHead {...PAGE_SEO.register} />
      <AuthCardLayout>
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-violet-600" : "bg-slate-200"}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-violet-600" : "bg-slate-200"}`} />
        </div>

        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Get your screens earning</h1>
              <p className="text-sm text-slate-500 mt-1">Choose your account type to continue</p>
            </div>

            <RadioGroup value={accountType} onValueChange={setAccountType} className="space-y-3">
              <Label
                htmlFor="individual"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  accountType === "individual"
                    ? "border-violet-600 bg-violet-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="individual" id="individual" className="sr-only" />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  accountType === "individual" ? "bg-violet-600" : "bg-slate-100"
                }`}>
                  <User className={`w-5 h-5 ${accountType === "individual" ? "text-white" : "text-slate-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Individual</p>
                  <p className="text-xs text-slate-500">Personal account with Emirates ID</p>
                </div>
                {accountType === "individual" && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
              </Label>

              <Label
                htmlFor="company"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  accountType === "company"
                    ? "border-violet-600 bg-violet-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="company" id="company" className="sr-only" />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  accountType === "company" ? "bg-violet-600" : "bg-slate-100"
                }`}>
                  <Building2 className={`w-5 h-5 ${accountType === "company" ? "text-white" : "text-slate-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Company</p>
                  <p className="text-xs text-slate-500">Business account with trade license</p>
                </div>
                {accountType === "company" && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
              </Label>
            </RadioGroup>

            <Button
              onClick={() => setStep(2)}
              className="w-full h-12 mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Get your screens earning</h1>
              <p className="text-sm text-slate-500 mt-1">Choose how you want to use BeyondWalls</p>
            </div>

            <RadioGroup value={userRole} onValueChange={setUserRole} className="space-y-3">
              <Label
                htmlFor="advertiser"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  userRole === "advertiser"
                    ? "border-violet-600 bg-violet-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="advertiser" id="advertiser" className="sr-only" />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  userRole === "advertiser" ? "bg-violet-600" : "bg-slate-100"
                }`}>
                  <Megaphone className={`w-5 h-5 ${userRole === "advertiser" ? "text-white" : "text-slate-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Advertiser</p>
                  <p className="text-xs text-slate-500">Run ads on screens across venues</p>
                </div>
                {userRole === "advertiser" && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
              </Label>

              <Label
                htmlFor="venue_owner"
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  userRole === "venue_owner"
                    ? "border-violet-600 bg-violet-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="venue_owner" id="venue_owner" className="sr-only" />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  userRole === "venue_owner" ? "bg-violet-600" : "bg-slate-100"
                }`}>
                  <Building2 className={`w-5 h-5 ${userRole === "venue_owner" ? "text-white" : "text-slate-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">Venue Owner</p>
                  <p className="text-xs text-slate-500">Monetize screens at your venue</p>
                </div>
                {userRole === "venue_owner" && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
              </Label>
            </RadioGroup>

            <Button
              onClick={handleContinue}
              className="w-full h-12 mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <button
              onClick={() => setStep(1)}
              className="w-full inline-flex items-center justify-center text-sm text-slate-500 hover:text-slate-700 mt-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                className="text-violet-600 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          🔒 Your data is secure with us. We never share your information.
        </p>
      </AuthCardLayout>
    </>
  );
}