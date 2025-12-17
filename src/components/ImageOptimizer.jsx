import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Optimized Image Component with lazy loading, progressive blur-up, and error handling
 */
export default function ImageOptimizer({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  blur = true,
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Fallback image
  const fallbackSrc = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=50";

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {/* Blur placeholder */}
      {blur && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-indigo-100 animate-pulse" />
      )}

      {/* Main image */}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}