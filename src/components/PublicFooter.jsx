import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, Twitter, Instagram, Youtube, Facebook, Linkedin, Mail, Phone, Globe2 } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";

const SOCIAL_LINKS = [
  { name: "X/Twitter", url: "https://x.com/BeyondWallsae", icon: Twitter },
  { name: "Instagram", url: "https://www.instagram.com/beyondwallsae/", icon: Instagram },
  { name: "YouTube", url: "https://www.youtube.com/@BeyondWallsAE", icon: Youtube },
  { name: "Facebook", url: "https://www.facebook.com/beyondwallsae", icon: Facebook },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/beyondwallsae", icon: Linkedin },
];

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
              <Link to={createPageUrl("DOOHAdvertisingDubai")} className="block text-slate-400 hover:text-white">DOOH Advertising Dubai</Link>
              <Link to={createPageUrl("DigitalSignageUAE")} className="block text-slate-400 hover:text-white">Digital Signage UAE</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <a href="mailto:hello@beyondwalls.ae" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-violet-400" />
                hello@beyondwalls.ae
              </a>
              <a href="tel:+971556140067" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-violet-400" />
                +971 55 614 0067
              </a>
              <a href="https://www.beyondwalls.ae" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Globe2 className="w-4 h-4 text-violet-400" />
                www.beyondwalls.ae
              </a>
            </div>
            <div className="flex gap-3 mt-4">
              {SOCIAL_LINKS.map((social) => (
                <a 
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-slate-800 hover:bg-violet-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </a>
              ))}
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
          <div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} BeyondWalls UAE. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs mt-1">
              🇦🇪 Based in Dubai, UAE | in5 Tech, Dubai Internet City | <a href="https://www.beyondwalls.ae" className="hover:text-white">www.beyondwalls.ae</a>
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to={createPageUrl("Terms")} className="text-slate-400 hover:text-white">Terms</Link>
            <Link to={createPageUrl("Privacy")} className="text-slate-400 hover:text-white">Privacy</Link>
            <Link to={createPageUrl("SitemapPage")} className="text-slate-400 hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}