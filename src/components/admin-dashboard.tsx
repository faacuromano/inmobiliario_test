"use client";

import { useState } from "react";
import { LotEditor } from "@/components/lot-editor";
import { LotTable } from "@/components/lot-table";
import { ViewToggle } from "@/components/view-toggle";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";

interface AdminDashboardProps {
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

export function AdminDashboard({ lots }: AdminDashboardProps) {
  const [view, setView] = useState<"grid" | "table">("grid");

  return (
    <main className="min-h-screen bg-cream p-6 md:p-12 selection:bg-forest/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-dark-green/5 pb-8">
            <div>
                <h1 className="text-4xl font-bold font-heading text-dark-green mb-2">
                Panel de Control
                </h1>
                <p className="text-dark-green/50 max-w-md">
                    Gestiona la disponibilidad, precios y detalles técnicos de cada lote.
                </p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="px-4 py-2 bg-white/50 rounded-lg text-xs font-mono text-dark-green/60 border border-white/60">
                    Total Lotes: <span className="font-bold text-dark-green">{lots.length}</span>
                </div>
                
                {/* View Toggle */}
                <ViewToggle view={view} onToggle={setView} />

                <div className="h-8 w-px bg-dark-green/10 mx-2" />

                <form action={logout}>
                    <button className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        <LogOut size={18} />
                    </button>
                </form>
            </div>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
             <AnimatePresence mode="wait">
                {view === "grid" ? (
                    <motion.div 
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {lots.map((lot) => (
                            <LotEditor 
                                key={lot.id} 
                                lot={{
                                    ...lot,
                                    price: Number(lot.price), 
                                }} 
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <LotTable lots={lots} />
                    </motion.div>
                )}
             </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
