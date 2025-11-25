import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  MonitorPlay,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  Megaphone,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Register() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("individual");
  const [userRole, setUserRole] = useState("advertiser");
  const navigate = useNavigate();

  const handleContinue = async () => {
    // Store selections in sessionStorage for after auth
    sessionStorage.setItem("registration_account_type", accountType);
    sessionStorage.setItem("registration_user_role", userRole);
    
    // Redirect to login/register with callback to complete profile
    base44.auth.redirectToLogin(createPageUrl("CompleteProfile"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <MonitorPlay className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            BeyondWalls
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-violet-600' : 'bg-slate-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-violet-600' : 'bg-slate-200'}`} />
          </div>

          {step === 1 && (
            <Card className="border-0 shadow-2xl shadow-slate-200/50">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl">How would you like to register?</CardTitle>
                <CardDescription>Choose your account type to continue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={accountType} onValueChange={setAccountType}>
                  <Label
                    htmlFor="individual"
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      accountType === "individual" 
                        ? "border-violet-600 bg-violet-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <RadioGroupItem value="individual" id="individual" className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      accountType === "individual" ? "bg-violet-600" : "bg-slate-100"
                    }`}>
                      <User className={`w-6 h-6 ${accountType === "individual" ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Individual</p>
                      <p className="text-sm text-slate-500">Personal account with Emirates ID</p>
                    </div>
                    {accountType === "individual" && (
                      <CheckCircle2 className="w-6 h-6 text-violet-600" />
                    )}
                  </Label>

                  <Label
                    htmlFor="company"
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      accountType === "company" 
                        ? "border-violet-600 bg-violet-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <RadioGroupItem value="company" id="company" className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      accountType === "company" ? "bg-violet-600" : "bg-slate-100"
                    }`}>
                      <Building2 className={`w-6 h-6 ${accountType === "company" ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Company</p>
                      <p className="text-sm text-slate-500">Business account with trade license</p>
                    </div>
                    {accountType === "company" && (
                      <CheckCircle2 className="w-6 h-6 text-violet-600" />
                    )}
                  </Label>
                </RadioGroup>

                <Button 
                  onClick={() => setStep(2)}
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 mt-6"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-0 shadow-2xl shadow-slate-200/50">
              <CardHeader className="space-y-1 pb-6">
                <button 
                  onClick={() => setStep(1)}
                  className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
                <CardTitle className="text-2xl">What brings you here?</CardTitle>
                <CardDescription>Choose how you want to use BeyondWalls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={userRole} onValueChange={setUserRole}>
                  <Label
                    htmlFor="advertiser"
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      userRole === "advertiser" 
                        ? "border-violet-600 bg-violet-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <RadioGroupItem value="advertiser" id="advertiser" className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      userRole === "advertiser" ? "bg-violet-600" : "bg-slate-100"
                    }`}>
                      <Megaphone className={`w-6 h-6 ${userRole === "advertiser" ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Advertiser</p>
                      <p className="text-sm text-slate-500">Run ads on screens across venues</p>
                    </div>
                    {userRole === "advertiser" && (
                      <CheckCircle2 className="w-6 h-6 text-violet-600" />
                    )}
                  </Label>

                  <Label
                    htmlFor="venue_owner"
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      userRole === "venue_owner" 
                        ? "border-violet-600 bg-violet-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <RadioGroupItem value="venue_owner" id="venue_owner" className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      userRole === "venue_owner" ? "bg-violet-600" : "bg-slate-100"
                    }`}>
                      <Building2 className={`w-6 h-6 ${userRole === "venue_owner" ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Venue Owner</p>
                      <p className="text-sm text-slate-500">Monetize screens at your venue</p>
                    </div>
                    {userRole === "venue_owner" && (
                      <CheckCircle2 className="w-6 h-6 text-violet-600" />
                    )}
                  </Label>
                </RadioGroup>

                <Button 
                  onClick={handleContinue}
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 mt-6"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-center text-sm text-slate-500 mt-4">
                  Already have an account?{" "}
                  <button 
                    onClick={() => base44.auth.redirectToLogin()}
                    className="text-violet-600 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}