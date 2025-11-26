import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, RefreshCw, MonitorPlay, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function LogoGenerator() {
  const [generating, setGenerating] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [prompt, setPrompt] = useState("A modern minimalist logo for 'BeyondWalls' - a digital out-of-home advertising platform. The design should feature a stylized screen/monitor icon with a gradient from violet (#8B5CF6) to indigo (#6366F1). Clean, tech-forward aesthetic, suitable for a SaaS company. White or transparent background, professional and sleek.");
  const [iconPrompt, setIconPrompt] = useState("A minimalist app icon for 'BeyondWalls' - a single stylized monitor/screen symbol with violet to indigo gradient (#8B5CF6 to #6366F1). Simple geometric shape, no text, suitable as a favicon or app icon. Clean white or transparent background.");

  const generateLogo = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: prompt + " High quality, vector-style, professional brand logo design."
      });
      setLogoUrl(result.url);
    } catch (error) {
      console.error("Failed to generate logo:", error);
    }
    setGenerating(false);
  };

  const generateIcon = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: iconPrompt + " High quality, simple geometric icon design."
      });
      setIconUrl(result.url);
    } catch (error) {
      console.error("Failed to generate icon:", error);
    }
    setGenerating(false);
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCurrentLogo = (type) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (type === 'icon') {
      canvas.width = 256;
      canvas.height = 256;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#6366F1');
      
      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(0, 0, 256, 256, 48);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw monitor icon (simplified)
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Monitor screen
      ctx.beginPath();
      ctx.roundRect(60, 60, 136, 100, 8);
      ctx.stroke();
      
      // Monitor stand
      ctx.beginPath();
      ctx.moveTo(128, 160);
      ctx.lineTo(128, 185);
      ctx.stroke();
      
      // Monitor base
      ctx.beginPath();
      ctx.moveTo(95, 185);
      ctx.lineTo(161, 185);
      ctx.stroke();
      
      // Play triangle
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(115, 95);
      ctx.lineTo(115, 135);
      ctx.lineTo(150, 115);
      ctx.closePath();
      ctx.fill();
      
    } else {
      canvas.width = 400;
      canvas.height = 100;
      
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 100);
      
      // Icon background gradient
      const gradient = ctx.createLinearGradient(10, 10, 90, 90);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#6366F1');
      
      // Draw icon
      ctx.beginPath();
      ctx.roundRect(10, 15, 70, 70, 14);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Simple monitor in icon
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(22, 28, 46, 34, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(45, 62);
      ctx.lineTo(45, 72);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(32, 72);
      ctx.lineTo(58, 72);
      ctx.stroke();
      
      // Play icon
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(38, 38);
      ctx.lineTo(38, 52);
      ctx.lineTo(52, 45);
      ctx.closePath();
      ctx.fill();
      
      // Text "BeyondWalls"
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      const textGradient = ctx.createLinearGradient(95, 0, 380, 0);
      textGradient.addColorStop(0, '#8B5CF6');
      textGradient.addColorStop(1, '#6366F1');
      ctx.fillStyle = textGradient;
      ctx.fillText('BeyondWalls', 95, 62);
    }
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'icon' ? 'beyondwalls-icon.png' : 'beyondwalls-logo.png';
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-violet-600" />
            Logo Generator
          </h1>
          <p className="text-slate-500 mt-1">Generate AI-powered logos for BeyondWalls</p>
        </div>

        {/* Current Logo Preview */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Current Logo (Code-Based)</h2>
            <div className="flex items-center gap-6 flex-wrap">
              {/* Icon Only */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 mx-auto mb-2">
                  <MonitorPlay className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs text-slate-500 mb-2">Icon</p>
                <Button size="sm" variant="outline" onClick={() => downloadCurrentLogo('icon')}>
                  <Download className="w-3 h-3 mr-1" /> Download
                </Button>
              </div>
              
              {/* Full Logo */}
              <div className="text-center">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-lg mx-auto mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MonitorPlay className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    BeyondWalls
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">Full Logo</p>
                <Button size="sm" variant="outline" onClick={() => downloadCurrentLogo('full')}>
                  <Download className="w-3 h-3 mr-1" /> Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Full Logo Generator */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Generate Full Logo</h2>
              <div className="space-y-4">
                <div>
                  <Label>Logo Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={generateLogo} 
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate Logo</>
                  )}
                </Button>
                
                {logoUrl && (
                  <div className="mt-4">
                    <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                      <img src={logoUrl} alt="Generated Logo" className="max-w-full max-h-[300px] object-contain" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => downloadImage(logoUrl, 'beyondwalls-logo.png')}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download PNG
                      </Button>
                      <Button variant="ghost" onClick={generateLogo} disabled={generating}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Icon Generator */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Generate Icon Only</h2>
              <div className="space-y-4">
                <div>
                  <Label>Icon Prompt</Label>
                  <Textarea
                    value={iconPrompt}
                    onChange={(e) => setIconPrompt(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={generateIcon} 
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Generate Icon</>
                  )}
                </Button>
                
                {iconUrl && (
                  <div className="mt-4">
                    <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                      <img src={iconUrl} alt="Generated Icon" className="max-w-[200px] max-h-[200px] object-contain" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => downloadImage(iconUrl, 'beyondwalls-icon.png')}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download PNG
                      </Button>
                      <Button variant="ghost" onClick={generateIcon} disabled={generating}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-900 mb-2">Tips for Better Logo Generation</h2>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Be specific about colors: mention the exact hex codes (#8B5CF6 violet, #6366F1 indigo)</li>
              <li>Specify the style: minimalist, modern, geometric, tech-forward</li>
              <li>Mention "transparent background" or "white background"</li>
              <li>Add "vector-style" or "professional" for cleaner results</li>
              <li>For icons, keep it simple with "no text" and "geometric shape"</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}