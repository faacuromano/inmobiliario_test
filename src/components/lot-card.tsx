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
}: LotCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="glass rounded-2xl p-6 sm:p-8 w-full max-w-md mx-auto relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest/5 rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
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
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-6",
        config.bg, config.color, config.border
      )}>
        <StatusIcon size={14} />
        <span>{config.label}</span>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/40 rounded-xl p-3 border border-white/30">
          <div className="flex items-center gap-2 text-dark-green/60 text-xs mb-1">
            <Ruler size={12} />
            <span>Dimensiones</span>
          </div>
          <div className="font-semibold text-dark-green">{dimensions}</div>
        </div>
        <div className="bg-white/40 rounded-xl p-3 border border-white/30">
          <div className="flex items-center gap-2 text-dark-green/60 text-xs mb-1">
            <Maximize size={12} />
            <span>Superficie</span>
          </div>
          <div className="font-semibold text-dark-green">{area} m²</div>
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-4">
        {status === "AVAILABLE" && (
          <div>
            <div className="text-xs text-dark-green/60 mb-1">Precio de Lista</div>
            <div className="text-3xl font-bold font-heading text-forest">
              {currency} {price.toLocaleString()}
            </div>
          </div>
        )}

        {description && (
          <p className="text-sm text-dark-green/70 leading-relaxed border-t border-forest/10 pt-4">
            {description}
          </p>
        )}

        {status === "AVAILABLE" && (
          <button className="w-full mt-4 py-3.5 bg-forest text-cream rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-forest/90 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2">
            Consultar Ahora
          </button>
        )}
      </div>
    </motion.div>
  );
}
