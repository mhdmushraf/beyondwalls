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
  CheckCircle2,
  Sparkles,
  Tv2,
  Wallet,
  BarChart3
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
    base44.auth.redirectToLogin(createPageUrl("CompleteProfile") + "?signup=true");
  };

  const benefits = {
    advertiser: [
      { icon: Tv2, text: "Access 500+ premium screens" },
      { icon: Sparkles, text: "AI-powered campaign creation" },
      { icon: BarChart3, text: "Real-time analytics & reporting" },
    ],
    venue_owner: [
      { icon: Wallet, text: "Earn 70% revenue share" },
      { icon: MonitorPlay, text: "Easy screen management" },
      { icon: BarChart3, text: "Track earnings in real-time" },
    ]
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        {/* Animated Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          
          {/* Floating Cards Animation */}
          <div className="absolute top-1/4 right-10 w-48 h-32 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 transform rotate-6 animate-pulse" />
          <div className="absolute bottom-1/3 left-10 w-56 h-36 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 transform -rotate-3" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">BeyondWalls</span>
          </Link>

          {/* Main Message */}
          <div className="space-y-6">
            <div>
              <p className="text-violet-200 font-medium mb-2">Join the Revolution</p>
              <h1 className="text-4xl font-bold leading-tight">
                Start Your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-white">
                  DOOH Journey
                </span>
              </h1>
            </div>
            <p className="text-lg text-violet-200 max-w-sm">
              {userRole === "advertiser" 
                ? "Reach thousands of customers with stunning digital displays across premium venues in the UAE."
                : "Turn your screens into revenue generators. Join our network and start earning today."}
            </p>

            {/* Dynamic Benefits */}
            <div className="space-y-3 pt-4">
              {benefits[userRole].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-violet-300 text-sm">
            Trusted by 100+ businesses in UAE
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-7/12 flex flex-col bg-gradient-to-br from-slate-50 to-white">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 bg-gradient-to-r from-violet-600 to-indigo-600">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">BeyondWalls</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
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
                    onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                    className="text-violet-600 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Trust Indicator */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              🔒 Your data is secure with us. We never share your information.
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}