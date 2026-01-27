"use client";

import { useEffect, useRef } from "react";

interface PanoeeEmbedProps {
  tourId: string; // The ID from the URL (e.g., 69791a27ce79982e367d354b)
}

export function PanoeeEmbed({ tourId }: PanoeeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeId = "tour-embeded"; // Fixed ID required by the script

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

    // Request permission for iOS 13+ if needed (optional implementation detail)
    // For now, we just add the listener
    window.addEventListener("devicemotion", handleDeviceMotion);

    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, []);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20">
      <iframe
        ref={iframeRef}
        id={iframeId}
        name="Test"
        src={`https://tour.panoee.net/iframe/${tourId}`}
        className="w-full h-full border-0 rounded-3xl"
        allow="vr; xr; accelerometer; gyroscope; autoplay;"
        allowFullScreen
        loading="eager"
      />
      
      {/* Organic Overlay Gradient */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl ring-inset ring-1 ring-white/10 shadow-[inner_0_0_80px_rgba(0,0,0,0.2)]" />
    </div>
  );
}
