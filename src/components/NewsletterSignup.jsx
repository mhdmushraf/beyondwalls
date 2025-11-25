import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NewsletterSignup({ source = "footer", variant = "default" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      // Check if already subscribed
      const existing = await base44.entities.NewsletterSubscriber.filter({ email: email.trim() });
      if (existing.length > 0) {
        if (existing[0].status === "unsubscribed") {
          await base44.entities.NewsletterSubscriber.update(existing[0].id, { status: "active" });
          toast.success("Welcome back! You've been resubscribed.");
        } else {
          toast.info("You're already subscribed!");
        }
      } else {
        await base44.entities.NewsletterSubscriber.create({
          email: email.trim(),
          source,
          status: "active"
        });
        toast.success("Successfully subscribed!");
      }
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    }
    setLoading(false);
  };

  if (subscribed) {
    return (
      <div className={`flex items-center gap-2 ${variant === "inline" ? "text-sm" : ""}`}>
        <CheckCircle className="w-5 h-5 text-emerald-500" />
        <span className={variant === "dark" ? "text-white" : "text-slate-700"}>
          Thanks for subscribing!
        </span>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-amber-100 text-slate-900 hover:bg-amber-100/90"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </Button>
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm"
        />
        <Button type="submit" size="sm" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-indigo-600">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
      </Button>
    </form>
  );
}