"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface PanoeeEmbedProps {
  tourId: string; // The ID from the URL (e.g., 69791a27ce79982e367d354b)
}

export function PanoeeEmbed({ tourId }: PanoeeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeId = "tour-embeded"; // Fixed ID required by the script
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Device Motion Handler
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "devicemotion",
            deviceMotionEvent: {
              acceleration: {
                x: e.acceleration?.x || 0,
                y: e.acceleration?.y || 0,
                z: e.acceleration?.z || 0,
              },
              accelerationIncludingGravity: {
                x: e.accelerationIncludingGravity?.x || 0,
                y: e.accelerationIncludingGravity?.y || 0,
                z: e.accelerationIncludingGravity?.z || 0,
              },
              rotationRate: {
                alpha: e.rotationRate?.alpha || 0,
                beta: e.rotationRate?.beta || 0,
                gamma: e.rotationRate?.gamma || 0,
              },
              interval: e.interval || 16,
              timeStamp: e.timeStamp,
            },
          },
          "*"
        );
      }
    };

    // Request permission for iOS 13+ if needed
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        // We can't auto-request permission without user interaction, 
        // but we can add the listener which might work if permission was granted previously
         window.addEventListener("devicemotion", handleDeviceMotion);
    } else {
         window.addEventListener("devicemotion", handleDeviceMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-cream"
    >
      <iframe
        ref={iframeRef}
        id={iframeId}
        name="Test"
        src={`https://tour.panoee.net/iframe/${tourId}`}
        className="w-full h-full border-0"
        allow="vr; xr; accelerometer; gyroscope; autoplay; fullscreen"
        allowFullScreen
        loading="eager"
      />
      
      {/* Organic Overlay Gradient */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl ring-inset ring-1 ring-white/10 shadow-[inner_0_0_80px_rgba(0,0,0,0.2)]" />

      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-6 right-6 z-20 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 group"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? (
          <Minimize2 size={20} className="stroke-[1.5]" />
        ) : (
          <Maximize2 size={20} className="stroke-[1.5]" />
        )}
      </button>
    </div>
  );
}
