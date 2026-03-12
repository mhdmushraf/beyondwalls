import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      // Only start pull-to-refresh if we're at the top of the scrollable area
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      setPulling(false);

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);

        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
        }

        // Reset after animation
        setTimeout(() => {
          setPullDistance(0);
          setIsRefreshing(false);
        }, 600);
      } else {
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, false);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, pullDistance, isRefreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull-to-refresh indicator */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          height: Math.min(pullDistance, PULL_THRESHOLD),
          opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
          transition: pulling ? 'none' : 'all 0.3s ease-out',
        }}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-full p-3 shadow-lg">
          <RefreshCw
            className={`w-6 h-6 text-violet-600 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${Math.min((pullDistance / PULL_THRESHOLD) * 360, 360)}deg)`,
              transition: pulling ? 'none' : 'transform 0.3s ease-out',
            }}
          />
        </div>
      </div>

      {/* Content with padding when pulled */}
      <div
        style={{
          transform: `translateY(${pulling ? pullDistance : 0}px)`,
          transition: pulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}