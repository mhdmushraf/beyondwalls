import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, Home, ArrowLeft, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center px-6">
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-violet-200 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-300 rounded-full blur-3xl opacity-20" />
      
      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Logo */}
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            BeyondWalls
          </span>
        </Link>

        {/* 404 Illustration */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-indigo-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30 transform rotate-12">
              <MonitorPlay className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Oops! Screen Not Found
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Looks like this page went beyond the walls. The screen you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to={createPageUrl("Home")}>
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-12 px-6">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto h-12 px-6 border-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-lg">
          <p className="text-sm text-slate-500 mb-4">Maybe you were looking for:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={createPageUrl("ScreenLocations")}>
              <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                <Search className="w-4 h-4 mr-1" />
                Browse Screens
              </Button>
            </Link>
            <Link to={createPageUrl("HowItWorks")}>
              <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                How It Works
              </Button>
            </Link>
            <Link to={createPageUrl("HelpCenter")}>
              <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                <HelpCircle className="w-4 h-4 mr-1" />
                Help Center
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}