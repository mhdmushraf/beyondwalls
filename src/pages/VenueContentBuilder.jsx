import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layout, Type, Image as ImageIcon, Plus, Trash2, 
  Save, Eye, Cloud, Newspaper, Instagram, Calendar 
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export default function VenueContentBuilder() {
  const [user, setUser] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [contentData, setContentData] = useState({
    content_name: "",
    content_type: "custom",
    template_id: "",
    elements: [],
    dynamic_feeds: {
      weather_enabled: false,
      news_enabled: false,
      social_enabled: false,
      social_handle: ""
    },
    schedule: {
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      time_ranges: []
    }
  });
  const [previewMode, setPreviewMode] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: venues = [] } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["venue-screens"],
    queryFn: async () => {
      const allScreens = await base44.entities.Screen.list();
      return allScreens.filter(s => venues.some(v => v.id === s.venue_id));
    },
    enabled: venues.length > 0
  });

  const { data: myContent = [] } = useQuery({
    queryKey: ["my-content", user?.email],
    queryFn: () => base44.entities.VenueContent.filter({ venue_id: user?.email }),
    enabled: !!user
  });

  // Save content
  const saveContentMutation = useMutation({
    mutationFn: async (data) => {
      // Generate preview
      const previewEl = document.getElementById("content-preview");
      let preview_url = "";
      
      if (previewEl) {
        const canvas = await html2canvas(previewEl);
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        const file = new File([blob], "preview.png", { type: "image/png" });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        preview_url = file_url;
      }

      return base44.entities.VenueContent.create({
        venue_id: user?.email,
        screen_id: selectedScreen?.id,
        preview_url,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-content"] });
      toast.success("Content saved!");
      resetForm();
    }
  });

  // Publish content
  const publishContentMutation = useMutation({
    mutationFn: (contentId) => base44.entities.VenueContent.update(contentId, { status: "published" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-content"] });
      toast.success("Content published!");
    }
  });

  const addElement = (type) => {
    const newElement = {
      id: Date.now(),
      type,
      content: type === "text" ? "Double-click to edit" : "",
      style: {
        fontSize: type === "heading" ? "48px" : "24px",
        color: "#000000",
        fontWeight: type === "heading" ? "bold" : "normal",
        textAlign: "center"
      },
      position: {
        x: 50,
        y: contentData.elements.length * 100 + 50
      }
    };

    setContentData({
      ...contentData,
      elements: [...contentData.elements, newElement]
    });
  };

  const updateElement = (id, updates) => {
    setContentData({
      ...contentData,
      elements: contentData.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
    });
  };

  const removeElement = (id) => {
    setContentData({
      ...contentData,
      elements: contentData.elements.filter(el => el.id !== id)
    });
  };

  const resetForm = () => {
    setContentData({
      content_name: "",
      content_type: "custom",
      template_id: "",
      elements: [],
      dynamic_feeds: {
        weather_enabled: false,
        news_enabled: false,
        social_enabled: false,
        social_handle: ""
      },
      schedule: {
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        time_ranges: []
      }
    });
  };

  const templates = [
    { id: "promo", name: "Promotion", icon: "🎉" },
    { id: "announcement", name: "Announcement", icon: "📢" },
    { id: "event", name: "Event", icon: "🎪" },
    { id: "menu", name: "Menu Board", icon: "📋" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-8 h-8 text-violet-600" />
              Content Builder
            </h1>
            <p className="text-slate-600 mt-1">Create engaging content for your screens</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Screen Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Screen</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedScreen?.id || ""}
                  onChange={(e) => {
                    const screen = screens.find(s => s.id === e.target.value);
                    setSelectedScreen(screen);
                  }}
                >
                  <option value="">Choose screen...</option>
                  {screens.map(screen => {
                    const venue = venues.find(v => v.id === screen.venue_id);
                    return (
                      <option key={screen.id} value={screen.id}>
                        {screen.name} - {venue?.name}
                      </option>
                    );
                  })}
                </select>
              </CardContent>
            </Card>

            {/* Content Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Content Name</Label>
                  <Input
                    value={contentData.content_name}
                    onChange={(e) => setContentData({ ...contentData, content_name: e.target.value })}
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                <div>
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setContentData({ ...contentData, template_id: template.id })}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          contentData.template_id === template.id
                            ? "border-violet-600 bg-violet-50"
                            : "hover:border-slate-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{template.icon}</div>
                        <div className="text-xs font-medium">{template.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Elements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => addElement("heading")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Heading
                </Button>
                <Button
                  onClick={() => addElement("text")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </Button>
                <Button
                  onClick={() => addElement("image")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </Button>
              </CardContent>
            </Card>

            {/* Dynamic Feeds */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dynamic Feeds</CardTitle>
                <CardDescription>Add real-time data to your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <Label>Weather</Label>
                  </div>
                  <Switch
                    checked={contentData.dynamic_feeds.weather_enabled}
                    onCheckedChange={(checked) => setContentData({
                      ...contentData,
                      dynamic_feeds: { ...contentData.dynamic_feeds, weather_enabled: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-slate-600" />
                    <Label>News</Label>
                  </div>
                  <Switch
                    checked={contentData.dynamic_feeds.news_enabled}
                    onCheckedChange={(checked) => setContentData({
                      ...contentData,
                      dynamic_feeds: { ...contentData.dynamic_feeds, news_enabled: checked }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <Label>Social Media</Label>
                    </div>
                    <Switch
                      checked={contentData.dynamic_feeds.social_enabled}
                      onCheckedChange={(checked) => setContentData({
                        ...contentData,
                        dynamic_feeds: { ...contentData.dynamic_feeds, social_enabled: checked }
                      })}
                    />
                  </div>
                  {contentData.dynamic_feeds.social_enabled && (
                    <Input
                      placeholder="@your_handle"
                      value={contentData.dynamic_feeds.social_handle}
                      onChange={(e) => setContentData({
                        ...contentData,
                        dynamic_feeds: { ...contentData.dynamic_feeds, social_handle: e.target.value }
                      })}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Canvas</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {previewMode ? "Edit" : "Preview"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveContentMutation.mutate(contentData)}
                      disabled={!contentData.content_name || !selectedScreen || saveContentMutation.isPending}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  id="content-preview"
                  className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden"
                  style={{
                    width: "100%",
                    aspectRatio: selectedScreen?.orientation === "portrait" ? "9/16" : "16/9",
                    minHeight: "400px"
                  }}
                >
                  {/* Dynamic Feeds Display */}
                  {contentData.dynamic_feeds.weather_enabled && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm">
                      <Cloud className="w-5 h-5 text-blue-600 mb-1" />
                      <div className="font-bold">28°C</div>
                      <div className="text-xs text-slate-600">Sunny</div>
                    </div>
                  )}

                  {contentData.dynamic_feeds.news_enabled && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs">
                      <div className="flex items-center gap-2 animate-marquee">
                        <Newspaper className="w-4 h-4" />
                        <span>Breaking News • Latest updates from Dubai • Weather forecast...</span>
                      </div>
                    </div>
                  )}

                  {/* Content Elements */}
                  {contentData.elements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute cursor-move"
                      style={{
                        left: `${element.position.x}px`,
                        top: `${element.position.y}px`,
                        ...element.style
                      }}
                      contentEditable={!previewMode}
                      suppressContentEditableWarning
                      onBlur={(e) => updateElement(element.id, { content: e.target.innerText })}
                    >
                      {element.type === "image" ? (
                        <div className="w-48 h-32 bg-slate-700 rounded flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-slate-500" />
                        </div>
                      ) : (
                        element.content
                      )}
                      
                      {!previewMode && (
                        <button
                          onClick={() => removeElement(element.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {contentData.elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Add elements to start designing</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Saved Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {myContent.map((content) => (
                    <div key={content.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{content.content_name}</p>
                          <Badge className="mt-1">{content.status}</Badge>
                        </div>
                        {content.preview_url && (
                          <img src={content.preview_url} alt="Preview" className="w-16 h-12 object-cover rounded" />
                        )}
                      </div>
                      {content.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => publishContentMutation.mutate(content.id)}
                          className="w-full mt-2"
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}