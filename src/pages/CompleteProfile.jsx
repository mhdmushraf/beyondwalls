import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  MonitorPlay,
  Upload,
  CheckCircle2,
  Loader2,
  User,
  Building2,
  Phone,
  MapPin,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    emirates_id_front_url: "",
    emirates_id_back_url: "",
    company_name: "",
    trade_license_url: "",
    authorized_person_name: "",
    authorized_person_role: ""
  });

  const accountType = sessionStorage.getItem("registration_account_type") || "individual";
  const userRole = sessionStorage.getItem("registration_user_role") || "advertiser";

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // If profile is already complete, redirect
      if (userData.profile_complete) {
        redirectToDashboard(userData.user_role);
      }
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("CompleteProfile"));
    }
  };

  const redirectToDashboard = (role) => {
    if (role === "venue_owner") {
      navigate(createPageUrl("VenueDashboard"));
    } else if (role === "admin") {
      navigate(createPageUrl("AdminDashboard"));
    } else {
      navigate(createPageUrl("AdvertiserDashboard"));
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        phone: formData.phone,
        address: formData.address,
        account_type: accountType,
        user_role: userRole,
        profile_complete: true,
        approval_status: "pending",
        is_advertiser: true,
        is_venue_owner: userRole === "venue_owner",
        wallet_balance: 0,
        total_earnings: 0,
        total_spent: 0
      };

      if (accountType === "individual") {
        updateData.emirates_id_url = formData.emirates_id_front_url;
      } else {
        updateData.company_name = formData.company_name;
        updateData.trade_license_url = formData.trade_license_url;
        updateData.emirates_id_url = formData.emirates_id_front_url;
      }

      await base44.auth.updateMe(updateData);
      
      // Create admin notification for new user
      await base44.entities.AdminNotification.create({
        type: "new_user",
        title: "New User Registration",
        message: `${user?.full_name || "A new user"} has registered and is pending approval`,
        reference_id: user?.email,
        reference_type: "user",
        status: "unread"
      });
      
      // Clear session storage
      sessionStorage.removeItem("registration_account_type");
      sessionStorage.removeItem("registration_user_role");
      
      toast.success("Profile submitted for approval!");
      navigate(createPageUrl("PendingApproval"));
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({ label, field, required = false }) => (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
      <div className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-all
        ${formData[field] ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-violet-300'}
      `}>
        {uploading[field] ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Uploading...</p>
          </div>
        ) : formData[field] ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-sm text-green-600 font-medium">File uploaded</p>
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, [field]: "" }))}
              className="text-xs text-slate-500 hover:text-slate-700 mt-1"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 font-medium">Click to upload</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (max 5MB)</p>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, field)}
            />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <MonitorPlay className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            BeyondWalls
          </span>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200/50">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              {accountType === "company" ? (
                <Building2 className="w-6 h-6 text-violet-600" />
              ) : (
                <User className="w-6 h-6 text-violet-600" />
              )}
              <span className="text-sm font-medium text-violet-600 capitalize">
                {accountType} Account • {userRole.replace("_", " ")}
              </span>
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              We need a few more details to verify your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+971 50 XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Building, Street, City"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Company Info */}
              {accountType === "company" && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-violet-600" />
                    Company Details
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="company_name"
                      placeholder="Your Company LLC"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="authorized_person_name">Authorized Person Name</Label>
                      <Input
                        id="authorized_person_name"
                        placeholder="Full Name"
                        value={formData.authorized_person_name}
                        onChange={(e) => setFormData({ ...formData, authorized_person_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authorized_person_role">Role</Label>
                      <Input
                        id="authorized_person_role"
                        placeholder="e.g., CEO, Manager"
                        value={formData.authorized_person_role}
                        onChange={(e) => setFormData({ ...formData, authorized_person_role: e.target.value })}
                      />
                    </div>
                  </div>

                  <FileUploadField 
                    label="Trade License" 
                    field="trade_license_url" 
                    required 
                  />
                </div>
              )}

              {/* ID Documents */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-600" />
                  Emirates ID Verification
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadField 
                    label="Emirates ID (Front)" 
                    field="emirates_id_front_url" 
                    required 
                  />
                  <FileUploadField 
                    label="Emirates ID (Back)" 
                    field="emirates_id_back_url" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}