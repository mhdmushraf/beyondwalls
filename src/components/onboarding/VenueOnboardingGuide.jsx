import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  MonitorPlay, 
  BarChart3, 
  Wallet, 
  Users,
  Eye,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Play,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to BeyondWalls! 🎉",
    description: "Let's take a quick tour to help you get started earning money from your venue's screens.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400"
  },
  {
    id: "register-venue",
    title: "Step 1: Register Your Venue",
    description: "Start by adding your venue details. We'll use this information to show advertisers your venue's potential reach.",
    icon: Building2,
    tips: [
      "Add accurate customer count for better estimates",
      "Select where your screen will be placed",
      "Include peak hours for premium pricing"
    ]
  },
  {
    id: "audience-data",
    title: "Step 2: Audience Analytics",
    description: "Tell us about your customers. This helps advertisers understand your audience and pays you more for targeted placements.",
    icon: Users,
    tips: [
      "Daily customers = people who visit per day",
      "Dwell time = how long customers stay",
      "Screen visibility = % of customers who see it"
    ]
  },
  {
    id: "add-screens",
    title: "Step 3: Add Your Screens",
    description: "Once your venue is approved, add your digital screens. Each screen can display up to 8 ads in rotation.",
    icon: MonitorPlay,
    tips: [
      "Set competitive slot prices",
      "Keep 3 slots for your own promotions",
      "5 slots available for advertisers"
    ]
  },
  {
    id: "understand-metrics",
    title: "Understanding Your Analytics",
    description: "Learn what the numbers mean. These are DOOH (Digital Out-of-Home) advertising metrics:",
    icon: BarChart3,
    metrics: [
      { name: "Playouts", desc: "How many times your ad played", icon: Play },
      { name: "Impressions", desc: "Estimated people who saw the ad", icon: Eye },
      { name: "Reach", desc: "Unique individual viewers", icon: Users },
      { name: "CPM", desc: "Cost per 1,000 impressions", icon: Target }
    ]
  },
  {
    id: "earnings",
    title: "How You Earn Money",
    description: "You earn 70% of every ad booking on your screens. The more screens and traffic, the more you earn!",
    icon: Wallet,
    example: {
      slotPrice: 150,
      yourShare: 105,
      platformShare: 45
    }
  }
];

export default function VenueOnboardingGuide({ user, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    if (user?.onboarding_completed) {
      setIsVisible(false);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await base44.auth.updateMe({ onboarding_completed: true });
    } catch (e) {
      console.log("Could not save onboarding status");
    }
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="h-1 bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-violet-100 text-violet-700">
                {currentStep + 1} of {ONBOARDING_STEPS.length}
              </Badge>
              <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
            </div>

            <p className="text-slate-600 mb-4">{step.description}</p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {step.image && (
              <img 
                src={step.image} 
                alt={step.title}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
            )}

            {step.tips && (
              <div className="bg-violet-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-violet-800 mb-2">💡 Tips:</p>
                <ul className="space-y-2">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-violet-700">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step.metrics && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {step.metrics.map((metric, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <metric.icon className="w-4 h-4 text-violet-600" />
                      <span className="font-medium text-slate-900 text-sm">{metric.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">{metric.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {step.example && (
              <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800 mb-3">💰 Example Earnings:</p>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs text-emerald-600">Slot Price/Week</p>
                    <p className="text-lg font-bold text-emerald-700">AED {step.example.slotPrice}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                  <div className="text-center">
                    <p className="text-xs text-emerald-600">You Earn (70%)</p>
                    <p className="text-2xl font-bold text-emerald-700">AED {step.example.yourShare}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-500"
            >
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}