import { prisma } from "@/lib/prisma";
import { LotEditor } from "@/components/lot-editor";
import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin-login";
import { logout } from "../actions";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    return <AdminLogin />;
  }

  const lots = await prisma.lot.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <main className="min-h-screen bg-cream p-6 md:p-12 selection:bg-forest/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-dark-green/5 pb-8">
            <div>
                <h1 className="text-4xl font-bold font-heading text-dark-green mb-2">
                Panel de Control
                </h1>
                <p className="text-dark-green/50">
                    Gestiona la disponibilidad, precios y detalles técnicos de cada lote.
                </p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="px-4 py-2 bg-white/50 rounded-lg text-xs font-mono text-dark-green/60 border border-white/60">
                    Total Lotes: {lots.length}
                </div>
                <form action={logout}>
                    <button className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        <LogOut size={16} />
                    </button>
                </form>
            </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lots.map((lot) => (
                <LotEditor 
                    key={lot.id} 
                    lot={{
                        ...lot,
                        price: Number(lot.price), // Serialization
                    }} 
                />
            ))}
        </div>

      </div>
    </main>
  );
}
