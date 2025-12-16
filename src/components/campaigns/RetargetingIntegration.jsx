import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Mail, 
  Facebook, 
  Instagram, 
  MessageSquare,
  ExternalLink,
  Copy,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function RetargetingIntegration({ campaignData, onChange }) {
  const [enabled, setEnabled] = useState(campaignData?.retargeting_enabled || false);
  const [channels, setChannels] = useState(campaignData?.retargeting_channels || []);
  const [pixelId, setPixelId] = useState(campaignData?.retargeting_pixel_id || "");
  const [copied, setCopied] = useState(false);

  const handleToggle = (checked) => {
    setEnabled(checked);
    onChange({ retargeting_enabled: checked });
  };

  const handleChannelToggle = (channel) => {
    const updated = channels.includes(channel)
      ? channels.filter(c => c !== channel)
      : [...channels, channel];
    setChannels(updated);
    onChange({ retargeting_channels: updated });
  };

  const handlePixelIdChange = (value) => {
    setPixelId(value);
    onChange({ retargeting_pixel_id: value });
  };

  const generatePixelId = () => {
    const id = `BW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setPixelId(id);
    onChange({ retargeting_pixel_id: id });
    toast.success("Pixel ID generated!");
  };

  const copyPixelId = () => {
    navigator.clipboard.writeText(pixelId);
    setCopied(true);
    toast.success("Pixel ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const channelOptions = [
    { 
      id: "email", 
      icon: Mail, 
      label: "Email Marketing",
      description: "Retarget via email campaigns"
    },
    { 
      id: "social_media", 
      icon: Facebook, 
      label: "Social Media Ads",
      description: "Facebook & Instagram retargeting"
    },
    { 
      id: "display_ads", 
      icon: ExternalLink, 
      label: "Display Advertising",
      description: "Google Display Network"
    },
    { 
      id: "sms", 
      icon: MessageSquare, 
      label: "SMS Marketing",
      description: "Text message retargeting"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-600" />
              Multi-Channel Retargeting
            </CardTitle>
            <CardDescription>
              Re-engage users who interacted with your DOOH campaign
            </CardDescription>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-6">
          {/* Pixel ID */}
          <div className="space-y-2">
            <Label>Tracking Pixel ID</Label>
            <div className="flex gap-2">
              <Input
                value={pixelId}
                onChange={(e) => handlePixelIdChange(e.target.value)}
                placeholder="BW-XXXXXXXXX"
                readOnly={!!pixelId}
              />
              {!pixelId ? (
                <Button onClick={generatePixelId} variant="outline">
                  Generate
                </Button>
              ) : (
                <Button onClick={copyPixelId} variant="outline">
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Use this pixel to track user interactions and build retargeting audiences
            </p>
          </div>

          {/* Channel Selection */}
          <div className="space-y-3">
            <Label>Retargeting Channels</Label>
            <div className="space-y-2">
              {channelOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = channels.includes(option.id);
                
                return (
                  <div
                    key={option.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? "border-violet-500 bg-violet-50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => handleChannelToggle(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-violet-600" : "bg-slate-100"
                        }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-600"}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-slate-600">{option.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-violet-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How It Works */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">How Retargeting Works:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Users engage with your DOOH ad (QR scan, AR interaction, etc.)</li>
              <li>We capture their engagement data with your pixel ID</li>
              <li>Build custom audiences based on engagement type</li>
              <li>Retarget them across selected channels for higher conversion</li>
            </ol>
          </div>

          {/* Active Summary */}
          {channels.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                <strong>Retargeting active on {channels.length} channel{channels.length > 1 ? 's' : ''}:</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {channels.map(channel => {
                  const option = channelOptions.find(o => o.id === channel);
                  return (
                    <Badge key={channel} className="bg-green-100 text-green-700">
                      {option?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}