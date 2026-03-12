import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MonitorPlay, Building2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MobileAppIntro3() {
  const features = [
    {
      icon: MonitorPlay,
      title: '500+ Screens',
      desc: 'Across all major venues in UAE'
    },
    {
      icon: Building2,
      title: 'Premium Venues',
      desc: 'Cafés, malls, gyms, hotels & more'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      desc: 'Track your campaign performance'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            Everything You Need
          </h2>
          <p className="text-white/80">
            Complete advertising platform at your fingertips
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
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
                    <p className="font-semibold text-white">{feature.title}</p>
                    <p className="text-white/70 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8 justify-center">
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>

        {/* CTA */}
        <Link to={createPageUrl('Login')} className="block">
          <Button 
            size="lg"
            className="w-full bg-white text-violet-600 hover:bg-slate-100 h-14 text-lg font-semibold shadow-xl"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        <p className="text-center text-white/60 text-sm mt-4">
          Ready to revolutionize your advertising?
        </p>
      </div>
    </div>
  );
}