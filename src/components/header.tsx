"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-linen/80 backdrop-blur-2xl border-b border-forest/8 shadow-[0_4px_40px_0_rgba(28,43,26,0.06)]"
          : ""
      }`}
    >
      <div className="w-full px-6 md:px-12 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <motion.span
            className={`font-heading text-2xl md:text-3xl font-light italic tracking-wide transition-colors duration-700 ${
              scrolled ? "text-deep" : "text-linen"
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Raices
          </motion.span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-10">
          <button
            onClick={() => scrollToId("manifesto")}
            className={`text-[10px] font-mono uppercase tracking-[0.3em] transition-colors duration-500 hidden md:block cursor-pointer ${
              scrolled
                ? "text-forest/60 hover:text-forest"
                : "text-linen/50 hover:text-linen"
            }`}
          >
            Manifiesto
          </button>
          <Link
            href="/tour"
            className={`text-[10px] font-mono uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-2 ${
              scrolled
                ? "text-forest hover:text-deep"
                : "text-linen hover:text-terra"
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${
              scrolled ? "bg-forest" : "bg-terra"
            }`} />
            Tour 360
          </Link>
          <Link
            href="mailto:info@raicesdealvear.com"
            className={`text-[10px] font-mono uppercase tracking-[0.3em] rounded-full px-6 py-2.5 transition-all duration-500 border ${
              scrolled
                ? "text-forest bg-sage-light/80 backdrop-blur-xl border-forest/10 hover:bg-forest hover:text-linen"
                : "text-linen bg-linen/10 backdrop-blur-xl border-linen/20 hover:bg-linen/20"
            }`}
          >
            Contacto
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
