import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, RefreshCw, MonitorPlay, Sparkles, FileText, CreditCard, Mail, Phone, Globe, MapPin, FileImage, BookOpen } from "lucide-react";
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

  const downloadAsSVG = (type) => {
    let svgContent = '';
    
    if (type === 'bone') {
      // B.One Player Logo as SVG (vector format compatible with Adobe Illustrator)
      svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6"/>
      <stop offset="100%" style="stop-color:#6366F1"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect x="0" y="0" width="400" height="120" rx="16" fill="#0f172a"/>
  
  <!-- Icon Background -->
  <rect x="15" y="20" width="80" height="80" rx="16" fill="url(#iconGradient)"/>
  
  <!-- Monitor Screen -->
  <rect x="30" y="35" width="50" height="38" rx="4" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Monitor Stand -->
  <line x1="55" y1="73" x2="55" y2="85" stroke="white" stroke-width="5" stroke-linecap="round"/>
  
  <!-- Monitor Base -->
  <line x1="40" y1="85" x2="70" y2="85" stroke="white" stroke-width="5" stroke-linecap="round"/>
  
  <!-- Play Icon -->
  <polygon points="48,45 48,63 65,54" fill="white"/>
  
  <!-- Text: B.One -->
  <text x="115" y="70" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="42" font-weight="bold" fill="white">B.One</text>
  
  <!-- Text: Player -->
  <text x="115" y="95" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="18" fill="#a78bfa">Player</text>
</svg>`;
    }
    
    // Create downloadable SVG file
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = type === 'bone' ? 'bone-player-logo.svg' : 'beyondwalls-logo.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadEmailSignature = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Signature dimensions (600x250px for better email compatibility)
    canvas.width = 600;
    canvas.height = 220;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 600, 220);
    
    // === Logo Icon ===
    const logoSize = 60;
    const logoX = 20;
    const logoY = 20;
    
    const logoGradient = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
    logoGradient.addColorStop(0, '#8B5CF6');
    logoGradient.addColorStop(1, '#6366F1');
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 12);
    ctx.fillStyle = logoGradient;
    ctx.fill();
    
    // Shadow for logo
    ctx.shadowColor = 'rgba(139, 92, 246, 0.25)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Monitor icon in logo
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.roundRect(logoX + 12, logoY + 12, 36, 26, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(logoX + 30, logoY + 38);
    ctx.lineTo(logoX + 30, logoY + 48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(logoX + 20, logoY + 48);
    ctx.lineTo(logoX + 40, logoY + 48);
    ctx.stroke();
    
    // Play icon
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(logoX + 24, logoY + 18);
    ctx.lineTo(logoX + 24, logoY + 32);
    ctx.lineTo(logoX + 38, logoY + 25);
    ctx.closePath();
    ctx.fill();
    
    // === Vertical Line Separator ===
    const lineX = 100;
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lineX, 20);
    ctx.lineTo(lineX, 200);
    ctx.stroke();
    
    // === Company Name ===
    const contentX = 125;
    let currentY = 40;
    
    // "BeyondWalls" with gradient (brand colors)
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    const textGradient = ctx.createLinearGradient(contentX, 0, contentX + 200, 0);
    textGradient.addColorStop(0, '#8B5CF6');
    textGradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = textGradient;
    ctx.fillText('BeyondWalls', contentX, currentY);
    
    // === Tagline ===
    currentY += 18;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('A Linkzone Global FZ Company', contentX, currentY);
    
    // === Contact Information ===
    currentY += 30;
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#334155';
    
    // Phone
    ctx.fillText('Phone: +971 55 614 0067', contentX, currentY);
    
    // Web
    currentY += 20;
    ctx.fillText('Web: www.beyondwalls.ae', contentX, currentY);
    
    // Address
    currentY += 20;
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Address: in5 Tech - Dubai Internet City', contentX, currentY);
    currentY += 16;
    ctx.fillText('Dubai, United Arab Emirates', contentX, currentY);
    
    // === Social Media Icons ===
    currentY += 30;
    const iconSize = 24;
    const iconSpacing = 32;
    let iconX = contentX;
    
    // Facebook (blue)
    ctx.fillStyle = '#1877f2';
    ctx.beginPath();
    ctx.roundRect(iconX, currentY, iconSize, iconSize, 4);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px system-ui';
    ctx.fillText('f', iconX + 8, currentY + 18);
    
    // LinkedIn (blue)
    iconX += iconSpacing;
    ctx.fillStyle = '#0077b5';
    ctx.beginPath();
    ctx.roundRect(iconX, currentY, iconSize, iconSize, 4);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '11px system-ui';
    ctx.fillText('in', iconX + 6, currentY + 16);
    
    // Instagram (gradient - using solid purple for simplicity)
    iconX += iconSpacing;
    ctx.fillStyle = '#e4405f';
    ctx.beginPath();
    ctx.roundRect(iconX, currentY, iconSize, iconSize, 4);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText('ig', iconX + 5, currentY + 17);
    
    // X/Twitter (black)
    iconX += iconSpacing;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(iconX, currentY, iconSize, iconSize, 4);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px system-ui';
    ctx.fillText('𝕏', iconX + 6, currentY + 18);
    
    // YouTube (red)
    iconX += iconSpacing;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.roundRect(iconX, currentY, iconSize, iconSize, 4);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px system-ui';
    ctx.fillText('▶', iconX + 6, currentY + 17);
    
    // Download as PNG
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'beyondwalls-email-signature.png';
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const downloadBrochure = (side) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // A4 size at 300 DPI: 2480 x 3508 pixels (portrait)
    canvas.width = 2480;
    canvas.height = 3508;
    
    if (side === 'front') {
      // === FRONT SIDE ===
      // Gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 2480, 3508);
      bgGradient.addColorStop(0, '#0f0a1e');
      bgGradient.addColorStop(0.3, '#1a1035');
      bgGradient.addColorStop(0.7, '#2d1b69');
      bgGradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 2480, 3508);
      
      // Decorative circles
      ctx.globalAlpha = 0.08;
      const circle1 = ctx.createRadialGradient(1900, 600, 0, 1900, 600, 800);
      circle1.addColorStop(0, '#8B5CF6');
      circle1.addColorStop(1, 'transparent');
      ctx.fillStyle = circle1;
      ctx.beginPath();
      ctx.arc(1900, 600, 800, 0, Math.PI * 2);
      ctx.fill();
      
      const circle2 = ctx.createRadialGradient(400, 2800, 0, 400, 2800, 700);
      circle2.addColorStop(0, '#6366F1');
      circle2.addColorStop(1, 'transparent');
      ctx.fillStyle = circle2;
      ctx.beginPath();
      ctx.arc(400, 2800, 700, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Logo at top
      const logoSize = 280;
      const logoX = (2480 - logoSize) / 2;
      const logoY = 300;
      const logoGradient = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
      logoGradient.addColorStop(0, '#8B5CF6');
      logoGradient.addColorStop(1, '#6366F1');
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 60);
      ctx.fillStyle = logoGradient;
      ctx.fill();
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 80;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Monitor icon in logo
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.roundRect(logoX + 60, logoY + 60, 160, 120, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(logoX + 140, logoY + 180);
      ctx.lineTo(logoX + 140, logoY + 230);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(logoX + 100, logoY + 230);
      ctx.lineTo(logoX + 180, logoY + 230);
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(logoX + 110, logoY + 95);
      ctx.lineTo(logoX + 110, logoY + 155);
      ctx.lineTo(logoX + 170, logoY + 125);
      ctx.closePath();
      ctx.fill();
      
      // Company name
      ctx.textAlign = 'center';
      ctx.font = 'bold 140px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('BeyondWalls', 1240, 740);
      
      // Parent company
      ctx.font = '42px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('A Linkzone Global FZ-LLC Company', 1240, 810);
      
      // Tagline
      ctx.font = 'bold 68px system-ui, -apple-system, sans-serif';
      const taglineGradient = ctx.createLinearGradient(0, 900, 2480, 900);
      taglineGradient.addColorStop(0, '#a78bfa');
      taglineGradient.addColorStop(1, '#6366F1');
      ctx.fillStyle = taglineGradient;
      ctx.fillText('Transform Your Venue', 1240, 1000);
      ctx.fillText('Into Revenue', 1240, 1100);
      
      // Subtitle
      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Digital Out-of-Home Advertising Platform', 1240, 1220);
      
      // Features section
      const features = [
        '📺  Turn Your Screens Into Income',
        '💰  Earn 70% Revenue Share',
        '🎯  AI-Powered Ad Targeting',
        '📊  Real-Time Analytics Dashboard',
        '🌐  UAE\'s Leading DOOH Platform'
      ];
      
      ctx.font = '52px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      let featureY = 1500;
      features.forEach(feature => {
        ctx.fillText(feature, 240, featureY);
        featureY += 120;
      });
      
      // CTA section
      ctx.textAlign = 'center';
      ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Ready to Get Started?', 1240, 2600);
      
      // Contact info
      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText('📧 hello@beyondwalls.ae', 1240, 2730);
      ctx.fillText('📱 +971 55 614 0067', 1240, 2830);
      ctx.fillText('🌐 www.beyondwalls.ae', 1240, 2930);
      
      // Bottom bar
      const bottomGrad = ctx.createLinearGradient(0, 3460, 2480, 3508);
      bottomGrad.addColorStop(0, '#8B5CF6');
      bottomGrad.addColorStop(1, '#6366F1');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, 3460, 2480, 48);
      
    } else {
      // === BACK SIDE ===
      // Clean white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 2480, 3508);
      
      // Top accent bar
      const topGrad = ctx.createLinearGradient(0, 0, 2480, 120);
      topGrad.addColorStop(0, '#8B5CF6');
      topGrad.addColorStop(1, '#6366F1');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 2480, 120);
      
      // Small logo
      const smallLogoSize = 100;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(180, 60, smallLogoSize, smallLogoSize, 20);
      ctx.fill();
      
      const miniLogoGrad = ctx.createLinearGradient(180, 60, 280, 160);
      miniLogoGrad.addColorStop(0, '#8B5CF6');
      miniLogoGrad.addColorStop(1, '#6366F1');
      ctx.fillStyle = miniLogoGrad;
      ctx.beginPath();
      ctx.roundRect(190, 70, 80, 80, 16);
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.roundRect(205, 85, 50, 35, 4);
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('BeyondWalls', 320, 130);
      
      // Main heading
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 96px system-ui, -apple-system, sans-serif';
      ctx.fillText('How It Works', 240, 400);
      
      // Steps
      const steps = [
        { num: '1', title: 'Register Your Venue', desc: 'Sign up and list your business location with us' },
        { num: '2', title: 'Install Screens', desc: 'We help you set up digital displays at your venue' },
        { num: '3', title: 'Ads Go Live', desc: 'Relevant ads automatically play on your screens' },
        { num: '4', title: 'Earn Revenue', desc: 'Get 70% of all ad revenue directly to your account' }
      ];
      
      let stepY = 600;
      steps.forEach(step => {
        // Circle number
        const circleGrad = ctx.createLinearGradient(240, stepY - 50, 340, stepY + 50);
        circleGrad.addColorStop(0, '#8B5CF6');
        circleGrad.addColorStop(1, '#6366F1');
        ctx.fillStyle = circleGrad;
        ctx.beginPath();
        ctx.arc(290, stepY, 70, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(step.num, 290, stepY + 25);
        
        // Step content
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1e1b4b';
        ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
        ctx.fillText(step.title, 420, stepY + 5);
        
        ctx.fillStyle = '#64748b';
        ctx.font = '48px system-ui, -apple-system, sans-serif';
        ctx.fillText(step.desc, 420, stepY + 70);
        
        stepY += 340;
      });
      
      // Why Choose Us section
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 84px system-ui, -apple-system, sans-serif';
      ctx.fillText('Why Choose BeyondWalls?', 240, 2160);
      
      const benefits = [
        '✓ No upfront costs - completely free to join',
        '✓ Passive income from your existing screens',
        '✓ Complete control over your ad slots',
        '✓ Real-time performance analytics',
        '✓ Premium advertisers across UAE',
        '✓ 24/7 technical support'
      ];
      
      ctx.font = '52px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#334155';
      let benefitY = 2320;
      benefits.forEach(benefit => {
        ctx.fillText(benefit, 280, benefitY);
        benefitY += 100;
      });
      
      // Contact section
      const contactBg = ctx.createLinearGradient(0, 3000, 2480, 3200);
      contactBg.addColorStop(0, '#f8f9fa');
      contactBg.addColorStop(1, '#e9ecef');
      ctx.fillStyle = contactBg;
      ctx.fillRect(0, 3000, 2480, 340);
      
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Get In Touch', 1240, 3100);
      
      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('📧 hello@beyondwalls.ae  |  📱 +971 55 614 0067  |  🌐 www.beyondwalls.ae', 1240, 3200);
      
      ctx.font = '36px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('in5 Tech - Dubai Internet City, Dubai, UAE', 1240, 3270);
      
      // Bottom bar
      const bottomGrad = ctx.createLinearGradient(0, 3460, 2480, 3508);
      bottomGrad.addColorStop(0, '#8B5CF6');
      bottomGrad.addColorStop(1, '#6366F1');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, 3460, 2480, 48);
    }
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beyondwalls-brochure-${side}.png`;
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
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => downloadCurrentLogo('bone')}>
                    <Download className="w-3 h-3 mr-1" /> PNG
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsPDF('bone')}>
                    <FileText className="w-3 h-3 mr-1" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsSVG('bone')} className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    <FileImage className="w-3 h-3 mr-1" /> SVG/AI
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

        {/* Email Signature Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-violet-600" />
              Email Signature Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Email Signature Preview */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-2xl p-8 border border-slate-200 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative flex items-start gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 ring-2 ring-violet-100">
                      <MonitorPlay className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 border-l-2 border-violet-500 pl-6">
                    {/* Company Name with gradient */}
                    <div className="mb-3">
                      <h3 className="text-2xl font-bold mb-0 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        BeyondWalls
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">A Linkzone Global FZ-LLC Company</p>
                    </div>
                    
                    {/* Contact Information with improved styling */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-violet-100 rounded flex items-center justify-center flex-shrink-0">
                          <Phone className="w-3 h-3 text-violet-600" />
                        </div>
                        <span className="text-slate-700 font-medium">+971 55 614 0067</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                          <Globe className="w-3 h-3 text-indigo-600" />
                        </div>
                        <a href="https://www.beyondwalls.ae" className="text-violet-600 hover:text-indigo-600 font-medium hover:underline transition-colors">
                          www.beyondwalls.ae
                        </a>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-violet-100 rounded flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3 h-3 text-violet-600" />
                        </div>
                        <span className="text-slate-600 text-xs leading-relaxed">
                          in5 Tech - Dubai Internet City, Dubai, UAE
                        </span>
                      </div>
                    </div>
                    
                    {/* Social Media Icons with hover effects */}
                    <div className="flex gap-2 mt-4">
                      <a href="https://www.facebook.com/beyondwallsae" className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs hover:scale-110 hover:shadow-lg transition-all">
                        f
                      </a>
                      <a href="https://www.linkedin.com/company/beyondwallsae" className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center text-white text-xs hover:scale-110 hover:shadow-lg transition-all">
                        in
                      </a>
                      <a href="https://www.instagram.com/beyondwallsae" className="w-7 h-7 bg-gradient-to-br from-purple-600 to-pink-600 rounded-md flex items-center justify-center text-white text-xs hover:scale-110 hover:shadow-lg transition-all">
                        ig
                      </a>
                      <a href="https://x.com/BeyondWallsae" className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white text-xs hover:scale-110 hover:shadow-lg transition-all">
                        𝕏
                      </a>
                      <a href="https://www.youtube.com/@BeyondWallsAE" className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center text-white text-xs hover:scale-110 hover:shadow-lg transition-all">
                        ▶
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Download Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={downloadEmailSignature}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Email Signature (PNG)
                </Button>
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">How to Add to Gmail:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Download the signature image using the button above</li>
                  <li>Open Gmail → Settings → See all settings</li>
                  <li>Scroll to "Signature" section</li>
                  <li>Click the image icon and upload the downloaded signature</li>
                  <li>Click "Save Changes" at the bottom</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brochure Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              BeyondWalls Brochure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Side Selector */}
              <Tabs defaultValue="front">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="front">Front Side</TabsTrigger>
                  <TabsTrigger value="back">Back Side</TabsTrigger>
                </TabsList>

                <TabsContent value="front">
                  <BrochureFrontPreview />
                  <div className="flex justify-center mt-6">
                    <Button 
                      onClick={() => downloadBrochure('front')}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Front Side (PNG)
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="back">
                  <BrochureBackPreview />
                  <div className="flex justify-center mt-6">
                    <Button 
                      onClick={() => downloadBrochure('back')}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Back Side (PNG)
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
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
                  onDownload={(side) => downloadBusinessCardCreative("ceo", ceoCard, side)}
                />
              </TabsContent>

              <TabsContent value="coo">
                <BusinessCardCreative
                  cardData={cooCard}
                  cardType="coo"
                  onEdit={() => setEditingCard("coo")}
                  onDownload={(side) => downloadBusinessCardCreative("coo", cooCard, side)}
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

  function downloadBusinessCardCreative(role, cardData, side = 'front') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 450;
    
    if (side === 'back') {
      // === BACK SIDE DESIGN ===
      // Dark elegant background
      const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
      bgGradient.addColorStop(0, '#0f0a1e');
      bgGradient.addColorStop(0.5, '#1a1035');
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 800, 450);
      
      // Geometric pattern overlay
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 12; j++) {
          ctx.strokeStyle = '#8B5CF6';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(i * 45, j * 45);
          ctx.lineTo(i * 45 + 30, j * 45 + 30);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      
      // Large decorative circles
      ctx.globalAlpha = 0.08;
      const circleGrad1 = ctx.createRadialGradient(650, 100, 0, 650, 100, 200);
      circleGrad1.addColorStop(0, '#8B5CF6');
      circleGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = circleGrad1;
      ctx.beginPath();
      ctx.arc(650, 100, 200, 0, Math.PI * 2);
      ctx.fill();
      
      const circleGrad2 = ctx.createRadialGradient(150, 380, 0, 150, 380, 180);
      circleGrad2.addColorStop(0, '#6366F1');
      circleGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = circleGrad2;
      ctx.beginPath();
      ctx.arc(150, 380, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Center logo large
      const logoSize = 120;
      const logoX = (800 - logoSize) / 2;
      const logoY = 100;
      
      const logoGradient = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
      logoGradient.addColorStop(0, '#8B5CF6');
      logoGradient.addColorStop(1, '#6366F1');
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 28);
      ctx.fillStyle = logoGradient;
      ctx.fill();
      
      // Shadow for logo
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 28);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Monitor icon
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.roundRect(logoX + 25, logoY + 25, 70, 50, 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(logoX + 60, logoY + 75);
      ctx.lineTo(logoX + 60, logoY + 95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(logoX + 40, logoY + 95);
      ctx.lineTo(logoX + 80, logoY + 95);
      ctx.stroke();
      
      // Play icon
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(logoX + 48, logoY + 40);
      ctx.lineTo(logoX + 48, logoY + 65);
      ctx.lineTo(logoX + 75, logoY + 52);
      ctx.closePath();
      ctx.fill();
      
      // Company name centered
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('BeyondWalls', 400, 280);
      
      // Tagline
      ctx.font = '18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Digital Out-of-Home Advertising', 400, 315);
      
      // Decorative line
      const lineGrad = ctx.createLinearGradient(200, 0, 600, 0);
      lineGrad.addColorStop(0, 'transparent');
      lineGrad.addColorStop(0.2, '#8B5CF6');
      lineGrad.addColorStop(0.8, '#6366F1');
      lineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 340);
      ctx.lineTo(600, 340);
      ctx.stroke();
      
      // Website
      ctx.font = '16px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('www.beyondwalls.ae', 400, 380);
      
      // Social icons row
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px system-ui';
      ctx.fillText('LinkedIn  •  Instagram  •  Twitter', 400, 415);
      
      ctx.textAlign = 'left';
      
      // Corner accents
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 3;
      // Top left
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.lineTo(20, 20);
      ctx.lineTo(50, 20);
      ctx.stroke();
      // Top right
      ctx.beginPath();
      ctx.moveTo(750, 20);
      ctx.lineTo(780, 20);
      ctx.lineTo(780, 50);
      ctx.stroke();
      // Bottom left
      ctx.beginPath();
      ctx.moveTo(20, 400);
      ctx.lineTo(20, 430);
      ctx.lineTo(50, 430);
      ctx.stroke();
      // Bottom right
      ctx.beginPath();
      ctx.moveTo(750, 430);
      ctx.lineTo(780, 430);
      ctx.lineTo(780, 400);
      ctx.stroke();
      
    } else {
      // === FRONT SIDE DESIGN ===
      // Background gradient matching brand colors
      const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
      bgGradient.addColorStop(0, '#1e1b4b');
      bgGradient.addColorStop(0.5, '#312e81');
      bgGradient.addColorStop(1, '#4c1d95');
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
      
      // Left accent bar - brand colors
      const accentGradient = ctx.createLinearGradient(0, 0, 0, 450);
      accentGradient.addColorStop(0, '#8B5CF6');
      accentGradient.addColorStop(1, '#6366F1');
      ctx.fillStyle = accentGradient;
      ctx.fillRect(0, 0, 10, 450);
      
      // Logo icon background - brand colors
      const logoGradient = ctx.createLinearGradient(40, 35, 110, 105);
      logoGradient.addColorStop(0, '#8B5CF6');
      logoGradient.addColorStop(1, '#6366F1');
      ctx.beginPath();
      ctx.roundRect(40, 35, 70, 70, 16);
      ctx.fillStyle = logoGradient;
      ctx.fill();
      
      // Glow effect
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(40, 35, 70, 70, 16);
      ctx.fill();
      ctx.shadowBlur = 0;
      
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
      
      // Parent company
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('A Linkzone Global FZ-LLC Company', 125, 118);
      
      // Divider line
      const lineGradient = ctx.createLinearGradient(40, 0, 760, 0);
      lineGradient.addColorStop(0, '#8B5CF6');
      lineGradient.addColorStop(1, '#6366F1');
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 135);
      ctx.lineTo(760, 135);
      ctx.stroke();
      
      // Name with glow
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 25;
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(cardData.name, 40, 195);
      ctx.shadowBlur = 0;
      
      // Title badge - brand colors
      const titleGradient = ctx.createLinearGradient(40, 210, 300, 240);
      titleGradient.addColorStop(0, '#8B5CF6');
      titleGradient.addColorStop(1, '#6366F1');
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
      ctx.fillText('✉️  ' + cardData.email, 40, 295);
      ctx.fillText('📱  ' + cardData.phone, 40, 325);
      ctx.fillText('🌐  www.beyondwalls.ae', 40, 355);
      ctx.fillText('📍  Dubai, United Arab Emirates', 40, 385);
      
      // QR code area
      const qrGradient = ctx.createLinearGradient(580, 260, 760, 400);
      qrGradient.addColorStop(0, '#8B5CF6');
      qrGradient.addColorStop(1, '#6366F1');
      ctx.strokeStyle = qrGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(590, 260, 160, 140, 12);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.roundRect(593, 263, 154, 134, 10);
      ctx.fill();
      
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
      
      // Bottom bar - brand colors
      const bottomGradient = ctx.createLinearGradient(0, 440, 800, 450);
      bottomGradient.addColorStop(0, '#8B5CF6');
      bottomGradient.addColorStop(1, '#6366F1');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, 440, 800, 10);
    }
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beyondwalls-${role}-${side}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }
}

