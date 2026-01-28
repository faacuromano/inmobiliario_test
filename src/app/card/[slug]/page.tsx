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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LotPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const isEmbed = embed === "true";
  
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
    <main className={`relative w-full h-screen overflow-hidden ${isEmbed ? 'bg-transparent' : ''}`}>
      {/* 1. Background Layer: Panoee Iframe (Only if NOT embedded) */}
      {!isEmbed && <PanoeeBridge src={panoeeUrl || ""} />}

      {/* 2. Overlay Layer: Responsive Lot View */}
      <div className="relative z-10 w-full h-full pointer-events-none">
          {!isEmbed && (
             <Link href="/" className="absolute top-4 right-4 z-50 p-2 bg-white/20 backdrop-blur rounded-full text-dark-green pointer-events-auto hover:bg-white/40 transition-colors">
                 ✕
             </Link>
          )}
          
          <LotView 
            isEmbed={isEmbed}
            lot={{
            ...lot,
            price: Number(lot.price),
          }} />
      </div>
    </main>
  );
}
