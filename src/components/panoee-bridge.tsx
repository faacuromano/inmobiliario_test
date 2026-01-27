"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PanoeeBridgeProps {
  src: string;
}

export function PanoeeBridge({ src }: PanoeeBridgeProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Use the env var or fallback
  const PANOEE_URL = process.env.NEXT_PUBLIC_PANOEE_URL || "https://panoee.com/recorrido-demo";
  const finalSrc = src || PANOEE_URL;

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-cream">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full"
          />
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={finalSrc}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />
      
      {/* Overlay Gradient (Optional: adds depth to the edges) */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark-green/20 to-transparent pointer-events-none" />
    </div>
  );
}
