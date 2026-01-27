"use client";

import { updateLot } from "@/app/actions";
import { CheckCircle, Save, Ruler, Maximize, Hash, DollarSign } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface LotEditorProps {
  lot: {
    id: number;
    number: string;
    slug: string;
    price: number | unknown; // Handle Decimal/Number
    status: string;
    dimensions: string;
    area: number;
  };
}

export function LotEditor({ lot }: LotEditorProps) {
  const [isPending, setIsPending] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Status Colors Mapping
  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-forest/10 border-forest/20 text-forest",
    RESERVED: "bg-gold/10 border-gold/20 text-gold",
    SOLD: "bg-gray-100 border-gray-200 text-gray-400",
  };

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    await updateLot(lot.id, formData);
    setIsPending(false);
    setLastSaved(new Date());
    
    // Auto-hide success message after 3s
    setTimeout(() => setLastSaved(null), 3000);
  };

  return (
    <div className="glass rounded-3xl p-6 relative group hover:border-forest/30 transition-all duration-300">
      <form action={handleSubmit} className="space-y-6">
        
        {/* Header: Number & Status */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-green text-cream flex items-center justify-center font-bold text-lg font-heading shadow-md">
                    {lot.number}
                </div>
                <div>
                     <label className="text-[10px] uppercase tracking-wider font-bold text-dark-green/40 block mb-0.5">SDK / Slug</label>
                     <input 
                        name="slug"
                        defaultValue={lot.slug}
                        className="bg-transparent border-b border-dashed border-dark-green/20 text-xs font-mono text-dark-green/70 focus:border-forest focus:outline-none w-24"
                     />
                </div>
            </div>

            <select
                name="status"
                defaultValue={lot.status}
                className={clsx(
                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border outline-none cursor-pointer appearance-none transition-colors",
                    statusColors[lot.status] || statusColors.SOLD
                )}
            >
                <option value="AVAILABLE">Disponible</option>
                <option value="RESERVED">Reservado</option>
                <option value="SOLD">Vendido</option>
            </select>
        </div>
        
        {/* Public URL Display */}
        <div className="bg-dark-green/5 rounded-lg px-3 py-2 flex items-center justify-between group/url">
           <span className="text-[10px] font-mono text-dark-green/50 truncate max-w-[200px]">
             /card/{lot.slug}
           </span>
           <span className="text-[10px] uppercase font-bold text-forest cursor-pointer hover:text-dark-green transition-colors opacity-0 group-hover/url:opacity-100">
             Copiar Link
           </span>
        </div>

        {/* Separator */}
        <hr className="border-dark-green/5" />

        {/* Grid Inputs */}
        <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="col-span-2 bg-white/40 rounded-2xl p-3 border border-white/50 focus-within:border-forest/30 focus-within:bg-white/60 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={12} className="text-forest" />
                    <label className="text-[10px] uppercase tracking-wider font-bold text-dark-green/50">Precio (USD)</label>
                </div>
                <input 
                    name="price"
                    type="number"
                    defaultValue={Number(lot.price)}
                    className="w-full bg-transparent text-xl font-bold font-heading text-dark-green outline-none"
                />
            </div>

            {/* Dims */}
            <div className="bg-white/40 rounded-2xl p-3 border border-white/50 focus-within:border-forest/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                    <Ruler size={12} className="text-dark-green/40" />
                    <label className="text-[10px] uppercase tracking-wider font-bold text-dark-green/50">Medidas</label>
                </div>
                <input 
                    name="dimensions"
                    defaultValue={lot.dimensions}
                    className="w-full bg-transparent text-sm font-semibold text-dark-green outline-none"
                />
            </div>

            {/* Area */}
             <div className="bg-white/40 rounded-2xl p-3 border border-white/50 focus-within:border-forest/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                    <Maximize size={12} className="text-dark-green/40" />
                    <label className="text-[10px] uppercase tracking-wider font-bold text-dark-green/50">Sup. (m²)</label>
                </div>
                <input 
                    name="area"
                    type="number"
                    defaultValue={lot.area}
                    className="w-full bg-transparent text-sm font-semibold text-dark-green outline-none"
                />
            </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end items-center gap-3">
             {lastSaved && (
                 <span className="text-xs text-forest font-medium flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                    <CheckCircle size={12} /> Guardado
                 </span>
             )}
            <button 
                type="submit"
                disabled={isPending}
                className="bg-dark-green text-cream px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-forest transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={14} />}
                {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
        </div>

      </form>
    </div>
  );
}
