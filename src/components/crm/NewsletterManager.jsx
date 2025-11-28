import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Mail,
  Send,
  Loader2,
  Settings,
  Sparkles,
  Eye,
  Calendar,
  Users,
  CheckCircle2,
  Image,
  Newspaper,
  Clock,
  Power,
  PowerOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const generateNewsletterHTML = (topic, blogPost, subscriberName = "Valued Customer") => {
  const dayOfWeek = new Date().getDay();
  const topicData = DAILY_TOPICS[dayOfWeek % DAILY_TOPICS.length];
  
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
        <a href="https://beyondwalls.ae/unsubscribe" style="color: #94a3b8;">Unsubscribe</a> | 
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

  const { data: settings = null, refetch: refetchSettings } = useQuery({
    queryKey: ["newsletter-settings"],
    queryFn: async () => {
      const list = await base44.entities.NewsletterSettings.list();
      return list[0] || null;
    }
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: () => base44.entities.NewsletterSubscriber.filter({ status: "active" })
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users-newsletter"],
    queryFn: () => base44.entities.User.list()
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["latest-blogs"],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published" }, "-published_at", 5)
  });

  const activeSubscribers = [...subscribers, ...users.filter(u => u.user_role !== "admin")];
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

  const previewNewsletter = () => {
    const html = generateNewsletterHTML("Daily Digest", latestBlog, "Preview User");
    setPreviewHTML(html);
    setShowPreview(true);
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
      
      try {
        const html = generateNewsletterHTML("Daily Digest", latestBlog, name);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-violet-600" />
            Auto Newsletter
          </div>
          <div className="flex items-center gap-3">
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
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-violet-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-violet-600">{activeSubscribers.length}</p>
            <p className="text-xs text-violet-600">Subscribers</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{blogPosts.length}</p>
            <p className="text-xs text-blue-600">Blog Posts</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {DAILY_TOPICS[new Date().getDay() % DAILY_TOPICS.length].icon}
            </p>
            <p className="text-xs text-emerald-600">Today's Topic</p>
          </div>
        </div>

        {/* Today's Topic */}
        <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Today's Newsletter Topic</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {DAILY_TOPICS[new Date().getDay() % DAILY_TOPICS.length].icon} {DAILY_TOPICS[new Date().getDay() % DAILY_TOPICS.length].topic}
          </p>
          {latestBlog && (
            <p className="text-sm text-slate-600 mt-1">
              Featured: {latestBlog.title}
            </p>
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
    </Card>
  );
}