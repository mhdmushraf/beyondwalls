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
  
  // Business card state
  const [ceoCard, setCeoCard] = useState({
    name: "Muhammed Musharaf",
    title: "Chief Executive Officer",
    email: "ceo@beyondwalls.ae",
    phone: "+971 55 614 0067"
  });
  const [cooCard, setCooCard] = useState({
    name: "Muhammed Shafi",
    title: "Chief Operating Officer",
    email: "coo@beyondwalls.ae",
    phone: "+971 55 614 0068"
  });
  const [editingCard, setEditingCard] = useState(null);

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
                <BusinessCardCreative
                  cardData={ceoCard}
                  cardType="ceo"
                  onEdit={() => setEditingCard("ceo")}
                  onDownload={() => downloadBusinessCardCreative("ceo", ceoCard)}
                />
              </TabsContent>

              <TabsContent value="coo">
                <BusinessCardCreative
                  cardData={cooCard}
                  cardType="coo"
                  onEdit={() => setEditingCard("coo")}
                  onDownload={() => downloadBusinessCardCreative("coo", cooCard)}
                />
              </TabsContent>
            </Tabs>

            {/* Edit Card Dialog */}
            {editingCard && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Edit {editingCard === "ceo" ? "CEO" : "COO"} Card</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={editingCard === "ceo" ? ceoCard.name : cooCard.name}
                        onChange={(e) => editingCard === "ceo" 
                          ? setCeoCard({...ceoCard, name: e.target.value})
                          : setCooCard({...cooCard, name: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editingCard === "ceo" ? ceoCard.title : cooCard.title}
                        onChange={(e) => editingCard === "ceo" 
                          ? setCeoCard({...ceoCard, title: e.target.value})
                          : setCooCard({...cooCard, title: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={editingCard === "ceo" ? ceoCard.email : cooCard.email}
                        onChange={(e) => editingCard === "ceo" 
                          ? setCeoCard({...ceoCard, email: e.target.value})
                          : setCooCard({...cooCard, email: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={editingCard === "ceo" ? ceoCard.phone : cooCard.phone}
                        onChange={(e) => editingCard === "ceo" 
                          ? setCeoCard({...ceoCard, phone: e.target.value})
                          : setCooCard({...cooCard, phone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setEditingCard(null)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={() => setEditingCard(null)} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function downloadBusinessCardCreative(role, cardData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Business card dimensions
    canvas.width = 800;
    canvas.height = 450;
    
    // Background with colorful gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
    if (role === 'ceo') {
      bgGradient.addColorStop(0, '#1e1b4b');
      bgGradient.addColorStop(0.5, '#312e81');
      bgGradient.addColorStop(1, '#4c1d95');
    } else {
      bgGradient.addColorStop(0, '#0c4a6e');
      bgGradient.addColorStop(0.5, '#0369a1');
      bgGradient.addColorStop(1, '#7c3aed');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 450);
    
    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(700, 80, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 400, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(750, 400, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Colorful accent bar
    const accentGradient = ctx.createLinearGradient(0, 0, 0, 450);
    accentGradient.addColorStop(0, '#f97316');
    accentGradient.addColorStop(0.33, '#ec4899');
    accentGradient.addColorStop(0.66, '#8b5cf6');
    accentGradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = accentGradient;
    ctx.fillRect(0, 0, 10, 450);
    
    // Logo icon background
    const logoGradient = ctx.createLinearGradient(40, 35, 110, 105);
    logoGradient.addColorStop(0, '#f97316');
    logoGradient.addColorStop(1, '#ec4899');
    ctx.beginPath();
    ctx.roundRect(40, 35, 70, 70, 16);
    ctx.fillStyle = logoGradient;
    ctx.fill();
    
    // Monitor icon in logo
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.roundRect(55, 50, 40, 30, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(75, 80);
    ctx.lineTo(75, 92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60, 92);
    ctx.lineTo(90, 92);
    ctx.stroke();
    
    // Play icon
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(68, 58);
    ctx.lineTo(68, 72);
    ctx.lineTo(82, 65);
    ctx.closePath();
    ctx.fill();
    
    // Company name
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('BeyondWalls', 125, 75);
    
    // Tagline
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Digital Out-of-Home Advertising', 125, 98);
    
    // Divider line with gradient
    const lineGradient = ctx.createLinearGradient(40, 0, 760, 0);
    lineGradient.addColorStop(0, '#f97316');
    lineGradient.addColorStop(0.5, '#ec4899');
    lineGradient.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 135);
    ctx.lineTo(760, 135);
    ctx.stroke();
    
    // Name with glow effect
    ctx.shadowColor = role === 'ceo' ? '#f97316' : '#06b6d4';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cardData.name, 40, 195);
    ctx.shadowBlur = 0;
    
    // Title badge
    const titleGradient = ctx.createLinearGradient(40, 210, 300, 240);
    titleGradient.addColorStop(0, '#f97316');
    titleGradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = titleGradient;
    ctx.beginPath();
    ctx.roundRect(40, 210, ctx.measureText(cardData.title).width * 0.55 + 30, 32, 16);
    ctx.fill();
    
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cardData.title, 55, 232);
    
    // Contact details
    ctx.font = '15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    
    // Email icon and text
    ctx.fillText('✉️  ' + cardData.email, 40, 295);
    
    // Phone icon and text
    ctx.fillText('📱  ' + cardData.phone, 40, 325);
    
    // Website
    ctx.fillText('🌐  www.beyondwalls.ae', 40, 355);
    
    // Address
    ctx.fillText('📍  Dubai, United Arab Emirates', 40, 385);
    
    // QR code area with colorful border
    const qrGradient = ctx.createLinearGradient(580, 260, 760, 400);
    qrGradient.addColorStop(0, '#f97316');
    qrGradient.addColorStop(0.5, '#ec4899');
    qrGradient.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = qrGradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(590, 260, 160, 140, 12);
    ctx.stroke();
    
    // QR background
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(593, 263, 154, 134, 10);
    ctx.fill();
    
    // QR pattern simulation
    ctx.fillStyle = '#1e1b4b';
    const qrStartX = 610;
    const qrStartY = 280;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 5; j++) {
        if ((i + j) % 2 === 0 || Math.random() > 0.5) {
          ctx.fillRect(qrStartX + i * 18, qrStartY + j * 18, 14, 14);
        }
      }
    }
    
    ctx.font = '11px system-ui';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to connect', 670, 388);
    ctx.textAlign = 'left';
    
    // Bottom colorful bar
    const bottomGradient = ctx.createLinearGradient(0, 440, 800, 450);
    bottomGradient.addColorStop(0, '#f97316');
    bottomGradient.addColorStop(0.25, '#ec4899');
    bottomGradient.addColorStop(0.5, '#8b5cf6');
    bottomGradient.addColorStop(0.75, '#3b82f6');
    bottomGradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, 440, 800, 10);
    
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

function BusinessCardCreative({ cardData, cardType, onEdit, onDownload }) {
  const isCeo = cardType === "ceo";
  
  return (
    <div className="space-y-4">
      {/* Card Preview - Creative Colorful Design */}
      <div className={`relative rounded-2xl shadow-2xl overflow-hidden max-w-xl mx-auto ${
        isCeo 
          ? "bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900"
          : "bg-gradient-to-br from-sky-900 via-blue-800 to-violet-800"
      }`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/4 translate-x-1/4" />
        
        {/* Left colorful accent */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-orange-500 via-pink-500 to-cyan-500" />
        
        <div className="relative p-6">
          {/* Header with logo */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
              <MonitorPlay className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-bold text-2xl text-white">
                BeyondWalls
              </span>
              <p className="text-sm text-white/60">Digital Out-of-Home Advertising</p>
            </div>
          </div>
          
          {/* Person info */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{cardData.name}</h3>
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-white text-sm font-semibold shadow-lg">
              {cardData.title}
            </span>
          </div>
          
          {/* Contact details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-orange-400" />
              </div>
              <span>{cardData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-pink-400" />
              </div>
              <span>{cardData.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-violet-400" />
              </div>
              <span>www.beyondwalls.ae</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-cyan-400" />
              </div>
              <span>Dubai, UAE</span>
            </div>
          </div>
        </div>
        
        {/* Bottom colorful bar */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-pink-500 via-violet-500 to-cyan-500" />
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <Button onClick={onEdit} variant="outline" className="border-violet-300">
          <CreditCard className="w-4 h-4 mr-2" />
          Edit Details
        </Button>
        <Button onClick={onDownload} className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600">
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}