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
    title: "Chief Executive Officer",
    email: "ceo@beyondwalls.ae",
    phone: "+971 55 614 0067",
    bio: "Leading BeyondWalls to transform digital out-of-home advertising across the UAE. Passionate about innovation, technology, and creating value for our venue partners and advertisers.",
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left - Image Section */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full opacity-20 blur-3xl" />
            <div className="relative">
              {/* Profile Card */}
              <div className="w-[450px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-12">
                  <div className="text-center">
                    <div className="w-64 h-64 mx-auto bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl mb-6">
                      <MonitorPlay className="w-32 h-32 text-white" />
                    </div>
                    <div className="w-48 h-48 mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full opacity-60 absolute bottom-12 left-1/2 -translate-x-1/2" />
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-600 rounded-2xl -z-10" />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-600 rounded-full -z-10" />
            </div>
          </div>
          
          {/* Right - Content Section */}
          <div className="space-y-8">
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
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-3 leading-tight">
                    Hello, I'm <span className="text-violet-600">{profileData.name}</span>
                  </h1>
                  <h2 className="text-2xl lg:text-3xl font-medium text-slate-700 mb-6">{profileData.title}</h2>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <MonitorPlay className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900">BeyondWalls</p>
                      <p className="text-sm text-slate-500">A Linkzone Global FZ-LLC Company</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed text-base mb-4 max-w-xl">
                    Leading the digital transformation of out-of-home advertising across the UAE. Connecting brands with premium venues and creating innovative advertising solutions.
                  </p>
                  
                  <p className="text-slate-600 leading-relaxed text-base mb-8 max-w-xl">
                    Passionate about leveraging technology to democratize advertising and empower venue owners to monetize their spaces.
                  </p>
                </div>
                
                {/* CTA Button */}
                <div>
                  <Button 
                    onClick={() => setShowContactForm(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    GET IN TOUCH!
                  </Button>
                </div>
                
                {/* Contact & Social */}
                <div className="space-y-4">
                  <p className="text-slate-900 font-medium text-base">{profileData.email}</p>
                  <div className="flex gap-3">
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
                        <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Linkedin className="w-5 h-5" />
                        </a>
                        <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Twitter className="w-5 h-5" />
                        </a>
                        <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Instagram className="w-5 h-5" />
                        </a>
                        <a href="mailto:hello@beyondwalls.ae" className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                          <Mail className="w-5 h-5" />
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <CardContent className="p-12 relative">
            <div className="text-center mb-10">
              <h2 className="font-bold text-4xl mb-4">About BeyondWalls</h2>
              <p className="text-white/80 text-lg max-w-3xl mx-auto leading-relaxed">
                The UAE's leading digital out-of-home advertising platform, connecting advertisers with premium venue spaces across Dubai, Abu Dhabi, and beyond.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-5xl font-bold text-violet-400 mb-2">500+</p>
                <p className="text-white/90 font-medium">Active Venues</p>
              </div>
              <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-5xl font-bold text-indigo-400 mb-2">1,200+</p>
                <p className="text-white/90 font-medium">Screens Live</p>
              </div>
              <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 hover:bg-white/20 transition-all">
                <p className="text-5xl font-bold text-violet-400 mb-2">AED 2M+</p>
                <p className="text-white/90 font-medium">Paid to Venues</p>
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