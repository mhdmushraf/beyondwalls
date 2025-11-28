import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Smartphone,
  ScanLine,
  Box,
  Sparkles,
  ArrowRight,
  Play,
  Crown,
  Zap,
  Eye,
  ShoppingBag,
  BarChart3,
  Share2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ARFeatureSection() {
  const [showDemo, setShowDemo] = useState(false);

  const arFeatures = [
    {
      icon: ScanLine,
      title: "Instant WebAR",
      description: "No app download required. Scan QR code and experience AR instantly in browser",
      color: "violet"
    },
    {
      icon: Box,
      title: "3D Product Try-On",
      description: "Let customers virtually try products - watches, sunglasses, furniture & more",
      color: "indigo"
    },
    {
      icon: Eye,
      title: "Place in Room",
      description: "Visualize furniture, décor, or products in real environment before buying",
      color: "blue"
    },
    {
      icon: ShoppingBag,
      title: "Direct Conversion",
      description: "Buy Now, Book, or Get Directions buttons directly within AR experience",
      color: "emerald"
    },
    {
      icon: BarChart3,
      title: "AR Analytics",
      description: "Track scans, dwell time, interactions, and conversion funnels",
      color: "amber"
    },
    {
      icon: Share2,
      title: "Social Sharing",
      description: "Users share AR experiences to social media, creating organic marketing",
      color: "rose"
    }
  ];

  const arPhases = [
    {
      phase: "Phase 1",
      title: "Foundation",
      timeline: "Q1 2026",
      features: ["WebAR Try-On", "QR Code Integration", "Basic Analytics"]
    },
    {
      phase: "Phase 2",
      title: "Advanced",
      timeline: "Q3 2026",
      features: ["AI-Powered Targeting", "Animation & Interactivity", "Self-Serve AR Builder"]
    },
    {
      phase: "Phase 3",
      title: "AR-First",
      timeline: "2027+",
      features: ["Living Billboards", "Social AR Integration", "Premium Analytics"]
    }
  ];

  const useCases = [
    {
      industry: "Luxury Retail",
      example: "Virtual watch try-on in mall screens",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    },
    {
      industry: "Real Estate",
      example: "3D apartment tours from lobby screens",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
    },
    {
      industry: "Automotive",
      example: "Explore car interiors in showroom displays",
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop"
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-slate-900 via-violet-950 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 backdrop-blur-sm border border-violet-500/30 rounded-full px-5 py-2 mb-6">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-white font-semibold">Premium Feature</span>
            <Badge className="bg-amber-500 text-black border-0 text-xs">COMING SOON</Badge>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              AR Engage
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-slate-300">The Future of Interactive Advertising</span>
          </h2>
          
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Transform static screens into immersive experiences. Let customers interact with your products 
            through Augmented Reality - no app required, just scan and engage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 h-14 px-8 text-lg shadow-xl shadow-violet-500/25"
              onClick={() => setShowDemo(true)}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch AR Demo
            </Button>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-violet-500/50 text-white hover:bg-violet-500/10">
                Request Early Access
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* AR Demo Visual */}
        <div className="relative mb-20">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Phone Mockup */}
              <div className="relative flex justify-center">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="w-64 h-[500px] bg-slate-900 rounded-[3rem] border-4 border-slate-700 shadow-2xl shadow-violet-500/20 overflow-hidden">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-800 rounded-full" />
                    <div className="h-full p-2 pt-8">
                      <div className="h-full bg-gradient-to-br from-violet-900/50 to-indigo-900/50 rounded-[2.5rem] overflow-hidden relative">
                        {/* AR Scene */}
                        <img 
                          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=600&fit=crop" 
                          alt="AR furniture visualization"
                          className="w-full h-full object-cover"
                        />
                        {/* AR Overlay Elements */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 border-2 border-violet-400 rounded-lg animate-pulse flex items-center justify-center">
                            <Box className="w-12 h-12 text-violet-400" />
                          </div>
                        </div>
                        {/* AR UI Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3">
                          <p className="text-white text-sm font-medium mb-1">Modern Sofa</p>
                          <p className="text-violet-300 text-xs">Tap to place in room</p>
                          <div className="flex gap-2 mt-2">
                            <button className="flex-1 bg-violet-600 text-white text-xs py-2 rounded-lg">Buy Now</button>
                            <button className="flex-1 bg-slate-700 text-white text-xs py-2 rounded-lg">Share</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-violet-600 rounded-xl p-3 shadow-lg animate-bounce">
                    <ScanLine className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-emerald-600 rounded-xl p-3 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* How it Works */}
              <div className="space-y-8">
                <div>
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-4">How AR Engage Works</Badge>
                  <h3 className="text-2xl font-bold text-white mb-4">Scan. Experience. Convert.</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">QR Code Appears on Screen</p>
                      <p className="text-slate-400 text-sm">Dynamically generated for each AR-enabled ad</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Viewer Scans with Phone</p>
                      <p className="text-slate-400 text-sm">WebAR opens instantly in browser - no app needed</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-fuchsia-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Interact & Convert</p>
                      <p className="text-slate-400 text-sm">Try products, explore features, then buy directly</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <div>
                      <p className="font-semibold text-white">Premium Customers Only</p>
                      <p className="text-slate-400 text-sm">AR features available exclusively for premium advertisers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Powerful AR Capabilities</h3>
            <p className="text-slate-400">Everything you need to create immersive advertising experiences</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arFeatures.map((feature, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-violet-500/50 transition-all group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${feature.color}-500/20 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">AR Use Cases by Industry</h3>
            <p className="text-slate-400">See how different industries leverage AR advertising</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden">
                <img 
                  src={useCase.image} 
                  alt={useCase.industry}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="bg-violet-500/80 text-white border-0 mb-2">{useCase.industry}</Badge>
                  <p className="text-white font-medium">{useCase.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">AR Rollout Roadmap</h3>
            <p className="text-slate-400">Our phased approach to bringing AR to BeyondWalls</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {arPhases.map((phase, i) => (
              <Card key={i} className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-sm ${i === 0 ? 'ring-2 ring-violet-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={i === 0 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'}>{phase.phase}</Badge>
                    <span className="text-slate-400 text-sm">{phase.timeline}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">{phase.title}</h4>
                  <ul className="space-y-2">
                    {phase.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-slate-300 text-sm">
                        <CheckCircle2 className={`w-4 h-4 ${i === 0 ? 'text-violet-400' : 'text-slate-500'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Be Among the First to Access AR Engage
            </h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join our premium waitlist for exclusive early access to AR features. 
              Limited slots available for pilot program partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Contact")}>
                <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 text-lg">
                  Join Premium Waitlist
                  <Crown className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("Services")}>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-violet-500/50 text-white hover:bg-violet-500/10">
                  Learn More About Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Dialog */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">AR Engage Demo</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-violet-400" />
              </div>
              <p className="text-slate-400">AR Demo Video Coming Soon</p>
              <p className="text-slate-500 text-sm mt-2">Expected launch: Q1 2026</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}