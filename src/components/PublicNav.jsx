import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { MonitorPlay, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await base44.auth.isAuthenticated();
    setIsAuthenticated(auth);
  };

  const navLinks = [
    { name: "Features", href: "#features", isAnchor: true },
    { name: "Venues", href: "#venues", isAnchor: true },
    { name: "About", page: "About" },
    { name: "Services", page: "Services" },
    { name: "Contact", page: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={createPageUrl("Home")} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <MonitorPlay className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            BeyondWalls
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a key={link.name} href={link.href} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                {link.name}
              </a>
            ) : (
              <Link key={link.name} to={createPageUrl(link.page)} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                {link.name}
              </Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={createPageUrl("AdvertiserDashboard")}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="hidden sm:flex"
                onClick={() => base44.auth.redirectToLogin()}
              >
                Sign In
              </Button>
              <Link to={createPageUrl("Register")}>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a 
                key={link.name} 
                href={link.href} 
                className="block text-slate-600 hover:text-slate-900 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={createPageUrl(link.page)} 
                className="block text-slate-600 hover:text-slate-900 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>
      )}
    </nav>
  );
}