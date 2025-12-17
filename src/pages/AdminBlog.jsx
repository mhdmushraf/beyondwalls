import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Upload,
  Loader2,
  Save,
  X,
  ExternalLink,
  Sparkles,
  Settings,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIBlogAssistant from "@/components/blog/AIBlogAssistant";

export default function AdminBlog() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [autoGenEnabled, setAutoGenEnabled] = useState(false);
  const [autoGenCategory, setAutoGenCategory] = useState("industry-news");
  const [savingSettings, setSavingSettings] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "industry-news",
    status: "draft",
    tags: []
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

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => base44.entities.BlogPost.list("-created_date")
  });

  const { data: blogSettings = [] } = useQuery({
    queryKey: ["blog-settings"],
    queryFn: () => base44.entities.PlatformSettings.filter({ setting_key: "auto_blog_generation" })
  });

  useEffect(() => {
    if (blogSettings.length > 0) {
      try {
        const settings = JSON.parse(blogSettings[0].setting_value);
        setAutoGenEnabled(settings.enabled || false);
        setAutoGenCategory(settings.category || "industry-news");
      } catch (e) {
        console.log("Failed to parse blog settings");
      }
    }
  }, [blogSettings]);

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewPost = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      cover_image: "",
      category: "industry-news",
      status: "draft",
      tags: []
    });
    setShowEditor(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover_image: post.cover_image || "",
      category: post.category || "industry-news",
      status: post.status || "draft",
      tags: post.tags || []
    });
    setShowEditor(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: file_url });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    }
    setUploading(false);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        slug: generateSlug(formData.title),
        author_id: user.email,
        author_name: user.full_name || user.email,
        read_time: Math.ceil(formData.content.split(" ").length / 200),
        status: publish ? "published" : formData.status,
        published_at: publish ? new Date().toISOString() : (editingPost?.published_at || null)
      };

      if (editingPost) {
        await base44.entities.BlogPost.update(editingPost.id, postData);
        toast.success("Post updated");
      } else {
        await base44.entities.BlogPost.create(postData);
        toast.success(publish ? "Post published" : "Draft saved");
      }

      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setShowEditor(false);
    } catch (error) {
      toast.error("Failed to save post");
    }
    setSaving(false);
  };

  const handleDelete = async (post) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await base44.entities.BlogPost.delete(post.id);
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post deleted");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const categoryLabels = {
    "dooh-advertising": "DOOH Advertising",
    "marketing-tips": "Marketing Tips",
    "uae-market-insights": "UAE Market Insights",
    "case-studies": "Case Studies",
    "product-updates": "Product Updates",
    "industry-news": "Industry News",
    "guides": "Guides"
  };

  const handleAIApply = (aiData) => {
    setFormData({
      ...formData,
      ...aiData
    });
    toast.success("AI content applied to editor");
  };

  const handleSaveAutoGenSettings = async () => {
    setSavingSettings(true);
    try {
      const settingsData = JSON.stringify({
        enabled: autoGenEnabled,
        category: autoGenCategory,
        last_updated: new Date().toISOString()
      });

      if (blogSettings.length > 0) {
        await base44.entities.PlatformSettings.update(blogSettings[0].id, {
          setting_value: settingsData
        });
      } else {
        await base44.entities.PlatformSettings.create({
          setting_key: "auto_blog_generation",
          setting_value: settingsData,
          setting_type: "json",
          description: "Auto blog generation settings"
        });
      }
      queryClient.invalidateQueries({ queryKey: ["blog-settings"] });
      toast.success("Auto-generation settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
    setSavingSettings(false);
  };

  const generateAIBlog = async () => {
    setGenerating(true);
    try {
      const topics = {
        "industry-news": "latest trends and news in digital out-of-home (DOOH) advertising, programmatic advertising, or digital signage industry in UAE and globally",
        "tips": "practical tips for businesses to maximize their DOOH advertising ROI, best practices for screen advertising, or venue marketing strategies",
        "case-studies": "a fictional but realistic case study of a business that successfully used DOOH advertising to grow their brand awareness or sales in UAE",
        "product-updates": "new features and improvements in digital advertising platforms, screen technology advancements, or audience measurement innovations",
        "guides": "comprehensive guide on topics like 'How to Choose the Right Venues for Your Ad Campaign', 'Understanding DOOH Metrics', or 'Creating Effective Digital Signage Content'"
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional content writer for BeyondWalls, UAE's leading DOOH (Digital Out-of-Home) advertising platform. 

Write a high-quality, engaging blog post about ${topics[autoGenCategory]}.

The blog should:
- Be informative and valuable for business owners and marketers
- Include relevant statistics and insights
- Be optimized for SEO with relevant keywords
- Have a professional yet approachable tone
- Be relevant to the UAE market when applicable
- Be approximately 800-1200 words

Generate a complete blog post with title, excerpt, and content.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Catchy, SEO-friendly title (max 60 chars)" },
            excerpt: { type: "string", description: "Brief summary for preview (max 160 chars)" },
            content: { type: "string", description: "Full blog content in markdown format" },
            tags: { type: "array", items: { type: "string" }, description: "3-5 relevant tags" }
          }
        }
      });

      // Generate cover image
      const imagePrompt = `Professional blog header image for article titled "${response.title}". Modern, corporate style with violet/indigo color scheme. Digital advertising, technology, business theme. Clean, minimalist design suitable for a tech company blog.`;
      
      let coverImage = "";
      try {
        const { url } = await base44.integrations.Core.GenerateImage({ prompt: imagePrompt });
        coverImage = url;
      } catch (e) {
        console.log("Image generation failed, continuing without image");
      }

      const postData = {
        title: response.title,
        excerpt: response.excerpt,
        content: response.content,
        cover_image: coverImage,
        category: autoGenCategory,
        tags: response.tags || [],
        slug: generateSlug(response.title),
        author_id: user.email,
        author_name: "BeyondWalls Team",
        read_time: Math.ceil(response.content.split(" ").length / 200),
        status: "draft"
      };

      await base44.entities.BlogPost.create(postData);
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("AI blog post generated! Review and publish when ready.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate blog post");
    }
    setGenerating(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Blog Management</h1>
          <p className="text-slate-500">Create and manage blog posts for the public website</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateAIBlog} variant="outline" disabled={generating}>
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate with AI
          </Button>
          <Button onClick={handleNewPost} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Auto-Generation Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                Automatic Blog Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">Enable Daily Auto-Generation</p>
                  <p className="text-sm text-slate-500">
                    AI will automatically create a new blog post draft every day
                  </p>
                </div>
                <Switch
                  checked={autoGenEnabled}
                  onCheckedChange={setAutoGenEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Default Category for Auto-Generated Posts</Label>
                <Select value={autoGenCategory} onValueChange={setAutoGenCategory}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industry-news">Industry News</SelectItem>
                    <SelectItem value="tips">Tips & Tricks</SelectItem>
                    <SelectItem value="case-studies">Case Studies</SelectItem>
                    <SelectItem value="product-updates">Product Updates</SelectItem>
                    <SelectItem value="guides">Guides</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-sm text-violet-800">
                  <strong>Note:</strong> Auto-generated posts are saved as drafts. You'll need to review and publish them manually to ensure quality. Posts are generated once daily and include AI-generated cover images.
                </p>
              </div>

              <Button 
                onClick={handleSaveAutoGenSettings} 
                disabled={savingSettings}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {savingSettings ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No blog posts yet</p>
              <Button onClick={handleNewPost} className="mt-4">Create Your First Post</Button>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt="" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-24 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{post.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{post.excerpt}</p>
                      </div>
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span>{categoryLabels[post.category]}</span>
                      <span>•</span>
                      <span>{post.read_time || 1} min read</span>
                      <span>•</span>
                      <span>{format(new Date(post.created_date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-rose-600" onClick={() => handleDelete(post)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Blog Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "New Blog Post"}</DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* AI Assistant Sidebar */}
            <div className="lg:col-span-1">
              <AIBlogAssistant onApply={handleAIApply} />
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title..."
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industry-news">Industry News</SelectItem>
                    <SelectItem value="tips">Tips & Tricks</SelectItem>
                    <SelectItem value="case-studies">Case Studies</SelectItem>
                    <SelectItem value="product-updates">Product Updates</SelectItem>
                    <SelectItem value="guides">Guides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Short summary for preview..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              {formData.cover_image ? (
                <div className="relative">
                  <img src={formData.cover_image} alt="" className="w-full h-48 object-cover rounded-lg" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, cover_image: "" })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="block">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-violet-300 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-slate-400" />
                        <p className="text-slate-500 mt-2">Click to upload cover image</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog content here..."
                rows={12}
                className="min-h-[250px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="e.g., DOOH, Dubai, Marketing"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) 
                })}
              />
            </div>
          </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}