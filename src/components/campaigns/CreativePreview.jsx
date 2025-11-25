import React, { useState } from "react";
import {
  MonitorPlay,
  Smartphone,
  Monitor,
  Coffee,
  Dumbbell,
  ShoppingBag,
  Building2,
  UtensilsCrossed,
  Hotel,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SCREEN_TYPES = [
  { id: "landscape", label: "Landscape", icon: Monitor, aspect: "16/9" },
  { id: "portrait", label: "Portrait", icon: Smartphone, aspect: "9/16" },
];

const VENUE_ENVIRONMENTS = [
  { 
    id: "cafe", 
    label: "Café", 
    icon: Coffee, 
    bg: "from-amber-900/90 to-orange-900/90",
    overlay: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format"
  },
  { 
    id: "gym", 
    label: "Gym", 
    icon: Dumbbell, 
    bg: "from-slate-900/90 to-zinc-900/90",
    overlay: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format"
  },
  { 
    id: "mall", 
    label: "Mall", 
    icon: ShoppingBag, 
    bg: "from-neutral-100/90 to-stone-200/90",
    overlay: "https://images.unsplash.com/photo-1567449303078-57ad995bd17f?w=800&auto=format"
  },
  { 
    id: "restaurant", 
    label: "Restaurant", 
    icon: UtensilsCrossed, 
    bg: "from-stone-800/90 to-neutral-900/90",
    overlay: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format"
  },
  { 
    id: "coworking", 
    label: "Coworking", 
    icon: Building2, 
    bg: "from-slate-200/90 to-gray-300/90",
    overlay: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format"
  },
  { 
    id: "hotel", 
    label: "Hotel Lobby", 
    icon: Hotel, 
    bg: "from-amber-800/90 to-yellow-900/90",
    overlay: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format"
  },
];

export default function CreativePreview({ 
  creativeUrl, 
  creativeType = "image",
  headline,
  description,
  triggerButton,
  inline = false 
}) {
  const [screenType, setScreenType] = useState("landscape");
  const [venue, setVenue] = useState("cafe");

  const selectedVenue = VENUE_ENVIRONMENTS.find(v => v.id === venue);

  const PreviewContent = () => (
    <div className="space-y-6">
      {/* Screen Type Selector */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Screen Orientation</p>
        <div className="flex gap-2">
          {SCREEN_TYPES.map((type) => (
            <Button
              key={type.id}
              variant={screenType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setScreenType(type.id)}
              className={screenType === type.id ? "bg-violet-600" : ""}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Venue Environment Selector */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Venue Environment</p>
        <div className="flex flex-wrap gap-2">
          {VENUE_ENVIRONMENTS.map((v) => (
            <Button
              key={v.id}
              variant={venue === v.id ? "default" : "outline"}
              size="sm"
              onClick={() => setVenue(v.id)}
              className={venue === v.id ? "bg-violet-600" : ""}
            >
              <v.icon className="w-4 h-4 mr-2" />
              {v.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div 
        className="relative rounded-2xl overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${selectedVenue?.overlay})`,
          minHeight: screenType === "portrait" ? "500px" : "350px"
        }}
      >
        {/* Venue Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedVenue?.bg}`} />
        
        {/* Screen Frame */}
        <div className="relative z-10 flex items-center justify-center p-8 h-full">
          <div 
            className={`
              bg-black rounded-lg shadow-2xl overflow-hidden relative
              ${screenType === "portrait" ? "w-48" : "w-full max-w-lg"}
            `}
            style={{ aspectRatio: screenType === "portrait" ? "9/16" : "16/9" }}
          >
            {/* Screen Bezel */}
            <div className="absolute inset-0 border-4 border-slate-800 rounded-lg pointer-events-none z-20" />
            
            {/* Screen Content */}
            <div className="relative w-full h-full bg-slate-900">
              {creativeUrl ? (
                creativeType === "video" ? (
                  <video
                    src={creativeUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={creativeUrl}
                    alt="Ad Preview"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <MonitorPlay className="w-12 h-12 mb-4 opacity-50" />
                  {headline ? (
                    <>
                      <p className={`font-bold text-center mb-2 ${screenType === "portrait" ? "text-sm" : "text-xl"}`}>
                        {headline}
                      </p>
                      {description && (
                        <p className={`text-center opacity-80 ${screenType === "portrait" ? "text-xs" : "text-sm"}`}>
                          {description}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm opacity-70">Upload a creative to preview</p>
                  )}
                </div>
              )}
              
              {/* Ad Overlay with text if image/video exists */}
              {creativeUrl && (headline || description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {headline && (
                    <p className={`font-bold text-white ${screenType === "portrait" ? "text-xs" : "text-lg"}`}>
                      {headline}
                    </p>
                  )}
                  {description && (
                    <p className={`text-white/80 ${screenType === "portrait" ? "text-[10px]" : "text-sm"}`}>
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Screen Stand/Base */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-slate-700 rounded-b-lg" />
          </div>
        </div>

        {/* Venue Label */}
        <Badge className="absolute top-4 left-4 bg-black/50 text-white border-0 z-20">
          <selectedVenue.icon className="w-3 h-3 mr-1" />
          {selectedVenue?.label} Preview
        </Badge>

        {/* Screen Type Label */}
        <Badge className="absolute top-4 right-4 bg-violet-600 text-white border-0 z-20">
          {screenType === "portrait" ? "Portrait 9:16" : "Landscape 16:9"}
        </Badge>
      </div>

      {/* Tips */}
      <div className="bg-violet-50 rounded-xl p-4">
        <p className="text-sm text-violet-800">
          <strong>💡 Tip:</strong> {screenType === "portrait" 
            ? "Portrait screens work best with vertical content and bold text that's readable from a distance."
            : "Landscape screens are ideal for cinematic visuals and horizontal layouts with side-by-side content."}
        </p>
      </div>
    </div>
  );

  if (inline) {
    return <PreviewContent />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <MonitorPlay className="w-4 h-4 mr-2" />
            Preview on Screens
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-violet-600" />
            Real-Time Ad Preview
          </DialogTitle>
        </DialogHeader>
        <PreviewContent />
      </DialogContent>
    </Dialog>
  );
}