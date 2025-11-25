import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft,
  Building2,
  Upload,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const VENUE_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "mall", label: "Shopping Mall" },
  { value: "gym", label: "Fitness Center" },
  { value: "coworking", label: "Coworking Space" },
  { value: "hotel", label: "Hotel" },
  { value: "hospital", label: "Hospital / Clinic" },
  { value: "other", label: "Other" }
];

const CITIES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

export default function AddVenue() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: "",
    city: "",
    area: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    operating_hours: "",
    avg_daily_footfall: "",
    trade_license_url: "",
    image_url: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
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
      await base44.entities.Venue.create({
        ...formData,
        avg_daily_footfall: parseInt(formData.avg_daily_footfall) || 0,
        owner_id: user.email,
        status: "pending"
      });

      toast.success("Venue submitted for approval!");
      navigate(createPageUrl("MyVenues"));
    } catch (error) {
      toast.error("Failed to add venue");
    } finally {
      setLoading(false);
    }
  };

  const FileUploadField = ({ label, field, accept = ".pdf,.jpg,.jpeg,.png" }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
        ${formData[field] ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-violet-300'}
      `}>
        {uploading[field] ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Uploading...</p>
          </div>
        ) : formData[field] ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="text-sm text-emerald-600 font-medium">File uploaded</p>
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
              accept={accept}
              onChange={(e) => handleFileUpload(e, field)}
            />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Add New Venue</h1>
          <p className="text-slate-500">Register your venue to start earning</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-600" />
              Venue Details
            </CardTitle>
            <CardDescription>Basic information about your venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Venue Name *</Label>
                <Input
                  placeholder="e.g., Cafe Deluxe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Venue Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(v) => setFormData({ ...formData, city: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Area / District</Label>
                <Input
                  placeholder="e.g., Downtown"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Operating Hours</Label>
                <Input
                  placeholder="e.g., 9AM - 11PM"
                  value={formData.operating_hours}
                  onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Full Address *</Label>
              <Textarea
                placeholder="Building name, street, area..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Average Daily Footfall</Label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={formData.avg_daily_footfall}
                onChange={(e) => setFormData({ ...formData, avg_daily_footfall: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-violet-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person Name</Label>
                <Input
                  placeholder="Full name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="+971 50 XXX XXXX"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                placeholder="venue@example.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-violet-600" />
              Documents & Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FileUploadField 
                label="Trade License" 
                field="trade_license_url" 
              />
              <FileUploadField 
                label="Venue Photo" 
                field="image_url"
                accept=".jpg,.jpeg,.png"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading || !formData.name || !formData.type || !formData.city || !formData.address}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit for Approval
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}