function BrochureFrontPreview() {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-12 shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl" />
      
      <div className="relative text-center space-y-8">
        {/* Logo */}
        <div className="w-32 h-32 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/30">
          <MonitorPlay className="w-16 h-16 text-white" />
        </div>
        
        {/* Title */}
        <div>
          <h1 className="text-6xl font-black text-white mb-3">BeyondWalls</h1>
          <p className="text-white/60 text-lg">A Linkzone Global FZ-LLC Company</p>
        </div>
        
        <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          Transform Your Venue<br/>Into Revenue
        </h2>
        
        <p className="text-xl text-white/70">Digital Out-of-Home Advertising Platform</p>
        
        {/* Features */}
        <div className="grid gap-4 text-left max-w-2xl mx-auto mt-12">
          {['Turn Your Screens Into Income', 'Earn 70% Revenue Share', 'AI-Powered Ad Targeting', 'Real-Time Analytics', 'UAE\'s Leading DOOH Platform'].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 bg-violet-500 rounded-full" />
              <span className="text-lg">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="mt-12 space-y-4">
          <p className="text-2xl font-bold text-white">Ready to Get Started?</p>
          <div className="space-y-2 text-white/80">
            <p>📧 hello@beyondwalls.ae</p>
            <p>📱 +971 55 614 0067</p>
            <p>🌐 www.beyondwalls.ae</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrochureBackPreview() {
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Top bar */}
      <div className="h-16 bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <MonitorPlay className="w-6 h-6 text-violet-600" />
          </div>
          <span className="text-2xl font-bold text-white">BeyondWalls</span>
        </div>
      </div>
      
      <div className="p-12 space-y-10">
        {/* How it works */}
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-8">How It Works</h2>
          <div className="space-y-6">
            {[
              { num: '1', title: 'Register Your Venue', desc: 'Sign up and list your business location' },
              { num: '2', title: 'Install Screens', desc: 'We help setup digital displays' },
              { num: '3', title: 'Ads Go Live', desc: 'Relevant ads play automatically' },
              { num: '4', title: 'Earn Revenue', desc: '70% revenue directly to you' }
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Benefits */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Choose BeyondWalls?</h2>
          <div className="grid gap-3 text-slate-700">
            {[
              'No upfront costs - free to join',
              'Passive income from screens',
              'Control over your ad slots',
              'Real-time analytics',
              'Premium UAE advertisers',
              '24/7 technical support'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contact */}
        <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Get In Touch</h3>
          <div className="space-y-2 text-slate-600">
            <p>📧 hello@beyondwalls.ae  |  📱 +971 55 614 0067</p>
            <p>🌐 www.beyondwalls.ae</p>
            <p className="text-sm">in5 Tech - Dubai Internet City, Dubai, UAE</p>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="h-8 bg-gradient-to-r from-violet-600 to-indigo-600" />
    </div>
  );
}

function BusinessCardCreative({ cardData, cardType, onEdit, onDownload }) {
  const [showBack, setShowBack] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Card Side Toggle */}
      <div className="flex justify-center gap-2">
        <Button 
          variant={!showBack ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowBack(false)}
          className={!showBack ? "bg-gradient-to-r from-violet-600 to-indigo-600" : ""}
        >
          Front Side
        </Button>
        <Button 
          variant={showBack ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowBack(true)}
          className={showBack ? "bg-gradient-to-r from-violet-600 to-indigo-600" : ""}
        >
          Back Side
        </Button>
      </div>

      {!showBack ? (
        /* FRONT SIDE PREVIEW */
        <div className="relative rounded-2xl shadow-2xl overflow-hidden max-w-xl mx-auto bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/4 translate-x-1/4" />
          
          {/* Left accent - brand colors */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-violet-500 to-indigo-600" />
          
          <div className="relative p-6">
            {/* Header with logo */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <MonitorPlay className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl text-white">
                  BeyondWalls
                </span>
                <p className="text-xs text-white/50">A Linkzone Global FZ-LLC Company</p>
                <p className="text-sm text-white/60">Digital Out-of-Home Advertising</p>
              </div>
            </div>
            
            {/* Person info */}
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{cardData.name}</h3>
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full text-white text-sm font-semibold shadow-lg">
                {cardData.title}
              </span>
            </div>
            
            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs sm:text-sm truncate">{cardData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-xs sm:text-sm">{cardData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs sm:text-sm">www.beyondwalls.ae</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-xs sm:text-sm">Dubai, UAE</span>
              </div>
            </div>
          </div>
          
          {/* Bottom bar - brand colors */}
          <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-600" />
        </div>
      ) : (
        /* BACK SIDE PREVIEW */
        <div className="relative rounded-2xl shadow-2xl overflow-hidden max-w-xl mx-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 min-h-[280px]">
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-px h-full bg-violet-500" style={{ left: `${i * 8.33}%`, transform: 'rotate(45deg)' }} />
            ))}
          </div>
          
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl" />
          
          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-violet-500/50" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-violet-500/50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-violet-500/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-violet-500/50" />
          
          <div className="relative p-8 flex flex-col items-center justify-center min-h-[280px]">
            {/* Large centered logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-6">
              <MonitorPlay className="w-12 h-12 text-white" />
            </div>
            
            {/* Company name */}
            <h2 className="text-4xl font-bold text-white mb-2">BeyondWalls</h2>
            <p className="text-white/50 mb-6">Digital Out-of-Home Advertising</p>
            
            {/* Decorative line */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent mb-6" />
            
            {/* Website */}
            <p className="text-violet-400 font-medium">www.beyondwalls.ae</p>
            
            {/* Social links */}
            <p className="text-white/40 text-sm mt-4">LinkedIn • Instagram • Twitter</p>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button onClick={onEdit} variant="outline" className="border-violet-300">
          <CreditCard className="w-4 h-4 mr-2" />
          Edit Details
        </Button>
        <Button onClick={() => onDownload('front')} className="bg-gradient-to-r from-violet-600 to-indigo-600">
          <Download className="w-4 h-4 mr-2" />
          Download Front
        </Button>
        <Button onClick={() => onDownload('back')} variant="outline" className="border-violet-300">
          <Download className="w-4 h-4 mr-2" />
          Download Back
        </Button>
      </div>
    </div>
  );
}