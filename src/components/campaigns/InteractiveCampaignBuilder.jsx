import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Sparkles, 
  Vote, 
  Gamepad2, 
  Link as LinkIcon,
  Upload,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function InteractiveCampaignBuilder({ campaignData, onChange }) {
  const [features, setFeatures] = useState(campaignData?.interactive_features || {
    qr_code_enabled: false,
    qr_code_url: "",
    ar_enabled: false,
    ar_model_url: "",
    poll_enabled: false,
    poll_question: "",
    game_enabled: false,
    game_type: ""
  });

  const [preview, setPreview] = useState(false);

  const handleFeatureToggle = (feature, enabled) => {
    const updated = { ...features, [feature]: enabled };
    setFeatures(updated);
    onChange({ interactive_features: updated });
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...features, [field]: value };
    setFeatures(updated);
    onChange({ interactive_features: updated });
  };

  const generateQRCode = () => {
    // Generate QR code URL
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/track/${Math.random().toString(36).substr(2, 9)}`;
    handleFieldChange("qr_code_url", qrUrl);
    toast.success("QR code tracking URL generated!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          Interactive Campaign Features
        </CardTitle>
        <CardDescription>
          Add interactive elements to boost engagement and track user actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="qr">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="ar">
              <Sparkles className="w-4 h-4 mr-2" />
              AR
            </TabsTrigger>
            <TabsTrigger value="poll">
              <Vote className="w-4 h-4 mr-2" />
              Poll
            </TabsTrigger>
            <TabsTrigger value="game">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Game
            </TabsTrigger>
          </TabsList>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable QR Code</Label>
                <p className="text-sm text-slate-600">Let users scan to visit your website or landing page</p>
              </div>
              <Switch
                checked={features.qr_code_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("qr_code_enabled", checked)}
              />
            </div>

            {features.qr_code_enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-violet-200">
                <div>
                  <Label>Destination URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="https://your-website.com"
                      value={features.qr_code_url || ""}
                      onChange={(e) => handleFieldChange("qr_code_url", e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={generateQRCode}
                      className="whitespace-nowrap"
                    >
                      Generate Tracking URL
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Users will be redirected here after scanning. Use tracking URL to measure scans.
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <QrCode className="w-4 h-4" />
                    <span className="font-medium">QR code will be dynamically generated on screens</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* AR Tab */}
          <TabsContent value="ar" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable AR Experience</Label>
                <p className="text-sm text-slate-600">Create immersive augmented reality interactions</p>
              </div>
              <Switch
                checked={features.ar_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("ar_enabled", checked)}
              />
            </div>

            {features.ar_enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-violet-200">
                <div>
                  <Label>AR Model URL (.gltf or .glb)</Label>
                  <Input
                    placeholder="https://your-ar-model.glb"
                    value={features.ar_model_url || ""}
                    onChange={(e) => handleFieldChange("ar_model_url", e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your 3D model and paste the URL here
                  </p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-purple-800">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Users scan QR to view AR experience on their phone</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Poll Tab */}
          <TabsContent value="poll" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Interactive Poll</Label>
                <p className="text-sm text-slate-600">Engage audience with quick polls and surveys</p>
              </div>
              <Switch
                checked={features.poll_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("poll_enabled", checked)}
              />
            </div>

            {features.poll_enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-violet-200">
                <div>
                  <Label>Poll Question</Label>
                  <Input
                    placeholder="What's your favorite feature?"
                    value={features.poll_question || ""}
                    onChange={(e) => handleFieldChange("poll_question", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Vote className="w-4 h-4" />
                    <span className="font-medium">Users scan QR to participate in the poll</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Game Tab */}
          <TabsContent value="game" className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Mini-Game</Label>
                <p className="text-sm text-slate-600">Gamify your campaign with interactive challenges</p>
              </div>
              <Switch
                checked={features.game_enabled}
                onCheckedChange={(checked) => handleFeatureToggle("game_enabled", checked)}
              />
            </div>

            {features.game_enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-violet-200">
                <div>
                  <Label>Game Type</Label>
                  <select
                    className="w-full mt-2 p-2 border rounded-lg"
                    value={features.game_type || ""}
                    onChange={(e) => handleFieldChange("game_type", e.target.value)}
                  >
                    <option value="">Select game type</option>
                    <option value="spin_wheel">Spin the Wheel</option>
                    <option value="scratch_card">Scratch Card</option>
                    <option value="memory_game">Memory Game</option>
                    <option value="quiz">Quick Quiz</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <Gamepad2 className="w-4 h-4" />
                    <span className="font-medium">Users scan QR to play the game on their phone</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary */}
        {(features.qr_code_enabled || features.ar_enabled || features.poll_enabled || features.game_enabled) && (
          <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Interactive Features Enabled:</h4>
            <div className="flex flex-wrap gap-2">
              {features.qr_code_enabled && (
                <Badge className="bg-green-100 text-green-700">
                  <QrCode className="w-3 h-3 mr-1" />
                  QR Code
                </Badge>
              )}
              {features.ar_enabled && (
                <Badge className="bg-purple-100 text-purple-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AR Experience
                </Badge>
              )}
              {features.poll_enabled && (
                <Badge className="bg-blue-100 text-blue-700">
                  <Vote className="w-3 h-3 mr-1" />
                  Poll
                </Badge>
              )}
              {features.game_enabled && (
                <Badge className="bg-amber-100 text-amber-700">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  Mini-Game
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}