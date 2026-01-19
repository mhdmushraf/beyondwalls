import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorPlay, Megaphone, Building2, ArrowRight, CheckCircle } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function Onboarding() {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const handleSelection = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType === "advertiser") {
      navigate(createPageUrl("Register") + "?type=advertiser");
    } else if (selectedType === "venue") {
      navigate(createPageUrl("VenueOnboarding"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicNav />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
              <MonitorPlay className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Welcome to BeyondWalls
            </h1>
            <p className="text-xl text-slate-600">
              Let's get started! Tell us how you'd like to use our platform.
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Advertiser Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                selectedType === "advertiser" 
                  ? "ring-4 ring-violet-600 shadow-2xl" 
                  : "hover:shadow-xl"
              }`}
              onClick={() => handleSelection("advertiser")}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Megaphone className="w-8 h-8 text-white" />
                  </div>
                  {selectedType === "advertiser" && (
                    <CheckCircle className="w-8 h-8 text-violet-600" />
                  )}
                </div>
                <CardTitle className="text-2xl">I'm an Advertiser</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">
                  I want to display my ads on digital screens across Dubai and UAE
                </p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span>Access 500+ premium locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span>AI-powered targeting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span>Real-time analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span>Flexible pricing & packages</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Venue Owner Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                selectedType === "venue" 
                  ? "ring-4 ring-indigo-600 shadow-2xl" 
                  : "hover:shadow-xl"
              }`}
              onClick={() => handleSelection("venue")}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  {selectedType === "venue" && (
                    <CheckCircle className="w-8 h-8 text-indigo-600" />
                  )}
                </div>
                <CardTitle className="text-2xl">I'm a Venue Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">
                  I want to earn revenue by displaying ads in my venue
                </p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Earn up to AED 5,000/month per screen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>70% revenue share</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Zero upfront costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Free setup & support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedType}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-12 py-6 text-lg"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Info Section */}
          <div className="mt-16 text-center">
            <p className="text-slate-500 text-sm">
              Not sure which option to choose?{" "}
              <a href={createPageUrl("Contact")} className="text-violet-600 hover:text-violet-700 font-medium">
                Contact our team
              </a>
            </p>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}