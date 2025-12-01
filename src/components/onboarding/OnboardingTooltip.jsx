import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingTooltip({ 
  id,
  title, 
  description, 
  position = "bottom", // top, bottom, left, right
  step,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  isVisible = true,
  highlightElement,
  icon: Icon = Lightbulb
}) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  if (!show) return null;

  const positionClasses = {
    top: "bottom-full mb-3 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-3 left-1/2 -translate-x-1/2",
    left: "right-full mr-3 top-1/2 -translate-y-1/2",
    right: "left-full ml-3 top-1/2 -translate-y-1/2"
  };

  const arrowClasses = {
    top: "bottom-[-8px] left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-transparent border-t-violet-600",
    bottom: "top-[-8px] left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent border-b-violet-600",
    left: "right-[-8px] top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-transparent border-l-violet-600",
    right: "left-[-8px] top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-transparent border-r-violet-600"
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`absolute z-50 ${positionClasses[position]}`}
      >
        <div className="bg-violet-600 text-white rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[320px]">
          {/* Arrow */}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
          
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-violet-200">Step {step} of {totalSteps}</p>
                <h4 className="font-semibold">{title}</h4>
              </div>
            </div>
            <button onClick={onSkip} className="text-violet-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-violet-100 mb-4">{description}</p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${
                  i + 1 === step ? "bg-white w-4" : i + 1 < step ? "bg-white/80" : "bg-white/30"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-violet-200 hover:text-white hover:bg-white/10"
            >
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {step > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrev}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  size="sm"
                  onClick={onNext}
                  className="bg-white text-violet-600 hover:bg-violet-100"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onComplete}
                  className="bg-white text-violet-600 hover:bg-violet-100"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Done
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}