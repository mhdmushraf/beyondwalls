import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MonitorPlay } from 'lucide-react';

export default function MobileAppIntro1({ onNext }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <MonitorPlay className="w-10 h-10 text-violet-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">BeyondWalls</h1>
          <p className="text-violet-100 text-sm font-medium">Digital Advertising for Everyone</p>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-3xl p-12 mb-8">
            <MonitorPlay className="w-24 h-24 text-white mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Advertise on Digital Screens
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Reach thousands of people with your ads on premium screens across UAE's top venues
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8 justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>

        {/* Button */}
        <Button 
          onClick={onNext}
          size="lg"
          className="w-full bg-white text-violet-600 hover:bg-slate-100 h-14 text-lg font-semibold shadow-xl"
        >
          Next
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}