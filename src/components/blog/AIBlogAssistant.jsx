import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Loader2, 
  Lightbulb, 
  FileText, 
  RefreshCw, 
  Tag,
  Search as SearchIcon
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AIBlogAssistant({ onApply }) {
  const [activeTab, setActiveTab] = useState("ideas");
  const [loading, setLoading] = useState(false);
  
  // Idea generation
  const [ideaTopic, setIdeaTopic] = useState("");
  const [ideas, setIdeas] = useState([]);
  
  // Full post generation
  const [postTitle, setPostTitle] = useState("");
  const [generatedPost, setGeneratedPost] = useState(null);
  
  // Rewrite
  const [rewriteContent, setRewriteContent] = useState("");
  const [rewriteStyle, setRewriteStyle] = useState("professional");
  const [rewrittenContent, setRewrittenContent] = useState("");
  
  // Tags & Meta
  const [metaContent, setMetaContent] = useState("");
  const [generatedMeta, setGeneratedMeta] = useState(null);

  const generateIdeas = async () => {
    if (!ideaTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a creative content strategist for BeyondWalls, UAE's leading DOOH advertising platform.

Generate 5 compelling blog post ideas about: ${ideaTopic}

Context:
- BeyondWalls provides digital out-of-home advertising in UAE (Dubai, Abu Dhabi, Sharjah)
- Target audience: business owners, marketers, venue owners
- Focus on DOOH trends, marketing tips, UAE market insights, and case studies

For each idea, provide:
1. A catchy, SEO-friendly title
2. A brief description of what the post would cover
3. Why this would be valuable to readers`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  value: { type: "string" }
                }
              }
            }
          }
        }
      });

      setIdeas(response.ideas);
      toast.success("Blog ideas generated!");
    } catch (error) {
      toast.error("Failed to generate ideas");
    }
    setLoading(false);
  };

  const generateFullPost = async () => {
    if (!postTitle.trim()) {
      toast.error("Please enter a title or outline");
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional content writer for BeyondWalls, UAE's leading DOOH advertising platform.

Write a complete, high-quality blog post with the title or outline: "${postTitle}"

Requirements:
- 800-1200 words
- Engaging introduction that hooks readers
- Well-structured body with clear sections
- Include relevant statistics and data
- SEO-optimized with natural keyword usage
- Professional yet approachable tone
- Relevant to UAE market and DOOH advertising
- Strong conclusion with call-to-action
- Use markdown formatting

Focus on providing genuine value to business owners and marketers.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Final polished title" },
            excerpt: { type: "string", description: "Compelling summary (150-160 chars)" },
            content: { type: "string", description: "Full blog content in markdown" },
            category: { type: "string", description: "Best category: dooh-advertising, marketing-tips, uae-market-insights, or case-studies" }
          }
        }
      });

      setGeneratedPost(response);
      toast.success("Blog post generated!");
    } catch (error) {
      toast.error("Failed to generate post");
    }
    setLoading(false);
  };

  const rewriteForSEO = async () => {
    if (!rewriteContent.trim()) {
      toast.error("Please enter content to rewrite");
      return;
    }

    setLoading(true);
    try {
      const stylePrompts = {
        professional: "professional and authoritative",
        casual: "casual and conversational",
        persuasive: "persuasive and compelling",
        seo: "SEO-optimized with relevant keywords naturally integrated"
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Rewrite the following content in a ${stylePrompts[rewriteStyle]} style.

Improve it for:
- Better SEO (include relevant DOOH, advertising, and UAE market keywords)
- Clearer structure and readability
- More engaging tone
- Better flow and coherence

Original content:
${rewriteContent}

Return the rewritten version in markdown format.`,
        response_json_schema: {
          type: "object",
          properties: {
            rewritten_content: { type: "string" }
          }
        }
      });

      setRewrittenContent(response.rewritten_content);
      toast.success("Content rewritten!");
    } catch (error) {
      toast.error("Failed to rewrite content");
    }
    setLoading(false);
  };

  const generateMetaTags = async () => {
    if (!metaContent.trim()) {
      toast.error("Please enter content");
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an SEO expert. Analyze this blog content and generate optimized metadata.

Content:
${metaContent.substring(0, 2000)}

Generate:
1. SEO meta description (150-160 characters, compelling, includes key terms)
2. 5-7 relevant tags for categorization and SEO
3. Focus keyword for SEO optimization`,
        response_json_schema: {
          type: "object",
          properties: {
            meta_description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            focus_keyword: { type: "string" }
          }
        }
      });

      setGeneratedMeta(response);
      toast.success("Meta tags generated!");
    } catch (error) {
      toast.error("Failed to generate meta tags");
    }
    setLoading(false);
  };

  return (
    <Card className="border-2 border-violet-200">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          AI Blog Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="ideas" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Ideas
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Draft
            </TabsTrigger>
            <TabsTrigger value="rewrite" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Rewrite
            </TabsTrigger>
            <TabsTrigger value="meta" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ideas" className="space-y-4">
            <div className="space-y-2">
              <Label>Topic or Keywords</Label>
              <Input
                placeholder="e.g., DOOH advertising trends in Dubai"
                value={ideaTopic}
                onChange={(e) => setIdeaTopic(e.target.value)}
              />
            </div>
            <Button onClick={generateIdeas} disabled={loading} className="w-full bg-violet-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
              Generate Ideas
            </Button>

            {ideas.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-slate-700">Generated Ideas:</p>
                {ideas.map((idea, idx) => (
                  <Card key={idx} className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => {
                    setPostTitle(idea.title);
                    setActiveTab("draft");
                  }}>
                    <p className="font-medium text-sm text-slate-900">{idea.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{idea.description}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <div className="space-y-2">
              <Label>Title or Outline</Label>
              <Input
                placeholder="Enter post title or outline..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
            </div>
            <Button onClick={generateFullPost} disabled={loading} className="w-full bg-violet-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate Full Post
            </Button>

            {generatedPost && (
              <div className="space-y-3 mt-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-slate-500">Title:</p>
                  <p className="font-semibold text-slate-900">{generatedPost.title}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Excerpt:</p>
                  <p className="text-sm text-slate-700">{generatedPost.excerpt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Category:</p>
                  <Badge>{generatedPost.category}</Badge>
                </div>
                <Button onClick={() => onApply(generatedPost)} className="w-full">
                  Apply to Editor
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewrite" className="space-y-4">
            <div className="space-y-2">
              <Label>Content to Rewrite</Label>
              <Textarea
                placeholder="Paste your content here..."
                value={rewriteContent}
                onChange={(e) => setRewriteContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Writing Style</Label>
              <div className="flex gap-2">
                {["professional", "casual", "persuasive", "seo"].map(style => (
                  <Button
                    key={style}
                    variant={rewriteStyle === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRewriteStyle(style)}
                    className={rewriteStyle === style ? "bg-violet-600" : ""}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={rewriteForSEO} disabled={loading} className="w-full bg-violet-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Rewrite Content
            </Button>

            {rewrittenContent && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-2">Rewritten Content:</p>
                <div className="text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {rewrittenContent}
                </div>
                <Button onClick={() => onApply({ content: rewrittenContent })} className="w-full mt-3">
                  Apply to Editor
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="meta" className="space-y-4">
            <div className="space-y-2">
              <Label>Blog Content</Label>
              <Textarea
                placeholder="Paste your blog content here to generate SEO tags..."
                value={metaContent}
                onChange={(e) => setMetaContent(e.target.value)}
                rows={6}
              />
            </div>
            <Button onClick={generateMetaTags} disabled={loading} className="w-full bg-violet-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Tag className="w-4 h-4 mr-2" />}
              Generate SEO Tags
            </Button>

            {generatedMeta && (
              <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Meta Description:</p>
                  <p className="text-sm text-slate-700">{generatedMeta.meta_description}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Focus Keyword:</p>
                  <Badge variant="secondary">{generatedMeta.focus_keyword}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {generatedMeta.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={() => onApply({ 
                  excerpt: generatedMeta.meta_description,
                  tags: generatedMeta.tags 
                })} className="w-full">
                  Apply to Editor
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}