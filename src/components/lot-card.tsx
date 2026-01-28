"use client";

import { motion } from "framer-motion";
import { X, Ruler, Maximize, CheckCircle, AlertCircle, Ban } from "lucide-react";
import clsx from "clsx";

export type LotStatus = "AVAILABLE" | "RESERVED" | "SOLD";

interface LotCardProps {
  number: string;
  price: number;
  currency: string;
  status: LotStatus;
  dimensions: string;
  area: number; // m2
  description?: string;
  onClose?: () => void;
  isEmbed?: boolean;
}

const statusConfig = {
  AVAILABLE: {
    color: "text-forest",
    bg: "bg-forest/10",
    border: "border-forest/20",
    icon: CheckCircle,
    label: "Disponible",
  },
  RESERVED: {
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
    icon: AlertCircle,
    label: "Reservado",
  },
  SOLD: {
    color: "text-gray-500",
    bg: "bg-gray-100/50",
    border: "border-gray-200",
    icon: Ban,
    label: "Vendido",
  },
};

export function LotCard({
  number,
  price,
  currency,
  status,
  dimensions,
  area,
  description,
  onClose,
  isEmbed = false,
}: LotCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (

    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={clsx(
        "relative overflow-hidden w-full mx-auto",
        isEmbed ? "h-full flex flex-col bg-white/90 backdrop-blur-xl" : "glass rounded-2xl p-6 sm:p-8 max-w-md shadow-2xl border border-white/20"
      )}
    >
      {/* Decorative background glow - Only for Card Mode */}
      {!isEmbed && <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest/5 rounded-full blur-3xl pointer-events-none" />}
      
      {/* 
        LAYOUT STRATEGIES
      */}
      
      {isEmbed ? (
        // === EMBED HUD MODE ===
        // Designed to fill the iframe completely with a sleek dashboard feel.
         <div className="flex flex-col h-full">
            {/* HUD Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-forest/10 bg-forest/5">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-forest text-cream flex items-center justify-center font-bold text-xl font-heading shadow-md">
                      {number}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">Lote N°</span>
                      <span className="text-xs font-medium text-dark-green">{config.label}</span>
                   </div>
                </div>
                {/* Price Pill */}
                 {status === "AVAILABLE" && (
                    <div className="text-right">
                       <span className="block text-[10px] font-bold uppercase tracking-widest text-forest/60">Valor</span>
                       <span className="text-xl font-bold font-heading text-forest">{currency} {price.toLocaleString()}</span>
                    </div>
                 )}
            </div>

            {/* HUD Content Grid */}
            <div className="flex-1 p-6 grid grid-cols-2 gap-4 items-center">
                 {/* Left: Stats (Clean Typography, No Boxes) */}
                 <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-forest/60 mb-1">
                            <Ruler size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Dimensiones</span>
                        </div>
                        <div className="text-2xl font-light text-dark-green">{dimensions}</div>
                    </div>
                    <div>
                         <div className="flex items-center gap-2 text-forest/60 mb-1">
                            <Maximize size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Superficie Total</span>
                        </div>
                        <div className="text-2xl font-light text-dark-green">{area} <span className="text-sm font-bold">m²</span></div>
                    </div>
                 </div>

                 {/* Right: Description & CTA */}
                 <div className="flex flex-col justify-center h-full border-l border-forest/10 pl-6 space-y-4">
                     {description && (
                        <p className="text-sm text-dark-green/80 leading-relaxed line-clamp-4">
                          {description}
                        </p>
                      )}
                      {status === "AVAILABLE" && (
                        <button className="w-full py-3 bg-forest text-cream rounded-lg font-bold shadow-lg hover:shadow-xl hover:bg-forest/90 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm tracking-wide mt-auto">
                           Consultar Ahora
                        </button>
                      )}
                 </div>
            </div>
         </div>
      ) : (
        // === STANDARD CARD MODE ===
        <div className="space-y-6">
           {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold tracking-wider text-forest/70 uppercase mb-1">
                Lote N°
              </div>
              <h2 className="text-4xl font-bold font-heading text-dark-green">
                {number}
              </h2>
            </div>
            
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 transition-colors text-dark-green/60 hover:text-dark-green cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Status Badge */}
          <div className={clsx(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
            config.bg, config.color, config.border
          )}>
            <StatusIcon size={14} />
            <span>{config.label}</span>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/40 rounded-xl p-2.5 border border-white/30">
              <div className="flex items-center gap-2 text-dark-green/60 text-xs mb-1">
                <Ruler size={12} />
                <span>Dimensiones</span>
              </div>
              <div className="font-semibold text-dark-green text-sm">{dimensions}</div>
            </div>
            <div className="bg-white/40 rounded-xl p-2.5 border border-white/30">
              <div className="flex items-center gap-2 text-dark-green/60 text-xs mb-1">
                <Maximize size={12} />
                <span>Superficie</span>
              </div>
              <div className="font-semibold text-dark-green text-sm">{area} m²</div>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-3">
            {status === "AVAILABLE" && (
              <div>
                <div className="text-xs text-dark-green/60 mb-1">Precio de Lista</div>
                <div className="text-3xl font-bold font-heading text-forest">
                  {currency} {price.toLocaleString()}
                </div>
              </div>
            )}

            {description && (
              <p className="text-sm text-dark-green/70 leading-relaxed border-t border-forest/10 pt-3">
                {description}
              </p>
            )}
            
            {status === "AVAILABLE" && (
                <div className="mt-4 pt-2 border-t border-forest/5">
                   <button className="w-full py-3 bg-forest text-cream rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-forest/90 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 text-sm">
                    Consultar Ahora
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
