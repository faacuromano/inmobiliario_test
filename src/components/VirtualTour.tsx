'use client';
import React, { useState, useEffect, useRef } from 'react';

interface VirtualTourProps {
  className?: string;
}

export default function VirtualTour({ className = "" }: VirtualTourProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Fallback: force visible after 2s even if onLoad doesn't fire
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    // Also try detecting load via ref
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => setIsLoaded(true);
      iframe.addEventListener('load', handleLoad);
      return () => {
        clearTimeout(timer);
        iframe.removeEventListener('load', handleLoad);
      };
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`relative w-full h-full bg-deep overflow-hidden ${className}`}>
      {/* Loading State Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-deep">
           <span className="text-linen/30 font-mono text-xs uppercase tracking-[0.3em]">Cargando Recorrido 360...</span>
        </div>
      )}

      {/* Iframe — eager loading to ensure it loads in hero */}
      <iframe
        ref={iframeRef}
        src="/RECORRIDO_MAPA/index.html"
        title="Recorrido Virtual 360"
        className={`w-full h-full border-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        allowFullScreen
        loading="eager"
        onLoad={() => setIsLoaded(true)}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </section>
  );
}
