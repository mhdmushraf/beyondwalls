import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TOPUP_OPTIONS = [
  { amount: 500, priceId: "price_1St5VpRAtM7T4Nm9ghQHqkuA", label: "AED 500" },
  { amount: 1000, priceId: "price_1St5VpRAtM7T4Nm99wYlhNsl", label: "AED 1,000" },
  { amount: 2000, priceId: "price_1St5VpRAtM7T4Nm9RJUH4eMq", label: "AED 2,000" },
  { amount: 5000, priceId: "price_1St5VpRAtM7T4Nm9EMNHNkvR", label: "AED 5,000" },
];

export default function StripeTopUp({ onSuccess }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTopUp = async (option) => {
    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      toast.error("Payment checkout only works in published apps. Please publish your app to test payments.");
      return;
    }

    setIsProcessing(true);
    setSelectedAmount(option.amount);

    try {
      const response = await base44.functions.invoke('createStripeCheckout', {
        amount: option.amount,
        priceId: option.priceId
      });

      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session');
      setIsProcessing(false);
      setSelectedAmount(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-900">Top Up with Card</h3>
          <p className="text-sm text-slate-500">Instant wallet credit via Stripe</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TOPUP_OPTIONS.map((option) => (
          <Card
            key={option.amount}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedAmount === option.amount && isProcessing
                ? 'border-violet-600 bg-violet-50'
                : 'hover:border-violet-300'
            }`}
            onClick={() => !isProcessing && handleTopUp(option)}
          >
            <CardContent className="p-4 text-center">
              {selectedAmount === option.amount && isProcessing ? (
                <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto mb-2" />
              ) : (
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {option.label}
                </div>
              )}
              <p className="text-sm text-slate-500">
                {selectedAmount === option.amount && isProcessing
                  ? 'Processing...'
                  : 'Click to pay'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Secure Payment by Stripe</p>
            <p className="text-blue-700">
              Your payment is processed securely. Funds are added instantly to your wallet.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Test mode: Use card 4242 4242 4242 4242 with any future date and CVC
      </p>
    </div>
  );
}