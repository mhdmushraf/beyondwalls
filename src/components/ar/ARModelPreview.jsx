import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html } from "@react-three/drei";
import { Box, Loader2, AlertCircle, Eye, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Model({ url, onLoad, onError }) {
  const { scene } = useGLTF(url, true, true, (loader) => {
    loader.manager.onError = onError;
  });
  
  useEffect(() => {
    if (scene) {
      onLoad?.();
    }
  }, [scene, onLoad]);

  return <primitive object={scene} scale={1} />;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        <p className="text-sm text-slate-500 mt-2">Loading 3D Model...</p>
      </div>
    </Html>
  );
}

export default function ARModelPreview({ 
  modelUrl, 
  thumbnailUrl,
  modelStatus = "pending",
  size = "medium",
  showFullscreen = true 
}) {
  const [showViewer, setShowViewer] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const sizeClasses = {
    small: "h-32 w-32",
    medium: "h-48 w-full",
    large: "h-64 w-full"
  };

  const statusConfig = {
    pending: { label: "Processing", color: "amber" },
    processing: { label: "Optimizing", color: "blue" },
    approved: { label: "Ready", color: "emerald" },
    rejected: { label: "Rejected", color: "red" }
  };

  const status = statusConfig[modelStatus] || statusConfig.pending;

  // If we have a thumbnail, show it instead of 3D preview
  if (thumbnailUrl && !showViewer) {
    return (
      <div className={`relative ${sizeClasses[size]} bg-slate-100 rounded-xl overflow-hidden group`}>
        <img 
          src={thumbnailUrl} 
          alt="3D Model Preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {modelUrl && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => setShowViewer(true)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View 3D
            </Button>
          )}
        </div>
        <Badge className={`absolute top-2 right-2 bg-${status.color}-100 text-${status.color}-700`}>
          {status.label}
        </Badge>

        {/* Fullscreen Dialog */}
        <Dialog open={showViewer} onOpenChange={setShowViewer}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>3D Model Preview</DialogTitle>
            </DialogHeader>
            <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <Suspense fallback={<LoadingSpinner />}>
                  <Model 
                    url={modelUrl} 
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                  />
                  <Environment preset="studio" />
                </Suspense>
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Canvas>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // No thumbnail - show placeholder or 3D viewer
  if (!modelUrl) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-xl flex items-center justify-center`}>
        <div className="text-center">
          <Box className="w-10 h-10 text-violet-300 mx-auto mb-2" />
          <p className="text-sm text-violet-400">No 3D Model</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${sizeClasses[size]} bg-red-50 rounded-xl flex items-center justify-center`}>
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-2" />
          <p className="text-sm text-red-400">Failed to load model</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} bg-slate-100 rounded-xl overflow-hidden`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Suspense fallback={<LoadingSpinner />}>
          <Model 
            url={modelUrl} 
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      <Badge className={`absolute top-2 right-2 bg-${status.color}-100 text-${status.color}-700`}>
        {status.label}
      </Badge>

      {showFullscreen && (
        <Button 
          size="icon" 
          variant="secondary" 
          className="absolute bottom-2 right-2 h-8 w-8"
          onClick={() => setShowViewer(true)}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}