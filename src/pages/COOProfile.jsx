import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Globe, MapPin, Linkedin, Instagram, Twitter, Edit, Save, X, MonitorPlay } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function COOProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Muhammed Shafi",
    title: "Chief Operating Officer",
    email: "coo@beyondwalls.ae",
    phone: "+971 55 614 0068",
    bio: "Overseeing operations and ensuring seamless execution across BeyondWalls. Committed to operational excellence, partner success, and driving sustainable growth in the DOOH industry.",
    linkedin: "https://www.linkedin.com/in/muhammedshafi",
    instagram: "https://instagram.com/muhammedshafi",
    twitter: "https://twitter.com/mshafi"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicNav />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>
          
          <CardContent className="pt-0 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 relative z-10">
              {/* Profile Image */}
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white">
                <MonitorPlay className="w-16 h-16 text-white" />
              </div>
              
              {/* Name and Title */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3 bg-white p-4 rounded-lg">
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
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">{profileData.name}</h1>
                    <p className="text-xl text-indigo-600 font-semibold mb-2">{profileData.title}</p>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                        <MonitorPlay className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-lg">BeyondWalls</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm">A Linkzone Global FZ-LLC Company</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Edit Button */}
              {isAdmin && (
                <div className="flex gap-2">
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
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg text-slate-900 mb-4">Contact Information</h2>
                
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
                    <a href={`mailto:${profileData.email}`} className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors group">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Mail className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium">{profileData.email}</p>
                      </div>
                    </a>
                    
                    <a href={`tel:${profileData.phone}`} className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors group">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                        <Phone className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium">{profileData.phone}</p>
                      </div>
                    </a>
                    
                    <a href="https://www.beyondwalls.ae" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 transition-colors group">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Website</p>
                        <p className="font-medium">www.beyondwalls.ae</p>
                      </div>
                    </a>
                    
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-violet-600" />
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
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg text-slate-900 mb-4">Connect</h2>
                
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
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg text-slate-900 mb-4">About</h2>
                
                {isEditing ? (
                  <div>
                    <Label>Bio</Label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      rows={6}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed">{profileData.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg text-slate-900 mb-4">About BeyondWalls</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  BeyondWalls is the UAE's leading digital out-of-home advertising platform, connecting advertisers with premium venue spaces across Dubai, Abu Dhabi, and beyond.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-600">500+</p>
                    <p className="text-sm text-slate-600 mt-1">Active Venues</p>
                  </div>
                  <div className="text-center p-4 bg-violet-50 rounded-lg">
                    <p className="text-3xl font-bold text-violet-600">1,200+</p>
                    <p className="text-sm text-slate-600 mt-1">Screens Live</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-600">AED 2M+</p>
                    <p className="text-sm text-slate-600 mt-1">Paid to Venues</p>
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