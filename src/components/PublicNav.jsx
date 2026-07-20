import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { MonitorPlay, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavSolutionsDropdown from "@/components/marketing/NavSolutionsDropdown";

export default function PublicNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleDashboardClick = () => {
    navigate(createPageUrl("Workspace"));
  };

  const navLinks = [
    { name: "Home", page: "Home" },
    { name: "About", page: "About" },
    { name: "Plans", page: "Plans" },
    { name: "Services", page: "Services" },
    { name: "Screen Locations", page: "ScreenLocations" },
    { name: "Blog", page: "Blog" },
    { name: "Help Center", page: "HelpCenter" },
    { name: "Contact", page: "Contact" },
    { name: "AR Engage", page: "ARPremium", isNew: true },
    { name: "Connect", page: "Connect", highlight: true },
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
        <div className="hidden lg:flex items-center gap-6">
          <NavSolutionsDropdown />
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={createPageUrl(link.page)} 
              className={`font-medium transition-colors text-sm whitespace-nowrap ${
                link.highlight 
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-1.5 rounded-full hover:from-violet-700 hover:to-indigo-700" 
                  : link.isNew
                  ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white px-3 py-1.5 rounded-full hover:from-fuchsia-600 hover:to-violet-600 flex items-center gap-1"
                  : "text-slate-600 hover:text-violet-600"
              }`}
            >
              {link.highlight ? "✨ Connect" : link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                onClick={handleDashboardClick}
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:flex"
                onClick={() => base44.auth.redirectToLogin(createPageUrl("Workspace"))}
              >
                Sign In
              </Button>
              <Link to={createPageUrl("Register")}>
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={createPageUrl(link.page)} 
              className={`block font-medium py-2.5 px-3 rounded-lg transition-colors ${
                link.highlight 
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white" 
                  : link.isNew
                  ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white"
                  : "text-slate-600 hover:text-violet-600 hover:bg-violet-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.highlight ? "✨ Connect" : link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}