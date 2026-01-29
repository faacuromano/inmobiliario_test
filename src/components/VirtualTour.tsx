'use client'; 
import React, { useState, useEffect } from 'react';

interface VirtualTourProps {
  className?: string;
}

export default function VirtualTour({ className = "" }: VirtualTourProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className={`relative w-full h-full bg-white overflow-hidden ${className}`}>
      {/* Loading State Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
           <span className="text-gray-500 font-medium">Cargando Recorrido 360...</span>
        </div>
      )}

      {/* Sandboxed Iframe */}
      <iframe
        src="/RECORRIDO_MAPA/index.html"
        title="Recorrido Virtual 360"
        className={`w-full h-full border-0 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        allowFullScreen
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </section>
  );
}
