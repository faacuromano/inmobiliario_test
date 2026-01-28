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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={clsx(
        "glass rounded-2xl relative overflow-hidden w-full mx-auto shadow-2xl border border-white/20",
        isEmbed ? "h-full max-h-screen flex flex-col p-5" : "p-6 sm:p-8 max-w-md flex flex-col"
      )}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* 
        LAYOUT STRATEGY:
        - Regular Mode: Vertical Stack (Standard mobile/desktop card).
        - Embed Mode: Horizontal Grid (Left: Info, Right: Action) to save vertical space.
      */}
      
      <div className={clsx("flex-1 overflow-y-auto no-scrollbar", isEmbed ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "space-y-6")}>
        
        {/* === COLUMN 1: Identity & Specs === */}
        <div className={clsx("space-y-4", isEmbed && "flex flex-col justify-center")}>
           {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold tracking-widest text-forest/60 uppercase mb-1">
                Lote N°
              </div>
              <h2 className={clsx("font-bold font-heading text-dark-green leading-none", isEmbed ? "text-5xl" : "text-4xl")}>
                {number}
              </h2>
            </div>
            
            {onClose && !isEmbed && (
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 transition-colors text-dark-green/60 hover:text-dark-green cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex">
            <div className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide",
              config.bg, config.color, config.border
            )}>
              <StatusIcon size={14} />
              <span>{config.label}</span>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/40 rounded-xl p-3 border border-white/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-dark-green/60 text-[10px] uppercase font-bold mb-1">
                <Ruler size={12} />
                <span>Medidas</span>
              </div>
              <div className="font-semibold text-dark-green text-sm">{dimensions}</div>
            </div>
            <div className="bg-white/40 rounded-xl p-3 border border-white/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-dark-green/60 text-[10px] uppercase font-bold mb-1">
                <Maximize size={12} />
                <span>Superficie</span>
              </div>
              <div className="font-semibold text-dark-green text-sm">{area} m²</div>
            </div>
          </div>
        </div>

        {/* === COLUMN 2: Financials & Action === */}
        <div className={clsx("space-y-4", isEmbed && "flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-forest/10 pt-4 sm:pt-0 sm:pl-6")}>
           {/* Price Section */}
           <div>
            {status === "AVAILABLE" && (
              <>
                <div className="text-xs text-dark-green/60 mb-1 font-medium">Valor de Contado</div>
                <div className={clsx("font-bold font-heading text-forest", isEmbed ? "text-3xl" : "text-3xl")}>
                  {currency} {price.toLocaleString()}
                </div>
              </>
            )}
           </div>
           
           {/* Description */}
            {description && (
              <div className="relative">
                 <p className={clsx("text-sm text-dark-green/80 leading-relaxed", isEmbed && "line-clamp-3 hover:line-clamp-none transition-all")}>
                  {description}
                </p>
              </div>
            )}

            {/* CTA */}
            {status === "AVAILABLE" && (
              <button className="w-full py-3.5 bg-forest text-cream rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-forest/90 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide mt-auto">
                Consultar Ahora
              </button>
            )}
        </div>

      </div>
    </motion.div>
  );
}
