import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, RefreshCw, MonitorPlay, Sparkles, FileText, CreditCard, Mail, Phone, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      
    } else if (type === 'bone') {
      // B.One Player Logo
      canvas.width = 400;
      canvas.height = 120;
      
      // Dark background
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(0, 0, 400, 120, 16);
      ctx.fill();
      
      // Icon background gradient
      const gradient = ctx.createLinearGradient(15, 20, 95, 100);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#6366F1');
      
      // Draw icon background
      ctx.beginPath();
      ctx.roundRect(15, 20, 80, 80, 16);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Simple monitor in icon
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.roundRect(30, 35, 50, 38, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(55, 73);
      ctx.lineTo(55, 85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, 85);
      ctx.lineTo(70, 85);
      ctx.stroke();
      
      // Play icon
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(48, 45);
      ctx.lineTo(48, 63);
      ctx.lineTo(65, 54);
      ctx.closePath();
      ctx.fill();
      
      // Text "B.One"
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('B.One', 115, 70);
      
      // Text "Player" subtitle
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('Player', 115, 95);
      
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
      link.download = type === 'icon' ? 'beyondwalls-icon.png' : type === 'bone' ? 'bone-player-logo.png' : 'beyondwalls-logo.png';
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const downloadAsPDF = (type) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (type === 'bone') {
      // B.One Player Logo for PDF
      canvas.width = 400;
      canvas.height = 120;
      
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(0, 0, 400, 120, 16);
      ctx.fill();
      
      const gradient = ctx.createLinearGradient(15, 20, 95, 100);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#6366F1');
      
      ctx.beginPath();
      ctx.roundRect(15, 20, 80, 80, 16);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.roundRect(30, 35, 50, 38, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(55, 73);
      ctx.lineTo(55, 85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, 85);
      ctx.lineTo(70, 85);
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(48, 45);
      ctx.lineTo(48, 63);
      ctx.lineTo(65, 54);
      ctx.closePath();
      ctx.fill();
      
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('B.One', 115, 70);
      
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('Player', 115, 95);
      
    } else if (type === 'icon') {
      canvas.width = 256;
      canvas.height = 256;
      
      const gradient = ctx.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#6366F1');
      
      ctx.beginPath();
      ctx.roundRect(0, 0, 256, 256, 48);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.roundRect(60, 60, 136, 100, 8);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(128, 160);
      ctx.lineTo(128, 185);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(95, 185);
      ctx.lineTo(161, 185);
      ctx.stroke();
      
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
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 100);
      
      const gradient = ctx.createLinearGradient(10, 10, 90, 90);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#6366F1');
      
      ctx.beginPath();
      ctx.roundRect(10, 15, 70, 70, 14);
      ctx.fillStyle = gradient;
      ctx.fill();
      
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
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(38, 38);
      ctx.lineTo(38, 52);
      ctx.lineTo(52, 45);
      ctx.closePath();
      ctx.fill();
      
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      const textGradient = ctx.createLinearGradient(95, 0, 380, 0);
      textGradient.addColorStop(0, '#8B5CF6');
      textGradient.addColorStop(1, '#6366F1');
      ctx.fillStyle = textGradient;
      ctx.fillText('BeyondWalls', 95, 62);
    }
    
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF manually using basic structure
    const pdfWidth = type === 'icon' ? 256 : 400;
    const pdfHeight = type === 'icon' ? 256 : 100;
    
    // Create an HTML document for printing as PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${type === 'bone' ? 'B.One Player Logo' : `BeyondWalls ${type === 'icon' ? 'Icon' : 'Logo'}`}</title>
        <style>
          @page { size: ${type === 'icon' ? '256px 256px' : '400px 100px'}; margin: 0; }
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <img src="${imgData}" />
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => downloadCurrentLogo('icon')}>
                    <Download className="w-3 h-3 mr-1" /> PNG
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsPDF('icon')}>
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </Button>
                </div>
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
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => downloadCurrentLogo('full')}>
                    <Download className="w-3 h-3 mr-1" /> PNG
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsPDF('full')}>
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </Button>
                </div>
              </div>

              {/* B.One Player Logo */}
              <div className="text-center">
                <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-xl shadow-lg mx-auto mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <MonitorPlay className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-xl text-white">B.One</span>
                    <span className="text-xs text-violet-400 block -mt-1">Player</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-2">B.One Player</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => downloadCurrentLogo('bone')}>
                    <Download className="w-3 h-3 mr-1" /> PNG
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsPDF('bone')}>
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </Button>
                </div>
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

        {/* Business Cards Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-violet-600" />
              Professional Business Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ceo">
              <TabsList className="mb-6">
                <TabsTrigger value="ceo">CEO Card</TabsTrigger>
                <TabsTrigger value="coo">COO Card</TabsTrigger>
              </TabsList>

              <TabsContent value="ceo">
                <BusinessCard
                  name="Mohammed Al Rashid"
                  title="Chief Executive Officer"
                  email="ceo@beyondwalls.ae"
                  phone="+971 55 614 0067"
                  onDownload={() => downloadBusinessCard("ceo")}
                />
              </TabsContent>

              <TabsContent value="coo">
                <BusinessCard
                  name="Sarah Ahmed"
                  title="Chief Operating Officer"
                  email="coo@beyondwalls.ae"
                  phone="+971 55 614 0068"
                  onDownload={() => downloadBusinessCard("coo")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function downloadBusinessCard(role) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Business card dimensions (standard 3.5 x 2 inches at 300 DPI scaled down)
    canvas.width = 700;
    canvas.height = 400;
    
    // White background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 700, 400);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 700, 400);
    
    // Left accent bar with gradient
    const accentGradient = ctx.createLinearGradient(0, 0, 0, 400);
    accentGradient.addColorStop(0, '#8B5CF6');
    accentGradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = accentGradient;
    ctx.fillRect(0, 0, 8, 400);
    
    // Logo icon background
    const logoGradient = ctx.createLinearGradient(40, 30, 100, 90);
    logoGradient.addColorStop(0, '#8B5CF6');
    logoGradient.addColorStop(1, '#6366F1');
    ctx.beginPath();
    ctx.roundRect(40, 30, 60, 60, 12);
    ctx.fillStyle = logoGradient;
    ctx.fill();
    
    // Monitor icon in logo
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.roundRect(52, 42, 36, 26, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(70, 68);
    ctx.lineTo(70, 78);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(58, 78);
    ctx.lineTo(82, 78);
    ctx.stroke();
    
    // Play icon
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(65, 50);
    ctx.lineTo(65, 62);
    ctx.lineTo(77, 56);
    ctx.closePath();
    ctx.fill();
    
    // Company name
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    const nameGradient = ctx.createLinearGradient(115, 0, 300, 0);
    nameGradient.addColorStop(0, '#8B5CF6');
    nameGradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = nameGradient;
    ctx.fillText('BeyondWalls', 115, 65);
    
    // Tagline
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Digital Out-of-Home Advertising', 115, 85);
    
    // Divider line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(660, 120);
    ctx.stroke();
    
    // Person details
    const personName = role === 'ceo' ? 'Mohammed Al Rashid' : 'Sarah Ahmed';
    const personTitle = role === 'ceo' ? 'Chief Executive Officer' : 'Chief Operating Officer';
    const personEmail = role === 'ceo' ? 'ceo@beyondwalls.ae' : 'coo@beyondwalls.ae';
    const personPhone = role === 'ceo' ? '+971 55 614 0067' : '+971 55 614 0068';
    
    // Name
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(personName, 40, 175);
    
    // Title
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#8B5CF6';
    ctx.fillText(personTitle, 40, 205);
    
    // Contact details with icons
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    
    // Email
    ctx.fillText('✉  ' + personEmail, 40, 260);
    
    // Phone
    ctx.fillText('📞  ' + personPhone, 40, 285);
    
    // Website
    ctx.fillText('🌐  www.beyondwalls.ae', 40, 310);
    
    // Address
    ctx.fillText('📍  Dubai, United Arab Emirates', 40, 335);
    
    // QR code placeholder (stylized square)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(560, 240, 100, 100, 8);
    ctx.stroke();
    
    // QR pattern simulation
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (Math.random() > 0.4) {
          ctx.fillRect(572 + i * 16, 252 + j * 16, 12, 12);
        }
      }
    }
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to connect', 610, 355);
    ctx.textAlign = 'left';
    
    // Bottom accent
    const bottomGradient = ctx.createLinearGradient(0, 380, 700, 400);
    bottomGradient.addColorStop(0, '#8B5CF6');
    bottomGradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, 392, 700, 8);
    
    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beyondwalls-${role}-business-card.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }
}

function BusinessCard({ name, title, email, phone, onDownload }) {
  return (
    <div className="space-y-4">
      {/* Card Preview */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border max-w-lg mx-auto">
        {/* Top accent */}
        <div className="h-2 bg-gradient-to-r from-violet-600 to-indigo-600" />
        
        <div className="p-6">
          {/* Header with logo */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                BeyondWalls
              </span>
              <p className="text-xs text-slate-500">Digital Out-of-Home Advertising</p>
            </div>
          </div>
          
          {/* Person info */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
            <p className="text-violet-600 font-medium">{title}</p>
          </div>
          
          {/* Contact details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-violet-500" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-violet-500" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Globe className="w-4 h-4 text-violet-500" />
              <span>www.beyondwalls.ae</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin className="w-4 h-4 text-violet-500" />
              <span>Dubai, United Arab Emirates</span>
            </div>
          </div>
        </div>
        
        {/* Bottom accent */}
        <div className="h-2 bg-gradient-to-r from-violet-600 to-indigo-600" />
      </div>
      
      {/* Download buttons */}
      <div className="flex justify-center gap-3">
        <Button onClick={onDownload} className="bg-gradient-to-r from-violet-600 to-indigo-600">
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}