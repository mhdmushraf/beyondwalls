import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Copy, 
  Download,
  Wand2,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function AICreativeGenerator() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    campaign_goal: "awareness",
    target_audience: "",
    brand_name: "",
    key_message: "",
    tone: "professional",
    keywords: "",
    brand_colors: ""
  });
  const [generatedContent, setGeneratedContent] = useState({
    headlines: [],
    descriptions: [],
    visualSuggestions: [],
    variations: []
  });

  const generateAdCopy = async () => {
    setLoading(true);
    try {
      const prompt = `You are an expert copywriter for DOOH (Digital Out-of-Home) advertising.

CAMPAIGN DETAILS:
- Brand: ${formData.brand_name}
- Goal: ${formData.campaign_goal}
- Target Audience: ${formData.target_audience}
- Key Message: ${formData.key_message}
- Tone: ${formData.tone}
- Keywords: ${formData.keywords}

Generate compelling DOOH ad copy that:
1. Grabs attention in 3-5 seconds
2. Is concise and impactful (DOOH audiences are on-the-go)
3. Includes a clear call-to-action
4. Aligns with the specified tone and brand voice

Provide:
- 5 attention-grabbing headlines (max 8 words each)
- 3 supporting descriptions (max 15 words each)
- 3 call-to-action phrases
- 5 creative variations combining different elements for A/B testing

Make the copy memorable, action-oriented, and suitable for large digital displays.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            headlines: {
              type: "array",
              items: { type: "string" }
            },
            descriptions: {
              type: "array",
              items: { type: "string" }
            },
            call_to_actions: {
              type: "array",
              items: { type: "string" }
            },
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  headline: { type: "string" },
                  description: { type: "string" },
                  cta: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedContent(prev => ({
        ...prev,
        headlines: response.headlines,
        descriptions: response.descriptions,
        callToActions: response.call_to_actions,
        variations: response.variations
      }));

      toast.success("Ad copy generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  const generateVisualSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `You are a creative director for DOOH advertising.

BRAND & CAMPAIGN INFO:
- Brand: ${formData.brand_name}
- Campaign Goal: ${formData.campaign_goal}
- Brand Colors: ${formData.brand_colors}
- Key Message: ${formData.key_message}
- Target Audience: ${formData.target_audience}

Suggest visual elements and design templates for DOOH ads:
1. Color schemes (considering brand colors and psychology)
2. Typography recommendations (fonts that work on large displays)
3. Layout templates (best practices for DOOH)
4. Visual motifs and imagery suggestions
5. Animation/motion ideas for dynamic displays

Provide practical, actionable suggestions that non-designers can implement.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            color_schemes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  colors: { type: "array", items: { type: "string" } },
                  usage: { type: "string" }
                }
              }
            },
            typography: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  font_style: { type: "string" },
                  use_case: { type: "string" }
                }
              }
            },
            layout_templates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            },
            visual_elements: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedContent(prev => ({
        ...prev,
        visualSuggestions: response
      }));

      toast.success("Visual suggestions generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const generateCreativeImage = async (headline) => {
    setLoading(true);
    try {
      const prompt = `Create a professional DOOH advertisement image for: "${headline}". 
      Brand: ${formData.brand_name}. 
      Style: Modern, clean, eye-catching. 
      Colors: ${formData.brand_colors || 'vibrant and bold'}. 
      Suitable for large digital billboards and screens.`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt
      });

      toast.success("Image generated! Check the preview below.");
      return url;
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Failed to generate image");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-violet-600" />
            AI Creative Generator
          </h1>
          <p className="text-slate-600 mt-2">Generate compelling ad copy and visual concepts with AI</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-violet-600" />
                  Campaign Details
                </CardTitle>
                <CardDescription>Tell us about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    placeholder="Your Brand"
                  />
                </div>

                <div>
                  <Label>Campaign Goal</Label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={formData.campaign_goal}
                    onChange={(e) => setFormData({ ...formData, campaign_goal: e.target.value })}
                  >
                    <option value="awareness">Brand Awareness</option>
                    <option value="traffic">Drive Traffic</option>
                    <option value="conversions">Generate Leads</option>
                    <option value="engagement">Boost Engagement</option>
                  </select>
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <Input
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="e.g., Young professionals, 25-40"
                  />
                </div>

                <div>
                  <Label>Key Message</Label>
                  <Textarea
                    value={formData.key_message}
                    onChange={(e) => setFormData({ ...formData, key_message: e.target.value })}
                    placeholder="What's the main message?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Tone</Label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual & Friendly</option>
                    <option value="bold">Bold & Energetic</option>
                    <option value="luxury">Luxury & Elegant</option>
                    <option value="playful">Playful & Fun</option>
                  </select>
                </div>

                <div>
                  <Label>Keywords (optional)</Label>
                  <Input
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="innovation, quality, fast"
                  />
                </div>

                <div>
                  <Label>Brand Colors (optional)</Label>
                  <Input
                    value={formData.brand_colors}
                    onChange={(e) => setFormData({ ...formData, brand_colors: e.target.value })}
                    placeholder="blue, white, gold"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={generateAdCopy}
                    disabled={loading || !formData.brand_name}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Type className="w-4 h-4 mr-2" />
                        Generate Ad Copy
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={generateVisualSuggestions}
                    disabled={loading || !formData.brand_name}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Generate Visual Ideas
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="copy" className="space-y-6">
              <TabsList>
                <TabsTrigger value="copy">Ad Copy</TabsTrigger>
                <TabsTrigger value="visuals">Visual Suggestions</TabsTrigger>
                <TabsTrigger value="variations">A/B Variations</TabsTrigger>
              </TabsList>

              {/* Ad Copy Tab */}
              <TabsContent value="copy" className="space-y-4">
                {generatedContent.headlines?.length > 0 ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Headlines</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generatedContent.headlines.map((headline, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between group">
                              <p className="font-medium">{headline}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(headline)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Descriptions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generatedContent.descriptions.map((desc, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between group">
                              <p className="text-sm">{desc}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(desc)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {generatedContent.callToActions?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Call-to-Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {generatedContent.callToActions.map((cta, idx) => (
                              <Badge
                                key={idx}
                                className="cursor-pointer hover:bg-violet-700"
                                onClick={() => copyToClipboard(cta)}
                              >
                                {cta}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-600">
                      Fill in the campaign details and click "Generate Ad Copy" to get started
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Visual Suggestions Tab */}
              <TabsContent value="visuals" className="space-y-4">
                {generatedContent.visualSuggestions?.color_schemes ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Color Schemes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {generatedContent.visualSuggestions.color_schemes.map((scheme, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <p className="font-medium mb-2">{scheme.name}</p>
                              <div className="flex gap-2 mb-2">
                                {scheme.colors.map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-12 h-12 rounded-lg border"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-slate-600">{scheme.usage}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Layout Templates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generatedContent.visualSuggestions.layout_templates.map((template, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                              <Badge className="mt-2" variant="outline">{template.best_for}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-600">
                      Click "Generate Visual Ideas" to get design suggestions
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Variations Tab */}
              <TabsContent value="variations" className="space-y-4">
                {generatedContent.variations?.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {generatedContent.variations.map((variation, idx) => (
                      <Card key={idx} className="border-l-4 border-violet-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{variation.name}</CardTitle>
                            <Badge>Variant {String.fromCharCode(65 + idx)}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-slate-600">Headline</Label>
                            <p className="font-semibold">{variation.headline}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">Description</Label>
                            <p className="text-sm">{variation.description}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">Call-to-Action</Label>
                            <Badge className="bg-violet-600">{variation.cta}</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const imageUrl = await generateCreativeImage(variation.headline);
                              if (imageUrl) {
                                window.open(imageUrl, '_blank');
                              }
                            }}
                            disabled={loading}
                            className="w-full"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Generate Visual
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-600">
                      Generate ad copy first to see A/B testing variations
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}