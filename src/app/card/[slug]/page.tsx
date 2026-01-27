import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LotCard, LotStatus } from "@/components/lot-card";
import { LotView } from "@/components/lot-view";
import { PanoeeBridge } from "@/components/panoee-bridge";
import Link from "next/link";

// Force dynamic rendering as price/status might change frequently
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LotPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch Lot Data
  const lot = await prisma.lot.findUnique({
    where: { slug },
  });

  if (!lot) {
    notFound();
  }

  // TODO: Replace with actual Panoee URL from Config or Env
  // For now, using a placeholder or a specific tour ID
  const panoeeUrl = process.env.NEXT_PUBLIC_PANOEE_URL; 

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 1. Background Layer: Panoee Iframe */}
      <PanoeeBridge src={panoeeUrl || ""} />

      {/* 2. Overlay Layer: Responsive Lot View */}
      <div className="relative z-10 w-full h-full pointer-events-none">
          <Link href="/" className="absolute top-4 right-4 z-50 p-2 bg-white/20 backdrop-blur rounded-full text-dark-green pointer-events-auto hover:bg-white/40 transition-colors">
              ✕
          </Link>
          <LotView lot={{
            ...lot,
            price: Number(lot.price),
          }} />
      </div>
    </main>
  );
}
