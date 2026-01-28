"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function Header() {
  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-20 pointer-events-none"
    >
      <Link href="/" className="pointer-events-auto">
        <div className="text-dark-green font-heading text-xl md:text-2xl font-bold tracking-tight hover-organic-lift">
            Raíces<span className="text-forest">.</span>
        </div>
      </Link>

      <div className="flex items-center gap-6 pointer-events-auto">
        <button 
            onClick={() => scrollToId("about")}
            className="text-xs font-bold uppercase tracking-widest text-dark-green/60 hover:text-forest transition-colors hidden md:block"
        >
            Concepto
        </button>
        <Link 
            href="/tour" 
            className="group flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-dark-green/60 hover:text-forest transition-colors"
        >
            Tour 360° <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link 
            href="mailto:info@raicesdealvear.com" 
            className="px-5 py-2.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-full text-xs font-bold uppercase tracking-widest text-dark-green hover:bg-white/60 transition-all hover:scale-105 hover-organic-lift shadow-sm"
        >
            Contacto
        </Link>
      </div>
    </motion.nav>
  );
}
