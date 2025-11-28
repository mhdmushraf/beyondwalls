import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Mail,
  Send,
  Loader2,
  Sparkles,
  Eye,
  Users,
  Newspaper,
  Power,
  PowerOff,
  Wand2,
  Gift,
  Star,
  UserMinus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Search,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";

const DAILY_TOPICS = [
  { topic: "Digital Advertising Trends", icon: "📈", color: "#7c3aed" },
  { topic: "Maximize Your ROI", icon: "💰", color: "#059669" },
  { topic: "Screen Advertising Tips", icon: "📺", color: "#2563eb" },
  { topic: "Success Stories", icon: "⭐", color: "#d97706" },
  { topic: "Industry Insights", icon: "🔍", color: "#dc2626" },
  { topic: "Marketing Monday", icon: "🚀", color: "#7c3aed" },
  { topic: "Tech Tuesday Tips", icon: "💡", color: "#0891b2" }
];

const generateNewsletterHTML = (topic, blogPost, subscriberName = "Valued Customer", featuredOffer = null, newFeature = null, unsubscribeToken = "") => {
  const dayOfWeek = new Date().getDay();
  const topicData = DAILY_TOPICS[dayOfWeek % DAILY_TOPICS.length];
  
  const featuredOfferHTML = featuredOffer ? `
    <!-- Featured Offer -->
    <div style="padding: 0 30px 30px;">
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 25px; text-align: center; border: 2px solid #f59e0b;">
        <span style="font-size: 32px;">🎁</span>
        <h3 style="color: #92400e; font-size: 20px; margin: 10px 0;">${featuredOffer.title}</h3>
        <p style="color: #a16207; font-size: 15px; margin: 0 0 15px 0;">${featuredOffer.description}</p>
        ${featuredOffer.code ? `
        <div style="background: white; border-radius: 8px; padding: 12px 20px; display: inline-block; margin-bottom: 15px;">
          <span style="font-size: 18px; font-weight: bold; color: #92400e; letter-spacing: 2px;">${featuredOffer.code}</span>
        </div>
        ` : ''}
        <br>
        <a href="${featuredOffer.link || 'https://beyondwalls.ae'}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Claim Offer →
        </a>
      </div>
    </div>
  ` : '';

  const newFeatureHTML = newFeature ? `
    <!-- New Feature -->
    <div style="padding: 0 30px 30px;">
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 16px; padding: 25px; border: 2px solid #3b82f6;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
          <span style="font-size: 24px;">✨</span>
          <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">NEW FEATURE</span>
        </div>
        <h3 style="color: #1e40af; font-size: 20px; margin: 0 0 10px 0;">${newFeature.title}</h3>
        <p style="color: #1e3a8a; font-size: 15px; margin: 0 0 15px 0; line-height: 1.5;">${newFeature.description}</p>
        <a href="${newFeature.link || 'https://beyondwalls.ae'}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Try It Now →
        </a>
      </div>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BeyondWalls Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
      <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px 20px; border-radius: 12px; margin-bottom: 20px;">
        <span style="font-size: 24px; color: white; font-weight: bold;">📺 BeyondWalls</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        ${topicData.icon} ${topicData.topic}
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 16px;">
        ${format(new Date(), "EEEE, MMMM d, yyyy")}
      </p>
    </div>

    <!-- Greeting -->
    <div style="padding: 30px;">
      <p style="font-size: 18px; color: #1e293b; margin: 0 0 20px 0;">
        Hello <strong>${subscriberName}</strong>,
      </p>
      <p style="font-size: 16px; color: #475569; line-height: 1.6; margin: 0 0 25px 0;">
        Welcome to your daily dose of digital advertising insights! Here's what's happening in the world of DOOH advertising.
      </p>
    </div>

    ${featuredOfferHTML}
    ${newFeatureHTML}

    ${blogPost ? `
    <!-- Featured Blog -->
    <div style="padding: 0 30px 30px;">
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        ${blogPost.cover_image ? `
        <img src="${blogPost.cover_image}" alt="${blogPost.title}" style="width: 100%; height: 200px; object-fit: cover;">
        ` : ''}
        <div style="padding: 25px;">
          <span style="background: ${topicData.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            📰 FEATURED ARTICLE
          </span>
          <h2 style="color: #1e293b; font-size: 22px; margin: 15px 0 10px 0; line-height: 1.3;">
            ${blogPost.title}
          </h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            ${blogPost.excerpt || blogPost.content?.substring(0, 150) + '...'}
          </p>
          <a href="https://beyondwalls.ae/blog/${blogPost.slug}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Read Full Article →
          </a>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Quick Tips -->
    <div style="padding: 0 30px 30px;">
      <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 20px 0;">
        💡 Today's Quick Tips
      </h3>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 12px 12px 0; margin-bottom: 15px;">
        <p style="color: #92400e; font-size: 15px; margin: 0; line-height: 1.5;">
          <strong>Tip #1:</strong> Target screens near your business for maximum local impact. Customers are 3x more likely to visit if they see your ad nearby!
        </p>
      </div>
      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 12px 12px 0; margin-bottom: 15px;">
        <p style="color: #1e40af; font-size: 15px; margin: 0; line-height: 1.5;">
          <strong>Tip #2:</strong> Use video content when possible - it captures 5x more attention than static images on digital screens.
        </p>
      </div>
      <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 20px; border-radius: 0 12px 12px 0;">
        <p style="color: #166534; font-size: 15px; margin: 0; line-height: 1.5;">
          <strong>Tip #3:</strong> Peak advertising hours in UAE are 11AM-2PM and 6PM-9PM. Schedule your campaigns accordingly!
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div style="padding: 0 30px 30px;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; padding: 30px; text-align: center;">
        <h3 style="color: white; font-size: 18px; margin: 0 0 25px 0;">
          🎯 BeyondWalls Network Stats
        </h3>
        <div style="display: flex; justify-content: space-around;">
          <div style="flex: 1;">
            <p style="color: #7c3aed; font-size: 32px; font-weight: bold; margin: 0;">500+</p>
            <p style="color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;">Active Screens</p>
          </div>
          <div style="flex: 1;">
            <p style="color: #22c55e; font-size: 32px; font-weight: bold; margin: 0;">1M+</p>
            <p style="color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;">Daily Views</p>
          </div>
          <div style="flex: 1;">
            <p style="color: #f59e0b; font-size: 32px; font-weight: bold; margin: 0;">200+</p>
            <p style="color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;">Premium Venues</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div style="padding: 0 30px 40px; text-align: center;">
      <h3 style="color: #1e293b; font-size: 20px; margin: 0 0 15px 0;">
        Ready to grow your business?
      </h3>
      <p style="color: #64748b; font-size: 15px; margin: 0 0 20px 0;">
        Start advertising on premium screens across the UAE today!
      </p>
      <a href="https://beyondwalls.ae" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
        Launch Your Campaign 🚀
      </a>
    </div>

    <!-- Footer -->
    <div style="background: #1e293b; padding: 30px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <a href="https://twitter.com/BeyondWallsae" style="display: inline-block; margin: 0 8px; color: #94a3b8; text-decoration: none;">Twitter</a>
        <a href="https://instagram.com/beyondwallsae" style="display: inline-block; margin: 0 8px; color: #94a3b8; text-decoration: none;">Instagram</a>
        <a href="https://linkedin.com/company/beyondwallsae" style="display: inline-block; margin: 0 8px; color: #94a3b8; text-decoration: none;">LinkedIn</a>
      </div>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 10px 0;">
        BeyondWalls - UAE's #1 Digital Advertising Platform
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 10px 0;">
        📍 in5 Tech, Dubai Internet City, UAE
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0 0 15px 0;">
        📧 hello@beyondwalls.ae | 📞 +971 55 614 0067
      </p>
      <p style="color: #475569; font-size: 12px; margin: 0;">
        <a href="https://beyondwalls.ae/unsubscribe?token=${unsubscribeToken}" style="color: #94a3b8;">Unsubscribe</a> | 
        <a href="https://beyondwalls.ae/privacy" style="color: #94a3b8;">Privacy Policy</a>
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

export default function NewsletterManager() {
  const queryClient = useQueryClient();
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState("");
  const [generatingContent, setGeneratingContent] = useState(false);
  const [aiContent, setAiContent] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  
  // Dynamic sections
  const [includeFeaturedOffer, setIncludeFeaturedOffer] = useState(false);
  const [includeNewFeature, setIncludeNewFeature] = useState(false);
  const [featuredOffer, setFeaturedOffer] = useState({
    title: "Limited Time Offer!",
    description: "Get 20% off your first campaign",
    code: "WELCOME20",
    link: "https://beyondwalls.ae"
  });
  const [newFeature, setNewFeature] = useState({
    title: "AI Campaign Builder",
    description: "Let our AI create the perfect campaign for you in seconds",
    link: "https://beyondwalls.ae/ai-campaign"
  });

  const { data: settings = null, refetch: refetchSettings } = useQuery({
    queryKey: ["newsletter-settings"],
    queryFn: async () => {
      const list = await base44.entities.NewsletterSettings.list();
      return list[0] || null;
    }
  });

  const { data: subscribers = [], refetch: refetchSubscribers } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: () => base44.entities.NewsletterSubscriber.list("-created_date")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users-newsletter"],
    queryFn: () => base44.entities.User.list()
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["latest-blogs"],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published" }, "-published_at", 5)
  });

  const activeSubscribers = [
    ...subscribers.filter(s => s.status === "active"),
    ...users.filter(u => u.user_role !== "admin")
  ];
  const unsubscribedCount = subscribers.filter(s => s.status === "unsubscribed").length;
  const latestBlog = blogPosts[0];

  const toggleAutoNewsletter = async () => {
    const newValue = !settings?.auto_newsletter_enabled;
    if (settings) {
      await base44.entities.NewsletterSettings.update(settings.id, {
        auto_newsletter_enabled: newValue
      });
    } else {
      await base44.entities.NewsletterSettings.create({
        auto_newsletter_enabled: newValue
      });
    }
    refetchSettings();
    toast.success(newValue ? "Auto newsletter enabled" : "Auto newsletter disabled");
  };

  const generateAIContent = async () => {
    setGeneratingContent(true);
    try {
      const recentBlogs = blogPosts.slice(0, 3).map(b => b.title).join(", ");
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a marketing expert for BeyondWalls, a DOOH (Digital Out-of-Home) advertising platform in UAE.

Generate newsletter content ideas based on:
- Recent blog topics: ${recentBlogs || "Digital advertising trends"}
- Industry: Digital advertising, screen advertising, marketing technology
- Target audience: Business owners, marketers in UAE

Provide:
1. 3 blog post ideas with titles and brief descriptions (2 sentences each)
2. 3 newsletter topic suggestions for upcoming days
3. 1 featured offer idea
4. 1 new feature highlight idea

Make content engaging, actionable, and UAE-focused.`,
        response_json_schema: {
          type: "object",
          properties: {
            blog_ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            newsletter_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            featured_offer: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                code: { type: "string" }
              }
            },
            new_feature: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      });

      setAiContent(response);
      setShowAIGenerator(true);
      toast.success("AI content generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI content");
    }
    setGeneratingContent(false);
  };

  const applyAIContent = (type, content) => {
    if (type === "offer") {
      setFeaturedOffer({
        title: content.title,
        description: content.description,
        code: content.code || "",
        link: "https://beyondwalls.ae"
      });
      setIncludeFeaturedOffer(true);
    } else if (type === "feature") {
      setNewFeature({
        title: content.title,
        description: content.description,
        link: "https://beyondwalls.ae"
      });
      setIncludeNewFeature(true);
    }
    toast.success("Applied to newsletter");
  };

  const previewNewsletter = () => {
    const html = generateNewsletterHTML(
      "Daily Digest", 
      latestBlog, 
      "Preview User",
      includeFeaturedOffer ? featuredOffer : null,
      includeNewFeature ? newFeature : null,
      "preview-token"
    );
    setPreviewHTML(html);
    setShowPreview(true);
  };

  const handleUnsubscribe = async (subscriberId) => {
    try {
      await base44.entities.NewsletterSubscriber.update(subscriberId, {
        status: "unsubscribed"
      });
      refetchSubscribers();
      toast.success("Subscriber unsubscribed");
    } catch (e) {
      toast.error("Failed to unsubscribe");
    }
  };

  const handleResubscribe = async (subscriberId) => {
    try {
      await base44.entities.NewsletterSubscriber.update(subscriberId, {
        status: "active"
      });
      refetchSubscribers();
      toast.success("Subscriber resubscribed");
    } catch (e) {
      toast.error("Failed to resubscribe");
    }
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      await base44.entities.NewsletterSubscriber.delete(subscriberId);
      refetchSubscribers();
      toast.success("Subscriber deleted");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const sendNewsletter = async () => {
    if (activeSubscribers.length === 0) {
      toast.error("No subscribers to send to");
      return;
    }

    setSending(true);
    let sent = 0;
    let failed = 0;

    for (const subscriber of activeSubscribers) {
      const email = subscriber.email;
      const name = subscriber.full_name || subscriber.name || "Valued Customer";
      const unsubToken = btoa(email + "-" + Date.now());
      
      try {
        const html = generateNewsletterHTML(
          "Daily Digest", 
          latestBlog, 
          name,
          includeFeaturedOffer ? featuredOffer : null,
          includeNewFeature ? newFeature : null,
          unsubToken
        );
        const dayOfWeek = new Date().getDay();
        const topicData = DAILY_TOPICS[dayOfWeek % DAILY_TOPICS.length];
        
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `${topicData.icon} ${topicData.topic} | BeyondWalls Newsletter - ${format(new Date(), "MMM d")}`,
          body: html
        });
        sent++;
      } catch (e) {
        failed++;
        console.error("Failed to send to", email, e);
      }
    }

    // Update last sent date
    if (settings) {
      await base44.entities.NewsletterSettings.update(settings.id, {
        last_sent_date: format(new Date(), "yyyy-MM-dd")
      });
    } else {
      await base44.entities.NewsletterSettings.create({
        auto_newsletter_enabled: true,
        last_sent_date: format(new Date(), "yyyy-MM-dd")
      });
    }

    refetchSettings();
    setSending(false);
    toast.success(`Newsletter sent to ${sent} subscribers${failed > 0 ? `, ${failed} failed` : ''}`);
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email?.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
    s.name?.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-violet-600" />
            Newsletter Manager
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubscribers(true)}
            >
              <Users className="w-4 h-4 mr-1" />
              Subscribers
            </Button>
            <div className="flex items-center gap-2">
              {settings?.auto_newsletter_enabled ? (
                <Power className="w-4 h-4 text-emerald-600" />
              ) : (
                <PowerOff className="w-4 h-4 text-slate-400" />
              )}
              <Switch
                checked={settings?.auto_newsletter_enabled || false}
                onCheckedChange={toggleAutoNewsletter}
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              settings?.auto_newsletter_enabled ? "bg-emerald-100" : "bg-slate-200"
            }`}>
              <Mail className={`w-5 h-5 ${settings?.auto_newsletter_enabled ? "text-emerald-600" : "text-slate-400"}`} />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {settings?.auto_newsletter_enabled ? "Auto-send Enabled" : "Auto-send Disabled"}
              </p>
              <p className="text-sm text-slate-500">
                {settings?.last_sent_date 
                  ? `Last sent: ${format(new Date(settings.last_sent_date), "MMM d, yyyy")}`
                  : "Never sent"
                }
              </p>
            </div>
          </div>
          <Badge variant={settings?.auto_newsletter_enabled ? "default" : "secondary"}>
            {settings?.frequency || "Daily"}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-violet-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-violet-600">{activeSubscribers.length}</p>
            <p className="text-xs text-violet-600">Active</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-rose-600">{unsubscribedCount}</p>
            <p className="text-xs text-rose-600">Unsubscribed</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{blogPosts.length}</p>
            <p className="text-xs text-blue-600">Blog Posts</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {DAILY_TOPICS[new Date().getDay() % DAILY_TOPICS.length].icon}
            </p>
            <p className="text-xs text-emerald-600">Today</p>
          </div>
        </div>

        {/* AI Content Generator */}
        <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">AI Content Generator</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={generateAIContent}
              disabled={generatingContent}
              className="border-violet-300 text-violet-700"
            >
              {generatingContent ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Generate Ideas
            </Button>
          </div>
          <p className="text-xs text-violet-600">
            Generate blog post ideas, newsletter topics, and promotional content using AI
          </p>
        </div>

        {/* Dynamic Sections */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Include in Newsletter:</Label>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-600" />
              <span className="text-sm">Featured Offer</span>
            </div>
            <Switch
              checked={includeFeaturedOffer}
              onCheckedChange={setIncludeFeaturedOffer}
            />
          </div>
          
          {includeFeaturedOffer && (
            <div className="ml-6 p-3 bg-amber-50 rounded-lg space-y-2">
              <Input
                placeholder="Offer title"
                value={featuredOffer.title}
                onChange={(e) => setFeaturedOffer({...featuredOffer, title: e.target.value})}
                className="bg-white"
              />
              <Input
                placeholder="Description"
                value={featuredOffer.description}
                onChange={(e) => setFeaturedOffer({...featuredOffer, description: e.target.value})}
                className="bg-white"
              />
              <Input
                placeholder="Promo code (optional)"
                value={featuredOffer.code}
                onChange={(e) => setFeaturedOffer({...featuredOffer, code: e.target.value})}
                className="bg-white"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm">New Feature Highlight</span>
            </div>
            <Switch
              checked={includeNewFeature}
              onCheckedChange={setIncludeNewFeature}
            />
          </div>

          {includeNewFeature && (
            <div className="ml-6 p-3 bg-blue-50 rounded-lg space-y-2">
              <Input
                placeholder="Feature title"
                value={newFeature.title}
                onChange={(e) => setNewFeature({...newFeature, title: e.target.value})}
                className="bg-white"
              />
              <Input
                placeholder="Description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                className="bg-white"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={previewNewsletter}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600"
            onClick={sendNewsletter}
            disabled={sending}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Now
          </Button>
        </div>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-600" />
              Newsletter Preview
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              srcDoc={previewHTML}
              className="w-full h-[600px]"
              title="Newsletter Preview"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-violet-600" />
              AI Generated Content Ideas
            </DialogTitle>
          </DialogHeader>
          
          {aiContent && (
            <Tabs defaultValue="blogs" className="mt-4">
              <TabsList className="w-full">
                <TabsTrigger value="blogs" className="flex-1">Blog Ideas</TabsTrigger>
                <TabsTrigger value="topics" className="flex-1">Newsletter Topics</TabsTrigger>
                <TabsTrigger value="promo" className="flex-1">Promotions</TabsTrigger>
              </TabsList>

              <TabsContent value="blogs" className="space-y-3 mt-4">
                {aiContent.blog_ideas?.map((idea, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-slate-900">{idea.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{idea.description}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="topics" className="space-y-3 mt-4">
                {aiContent.newsletter_topics?.map((topic, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-slate-900">{topic.topic}</h4>
                    <p className="text-sm text-slate-600 mt-1">{topic.description}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="promo" className="space-y-4 mt-4">
                {aiContent.featured_offer && (
                  <div className="p-4 border rounded-lg bg-amber-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-amber-800">Featured Offer</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyAIContent("offer", aiContent.featured_offer)}
                      >
                        Apply
                      </Button>
                    </div>
                    <h4 className="font-semibold text-slate-900">{aiContent.featured_offer.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{aiContent.featured_offer.description}</p>
                    {aiContent.featured_offer.code && (
                      <Badge className="mt-2">{aiContent.featured_offer.code}</Badge>
                    )}
                  </div>
                )}

                {aiContent.new_feature && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-800">New Feature</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyAIContent("feature", aiContent.new_feature)}
                      >
                        Apply
                      </Button>
                    </div>
                    <h4 className="font-semibold text-slate-900">{aiContent.new_feature.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{aiContent.new_feature.description}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscribers Management Dialog */}
      <Dialog open={showSubscribers} onOpenChange={setShowSubscribers}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Subscriber Management
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search subscribers..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 text-sm">
              <Badge variant="outline">{subscribers.filter(s => s.status === "active").length} Active</Badge>
              <Badge variant="outline" className="bg-rose-50">{unsubscribedCount} Unsubscribed</Badge>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredSubscribers.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No subscribers found</p>
              ) : (
                filteredSubscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        sub.status === "active" ? "bg-emerald-100" : "bg-slate-100"
                      }`}>
                        <Mail className={`w-4 h-4 ${sub.status === "active" ? "text-emerald-600" : "text-slate-400"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sub.email}</p>
                        <p className="text-xs text-slate-500">
                          {sub.name || "No name"} • {sub.source || "website"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={sub.status === "active" ? "default" : "secondary"} className="text-xs">
                        {sub.status}
                      </Badge>
                      {sub.status === "active" ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleUnsubscribe(sub.id)}
                          className="h-8 w-8 text-rose-600"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleResubscribe(sub.id)}
                          className="h-8 w-8 text-emerald-600"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}