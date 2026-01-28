"use client";

import Link from "next/link";
import { PanoeeEmbed } from "@/components/tour-embed";
import { Leaf, MapPin, Trees, ShieldCheck, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const TOUR_ID = "69791a27ce79982e367d354b"; // Configurable if needed

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-cream selection:bg-forest/30 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest/5 rounded-full blur-[100px]" 
           />
           <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" 
           />
        </div>

        {/* Floating Header */}
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-20"
        >
          <div className="text-dark-green font-heading text-xl md:text-2xl font-bold tracking-tight">
            Raíces<span className="text-forest">.</span>
          </div>
          <Link href="/admin" className="text-xs font-semibold uppercase tracking-widest text-dark-green/50 hover:text-dark-green transition-colors">
            Admin
          </Link>
        </motion.nav>

        {/* MAIN EMBED CONTAINER */}
        <div className="relative w-full max-w-[1600px] flex-1 flex flex-col md:flex-row gap-8 items-center justify-center z-10 pt-16">
          
          {/* Text Content */}
          <div className="flex-1 md:max-w-md lg:max-w-xl space-y-8 md:pr-12 text-center md:text-left z-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex px-4 py-1.5 rounded-full bg-forest/5 border border-forest/10 text-forest text-xs font-bold tracking-widest uppercase"
            >
               Barrio Residencial
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-dark-green font-heading leading-[0.9] tracking-tight"
            >
              Viví tu <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest to-dark-green">Naturaleza</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-dark-green/60 font-light leading-relaxed max-w-sm mx-auto md:mx-0"
            >
              Un recorrido inmersivo por el futuro de tu vida. Explora cada lote, siente el espacio y proyecta tus sueños.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4"
            >
              <Link href="/tour" className="px-8 py-4 bg-dark-green text-cream rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-forest/20">
                Iniciar Recorrido
              </Link>
              <button 
                onClick={() => scrollToId("about")}
                className="px-8 py-4 bg-white/40 border border-white/60 text-dark-green rounded-2xl font-bold text-sm hover:bg-white/60 transition-all backdrop-blur-sm cursor-pointer flex items-center justify-center gap-2"
              >
                Más Información <ArrowDown size={16} />
              </button>
            </motion.div>
          </div>

          {/* TOUR EMBED - The "Window" */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="flex-[1.5] w-full aspect-[4/3] md:h-[70vh] relative"
          >
             <div className="w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50 relative group transform transition-transform hover:scale-[1.01] duration-700">
                <PanoeeEmbed tourId={TOUR_ID} />
                
                {/* Interactive Hint */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-700 ease-in-out">
                  <div className="glass px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-dark-green/80 flex items-center gap-2 shadow-lg backdrop-blur-xl bg-white/40 border border-white/60">
                    <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                    Explora en 360°
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CONCEPT SECTION (Diagonal Cut) */}
      <section id="about" className="py-32 relative diagonal-top bg-white/50 -mt-16 z-20">
         <motion.div 
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8 }}
           className="max-w-4xl mx-auto text-center space-y-12 relative z-10 px-6"
         >
             <div className="inline-block p-4 rounded-full bg-gold/10 text-gold mb-4 rotate-3 hover:rotate-6 transition-transform">
                 <Leaf className="w-8 h-8" />
             </div>
             <h2 className="text-4xl md:text-6xl font-heading font-bold text-dark-green leading-tight">
                 Un refugio natural <br /> para conectar con lo esencial.
             </h2>
             <p className="text-xl text-dark-green/70 font-light leading-relaxed max-w-2xl mx-auto">
                 Raíces de Alvear no es solo un barrio. Es un ecosistema diseñado para quienes buscan pausar, respirar y crecer. Ubicado estratégicamente para brindarte la privacidad del campo con la cercanía de la ciudad.
             </p>
         </motion.div>

         {/* Decorative Leaves/Blur */}
         <div className="absolute top-1/2 left-0 w-64 h-64 bg-forest/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />
      </section>

      {/* 3. DETAILS GRID (Asymmetric) */}
      <section className="py-24 bg-cream relative z-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group p-8 rounded-t-[3rem] rounded-bl-[3rem] bg-white border border-white/60 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                  <div className="w-14 h-14 bg-forest/10 rounded-2xl flex items-center justify-center text-forest mb-6 group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-6">
                      <MapPin size={28} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-dark-green mb-3">Ubicación Estratégica</h3>
                  <p className="text-dark-green/60 leading-relaxed">Acceso rápido desde la ruta principal, a solo 10 minutos del centro pero inmerso en silencio.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group p-8 rounded-[3rem] bg-dark-green text-cream shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 md:-mt-8"
              >
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform -rotate-3 group-hover:-rotate-6">
                      <Trees size={28} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-cream mb-3">Espacios Verdes</h3>
                  <p className="text-cream/70 leading-relaxed">Más de 2000 árboles plantados, senderos aeróbicos y plazas de juego integradas al paisaje.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="group p-8 rounded-t-[3rem] rounded-br-[3rem] bg-white border border-white/60 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                  <div className="w-14 h-14 bg-forest/5 rounded-2xl flex items-center justify-center text-dark-green mb-6 group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0">
                      <ShieldCheck size={28} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-dark-green mb-3">Seguridad Inteligente</h3>
                  <p className="text-dark-green/60 leading-relaxed">Barrio semi-cerrado con monitoreo 24hs, acceso controlado y tecnología de vanguardia.</p>
              </motion.div>
          </div>
      </section>

      {/* 4. CONTACT SECTION (Diagonal Bottom) */}
      <section className="py-32 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-forest/5 diagonal-top">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-multiply" />
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative z-10"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-dark-green mb-8 leading-tight">
                Tu futuro empieza hoy.<br/>
                <span className="text-forest text-2xl md:text-4xl italic font-serif">Ven a conocerlo.</span>
            </h2>
            <Link href="mailto:info@raicesdealvear.com" className="px-10 py-5 bg-forest text-cream rounded-full font-bold text-lg shadow-xl shadow-forest/20 hover:bg-forest/90 hover:scale-105 transition-all inline-flex items-center gap-2 group">
                Agendar Visita <ArrowDown className="-rotate-90 group-hover:rotate-0 transition-transform" />
            </Link>
            <p className="mt-12 text-dark-green/40 text-xs tracking-[0.2em] uppercase font-bold">
                Raíces de Alvear © 2024
            </p>
          </motion.div>
      </section>

    </main>
  );
}
