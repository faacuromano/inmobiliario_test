import Link from "next/link";
import { PanoeeEmbed } from "@/components/tour-embed";
import { Leaf, MapPin, Trees, ShieldCheck } from "lucide-react";

export default function Home() {
  const TOUR_ID = "69791a27ce79982e367d354b"; // Configurable if needed

  return (
    <main className="min-h-screen bg-cream selection:bg-forest/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest/5 rounded-full blur-[100px] opacity-70" />
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] opacity-60" />
        </div>

        {/* Floating Header */}
        <nav className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-20">
          <div className="text-dark-green font-heading text-xl md:text-2xl font-bold tracking-tight">
            Raíces<span className="text-forest">.</span>
          </div>
          <Link href="/admin" className="text-xs font-semibold uppercase tracking-widest text-dark-green/50 hover:text-dark-green transition-colors">
            Admin
          </Link>
        </nav>

        {/* MAIN EMBED CONTAINER */}
        <div className="relative w-full max-w-[1600px] flex-1 flex flex-col md:flex-row gap-8 items-center justify-center z-10 pt-16">
          
          {/* Text Content */}
          <div className="flex-1 md:max-w-md lg:max-w-xl space-y-8 md:pr-12 text-center md:text-left z-20">
            <div className="inline-flex px-4 py-1.5 rounded-full bg-forest/5 border border-forest/10 text-forest text-xs font-bold tracking-widest uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000">
               Barrio Residencial
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-dark-green font-heading leading-[0.9] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
              Viví tu <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest to-dark-green">Naturaleza</span>
            </h1>

            <p className="text-lg text-dark-green/60 font-light leading-relaxed max-w-sm mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              Un recorrido inmersivo por el futuro de tu vida. Explora cada lote, siente el espacio y proyecta tus sueños.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
              {/* LINK TO CLEAN TOUR PAGE */}
              <Link href="/tour" className="px-8 py-4 bg-dark-green text-cream rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-forest/20">
                Iniciar Recorrido
              </Link>
              {/* SCROLL TO INFO */}
              <a href="#about" className="px-8 py-4 bg-white/40 border border-white/60 text-dark-green rounded-2xl font-bold text-sm hover:bg-white/60 transition-all backdrop-blur-sm cursor-pointer">
                Más Información
              </a>
            </div>
          </div>

          {/* TOUR EMBED - The "Window" */}
          <div className="flex-[1.5] w-full aspect-[4/3] md:h-[70vh] relative animate-in zoom-in-95 fade-in duration-1000 delay-200">
             <div className="w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/50 relative group transform transition-transform hover:scale-[1.01] duration-700">
                <PanoeeEmbed tourId={TOUR_ID} />
                
                {/* Interactive Hint: Hides on Hover */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-700 ease-in-out">
                  <div className="glass px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-dark-green/80 flex items-center gap-2 shadow-lg backdrop-blur-xl bg-white/40 border border-white/60">
                    <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
                    Explora en 360°
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. CONCEPT SECTION (Organic Motion) */}
      <section id="about" className="py-24 md:py-32 px-6 relative overflow-hidden">
         <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
             <div className="inline-block p-3 rounded-full bg-gold/10 text-gold mb-4">
                 <Leaf className="w-6 h-6" />
             </div>
             <h2 className="text-4xl md:text-6xl font-heading font-bold text-dark-green leading-tight">
                 Un refugio natural <br /> para conectar con lo esencial.
             </h2>
             <p className="text-xl text-dark-green/70 font-light leading-relaxed max-w-2xl mx-auto">
                 Raíces de Alvear no es solo un barrio. Es un ecosistema diseñado para quienes buscan pausar, respirar y crecer. Ubicado estratégicamente para brindarte la privacidad del campo con la cercanía de la ciudad.
             </p>
         </div>

         {/* Decorative Leaves/Blur */}
         <div className="absolute top-1/2 left-0 w-64 h-64 bg-forest/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />
      </section>

      {/* 3. DETAILS GRID */}
      <section className="py-24 bg-white/40 border-y border-white/40">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group p-8 rounded-3xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/60">
                  <div className="w-12 h-12 bg-forest/10 rounded-2xl flex items-center justify-center text-forest mb-6 group-hover:scale-110 transition-transform">
                      <MapPin size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-dark-green mb-3">Ubicación Estratégica</h3>
                  <p className="text-dark-green/60 leading-relaxed">Acceso rápido desde la ruta principal, a solo 10 minutos del centro pero inmerso en silencio.</p>
              </div>
              <div className="group p-8 rounded-3xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/60">
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                      <Trees size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-dark-green mb-3">Espacios Verdes</h3>
                  <p className="text-dark-green/60 leading-relaxed">Más de 2000 árboles plantados, senderos aeróbicos y plazas de juego integradas al paisaje.</p>
              </div>
              <div className="group p-8 rounded-3xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/60">
                  <div className="w-12 h-12 bg-dark-green/5 rounded-2xl flex items-center justify-center text-dark-green mb-6 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-dark-green mb-3">Seguridad Inteligente</h3>
                  <p className="text-dark-green/60 leading-relaxed">Barrio semi-cerrado con monitoreo 24hs, acceso controlado y tecnología de vanguardia.</p>
              </div>
          </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section className="py-32 px-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-dark-green mb-8">
              Tu futuro empieza hoy.
          </h2>
          <Link href="mailto:info@raicesdealvear.com" className="px-10 py-4 bg-forest text-cream rounded-full font-bold text-lg shadow-xl shadow-forest/20 hover:bg-forest/90 hover:scale-105 transition-all">
              Agendar Visita
          </Link>
          <p className="mt-8 text-dark-green/40 text-sm tracking-widest uppercase">
              Raíces de Alvear © 2024
          </p>
      </section>

    </main>
  );
}
