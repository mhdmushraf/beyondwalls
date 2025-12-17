import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Building2,
  Megaphone,
  Calendar,
  MessageSquare,
  Star,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Target,
  Loader2,
  ChevronDown,
  MoreVertical,
  Send,
  Newspaper,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import NewsletterManager from "@/components/crm/NewsletterManager";
import LeadPipeline from "@/components/crm/LeadPipeline";
import LeadScoreCard from "@/components/crm/LeadScoreCard";

export default function AdminCRM() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [saving, setSaving] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    lead_type: "advertiser",
    status: "new",
    source: "website",
    notes: "",
    priority: "medium",
    expected_value: "",
    next_followup_date: ""
  });
  const [createUserForm, setCreateUserForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    user_role: "advertiser",
    temp_password: ""
  });
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    type: "newsletter"
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");
  const [viewMode, setViewMode] = useState("table"); // "table" or "pipeline"

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

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: () => base44.entities.Lead.list("-created_date")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["crm-users"],
    queryFn: () => base44.entities.User.list("-created_date")
  });

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      toast.error("Subject and message are required");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setSendingEmail(true);
    try {
      for (const userEmail of selectedUsers) {
        const recipient = users.find(u => u.email === userEmail);
        await base44.integrations.Core.SendEmail({
          to: userEmail,
          subject: emailForm.subject,
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Digital Advertising Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${recipient?.full_name || "Valued Customer"},

${emailForm.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae

To unsubscribe, reply with "UNSUBSCRIBE"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });

        // Update last email sent
        await base44.entities.User.update(recipient.id, {
          last_email_sent: new Date().toISOString()
        });
      }

      toast.success(`Email sent to ${selectedUsers.length} recipients`);
      setShowEmailDialog(false);
      setSelectedUsers([]);
      setEmailForm({ subject: "", message: "", type: "newsletter" });
      queryClient.invalidateQueries({ queryKey: ["crm-users"] });
    } catch (error) {
      toast.error("Failed to send some emails");
    }
    setSendingEmail(false);
  };

  const toggleUserSelection = (email) => {
    setSelectedUsers(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const selectAllUsers = (userList) => {
    const emails = userList.map(u => u.email);
    setSelectedUsers(emails);
  };

  const newsletterTemplates = [
    {
      name: "New Features",
      subject: "🚀 Exciting New Features on BeyondWalls!",
      message: "We're excited to announce new features that will help you get more out of your advertising campaigns!\n\n✨ AI-Powered Campaign Creation\n📊 Enhanced Analytics Dashboard\n🎯 Better Targeting Options\n\nLog in now to explore these features and boost your advertising performance."
    },
    {
      name: "Special Offer",
      subject: "💰 Exclusive Offer: Get 20% Extra on Your Next Top-up!",
      message: "For a limited time, we're offering 20% bonus credit on all wallet top-ups!\n\nTop up AED 1,000 → Get AED 1,200\nTop up AED 5,000 → Get AED 6,000\nTop up AED 10,000 → Get AED 12,000\n\nThis offer expires soon. Don't miss out!"
    },
    {
      name: "Join Invitation",
      subject: "📺 Start Advertising on Premium Screens Across UAE!",
      message: "You're invited to join BeyondWalls - the UAE's leading self-serve DOOH advertising platform!\n\n🏢 500+ Premium Screens\n📍 50+ Premium Venues\n💰 Flexible Pricing\n📊 Real-time Analytics\n\nCreate your free account today and start reaching thousands of customers!"
    }
  ];

  const applyTemplate = (template) => {
    setEmailForm({
      ...emailForm,
      subject: template.subject,
      message: template.message
    });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(search.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(search.toLowerCase()) ||
                         lead.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesType = typeFilter === "all" || lead.lead_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    qualified: leads.filter(l => l.status === "qualified").length,
    converted: leads.filter(l => l.status === "converted").length,
    advertisers: leads.filter(l => l.lead_type === "advertiser").length,
    venueOwners: leads.filter(l => l.lead_type === "venue_owner").length
  };

  const handleSaveLead = async () => {
    if (!leadForm.name || !leadForm.email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      if (editingLead) {
        await base44.entities.Lead.update(editingLead.id, leadForm);
        toast.success("Lead updated successfully");
      } else {
        await base44.entities.Lead.create({
          ...leadForm,
          assigned_to: user?.email
        });
        toast.success("Lead created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      setShowLeadDialog(false);
      resetLeadForm();
    } catch (error) {
      toast.error("Failed to save lead");
    }
    setSaving(false);
  };

  const handleDeleteLead = async (lead) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await base44.entities.Lead.delete(lead.id);
      toast.success("Lead deleted");
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleUpdateStatus = async (lead, newStatus) => {
    try {
      await base44.entities.Lead.update(lead.id, { 
        status: newStatus,
        last_contact_date: new Date().toISOString()
      });
      toast.success(`Status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCreateUser = async () => {
    if (!createUserForm.full_name || !createUserForm.email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      // Send invitation email with credentials
      await base44.integrations.Core.SendEmail({
        to: createUserForm.email,
        subject: "Welcome to BeyondWalls - Your Account Has Been Created",
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Digital Advertising Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${createUserForm.full_name},

Your BeyondWalls account has been created by our team!

📧 ACCOUNT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${createUserForm.email}
Role: ${createUserForm.user_role === "venue_owner" ? "Venue Owner" : "Advertiser"}
${createUserForm.company_name ? `Company: ${createUserForm.company_name}` : ""}

🚀 GETTING STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit our platform and click "Sign In"
2. Use your email to log in
3. Complete your profile setup

${createUserForm.user_role === "advertiser" 
  ? "As an advertiser, you can book ad slots on premium screens across the UAE."
  : "As a venue owner, you can register your screens and start earning revenue."}

Need help? Contact us at support@beyondwalls.ae

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
      });

      // If there's a selected lead, mark it as converted
      if (selectedLead) {
        await base44.entities.Lead.update(selectedLead.id, {
          status: "converted",
          converted_user_id: createUserForm.email
        });
      }

      toast.success("User invitation sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      setShowCreateUserDialog(false);
      setSelectedLead(null);
      setCreateUserForm({
        full_name: "",
        email: "",
        phone: "",
        company_name: "",
        user_role: "advertiser",
        temp_password: ""
      });
    } catch (error) {
      toast.error("Failed to create user");
    }
    setSaving(false);
  };

  const openCreateUser = (lead = null) => {
    if (lead) {
      setSelectedLead(lead);
      setCreateUserForm({
        full_name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company_name: lead.company_name || "",
        user_role: lead.lead_type,
        temp_password: ""
      });
    }
    setShowCreateUserDialog(true);
  };

  const openEditLead = (lead) => {
    setEditingLead(lead);
    setLeadForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company_name: lead.company_name || "",
      lead_type: lead.lead_type || "advertiser",
      status: lead.status || "new",
      source: lead.source || "website",
      notes: lead.notes || "",
      priority: lead.priority || "medium",
      expected_value: lead.expected_value || "",
      next_followup_date: lead.next_followup_date || ""
    });
    setShowLeadDialog(true);
  };

  const resetLeadForm = () => {
    setEditingLead(null);
    setLeadForm({
      name: "",
      email: "",
      phone: "",
      company_name: "",
      lead_type: "advertiser",
      status: "new",
      source: "website",
      notes: "",
      priority: "medium",
      expected_value: "",
      next_followup_date: ""
    });
  };

  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-violet-100 text-violet-700",
    qualified: "bg-amber-100 text-amber-700",
    negotiating: "bg-orange-100 text-orange-700",
    converted: "bg-emerald-100 text-emerald-700",
    lost: "bg-slate-100 text-slate-500"
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-red-100 text-red-700"
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">CRM Dashboard</h1>
          <p className="text-slate-500">Manage leads and create user accounts</p>
        </div>
        <div className="flex gap-3">
          {activeTab === "users" && selectedUsers.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email ({selectedUsers.length})
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => openCreateUser()}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
          <Button 
            className="bg-gradient-to-r from-violet-600 to-indigo-600"
            onClick={() => {
              resetLeadForm();
              setShowLeadDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Users className="w-6 h-6 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Star className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Qualified</p>
                <p className="text-2xl font-bold text-amber-600">{stats.qualified}</p>
              </div>
              <Target className="w-6 h-6 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Converted</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.converted}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Advertisers</p>
                <p className="text-2xl font-bold text-violet-600">{stats.advertisers}</p>
              </div>
              <Megaphone className="w-6 h-6 text-violet-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Venue Owners</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.venueOwners}</p>
              </div>
              <Building2 className="w-6 h-6 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Manager */}
      <div className="mb-6">
        <NewsletterManager />
      </div>

      {/* Tabs for Leads vs Users */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="leads" className="gap-2">
            <Target className="w-4 h-4" />
            Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Existing Users ({users.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "leads" && (
        <>
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "bg-violet-600" : ""}
              >
                Table View
              </Button>
              <Button
                variant={viewMode === "pipeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("pipeline")}
                className={viewMode === "pipeline" ? "bg-violet-600" : ""}
              >
                Pipeline View
              </Button>
            </div>
          </div>

          {viewMode === "pipeline" ? (
            <LeadPipeline leads={filteredLeads} onUpdateStatus={handleUpdateStatus} />
          ) : (
            <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="advertiser">Advertisers</SelectItem>
                <SelectItem value="venue_owner">Venue Owners</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Lead</th>
                  <th className="text-left p-4 font-medium text-slate-600">Contact</th>
                  <th className="text-left p-4 font-medium text-slate-600">Type</th>
                  <th className="text-left p-4 font-medium text-slate-600">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600">Priority</th>
                  <th className="text-left p-4 font-medium text-slate-600">Next Follow-up</th>
                  <th className="text-left p-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={`${
                              lead.lead_type === "venue_owner" 
                                ? "bg-indigo-100 text-indigo-700" 
                                : "bg-violet-100 text-violet-700"
                            }`}>
                              {lead.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{lead.name}</p>
                            {lead.company_name && (
                              <p className="text-sm text-slate-500">{lead.company_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={
                          lead.lead_type === "venue_owner" 
                            ? "border-indigo-200 text-indigo-700" 
                            : "border-violet-200 text-violet-700"
                        }>
                          {lead.lead_type === "venue_owner" ? (
                            <><Building2 className="w-3 h-3 mr-1" /> Venue</>
                          ) : (
                            <><Megaphone className="w-3 h-3 mr-1" /> Advertiser</>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-2">
                              <Badge className={statusColors[lead.status]}>
                                {lead.status}
                              </Badge>
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {["new", "contacted", "qualified", "negotiating", "converted", "lost"].map(status => (
                              <DropdownMenuItem 
                                key={status}
                                onClick={() => handleUpdateStatus(lead, status)}
                              >
                                <Badge className={`${statusColors[status]} mr-2`}>{status}</Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <Badge className={priorityColors[lead.priority]}>
                            {lead.priority}
                          </Badge>
                          <LeadScoreCard lead={lead} />
                        </div>
                      </td>
                      <td className="p-4">
                        {lead.next_followup_date ? (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(lead.next_followup_date), "MMM d, yyyy")}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Not set</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {lead.status !== "converted" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openCreateUser(lead)}
                              className="h-8"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Convert
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditLead(lead)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteLead(lead)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
            </>
          )}
        </>
      )}

      {activeTab === "users" && (
        <>
          {/* User Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => selectAllUsers(users.filter(u => u.user_role !== "admin"))}
            >
              Select All
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSelectedUsers([])}
            >
              Clear Selection
            </Button>
          </div>

          {/* Users List for Email */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 w-12">
                        <input 
                          type="checkbox"
                          checked={selectedUsers.length === users.filter(u => u.user_role !== "admin").length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              selectAllUsers(users.filter(u => u.user_role !== "admin"));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </th>
                      <th className="text-left p-4 font-medium text-slate-600">User</th>
                      <th className="text-left p-4 font-medium text-slate-600">Contact</th>
                      <th className="text-left p-4 font-medium text-slate-600">Role</th>
                      <th className="text-left p-4 font-medium text-slate-600">Last Email</th>
                      <th className="text-left p-4 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.user_role !== "admin").filter(u => 
                      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                      u.email?.toLowerCase().includes(search.toLowerCase())
                    ).map((u) => (
                      <tr key={u.id} className={`border-b hover:bg-slate-50 ${selectedUsers.includes(u.email) ? "bg-violet-50" : ""}`}>
                        <td className="p-4">
                          <input 
                            type="checkbox"
                            checked={selectedUsers.includes(u.email)}
                            onChange={() => toggleUserSelection(u.email)}
                            className="w-4 h-4 rounded border-slate-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-violet-100 text-violet-700">
                                {u.full_name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{u.full_name}</p>
                              {u.company_name && (
                                <p className="text-sm text-slate-500">{u.company_name}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Phone className="w-3 h-3" />
                                {u.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={
                            u.user_role === "venue_owner" 
                              ? "border-indigo-200 text-indigo-700" 
                              : "border-violet-200 text-violet-700"
                          }>
                            {u.user_role === "venue_owner" ? "Venue Owner" : "Advertiser"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {u.last_email_sent ? (
                            <span className="text-sm text-slate-500">
                              {formatDistanceToNow(new Date(u.last_email_sent), { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Never</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUsers([u.email]);
                              setShowEmailDialog(true);
                            }}
                            className="h-8"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add/Edit Lead Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLead ? "Edit Lead" : "Add New Lead"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                  placeholder="+971 50 123 4567"
                />
              </div>
              <div className="col-span-2">
                <Label>Company Name</Label>
                <Input
                  value={leadForm.company_name}
                  onChange={(e) => setLeadForm({...leadForm, company_name: e.target.value})}
                  placeholder="Company LLC"
                />
              </div>
              <div>
                <Label>Lead Type</Label>
                <Select 
                  value={leadForm.lead_type} 
                  onValueChange={(v) => setLeadForm({...leadForm, lead_type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advertiser">Advertiser</SelectItem>
                    <SelectItem value="venue_owner">Venue Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source</Label>
                <Select 
                  value={leadForm.source} 
                  onValueChange={(v) => setLeadForm({...leadForm, source: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={leadForm.status} 
                  onValueChange={(v) => setLeadForm({...leadForm, status: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select 
                  value={leadForm.priority} 
                  onValueChange={(v) => setLeadForm({...leadForm, priority: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Value (AED)</Label>
                <Input
                  type="number"
                  value={leadForm.expected_value}
                  onChange={(e) => setLeadForm({...leadForm, expected_value: e.target.value})}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label>Next Follow-up</Label>
                <Input
                  type="date"
                  value={leadForm.next_followup_date}
                  onChange={(e) => setLeadForm({...leadForm, next_followup_date: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
                  placeholder="Add notes about this lead..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveLead}
              disabled={saving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingLead ? "Update Lead" : "Add Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-violet-600" />
              Send Email to {selectedUsers.length} Recipient{selectedUsers.length > 1 ? "s" : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Templates */}
            <div>
              <Label className="mb-2 block">Quick Templates</Label>
              <div className="flex gap-2 flex-wrap">
                {newsletterTemplates.map((template, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Subject *</Label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                placeholder="Email subject..."
              />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea
                value={emailForm.message}
                onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                placeholder="Write your message..."
                rows={8}
              />
            </div>

            {/* Recipients Preview */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-2">Recipients:</p>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {selectedUsers.slice(0, 10).map(email => (
                  <Badge key={email} variant="secondary" className="text-xs">
                    {email}
                  </Badge>
                ))}
                {selectedUsers.length > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedUsers.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-violet-600" />
              Create User Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={createUserForm.full_name}
                onChange={(e) => setCreateUserForm({...createUserForm, full_name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                placeholder="john@company.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={createUserForm.phone}
                onChange={(e) => setCreateUserForm({...createUserForm, phone: e.target.value})}
                placeholder="+971 50 123 4567"
              />
            </div>
            <div>
              <Label>Company Name</Label>
              <Input
                value={createUserForm.company_name}
                onChange={(e) => setCreateUserForm({...createUserForm, company_name: e.target.value})}
                placeholder="Company LLC"
              />
            </div>
            <div>
              <Label>User Role</Label>
              <Select 
                value={createUserForm.user_role} 
                onValueChange={(v) => setCreateUserForm({...createUserForm, user_role: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advertiser">Advertiser</SelectItem>
                  <SelectItem value="venue_owner">Venue Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">📧 Invitation Email</p>
              <p>An email will be sent to the user with instructions to set up their account and log in.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUserDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={saving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}