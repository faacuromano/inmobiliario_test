"use client";

import { login } from "@/app/actions";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, User } from "lucide-react";

export function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    
    // Artificial delay for UX
    await new Promise(r => setTimeout(r, 800));

    const res = await login(formData);
    if (!res.success) {
      setError(res.error || "Error desconocido");
      setIsPending(false);
    } else {
       // Refresh handled by server action redirect or state change? 
       // The server action returns success, but doesn't redirect. 
       // We should reload or let the parent component re-render.
       // Since the parent checks cookies server-side, a reload is safest to clear cache/state.
       window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cream">
       {/* Diagonal Backgrounds */}
       <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[70vw] h-full bg-forest/5 skew-x-12 origin-top-right translate-x-20" />
          <div className="absolute -bottom-20 -left-20 w-[50vw] h-[50vh] bg-gold/5 -rotate-12 rounded-full blur-3xl" />
       </div>

       <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className="relative z-10 w-full max-w-sm"
       >
          <div className="glass p-8 md:p-10 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-md">
              <div className="mb-8 text-center space-y-2">
                 <div className="w-12 h-12 bg-forest text-cream rounded-xl flex items-center justify-center mx-auto shadow-lg mb-4">
                    <Lock size={20} />
                 </div>
                 <h1 className="font-heading font-bold text-2xl text-dark-green">Admin Access</h1>
                 <p className="text-dark-green/50 text-xs tracking-widest uppercase">Seguridad Inmobiliaria</p>
              </div>

              <form action={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-dark-green/60 uppercase tracking-widest ml-1">Usuario</label>
                    <div className="relative group">
                       <input 
                         name="username" 
                         type="text" 
                         placeholder="admin"
                         required
                         className="w-full bg-white/50 border border-white/60 focus:border-forest/50 focus:bg-white/80 rounded-xl py-3 pl-4 pr-10 outline-none transition-all placeholder:text-dark-green/20 text-dark-green font-medium"
                       />
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-green/30 group-focus-within:text-forest transition-colors">
                          <User size={16} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-bold text-dark-green/60 uppercase tracking-widest ml-1">Contraseña</label>
                    <div className="relative group">
                       <input 
                         name="password" 
                         type="password" 
                         placeholder="••••••••"
                         required
                         className="w-full bg-white/50 border border-white/60 focus:border-forest/50 focus:bg-white/80 rounded-xl py-3 pl-4 pr-10 outline-none transition-all placeholder:text-dark-green/20 text-dark-green font-medium"
                       />
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-green/30 group-focus-within:text-forest transition-colors">
                          <Lock size={16} />
                       </div>
                    </div>
                 </div>

                 {error && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }} 
                     animate={{ opacity: 1, height: "auto" }}
                     className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg"
                   >
                     {error}
                   </motion.div>
                 )}

                 <button 
                   type="submit" 
                   disabled={isPending}
                   className="w-full bg-dark-green text-cream py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-forest transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    {isPending ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        Ingresar <ArrowRight size={16} />
                      </>
                    )}
                 </button>
              </form>
          </div>
       </motion.div>
    </div>
  );
}
