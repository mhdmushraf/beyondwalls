import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

export default function PublicFooter() {
  return (
    <footer className="py-12 px-6 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">BeyondWalls</span>
            </div>
            <p className="text-slate-400 text-sm">The #1 self-serve DOOH advertising platform in the UAE.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <div className="space-y-2 text-sm">
              <Link to={createPageUrl("About")} className="block text-slate-400 hover:text-white">About Us</Link>
              <Link to={createPageUrl("Services")} className="block text-slate-400 hover:text-white">Services</Link>
              <Link to={createPageUrl("Blog")} className="block text-slate-400 hover:text-white">Blog</Link>
              <Link to={createPageUrl("Contact")} className="block text-slate-400 hover:text-white">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <div className="space-y-2 text-sm">
              <Link to={createPageUrl("HowItWorks")} className="block text-slate-400 hover:text-white">How It Works</Link>
              <Link to={createPageUrl("ScreenLocations")} className="block text-slate-400 hover:text-white">Screen Locations</Link>
              <Link to={createPageUrl("HelpCenter")} className="block text-slate-400 hover:text-white">Help Center</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p>hello@beyondwalls.ae</p>
              <p>+971 55 614 0067</p>
              <p>Dubai, UAE</p>
            </div>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="mb-8 p-6 bg-slate-800 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white text-lg">Subscribe to our Newsletter</h4>
              <p className="text-slate-400 text-sm">Get the latest updates and insights delivered to your inbox.</p>
            </div>
            <NewsletterSignup source="footer" variant="dark" />
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © 2025 BeyondWalls. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to={createPageUrl("Terms")} className="text-slate-400 hover:text-white">Terms of Service</Link>
            <Link to={createPageUrl("Privacy")} className="text-slate-400 hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}