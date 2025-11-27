import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  FileText,
  Camera,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    avatar_url: "",
    emirates_id_front_url: "",
    emirates_id_back_url: "",
    company_name: "",
    trade_license_url: "",
    authorized_person_name: "",
    authorized_person_role: ""
  });

  const accountType = sessionStorage.getItem("registration_account_type") || "individual";
  const userRole = sessionStorage.getItem("registration_user_role") || "advertiser";
  const totalSteps = accountType === "company" ? 4 : 3;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData.profile_complete) {
        redirectToDashboard(userData.user_role);
      }
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("CompleteProfile"));
    } finally {
      setPageLoading(false);
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

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const updateData = {
        phone: formData.phone,
        address: formData.address,
        avatar_url: formData.avatar_url,
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
      
      await base44.entities.AdminNotification.create({
        type: "new_user",
        title: "New User Registration",
        message: `${user?.full_name || "A new user"} has registered and is pending approval`,
        reference_id: user?.email,
        reference_type: "user",
        status: "unread"
      });
      
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

  const canProceed = () => {
    if (step === 1) return formData.avatar_url && formData.phone;
    if (step === 2 && accountType === "company") return formData.company_name;
    if (step === 2 && accountType === "individual") return formData.emirates_id_front_url;
    if (step === 3 && accountType === "company") return formData.emirates_id_front_url;
    if (step === 3 && accountType === "individual") return true;
    if (step === 4) return true;
    return true;
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const FileUploadField = ({ label, field, required = false, preview = false }) => (
    <div className="space-y-2">
      <Label className="text-slate-700">{label} {required && <span className="text-rose-500">*</span>}</Label>
      <div className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
        ${formData[field] ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'}
      `}>
        {uploading[field] ? (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-3">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Uploading your file...</p>
          </div>
        ) : formData[field] ? (
          <div className="flex flex-col items-center py-2">
            {preview && formData[field].match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img src={formData[field]} alt="Preview" className="w-24 h-24 rounded-xl object-cover mb-3 border-2 border-white shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            )}
            <p className="text-sm text-emerald-700 font-semibold">Uploaded successfully!</p>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFormData(prev => ({ ...prev, [field]: "" }));
              }}
              className="text-xs text-slate-500 hover:text-rose-600 mt-2 underline"
            >
              Remove and upload different file
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-violet-100 transition-colors">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-700 font-semibold mb-1">Click to upload</p>
            <p className="text-xs text-slate-400">PDF, JPG, PNG (max 5MB)</p>
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

  // Loading State
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <MonitorPlay className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">BeyondWalls</h2>
          <p className="text-violet-200">Setting up your profile...</p>
          <div className="mt-6 flex justify-center gap-1">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl">BeyondWalls</span>
          </Link>

          <div className="space-y-8">
            <div>
              <p className="text-violet-200 font-medium mb-2">Step {step} of {totalSteps}</p>
              <h1 className="text-4xl font-bold leading-tight">
                {step === 1 && "Tell us about yourself"}
                {step === 2 && accountType === "company" && "Company Details"}
                {step === 2 && accountType === "individual" && "Verify your Identity"}
                {step === 3 && accountType === "company" && "Verify your Identity"}
                {step === 3 && accountType === "individual" && "Almost Done!"}
                {step === 4 && "Almost Done!"}
              </h1>
            </div>

            {/* Step Indicators */}
            <div className="space-y-4">
              {[...Array(totalSteps)].map((_, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all ${step > i + 1 ? "opacity-60" : step === i + 1 ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step > i + 1 ? "bg-white/20 border-white/40" : step === i + 1 ? "bg-white text-violet-600 border-white" : "border-white/40"
                  }`}>
                    {step > i + 1 ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {i === 0 && "Personal Info"}
                      {i === 1 && accountType === "company" && "Company Info"}
                      {i === 1 && accountType === "individual" && "ID Verification"}
                      {i === 2 && accountType === "company" && "ID Verification"}
                      {i === 2 && accountType === "individual" && "Review & Submit"}
                      {i === 3 && "Review & Submit"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-3 pt-6 border-t border-white/20">
              <div className="flex items-center gap-3 text-white/90">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Your data is secure with us</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Rocket className="w-5 h-5" />
                <span className="text-sm">Quick approval within 2-4 hours</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">Start advertising immediately after</span>
              </div>
            </div>
          </div>

          <p className="text-violet-300 text-sm">
            Need help? Contact us at support@beyondwalls.ae
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-7/12 flex flex-col bg-gradient-to-br from-slate-50 to-white">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 bg-gradient-to-r from-violet-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">BeyondWalls</span>
            </Link>
            <span className="text-white/80 text-sm">Step {step}/{totalSteps}</span>
          </div>
          {/* Mobile Progress Bar */}
          <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-lg">
            {/* Welcome Message */}
            {user && (
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                  Welcome, {user.full_name?.split(" ")[0] || "there"}! 👋
                </h2>
                <p className="text-slate-500">
                  {step === 1 && "Let's get your profile set up in just a few steps."}
                  {step === 2 && accountType === "company" && "Tell us about your company."}
                  {step === 2 && accountType === "individual" && "We need to verify your identity."}
                  {step === 3 && accountType === "company" && "Upload your Emirates ID for verification."}
                  {step === 3 && accountType === "individual" && "Review your information and submit."}
                  {step === 4 && "Review your information and submit."}
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6 lg:p-8">
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                      <div className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center space-y-4">
                          <Label className="text-center text-slate-700">
                            Profile Picture <span className="text-rose-500">*</span>
                          </Label>
                          <div className="relative">
                            {formData.avatar_url ? (
                              <div className="relative group">
                                <img 
                                  src={formData.avatar_url} 
                                  alt="Profile" 
                                  className="w-32 h-32 rounded-full object-cover border-4 border-violet-200 shadow-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, avatar_url: "" }))}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-rose-600 shadow-lg transition-transform hover:scale-110"
                                >
                                  ×
                                </button>
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <label className="cursor-pointer block">
                                <div className={`w-32 h-32 rounded-full border-3 border-dashed flex flex-col items-center justify-center transition-all ${
                                  uploading.avatar_url 
                                    ? "border-violet-400 bg-violet-50" 
                                    : "border-slate-300 hover:border-violet-400 bg-slate-50 hover:bg-violet-50"
                                }`}>
                                  {uploading.avatar_url ? (
                                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                                  ) : (
                                    <>
                                      <Camera className="w-10 h-10 text-slate-400 mb-2" />
                                      <span className="text-xs text-slate-500 font-medium">Add Photo</span>
                                    </>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, "avatar_url")}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700">
                              <Phone className="w-4 h-4 text-violet-600" />
                              Mobile Number <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                              id="phone"
                              placeholder="+971 50 XXX XXXX"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="h-12 text-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center gap-2 text-slate-700">
                              <MapPin className="w-4 h-4 text-violet-600" />
                              Address
                            </Label>
                            <Input
                              id="address"
                              placeholder="Building, Street, City"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="h-12"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2 for Company: Company Details */}
                    {step === 2 && accountType === "company" && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-violet-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">Company Information</h3>
                            <p className="text-sm text-slate-500">Tell us about your business</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name <span className="text-rose-500">*</span></Label>
                            <Input
                              id="company_name"
                              placeholder="Your Company LLC"
                              value={formData.company_name}
                              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                              className="h-12 text-lg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="authorized_person_name">Authorized Person</Label>
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
                                placeholder="e.g., CEO"
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
                      </div>
                    )}

                    {/* Step 2 for Individual OR Step 3 for Company: Emirates ID */}
                    {((step === 2 && accountType === "individual") || (step === 3 && accountType === "company")) && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-violet-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">Identity Verification</h3>
                            <p className="text-sm text-slate-500">Upload your Emirates ID</p>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <FileUploadField 
                            label="Emirates ID (Front)" 
                            field="emirates_id_front_url" 
                            required
                            preview
                          />
                          <FileUploadField 
                            label="Emirates ID (Back)" 
                            field="emirates_id_back_url"
                            preview
                          />
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-sm text-blue-800">
                            <Shield className="w-4 h-4 inline mr-2" />
                            Your documents are encrypted and stored securely. We only use them for verification purposes.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Final Step: Review */}
                    {((step === 3 && accountType === "individual") || step === 4) && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">Ready to Launch!</h3>
                            <p className="text-sm text-slate-500">Review your information</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            {formData.avatar_url && (
                              <img src={formData.avatar_url} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{user?.full_name}</p>
                              <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-slate-500">Phone:</span>
                              <span className="ml-2 text-slate-900">{formData.phone || "—"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Type:</span>
                              <span className="ml-2 text-slate-900 capitalize">{accountType}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Role:</span>
                              <span className="ml-2 text-slate-900 capitalize">{userRole.replace("_", " ")}</span>
                            </div>
                            {accountType === "company" && (
                              <div>
                                <span className="text-slate-500">Company:</span>
                                <span className="ml-2 text-slate-900">{formData.company_name || "—"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                          <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800">What happens next?</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Our team will review your application within 2-4 hours. You'll receive an email once approved!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8">
                      {step > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="flex-1 h-12"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceed() || loading}
                        className={`flex-1 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 ${step === 1 && "w-full"}`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : step === totalSteps ? (
                          <>
                            Submit Application
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}