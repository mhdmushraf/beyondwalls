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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100">
      <PublicNav />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative w-40 h-40 bg-white rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-white/50">
                <MonitorPlay className="w-20 h-20 text-violet-600" />
              </div>
            </div>
          
            {/* Name and Info */}
            <div className="flex-1 text-white">
              {isEditing ? (
                <div className="space-y-3 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div>
                    <Label className="text-white/90">Full Name</Label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label className="text-white/90">Title</Label>
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-5xl md:text-6xl font-bold mb-3 drop-shadow-lg">{profileData.name}</h1>
                  <div className="inline-block px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-4">
                    <p className="text-xl font-semibold">{profileData.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                      <MonitorPlay className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">BeyondWalls</p>
                      <p className="text-sm text-white/70">A Linkzone Global FZ-LLC Company</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Edit Button */}
            {isAdmin && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 shadow-lg">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10 pb-16">

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Contact & Social */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full" />
                  <h2 className="font-bold text-xl text-slate-900">Get in Touch</h2>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <a href={`mailto:${profileData.email}`} className="flex items-center gap-3 text-slate-700 hover:text-violet-600 transition-colors group">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                        <Mail className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium">{profileData.email}</p>
                      </div>
                    </a>
                    
                    <a href={`tel:${profileData.phone}`} className="flex items-center gap-3 text-slate-700 hover:text-violet-600 transition-colors group">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Phone className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium">{profileData.phone}</p>
                      </div>
                    </a>
                    
                    <a href="https://www.beyondwalls.ae" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-700 hover:text-violet-600 transition-colors group">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                        <Globe className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Website</p>
                        <p className="font-medium">www.beyondwalls.ae</p>
                      </div>
                    </a>
                    
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="font-medium">Dubai, UAE</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full" />
                  <h2 className="font-bold text-xl text-slate-900">Connect</h2>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label>LinkedIn</Label>
                      <Input
                        value={editData.linkedin}
                        onChange={(e) => setEditData({...editData, linkedin: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input
                        value={editData.instagram}
                        onChange={(e) => setEditData({...editData, instagram: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Twitter</Label>
                      <Input
                        value={editData.twitter}
                        onChange={(e) => setEditData({...editData, twitter: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-all hover:scale-110">
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-all hover:scale-110">
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white hover:bg-slate-800 transition-all hover:scale-110">
                      <Twitter className="w-6 h-6" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - About */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full" />
                  <h2 className="font-bold text-2xl text-slate-900">About</h2>
                </div>
                
                {isEditing ? (
                  <div>
                    <Label>Bio</Label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      rows={6}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed">{profileData.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
              <CardContent className="p-8 relative">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-violet-400 to-indigo-400 rounded-full" />
                  <h2 className="font-bold text-2xl">About BeyondWalls</h2>
                </div>
                <p className="text-white/80 leading-relaxed mb-6">
                  BeyondWalls is the UAE's leading digital out-of-home advertising platform, connecting advertisers with premium venue spaces across Dubai, Abu Dhabi, and beyond.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <p className="text-4xl font-bold text-violet-400 mb-1">500+</p>
                    <p className="text-sm text-white/70">Active Venues</p>
                  </div>
                  <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <p className="text-4xl font-bold text-indigo-400 mb-1">1,200+</p>
                    <p className="text-sm text-white/70">Screens Live</p>
                  </div>
                  <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <p className="text-4xl font-bold text-violet-400 mb-1">AED 2M+</p>
                    <p className="text-sm text-white/70">Paid to Venues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <PublicFooter />
    </div>
  );
}