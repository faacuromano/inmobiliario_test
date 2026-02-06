"use client";

import Link from "next/link";
import VirtualTour from "@/components/VirtualTour";
import { Header } from "@/components/header";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";

/* ─── Counter hook ─── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─── 3D Tilt hook ─── */
function use3DTilt(intensity = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    rotateX.set(-y * intensity);
    rotateY.set(x * intensity);
  }, [intensity, rotateX, rotateY]);

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return { ref, springX, springY, handleMouse, handleLeave };
}

/* ─── Organic Wave SVG divider ─── */
function WaveDivider({ flip = false, color = "var(--color-wheat)" }: { flip?: boolean; color?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""}`} style={{ marginTop: flip ? 0 : -1, marginBottom: flip ? -1 : 0 }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]" fill={color}>
        <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,20 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </div>
  );
}

/* ─── Firefly particle (warm terracotta) ─── */
function Firefly({ delay, left, size = 3 }: { delay: number; left: string; size?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left,
        bottom: "20%",
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(183, 170, 140, 0.9), transparent)`,
        boxShadow: `0 0 ${size * 4}px ${size}px rgba(183, 170, 140, 0.25)`,
      }}
      animate={{
        y: [0, -60, -120],
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: 5 + Math.random() * 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Floating Leaf ─── */
function FloatingLeaf({ delay, left, size = 16 }: { delay: number; left: string; size?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left, top: "-5%" }}
      animate={{
        y: ["0vh", "110vh"],
        x: [0, 30, -20, 40, 0],
        rotate: [0, 45, -30, 60, 0],
        opacity: [0, 0.6, 0.6, 0.4, 0],
      }}
      transition={{
        duration: 18 + Math.random() * 8,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-forest/20">
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5 0 3-.3 4.3-.9C12.4 18.5 10 14.5 10 10c0-3 1.5-5.5 3.8-7.2C13.2 2.3 12.6 2 12 2z"
          fill="currentColor"
        />
      </svg>
    </motion.div>
  );
}

/* ─── Marquee phrases ─── */
const MARQUEE_ITEMS = [
  "NATURALEZA",
  "FUTURO",
  "RAICES",
  "SILENCIO",
  "TERRITORIO",
  "HOGAR",
  "ECOSISTEMA",
  "REFUGIO",
];

export default function Home() {
  /* ── Page-level scroll for root line ── */
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pageProgress } = useScroll({ target: pageRef });
  const rootHeight = useTransform(pageProgress, [0, 1], ["0%", "100%"]);

  /* ── Hero parallax ── */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const textY = useTransform(heroProgress, [0, 1], [0, -100]);
  const heroRotateX = useTransform(heroProgress, [0, 1], [0, 8]);

  /* ── Manifesto section parallax ── */
  const manifestoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: manifestoProgress } = useScroll({
    target: manifestoRef,
    offset: ["start end", "end start"],
  });
  const manifestoLeftX = useTransform(manifestoProgress, [0, 0.4], [-80, 0]);
  const manifestoLeftOpacity = useTransform(manifestoProgress, [0, 0.35], [0, 1]);
  const manifestoLeftRotateY = useTransform(manifestoProgress, [0, 0.4], [12, 0]);
  const manifestoRightX = useTransform(manifestoProgress, [0.1, 0.45], [80, 0]);
  const manifestoRightOpacity = useTransform(manifestoProgress, [0.1, 0.4], [0, 1]);
  const manifestoRightRotateY = useTransform(manifestoProgress, [0.1, 0.45], [-12, 0]);

  /* ── Counter section parallax ── */
  const counterRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: counterProgress } = useScroll({
    target: counterRef,
    offset: ["start end", "center center"],
  });
  const counterScale = useTransform(counterProgress, [0, 1], [0.88, 1]);
  const counterOpacity = useTransform(counterProgress, [0, 0.5], [0, 1]);
  const counterRotateX = useTransform(counterProgress, [0, 1], [12, 0]);

  /* ── CTA section parallax ── */
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "center center"],
  });
  const ctaY = useTransform(ctaProgress, [0, 1], [80, 0]);
  const ctaOpacity = useTransform(ctaProgress, [0, 0.6], [0, 1]);
  const ctaScale = useTransform(ctaProgress, [0, 1], [0.95, 1]);
  const ctaRotateX = useTransform(ctaProgress, [0, 1], [6, 0]);

  const lots = useCounter(120, 2500);
  const trees = useCounter(2000, 3000);
  const area = useCounter(45, 2000);

  /* ── Tour reveal state ── */
  const [tourRevealed, setTourRevealed] = useState(false);

  /* ── Skip hero animations on back navigation ── */
  const [isFirstVisit] = useState(() => {
    if (typeof window === "undefined") return true;
    const hasVisited = sessionStorage.getItem("homeAnimated");
    if (!hasVisited) {
      sessionStorage.setItem("homeAnimated", "true");
      return true;
    }
    return false;
  });

  /* ── Lock scroll while tour is active ── */
  useEffect(() => {
    const cls = "tour-active";
    if (tourRevealed) {
      document.documentElement.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
    }
    return () => document.documentElement.classList.remove(cls);
  }, [tourRevealed]);

  /* ── 3D tilt for CTA button ── */
  const ctaTilt = use3DTilt(8);

  return (
    <main ref={pageRef} className="min-h-screen bg-linen text-deep overflow-x-hidden relative">

      {/* ── Subtle grain ── */}
      <div className="fixed inset-0 bg-grain opacity-[0.02] pointer-events-none z-[100] mix-blend-multiply" />

      {/* ── Growing Root Line ── */}
      <div className="fixed left-1/2 top-0 bottom-0 -translate-x-1/2 z-[60] pointer-events-none hidden md:block">
        <motion.div
          style={{ height: rootHeight }}
          className="w-px bg-gradient-to-b from-forest/0 via-forest/15 to-forest/5 origin-top"
        />
      </div>

      {/* ── Floating Leaves (parallax depth) ── */}
      <div className="fixed inset-0 pointer-events-none z-[55] overflow-hidden hidden md:block">
        <FloatingLeaf delay={0} left="8%" size={14} />
        <FloatingLeaf delay={6} left="22%" size={10} />
        <FloatingLeaf delay={12} left="65%" size={16} />
        <FloatingLeaf delay={4} left="80%" size={12} />
        <FloatingLeaf delay={9} left="45%" size={11} />
      </div>

      <Header />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — HERO
          Full-bleed tour background with STRONG overlay.
          Click "Iniciar Recorrido" to reveal the tour map.
       ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-screen overflow-hidden perspective-2000">

        {/* Full-bleed tour background */}
        <motion.div style={{ scale: tourRevealed ? 1 : heroScale, opacity: heroOpacity, rotateX: tourRevealed ? 0 : heroRotateX }} className="absolute inset-0 z-0 preserve-3d origin-bottom">
          <div className="absolute inset-0">
            <VirtualTour />
          </div>
          {/* Overlay — fully removed on tour reveal */}
          {!tourRevealed && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 hero-overlay z-10 pointer-events-none"
            />
          )}
          {!tourRevealed && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-deep to-transparent z-10 pointer-events-none"
            />
          )}
        </motion.div>

        {/* Fireflies — hide when tour is revealed */}
        <AnimatePresence>
          {!tourRevealed && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-15 pointer-events-none overflow-hidden"
            >
              <Firefly delay={0} left="15%" size={3} />
              <Firefly delay={1.5} left="35%" size={2} />
              <Firefly delay={3} left="55%" size={4} />
              <Firefly delay={2} left="70%" size={2} />
              <Firefly delay={4} left="85%" size={3} />
              <Firefly delay={0.8} left="25%" size={2} />
              <Firefly delay={3.5} left="90%" size={3} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Giant editorial text — slides away when tour revealed */}
        <AnimatePresence>
          {!tourRevealed && (
            <motion.div
              style={{ y: textY }}
              exit={{ opacity: 0, y: 60, rotateX: -10 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 h-full flex flex-col justify-end px-6 md:px-12 pb-16 md:pb-24 perspective-1500"
            >
              {/* Tag */}
              <motion.div
                initial={isFirstVisit ? { opacity: 0, x: -30, rotateY: -15 } : false}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 mb-6"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-terra">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5 0 3-.3 4.3-.9C12.4 18.5 10 14.5 10 10c0-3 1.5-5.5 3.8-7.2C13.2 2.3 12.6 2 12 2z" fill="currentColor" opacity="0.6"/>
                  <path d="M17 3c-2 1.5-3.5 4-3.5 7 0 4 2.5 7.5 6 9.5.5-1.3.8-2.6.8-4 0-5.5-3-9.5-3.3-12.5z" fill="currentColor" opacity="0.4"/>
                </svg>
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-linen/60">
                  Barrio Residencial &mdash; Alvear, Santa Fe
                </span>
              </motion.div>

              {/* Title — 3D clip reveal */}
              <div className="overflow-hidden preserve-3d">
                <motion.h1
                  initial={isFirstVisit ? { y: "110%", rotateX: 40 } : false}
                  animate={{ y: "0%", rotateX: 0 }}
                  transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="font-heading text-[clamp(3.5rem,12vw,11rem)] font-light italic leading-[0.85] tracking-tight text-linen drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                >
                  Vivi tu
                </motion.h1>
              </div>
              <div className="overflow-hidden preserve-3d">
                <motion.h1
                  initial={isFirstVisit ? { y: "110%", rotateX: 40 } : false}
                  animate={{ y: "0%", rotateX: 0 }}
                  transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-heading text-[clamp(3.5rem,12vw,11rem)] font-light italic leading-[0.85] tracking-tight text-sage drop-shadow-[0_4px_30px_rgba(183,170,140,0.3)]"
                >
                  Naturaleza
                </motion.h1>
              </div>

              {/* Bottom bar */}
              <motion.div
                initial={isFirstVisit ? { opacity: 0, y: 30 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mt-10 pt-8 border-t border-linen/15"
              >
                <p className="text-base md:text-lg text-linen/60 font-heading font-light max-w-md leading-relaxed">
                  Un ecosistema residencial donde la tierra se encuentra con el futuro.
                  Explora cada lote en 360°.
                </p>
                <motion.button
                  onClick={() => setTourRevealed(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group flex items-center gap-4 bg-linen/10 backdrop-blur-xl border border-linen/20 hover:border-terra/40 rounded-full pl-7 pr-2 py-2 text-linen hover:text-terra transition-all duration-500 cursor-pointer"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-terra animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em]">
                    Iniciar Recorrido
                  </span>
                  <span className="w-10 h-10 rounded-full bg-linen/10 group-hover:bg-terra/20 flex items-center justify-center transition-all duration-500">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform duration-300">
                      <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tour revealed: back button */}
        <AnimatePresence>
          {tourRevealed && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setTourRevealed(false)}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-deep/70 backdrop-blur-xl border border-linen/15 rounded-full px-6 py-3 text-linen hover:bg-deep/90 transition-all duration-500 cursor-pointer group"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="rotate-180 group-hover:-translate-x-1 transition-transform duration-300">
                <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]">
                Volver
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Tour revealed: floating label */}
        <AnimatePresence>
          {tourRevealed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-deep/50 backdrop-blur-xl border border-linen/10 rounded-full px-5 py-2"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-terra animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-linen/80">
                Tour 360° &mdash; Recorrido Interactivo
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner coordinates with 3D float — hide when tour revealed */}
        <AnimatePresence>
          {!tourRevealed && (
            <motion.div
              initial={isFirstVisit ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: isFirstVisit && !tourRevealed ? 2 : 0, duration: 1.5 }}
              className="absolute top-6 right-6 md:top-auto md:bottom-24 md:right-12 z-20 animate-float-3d"
            >
              <div className="text-[10px] font-mono tracking-[0.2em] text-linen/20 text-right leading-loose">
                33°21&apos;S<br/>60°15&apos;W
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Wave: Hero → Marquee ── */}
      <WaveDivider color="var(--color-sage-light)" />

      {/* ═══════════════════════════════════════════════════════════
          MARQUEE BAND — on sage-light background
       ═══════════════════════════════════════════════════════════ */}
      <div className="marquee-band py-6 bg-sage-light relative">
        <div className="animate-marquee inline-flex relative">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center mx-8 md:mx-14">
              <span className="text-xs font-heading italic tracking-[0.3em] text-forest/25">
                {item}
              </span>
              <svg width="8" height="8" viewBox="0 0 8 8" className="ml-8 md:ml-14 opacity-30">
                <circle cx="4" cy="4" r="3" fill="none" stroke="rgb(39, 56, 38)" strokeWidth="0.5"/>
                <circle cx="4" cy="4" r="1" fill="rgb(39, 56, 38)" opacity="0.5"/>
              </svg>
            </span>
          ))}
        </div>
      </div>

      {/* ── Wave: Marquee → Manifesto ── */}
      <WaveDivider flip color="var(--color-sage-light)" />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — MANIFESTO
          3D perspective entrance from sides. Warm linen bg.
       ═══════════════════════════════════════════════════════════ */}
      <section ref={manifestoRef} id="manifesto" className="relative py-32 md:py-48 bg-linen overflow-hidden perspective-1500">
        {/* Warm ambient orbs */}
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-sage/[0.08] rounded-full blur-[150px] pointer-events-none animate-depth-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-terra/[0.04] rounded-full blur-[120px] pointer-events-none animate-depth-pulse" style={{ animationDelay: "3s" }} />

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start preserve-3d">
          {/* Left — Big quote with 3D rotation */}
          <motion.div style={{ x: manifestoLeftX, opacity: manifestoLeftOpacity, rotateY: manifestoLeftRotateY }} className="backface-hidden">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-light italic leading-[1.05] text-deep">
              Un refugio natural
              <br />
              para conectar con{" "}
              <span className="text-forest">lo esencial.</span>
            </h2>
          </motion.div>

          {/* Right — Supporting text with 3D rotation */}
          <motion.div style={{ x: manifestoRightX, opacity: manifestoRightOpacity, rotateY: manifestoRightRotateY }} className="space-y-12 pt-4 md:pt-12 backface-hidden">
            <p className="text-lg md:text-xl text-bark/70 font-heading font-light leading-relaxed">
              Raices de Alvear no es solo un barrio. Es un ecosistema disenado para quienes
              buscan pausar, respirar y crecer. Ubicado estrategicamente para brindarte la
              privacidad del campo con la cercania de la ciudad.
            </p>

            {/* Organic divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-forest/15 to-transparent" />
              <motion.svg
                width="20" height="20" viewBox="0 0 20 20" className="text-forest/25"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.7"/>
                <line x1="10" y1="0" x2="10" y2="7" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
                <line x1="10" y1="13" x2="10" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
              </motion.svg>
              <div className="flex-1 h-px bg-gradient-to-l from-forest/15 to-transparent" />
            </div>

            {/* Three details with staggered 3D reveal */}
            <div className="space-y-8 perspective-1000">
              {[
                { num: "01", title: "Ubicacion Estrategica", desc: "A 10 minutos del centro, inmerso en silencio. Acceso directo desde la ruta principal." },
                { num: "02", title: "Espacios Verdes", desc: "Mas de 2000 arboles plantados. Senderos aerobicos y plazas integradas al paisaje." },
                { num: "03", title: "Seguridad Inteligente", desc: "Barrio semi-cerrado. Monitoreo 24hs, acceso controlado, tecnologia de vanguardia." },
              ].map((item, i) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 30, rotateX: 15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ x: 8, rotateY: -2 }}
                  className="group flex gap-6 items-start cursor-default preserve-3d"
                >
                  <span className="text-[10px] font-mono text-terra/50 tracking-wider pt-1.5 shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-heading font-medium text-deep mb-1 group-hover:text-forest transition-colors duration-700">
                      {item.title}
                    </h3>
                    <p className="text-sm text-moss leading-relaxed font-mono">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Wave: Manifesto → Counters ── */}
      <WaveDivider color="var(--color-forest)" />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — COUNTERS
          Deep forest green background — 3D scale + rotate on scroll.
       ═══════════════════════════════════════════════════════════ */}
      <section ref={counterRef} className="relative py-24 md:py-36 bg-forest overflow-hidden perspective-2000">
        <div className="absolute inset-0 bg-dot-field pointer-events-none opacity-50" />

        {/* Warm ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-terra/[0.06] rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          style={{ scale: counterScale, opacity: counterOpacity, rotateX: counterRotateX }}
          className="max-w-[1600px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-0 preserve-3d"
        >
          {[
            { ref: lots.ref, count: lots.count, suffix: <span className="text-terra">+</span>, label: "Lotes Disponibles" },
            { ref: trees.ref, count: trees.count, suffix: null, label: "Arboles Plantados" },
            { ref: area.ref, count: area.count, suffix: <span className="text-terra text-4xl md:text-6xl italic">ha</span>, label: "Superficie Total" },
          ].map((item, i) => (
            <motion.div
              key={i}
              ref={item.ref}
              initial={{ opacity: 0, y: 40, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ translateZ: 30, scale: 1.03 }}
              className={`text-center preserve-3d ${
                i === 0 ? "md:text-left md:border-r md:border-linen/10 md:pr-12" :
                i === 1 ? "md:border-r md:border-linen/10 md:px-12" :
                "md:text-right md:pl-12"
              }`}
            >
              <div className="text-6xl md:text-8xl lg:text-9xl font-heading font-light italic text-linen animate-counter-warmglow leading-none">
                {item.count}{item.suffix}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-sage mt-4">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Wave: Counters → CTA ── */}
      <WaveDivider flip color="var(--color-forest)" />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — CTA
          Wheat/warm background, 3D reveal, tilt button.
       ═══════════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="relative py-40 md:py-56 bg-wheat overflow-hidden perspective-1500">
        {/* Topo pattern */}
        <div className="absolute inset-0 bg-topo pointer-events-none opacity-40" />

        {/* Warm ambient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sage/[0.1] rounded-full blur-[200px] pointer-events-none" />

        {/* Fireflies */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Firefly delay={0.5} left="20%" size={3} />
          <Firefly delay={2} left="45%" size={2} />
          <Firefly delay={1} left="75%" size={4} />
        </div>

        <motion.div
          style={{ y: ctaY, opacity: ctaOpacity, scale: ctaScale, rotateX: ctaRotateX }}
          className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 text-center preserve-3d"
        >
          <motion.h2
            initial={{ opacity: 0, y: 40, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light italic text-deep leading-[0.95] mb-6"
          >
            Tu futuro<br />
            empieza <span className="text-forest">hoy.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-bark/60 font-heading text-lg md:text-xl font-light mb-14 max-w-lg mx-auto italic"
          >
            Agenda una visita y camina el terreno donde vas a construir tu vida.
          </motion.p>

          {/* 3D tilt CTA button */}
          <motion.div
            ref={ctaTilt.ref}
            onMouseMove={ctaTilt.handleMouse}
            onMouseLeave={ctaTilt.handleLeave}
            style={{ rotateX: ctaTilt.springX, rotateY: ctaTilt.springY }}
            className="inline-block preserve-3d"
          >
            <Link
              href="mailto:info@raicesdealvear.com"
              className="group inline-flex items-center gap-5"
            >
              <motion.span
                whileHover={{ letterSpacing: "0.5em" }}
                transition={{ duration: 0.5 }}
                className="text-[11px] font-mono uppercase tracking-[0.4em] text-deep group-hover:text-forest transition-colors duration-700"
              >
                Agendar Visita
              </motion.span>
              <motion.span
                whileHover={{ scale: 1.15, rotateZ: 20 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative w-14 h-14 rounded-full border border-forest/20 group-hover:border-forest/40 flex items-center justify-center transition-all duration-700 overflow-hidden"
              >
                <span className="absolute inset-0 bg-forest/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="relative z-10 text-deep -rotate-45 group-hover:rotate-0 transition-transform duration-700">
                  <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — earthy, warm, 3D entrance
       ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-deep">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-forest/20 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[1600px] mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <span className="font-heading text-xl font-light italic text-linen/40">
            Raices de Alvear
          </span>
          <div className="flex items-center gap-8">
            <Link href="/tour" className="text-[10px] font-mono uppercase tracking-[0.3em] text-linen/30 hover:text-terra transition-colors duration-700">
              Tour 360
            </Link>
            <Link href="mailto:info@raicesdealvear.com" className="text-[10px] font-mono uppercase tracking-[0.3em] text-linen/30 hover:text-terra transition-colors duration-700">
              Contacto
            </Link>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-linen/20">
            &copy; {new Date().getFullYear()}
          </span>
        </motion.div>
      </footer>
    </main>
  );
}
