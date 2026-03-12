import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Clock, DollarSign, Zap } from 'lucide-react';

export default function MobileAppIntro2({ onNext }) {
  const benefits = [
    {
      icon: Clock,
      title: 'Go Live in Minutes',
      desc: 'Your ad is live within 30 mins'
    },
    {
      icon: TrendingUp,
      title: '72% Recall Rate',
      desc: 'Ads stick in captive audiences'
    },
    {
      icon: DollarSign,
      title: '90% Cost Savings',
      desc: 'vs traditional billboards'
    },
    {
      icon: Zap,
      title: 'No Contracts',
      desc: 'Pay per screen per week'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            Why Choose BeyondWalls?
          </h2>
          <p className="text-white/80">
            The fastest and easiest way to advertise
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-4 mb-12">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{benefit.title}</p>
                    <p className="text-white/70 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8 justify-center">
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={onNext}
            size="lg"
            className="flex-1 bg-white text-violet-600 hover:bg-slate-100 h-14 text-lg font-semibold"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}