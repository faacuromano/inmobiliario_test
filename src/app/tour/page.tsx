import { PanoeeBridge } from "@/components/panoee-bridge";
import Link from "next/link";

export default function TourPage() {
  const panoeeUrl = process.env.NEXT_PUBLIC_PANOEE_URL; 

  return (
    <main className="relative w-full h-screen overflow-hidden bg-cream">
       {/* 1. Fullscreen Bridge */}
       <PanoeeBridge src={panoeeUrl || ""} />

       {/* 2. Minimal Navigation */}
       <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pointer-events-none z-50">
           <div className="pointer-events-auto bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full shadow-lg">
              <span className="text-dark-green font-heading font-bold text-sm tracking-wide">Raíces de Alvear</span>
           </div>
           
           <Link href="/" className="pointer-events-auto bg-white/20 backdrop-blur-md border border-white/30 w-10 h-10 flex items-center justify-center rounded-full shadow-lg text-dark-green hover:bg-white/40 transition-colors">
              ✕
           </Link>
       </div>
    </main>
  );
}
