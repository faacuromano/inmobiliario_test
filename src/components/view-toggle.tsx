"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface ViewToggleProps {
  view: "grid" | "table";
  onToggle: (view: "grid" | "table") => void;
}

export function ViewToggle({ view, onToggle }: ViewToggleProps) {
  return (
    <div className="bg-white/40 p-1 rounded-xl border border-white/60 flex items-center gap-1 shadow-sm backdrop-blur-sm">
      <button
        onClick={() => onToggle("grid")}
        className={clsx(
          "p-2 rounded-lg transition-all relative group",
          view === "grid" ? "text-cream" : "text-dark-green/60 hover:bg-white/50"
        )}
      >
        {view === "grid" && (
          <motion.div
            layoutId="active-view"
            className="absolute inset-0 bg-dark-green rounded-lg shadow-md"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <LayoutGrid size={18} className="relative z-10" />
      </button>

      <button
        onClick={() => onToggle("table")}
        className={clsx(
          "p-2 rounded-lg transition-all relative group",
          view === "table" ? "text-cream" : "text-dark-green/60 hover:bg-white/50"
        )}
      >
        {view === "table" && (
          <motion.div
            layoutId="active-view"
            className="absolute inset-0 bg-dark-green rounded-lg shadow-md"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Table2 size={18} className="relative z-10" />
      </button>
    </div>
  );
}
