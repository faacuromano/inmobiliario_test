"use client";

import { updateLot } from "@/app/actions";
import { CheckCircle, Save, ExternalLink } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface LotTableProps {
  lots: Array<{
    id: number;
    number: string;
    slug: string;
    price: number | unknown;
    status: string;
    dimensions: string;
    area: number;
  }>;
}

function LotRow({ lot }: { lot: LotTableProps["lots"][0] }) {
  const [isPending, setIsPending] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
    setTimeout(() => setLastSaved(null), 3000);
  };

  return (
    <tr className="group hover:bg-white/40 transition-colors border-b border-dark-green/5 last:border-0">
      <td className="p-4">
          <form id={`form-${lot.id}`} action={handleSubmit}></form>
          <div className="w-8 h-8 rounded-lg bg-dark-green text-cream flex items-center justify-center font-bold text-xs font-heading">
             {lot.number}
          </div>
      </td>
      <td className="p-4">
          <select
            form={`form-${lot.id}`}
            name="status"
            defaultValue={lot.status}
            className={clsx(
                "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border outline-none cursor-pointer appearance-none transition-colors",
                statusColors[lot.status] || statusColors.SOLD
            )}
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="RESERVED">Reservado</option>
            <option value="SOLD">Vendido</option>
          </select>
      </td>
      <td className="p-4">
        <input 
            form={`form-${lot.id}`}
            name="price"
            type="number"
            defaultValue={Number(lot.price)}
            className="w-24 bg-transparent text-sm font-mono text-dark-green outline-none border-b border-transparent focus:border-forest/30"
        />
      </td>
      <td className="p-4">
          <div className="flex flex-col gap-1">
             <input 
                form={`form-${lot.id}`}
                name="dimensions"
                defaultValue={lot.dimensions}
                className="w-full bg-transparent text-xs text-dark-green/70 outline-none border-b border-transparent focus:border-forest/30"
                placeholder="Dims"
             />
             <div className="flex items-center gap-1 text-[10px] text-dark-green/40">
                <input 
                    form={`form-${lot.id}`}
                    name="area"
                    type="number"
                    defaultValue={lot.area}
                    className="w-12 bg-transparent outline-none focus:text-forest"
                />
                <span>m²</span>
             </div>
          </div>
      </td>
      <td className="p-4">
         <div className="flex items-center gap-2">
            <input 
                form={`form-${lot.id}`}
                name="slug"
                defaultValue={lot.slug}
                className="w-20 bg-transparent text-[10px] font-mono text-dark-green/50 outline-none border-b border-transparent focus:border-forest/30"
            />
             <a href={`/card/${lot.slug}`} target="_blank" className="text-forest hover:text-dark-green transition-colors">
                <ExternalLink size={12} />
             </a>
         </div>
      </td>
      <td className="p-4 text-right">
         <button 
           form={`form-${lot.id}`}
           type="submit"
           disabled={isPending}
           className="p-2 rounded-lg hover:bg-white text-dark-green/50 hover:text-dark-green transition-all disabled:opacity-50"
         >
            {isPending ? (
                <div className="w-4 h-4 rounded-full border-2 border-dark-green/20 border-t-dark-green animate-spin" />
            ) : lastSaved ? (
                <CheckCircle size={16} className="text-forest" />
            ) : (
                <Save size={16} />
            )}
         </button>
      </td>
    </tr>
  );
}

export function LotTable({ lots }: LotTableProps) {
  return (
    <div className="glass rounded-3xl overflow-hidden shadow-lg border border-white/40">
      <table className="w-full text-left border-collapse">
         <thead>
            <tr className="bg-white/20 border-b border-dark-green/5 text-[10px] uppercase font-bold text-dark-green/40 tracking-wider">
                <th className="p-4">Lote</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Precio (USD)</th>
                <th className="p-4">Medidas / Sup.</th>
                <th className="p-4">Slug / Link</th>
                <th className="p-4 text-right">Acción</th>
            </tr>
         </thead>
         <tbody>
            {lots.map(lot => (
                <LotRow key={lot.id} lot={lot} />
            ))}
         </tbody>
      </table>
    </div>
  );
}
