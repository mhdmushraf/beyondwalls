import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, RefreshCw, MonitorPlay, Sparkles, FileText, CreditCard, Mail, Phone, Globe, MapPin, FileImage, BookOpen, DollarSign, Target, BarChart3, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";

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
    
    // Tri-fold brochure: 290mm x 200mm at 300 DPI = 3425 x 2362 pixels (landscape)
    canvas.width = 3425;
    canvas.height = 2362;
    
    if (side === 'front') {
      // === FRONT SIDE - CREATIVE TRI-FOLD ===
      const panelWidth = 1141;
      
      // PANEL 1 (Left/Cover) - Vibrant Cyan with Creative Elements
      const panel1Gradient = ctx.createLinearGradient(0, 0, panelWidth, 2362);
      panel1Gradient.addColorStop(0, '#06b6d4');
      panel1Gradient.addColorStop(0.5, '#0891b2');
      panel1Gradient.addColorStop(1, '#0e7490');
      ctx.fillStyle = panel1Gradient;
      ctx.fillRect(0, 0, panelWidth, 2362);
      
      // Modern wave pattern overlay
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 250);
        for (let x = 0; x < panelWidth; x += 50) {
          ctx.lineTo(x, i * 250 + Math.sin(x / 80) * 40);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      
      // Large creative logo with shadow
      const logoSize = 280;
      const logoX = (panelWidth - logoSize) / 2;
      const logoY = 350;
      
      // Shadow layers for depth
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetX = 15;
      ctx.shadowOffsetY = 15;
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 50);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Inner gradient logo
      const innerLogoGrad = ctx.createLinearGradient(logoX + 20, logoY + 20, logoX + 260, logoY + 260);
      innerLogoGrad.addColorStop(0, '#8B5CF6');
      innerLogoGrad.addColorStop(0.5, '#7c3aed');
      innerLogoGrad.addColorStop(1, '#6366F1');
      ctx.fillStyle = innerLogoGrad;
      ctx.beginPath();
      ctx.roundRect(logoX + 20, logoY + 20, 240, 240, 40);
      ctx.fill();
      
      // Monitor icon
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.roundRect(logoX + 75, logoY + 75, 130, 95, 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(logoX + 140, logoY + 170);
      ctx.lineTo(logoX + 140, logoY + 215);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(logoX + 100, logoY + 215);
      ctx.lineTo(logoX + 180, logoY + 215);
      ctx.stroke();
      
      // Play triangle
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(logoX + 115, logoY + 100);
      ctx.lineTo(logoX + 115, logoY + 150);
      ctx.lineTo(logoX + 170, logoY + 125);
      ctx.closePath();
      ctx.fill();
      
      // Company name with modern styling
      ctx.textAlign = 'center';
      ctx.font = 'bold 120px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('BeyondWalls', panelWidth / 2, 750);
      
      // Stylish underline
      const underlineGrad = ctx.createLinearGradient(200, 780, 940, 780);
      underlineGrad.addColorStop(0, 'transparent');
      underlineGrad.addColorStop(0.2, '#0f172a');
      underlineGrad.addColorStop(0.8, '#0f172a');
      underlineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = underlineGrad;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(200, 780);
      ctx.lineTo(940, 780);
      ctx.stroke();
      
      // Parent company
      ctx.font = '38px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(15,23,42,0.7)';
      ctx.fillText('A Linkzone Global FZ-LLC Company', panelWidth / 2, 850);
      
      // Modern value props with cards
      const valueProps = [
        { title: 'Digital DOOH', subtitle: 'Advertising Platform' },
        { title: 'Transform Screens', subtitle: 'Into Revenue Streams' },
      ];
      
      ctx.textAlign = 'center';
      let propY = 1000;
      valueProps.forEach(prop => {
        // Card background with gradient
        const cardGrad = ctx.createLinearGradient(150, propY, 990, propY + 180);
        cardGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        cardGrad.addColorStop(1, 'rgba(255,255,255,0.85)');
        ctx.fillStyle = cardGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        ctx.beginPath();
        ctx.roundRect(150, propY, 840, 180, 25);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Text
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
        ctx.fillText(prop.title, panelWidth / 2, propY + 80);
        ctx.font = '42px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(prop.subtitle, panelWidth / 2, propY + 135);
        
        propY += 240;
      });
      
      // CTA Badge at bottom
      const ctaY = 1750;
      const ctaGrad = ctx.createLinearGradient(200, ctaY, 940, ctaY + 140);
      ctaGrad.addColorStop(0, '#0f172a');
      ctaGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = ctaGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 15;
      ctx.beginPath();
      ctx.roundRect(200, ctaY, 740, 140, 30);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.textAlign = 'center';
      ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Get Started Today', panelWidth / 2, ctaY + 65);
      ctx.font = '36px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText('www.beyondwalls.ae', panelWidth / 2, ctaY + 115);
      
      // PANEL 2 (Middle) - Modern Dark Design
      const panel2Gradient = ctx.createLinearGradient(panelWidth, 0, panelWidth * 2, 2362);
      panel2Gradient.addColorStop(0, '#0f172a');
      panel2Gradient.addColorStop(0.5, '#1e293b');
      panel2Gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = panel2Gradient;
      ctx.fillRect(panelWidth, 0, panelWidth, 2362);
      
      // Geometric pattern overlay
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 10; j++) {
          const x = panelWidth + i * 80;
          const y = j * 240;
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 60, y + 60);
          ctx.lineTo(x, y + 60);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      
      // Content header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 90px system-ui, -apple-system, sans-serif';
      ctx.fillText('Why Choose', panelWidth + panelWidth / 2, 250);
      ctx.fillText('BeyondWalls?', panelWidth + panelWidth / 2, 360);
      
      // Decorative line
      const midLineGrad = ctx.createLinearGradient(panelWidth + 150, 400, panelWidth + 990, 400);
      midLineGrad.addColorStop(0, 'transparent');
      midLineGrad.addColorStop(0.5, '#06b6d4');
      midLineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = midLineGrad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(panelWidth + 150, 400);
      ctx.lineTo(panelWidth + 990, 400);
      ctx.stroke();
      
      // Benefits with icons
      const benefits = [
        { icon: '💰', title: '70% Revenue Share', desc: 'Keep majority of earnings' },
        { icon: '🎯', title: 'AI-Powered Targeting', desc: 'Smart ad placements' },
        { icon: '📊', title: 'Live Analytics', desc: 'Track performance 24/7' },
        { icon: '🚀', title: 'Zero Upfront Cost', desc: 'Free to get started' },
        { icon: '🌐', title: "UAE's #1 Platform", desc: '500+ trusted venues' },
        { icon: '⚡', title: 'Quick Setup', desc: 'Live in 48 hours' }
      ];
      
      let benefitY = 520;
      ctx.textAlign = 'left';
      benefits.forEach((benefit, idx) => {
        // Card background
        ctx.fillStyle = 'rgba(6,182,212,0.1)';
        ctx.beginPath();
        ctx.roundRect(panelWidth + 120, benefitY - 45, 900, 120, 20);
        ctx.fill();
        
        // Icon circle
        const iconGrad = ctx.createLinearGradient(panelWidth + 150, benefitY - 30, panelWidth + 230, benefitY + 50);
        iconGrad.addColorStop(0, '#06b6d4');
        iconGrad.addColorStop(1, '#0891b2');
        ctx.fillStyle = iconGrad;
        ctx.beginPath();
        ctx.arc(panelWidth + 190, benefitY + 10, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '48px system-ui';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(benefit.icon, panelWidth + 190, benefitY + 25);
        
        // Text
        ctx.textAlign = 'left';
        ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(benefit.title, panelWidth + 270, benefitY);
        ctx.font = '34px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(benefit.desc, panelWidth + 270, benefitY + 48);
        
        benefitY += 300;
      });
      
      // PANEL 3 (Right) - Contact Panel
      const panel3Gradient = ctx.createLinearGradient(panelWidth * 2, 0, panelWidth * 3, 2362);
      panel3Gradient.addColorStop(0, '#0891b2');
      panel3Gradient.addColorStop(0.5, '#06b6d4');
      panel3Gradient.addColorStop(1, '#0891b2');
      ctx.fillStyle = panel3Gradient;
      ctx.fillRect(panelWidth * 2, 0, panelWidth, 2362);
      
      // Modern circle pattern
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 6; j++) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(panelWidth * 2 + 150 + i * 130, 200 + j * 350, 40, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      
      // Contact header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 90px system-ui, -apple-system, sans-serif';
      ctx.fillText('Get in Touch', panelWidth * 2 + panelWidth / 2, 300);
      
      // Contact cards with icon codes
      const contacts = [
        { icon: 'mail', label: 'Email', value: 'hello@beyondwalls.ae' },
        { icon: 'phone', label: 'Phone', value: '+971 55 614 0067' },
        { icon: 'globe', label: 'Website', value: 'www.beyondwalls.ae' },
        { icon: 'map-pin', label: 'Location', value: 'in5 Tech, Dubai Internet City\nDubai, UAE' }
      ];
      
      let contactY = 480;
      contacts.forEach(contact => {
        // Card background
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 10;
        ctx.beginPath();
        ctx.roundRect(panelWidth * 2 + 120, contactY, 900, contact.label === 'Location' ? 180 : 140, 25);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Icon circle background
        const iconGrad = ctx.createLinearGradient(panelWidth * 2 + 160, contactY + 50, panelWidth * 2 + 220, contactY + 110);
        iconGrad.addColorStop(0, '#06b6d4');
        iconGrad.addColorStop(1, '#0891b2');
        ctx.fillStyle = iconGrad;
        ctx.beginPath();
        ctx.arc(panelWidth * 2 + 190, contactY + 80, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon - draw simplified icon using canvas
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (contact.icon === 'mail') {
          // Envelope
          ctx.beginPath();
          ctx.roundRect(panelWidth * 2 + 170, contactY + 68, 40, 26, 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(panelWidth * 2 + 170, contactY + 68);
          ctx.lineTo(panelWidth * 2 + 190, contactY + 83);
          ctx.lineTo(panelWidth * 2 + 210, contactY + 68);
          ctx.stroke();
        } else if (contact.icon === 'phone') {
          // Phone
          ctx.beginPath();
          ctx.roundRect(panelWidth * 2 + 175, contactY + 65, 30, 32, 4);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(panelWidth * 2 + 190, contactY + 91, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (contact.icon === 'globe') {
          // Globe
          ctx.beginPath();
          ctx.arc(panelWidth * 2 + 190, contactY + 80, 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(panelWidth * 2 + 190, contactY + 80, 7, 18, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(panelWidth * 2 + 172, contactY + 80);
          ctx.lineTo(panelWidth * 2 + 208, contactY + 80);
          ctx.stroke();
        } else if (contact.icon === 'map-pin') {
          // Map pin
          ctx.beginPath();
          ctx.moveTo(panelWidth * 2 + 190, contactY + 95);
          ctx.lineTo(panelWidth * 2 + 190, contactY + 85);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(panelWidth * 2 + 190, contactY + 75, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(panelWidth * 2 + 190, contactY + 75, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Label
        ctx.textAlign = 'left';
        ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(contact.label, panelWidth * 2 + 260, contactY + 60);
        
        // Value
        ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
        if (contact.label === 'Location') {
          const lines = contact.value.split('\n');
          ctx.fillText(lines[0], panelWidth * 2 + 260, contactY + 105);
          ctx.fillText(lines[1], panelWidth * 2 + 260, contactY + 150);
        } else {
          ctx.fillText(contact.value, panelWidth * 2 + 260, contactY + 105);
        }
        
        contactY += contact.label === 'Location' ? 240 : 200;
      });
      
      // QR Code with actual scannable code
      const qrY = 1750;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      ctx.beginPath();
      ctx.roundRect(panelWidth * 2 + 320, qrY, 500, 500, 30);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Create actual QR code image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://www.beyondwalls.ae/Onboarding';
      qrImg.onload = () => {
        ctx.drawImage(qrImg, panelWidth * 2 + 370, qrY + 50, 400, 400);
      };

      // QR label
      ctx.textAlign = 'center';
      ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Scan to Get Started', panelWidth * 2 + panelWidth / 2, qrY + 580);
      
    } else {
      // === BACK SIDE - TRI-FOLD ===
      const panelWidth = 1141;
      
      // PANEL 1 (Left) - White with modern styling
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, panelWidth, 2362);
      
      // Decorative top bar
      const topAccent = ctx.createLinearGradient(0, 0, panelWidth, 20);
      topAccent.addColorStop(0, '#06b6d4');
      topAccent.addColorStop(0.5, '#0891b2');
      topAccent.addColorStop(1, '#06b6d4');
      ctx.fillStyle = topAccent;
      ctx.fillRect(0, 0, panelWidth, 20);
      
      // Header title
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 90px system-ui, -apple-system, sans-serif';
      ctx.fillText('How It', 120, 180);
      ctx.fillText('Works', 120, 280);
      
      // Decorative accent line
      const accentLineGrad = ctx.createLinearGradient(120, 320, 400, 320);
      accentLineGrad.addColorStop(0, '#06b6d4');
      accentLineGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = accentLineGrad;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(120, 320);
      ctx.lineTo(400, 320);
      ctx.stroke();
      
      // Steps with modern cards
      const steps = [
        { num: '1', title: 'Register', desc: 'Quick signup' },
        { num: '2', title: 'Setup', desc: 'Install display' },
        { num: '3', title: 'Go Live', desc: 'Ads start' },
        { num: '4', title: 'Earn', desc: 'Get paid' }
      ];
      
      let stepY = 450;
      steps.forEach((step, idx) => {
        // Step card
        ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.08)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 5;
        ctx.beginPath();
        ctx.roundRect(120, stepY, 900, 180, 20);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Number badge
        const numGrad = ctx.createLinearGradient(160, stepY + 40, 260, stepY + 140);
        numGrad.addColorStop(0, '#06b6d4');
        numGrad.addColorStop(1, '#0891b2');
        ctx.fillStyle = numGrad;
        ctx.beginPath();
        ctx.arc(210, stepY + 90, 55, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(step.num, 210, stepY + 110);
        
        // Title and desc
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
        ctx.fillText(step.title, 300, stepY + 80);
        ctx.fillStyle = '#64748b';
        ctx.font = '38px system-ui, -apple-system, sans-serif';
        ctx.fillText(step.desc, 300, stepY + 130);
        
        stepY += 230;
      });
      
      // CTA section at bottom
      const ctaCard = ctx.createLinearGradient(120, 1800, 1020, 1950);
      ctaCard.addColorStop(0, '#0f172a');
      ctaCard.addColorStop(1, '#1e293b');
      ctx.fillStyle = ctaCard;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 12;
      ctx.beginPath();
      ctx.roundRect(120, 1800, 900, 150, 25);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 58px system-ui, -apple-system, sans-serif';
      ctx.fillText('Start Earning', panelWidth / 2, 1870);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillText('Sign Up Now', panelWidth / 2, 1925);
      
      // PANEL 2 (Middle) - Stats Panel
      const panel2BgGrad = ctx.createLinearGradient(panelWidth, 0, panelWidth * 2, 2362);
      panel2BgGrad.addColorStop(0, '#1e1b4b');
      panel2BgGrad.addColorStop(0.5, '#4c1d95');
      panel2BgGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = panel2BgGrad;
      ctx.fillRect(panelWidth, 0, panelWidth, 2362);
      
      // Top bar accent
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(panelWidth, 0, panelWidth, 20);
      
      // Content
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 100px system-ui, -apple-system, sans-serif';
      ctx.fillText('Start Earning', panelWidth + panelWidth / 2, 300);
      ctx.fillText('From Your', panelWidth + panelWidth / 2, 430);
      ctx.fillText('Screens', panelWidth + panelWidth / 2, 560);
      
      // Big number highlight
      ctx.font = 'bold 80px system-ui, -apple-system, sans-serif';
      const earningHighlight = ctx.createLinearGradient(0, 750, panelWidth * 2, 750);
      earningHighlight.addColorStop(0, '#06b6d4');
      earningHighlight.addColorStop(1, '#0891b2');
      ctx.fillStyle = earningHighlight;
      ctx.fillText('Up to AED 5,000', panelWidth + panelWidth / 2, 750);
      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('per screen / month', panelWidth + panelWidth / 2, 820);
      
      // Stats cards
      const stats = [
        { value: '500+', label: 'Active Venues' },
        { value: '1,200+', label: 'Screens Live' },
        { value: 'AED 2M+', label: 'Paid Out' }
      ];
      
      let statY = 1000;
      stats.forEach(stat => {
        // Card
        ctx.fillStyle = 'rgba(6,182,212,0.15)';
        ctx.beginPath();
        ctx.roundRect(panelWidth + 220, statY, 700, 180, 20);
        ctx.fill();
        
        // Stats
        ctx.font = 'bold 80px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(stat.value, panelWidth + panelWidth / 2, statY + 80);
        ctx.font = '42px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(stat.label, panelWidth + panelWidth / 2, statY + 135);
        
        statY += 240;
      });
      
      // PANEL 3 (Right) - Features
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(panelWidth * 2, 0, panelWidth, 2362);
      
      // Top accent
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(panelWidth * 2, 0, panelWidth, 20);
      
      // Header
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 90px system-ui, -apple-system, sans-serif';
      ctx.fillText('Key', panelWidth * 2 + 120, 180);
      ctx.fillText('Features', panelWidth * 2 + 120, 280);
      
      // Accent line
      const p3AccentLine = ctx.createLinearGradient(panelWidth * 2 + 120, 320, panelWidth * 2 + 500, 320);
      p3AccentLine.addColorStop(0, '#06b6d4');
      p3AccentLine.addColorStop(1, 'transparent');
      ctx.strokeStyle = p3AccentLine;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(panelWidth * 2 + 120, 320);
      ctx.lineTo(panelWidth * 2 + 500, 320);
      ctx.stroke();
      
      // Features list
      const features = [
        { icon: '🎯', title: 'Smart Targeting', desc: 'AI matches ads to audience' },
        { icon: '📊', title: 'Live Dashboard', desc: 'Monitor 24/7' },
        { icon: '💳', title: 'Easy Payouts', desc: 'Weekly transfers' },
        { icon: '🛡️', title: 'Safe Content', desc: 'Pre-approved ads' },
        { icon: '📱', title: 'Mobile Control', desc: 'Manage anywhere' }
      ];
      
      let featureY = 450;
      features.forEach((feature, idx) => {
        // Feature card
        ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.06)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        ctx.roundRect(panelWidth * 2 + 120, featureY, 900, 180, 20);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Icon background
        const iconBg = ctx.createLinearGradient(panelWidth * 2 + 160, featureY + 40, panelWidth * 2 + 260, featureY + 140);
        iconBg.addColorStop(0, '#06b6d4');
        iconBg.addColorStop(1, '#0891b2');
        ctx.fillStyle = iconBg;
        ctx.beginPath();
        ctx.roundRect(panelWidth * 2 + 160, featureY + 40, 100, 100, 18);
        ctx.fill();
        
        // Icon
        ctx.font = '60px system-ui';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(feature.icon, panelWidth * 2 + 210, featureY + 105);
        
        // Text
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
        ctx.fillText(feature.title, panelWidth * 2 + 300, featureY + 80);
        ctx.fillStyle = '#64748b';
        ctx.font = '36px system-ui, -apple-system, sans-serif';
        ctx.fillText(feature.desc, panelWidth * 2 + 300, featureY + 130);
        
        featureY += 240;
      });
      
      // Final CTA
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 70px system-ui, -apple-system, sans-serif';
      ctx.fillText('Ready to', panelWidth * 2 + panelWidth / 2, 1900);
      ctx.fillText('Transform?', panelWidth * 2 + panelWidth / 2, 1990);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillText('www.beyondwalls.ae', panelWidth * 2 + panelWidth / 2, 2070);
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
                  onDownloadPDF={() => downloadBusinessCardPDF("ceo", ceoCard)}
                />
              </TabsContent>

              <TabsContent value="coo">
                <BusinessCardCreative
                  cardData={cooCard}
                  cardType="coo"
                  onEdit={() => setEditingCard("coo")}
                  onDownload={(side) => downloadBusinessCardCreative("coo", cooCard, side)}
                  onDownloadPDF={() => downloadBusinessCardPDF("coo", cooCard)}
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

  function drawBusinessCardFront(ctx, cardData) {
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
    bgGradient.addColorStop(0, '#1e1b4b');
    bgGradient.addColorStop(0.5, '#312e81');
    bgGradient.addColorStop(1, '#4c1d95');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 450);
    
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
    
    const logoGradient = ctx.createLinearGradient(40, 35, 110, 105);
    logoGradient.addColorStop(0, '#8B5CF6');
    logoGradient.addColorStop(1, '#6366F1');
    ctx.beginPath();
    ctx.roundRect(40, 35, 70, 70, 16);
    ctx.fillStyle = logoGradient;
    ctx.fill();
    
    ctx.shadowColor = '#8B5CF6';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(40, 35, 70, 70, 16);
    ctx.fill();
    ctx.shadowBlur = 0;
    
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
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(68, 58);
    ctx.lineTo(68, 72);
    ctx.lineTo(82, 65);
    ctx.closePath();
    ctx.fill();
    
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('BeyondWalls', 125, 62);
    
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('A Linkzone Global FZ-LLC Company', 125, 82);
    
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Digital Out-of-Home Advertising', 125, 100);
    
    const lineGradient = ctx.createLinearGradient(40, 0, 760, 0);
    lineGradient.addColorStop(0, '#8B5CF6');
    lineGradient.addColorStop(1, '#6366F1');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 135);
    ctx.lineTo(760, 135);
    ctx.stroke();
    
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cardData.name, 40, 200);
    
    const titleGradient = ctx.createLinearGradient(40, 220, 300, 260);
    titleGradient.addColorStop(0, '#8B5CF6');
    titleGradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = titleGradient;
    ctx.beginPath();
    ctx.roundRect(40, 220, ctx.measureText(cardData.title).width * 0.65 + 30, 38, 19);
    ctx.fill();
    
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cardData.title, 55, 246);
    
    const leftX = 40;
    const rightX = 420;
    const startY = 310;
    const spacing = 42;
    
    ctx.font = '15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    
    ctx.fillText('✉️  ' + cardData.email, leftX, startY);
    ctx.fillText('🌐  www.beyondwalls.ae', leftX, startY + spacing);
    ctx.fillText('📱  ' + cardData.phone, rightX, startY);
    ctx.fillText('📍  Dubai, UAE', rightX, startY + spacing);
  }

  function drawBusinessCardBack(ctx, cardData, role) {
    const profileUrl = role === 'ceo' 
      ? 'https://www.beyondwalls.ae/CEOProfile'
      : 'https://www.beyondwalls.ae/COOProfile';

    const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
    bgGradient.addColorStop(0, '#0f0a1e');
    bgGradient.addColorStop(0.5, '#1a1035');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 450);
    
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
    
    ctx.shadowColor = '#8B5CF6';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 28);
    ctx.fill();
    ctx.shadowBlur = 0;
    
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
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(logoX + 48, logoY + 40);
    ctx.lineTo(logoX + 48, logoY + 65);
    ctx.lineTo(logoX + 75, logoY + 52);
    ctx.closePath();
    ctx.fill();
    
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('BeyondWalls', 400, 280);
    
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Digital Out-of-Home Advertising', 400, 315);
    
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
    
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('www.beyondwalls.ae', 400, 380);
    
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px system-ui';
    ctx.fillText('LinkedIn  •  Instagram  •  Twitter', 400, 415);
    
    const qrSize = 140;
    const qrX = 590;
    const qrY = 170;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to Connect', qrX + qrSize / 2, qrY + qrSize + 25);
    ctx.textAlign = 'left';
    
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Incubated @', 45, 400);
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('in5', 45, 423);
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Tech Dubai Internet City', 75, 423);
    
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(20, 20);
    ctx.lineTo(50, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(750, 20);
    ctx.lineTo(780, 20);
    ctx.lineTo(780, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 400);
    ctx.lineTo(20, 430);
    ctx.lineTo(50, 430);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(750, 430);
    ctx.lineTo(780, 430);
    ctx.lineTo(780, 400);
    ctx.stroke();
  }

  function downloadBusinessCardPDF(role, cardData) {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98]
    });

    const frontCanvas = document.createElement('canvas');
    const frontCtx = frontCanvas.getContext('2d');
    frontCanvas.width = 800;
    frontCanvas.height = 450;
    
    drawBusinessCardFront(frontCtx, cardData);
    const frontImage = frontCanvas.toDataURL('image/png');
    pdf.addImage(frontImage, 'PNG', 0, 0, 85.6, 53.98);

    pdf.addPage();
    
    const backCanvas = document.createElement('canvas');
    const backCtx = backCanvas.getContext('2d');
    backCanvas.width = 800;
    backCanvas.height = 450;
    
    drawBusinessCardBack(backCtx, cardData, role);
    const backImage = backCanvas.toDataURL('image/png');
    pdf.addImage(backImage, 'PNG', 0, 0, 85.6, 53.98);

    pdf.save(`beyondwalls-${role}-card.pdf`);
  }

  function downloadBusinessCardCreative(role, cardData, side = 'front') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const profileUrl = role === 'ceo' 
      ? 'https://www.beyondwalls.ae/CEOProfile'
      : 'https://www.beyondwalls.ae/COOProfile';
    
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
      
      
      // QR Code - right side with actual QR
      const qrSize = 140;
      const qrX = 590;
      const qrY = 170;

      // QR background with shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 5;
      ctx.beginPath();
      ctx.roundRect(qrX, qrY, qrSize, qrSize, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Load actual QR code - Updated to use beyondwalls.ae instead of www.beyondwalls.ae
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl.replace('www.', ''))}`;
      qrImg.onload = () => {
        ctx.drawImage(qrImg, qrX + 10, qrY + 10, 120, 120);
      };

      // QR label
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText('Scan to Connect', qrX + qrSize / 2, qrY + qrSize + 25);
      ctx.textAlign = 'left';

      // in5 Logo (bottom left corner)
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Incubated @', 45, 400);
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('in5', 45, 423);
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Tech Dubai Internet City', 75, 423);
      
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
      // === FRONT SIDE DESIGN - Matching Screenshot ===
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
      
      // Header section - Logo and company info
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
      ctx.fillText('BeyondWalls', 125, 62);
      
      // Parent company
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('A Linkzone Global FZ-LLC Company', 125, 82);
      
      // Tagline  
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Digital Out-of-Home Advertising', 125, 100);
      
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
      
      // Name
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(cardData.name, 40, 200);
      
      // Title badge - brand colors
      const titleGradient = ctx.createLinearGradient(40, 220, 300, 260);
      titleGradient.addColorStop(0, '#8B5CF6');
      titleGradient.addColorStop(1, '#6366F1');
      ctx.fillStyle = titleGradient;
      ctx.beginPath();
      ctx.roundRect(40, 220, ctx.measureText(cardData.title).width * 0.65 + 30, 38, 19);
      ctx.fill();
      
      ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(cardData.title, 55, 246);
      
      // Contact details in 2-column grid
      const leftX = 40;
      const rightX = 420;
      const startY = 310;
      const spacing = 42;
      
      ctx.font = '15px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      
      // Left column
      // Email
      ctx.fillText('✉️  ' + cardData.email, leftX, startY);
      // Website
      ctx.fillText('🌐  www.beyondwalls.ae', leftX, startY + spacing);
      
      // Right column
      // Phone
      ctx.fillText('📱  ' + cardData.phone, rightX, startY);
      // Location
      ctx.fillText('📍  Dubai, UAE', rightX, startY + spacing);
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

  function downloadBusinessCardPDF(role, cardData) {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98] // Standard business card size
    });

    // Create canvas for front side
    const frontCanvas = document.createElement('canvas');
    const frontCtx = frontCanvas.getContext('2d');
    frontCanvas.width = 800;
    frontCanvas.height = 450;
    
    // Draw front side (reusing existing logic)
    drawBusinessCardFront(frontCtx, cardData);
    const frontImage = frontCanvas.toDataURL('image/png');
    pdf.addImage(frontImage, 'PNG', 0, 0, 85.6, 53.98);

    // Add new page for back side
    pdf.addPage();
    
    // Create canvas for back side
    const backCanvas = document.createElement('canvas');
    const backCtx = backCanvas.getContext('2d');
    backCanvas.width = 800;
    backCanvas.height = 450;
    
    // Draw back side (reusing existing logic)
    drawBusinessCardBack(backCtx, cardData, role);
    const backImage = backCanvas.toDataURL('image/png');
    pdf.addImage(backImage, 'PNG', 0, 0, 85.6, 53.98);

    // Download PDF
    pdf.save(`beyondwalls-${role}-card.pdf`);
  }

  function drawBusinessCardFront(ctx, cardData) {
    const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
    bgGradient.addColorStop(0, '#1e1b4b');
    bgGradient.addColorStop(0.5, '#312e81');
    bgGradient.addColorStop(1, '#4c1d95');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 450);
    
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
    
    const logoGradient = ctx.createLinearGradient(40, 35, 110, 105);
    logoGradient.addColorStop(0, '#8B5CF6');
    logoGradient.addColorStop(1, '#6366F1');
    ctx.beginPath();
    ctx.roundRect(40, 35, 70, 70, 16);
    ctx.fillStyle = logoGradient;
    ctx.fill();
    
    ctx.shadowColor = '#8B5CF6';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(40, 35, 70, 70, 16);
    ctx.fill();
    ctx.shadowBlur = 0;
    
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
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(68, 58);
    ctx.lineTo(68, 72);
    ctx.lineTo(82, 65);
    ctx.closePath();
    ctx.fill();
    
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('BeyondWalls', 125, 62);
    
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('A Linkzone Global FZ-LLC Company', 125, 82);
    
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Digital Out-of-Home Advertising', 125, 100);
    
    const lineGradient = ctx.createLinearGradient(40, 0, 760, 0);
    lineGradient.addColorStop(0, '#8B5CF6');
    lineGradient.addColorStop(1, '#6366F1');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 135);
    ctx.lineTo(760, 135);
    ctx.stroke();
    
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cardData.name, 40, 200);
    
    const titleGradient = ctx.createLinearGradient(40, 220, 300, 260);
    titleGradient.addColorStop(0, '#8B5CF6');
    titleGradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = titleGradient;
    ctx.beginPath();
    ctx.roundRect(40, 220, ctx.measureText(cardData.title).width * 0.65 + 30, 38, 19);
    ctx.fill();
    
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(cardData.title, 55, 246);
    
    const leftX = 40;
    const rightX = 420;
    const startY = 310;
    const spacing = 42;
    
    ctx.font = '15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    
    ctx.fillText('✉️  ' + cardData.email, leftX, startY);
    ctx.fillText('🌐  www.beyondwalls.ae', leftX, startY + spacing);
    ctx.fillText('📱  ' + cardData.phone, rightX, startY);
    ctx.fillText('📍  Dubai, UAE', rightX, startY + spacing);
  }

  function drawBusinessCardBack(ctx, cardData, role) {
    const profileUrl = role === 'ceo' 
      ? 'https://www.beyondwalls.ae/CEOProfile'
      : 'https://www.beyondwalls.ae/COOProfile';

    const bgGradient = ctx.createLinearGradient(0, 0, 800, 450);
    bgGradient.addColorStop(0, '#0f0a1e');
    bgGradient.addColorStop(0.5, '#1a1035');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 450);
    
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
    
    ctx.shadowColor = '#8B5CF6';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 28);
    ctx.fill();
    ctx.shadowBlur = 0;
    
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
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(logoX + 48, logoY + 40);
    ctx.lineTo(logoX + 48, logoY + 65);
    ctx.lineTo(logoX + 75, logoY + 52);
    ctx.closePath();
    ctx.fill();
    
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('BeyondWalls', 400, 280);
    
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Digital Out-of-Home Advertising', 400, 315);
    
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
    
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('www.beyondwalls.ae', 400, 380);
    
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px system-ui';
    ctx.fillText('LinkedIn  •  Instagram  •  Twitter', 400, 415);
    
    const qrSize = 140;
    const qrX = 590;
    const qrY = 170;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to Connect', qrX + qrSize / 2, qrY + qrSize + 25);
    ctx.textAlign = 'left';
    
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Incubated @', 45, 400);
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('in5', 45, 423);
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Tech Dubai Internet City', 75, 423);
    
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(20, 20);
    ctx.lineTo(50, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(750, 20);
    ctx.lineTo(780, 20);
    ctx.lineTo(780, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, 400);
    ctx.lineTo(20, 430);
    ctx.lineTo(50, 430);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(750, 430);
    ctx.lineTo(780, 430);
    ctx.lineTo(780, 400);
    ctx.stroke();
  }
}

function BrochureFrontPreview() {
  return (
    <div className="grid grid-cols-3 rounded-xl overflow-hidden shadow-2xl">
      {/* Panel 1 - Cover - Professional Style */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900 p-8 flex flex-col items-center justify-center min-h-[500px] overflow-hidden">
        {/* Decorative circles - matching business card */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/4 translate-x-1/4" />
        
        {/* Left accent - brand colors */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-violet-500 to-indigo-600" />
        
        <div className="relative z-10 text-center space-y-6">
          {/* Logo matching business card style */}
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-violet-500/30">
            <MonitorPlay className="w-10 h-10 text-white" />
          </div>
          
          {/* Company name */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">BeyondWalls</h1>
            <p className="text-xs text-white/50">A Linkzone Global FZ-LLC Company</p>
            <p className="text-sm text-white/60 mt-1">Digital Out-of-Home Advertising</p>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-white/20 w-3/4 mx-auto" />
          
          {/* Tagline in badge */}
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-lg">
            <p className="text-lg font-semibold text-white">Transform Screens Into Revenue</p>
          </div>
          
          {/* Contact preview */}
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
                <Mail className="w-3 h-3 text-white" />
              </div>
              <span>hello@beyondwalls.ae</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </div>
              <span>+971 55 614 0067</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
                <Globe className="w-3 h-3 text-white" />
              </div>
              <span>www.beyondwalls.ae</span>
            </div>
          </div>
        </div>
        
        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-600" />
      </div>
      
      {/* Panel 2 - Benefits - Professional Style */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white min-h-[500px] overflow-hidden">
        {/* Decorative elements matching business card */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-white mb-2">Perfect for</h3>
            <h3 className="text-3xl font-bold text-white">Everyone</h3>
            <div className="h-px bg-white/20 w-3/4 mt-4" />
          </div>
          
          <div className="space-y-3 text-sm">
            <p className="text-xs font-semibold text-violet-400 mb-2">FOR ADVERTISERS</p>
            {[
              { icon: Clock, title: 'Ads Live in 30 Min', desc: 'Fastest deployment' },
              { icon: Target, title: 'AI-Powered Targeting', desc: 'Reach right audience' },
              { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track ROI instantly' },
              { icon: Globe, title: '500+ Prime Locations', desc: 'Across Dubai & UAE' }
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
              <div key={i} className="flex gap-3 items-center bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-xs">{item.title}</p>
                  <p className="text-white/60 text-[10px]">{item.desc}</p>
                </div>
              </div>
              );
            })}
            <p className="text-xs font-semibold text-indigo-400 mb-2 mt-3">FOR VENUE OWNERS</p>
            {[
              { icon: DollarSign, title: 'Earn 70% Revenue', desc: 'Keep majority of earnings' },
              { icon: Zap, title: 'Zero Upfront Cost', desc: 'Free to get started' },
              { icon: Clock, title: 'Quick Setup', desc: 'Live in 48 hours' },
              { icon: BarChart3, title: 'Live Dashboard', desc: 'Monitor 24/7' }
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
              <div key={i} className="flex gap-3 items-center bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-xs">{item.title}</p>
                  <p className="text-white/60 text-[10px]">{item.desc}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-600" />
      </div>
      
      {/* Panel 3 - Contact - Professional Style */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900 p-8 flex flex-col justify-between min-h-[500px] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/4 translate-x-1/4" />
        
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-violet-500 to-indigo-600" />
        
        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl font-bold text-white">Get Started</h3>
          
          <div className="space-y-3 text-sm">
            {[
              { icon: Mail, label: 'Email', value: 'hello@beyondwalls.ae' },
              { icon: Phone, label: 'Phone', value: '+971 55 614 0067' },
              { icon: Globe, label: 'Website', value: 'www.beyondwalls.ae' },
              { icon: MapPin, label: 'Location', value: 'in5 Tech\nDubai Internet City, UAE' }
            ].map((item, i) => {
              const IconComponent = item.icon;
              return (
              <div key={i} className="flex items-start gap-3 text-white/90">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/60 font-semibold mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-white whitespace-pre-line">{item.value}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
        
        {/* QR Code */}
        <div className="relative z-10 bg-white/95 rounded-xl p-4 text-center shadow-lg">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=https://www.beyondwalls.ae/Onboarding"
            alt="QR Code"
            className="w-24 h-24 rounded-lg mx-auto mb-2"
          />
          <p className="text-xs text-slate-700 font-semibold">Scan to Get Started</p>
        </div>
        
        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-600" />
      </div>
    </div>
  );
}

function BrochureBackPreview() {
  return (
    <div className="grid grid-cols-3 rounded-xl overflow-hidden shadow-2xl">
      {/* Panel 1 - How It Works - Professional */}
      <div className="bg-white p-8 min-h-[500px]">
        <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-600 -mx-8 -mt-8 mb-6" />
        
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-slate-900 mb-2">How It</h3>
          <h3 className="text-3xl font-bold text-slate-900">Works</h3>
          <div className="h-px bg-slate-200 w-3/4 mt-3" />
        </div>
        
        <div className="space-y-4">
          <p className="text-xs font-semibold text-violet-600 mb-2">FOR ADVERTISERS</p>
          {[
            { num: '1', title: 'Upload Your Ad', desc: 'Image or video' },
            { num: '2', title: 'Select Locations', desc: 'Choose target venues' },
            { num: '3', title: 'Launch in 30 Min', desc: 'Instant approval' }
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3 bg-violet-50 rounded-lg p-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-sm font-bold text-white">{step.num}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                <p className="text-xs text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
          
          <p className="text-xs font-semibold text-indigo-600 mb-2 mt-4">FOR VENUE OWNERS</p>
          {[
            { num: '1', title: 'Register Venue', desc: 'Quick signup' },
            { num: '2', title: 'Install Screens', desc: 'Free setup' },
            { num: '3', title: 'Earn Revenue', desc: '70% to you' }
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3 bg-indigo-50 rounded-lg p-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-sm font-bold text-white">{step.num}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                <p className="text-xs text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Panel 2 - Stats - Professional Dark */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 flex flex-col items-center justify-center text-center min-h-[500px] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-6">
          <h3 className="text-3xl font-bold text-white leading-tight">Start Earning<br/>From Your<br/>Screens</h3>
          
          <div className="h-px bg-white/20 w-3/4 mx-auto" />
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-sm text-white/60 mb-2">Earn Up To</p>
            <p className="text-4xl font-bold text-white mb-1">AED 5,000</p>
            <p className="text-sm text-white/60">per screen / month</p>
          </div>
          
          <div className="space-y-3 w-full">
            {[
              { value: '500+', label: 'Active Venues' },
              { value: '1,200+', label: 'Screens Live' },
              { value: 'AED 2M+', label: 'Paid to Venues' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-600" />
      </div>
      
      {/* Panel 3 - Benefits - Professional White */}
      <div className="bg-white p-8 min-h-[500px]">
        <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-600 -mx-8 -mt-8 mb-6" />
        
        <div className="mb-6">
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Key</h3>
          <h3 className="text-3xl font-bold text-slate-900">Features</h3>
          <div className="h-px bg-slate-200 w-3/4 mt-3" />
        </div>
        
        <div className="space-y-3">
          {[
            { icon: Target, title: 'Smart Targeting', desc: 'AI-powered matching' },
            { icon: BarChart3, title: 'Live Dashboard', desc: 'Real-time analytics' },
            { icon: CreditCard, title: 'Easy Payouts', desc: 'Weekly transfers' },
            { icon: Sparkles, title: 'Safe Content', desc: 'Pre-approved ads' },
            { icon: Phone, title: 'Mobile Control', desc: 'Manage anywhere' }
          ].map((item, i) => {
            const IconComponent = item.icon;
            return (
            <div key={i} className="flex gap-3 items-center bg-slate-50 rounded-lg p-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </div>
            </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-center bg-gradient-to-r from-slate-900 to-purple-900 rounded-xl p-4">
          <p className="text-lg font-bold text-white">Ready to Transform?</p>
          <p className="text-sm font-semibold text-violet-400 mt-1">www.beyondwalls.ae</p>
        </div>
      </div>
    </div>
  );
}

function BusinessCardCreative({ cardData, cardType, onEdit, onDownload, onDownloadPDF }) {
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
        /* FRONT SIDE PREVIEW - Matching Screenshot */
        <div className="relative rounded-2xl shadow-2xl overflow-hidden max-w-xl mx-auto bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/4 translate-x-1/4" />
          
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
            <div className="mb-8">
              <h3 className="text-4xl font-bold text-white mb-3">{cardData.name}</h3>
              <span className="inline-block px-5 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full text-white text-base font-semibold shadow-lg">
                {cardData.title}
              </span>
            </div>
            
            {/* Contact details - 2 column grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-sm">{cardData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm">{cardData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-sm">www.beyondwalls.ae</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-sm">Dubai, UAE</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BACK SIDE PREVIEW */
        <div className="relative rounded-2xl shadow-2xl overflow-hidden max-w-xl mx-auto bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" style={{ aspectRatio: '800/450' }}>
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
          
          <div className="relative p-8 flex items-center justify-between min-h-[280px]">
            {/* Left side - Logo and info */}
            <div className="flex-1">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4">
                <MonitorPlay className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-1">BeyondWalls</h2>
              <p className="text-white/50 text-sm mb-4">Digital Out-of-Home Advertising</p>
              
              <div className="h-px bg-white/20 w-3/4 mb-3" />
              
              <p className="text-violet-400 font-medium text-sm">www.beyondwalls.ae</p>
              <p className="text-white/40 text-xs mt-2">LinkedIn • Instagram • Twitter</p>
            </div>
            
            {/* Right side - QR Code + in5 Logo */}
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-xl p-3 shadow-lg mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent('https://www.beyondwalls.ae/' + (cardType === 'ceo' ? 'CEOProfile' : 'COOProfile'))}`}
                  alt="QR Code"
                  className="w-28 h-28"
                />
              </div>
              <p className="text-white/50 text-xs mb-4">Scan to Connect</p>
              
              {/* in5 Logo */}
              <div className="text-center">
                <p className="text-white/50 text-[9px] mb-1">Incubated @</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-bold text-xl">in5</span>
                  <span className="text-white/50 text-[8px]">Tech Dubai Internet City</span>
                </div>
              </div>
            </div>
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
        <Button onClick={onDownloadPDF} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}