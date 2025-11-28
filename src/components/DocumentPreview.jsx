import React, { useState } from "react";
import { FileText, X, Download, ExternalLink, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DocumentPreview({ url, title = "Document" }) {
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  if (!url) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url) || url.includes("image");
  const isPDF = /\.pdf$/i.test(url) || url.includes("pdf");

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(true)}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        View {title}
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" />
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isImage && (
                <>
                  <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-500 w-12 text-center">{zoom}%</span>
                  <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href={url} download>
                  <Download className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-slate-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              </div>
            )}
            
            {isImage ? (
              <img
                src={url}
                alt={title}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                style={{ transform: `scale(${zoom / 100})`, transition: "transform 0.2s" }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            ) : isPDF ? (
              <iframe
                src={`${url}#toolbar=0`}
                onLoad={() => setLoading(false)}
                className="w-full h-[600px] rounded-lg border-0"
                title={title}
              />
            ) : (
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Preview not available for this file type</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </a>
                  </Button>
                  <Button asChild>
                    <a href={url} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}