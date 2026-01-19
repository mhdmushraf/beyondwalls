import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Globe, MapPin, Linkedin, Instagram, Twitter, Edit, Save, X, MonitorPlay } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function CEOProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Muhammed Musharaf",
    title: "Co-Founder & CEO",
    tagline: "Bridging FMCG Discipline with Digital Innovation",
    email: "ceo@beyondwalls.ae",
    phone: "+971 55 614 0067",
    experience: [
      {
        title: "Operational Leadership:",
        items: [
          "5+ years at Abdulla Wholesale (FMCG) (Dubai)",
          "Managed $15M+ brand budgets across MENA"
        ]
      },
      {
        title: "Financial Acumen:",
        items: [
          "UAE Chartered Accountant (IFAC Accredited)",
          "Specialized in retail monetization strategies"
        ]
      }
    ],
    education: [
      "BSc Business & Finance (First Class Honors)",
      "University of the West Scotland (UK)"
    ],
    uniqueValue: [
      "Dual qualifications in aviation (Current Pilot Training) and finance enable data-driven scaling",
      "Deep understanding of UAE retail landscapes"
    ],
    linkedin: "https://www.linkedin.com/in/muhammedmusharaf",
    instagram: "https://instagram.com/muhammedmusharaf",
    twitter: "https://twitter.com/mmusharaf"
  });
  const [editData, setEditData] = useState(profileData);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.role === "admin" || user?.user_role === "admin") {
        setIsAdmin(true);
      }
    } catch (e) {
      // User not logged in - that's fine for public page
    }
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    // In production, you'd save to database here
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-400 to-violet-500 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-90 -translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-indigo-400 to-indigo-500 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] opacity-90 translate-x-1/3 translate-y-1/4" />
      <div className="absolute top-1/2 right-20 w-[300px] h-[300px] bg-gradient-to-br from-purple-400 to-purple-500 rounded-[50%_50%_50%_50%/60%_40%_60%_40%] opacity-70" />
      
      <PublicNav />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Image Section */}
          <div className="relative flex items-center justify-center order-2 lg:order-1">
            <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full opacity-20 blur-3xl" />
            <div className="relative w-full max-w-[400px] sm:max-w-[450px]">
              {/* Profile Card */}
              <div className="w-full aspect-[9/11] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6 sm:p-12">
                  <div className="text-center">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl mb-6">
                      <MonitorPlay className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
                    </div>
                    <div className="w-36 h-36 sm:w-48 sm:h-48 mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full opacity-60 absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2" />
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 w-24 h-24 sm:w-32 sm:h-32 bg-violet-600 rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-16 h-16 sm:w-24 sm:h-24 bg-indigo-600 rounded-full -z-10" />
            </div>
          </div>
          
          {/* Right - Content Section */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            {isEditing ? (
              <div className="space-y-4 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 sm:mb-3 leading-tight">
                    {profileData.name}
                  </h1>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-700 mb-3 sm:mb-4">{profileData.title}</h2>
                  <p className="text-base sm:text-lg italic text-slate-600 mb-6 sm:mb-8">"{profileData.tagline}"</p>
                  
                  <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <MonitorPlay className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-base sm:text-lg text-slate-900">BeyondWalls</p>
                      <p className="text-xs sm:text-sm text-slate-500">A Linkzone Global FZ-LLC Company</p>
                    </div>
                  </div>
                  
                  {/* Experience */}
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xl">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">Experience</h3>
                    {profileData.experience.map((exp, idx) => (
                      <div key={idx} className="mb-4 sm:mb-6 last:mb-0">
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{exp.title}</h4>
                        <ul className="space-y-1 sm:space-y-2">
                          {exp.items.map((item, i) => (
                            <li key={i} className="text-sm sm:text-base text-slate-800 pl-4 relative before:content-['•'] before:absolute before:left-0">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    
                    {/* Education */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-900/20">
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Education:</h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {profileData.education.map((edu, i) => (
                          <li key={i} className="text-sm sm:text-base text-slate-800 pl-4 relative before:content-['•'] before:absolute before:left-0">
                            {edu}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Unique Value */}
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-900/20">
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Unique Value:</h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {profileData.uniqueValue.map((value, i) => (
                          <li key={i} className="text-sm sm:text-base text-slate-800 pl-4 relative before:content-['•'] before:absolute before:left-0">
                            {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div>
                  <Button 
                    onClick={() => setShowContactForm(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    GET IN TOUCH!
                  </Button>
                </div>
                
                {/* Contact & Social */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-slate-900 font-medium text-sm sm:text-base">{profileData.email}</p>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {isEditing ? (
                      <div className="space-y-2 w-full">
                        <Input
                          placeholder="LinkedIn URL"
                          value={editData.linkedin}
                          onChange={(e) => setEditData({...editData, linkedin: e.target.value})}
                        />
                        <Input
                          placeholder="Twitter URL"
                          value={editData.twitter}
                          onChange={(e) => setEditData({...editData, twitter: e.target.value})}
                        />
                      </div>
                    ) : (
                      <>
                        <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                        <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                        <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                        <a href="mailto:hello@beyondwalls.ae" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Edit Controls */}
            {isAdmin && (
              <div className="flex gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <CardContent className="p-6 sm:p-8 lg:p-12 relative">
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">About BeyondWalls</h2>
              <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-4">
                The UAE's leading digital out-of-home advertising platform, connecting advertisers with premium venue spaces across Dubai, Abu Dhabi, and beyond.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-violet-400 mb-2">500+</p>
                <p className="text-white/90 font-medium text-sm sm:text-base">Active Venues</p>
              </div>
              <div className="text-center p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-400 mb-2">1,200+</p>
                <p className="text-white/90 font-medium text-sm sm:text-base">Screens Live</p>
              </div>
              <div className="text-center p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-violet-400 mb-2">AED 2M+</p>
                <p className="text-white/90 font-medium text-sm sm:text-base">Paid to Venues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <PublicFooter />
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContactForm(false)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Contact Me</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowContactForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Your Name</Label>
                  <Input placeholder="Enter your name" className="mt-1" />
                </div>
                <div>
                  <Label>Your Email</Label>
                  <Input type="email" placeholder="your@email.com" className="mt-1" />
                </div>
                <div>
                  <Label>Message</Label>
                  <textarea 
                    rows={4} 
                    placeholder="How can I help you?"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Send Message
                </Button>
                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Or reach me directly:</p>
                  <a href={`mailto:${profileData.email}`} className="text-violet-600 hover:text-indigo-600 font-medium">
                    {profileData.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}