import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Facebook,
  Linkedin,
  Instagram,
  Calendar,
  Hash,
  Image,
  Loader2,
  Download,
  Share2,
  Megaphone,
  TrendingUp,
  Building2,
  Target,
  Zap
} from "lucide-react";
import { toast } from "sonner";

// X (Twitter) icon component
const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Google icon component
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SocialMediaGenerator() {
  const [topic, setTopic] = useState("");
  const [postType, setPostType] = useState("promotional");
  const [tone, setTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState(null);
  const [copied, setCopied] = useState({});
  const [activeTab, setActiveTab] = useState("facebook");

  const postTypes = [
    { value: "promotional", label: "Promotional", icon: Megaphone },
    { value: "educational", label: "Educational", icon: TrendingUp },
    { value: "venue_owner", label: "For Venue Owners", icon: Building2 },
    { value: "advertiser", label: "For Advertisers", icon: Target },
    { value: "industry_news", label: "Industry News", icon: Zap },
    { value: "tips", label: "Tips & Tricks", icon: Sparkles },
  ];

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly & Casual" },
    { value: "exciting", label: "Exciting & Bold" },
    { value: "informative", label: "Informative" },
    { value: "inspiring", label: "Inspiring" },
  ];

  const platforms = [
    { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600", charLimit: 500 },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-700", charLimit: 700 },
    { id: "twitter", name: "X (Twitter)", icon: XIcon, color: "bg-black", charLimit: 280 },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", charLimit: 2200 },
    { id: "google", name: "Google Business", icon: GoogleIcon, color: "bg-white border border-slate-200", charLimit: 1500 },
  ];

  const generatePosts = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or theme for the posts");
      return;
    }

    setGenerating(true);
    try {
      const prompt = `You are a social media marketing expert for BeyondWalls, UAE's #1 Digital Out-of-Home (DOOH) advertising platform. 
      
BeyondWalls connects advertisers with 500+ digital screens in cafés, malls, gyms, coworking spaces across Dubai, Abu Dhabi, Sharjah and other UAE cities.

Key selling points:
- Self-serve platform - book ads in 30 minutes
- Start from AED 99/week
- 70% revenue share for venue owners
- AI-powered campaign creation
- Real-time analytics
- No long-term contracts

Generate engaging social media posts for all platforms based on:
Topic/Theme: ${topic}
Post Type: ${postType}
Tone: ${tone}

Create unique, platform-optimized content for each:

1. FACEBOOK (max 500 chars): Engaging, can include emojis, call-to-action
2. LINKEDIN (max 700 chars): Professional, business-focused, industry insights
3. X/TWITTER (max 280 chars): Concise, punchy, trending hashtags
4. INSTAGRAM (max 2200 chars): Visual-focused caption, storytelling, many relevant hashtags at end
5. GOOGLE BUSINESS (max 1500 chars): Local SEO focused, professional, location mentions

Include relevant hashtags for each platform. Make content UAE/Dubai specific where appropriate.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            facebook: {
              type: "object",
              properties: {
                content: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                imageIdea: { type: "string" }
              }
            },
            linkedin: {
              type: "object",
              properties: {
                content: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                imageIdea: { type: "string" }
              }
            },
            twitter: {
              type: "object",
              properties: {
                content: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } }
              }
            },
            instagram: {
              type: "object",
              properties: {
                content: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                imageIdea: { type: "string" }
              }
            },
            google: {
              type: "object",
              properties: {
                content: { type: "string" },
                callToAction: { type: "string" }
              }
            }
          }
        }
      });

      setPosts(result);
      toast.success("Posts generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate posts. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (platform, content, hashtags = []) => {
    const fullContent = hashtags?.length 
      ? `${content}\n\n${hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}`
      : content;
    
    await navigator.clipboard.writeText(fullContent);
    setCopied({ ...copied, [platform]: true });
    toast.success(`${platform} post copied!`);
    setTimeout(() => setCopied({ ...copied, [platform]: false }), 2000);
  };

  const regenerateForPlatform = async (platform) => {
    // For simplicity, regenerate all - in production, could regenerate single platform
    await generatePosts();
  };

  const renderPostCard = (platform, data) => {
    if (!data) return null;
    
    const platformInfo = platforms.find(p => p.id === platform);
    const Icon = platformInfo?.icon;
    const content = data.content || "";
    const hashtags = data.hashtags || [];
    const charCount = content.length;
    const charLimit = platformInfo?.charLimit || 500;

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platformInfo?.color}`}>
                <Icon className={`w-5 h-5 ${platform === 'google' ? '' : 'text-white'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{platformInfo?.name}</CardTitle>
                <p className={`text-xs ${charCount > charLimit ? 'text-red-500' : 'text-slate-500'}`}>
                  {charCount} / {charLimit} characters
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(platform, content, hashtags)}
              >
                {copied[platform] ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 min-h-[150px]">
            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </p>
          </div>
          
          {hashtags?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.imageIdea && (
            <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
              <div className="flex items-center gap-2 mb-1">
                <Image className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-medium text-violet-700">Image Suggestion</span>
              </div>
              <p className="text-xs text-violet-600">{data.imageIdea}</p>
            </div>
          )}

          {data.callToAction && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Call to Action</span>
              </div>
              <p className="text-xs text-blue-600">{data.callToAction}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Social Media Post Generator</h1>
              <p className="text-slate-500">Create engaging content for all platforms</p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Generate Posts
            </CardTitle>
            <CardDescription>
              Enter your topic and preferences to generate platform-optimized content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Topic / Theme *</Label>
                <Textarea
                  placeholder="e.g., Announce our new screens in Dubai Marina, promote venue owner benefits, share DOOH advertising tips..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Post Type</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              onClick={generatePosts}
              disabled={generating || !topic.trim()}
              className="w-full md:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate All Posts
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Posts */}
        {posts && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Generated Posts</h2>
              <Button variant="outline" onClick={generatePosts} disabled={generating}>
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                Regenerate All
              </Button>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {renderPostCard("facebook", posts.facebook)}
              {renderPostCard("linkedin", posts.linkedin)}
              {renderPostCard("twitter", posts.twitter)}
              {renderPostCard("instagram", posts.instagram)}
              {renderPostCard("google", posts.google)}
            </div>

            {/* Mobile/Tablet Tabs View */}
            <div className="lg:hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full">
                  {platforms.map((platform) => (
                    <TabsTrigger key={platform.id} value={platform.id} className="px-2">
                      <platform.icon className="w-4 h-4" />
                    </TabsTrigger>
                  ))}
                </TabsList>
                {platforms.map((platform) => (
                  <TabsContent key={platform.id} value={platform.id}>
                    {renderPostCard(platform.id, posts[platform.id])}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        )}

        {/* Quick Ideas */}
        {!posts && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Post Ideas</CardTitle>
              <CardDescription>Click any idea to use it as your topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "New screen locations in Dubai Marina",
                  "Why DOOH advertising beats traditional billboards",
                  "Venue owners: Turn your screens into passive income",
                  "Case study: Restaurant increased footfall by 40%",
                  "Ramadan advertising tips for UAE businesses",
                  "Start your first campaign from just AED 99/week",
                  "Real-time analytics for smarter advertising",
                  "Join 500+ screens in our growing network",
                  "AI-powered campaign optimization features"
                ].map((idea, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-3 px-4 text-left justify-start text-sm"
                    onClick={() => setTopic(idea)}
                  >
                    <Sparkles className="w-4 h-4 mr-2 flex-shrink-0 text-violet-500" />
                    <span className="line-clamp-2">{idea}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}